"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PlatformAccount_1 = require("../database/models/PlatformAccount");
const dbquery_1 = require("../database/dbquery");
exports.registerPlatformAccountAPI = function (platformAccRouter) {
    /**
     * @api {post} /platformAccount/search [平台帳號]-查詢
     * @apiDescription 查詢符合條件的平台帳號，並將結果分頁回傳
     * @apiGroup Account
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number=0} [pageIndex] 頁碼
     * @apiParam {Number=100} [maxRows] 每一頁的最大筆數
     * @apiParam {Object} [sort] 將結果指定欄位排序。1是從小到大排序，-1是從大到小。可指定的欄位請參考: <a href="#platformAccount">平台帳號欄位定義</a> <p> 例如根據<code>username</code>從小到大排序就是：<code>{"username":1}</code>
     * @apiParam {Object} [query] 查詢條件。可以指定欄位等於某個值，或是介於某個範圍。範圍用<code>[大於某值，小於某值]</code>來描述，範圍中的兩個值其中之一，可以設定為<code>null</code>，表示不指定，但不能兩者皆為<code>null</code><p> 例如想指定<code>status</code>大於0的平台帳號就是：<code>{"status": [0, null]}</code>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/platformAccount/search
     * Body:
     * {
     *   "pageIndex": 0,
     *   "maxRows": 3,
     *   "sort": {
     *     "id": 1
     *   },
     *   "query": {
     *      "status": 0
     *   }
     * }
     * @apiSuccess (Success 200) {Number} pageIndex 目前的頁碼
     * @apiSuccess (Success 200) {Number} maxRows 每一頁的最大筆數
     * @apiSuccess (Success 200) {Number} totalPage 總頁數
     * @apiSuccess (Success 200) {Array} records 查詢的結果。各欄位定義請參考: <a href="#platformAccount">平台帳號欄位定義</a>
     * @apiSuccessExample {json} Response Example
     * {
     *   "pageIndex": 1,
     *   "maxRows": 100,
     *   "totalPage": 2,
     *   "records": [{
     *     "username": "xxxx",
     *     "status": 0,
     *     ...
     *     },
     *     ...
     *   ]
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    platformAccRouter.post('/platformAccount/search', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:61', 400);
        }
        else {
            let resp = dbquery_1.queryResponsePacket(ctx.request.body);
            let countQuery = dbquery_1.queryTotalCount(ctx.request.body);
            let query = dbquery_1.queryDBGenerator(ctx.request.body);
            try {
                let count = await PlatformAccount_1.PlatformAccount.count(countQuery);
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
                    let accdoclist = await PlatformAccount_1.PlatformAccount.findAll(query);
                    if (accdoclist && accdoclist.length > 0) {
                        accdoclist.map((item) => {
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
                ctx.throw('db.invalidQuery:91', 400);
            }
        }
    });
    /**
     * @api {post} /platformAccount [平台帳號]-新增
     * @apiDescription 新增平台帳號
     * @apiGroup Account
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {String} username 帳號
     * @apiParam {String} password 密碼
     * @apiParam {Mix} [others] 其他欄位，請參考: <a href="#platformAccount">平台帳號欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/platformAccount
     * Body:
     * {
     *   "username": "xxxx",
     *   "password": "oooo",
     *   ...........
     * }
     * @apiSuccess (Success 200) {String} id 平台帳號的資料庫唯一ID，可以拿來查詢或是修改使用
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "id": "5b6d0d03993dc24293de551c"
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    platformAccRouter.post('/platformAccount', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:122', 400);
        }
        else {
            try {
                let acc = new PlatformAccount_1.PlatformAccount(ctx.request.body);
                let accdata = await acc.save();
                if (accdata && accdata.id) {
                    let res = {
                        id: accdata.id
                    };
                    ctx.body = res;
                    ctx.status = 200;
                    ctx.respond = true;
                }
                else {
                    ctx.throw('db.invalidParameters:137', 400);
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:141', 400);
            }
        }
    });
    /**
     * @api {post} /platformAccount/update [平台帳號]-修改
     * @apiDescription 修改平台帳號資料
     * @apiGroup Account
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Object} condition 符合此條件的平台帳號會被修改
     * @apiParam {String} condition.username 平台帳號，目前只開放依照平台帳號修改，將來若有需要批次修改的，再增加欄位
     * @apiParam {Object} update 欲修改的欄位
     * @apiParam {ooo} update.xxx 只需要填欲修改的欄位，沒有要修改的就不用填。欄位請參考: <a href="#platformAccount">平台帳號欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/platformAccount/update
     * Body:
     * {
     *   "condition": {
     *     "username": "xxxx",
     *   },
     *   "update": {
     *     "status": 1,
     *     ...........
     *   }
     * }
     * @apiSuccess (Success 200) {Number} updateCount 修改成功的平台帳號筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "updateCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse ac_accountNotFound
     * @apiUse db_dbNotReady
     */
    platformAccRouter.post('/platformAccount/update', async (ctx) => {
        ctx.body = '';
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:177', 400);
        }
        else if (false === dbquery_1.checkRequestParamObject(ctx.request.body.condition)) {
            ctx.throw('db.invalidParameters:179', 400);
        }
        else if (false === dbquery_1.checkRequestParamObject(ctx.request.body.update)) {
            ctx.throw('db.invalidParameters:181', 400);
        }
        else {
            try {
                let query = {
                    where: ctx.request.body.condition,
                };
                let updateres = await PlatformAccount_1.PlatformAccount.update(ctx.request.body.update, query);
                if (updateres && Array.isArray(updateres)) {
                    let res = {
                        updateCount: updateres[0]
                    };
                    ctx.body = res;
                    ctx.status = 200;
                    ctx.respond = true;
                }
                else {
                    ctx.throw('db.invalidParameters:198', 400);
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:202', 400);
            }
        }
    });
    /**
     * @api {delete} /platformAccount [平台帳號]-刪除
     * @apiDescription 刪除平台帳號
     * @apiGroup Account
     * @apiVersion 0.0.1
     * @apiParam {String} username 平台帳號
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/platformAccount
     * Body:
     * {
     *   "username": "xxxx"
     * }
     * @apiSuccess (Success 200) {Number} deleteCount 刪除成功的平台帳號筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "deleteCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse ac_accountNotFound
     * @apiUse db_dbNotReady
     */
    platformAccRouter.delete('/platformAccount', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:227', 400);
        }
        else {
            try {
                let condition = {
                    where: ctx.request.body
                };
                let delcount = await PlatformAccount_1.PlatformAccount.destroy(condition);
                if (null !== delcount && undefined !== delcount) {
                    let res = {
                        deleteCount: delcount
                    };
                    ctx.body = res;
                    ctx.status = 200;
                    ctx.respond = true;
                }
                else {
                    ctx.throw('db.invalidParameters:244', 400);
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:248', 400);
            }
        }
    });
};
