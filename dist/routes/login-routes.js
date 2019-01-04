"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LoginToken_1 = require("../database/models/LoginToken");
const dbquery_1 = require("../database/dbquery");
exports.registerLoginTokenAPI = function (tokenRouter) {
    /**
     * @api {post} /loginToken/search [登入令牌]-查詢
     * @apiDescription 查詢符合條件的登入令牌，並將結果分頁回傳
     * @apiGroup Account
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number=0} [pageIndex] 頁碼
     * @apiParam {Number=100} [maxRows] 每一頁的最大筆數
     * @apiParam {Object} [sort] 將結果指定欄位排序。1是從小到大排序，-1是從大到小。可指定的欄位請參考: <a href="#loginToken">登入令牌欄位定義</a> <p> 例如根據<code>accountID</code>從小到大排序就是：<code>{"accountID":1}</code>
     * @apiParam {Object} [query] 查詢條件。可以指定欄位等於某個值，或是介於某個範圍。範圍用<code>[大於某值，小於某值]</code>來描述，範圍中的兩個值其中之一，可以設定為<code>null</code>，表示不指定，但不能兩者皆為<code>null</code><p> 例如想指定<code>accountID</code>大於1000的登入令牌就是：<code>{"accountID": [1000, null]}</code>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/loginToken/search
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
     * @apiSuccess (Success 200) {Array} records 查詢的結果。各欄位定義請參考: <a href="#loginToken">登入令牌欄位定義</a>
     * @apiSuccessExample {json} Response Example
     * {
     *   "pageIndex": 1,
     *   "maxRows": 100,
     *   "totalPage": 2,
     *   "records": [{
     *     "account": 123456789,
     *     "status": 0,
     *     ...
     *     },
     *     ...
     *   ]
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    tokenRouter.post('/loginToken/search', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:58', 400);
        }
        else {
            let resp = dbquery_1.queryResponsePacket(ctx.request.body);
            //let countQuery = queryTotalCount < LoginToken > (ctx.request.body);
            let query = dbquery_1.queryDBGeneratorEx(ctx.request.body, LoginToken_1.loginTokenJoin);
            try {
                let tokendoclist = await LoginToken_1.LoginToken.findAndCount(query);
                let count = tokendoclist.count;
                if (0 === count) {
                    resp.totalPage = 0;
                }
                else if (resp.maxRows > 0) {
                    resp.totalPage = Math.ceil(count / resp.maxRows);
                }
                else {
                    resp.totalPage = 1;
                }
                if (tokendoclist && tokendoclist.rows) {
                    for (let item of tokendoclist.rows) {
                        resp.records.push(item.toJSON());
                    }
                }
                ctx.body = resp;
                ctx.status = 200;
                ctx.respond = true;
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidQuery:92', 400);
            }
        }
    });
    /**
     * @api {post} /loginToken [登入令牌]-新增
     * @apiDescription 新增登入令牌
     * @apiGroup Account
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number} account 帳號
     * @apiParam {String} token Token
     * @apiParam {Mix} [others] 其他欄位，請參考: <a href="#loginToken">登入令牌欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/loginToken
     * Body:
     * {
     *   "account": 123456789,
     *   "token": "1qaz2wsx3edc4rfv5tgb",
     *   ...........
     * }
     * @apiSuccess (Success 200) {String} id 登入令牌的資料庫唯一ID，可以拿來查詢或是修改使用
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "id": "5b6d0d03993dc24293de551c"
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    tokenRouter.post('/loginToken', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:123', 400);
        }
        else {
            try {
                let token = new LoginToken_1.LoginToken(ctx.request.body);
                let tokendoc = await token.save();
                if (tokendoc && tokendoc.id) {
                    let res = {
                        id: tokendoc.id
                    };
                    ctx.body = res;
                    ctx.status = 200;
                    ctx.respond = true;
                }
                else {
                    ctx.throw('db.invalidParameters:146', 400);
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:150', 400);
            }
        }
    });
    /**
     * @api {post} /loginToken/update [登入令牌]-修改
     * @apiDescription 修改登入令牌資料
     * @apiGroup Account
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Object} condition 符合此條件的登入令牌會被修改
     * @apiParam {String} condition.id 登入令牌編號，目前只開放依照登入令牌編號修改，將來若有需要批次修改的，再增加欄位
     * @apiParam {Object} update 欲修改的欄位
     * @apiParam {ooo} update.xxx 只需要填欲修改的欄位，沒有要修改的就不用填。欄位請參考: <a href="#loginToken">登入令牌欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/loginToken/update
     * Body:
     * {
     *   "condition": {
     *     "id": 123456789,
     *   },
     *   "update": {
     *     "status": 1,
     *     ...........
     *   }
     * }
     * @apiSuccess (Success 200) {Number} updateCount 修改成功的登入令牌筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "updateCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse ac_loginTokenNotFound
     * @apiUse db_dbNotReady
     */
    tokenRouter.post('/loginToken/update', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:181', 400);
        }
        else if (false === dbquery_1.checkRequestParamObject(ctx.request.body.condition)) {
            ctx.throw('db.invalidParameters:183', 400);
        }
        else if (false === dbquery_1.checkRequestParamObject(ctx.request.body.update)) {
            ctx.throw('db.invalidParameters:158', 400);
        }
        else {
            try {
                let query = {
                    where: ctx.request.body.condition,
                };
                let updateres = await LoginToken_1.LoginToken.update(ctx.request.body.update, query);
                if (updateres && Array.isArray(updateres)) {
                    let res = {
                        updateCount: updateres[0]
                    };
                    ctx.body = res;
                    ctx.status = 200;
                    ctx.respond = true;
                }
                else {
                    ctx.throw('db.invalidParameters:202', 400);
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:206', 400);
            }
        }
    });
    /**
     * @api {delete} /loginToken [登入令牌]-刪除
     * @apiDescription 刪除登入令牌
     * @apiGroup Account
     * @apiVersion 0.0.1
     * @apiParam {String} id 登入令牌編號
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/loginToken
     * Body:
     * {
     *   "id": 123456789
     * }
     * @apiSuccess (Success 200) {Number} deleteCount 刪除成功的登入令牌筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "deleteCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse ac_loginTokenNotFound
     * @apiUse db_dbNotReady
     */
    tokenRouter.delete('/loginToken', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:237', 400);
        }
        else {
            try {
                let condition = {
                    where: ctx.request.body
                };
                let delcount = await LoginToken_1.LoginToken.destroy(condition);
                if (null !== delcount && undefined !== delcount) {
                    let res = {
                        deleteCount: delcount
                    };
                    ctx.body = res;
                    ctx.status = 200;
                    ctx.respond = true;
                }
                else {
                    ctx.throw('db.invalidParameters:254', 400);
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:258', 400);
            }
        }
    });
};
