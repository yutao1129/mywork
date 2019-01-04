"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BulkFabricReportContact_1 = require("../database/models/BulkFabricReportContact");
const dbquery_1 = require("../database/dbquery");
// export const accRouter = new KoaRouter();
exports.registerBulkFabricReportContactAPI = function (bulkFabrReportContactRouter) {
    /**
     * @api {post} /bulkFabricReportContact/search [大貨報告聯系單]-查詢
     * @apiDescription 查詢符合條件的大貨報告聯系單，並將結果分頁回傳
     * @apiGroup Warehouse
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number=0} [pageIndex] 頁碼
     * @apiParam {Number=100} [maxRows] 每一頁的最大筆數
     * @apiParam {Object} [sort] 將結果指定欄位排序。1是從小到大排序，-1是從大到小。可指定的欄位請參考: <a href="#bulkFabricReportContact">大貨報告聯系單欄位定義</a> <p> 例如根據<code>material</code>從小到大排序就是：<code>{"material":1}</code>
     * @apiParam {Object} [query] 查詢條件。可以指定欄位等於某個值，或是介於某個範圍。範圍用<code>[大於某值，小於某值]</code>來描述，範圍中的兩個值其中之一，可以設定為<code>null</code>，表示不指定，但不能兩者皆為<code>null</code><p> 例如想指定<code>material</code>大於0的大貨報告聯系單就是：<code>{"material": [0, null]}</code>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/bulkFabricReportContact/search
     * Body:
     * {
     *   "pageIndex": 0,
     *   "maxRows": 3,
     *   "sort": {
     *     "id": 1
     *   },
     *   "query": {
     *      "contactor": 10002
     *   }
     * }
     * @apiSuccess (Success 200) {Number} pageIndex 目前的頁碼
     * @apiSuccess (Success 200) {Number} maxRows 每一頁的最大筆數
     * @apiSuccess (Success 200) {Number} totalPage 總頁數
     * @apiSuccess (Success 200) {Array} records 查詢的結果。各欄位定義請參考: <a href="#bulkFabricReportContact">大貨報告聯系單欄位定義</a>
     * @apiSuccessExample {json} Response Example
     * {
     *   "pageIndex": 1,
     *   "maxRows": 100,
     *   "totalPage": 2,
     *   "records": [{
     *     "bulkFabricReport": 1002,
     *     "inspection": "ooo",
     *     "response": "xxx",
     *     "contactor": 10002,
     *     ...
     *     },
     *     ...
     *   ]
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    bulkFabrReportContactRouter.post('/bulkFabricReportContact/search', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:63', 400);
        }
        else {
            let resp = dbquery_1.queryResponsePacket(ctx.request.body);
            //let countQuery = queryTotalCount < BulkFabricReportContact > (ctx.request.body);
            //let query = queryDBGenerator < BulkFabricReportContact > (ctx.request.body);
            let query = dbquery_1.queryDBGeneratorEx(ctx.request.body, BulkFabricReportContact_1.bulkFabricReportContactJoin);
            try {
                let orderdocInfo = await BulkFabricReportContact_1.BulkFabricReportContact.findAndCount(query);
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
                    let count = await BulkFabricReportContact.count(countQuery);
                    if (0 === count) {
                        resp.totalPage = 0;
                    } else if (resp.maxRows > 0) {
                        resp.totalPage = Math.ceil(count / resp.maxRows);
                    } else {
                        resp.totalPage = 1;
                    }
    
                    if (undefined === query.offset || (query.offset && query.offset < count)) {
                        let bulkdoclist = await BulkFabricReportContact.findAll(query);
                        if (bulkdoclist && bulkdoclist.length > 0) {
                            for (let item of bulkdoclist) {
                                let itemFmt = item.toJSON();
                                if (itemFmt.bulkFabricReport) {
                                    let mat = await BulkFabricReport.findById(item.bulkFabricReport);
                                    if (mat) {
                                        itemFmt.bulkFabricReport = mat.toJSON();
                                    }
                                }
                                if (itemFmt.contactor) {
                                    let acc = await UserAccount.findById(item.contactor);
                                    if (acc) {
                                        itemFmt.contactor = acc.toJSON();
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
     * @api {post} /bulkFabricReportContact [大貨報告聯系單]-新增
     * @apiDescription 新增大貨報告聯系單
     * @apiGroup Warehouse
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number} bulkFabricReport 大貨報告編號
     * @apiParam {String} inspection 檢查意見
     * @apiParam {String} response 處理意見
     * @apiParam {Number} contactor 意見處理人
     * @apiParam {Mix} [others] 其他欄位，請參考: <a href="#bulkFabricReportContact">大貨報告聯系單欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/bulkFabricReportContact
     * Body:
     * {
     *   "bulkFabricReport": 1002,
     *   "inspection": "ooo",
     *   "response": "xxx",
     *   "contactor": 10002,
     *   ...........
     * }
     * @apiSuccess (Success 200) {String} id 大貨報告聯系單的資料庫唯一ID，可以拿來查詢或是修改使用
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "id": "5b6d0d03993dc24293de551c"
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    bulkFabrReportContactRouter.post('/bulkFabricReportContact', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:129', 400);
        }
        else {
            try {
                let prod = new BulkFabricReportContact_1.BulkFabricReportContact(ctx.request.body);
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
     * @api {post} /bulkFabricReportContact/update [大貨報告聯系單]-修改
     * @apiDescription 修改大貨報告聯系單資料
     * @apiGroup Warehouse
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Object} condition 符合此條件的大貨報告聯系單會被修改
     * @apiParam {Number} condition.id 大貨報告聯系單編號，目前只開放依照大貨報告聯系單編號修改，將來若有需要批次修改的，再增加欄位
     * @apiParam {Object} update 欲修改的欄位
     * @apiParam {ooo} update.xxx 只需要填欲修改的欄位，沒有要修改的就不用填。欄位請參考: <a href="#bulkFabricReportContact">大貨報告聯系單欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/bulkFabricReportContact/update
     * Body:
     * {
     *   "condition": {
     *     id: 123456,
     *   },
     *   "update": {
     *     "contactor": 10002,
     *     ...........
     *   }
     * }
     * @apiSuccess (Success 200) {Number} updateCount 修改成功的大貨報告聯系單筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "updateCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    bulkFabrReportContactRouter.post('/bulkFabricReportContact/update', async (ctx) => {
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
                let updateres = await BulkFabricReportContact_1.BulkFabricReportContact.update(ctx.request.body.update, query);
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
     * @api {delete} /bulkFabricReportContact [大貨報告聯系單]-刪除
     * @apiDescription 刪除大貨報告聯系單
     * @apiGroup Warehouse
     * @apiVersion 0.0.1
     * @apiParam {Number} id 大貨報告聯系單編號
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/bulkFabricReportContact
     * Body:
     * {
     *   "id": 123456
     * }
     * @apiSuccess (Success 200) {Number} deleteCount 刪除成功的大貨報告聯系單筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "deleteCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    bulkFabrReportContactRouter.delete('/bulkFabricReportContact', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:238', 400);
        }
        else {
            try {
                let condition = {
                    where: ctx.request.body
                };
                let delcount = await BulkFabricReportContact_1.BulkFabricReportContact.destroy(condition);
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
