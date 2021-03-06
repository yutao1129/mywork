"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const StylePartCard_1 = require("../database/models/StylePartCard");
const dbquery_1 = require("../database/dbquery");
// export const accRouter = new KoaRouter();
exports.registerStylePartCardAPI = function (stylePartCardRouter) {
    /**
     * @api {post} /stylePartCard/search [款式/制卡部件]-查詢
     * @apiDescription 查詢符合條件的款式制卡部件，並將結果分頁回傳
     * @apiGroup Style
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number=0} [pageIndex] 頁碼
     * @apiParam {Number=100} [maxRows] 每一頁的最大筆數
     * @apiParam {Object} [sort] 將結果指定欄位排序。1是從小到大排序，-1是從大到小。可指定的欄位請參考: <a href="#stylePartCard">款式制卡部件欄位定義</a> <p> 例如根據<code>id</code>從小到大排序就是：<code>{"id":1}</code>
     * @apiParam {Object} [query] 查詢條件。可以指定欄位等於某個值，或是介於某個範圍。範圍用<code>[大於某值，小於某值]</code>來描述，範圍中的兩個值其中之一，可以設定為<code>null</code>，表示不指定，但不能兩者皆為<code>null</code><p> 例如想指定<code>id</code>大於0的款式制卡部件就是：<code>{"id": [0, null]}</code>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/stylePartCard/search
     * Body:
     * {
     *   "pageIndex": 0,
     *   "maxRows": 3,
     *   "sort": {
     *     "id": 1
     *   },
     *   "query": {
     *      "partCard": 123
     *   }
     * }
     * @apiSuccess (Success 200) {Number} pageIndex 目前的頁碼
     * @apiSuccess (Success 200) {Number} maxRows 每一頁的最大筆數
     * @apiSuccess (Success 200) {Number} totalPage 總頁數
     * @apiSuccess (Success 200) {Array} records 查詢的結果。各欄位定義請參考: <a href="#stylePartCard">款式制卡部件欄位定義</a>
     * @apiSuccessExample {json} Response Example
     * {
     *   "pageIndex": 1,
     *   "maxRows": 100,
     *   "totalPage": 2,
     *   "records": [{
     *     "partCard": 123,
     *     "style": 125
     *   },
     *     ...
     *   ]
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    stylePartCardRouter.post('/stylePartCard/search', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:63', 400);
        }
        else {
            let resp = dbquery_1.queryResponsePacket(ctx.request.body);
            //let countQuery = queryTotalCount < StylePartCard > (ctx.request.body);
            //let query = queryDBGenerator < StylePartCard > (ctx.request.body);
            let query = dbquery_1.queryDBGeneratorEx(ctx.request.body, StylePartCard_1.stylePartCardJoin);
            try {
                let styleOpdoclist = await StylePartCard_1.StylePartCard.findAndCount(query);
                let count = styleOpdoclist.count;
                if (0 === count) {
                    resp.totalPage = 0;
                }
                else if (resp.maxRows > 0) {
                    resp.totalPage = Math.ceil(count / resp.maxRows);
                }
                else {
                    resp.totalPage = 1;
                }
                if (styleOpdoclist && styleOpdoclist.rows) {
                    for (let item of styleOpdoclist.rows) {
                        resp.records.push(item.toJSON());
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
     * @api {post} /stylePartCard [款式/制卡部件]-新增
     * @apiDescription 新增款式制卡部件
     * @apiGroup Style
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {String} style 款號
     * @apiParam {Numner} partCard 制卡部件編號
     * @apiParam {Mix} [others] 其他欄位，請參考: <a href="#stylePartCard">款式制卡部件欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/stylePartCard
     * Body:
     * {
     *   "style": "xxxx",
     *   "partCard": 123,
     *   ...........
     * }
     * @apiSuccess (Success 200) {String} id 款式制卡部件的資料庫唯一ID，可以拿來查詢或是修改使用
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "id": "5b6d0d03993dc24293de551c"
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    stylePartCardRouter.post('/stylePartCard', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:127', 400);
        }
        else {
            try {
                let styleOp = new StylePartCard_1.StylePartCard(ctx.request.body);
                let styleOpData = await styleOp.save();
                if (styleOpData && styleOpData.id) {
                    let res = {
                        id: styleOpData.id
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
     * @api {post} /stylePartCard/update [款式/制卡部件]-修改
     * @apiDescription 修改款式制卡部件資料
     * @apiGroup Style
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Object} condition 符合此條件的款式制卡部件會被修改
     * @apiParam {Number} condition.id 款式制卡部件編號，目前只開放依照款式制卡部件編號修改，將來若有需要批次修改的，再增加欄位
     * @apiParam {Object} update 欲修改的欄位
     * @apiParam {ooo} update.xxx 只需要填欲修改的欄位，沒有要修改的就不用填。欄位請參考: <a href="#stylePartCard">款式制卡部件欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/stylePartCard/update
     * Body:
     * {
     *   "condition": {
     *     "id": 123456,
     *   },
     *   "update": {
     *     "partCard": 123,
     *     ...........
     *   }
     * }
     * @apiSuccess (Success 200) {Number} updateCount 修改成功的款式制卡部件筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "updateCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    stylePartCardRouter.post('/stylePartCard/update', async (ctx) => {
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
                let updateres = await StylePartCard_1.StylePartCard.update(ctx.request.body.update, query);
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
     * @api {delete} /stylePartCard [款式/制卡部件]-刪除
     * @apiDescription 刪除款式制卡部件
     * @apiGroup Style
     * @apiVersion 0.0.1
     * @apiParam {Number} id 款式制卡部件編號
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/stylePartCard
     * Body:
     * {
     *   "id": 123456
     * }
     * @apiSuccess (Success 200) {Number} deleteCount 刪除成功的款式制卡部件筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "deleteCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    stylePartCardRouter.delete('/stylePartCard', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:239', 400);
        }
        else {
            try {
                let condition = {
                    where: ctx.request.body
                };
                let delcount = await StylePartCard_1.StylePartCard.destroy(condition);
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
