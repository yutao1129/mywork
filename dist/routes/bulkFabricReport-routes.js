"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BulkFabricReport_1 = require("../database/models/BulkFabricReport");
const dbquery_1 = require("../database/dbquery");
// export const accRouter = new KoaRouter();
exports.registerBulkFabricReportAPI = function (bulkFabrReportRouter) {
    /**
     * @api {post} /bulkFabricReport/search [大貨報告]-查詢
     * @apiDescription 查詢符合條件的大貨報告，並將結果分頁回傳
     * @apiGroup Warehouse
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number=0} [pageIndex] 頁碼
     * @apiParam {Number=100} [maxRows] 每一頁的最大筆數
     * @apiParam {Object} [sort] 將結果指定欄位排序。1是從小到大排序，-1是從大到小。可指定的欄位請參考: <a href="#bulkFabricReport">大貨報告欄位定義</a> <p> 例如根據<code>id</code>從小到大排序就是：<code>{"id":1}</code>
     * @apiParam {Object} [query] 查詢條件。可以指定欄位等於某個值，或是介於某個範圍。範圍用<code>[大於某值，小於某值]</code>來描述，範圍中的兩個值其中之一，可以設定為<code>null</code>，表示不指定，但不能兩者皆為<code>null</code><p> 例如想指定<code>id</code>大於0的大貨報告就是：<code>{"id": [0, null]}</code>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/bulkFabricReport/search
     * Body:
     * {
     *   "pageIndex": 0,
     *   "maxRows": 3,
     *   "sort": {
     *     "id": 1
     *   },
     *   "query": {
     *      "orderDeliveryPlan": 1002
     *   }
     * }
     * @apiSuccess (Success 200) {Number} pageIndex 目前的頁碼
     * @apiSuccess (Success 200) {Number} maxRows 每一頁的最大筆數
     * @apiSuccess (Success 200) {Number} totalPage 總頁數
     * @apiSuccess (Success 200) {Array} records 查詢的結果。各欄位定義請參考: <a href="#bulkFabricReport">大貨報告欄位定義</a>
     * @apiSuccessExample {json} Response Example
     * {
     *   "pageIndex": 1,
     *   "maxRows": 100,
     *   "totalPage": 2,
     *   "records": [{
     *     "orderDeliveryPlan": 1002,
     *     "material": 10002,
     *     "createdTime": "2000-01-01T00:00:00+08:00",
     *     "report": {
     *       "company": "xxx",
     *       "fabric": "ooo",
     *       "width": 100,
     *       "result": "pass",
     *       ...
     *     },
     *     ...
     *   ]
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    bulkFabrReportRouter.post('/bulkFabricReport/search', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:63', 400);
        }
        else {
            let resp = dbquery_1.queryResponsePacket(ctx.request.body);
            //let countQuery = queryTotalCount < BulkFabricReport > (ctx.request.body);
            //let query = queryDBGenerator < BulkFabricReport > (ctx.request.body);
            let query = dbquery_1.queryDBGeneratorEx(ctx.request.body, BulkFabricReport_1.bulkFabricReportJoin);
            try {
                let orderdocInfo = await BulkFabricReport_1.BulkFabricReport.findAndCount(query);
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
                        let i = item.toJSON();
                        if (i && i.report && 'string' === typeof i.report) {
                            i.report = JSON.parse(i.report);
                        }
                        resp.records.push(i);
                    }
                }
                /*try {
                    let count = await BulkFabricReport.count(countQuery);
                    if (0 === count) {
                        resp.totalPage = 0;
                    } else if (resp.maxRows > 0) {
                        resp.totalPage = Math.ceil(count / resp.maxRows);
                    } else {
                        resp.totalPage = 1;
                    }
    
                    if (undefined === query.offset || (query.offset && query.offset < count)) {
                        let bulkdoclist = await BulkFabricReport.findAll(query);
                        if (bulkdoclist && bulkdoclist.length > 0) {
                            for (let item of bulkdoclist) {
                                let itemFmt = item.toJSON();
                                if (itemFmt.report) {
                                    itemFmt.report = JSON.parse(itemFmt.report);
                                }
                                if (itemFmt.material) {
                                    let mat = await Material.findById(item.material);
                                    if (mat) {
                                        itemFmt.material = mat.toJSON();
                                    }
                                }
                                if (itemFmt.orderDeliveryPlan) {
                                    let order = await OrderDeliveryPlan.findById(item.orderDeliveryPlan);
                                    if (order) {
                                        itemFmt.orderDeliveryPlan = order.toJSON();
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
     * @api {post} /bulkFabricReport [大貨報告]-新增
     * @apiDescription 新增大貨報告
     * @apiGroup Warehouse
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number} orderDeliveryPlan 訂單交付計畫編號
     * @apiParam {Number} material 倉儲物料項目編號
     * @apiParam {Date} createdTime 建立時間
     * @apiParam {Object} report 報告內容(JSON)
     * @apiParam {Mix} [others] 其他欄位，請參考: <a href="#bulkFabricReport">大貨報告欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/bulkFabricReport
     * Body:
     * {
     *   "orderDeliveryPlan": 1002,
     *   "material": 10002,
     *   "createdTime": "2000-01-01T00:00:00+08:00",
     *   "report": {
     *     "company": "xxx",
     *     "fabric": "ooo",
     *     "width": 100,
     *     "result": "pass",
     *     .....
     *   },
     *   ...........
     * }
     * @apiSuccess (Success 200) {String} id 大貨報告的資料庫唯一ID，可以拿來查詢或是修改使用
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "id": "5b6d0d03993dc24293de551c"
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    bulkFabrReportRouter.post('/bulkFabricReport', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:129', 400);
        }
        else {
            try {
                let data = ctx.request.body;
                if (data.report && 'object' === typeof data.report) {
                    data.report = JSON.stringify(data.report);
                }
                let prod = new BulkFabricReport_1.BulkFabricReport(data);
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
     * @api {post} /bulkFabricReport/update [大貨報告]-修改
     * @apiDescription 修改大貨報告資料
     * @apiGroup Warehouse
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Object} condition 符合此條件的大貨報告會被修改
     * @apiParam {Number} condition.id 大貨報告編號，目前只開放依照大貨報告編號修改，將來若有需要批次修改的，再增加欄位
     * @apiParam {Object} update 欲修改的欄位
     * @apiParam {ooo} update.xxx 只需要填欲修改的欄位，沒有要修改的就不用填。欄位請參考: <a href="#bulkFabricReport">大貨報告欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/bulkFabricReport/update
     * Body:
     * {
     *   "condition": {
     *     id: 123456,
     *   },
     *   "update": {
     *     "orderDeliveryPlan": 1002,
     *     "material": 10002,
     *     "createdTime": "2000-01-01T00:00:00+08:00",
     *     "report": {
     *       "company": "xxx",
     *       "fabric": "ooo",
     *       "width": 100,
     *       "result": "pass",
     *       ...
     *     },
     *     ...........
     *   }
     * }
     * @apiSuccess (Success 200) {Number} updateCount 修改成功的大貨報告筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "updateCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    bulkFabrReportRouter.post('/bulkFabricReport/update', async (ctx) => {
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
                let data = ctx.request.body.update;
                if (data.report && 'object' === typeof data.report) {
                    data.report = JSON.stringify(data.report);
                }
                let updateres = await BulkFabricReport_1.BulkFabricReport.update(ctx.request.body.update, query);
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
     * @api {delete} /bulkFabricReport [大貨報告]-刪除
     * @apiDescription 刪除大貨報告
     * @apiGroup Warehouse
     * @apiVersion 0.0.1
     * @apiParam {Number} id 大貨報告編號
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/bulkFabricReport
     * Body:
     * {
     *   "id": 123456
     * }
     * @apiSuccess (Success 200) {Number} deleteCount 刪除成功的大貨報告筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "deleteCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    bulkFabrReportRouter.delete('/bulkFabricReport', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:238', 400);
        }
        else {
            try {
                let condition = {
                    where: ctx.request.body
                };
                let delcount = await BulkFabricReport_1.BulkFabricReport.destroy(condition);
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
};
