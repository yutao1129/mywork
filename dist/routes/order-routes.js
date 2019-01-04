"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Order_1 = require("../database/models/Order");
const dbquery_1 = require("../database/dbquery");
const OrderDeliveryPlan_1 = require("../database/models/OrderDeliveryPlan");
// export const accRouter = new KoaRouter();
exports.registerOrderAPI = function (orderRouter) {
    /**
     * @api {post} /order/search [訂單]-查詢
     * @apiDescription 查詢符合條件的訂單，並將結果分頁回傳
     * @apiGroup Order
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number=0} [pageIndex] 頁碼
     * @apiParam {Number=100} [maxRows] 每一頁的最大筆數
     * @apiParam {Object} [sort] 將結果指定欄位排序。1是從小到大排序，-1是從大到小。可指定的欄位請參考: <a href="#order">訂單欄位定義</a> <p> 例如根據<code>orderID</code>從小到大排序就是：<code>{"orderID":1}</code>
     * @apiParam {Object} [query] 查詢條件。可以指定欄位等於某個值，或是介於某個範圍。範圍用<code>[大於某值，小於某值]</code>來描述，範圍中的兩個值其中之一，可以設定為<code>null</code>，表示不指定，但不能兩者皆為<code>null</code><p> 例如想指定<code>orderID</code>大於0的訂單就是：<code>{"orderID": [0, null]}</code>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/order/search
     * Body:
     * {
     *   "pageIndex": 0,
     *   "maxRows": 3,
     *   "sort": {
     *     "orderID": 1
     *   },
     *   "query": {
     *      "style": "123abc"
     *   }
     * }
     * @apiSuccess (Success 200) {Number} pageIndex 目前的頁碼
     * @apiSuccess (Success 200) {Number} maxRows 每一頁的最大筆數
     * @apiSuccess (Success 200) {Number} totalPage 總頁數
     * @apiSuccess (Success 200) {Array} records 查詢的結果。各欄位定義請參考: <a href="#order">訂單欄位定義</a>
     * @apiSuccessExample {json} Response Example
     * {
     *   "pageIndex": 1,
     *   "maxRows": 100,
     *   "totalPage": 2,
     *   "records": [{
     *     "orderID": "123456",
     *     "style": "123456",
     *     "creator": "xxx",
     *     "createdTime": "2000-01-01T00:00:00+08:00",
     *   },
     *     ...
     *   ]
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    orderRouter.post('/order/search', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:63', 400);
        }
        else {
            let resp = dbquery_1.queryResponsePacket(ctx.request.body);
            let query = dbquery_1.queryDBGeneratorEx(ctx.request.body, Order_1.orderJoin);
            try {
                let orderdocInfo = await Order_1.Order.findAndCount(query);
                let count = orderdocInfo.count;
                // let count = await Order.count(countQuery);
                if (0 === count) {
                    resp.totalPage = 0;
                }
                else if (resp.maxRows > 0) {
                    resp.totalPage = Math.ceil(count / resp.maxRows);
                }
                else {
                    resp.totalPage = 1;
                }
                if (orderdocInfo && orderdocInfo.rows) {
                    for (let item of orderdocInfo.rows) {
                        resp.records.push(item.toJSON());
                    }
                }
                ctx.body = resp;
                ctx.status = 200;
                ctx.respond = true;
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalorderIDQuery:93', 400);
            }
        }
    });
    /**
     * @api {post} /order [訂單]-新增
     * @apiDescription 新增訂單
     * @apiGroup Order
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {String} orderID 訂單號
     * @apiParam {String} style 款號
     * @apiParam {Number} creator 創建人編號
     * @apiParam {Date} createdTime 創建時間
     * @apiParam {Mix} [others] 其他欄位，請參考: <a href="#order">訂單欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/order
     * Body:
     * {
     *   "orderID": "123456",
     *   "style": "123456",
     *   "creator": "xxx",
     *   "createdTime": "2000-01-01T00:00:00+08:00",
     * }
     * @apiSuccess (Success 200) {Number} id 訂單的資料庫唯一ID，可以拿來查詢或是修改使用
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "id": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    orderRouter.post('/order', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:125', 400);
        }
        else {
            try {
                let orderData=ctx.request.body;
                //orderData['createdTime']=new Date(Date.now());
                orderData['createdTime']=new Date();
                let order = new Order_1.Order(orderData);
                let orderdata = await order.save();
                if (orderdata && orderdata.id) {
                    let res = {
                        id: orderdata.id
                    };
                    ctx.body = res;
                    ctx.status = 200;
                    ctx.respond = true;
                }
                else {
                    ctx.throw('db.invalidParameters:140', 400);
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:144,ERROR:'+err.original.code, 400);
            }
        }
    });
    /**
     * @api {post} /order/update [訂單]-修改
     * @apiDescription 修改訂單資料
     * @apiGroup Order
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Object} condition 符合此條件的訂單會被修改
     * @apiParam {String} condition.orderID 訂單編號，目前只開放依照訂單編號修改，將來若有需要批次修改的，再增加欄位
     * @apiParam {Object} update 欲修改的欄位
     * @apiParam {ooo} update.xxx 只需要填欲修改的欄位，沒有要修改的就不用填。欄位請參考: <a href="#order">訂單欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/order/update
     * Body:
     * {
     *   "condition": {
     *     "orderID": 123456,
     *   },
     *   "update": {
     *     "style": "123abc",
     *     ...........
     *   }
     * }
     * @apiSuccess (Success 200) {Number} updateCount 修改成功的訂單筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "updateCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    orderRouter.post('/order/update', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:184', 400);
        }
        else if (false === dbquery_1.checkRequestParamObject(ctx.request.body.condition)) {
            ctx.throw('db.invalidParameters:187', 400);
        }
        else if (false === dbquery_1.checkRequestParamObject(ctx.request.body.update)) {
            ctx.throw('db.invalidParameters:188', 400);
        }
        else {
            try {
                let query = {
                    where: ctx.request.body.condition,
                };
                let updateres = await Order_1.Order.update(ctx.request.body.update, query);
                if (updateres && Array.isArray(updateres)) {
                    let res = {
                        updateCount: updateres[0]
                    };
                    ctx.body = res;
                    ctx.status = 200;
                    ctx.respond = true;
                }
                else {
                    ctx.throw('db.invalidParameters:205', 400);
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:209', 400);
            }
        }
    });
    /**
     * @api {delete} /order [訂單]-刪除
     * @apiDescription 刪除訂單
     * @apiGroup Order
     * @apiVersion 0.0.1
     * @apiParam {String} orderID 訂單編號
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/order
     * Body:
     * {
     *   "orderID": 123456
     * }
     * @apiSuccess (Success 200) {Number} deleteCount 刪除成功的訂單筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "deleteCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    orderRouter.delete('/order', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:238', 400);
        }
        else {
            try {
                let condition = {
                    where: ctx.request.body
                };
                let delcount = await Order_1.Order.destroy(condition);
                if (null !== delcount && undefined !== delcount) {
                    let res = {
                        deleteCount: delcount
                    };
                    ctx.body = res;
                    ctx.status = 200;
                    ctx.respond = true;
                }
                else {
                    ctx.throw('db.invalidParameters:255', 400);
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:259', 400);
            }
        }
    });
    /**
     * @api {post} /order/planspeed [訂單]-查詢進度
     * @apiDescription 查詢符合條件的訂單，並將結果分頁回傳
     * @apiGroup Order
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {number} [id] 訂單 id
     * @apiParam {string} orderID 訂單編號 orderID
     * @apiParam {string} [deliveryDate] 訂單交期.
     * @apiParam {boolean} [factoryInfo=false] 顯示工廠分配數據
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/order/planspeed
     * Body:
     * {
     *   "orderID": "O01",
     *   "deliveryDate": '2018-10-10'
     * }
     * @apiSuccess (Success 200) {Array} records 查詢的結果。各欄位定義請參考: 訂單進度欄位定義
     * @apiSuccess (Success 200) {Object} records.data 進度欄位定義
     * @apiSuccess (Success 200) {number} records.data.id 訂單 id
     * @apiSuccess (Success 200) {number} records.data.orderID 訂單編號
     * @apiSuccess (Success 200) {string} records.data.deliveryDate 訂單交期
     * @apiSuccess (Success 200) {number} records.data.totalAmount  訂單交期總量
     * @apiSuccess (Success 200) {number} records.data.outsourcingAmount  訂單交期外包總量
     * @apiSuccess (Success 200) {number} records.data.scheduledAmount 訂單交期 排產總量
     * @apiSuccess (Success 200) {number} records.data.cropCompleteAmount 訂單交期 裁剪 完成總量
     * @apiSuccess (Success 200) {number} records.data.stickCompleteAmount 訂單交期 粘衬 完成總量
     * @apiSuccess (Success 200) {number} records.data.sewingCompleteAmount 訂單交期 车缝 完成總量
     * @apiSuccess (Success 200) {number} records.data.lockCompleteAmount 訂單交期 锁钉 完成總量
     * @apiSuccess (Success 200) {number} records.data.ironCompleteAmount 訂單交期 整烫 完成總量
     * @apiSuccess (Success 200) {number} records.data.packCompleteAmount 訂單交期 包装 完成總量
     * @apiSuccess (Success 200) {Array}  [records.data.factoryInfo] 工廠分配列表
     * @apiSuccess (Success 200) {string}  [records.data.factoryInfo.factoryID] 工廠 編號
     * @apiSuccess (Success 200) {string}  [records.data.factoryInfo.name] 工廠 名稱
     * @apiSuccess (Success 200) {number}  [records.data.factoryInfo.scheduledAmount] 工廠 分配數量
     * @apiSuccessExample {json} Response Example
     * {
     *  records:[
     *  {
     *    "totalAmount": 10000,
     *    "scheduledAmount": "3000",
     *    "cropCompleteAmount": "10",
     *    "stickCompleteAmount": "8",
     *    "sewingCompleteAmount": "5",
     *    "lockCompleteAmount": "0",
     *    "ironCompleteAmount": "0",
     *    "packCompleteAmount": "0",
     *    "id": 1,
     *    "orderID": "O01",
     *    "deliveryDate": "2019-01-27",
     *    "factoryInfo": [
     *          {
     *              "factoryID": "A001",
     *              "name": "工厂1",
     *              "scheduledAmount": "3000"
     *          }
     *      ]
     *  },
     *  {
     *    "totalAmount": 10000,
     *    "scheduledAmount": "5000",
     *    "cropCompleteAmount": "0",
     *    "stickCompleteAmount": "0",
     *    "sewingCompleteAmount": "0",
     *    "lockCompleteAmount": "0",
     *    "ironCompleteAmount": "0",
     *    "packCompleteAmount": "0",
     *    "id": 1,
     *    "orderID": "O01",
     *    "deliveryDate": "2019-02-27",
     *    "factoryInfo": [
     *          {
     *              "factoryID": "A001",
     *              "name": "工厂1",
     *              "scheduledAmount": "5000"
     *          }
     *      ]
     *    }
     * ]}
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    orderRouter.post('/order/planspeed', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:272', 400);
        }
        else if (undefined === ctx.request.body.id &&
            undefined === ctx.request.body.orderID) {
            ctx.throw('api.bodyIsEmpty:274', 400);
        }
        else {
            try {
                let args = [];
                let sqlWheres = [];
                let params = ctx.request.body;
                // args.push(ctx.request.body.id);
                // let order: any | null = null;
                let sqlOrderIDCmd = 'SELECT id FROM `Order` as Orders ';
                let sqlOrderIDWhere = [];
                if (params.orderID) {
                    sqlOrderIDWhere.push(' Orders.orderID=? ');
                    args.push(params.orderID);
                }
                if (params.deliveryDate) {
                    sqlOrderIDWhere.push(' Orders.deliveryDate=? ');
                    args.push(params.deliveryDate);
                }
                if (sqlOrderIDWhere.length > 0) {
                    sqlOrderIDCmd = ' (' + sqlOrderIDCmd + 'WHERE ' + sqlOrderIDWhere.join(' AND ') + ') ';
                }
                // let deliveryDate = ctx.request.body.deliveryDate;
                let cmd = 'SELECT OrderDelv.totalAmount as totalAmount, OrderDelv.outsourcingAmount as outsourcingAmount, SUM(Prod.amount) as scheduledAmount, ' +
                    'SUM(Prod.cropCompleteAmount) as cropCompleteAmount, SUM(Prod.stickCompleteAmount) as stickCompleteAmount, ' +
                    'SUM(Prod.sewingCompleteAmount) as sewingCompleteAmount, SUM(Prod.lockCompleteAmount) as lockCompleteAmount, ' +
                    'SUM(Prod.ironCompleteAmount) as ironCompleteAmount, SUM(Prod.packCompleteAmount) as packCompleteAmount, ' +
                    'OrderDelv.order as id ' +
                    'FROM ProductionScheduling as Prod ' +
                    'LEFT OUTER JOIN OrderDeliveryPlan AS OrderDelv ON Prod.orderDeliveryPlan=OrderDelv.id ';
                // 'WHERE OrderDelv.order=? AND OrderDelv.deliveryDate=? '
                if (args.length > 0) {
                    sqlWheres.push(' OrderDelv.order IN ' + sqlOrderIDCmd);
                    cmd += 'WHERE ';
                    cmd += sqlWheres.join(' AND ');
                }
                cmd += 'GROUP BY id;';
                let res = await Order_1.Order.sequelize.query({
                    query: cmd,
                    values: args
                });
                if (res && Array.isArray(res)) {
                    let report = [];
                    console.log(res[1]);
                    for (let devPlanReport of res[0]) {
                        if (devPlanReport.id && devPlanReport.deliveryDate) {
                            let amount = await OrderDeliveryPlan_1.OrderDeliveryPlan.aggregate('totalAmount', 'SUM', {
                                where: {
                                    order: devPlanReport.id
                                }
                            });
                            devPlanReport.totalAmount = amount;
                            let outamount = await OrderDeliveryPlan_1.OrderDeliveryPlan.aggregate('outsourcingAmount', 'SUM', {
                                where: {
                                    order: devPlanReport.id
                                }
                            });
                            devPlanReport.outsourcingAmount = outamount;
                        }
                        if ('string' === typeof devPlanReport.scheduledAmount) {
                            devPlanReport.scheduledAmount = Number.parseInt(devPlanReport.scheduledAmount);
                        }
                        if ('string' === typeof devPlanReport.cropCompleteAmount) {
                            devPlanReport.cropCompleteAmount = Number.parseInt(devPlanReport.cropCompleteAmount);
                        }
                        if ('string' === typeof devPlanReport.stickCompleteAmount) {
                            devPlanReport.stickCompleteAmount = Number.parseInt(devPlanReport.stickCompleteAmount);
                        }
                        if ('string' === typeof devPlanReport.sewingCompleteAmount) {
                            devPlanReport.sewingCompleteAmount = Number.parseInt(devPlanReport.sewingCompleteAmount);
                        }
                        if ('string' === typeof devPlanReport.lockCompleteAmount) {
                            devPlanReport.lockCompleteAmount = Number.parseInt(devPlanReport.lockCompleteAmount);
                        }
                        if ('string' === typeof devPlanReport.ironCompleteAmount) {
                            devPlanReport.ironCompleteAmount = Number.parseInt(devPlanReport.ironCompleteAmount);
                        }
                        if ('string' === typeof devPlanReport.packCompleteAmount) {
                            devPlanReport.packCompleteAmount = Number.parseInt(devPlanReport.packCompleteAmount);
                        }
                        let theorder = await Order_1.Order.findById(devPlanReport.id);
                        if (theorder) {
                            devPlanReport.orderID = theorder.orderID;
                            devPlanReport.deliveryDate = theorder.deliveryDate;
                        }
                        if (params.factoryInfo) {
                            let cmdFacArgs = [];
                            cmdFacArgs.push(devPlanReport.id);
                            let cmdFactory = 'SELECT Fac.factoryID as factoryID, Fac.name as name, ' +
                                'SUM(Prod.amount) as scheduledAmount ' +
                                //'SUM(Prod.cropCompleteAmount) as cropCompleteAmount, SUM(Prod.stickCompleteAmount) as stickCompleteAmount, ' + 
                                //'SUM(Prod.sewingCompleteAmount) as sewingCompleteAmount, SUM(Prod.lockCompleteAmount) as lockCompleteAmount, ' +
                                //'SUM(ironCompleteAmount) as ironCompleteAmount, SUM(Prod.packCompleteAmount) as packCompleteAmount, ' +
                                'FROM ProductionScheduling as Prod ' +
                                'LEFT JOIN Factory as Fac ON Prod.factory=Fac.id ' +
                                'LEFT OUTER JOIN OrderDeliveryPlan AS OrderDelv ON Prod.orderDeliveryPlan=OrderDelv.id ' +
                                'WHERE OrderDelv.order=? ' +
                                'GROUP BY Fac.factoryID;';
                            let facInfoRes = await Order_1.Order.sequelize.query({
                                query: cmdFactory,
                                values: cmdFacArgs
                            });
                            if (facInfoRes && Array.isArray(facInfoRes[0])) {
                                devPlanReport.factoryInfo = facInfoRes[0];
                            }
                        }
                        report.push(devPlanReport);
                    }
                    ctx.body = {
                        records: report
                    };
                    ctx.status = 200;
                    ctx.respond = true;
                }
                else {
                    ctx.throw('db.invalidParameters:307', 400);
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:311', 400);
            }
        }
    });
};
