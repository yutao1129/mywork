"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FabricStandard_1 = require("../database/models/FabricStandard");
const dbquery_1 = require("../database/dbquery");
//export const accRouter = new KoaRouter();
exports.registerFabricStdAPI = function (fabStdRouter) {
    /**
     * @api {post} /fabricStandard/search [驗布標準]-查詢
     * @apiDescription 查詢符合條件的驗布標準，並將結果分頁回傳
     * @apiGroup Knowledge Base
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number=0} [pageIndex] 頁碼
     * @apiParam {Number=100} [maxRows] 每一頁的最大筆數
     * @apiParam {Object} [sort] 將結果指定欄位排序。1是從小到大排序，-1是從大到小。可指定的欄位請參考: <a href="#fabricStandard">驗布標準欄位定義</a> <p> 例如根據<code>id</code>從小到大排序就是：<code>{"id":1}</code>
     * @apiParam {Object} [query] 查詢條件。可以指定欄位等於某個值。
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/fabricStandard/search
     * Body:
     * {
     *   "pageIndex": 0,
     *   "maxRows": 3,
     *   "sort": {
     *     "id": 1
     *   },
     *   "query": {
     *      "checkItem": "xxx"
     *   }
     * }
     * @apiSuccess (Success 200) {Number} pageIndex 目前的頁碼
     * @apiSuccess (Success 200) {Number} maxRows 每一頁的最大筆數
     * @apiSuccess (Success 200) {Number} totalPage 總頁數
     * @apiSuccess (Success 200) {Array} records 查詢的結果。各欄位定義請參考: <a href="#fabricStandard">驗布標準欄位定義</a>
     * @apiSuccessExample {json} Response Example
     * {
     *   "pageIndex": 1,
     *   "maxRows": 100,
     *   "totalPage": 2,
     *   "records": [{
     *     "checkItem": "xxx"
     *     ...
     *     },
     *     ...
     *   ]
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    fabStdRouter.post('/fabricStandard/search', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:63', 400);
        }
        else {
            let resp = dbquery_1.queryResponsePacket(ctx.request.body);
            let countQuery = dbquery_1.queryTotalCount(ctx.request.body);
            let query = dbquery_1.queryDBGenerator(ctx.request.body);
            try {
                let count = await FabricStandard_1.FabricStandard.count(countQuery);
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
                    let fstddoclist = await FabricStandard_1.FabricStandard.findAll(query);
                    if (fstddoclist && fstddoclist.length > 0) {
                        fstddoclist.map((item) => {
                            if (item && item.checkItem && 'string' === typeof item.checkItem) {
                                item.checkItem = JSON.parse(item.checkItem);
                            }
                            resp.records.push(item.toJSON());
                        });
                    }
                }
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
     * @api {post} /fabricStandard [驗布標準]-新增
     * @apiDescription 新增驗布標準
     * @apiGroup Knowledge Base
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {String} name 驗布標準名稱
     * @apiParam {String} checkItem 檢查項目
     * @apiParam {String} itemValue 項目選項
     * @apiParam {Mix} [others] 其他欄位，請參考: <a href="#fabricStandard">驗布標準欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/fabricStandard
     * Body:
     * {
     *   "name": "xxxx",
     *   "checkItem": "xxxx",
     *   ...........
     * }
     * @apiSuccess (Success 200) {String} id 驗布標準的資料庫唯一ID，可以拿來查詢或是修改使用
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "id": "5b6d0d03993dc24293de551c"
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    fabStdRouter.post('/fabricStandard', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:128', 400);
        }
        else {
            try {
                if (ctx.request.body && ctx.request.body.checkItem) {
                    ctx.request.body.checkItem = JSON.stringify(ctx.request.body.checkItem);
                }
                let fStd = new FabricStandard_1.FabricStandard(ctx.request.body);
                let fStdData = await fStd.save();
                if (fStdData && fStdData.id) {
                    let res = {
                        id: fStdData.id
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
                ctx.throw('db.invalidParameters:147', 400);
            }
        }
    });
    /**
     * @api {post} /fabricStandard/update [驗布標準]-修改
     * @apiDescription 修改驗布標準資料
     * @apiGroup Knowledge Base
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Object} condition 符合此條件的驗布標準會被修改
     * @apiParam {String} condition.id 驗布標準編號，目前只開放依照編號修改，將來若有需要批次修改的，再增加欄位
     * @apiParam {Object} update 欲修改的欄位
     * @apiParam {ooo} update.xxx 只需要填欲修改的欄位，沒有要修改的就不用填。欄位請參考: <a href="#fabricStandard">驗布標準欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/fabricStandard/update
     * Body:
     * {
     *   "condition": {
     *     "id"": 123456789,
     *   },
     *   "update": {
     *     "name": "xxxx",
     *     ...........
     *   }
     * }
     * @apiSuccess (Success 200) {Number} updateCount 修改成功的驗布標準筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "updateCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    fabStdRouter.post('/fabricStandard/update', async (ctx) => {
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
                if (ctx.request.body && ctx.request.body.update && ctx.request.body.update.checkItem) {
                    ctx.request.body.update.checkItem = JSON.stringify(ctx.request.body.update.checkItem);
                }
                let updateres = await FabricStandard_1.FabricStandard.update(ctx.request.body.update, query);
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
     * @api {delete} /fabricStandard [驗布標準]-刪除
     * @apiDescription 刪除驗布標準
     * @apiGroup Knowledge Base
     * @apiVersion 0.0.1
     * @apiParam {String} id 驗布標準編號
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/fabricStandard
     * Body:
     * {
     *   "id": 123456789
     * }
     * @apiSuccess (Success 200) {Number} deleteCount 刪除成功的驗布標準筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "deleteCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    fabStdRouter.delete('/fabricStandard', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:239', 400);
        }
        else {
            try {
                let condition = {
                    where: ctx.request.body
                };
                let delcount = await FabricStandard_1.FabricStandard.destroy(condition);
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
};
