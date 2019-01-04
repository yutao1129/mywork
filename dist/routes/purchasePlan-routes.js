"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PurchasePlan_1 = require("../database/models/PurchasePlan");
const dbquery_1 = require("../database/dbquery");
// export const accRouter = new KoaRouter();
exports.registerPurchPlanAPI = function (purchPlanRouter) {
    /**
     * @api {post} /purchasePlan/search [生產採購計劃項目]-查詢
     * @apiDescription 查詢符合條件的生產採購計劃項目，並將結果分頁回傳
     * @apiGroup Warehouse
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number=0} [pageIndex] 頁碼
     * @apiParam {Number=100} [maxRows] 每一頁的最大筆數
     * @apiParam {Object} [sort] 將結果指定欄位排序。1是從小到大排序，-1是從大到小。可指定的欄位請參考: <a href="#purchasePlan">生產採購計劃項目欄位定義</a> <p> 例如根據<code>id</code>從小到大排序就是：<code>{"id":1}</code>
     * @apiParam {Object} [query] 查詢條件。可以指定欄位等於某個值，或是介於某個範圍。範圍用<code>[大於某值，小於某值]</code>來描述，範圍中的兩個值其中之一，可以設定為<code>null</code>，表示不指定，但不能兩者皆為<code>null</code><p> 例如想指定<code>id</code>大於0的生產採購計劃項目就是：<code>{"id": [0, null]}</code>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/purchasePlan/search
     * Body:
     * {
     *   "pageIndex": 0,
     *   "maxRows": 3,
     *   "sort": {
     *     "id": 1
     *   },
     *   "query": {
     *      "purchaseAmount": 1000
     *   }
     * }
     * @apiSuccess (Success 200) {Number} pageIndex 目前的頁碼
     * @apiSuccess (Success 200) {Number} maxRows 每一頁的最大筆數
     * @apiSuccess (Success 200) {Number} totalPage 總頁數
     * @apiSuccess (Success 200) {Array} records 查詢的結果。各欄位定義請參考: <a href="#purchasePlan">生產採購計劃項目欄位定義</a>
     * @apiSuccessExample {json} Response Example
     * {
     *   "pageIndex": 1,
     *   "maxRows": 100,
     *   "totalPage": 2,
     *   "records": [{
     *     "purchaseAmount": 1000,
     *     "unitUsageAmount": 1000,
     *     "orderUsageAmount": 1000,
     *     ...
     *     },
     *     ...
     *   ]
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    purchPlanRouter.post('/purchasePlan/search', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:63', 400);
        }
        else {
            let resp = dbquery_1.queryResponsePacket(ctx.request.body);
            //let countQuery = queryTotalCount < PurchasePlan > (ctx.request.body);
            //let query = queryDBGenerator < PurchasePlan > (ctx.request.body);
            let query = dbquery_1.queryDBGeneratorEx(ctx.request.body, PurchasePlan_1.purchasePlanJoin);
            try {
                let orderdocInfo = await PurchasePlan_1.PurchasePlan.findAndCount(query);
                let count = orderdocInfo.count;
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
                /*try {
                    let count = await PurchasePlan.count(countQuery);
                    if (0 === count) {
                        resp.totalPage = 0;
                    } else if (resp.maxRows > 0) {
                        resp.totalPage = Math.ceil(count / resp.maxRows);
                    } else {
                        resp.totalPage = 1;
                    }
    
                    if (undefined === query.offset || (query.offset && query.offset < count)) {
                        let purchdoclist = await PurchasePlan.findAll(query);
                        if (purchdoclist && purchdoclist.length > 0) {
                            purchdoclist.map((item) => {
                                let itemFmt = item.toJSON();
                                resp.records.push(itemFmt);
                            });
                        }
                    }*/
                ctx.body = resp;
                ctx.status = 200;
                ctx.respond = true;
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidQuery:97', 400);
            }
        }
    });
    /**
     * @api {post} /purchasePlan [生產採購計劃項目]-新增
     * @apiDescription 新增生產採購計劃項目
     * @apiGroup Warehouse
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number} material 物料編號
     * @apiParam {Number} order 訂單編號
     * @apiParam {Number} unitUsageAmount 單位用量
     * @apiParam {Number} orderUsageAmount 訂單用量
     * @apiParam {Number} purchaseAmount 計劃採購量
     * @apiParam {Mix} [others] 其他欄位，請參考: <a href="#purchasePlan">生產採購計劃項目欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/purchasePlan
     * Body:
     * {
     *   "purchaseAmount": 1000,
     *   "material": 1233,
     *   "orderDeliveryPlan": 1111,
     *   "unitUsageAmount": 1000,
     *   "orderUsageAmount": 1000,
     *   ...........
     * }
     * @apiSuccess (Success 200) {String} id 生產採購計劃項目的資料庫唯一ID，可以拿來查詢或是修改使用
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "id": "5b6d0d03993dc24293de551c"
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    purchPlanRouter.post('/purchasePlan', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:128', 400);
        }
        else {
            try {
                let purch = new PurchasePlan_1.PurchasePlan(ctx.request.body);
                let purchdoc = await purch.save();
                if (purchdoc && purchdoc.id) {
                    let res = {
                        id: purchdoc.id
                    };
                    ctx.body = res;
                    ctx.status = 200;
                    ctx.respond = true;
                }
                else {
                    ctx.throw('db.invalidParameters:143', 400);
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:146', 400);
            }
        }
    });
    /**
     * @api {post} /purchasePlan/update [生產採購計劃項目]-修改
     * @apiDescription 修改生產採購計劃項目資料
     * @apiGroup Warehouse
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Object} condition 符合此條件的生產採購計劃項目會被修改
     * @apiParam {String} condition.id 生產採購計劃項目編號，目前只開放依照生產採購計劃項目編號修改，將來若有需要批次修改的，再增加欄位
     * @apiParam {Object} update 欲修改的欄位
     * @apiParam {ooo} update.xxx 只需要填欲修改的欄位，沒有要修改的就不用填。欄位請參考: <a href="#purchasePlan">生產採購計劃項目欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/purchasePlan/update
     * Body:
     * {
     *   "condition": {
     *     "id": 123456,
     *   },
     *   "update": {
     *     "unitUsageAmount": 1000,
     *     "orderUsageAmount": 1000,
     *     ...........
     *   }
     * }
     * @apiSuccess (Success 200) {Number} updateCount 修改成功的生產採購計劃項目筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "updateCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    purchPlanRouter.post('/purchasePlan/update', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:185', 400);
        }
        else if (false === dbquery_1.checkRequestParamObject(ctx.request.body.condition)) {
            ctx.throw('db.invalidParameters:187', 400);
        }
        else if (false === dbquery_1.checkRequestParamObject(ctx.request.body.update)) {
            ctx.throw('db.invalidParameters:189', 400);
        }
        else {
            try {
                let query = {
                    where: ctx.request.body.condition,
                };
                let updateres = await PurchasePlan_1.PurchasePlan.update(ctx.request.body.update, query);
                if (updateres && Array.isArray(updateres)) {
                    let res = {
                        updateCount: updateres[0]
                    };
                    ctx.body = res;
                    ctx.status = 200;
                    ctx.respond = true;
                }
                else {
                    ctx.throw('db.invalidParameters:206', 400);
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:210', 400);
            }
        }
    });
    /**
     * @api {delete} /purchasePlan [生產採購計劃項目]-刪除
     * @apiDescription 刪除生產採購計劃項目
     * @apiGroup Warehouse
     * @apiVersion 0.0.1
     * @apiParam {String} id 生產採購計劃項目編號
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/purchasePlan
     * Body:
     * {
     *   "id": 123456
     * }
     * @apiSuccess (Success 200) {Number} deleteCount 刪除成功的生產採購計劃項目筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "deleteCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    purchPlanRouter.delete('/purchasePlan', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:239', 400);
        }
        else {
            try {
                let condition = {
                    where: ctx.request.body
                };
                let delcount = await PurchasePlan_1.PurchasePlan.destroy(condition);
                if (null !== delcount && undefined !== delcount) {
                    let res = {
                        deleteCount: delcount
                    };
                    ctx.body = res;
                    ctx.status = 200;
                    ctx.respond = true;
                }
                else {
                    ctx.throw('db.invalidParameters:256', 400);
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:260', 400);
            }
        }
    });
    /**
     * @api {post} /purchasePlan/speedplan [生產採購進度報表]-查詢
     * @apiDescription 取得生產採購進度報表
     * @apiGroup Warehouse
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {string} [orderID] 生產單號 orderID
     * @apiParam {Date} [deliveryDate] 訂單交期
     * @apiParam {string} [materialID] 物料編碼
     * @apiParam {string} [category] 物料類型
     * @apiParam {string} [color] 顏色
     * @apiParam {string} [width] 門幅
     * @apiParam {string} [supplierID] 供應商編號
     * @apiParam {boolean} [supplierGrouping=false] 依供應商及收料截止日期分組統計,
     * - true: 依供應商分組
     * - false: 不顯示供應商.
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/purchasePlan/speedplan
     * Body:
     * @apiSuccess (Success 200) {Array} records 物料採購進度
     * @apiSuccess (Success 200) {Object} records.data 進度欄位定義
     * @apiSuccess (Success 200) {number} records.data.order 訂單資料庫編號
     * @apiSuccess (Success 200) {string} records.data.orderID 生產單號
     * @apiSuccess (Success 200) {Date} records.data.deliveryDate 訂單交期
     * @apiSuccess (Success 200) {number} records.data.material 物料資料庫編號
     * @apiSuccess (Success 200) {string} records.data.materialID 物料編碼
     * @apiSuccess (Success 200) {string} records.data.category 物料類型
     * @apiSuccess (Success 200) {string} records.data.color 物料顏色
     * @apiSuccess (Success 200) {number} records.data.width 物料門幅
     * @apiSuccess (Success 200) {number} records.data.purchaseItem 生產採購計劃項目編號
     * @apiSuccess (Success 200) {number} records.data.purchaseAmount  計劃採購總長度
     * @apiSuccess (Success 200) {number} records.data.receivedVolume 已收料總卷數
     * @apiSuccess (Success 200) {number} records.data.receivedLength 已收料總長度
     * @apiSuccess (Success 200) {number} records.data.receivedRatio  收料率 %
     * @apiSuccess (Success 200) {number} records.data.inspectionLength 檢驗長度
     * @apiSuccess (Success 200) {number} records.data.inspectionRatio 檢驗率 %
     * @apiSuccess (Success 200) {number} [records.data.supplier] 供應商編號
     * @apiSuccess (Success 200) {number} [records.data.supplierName] 供應商名稱
     * @apiSuccess (Success 200) {number} records.data.inspection 是否免驗
     * @apiSuccess (Success 200) {Date} records.data.receiveTime 收料截止日期.
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "records":[
     *   {
     *       "material": 1,
     *       "MaterialID": "MC001",
     *       "category": "棉布",
     *       "color": "G",
     *       "width": 144,
     *       "purchaseAmount": 12000,
     *       "receiveTime": "2018-09-28T11:22:33.000Z",
     *       "inspection": 1,
     *       "OrderID": 1,
     *       "deliveryDate": "2019-01-27",
     *       "receivedLength": 5610,
     *       "receivedVolume":  120,
     *       "receivedRatio": 46.75,
     *       "inspectionRatio": 1.5666666666666667,
     *       "inspectionLength": 188
     *   },
     *   {
     *       "material": 1,
     *       "MaterialID": "MC001",
     *       "category": "棉布",
     *       "color": "G",
     *       "width": 144,
     *       "purchaseAmount": 100,
     *       "receiveTime": "2018-09-28T11:22:33.000Z",
     *       "inspection": 1,
     *       "OrderID": 1,
     *       "deliveryDate": "2019-02-27",
     *       "receivedLength": 22,
     *       "receivedVolume":  1,
     *       "receivedRatio":  22,
     *       "inspectionRatio": 0,
     *       "inspectionLength": 0
     *   }
     * ]}
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    purchPlanRouter.post('/purchasePlan/speedplan', async (ctx) => {
        {
            let params = {};
            if (dbquery_1.checkRequestParamObject(ctx.request.body)) {
                params = ctx.request.body;
            }
            try {
                /*
                let order: any | null = null;

                if (ctx.request.body.orderID) {
                    let orderdoc = await Order.findOne({ where: { orderID: ctx.request.body.orderID}});

                    if (orderdoc){
                        order = orderdoc.toJSON();
                    } else {
                        ctx.body = { records: [] };
                        ctx.status = 200;
                        ctx.respond = true;
                        return;
                    }
                } else if (ctx.request.body.order) {
                    let orderdoc = await Order.findById(ctx.request.body.order)

                    if (orderdoc){
                        order = orderdoc.toJSON();
                    } else {
                        ctx.body = { records: [] };
                        ctx.status = 200;
                        ctx.respond = true;
                        return;
                    }
                }
                */
                /*
                if (ctx.request.body.supplierID) {
                    let suppdoc = await Supplier.findOne({ where : { supplierID: ctx.request.body.supplierID }});
                    if (suppdoc) {
                        supplier = suppdoc.toJSON();
                    }
                }*/
                let args = [];
                let sqlwheres = [];
                let sqlcmd = 'SELECT Mat.color as color, Mat.width as width, ' +
                    'PP.purchaseAmount as purchaseAmount, ' +
                    'PP.receiveTime as receiveTime, ' +
                    'PP.inspection as inspection, ' +
                    'PP.id as purchaseItem, ' +
                    'Orders.orderID as orderID, ' +
                    'Orders.id as `order`, ' +
                    'Orders.deliveryDate as deliveryDate, ' +
                    'SUM(MR.length) as receivedLength, ' +
                    'SUM(MR.volume) as receivedVolume ';
                if (params.supplierGrouping) {
                    sqlcmd += ', Supp.id as supplier ';
                    sqlcmd += ', Supp.name as supplierName ';
                }
                else {
                    sqlcmd += ', PP.material as material ';
                    sqlcmd += ', Mat.materialID as materialID, Mat.category as category ,Mat.type as type ';
                    
                }
                sqlcmd += 'FROM PurchasePlan as PP ';
                sqlcmd += 'LEFT JOIN Material as Mat ON PP.material=Mat.id ';
                sqlcmd += 'LEFT JOIN `Order` as Orders ON PP.order=Orders.id ';
                sqlcmd += 'LEFT OUTER JOIN MaterialReceiving as MR ON PP.id=MR.purchaseItem ';
                sqlcmd += 'LEFT JOIN Supplier as Supp ON PP.supplier=Supp.id ';
                if (params.orderID) {
                    sqlwheres.push(' Orders.orderID=? ');
                    args.push(params.orderID);
                }
                if (params.deliveryDate) {
                    sqlwheres.push(' Orders.deliveryDate=? ');
                    args.push(params.deliveryDate);
                }
                if (params.materialID) {
                    sqlwheres.push(' Mat.materialID=? ');
                    args.push(params.materialID);
                }
                if (params.category) {
                    sqlwheres.push(' Mat.category=? ');
                    args.push(params.category);
                }
                if (params.type) {
                    sqlwheres.push(' Mat.type=? ');
                    args.push(params.type);
                }
                if (params.color) {
                    sqlwheres.push(' Mat.color=? ');
                    args.push(params.color);
                }
                if (params.width) {
                    sqlwheres.push(' Mat.width=? ');
                    args.push(params.width);
                }
                if (params.supplier) {
                    sqlwheres.push(' Supp.id=? ');
                    args.push(params.supplier);
                }
                if (sqlwheres.length > 0) {
                    let where = 'WHERE ' + sqlwheres.join('AND');
                    console.log(where);
                    sqlcmd += where;
                }
                // sqlcmd += 'GROUP BY orderID, deliveryDate, material';
                if (params.supplierGrouping) {
                    sqlcmd += 'GROUP BY orderID, deliveryDate, supplier, receiveTime;';
                }
                else {
                    sqlcmd += 'GROUP BY orderID, deliveryDate, material;';
                }
                let sqlPPAmountCmd = 'SELECT SUM(PP.purchaseAmount) as purchaseAmount ' +
                    'FROM PurchasePlan as PP ' +
                    'LEFT JOIN `Order` as Orders ON PP.order=Orders.id ';
                if (params.supplierGrouping) {
                    sqlPPAmountCmd += 'LEFT JOIN Supplier as Supp ON PP.supplier=Supp.id ';
                    sqlPPAmountCmd += 'WHERE Orders.orderID=? AND Orders.deliveryDate=? ';
                    sqlPPAmountCmd += 'AND PP.receiveTime=? ';
                    // sqlPPAmountCmd += 'AND Supp.supplierID=?;';
                }
                else {
                    sqlPPAmountCmd += 'WHERE Orders.orderID=? AND Orders.deliveryDate=? AND PP.material=?;';
                }
                let sqlInspectionCmd = 'SELECT SUM(FI.length) as inspectionLength ' +
                    'FROM PurchasePlan as PP ' +
                    'LEFT JOIN `Order` as Orders ON PP.order=Orders.id ' +
                    'LEFT OUTER JOIN FabricInspection as FI ON PP.id=FI.purchaseItem ';
                if (params.supplierGrouping) {
                    sqlInspectionCmd += 'LEFT JOIN Supplier as Supp ON PP.supplier=Supp.id ';
                    sqlInspectionCmd += 'WHERE Orders.orderID=? AND Orders.deliveryDate=? ';
                    sqlInspectionCmd += 'AND PP.receiveTime=? ';
                    // sqlInspectionCmd += 'AND Supp.supplierID=?;';
                }
                else {
                    sqlInspectionCmd += 'WHERE Orders.orderID=? AND Orders.deliveryDate=? AND PP.material=? ;';
                }
                let queryRes = await PurchasePlan_1.PurchasePlan.sequelize.query({ query: sqlcmd, values: args });
                if (queryRes && Array.isArray(queryRes) && Array.isArray(queryRes[0])) {
                    let reports = [];
                    for (let report of queryRes[0]) {
                        let amargs = [report.orderID, report.deliveryDate];
                        let ending = ';';
                        if (params.supplierGrouping) {
                            console.log('** rec TS', report.receiveTime);
                            if (report.receiveTime) {
                                amargs.push(report.receiveTime.toISOString());
                            }
                            else {
                                amargs.push(null);
                            }
                            if (null !== report.supplier) {
                                amargs.push(report.supplier);
                                ending = 'AND Supp.id=?;';
                            }
                        }
                        else if (report.material) {
                            amargs.push(report.material);
                        }
                        report.receivedRatio = 0;
                        report.inspectionRatio = 0;
                        console.log('args', amargs);
                        let sqlPPACmd = sqlPPAmountCmd + ending;
                        let PPASumRes = await PurchasePlan_1.PurchasePlan.sequelize.query({ query: sqlPPACmd, values: amargs });
                        let inspectionLength = 0;
                        if (PPASumRes && Array.isArray(PPASumRes) && Array.isArray(PPASumRes[0])) {
                            report.purchaseAmount = PPASumRes[0][0].purchaseAmount;
                            let sqlInspCmd = sqlInspectionCmd + ending;
                            let FILenRes = await PurchasePlan_1.PurchasePlan.sequelize.query({ query: sqlInspCmd, values: amargs });
                            if (FILenRes && Array.isArray(FILenRes) && Array.isArray(FILenRes[0])) {
                                if (null !== FILenRes[0][0].inspectionLength) {
                                    inspectionLength = Number.parseInt(FILenRes[0][0].inspectionLength);
                                }
                            }
                            report.inspectionLength = inspectionLength;
                            if ('string' === typeof report.purchaseAmount) {
                                report.purchaseAmount = Number.parseInt(report.purchaseAmount);
                            }
                            if ('string' === typeof report.receivedLength) {
                                report.receivedLength = Number.parseInt(report.receivedLength);
                            }
                            if ('string' === typeof report.receivedVolume) {
                                report.receivedVolume = Number.parseInt(report.receivedVolume);
                            }
                            if (0 !== report.purchaseAmount) {
                                report.receivedRatio = 100 * report.receivedLength / report.purchaseAmount;
                                report.inspectionRatio = 100 * report.inspectionLength / report.purchaseAmount;
                            }
                        }
                        else {
                            report.purchaseAmount = 0;
                        }
                        reports.push(report);
                    }
                    ctx.body = { records: reports };
                    ctx.status = 200;
                    ctx.respond = true;
                }
                else {
                    ctx.throw('db.invalidParameters:256', 400);
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:260', 400);
            }
        }
    });
};
