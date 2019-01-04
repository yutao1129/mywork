"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const FabricInspection_1 = require("../database/models/FabricInspection");
const dbquery_1 = require("../database/dbquery");
// export const accRouter = new KoaRouter();
exports.registerFabricInspectAPI = function (fabricRouter) {
    /**
     * @api {post} /fabricInspection/search [驗布記錄]-查詢
     * @apiDescription 查詢符合條件的驗布記錄，並將結果分頁回傳
     * @apiGroup Warehouse
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number=0} [pageIndex] 頁碼
     * @apiParam {Number=100} [maxRows] 每一頁的最大筆數
     * @apiParam {Object} [sort] 將結果指定欄位排序。1是從小到大排序，-1是從大到小。可指定的欄位請參考: <a href="#fabricInspection">驗布記錄欄位定義</a> <p> 例如根據<code>length</code>從小到大排序就是：<code>{"length":1}</code>
     * @apiParam {Object} [query] 查詢條件。可以指定欄位等於某個值，或是介於某個範圍。範圍用<code>[大於某值，小於某值]</code>來描述，範圍中的兩個值其中之一，可以設定為<code>null</code>，表示不指定，但不能兩者皆為<code>null</code><p> 例如想指定<code>length</code>大於0的驗布記錄就是：<code>{"length": [0, null]}</code>
     * @apiParam {Object} [query.orderID] 訂單編號
     * @apiParam {Object} [query.deliveryDate] 訂單交期
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/fabricInspection/search
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
     * @apiSuccess (Success 200) {Array} records 查詢的結果。各欄位定義請參考: <a href="#fabricInspection">驗布記錄欄位定義</a>
     * @apiSuccessExample {json} Response Example
     * {
     *   "pageIndex": 1,
     *   "maxRows": 100,
     *   "totalPage": 2,
     *   "records": [{
     *     "length": 12,
     *     "purchaseItem": 10002,
     *     "material": 10002,
     *     "volumeNumber": 102,
     *     "inspectedDate": "2000-01-01T00:00:00+08:00",
     *     "totalScore": 9.8,
     *     "averageScore": 5.3,
     *     ...
     *     },
     *     ...
     *   ]
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    fabricRouter.post('/fabricInspection/search', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:63', 400);
        }
        else {
            let resp = dbquery_1.queryResponsePacket(ctx.request.body);
            let purchItemArgs = [];
            let purchItemWhere = [];
            let purchItemIdList = [];
            let params = ctx.request.body;
            if (params.query && params.query.order) {
                purchItemWhere.push(' Orders.id=? ');
                purchItemArgs.push(ctx.request.body.query.order);
                delete params.query.order;
            }
            if (params.query && params.query.orderID) {
                purchItemWhere.push(' Orders.orderID=? ');
                purchItemArgs.push(ctx.request.body.query.orderID);
                delete params.query.orderID;
            }
            if (params.query && params.query.deliveryDate) {
                purchItemWhere.push(' Orders.deliveryDate=? ');
                purchItemArgs.push(ctx.request.body.query.deliveryDate);
                delete params.query.deliveryDate;
            }
            // let query = queryDBGeneratorEx < FabricInspection > (ctx.request.body, fabricInspectionJoin);
            try {
                if (purchItemArgs.length > 0 && undefined === params.query.purchaseItem) {
                    let cmdPurcherQuery = 'SELECT PP.id FROM PurchasePlan AS PP ' +
                        'LEFT JOIN `Order` as Orders ON PP.order=Orders.id WHERE ' +
                        purchItemWhere.join(' AND ');
                    let queryRes = await FabricInspection_1.FabricInspection.sequelize.query({
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
                    query = dbquery_1.queryDBGeneratorEx(params, FabricInspection_1.fabricInspectionJoin, advFilter);
                }
                else {
                    query = dbquery_1.queryDBGeneratorEx(params, FabricInspection_1.fabricInspectionJoin);
                }
                let orderdocInfo = await FabricInspection_1.FabricInspection.findAndCount(query);
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
                /*try {
                    let count = await FabricInspection.count(countQuery);
                    if (0 === count) {
                        resp.totalPage = 0;
                    } else if (resp.maxRows > 0) {
                        resp.totalPage = Math.ceil(count / resp.maxRows);
                    } else {
                        resp.totalPage = 1;
                    }
    
                    if (undefined === query.offset || (query.offset && query.offset < count)) {
                        let fabrdoclist = await FabricInspection.findAll(query);
                        if (fabrdoclist && fabrdoclist.length > 0) {
                            for(let item of fabrdoclist) {
                                let itemFmt = item.toJSON();
                                if (itemFmt.material) {
                                    let mat = await Material.findById(item.material);
                                    if (mat) {
                                        itemFmt.material = mat.toJSON();
                                    }
                                }
                                if (itemFmt.inspector) {
                                    let acc = await UserAccount.findById(item.inspector);
                                    if (acc) {
                                        itemFmt.inspector = acc.toJSON();
                                    }
                                }
                                if (itemFmt.purchaseItem) {
                                    let purch = await PurchasePlan.findById(itemFmt.purchaseItem);
                                    if (purch) {
                                        itemFmt.purchaseItem = purch.toJSON();
                                    }
                                }
    
                                resp.records.push(itemFmt);
                            }
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
     * @api {post} /fabricInspection [驗布記錄]-新增
     * @apiDescription 新增驗布記錄
     * @apiGroup Warehouse
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number} purchaseItem 生產採購計劃項目編號
     * @apiParam {Number} material 倉儲物料項目編號
     * @apiParam {Number} volumeNumber 卷號
     * @apiParam {Date} inspectedDate 檢驗日期
     * @apiParam {Number} totalScore 總分
     * @apiParam {Number} averageScore 平均分
     * @apiParam {Mix} [others] 其他欄位，請參考: <a href="#fabricInspection">驗布記錄欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/fabricInspection
     * Body:
     * {
     *   "purchaseItem": 10002,
     *   "material": 10002,
     *   "volumeNumber": 102,
     *   "inspectedDate": "2000-01-01T00:00:00+08:00",
     *   "totalScore": 9.8,
     *   "averageScore": 5.3,
     *   ...........
     * }
     * @apiSuccess (Success 200) {String} id 驗布記錄的資料庫唯一ID，可以拿來查詢或是修改使用
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "id": "5b6d0d03993dc24293de551c"
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    fabricRouter.post('/fabricInspection', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:129', 400);
        }
        else {
            try {
                let prod = new FabricInspection_1.FabricInspection(ctx.request.body);
                let proddoc = await prod.save();
                if (proddoc && proddoc.id) {
                    let res = {
                        id: proddoc.id
                    };
                    ctx.body = res;
                    ctx.status = 200;
                    ctx.respond = true;
                }
                else {
                    ctx.throw('db.invalidParameters:144', 400);
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:157', 400);
            }
        }
    });
    /**
     * @api {post} /fabricInspection/update [驗布記錄]-修改
     * @apiDescription 修改驗布記錄資料
     * @apiGroup Warehouse
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Object} condition 符合此條件的驗布記錄會被修改
     * @apiParam {Number} condition.id 驗布記錄編號，目前只開放依照驗布記錄編號修改，將來若有需要批次修改的，再增加欄位
     * @apiParam {Object} update 欲修改的欄位
     * @apiParam {ooo} update.xxx 只需要填欲修改的欄位，沒有要修改的就不用填。欄位請參考: <a href="#fabricInspection">驗布記錄欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/fabricInspection/update
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
     * @apiSuccess (Success 200) {Number} updateCount 修改成功的驗布記錄筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "updateCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    fabricRouter.post('/fabricInspection/update', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:186', 400);
        }
        else if (false === dbquery_1.checkRequestParamObject(ctx.request.body.condition)) {
            ctx.throw('db.invalidParameters:188', 400);
        }
        else if (false === dbquery_1.checkRequestParamObject(ctx.request.body.update)) {
            ctx.throw('db.invalidParameters:190', 400);
        }
        else {
            try {
                let query = {
                    where: ctx.request.body.condition,
                };
                let updateres = await FabricInspection_1.FabricInspection.update(ctx.request.body.update, query);
                if (updateres && Array.isArray(updateres)) {
                    let res = {
                        updateCount: updateres[0]
                    };
                    ctx.body = res;
                    ctx.status = 200;
                    ctx.respond = true;
                }
                else {
                    ctx.throw('db.invalidParameters:207', 400);
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:211', 400);
            }
        }
    });
    /**
     * @api {delete} /fabricInspection [驗布記錄]-刪除
     * @apiDescription 刪除驗布記錄
     * @apiGroup Warehouse
     * @apiVersion 0.0.1
     * @apiParam {Number} id 驗布記錄編號
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/fabricInspection
     * Body:
     * {
     *   "id": 123456
     * }
     * @apiSuccess (Success 200) {Number} deleteCount 刪除成功的驗布記錄筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "deleteCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    fabricRouter.delete('/fabricInspection', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:238', 400);
        }
        else {
            try {
                let condition = {
                    where: ctx.request.body
                };
                let delcount = await FabricInspection_1.FabricInspection.destroy(condition);
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
     * @api {post} /fabricInspection/sumIssueLen [驗布不合格長度統計]-查詢
     * @apiDescription 查詢驗布不合格長度統計
     * @apiGroup Warehouse
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number} [id] 驗布記錄 id
     * @apiParam {Number} [order] 訂單 id
     * @apiParam {Number} orderID 訂單編號 id
     * @apiParam {string} [deliveryDate] 訂單交期
     * @apiParam {string} [materialID] 物料編碼
     * @apiParam {string} [category] 物料類型
     * @apiParam {string} [color] 顏色
     * @apiParam {string} [width] 門幅
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/fabricInspectionResult/search
     * Body:
     * {
     *   "id": 1
     * }
     * @apiSuccess (Success 200) {Array} records 查詢的結果
     * @apiSuccess (Success 200) {Object} records.data 統計資料物件
     * @apiSuccess (Success 200) {number} records.data.totalLen   驗布總長
     * @apiSuccess (Success 200) {number} records.data.totalIssueLen 不合格總長, fabricInspectionResult.length 為 0 時 不計入不合格長度.
     * - 例如 {色差, value: "1/3"}, {鬆緊, value:"嚴重"} 為單卷檢驗總項時,不計入不合長度時,應將當前米長設為 0.
     * @apiSuccessExample {json} Response Example
     * {
     *   "records": [{
     *      "totalLen": 376,
     *      "totalIssueLen": 7
     *  }]
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    fabricRouter.post('/fabricInspection/sumIssueLen', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:356', 400);
        }
        else {
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
                let params = ctx.request.body;
                let args = [];
                let sqlPuchIDwheres = [];
                let sqlPuchIDcmd = 'SELECT PP.id as id ' +
                    'FROM PurchasePlan as PP ' +
                    'LEFT JOIN Material as Mat ON PP.material=Mat.id ' +
                    'LEFT JOIN `Order` as Orders ON PP.order=Orders.id ';
                if (params.orderID) {
                    sqlPuchIDwheres.push(' Orders.orderID=? ');
                    args.push(params.orderID);
                }
                if (params.deliveryDate) {
                    sqlPuchIDwheres.push(' Orders.deliveryDate=? ');
                    args.push(params.deliveryDate);
                }
                if (params.materialID) {
                    sqlPuchIDwheres.push(' Mat.materialID=? ');
                    args.push(params.materialID);
                }
                if (params.category) {
                    sqlPuchIDwheres.push(' Mat.category=? ');
                    args.push(params.category);
                }
                if (params.color) {
                    sqlPuchIDwheres.push(' Mat.color=? ');
                    args.push(params.color);
                }
                if (params.width) {
                    sqlPuchIDwheres.push(' Mat.width=? ');
                    args.push(params.width);
                }
                if (sqlPuchIDwheres.length > 0) {
                    let where = 'WHERE ' + sqlPuchIDwheres.join('AND');
                    console.log(where);
                    sqlPuchIDcmd += where;
                }
                let sqlCountLencmd = 'SELECT FI.id as id, FI.length as length, ' +
                    'COUNT(DISTINCT FIR.length) as IssueLen ' +
                    'FROM FabricInspection as FI ' +
                    'LEFT OUTER JOIN FabricInspectionResult as FIR ON FI.id=FIR.fabricInspection ' +
                    'WHERE FIR.length<>0 ';
                if (params.id) {
                    args = [];
                    sqlCountLencmd += (' AND FI.id=?');
                    args.push(params.id);
                }
                else if (args.length > 0) {
                    sqlCountLencmd += (' AND FI.purchaseItem IN( ' + sqlPuchIDcmd + ') GROUP BY id');
                }
                else {
                    sqlCountLencmd += ' GROUP BY id';
                }
                /*
                if (params.fabricInspection) {
                    sqlwheres.push(' FIR.fabricInspection=? ');
                    args.push(params.fabricInspection);
                }*/
                let sqlTotalSum = 'SELECT SUM(length) as totalLen, SUM(IssueLen) as totalIssueLen FROM ( ' +
                    sqlCountLencmd + ' ) as issueLenSum;';
                let queryRes = await FabricInspection_1.FabricInspection.sequelize.query({ query: sqlTotalSum, values: args });
                if (queryRes && Array.isArray(queryRes) && Array.isArray(queryRes[0])) {
                    let reports = [];
                    for (let report of queryRes[0]) {
                        if (report.totalLen) {
                            if ('string' === typeof report.totalLen) {
                                report.totalLen = Number.parseFloat(report.totalLen);
                            }
                        }
                        else {
                            report.totalLen = 0;
                        }
                        if (report.totalIssueLen) {
                            if ('string' === typeof report.totalIssueLen) {
                                report.totalIssueLen = Number.parseFloat(report.totalIssueLen);
                            }
                        }
                        else {
                            report.totalIssueLen = 0;
                        }
                        reports.push(report);
                    }
                    ctx.body = { records: reports };
                    ctx.status = 200;
                    ctx.respond = true;
                }
                else {
                    ctx.throw('db.invalidParameters:452', 400);
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:455', 400);
            }
        }
    });
};
