"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RFID_1 = require("../database/models/RFID");
const dbquery_1 = require("../database/dbquery");
// export const accRouter = new KoaRouter();
exports.registerRFIDAPI = function (rfidRouter) {
    /**
     * @api {post} /rfid/search [RFID]-查詢
     * @apiDescription 查詢符合條件的RFID，並將結果分頁回傳
     * @apiGroup Knowledge Base
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number=0} [pageIndex] 頁碼
     * @apiParam {Number=100} [maxRows] 每一頁的最大筆數
     * @apiParam {Object} [sort] 將結果指定欄位排序。1是從小到大排序，-1是從大到小。可指定的欄位請參考: <a href="#rfid">RFID欄位定義</a> <p> 例如根據<code>rfidID</code>從小到大排序就是：<code>{"rfidID":1}</code>
     * @apiParam {Object} [query] 查詢條件。可以指定欄位等於某個值，或是介於某個範圍。範圍用<code>[大於某值，小於某值]</code>來描述，範圍中的兩個值其中之一，可以設定為<code>null</code>，表示不指定，但不能兩者皆為<code>null</code><p> 例如想指定<code>cardNumber</code>大於0的RFID就是：<code>{"cardNumber": [0, null]}</code>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/rfid/search
     * Body:
     * {
     *   "pageIndex": 0,
     *   "maxRows": 3,
     *   "sort": {
     *     "id": 1
     *   },
     *   "query": {
     *      "cardNumber": "xxx"
     *   }
     * }
     * @apiSuccess (Success 200) {Number} pageIndex 目前的頁碼
     * @apiSuccess (Success 200) {Number} maxRows 每一頁的最大筆數
     * @apiSuccess (Success 200) {Number} totalPage 總頁數
     * @apiSuccess (Success 200) {Array} records 查詢的結果。各欄位定義請參考: <a href="#rfid">RFID欄位定義</a>
     * @apiSuccessExample {json} Response Example
     * {
     *   "pageIndex": 1,
     *   "maxRows": 100,
     *   "totalPage": 2,
     *   "records": [{
     *     "cardNumber": "xxxx",
     *     ...
     *     },
     *     ...
     *   ]
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    rfidRouter.post('/rfid/search', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:63', 400);
        }
        else {
            let resp = dbquery_1.queryResponsePacket(ctx.request.body);
            let countQuery = dbquery_1.queryTotalCount(ctx.request.body);
            let query = dbquery_1.queryDBGenerator(ctx.request.body);
            try {
                let count = await RFID_1.RFID.count(countQuery);
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
                    let rfiddoclist = await RFID_1.RFID.findAll(query);
                    if (rfiddoclist && rfiddoclist.length > 0) {
                        rfiddoclist.map((item) => {
                            let itemFmt = item.toJSON();
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
                ctx.throw('db.invalidQuery:94', 400);
            }
        }
    });
    /**
     * @api {post} /rfid [RFID]-新增
     * @apiDescription 新增RFID
     * @apiGroup Knowledge Base
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {String} cardNumber 帳號
     * @apiParam {Mix} [others] 其他欄位，請參考: <a href="#rfid">RFID欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/rfid
     * Body:
     * {
     *   "cardNumber": "xxxx",
     *   ...........
     * }
     * @apiSuccess (Success 200) {String} id RFID的資料庫唯一ID，可以拿來查詢或是修改使用
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "id": "5b6d0d03993dc24293de551c"
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    rfidRouter.post('/rfid', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:127', 400);
        }
        else {
            try {
                let rfid = new RFID_1.RFID(ctx.request.body);
                let rfidData = await rfid.save();
                if (rfidData && rfidData.id) {
                    let res = {
                        id: rfidData.id
                    };
                    ctx.body = res;
                    ctx.status = 200;
                    ctx.respond = true;
                }
                else {
                    ctx.throw('db.invalidParameters:142', 400);
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:146', 400);
            }
        }
    });
    /**
     * @api {post} /rfid/update [RFID]-修改
     * @apiDescription 修改RFID資料
     * @apiGroup Knowledge Base
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Object} condition 符合此條件的RFID會被修改
     * @apiParam {Number} condition.id RFID編號，目前只開放依照RFID編號修改，將來若有需要批次修改的，再增加欄位
     * @apiParam {Object} update 欲修改的欄位
     * @apiParam {ooo} update.xxx 只需要填欲修改的欄位，沒有要修改的就不用填。欄位請參考: <a href="#rfid">RFID欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/rfid/update
     * Body:
     * {
     *   "condition": {
     *     id: 123456,
     *   },
     *   "update": {
     *     "cardNumber": "123456",
     *     ...........
     *   }
     * }
     * @apiSuccess (Success 200) {Number} updateCount 修改成功的RFID筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "updateCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    rfidRouter.post('/rfid/update', async (ctx) => {
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
                let updateres = await RFID_1.RFID.update(ctx.request.body.update, query);
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
     * @api {delete} /rfid [RFID]-刪除
     * @apiDescription 刪除RFID
     * @apiGroup Knowledge Base
     * @apiVersion 0.0.1
     * @apiParam {Number} id RFID編號
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/rfid
     * Body:
     * {
     *   "id": 123456
     * }
     * @apiSuccess (Success 200) {Number} deleteCount 刪除成功的RFID筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "deleteCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    rfidRouter.delete('/rfid', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:239', 400);
        }
        else {
            try {
                let condition = {
                    where: ctx.request.body
                };
                let delcount = await RFID_1.RFID.destroy(condition);
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
