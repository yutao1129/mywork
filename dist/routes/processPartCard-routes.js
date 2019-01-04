"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ProcessPartCard_1 = require("../database/models/ProcessPartCard");
const dbquery_1 = require("../database/dbquery");
// export const accRouter = new KoaRouter();
exports.registerProcessPartCardAPI = function (processPartCardRouter) {
    /**
     * @api {post} /processPartCard/search [工序/制卡部件]-查詢
     * @apiDescription 查詢符合條件的工序制卡部件，並將結果分頁回傳
     * @apiGroup Process
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number=0} [pageIndex] 頁碼
     * @apiParam {Number=100} [maxRows] 每一頁的最大筆數
     * @apiParam {Object} [sort] 將結果指定欄位排序。1是從小到大排序，-1是從大到小。可指定的欄位請參考: <a href="#processPartCard">工序制卡部件欄位定義</a> <p> 例如根據<code>id</code>從小到大排序就是：<code>{"id":1}</code>
     * @apiParam {Object} [query] 查詢條件。可以指定欄位等於某個值，或是介於某個範圍。範圍用<code>[大於某值，小於某值]</code>來描述，範圍中的兩個值其中之一，可以設定為<code>null</code>，表示不指定，但不能兩者皆為<code>null</code><p> 例如想指定<code>id</code>大於0的工序制卡部件就是：<code>{"id": [0, null]}</code>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/processPartCard/search
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
     * @apiSuccess (Success 200) {Array} records 查詢的結果。各欄位定義請參考: <a href="#processPartCard">工序制卡部件欄位定義</a>
     * @apiSuccessExample {json} Response Example
     * {
     *   "pageIndex": 1,
     *   "maxRows": 100,
     *   "totalPage": 2,
     *   "records": [{
     *     "partCard": 123,
     *     "process": 125
     *   },
     *     ...
     *   ]
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    processPartCardRouter.post('/processPartCard/search', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:63', 400);
        }
        else {
            let resp = dbquery_1.queryResponsePacket(ctx.request.body);
            //let countQuery = queryTotalCount < ProcessPartCard > (ctx.request.body);
            //let query = queryDBGenerator < ProcessPartCard > (ctx.request.body);
            let query = dbquery_1.queryDBGeneratorEx(ctx.request.body, ProcessPartCard_1.processPartCardJoin);
            try {
                let processOpdoclist = await ProcessPartCard_1.ProcessPartCard.findAndCount(query);
                let count = processOpdoclist.count;
                if (0 === count) {
                    resp.totalPage = 0;
                }
                else if (resp.maxRows > 0) {
                    resp.totalPage = Math.ceil(count / resp.maxRows);
                }
                else {
                    resp.totalPage = 1;
                }
                if (processOpdoclist && processOpdoclist.rows) {
                    for (let item of processOpdoclist.rows) {
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
     * @api {post} /processPartCard [工序/制卡部件]-新增
     * @apiDescription 新增工序制卡部件
     * @apiGroup Process
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {String} process 款號
     * @apiParam {Numner} partCard 制卡部件編號
     * @apiParam {Mix} [others] 其他欄位，請參考: <a href="#processPartCard">工序制卡部件欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/processPartCard
     * Body:
     * {
     *   "process": "xxxx",
     *   "partCard": 123,
     *   ...........
     * }
     * @apiSuccess (Success 200) {String} id 工序制卡部件的資料庫唯一ID，可以拿來查詢或是修改使用
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "id": "5b6d0d03993dc24293de551c"
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    processPartCardRouter.post('/processPartCard', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:127', 400);
        }
        else {
            try {
                let processOp = new ProcessPartCard_1.ProcessPartCard(ctx.request.body);
                let processOpData = await processOp.save();
                if (processOpData && processOpData.id) {
                    let res = {
                        id: processOpData.id
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
     * @api {post} /processPartCard/update [工序/制卡部件]-修改
     * @apiDescription 修改工序制卡部件資料
     * @apiGroup Process
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Object} condition 符合此條件的工序制卡部件會被修改
     * @apiParam {Number} condition.id 工序制卡部件編號，目前只開放依照工序制卡部件編號修改，將來若有需要批次修改的，再增加欄位
     * @apiParam {Object} update 欲修改的欄位
     * @apiParam {ooo} update.xxx 只需要填欲修改的欄位，沒有要修改的就不用填。欄位請參考: <a href="#processPartCard">工序制卡部件欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/processPartCard/update
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
     * @apiSuccess (Success 200) {Number} updateCount 修改成功的工序制卡部件筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "updateCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    processPartCardRouter.post('/processPartCard/update', async (ctx) => {
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
                let updateres = await ProcessPartCard_1.ProcessPartCard.update(ctx.request.body.update, query);
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
     * @api {delete} /processPartCard [工序/制卡部件]-刪除
     * @apiDescription 刪除工序制卡部件
     * @apiGroup Process
     * @apiVersion 0.0.1
     * @apiParam {Number} id 工序制卡部件編號
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/processPartCard
     * Body:
     * {
     *   "id": 123456
     * }
     * @apiSuccess (Success 200) {Number} deleteCount 刪除成功的工序制卡部件筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "deleteCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    processPartCardRouter.delete('/processPartCard', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:239', 400);
        }
        else {
            try {
                let condition = {
                    where: ctx.request.body
                };
                let delcount = await ProcessPartCard_1.ProcessPartCard.destroy(condition);
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
