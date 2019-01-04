"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const MaterialReceiving_1 = require("../database/models/MaterialReceiving");
const PurchasePlan_1 = require("../database/models/PurchasePlan");
const InventoryEvent_1 = require("../database/models/InventoryEvent");
const dbquery_1 = require("../database/dbquery");
// export const accRouter = new KoaRouter();
exports.registerMaterialReceivingAPI = function (materRecRouter) {
    /**
     * @api {post} /materialReceiving/search [物料收料記錄]-查詢
     * @apiDescription 查詢符合條件的物料收料記錄，並將結果分頁回傳
     * @apiGroup Warehouse
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number=0} [pageIndex] 頁碼
     * @apiParam {Number=100} [maxRows] 每一頁的最大筆數
     * @apiParam {Object} [sort] 將結果指定欄位排序。1是從小到大排序，-1是從大到小。可指定的欄位請參考: <a href="#materialReceiving">物料收料記錄欄位定義</a> <p> 例如根據<code>length</code>從小到大排序就是：<code>{"length":1}</code>
     * @apiParam {Object} [query] 查詢條件。可以指定欄位等於某個值，或是介於某個範圍。範圍用<code>[大於某值，小於某值]</code>來描述，範圍中的兩個值其中之一，可以設定為<code>null</code>，表示不指定，但不能兩者皆為<code>null</code><p> 例如想指定<code>length</code>大於0的物料收料記錄就是：<code>{"length": [0, null]}</code>
     * @apiParam {Object} [query.orderID] 訂單編號
     * @apiParam {Object} [query.deliveryDate] 訂單交期
     * @apiParam {Object} [query.supplier] 供應商 id
     * @apiParam {Object} [query.receiveTime] 收料截止時間
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/materialReceiving/search
     * Body:
     * {
     *   "pageIndex": 0,
     *   "maxRows": 3,
     *   "sort": {
     *     "id": 1
     *   },
     *   "query": {
     *      "length": 12,
     *      "orderID": "o001",
     *      "deliveryDate": "2018-12-12"
     *   }
     * }
     * @apiSuccess (Success 200) {Number} pageIndex 目前的頁碼
     * @apiSuccess (Success 200) {Number} maxRows 每一頁的最大筆數
     * @apiSuccess (Success 200) {Number} totalPage 總頁數
     * @apiSuccess (Success 200) {Array} records 查詢的結果。各欄位定義請參考: <a href="#materialReceiving">物料收料記錄欄位定義</a>
     * @apiSuccessExample {json} Response Example
     * {
     *   "pageIndex": 1,
     *   "maxRows": 100,
     *   "totalPage": 2,
     *   "records": [{
     *     "length": 12,
     *     "purchaseItem": 1111,
     *     "material": 12222,
     *     "receivingDate": "2000-01-01T00:00:00+08:00",
     *     "volume": 1002,
     *     ...
     *     },
     *     ...
     *   ]
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    materRecRouter.post('/materialReceiving/search', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:63', 400);
        }
        else {
            let resp = dbquery_1.queryResponsePacket(ctx.request.body);
            //let countQuery = queryTotalCount < MaterialReceiving > (ctx.request.body);
            //let query = queryDBGenerator < MaterialReceiving > (ctx.request.body);
            let purchItemArgs = [];
            let purchItemWhere = [];
            let purchItemIdList = [];
            let params = ctx.request.body;
            if (params.query && params.query.orderID) {
                purchItemWhere.push(' Orders.orderID=? ');
                purchItemArgs.push(params.query.orderID);
                delete params.query.orderID;
            }
            if (params.query && params.query.deliveryDate) {
                purchItemWhere.push(' Orders.deliveryDate=? ');
                purchItemArgs.push(params.query.deliveryDate);
                delete params.query.deliveryDate;
            }
            if (params.query && params.query.supplier) {
                purchItemWhere.push(' PP.supplier=? ');
                purchItemArgs.push(params.query.supplier);
                delete params.query.supplier;
            }
            if (params.query && params.query.receiveTime) {
                purchItemWhere.push(' PP.receiveTime=? ');
                purchItemArgs.push(params.query.receiveTime);
                delete params.query.receiveTime;
            }
            try {
                if (purchItemArgs.length > 0 && undefined === params.query.purchaseItem) {
                    let cmdPurcherQuery = 'SELECT PP.id FROM PurchasePlan AS PP ' +
                        //                                          'LEFT JOIN Supplier as Supp ON PP.supplier=Supp.id ' +
                        'LEFT JOIN `Order` as Orders ON PP.order=Orders.id ' +
                        'WHERE ' +
                        purchItemWhere.join(' AND ');
                    let queryRes = await MaterialReceiving_1.MaterialReceiving.sequelize.query({
                        query: cmdPurcherQuery, values: purchItemArgs
                    });
                    console.log(queryRes[0]);
                    if (queryRes && Array.isArray(queryRes)) {
                        for (let idrec of queryRes[0]) {
                            if ('number' === typeof idrec.id) {
                                purchItemIdList.push(idrec.id);
                            }
                            else if ('string' === typeof idrec.id) {
                                purchItemIdList.push(Number.parseInt(idrec.id));
                            }
                        }
                    }
                }
                let query = null;
                if (purchItemIdList.length > 0 || purchItemArgs.length > 0) {
                    let advFilter = {
                        purchaseItem: {
                            [Op.in]: purchItemIdList
                        }
                    };
                    query = dbquery_1.queryDBGeneratorEx(params, MaterialReceiving_1.materialReceivingJoin, advFilter);
                }
                else {
                    query = dbquery_1.queryDBGeneratorEx(params, MaterialReceiving_1.materialReceivingJoin);
                }
                let matdocInfo = await MaterialReceiving_1.MaterialReceiving.findAndCount(query);
                let count = matdocInfo.count;
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
                if (matdocInfo && matdocInfo.rows) {
                    for (let item of matdocInfo.rows) {
                        resp.records.push(item.toJSON());
                    }
                }
                /*try {
                    let count = await MaterialReceiving.count(countQuery);
                    if (0 === count) {
                        resp.totalPage = 0;
                    } else if (resp.maxRows > 0) {
                        resp.totalPage = Math.ceil(count / resp.maxRows);
                    } else {
                        resp.totalPage = 1;
                    }
    
                    if (undefined === query.offset || (query.offset && query.offset < count)) {
                        let materialdoclist = await MaterialReceiving.findAll(query);
                        if (materialdoclist && materialdoclist.length > 0) {
                            materialdoclist.map((item) => {
                                resp.records.push(item.toJSON());
                            });
                        }
                    }*/
                ctx.body = resp;
                ctx.status = 200;
                ctx.respond = true;
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidQuery:93', 400);
            }
        }
    });
    /**
     * @api {post} /materialReceiving [物料收料記錄]-新增
     * @apiDescription 新增物料收料記錄
     * @apiGroup Warehouse
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number} purchaseItem 生產採購計劃項目編號
     * @apiParam {Number} material 倉儲物料項目編號
     * @apiParam {Date} receivingDate 收料日期
     * @apiParam {Number} volume 收料卷數
     * @apiParam {Number} length 收料長度
     * @apiParam {Mix} [others] 其他欄位，請參考: <a href="#materialReceiving">物料收料記錄欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/materialReceiving
     * Body:
     * {
     *   "purchaseItem": 1111,
     *   "material": 12222,
     *   "receivingDate": "2000-01-01T00:00:00+08:00",
     *   "volume": 1002,
     *   "length": 120,
     *   ...........
     * }
     * @apiSuccess (Success 200) {String} id 物料收料記錄的資料庫唯一ID，可以拿來查詢或是修改使用
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "id": "5b6d0d03993dc24293de551c"
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    materRecRouter.post('/materialReceiving', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:126', 400);
        }
        else {
            try {
                let material = new MaterialReceiving_1.MaterialReceiving(ctx.request.body);
                let mData = await material.save();
                if (mData && mData.id) {
                    let res = {
                        id: mData.id
                    };
                    ctx.body = res;
                    ctx.status = 200;
                    ctx.respond = true;
                }
                else {
                    ctx.throw('db.invalidParameters:141', 400);
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:145', 400);
            }
        }
    });
    /**
     * @api {post} /materialReceiving/update [物料收料記錄]-修改
     * @apiDescription 修改物料收料記錄資料
     * @apiGroup Warehouse
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Object} condition 符合此條件的物料收料記錄會被修改
     * @apiParam {Number} condition.id 物料收料記錄編號，目前只開放依照物料收料記錄編號修改，將來若有需要批次修改的，再增加欄位
     * @apiParam {Object} update 欲修改的欄位
     * @apiParam {ooo} update.xxx 只需要填欲修改的欄位，沒有要修改的就不用填。欄位請參考: <a href="#materialReceiving">物料收料記錄欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/materialReceiving/update
     * Body:
     * {
     *   "condition": {
     *     id: 123456,
     *   },
     *   "update": {
     *     "length": 1002,
     *     ...........
     *   }
     * }
     * @apiSuccess (Success 200) {Number} updateCount 修改成功的物料收料記錄筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "updateCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    materRecRouter.post('/materialReceiving/update', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:183', 400);
        }
        else if (false === dbquery_1.checkRequestParamObject(ctx.request.body.condition)) {
            ctx.throw('db.invalidParameters:186', 400);
        }
        else if (false === dbquery_1.checkRequestParamObject(ctx.request.body.update)) {
            ctx.throw('db.invalidParameters:188', 400);
        }
        else {
            try {
                let query = {
                    where: ctx.request.body.condition,
                };
                let updateres = await MaterialReceiving_1.MaterialReceiving.update(ctx.request.body.update, query);
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
     * @api {delete} /materialReceiving [物料收料記錄]-刪除
     * @apiDescription 刪除物料收料記錄
     * @apiGroup Warehouse
     * @apiVersion 0.0.1
     * @apiParam {Number} id 物料收料記錄編號
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/materialReceiving
     * Body:
     * {
     *   "id": 123456
     * }
     * @apiSuccess (Success 200) {Number} deleteCount 刪除成功的物料收料記錄筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "deleteCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    materRecRouter.delete('/materialReceiving', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:238', 400);
        }
        else {
            try {
                let condition = {
                    where: ctx.request.body
                };
                let delcount = await MaterialReceiving_1.MaterialReceiving.destroy(condition);
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
    materRecRouter.delete('/materialReceiving/checkDelete', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:238', 400);
        }
        else {
            try {
                let materialReceivingId = ctx.request.body.id;
                if (!materialReceivingId || materialReceivingId == undefined) {
                    ctx.throw('db.invalidParameters:M1', 400);
                }

                let sqlcmd = 'SELECT COUNT(IE.id) AS IECount' +
                    ' FROM InventoryEvent AS IE ' +
                    ' LEFT JOIN PurchasePlan AS PP ON PP.order=IE.order AND PP.material=IE.material ' +
                    ' LEFT JOIN MaterialReceiving AS MR ON MR.purchaseItem=PP.id AND MR.width=IE.width' +
                    ' WHERE MR.id =' + materialReceivingId;


                let queryRes = await InventoryEvent_1.InventoryEvent.sequelize.query({ query: sqlcmd });
                if (queryRes && Array.isArray(queryRes) && Array.isArray(queryRes[0]) && queryRes[0][0]) {
                    console.log('queryRes', queryRes)
                    if (queryRes[0][0].IECount > 0) {
                        ctx.throw('TakeMaterialRecordFound', 400);
                    }

                }
                else {
                    ctx.throw('db.invalidParameters:M3', 400);
                }

                let condition = {
                    where: ctx.request.body
                };
                let delcount = await MaterialReceiving_1.MaterialReceiving.destroy(condition);
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
                if(err.message=="TakeMaterialRecordFound"){
                    ctx.throw(err.message, 400);
                }
                else{
                    ctx.throw('db.invalidParameters:259', 400);
                }
               
            }
        }
    });
    /**
     * @api {post} /materialReceiving/status [物料收料進度匯總]-查詢
     * @apiDescription 取得收料單進度報表
     * @apiGroup Warehouse
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {number} [order] 生產單號 id
     * @apiParam {string} [orderID] 生產單號 orderID
     * @apiParam {Date} [deliveryDate] 訂單交期
     * @apiParam {number} [supplier] 供應商 id
     * @apiParam {string} [supplierID] 供應商編碼
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}//materialReceiving/status
     * Body:
     * {
     *   "order": 1
     * }
     * @apiSuccess (Success 200) {Array} records 物料收料列表
     * @apiSuccess (Success 200) {Object} records.data 收料資訊
     * @apiSuccess (Success 200) {number} records.data.id 生產單id
     * @apiSuccess (Success 200) {string} records.data.orderID 生產單號
     * @apiSuccess (Success 200) {Date} records.data.deliveryDate 訂單交期
     * @apiSuccess (Success 200) {number} records.data.supplier 供應商id
     * @apiSuccess (Success 200) {string} records.data.supplierID 供應商編號
     * @apiSuccess (Success 200) {string} records.data.supplierName 供應商名稱
     * @apiSuccess (Success 200) {number} records.data.supplierPurchaseLength  計劃採購總長度
     * @apiSuccess (Success 200) {number} records.data.receivingDate 收料日期
     * @apiSuccess (Success 200) {number} records.data.receivingVolume 已收料總卷數
     * @apiSuccess (Success 200) {number} records.data.receivingLength 已收料總長度
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "records":[
     *   {
     *       "id": 2,
     *       "orderID": "10001",
     *       "deliveryDate": "2018-10-31",
     *       "receivingDate": 300000,
     *       "supplier": 2,
     *       "supplierID": "供应商编号",
     *       "supplierName": "供应商名称",
     *       "supplierPurchaseLength": 491000,
     *       "receivingDate": "2018-10-20T00:13:55.000Z",
     *       "receivingLength": 300000,
     *       "receivingVolume":  1,
     *   },
     *   {
     *       "id": 2,
     *       "orderID": "10001",
     *       "deliveryDate": "2018-10-31",
     *       "receivingDate": 300000,
     *       "supplier": 1,
     *       "supplierID": "10018",
     *       "supplierName": "yuu",
     *       "supplierPurchaseLength": 147300,
     *       "receivingDate": "2018-10-20T00:14:24.000Z",
     *       "receivingLength": 200000,
     *       "receivingVolume":  1,
     *   }
     * ]}
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    materRecRouter.post('/materialReceiving/status', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:442', 400);
        }
        else {
            let params = {};
            if (dbquery_1.checkRequestParamObject(ctx.request.body)) {
                params = ctx.request.body;
            }
            try {
                let args = [];
                let sqlwheres = [];
                if (params.order) {
                    sqlwheres.push(' PP.order=? ');
                    args.push(params.order);
                }
                if (params.orderID) {
                    sqlwheres.push(' Orders.orderID=? ');
                    args.push(params.orderID);
                }
                if (params.deliveryDate) {
                    sqlwheres.push(' Orders.deliveryDate=? ');
                    args.push(params.deliveryDate);
                }
                if (params.supplier) {
                    sqlwheres.push(' PP.supplier=? ');
                    args.push(params.supplier);
                }
                if (params.supplierID) {
                    sqlwheres.push(' Supp.supplierID=? ');
                    args.push(params.supplierID);
                }
                let sqlcmd = 'SELECT SUM(PP.purchaseAmount) AS supplierPurchaseLength, MR.receivingDate AS receivingDate, ' +
                    'SUM(MR.length) AS receivingLength, SUM(MR.volume) AS receivingVolume, ' +
                    'PP.supplier AS supplier, ' +
                    'Supp.supplierID AS supplierID, Supp.name AS supplierName, ' +
                    'Orders.id AS id, Orders.orderID AS orderID, Orders.deliveryDate AS deliveryDate ' +
                    'FROM PurchasePlan AS PP ' +
                    'LEFT JOIN `Order` AS Orders ON PP.order=Orders.id ' +
                    'LEFT JOIN Supplier AS Supp ON PP.supplier=Supp.id ' +
                    'LEFT OUTER JOIN MaterialReceiving AS MR ON PP.id=MR.purchaseItem ';
                if (sqlwheres.length > 0) {
                    let where = ' WHERE ' + sqlwheres.join(' AND ');
                    sqlcmd += where;
                    sqlcmd += ' AND MR.id IS NOT NULL ';
                }
                else {
                    let where = ' WHERE MR.id IS NOT NULL ';
                    sqlcmd += where;
                }
                sqlcmd += ' GROUP BY id, deliveryDate, supplier, receivingDate;';
                let queryRes = await MaterialReceiving_1.MaterialReceiving.sequelize.query({ query: sqlcmd, values: args });
                if (queryRes && Array.isArray(queryRes) && Array.isArray(queryRes[0])) {
                    let reports = [];
                    for (let report of queryRes[0]) {
                        if (null !== report.supplier) {
                            report.supplierPurchaseLength = await PurchasePlan_1.PurchasePlan.aggregate('purchaseAmount', 'SUM', {
                                where: {
                                    order: report.id,
                                    supplier: report.supplier
                                }
                            });
                        }
                        else {
                            report.supplierPurchaseLength = 0;
                        }
                        if (null !== report.receivingVolume && 'string' === typeof report.receivingVolume) {
                            report.receivingVolume = Number.parseInt(report.receivingVolume);
                        }
                        if (null !== report.receivingLength && 'string' === typeof report.receivingLength) {
                            report.receivingLength = Number.parseInt(report.receivingLength);
                        }
                        if (null !== report.purchaseAmount && null !== report.supplier) {
                            reports.push(report);
                        }
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
