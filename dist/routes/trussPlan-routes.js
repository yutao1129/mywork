"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TrussPlan_1 = require("../database/models/TrussPlan");
const dbquery_1 = require("../database/dbquery");
// export const accRouter = new KoaRouter();
exports.registerTrussPlanAPI = function (trussRouter) {
    /**
     * @api {post} /trussPlan/search [嘜架計畫]-查詢
     * @apiDescription 查詢符合條件的嘜架計畫，並將結果分頁回傳
     * @apiGroup Style
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number=0} [pageIndex] 頁碼
     * @apiParam {Number=100} [maxRows] 每一頁的最大筆數
     * @apiParam {Object} [sort] 將結果指定欄位排序。1是從小到大排序，-1是從大到小。可指定的欄位請參考: <a href="#trussPlan">嘜架計畫欄位定義</a> <p> 例如根據<code>trussPlanID</code>從小到大排序就是：<code>{"trussPlanID":1}</code>
     * @apiParam {Object} [query] 查詢條件。可以指定欄位等於某個值，或是介於某個範圍。範圍用<code>[大於某值，小於某值]</code>來描述，範圍中的兩個值其中之一，可以設定為<code>null</code>，表示不指定，但不能兩者皆為<code>null</code><p> 例如想指定<code>trussID</code>大於0的嘜架計畫就是：<code>{"trussID": [0, null]}</code>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/trussPlan/search
     * Body:
     * {
     *   "pageIndex": 0,
     *   "maxRows": 3,
     *   "sort": {
     *     "id": 1
     *   },
     *   "query": {
     *      "trussID": "xxx"
     *   }
     * }
     * @apiSuccess (Success 200) {Number} pageIndex 目前的頁碼
     * @apiSuccess (Success 200) {Number} maxRows 每一頁的最大筆數
     * @apiSuccess (Success 200) {Number} totalPage 總頁數
     * @apiSuccess (Success 200) {Array} records 查詢的結果。各欄位定義請參考: <a href="#trussPlan">嘜架計畫欄位定義</a>
     * @apiSuccessExample {json} Response Example
     * {
     *   "pageIndex": 1,
     *   "maxRows": 100,
     *   "totalPage": 2,
     *   "records": [{
     *     "trussID": "xxxx",
     *     "budget": { "xs":10, "s":20, "m":30, "l":40, "xl":50 },
     *   },
     *     ...
     *   ]
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    trussRouter.post('/trussPlan/search', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:62', 400);
        }
        else {
            let resp = dbquery_1.queryResponsePacket(ctx.request.body);
            let countQuery = dbquery_1.queryTotalCount(ctx.request.body);
            let query = dbquery_1.queryDBGenerator(ctx.request.body);
            try {
                let count = await TrussPlan_1.TrussPlan.count(countQuery);
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
                    let trussdoclist = await TrussPlan_1.TrussPlan.findAll(query);
                    if (trussdoclist && trussdoclist.length > 0) {
                        trussdoclist.map((item) => {
                            let itemFmt = item.toJSON();
                            if (itemFmt && 'string' === typeof itemFmt.budget) {
                                itemFmt.budget = JSON.parse(itemFmt.budget);
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
     * @api {post} /trussPlan [嘜架計畫]-新增
     * @apiDescription 新增嘜架計畫
     * @apiGroup Style
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {String} trussID 帳號
     * @apiParam {Object} budget 嘜架預算
     * @apiParam {Mix} [others] 其他欄位，請參考: <a href="#trussPlan">嘜架計畫欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/trussPlan
     * Body:
     * {
     *   "trussID": "xxxx",
     *   "budget": { "xs":10, "s":20, "m":30, "l":40, "xl":50 },
     *   ...........
     * }
     * @apiSuccess (Success 200) {String} id 嘜架計畫的資料庫唯一ID，可以拿來查詢或是修改使用
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "id": "5b6d0d03993dc24293de551c"
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    trussRouter.post('/trussPlan', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:130', 400);
        }
        else {
            try {
                let trussData = ctx.request.body;
                if (trussData.budget) {
                    trussData.budget = JSON.stringify(ctx.request.body.budget);
                }
                else {
                    trussData.budget = '{}';
                }
                let truss = new TrussPlan_1.TrussPlan(trussData);
                let trussdoc = await truss.save();
                if (trussdoc && trussdoc.id) {
                    let res = {
                        id: trussdoc.id
                    };
                    ctx.body = res;
                    ctx.status = 200;
                    ctx.respond = true;
                }
                else {
                    ctx.throw('db.invalidParameters:153', 400);
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:157', 400);
            }
        }
    });
    /**
     * @api {post} /trussPlan/update [嘜架計畫]-修改
     * @apiDescription 修改嘜架計畫資料
     * @apiGroup Style
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Object} condition 符合此條件的嘜架計畫會被修改
     * @apiParam {Number} condition.id 嘜架計畫編號，目前只開放依照嘜架計畫編號修改，將來若有需要批次修改的，再增加欄位
     * @apiParam {Object} update 欲修改的欄位
     * @apiParam {ooo} update.xxx 只需要填欲修改的欄位，沒有要修改的就不用填。欄位請參考: <a href="#trussPlan">嘜架計畫欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/trussPlan/update
     * Body:
     * {
     *   "condition": {
     *     id: 123456,
     *   },
     *   "update": {
     *     "budget": { "xs":10, "s":20, "m":30, "l":40, "xl":50 },
     *     ...........
     *   }
     * }
     * @apiSuccess (Success 200) {Number} updateCount 修改成功的嘜架計畫筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "updateCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    trussRouter.post('/trussPlan/update', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:195', 400);
        }
        else if (false === dbquery_1.checkRequestParamObject(ctx.request.body.condition)) {
            ctx.throw('db.invalidParameters:197', 400);
        }
        else if (false === dbquery_1.checkRequestParamObject(ctx.request.body.update)) {
            ctx.throw('db.invalidParameters:199', 400);
        }
        else {
            try {
                let query = {
                    where: ctx.request.body.condition,
                };
                let updatefields = ctx.request.body.update;
                if (updatefields.budget) {
                    updatefields.budget = JSON.stringify(updatefields.budget);
                }
                let updateres = await TrussPlan_1.TrussPlan.update(updatefields, query);
                if (updateres && Array.isArray(updateres)) {
                    let res = {
                        updateCount: updateres[0]
                    };
                    ctx.body = res;
                    ctx.status = 200;
                    ctx.respond = true;
                }
                else {
                    ctx.throw('db.invalidParameters:220', 400);
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:224', 400);
            }
        }
    });
    /**
     * @api {delete} /trussPlan [嘜架計畫]-刪除
     * @apiDescription 刪除嘜架計畫
     * @apiGroup Style
     * @apiVersion 0.0.1
     * @apiParam {Number} id 嘜架計畫編號
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/trussPlan
     * Body:
     * {
     *   "id": 123456
     * }
     * @apiSuccess (Success 200) {Number} deleteCount 刪除成功的嘜架計畫筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "deleteCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    trussRouter.delete('/trussPlan', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:252', 400);
        }
        else {
            try {
                let condition = {
                    where: ctx.request.body
                };
                let delcount = await TrussPlan_1.TrussPlan.destroy(condition);
                if (null !== delcount && undefined !== delcount) {
                    let res = {
                        deleteCount: delcount
                    };
                    ctx.body = res;
                    ctx.status = 200;
                    ctx.respond = true;
                }
                else {
                    ctx.throw('db.invalidParameters:269', 400);
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:273', 400);
            }
        }
    });
};
