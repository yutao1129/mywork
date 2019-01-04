"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Operation_1 = require("../database/models/Operation");
const dbquery_1 = require("../database/dbquery");
// export const accRouter = new KoaRouter();
exports.registerOperationAPI = function (operationRouter) {
    /**
     * @api {post} /operation/search [工藝]-查詢
     * @apiDescription 查詢符合條件的工藝，並將結果分頁回傳
     * @apiGroup Knowledge Base
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number=0} [pageIndex] 頁碼
     * @apiParam {Number=100} [maxRows] 每一頁的最大筆數
     * @apiParam {Object} [sort] 將結果指定欄位排序。1是從小到大排序，-1是從大到小。可指定的欄位請參考: <a href="#operation">工藝欄位定義</a> <p> 例如根據<code>id</code>從小到大排序就是：<code>{"operationIe>
     * @apiParam {Object} [query] 查詢條件。可以指定欄位等於某個值。
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/operation/search
     * Body:
     * {
     *   "pageIndex": 0,
     *   "maxRows": 3,
     *   "sort": {
     *     "id": 1
     *   },
     *   "query": {
     *      "id": 123456
     *   }
     * }
     * @apiSuccess (Success 200) {Number} pageIndex 目前的頁碼
     * @apiSuccess (Success 200) {Number} maxRows 每一頁的最大筆數
     * @apiSuccess (Success 200) {Number} totalPage 總頁數
     * @apiSuccess (Success 200) {Array} records 查詢的結果。各欄位定義請參考: 欄位請參考: <a href="#operation">工藝欄位定義</a>
     * @apiSuccessExample {json} Response Example
     * {
     *   "pageIndex": 1,
     *   "maxRows": 100,
     *   "totalPage": 2,
     *   "records": [{
     *     "id": 123456,
     *     "operationID": "xxxx",
     *     "content": {
     *       "尺寸": {
     *         "前片": { "xs":10, "s":20, "m":5, "l":15, "xl":25 },
     *         ...........
     *       }
     *     },
     *     ...
     *   ]
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    operationRouter.post('/operation/search', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:62', 400);
        }
        else {
            let resp = dbquery_1.queryResponsePacket(ctx.request.body);
            let countQuery = dbquery_1.queryTotalCount(ctx.request.body);
            let query = dbquery_1.queryDBGenerator(ctx.request.body);
            try {
                let count = await Operation_1.Operation.count(countQuery);
                if (0 === count) {
                    resp.totalPage = 0;
                }
                else if (resp.maxRows > 0) {
                    resp.totalPage = Math.ceil(count / resp.maxRows);
                }
                else {
                    resp.totalPage = 1;
                }
                if (undefined === query.offset || (query.offset && query.offset < count)) {
                    let operationdoclist = await Operation_1.Operation.findAll(query);
                    if (operationdoclist && operationdoclist.length > 0) {
                        operationdoclist.map((item) => {
                            let itemFmt = item.toJSON();
                            if (itemFmt && 'string' === typeof itemFmt.content) {
                                itemFmt.content = JSON.parse(itemFmt.content);
                            }
                            resp.records.push(itemFmt);
                        });
                    }
                }
                ctx.body = resp;
                ctx.status = 200;
                ctx.respond = true;
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidQuery:96', 400);
            }
        }
    });
    /**
     * @api {post} /operation [工藝]-新增
     * @apiDescription 新增工藝
     * @apiGroup Knowledge Base
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {String} operationID 工藝號
     * @apiParam {Object} content 內容(JSON形式)
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/operation
     * Body:
     * {
     *   "operationID": "xxxx",
     *   "content": {
     *     "尺寸": {
     *       "前片": { "xs":10, "s":20, "m":5, "l":15, "xl":25 },
     *       ...........
     *     }
     *   }
     * }
     * @apiSuccess (Success 200) {String} id 工藝號，此為工藝的資料庫唯一ID改使用
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "id": 123456
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    operationRouter.post('/operation', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:127', 400);
        }
        else {
            try {
                let opdata = {
                    operationID: ctx.request.body.operationID,
                    content: JSON.stringify(ctx.request.body.content)
                };
                let oper = new Operation_1.Operation(opdata);
                let operdoc = await oper.save();
                if (operdoc && operdoc.id) {
                    let res = {
                        id: operdoc.id
                    };
                    ctx.body = res;
                    ctx.status = 200;
                    ctx.respond = true;
                }
                else {
                    ctx.throw('db.invalidParameters:147', 400);
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:151', 400);
            }
        }
    });
    /**
     * @api {post} /operation/update [工藝]-修改
     * @apiDescription 修改工藝資料
     * @apiGroup Knowledge Base
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Object} condition被修改
     * @apiParam {String} condition.id 工藝編號，目前只開放依照工藝號修改，將來若有加欄位
     * @apiParam {Object} update 欲修改的欄位
     * @apiParam {ooo} update.xxx 只需要填欲修改的欄位，沒有要修改的就不用填。欄位請參考: <a href="#operation">工藝欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/operation/update
     * Body:
     * {
     *   "condition": {
     *     "id": 123456
     *   },
     *   "update": {
     *     "content": {
     *       "尺寸": {
     *         "前片": { "xs":10, "s":20, "m":5, "l":15, "xl":25 },
     *         ...........
     *       }
     *     }
     *   }
     * }
     * @apiSuccess (Success 200) {Number} updateCount 修改成功的工藝筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "updateCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    operationRouter.post('/operation/update', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:188', 400);
        }
        else if (false === dbquery_1.checkRequestParamObject(ctx.request.body.condition)) {
            ctx.throw('db.invalidParameters:190', 400);
        }
        else if (false === dbquery_1.checkRequestParamObject(ctx.request.body.update)) {
            ctx.throw('db.invalidParameters:192', 400);
        }
        else {
            try {
                let query = {
                    where: ctx.request.body.condition,
                };
                let updatefields = ctx.request.body.update;
                if (updatefields.content) {
                    updatefields.content = JSON.stringify(updatefields.content);
                }
                let updateres = await Operation_1.Operation.update(updatefields, query);
                if (updateres && Array.isArray(updateres)) {
                    let res = {
                        updateCount: updateres[0]
                    };
                    ctx.body = res;
                    ctx.status = 200;
                    ctx.respond = true;
                }
                else {
                    ctx.throw('db.invalidParameters:213', 400);
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:217', 400);
            }
        }
    });
    /**
     * @api {delete} /operation [工藝]-刪除
     * @apiDescription 刪除工藝
     * @apiGroup Knowledge Base
     * @apiVersion 0.0.1
     * @apiParam {String} id 工藝編號
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/operation
     * Body:
     * {
     *   "id": 123456
     * }
     * @apiSuccess (Success 200) {Number} deleteCount 刪除成功的工藝筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "deleteCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    operationRouter.delete('/operation', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:245', 400);
        }
        else {
            try {
                let cond = ctx.request.body;
                if (cond.content) {
                    cond.content = JSON.stringify(cond.cont);
                }
                let condition = {
                    where: cond
                };
                let delcount = await Operation_1.Operation.destroy(condition);
                if (null !== delcount && undefined !== delcount) {
                    let res = {
                        deleteCount: delcount
                    };
                    ctx.body = res;
                    ctx.status = 200;
                    ctx.respond = true;
                }
                else {
                    ctx.throw('db.invalidParameters:267', 400);
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:271', 400);
            }
        }
    });
};
