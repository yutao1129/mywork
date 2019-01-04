"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SewingTeamOutput_1 = require("../database/models/SewingTeamOutput");
const SewingTeamScheduling_1 = require("../database/models/SewingTeamScheduling");
const dbquery_1 = require("../database/dbquery");
// export const accRouter = new KoaRouter();
exports.registerSewingTeamOutAPI = function (sewingTeamOutRouter) {
    /**
     * @apiIgnore disabled
     * @api {post} /sewingTeamOutput/search [車縫班組排產]-查詢
     * @apiDescription 查詢符合條件的車縫班組排產，並將結果分頁回傳
     * @apiGroup Production
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number=0} [pageIndex] 頁碼
     * @apiParam {Number=100} [maxRows] 每一頁的最大筆數
     * @apiParam {Object} [sort] 將結果指定欄位排序。1是從小到大排序，-1是從大到小。可指定的欄位請參考: <a href="#sewingTeamOutput">車縫班組排產欄位定義</a> <p> 例如根據<code>id</code>從小到大排序就是：<code>{"id":1}</code>
     * @apiParam {Object} [query] 查詢條件。可以指定欄位等於某個值，或是介於某個範圍。範圍用<code>[大於某值，小於某值]</code>來描述，範圍中的兩個值其中之一，可以設定為<code>null</code>，表示不指定，但不能兩者皆為<code>null</code><p> 例如想指定<code>id</code>大於0的車縫班組排產就是：<code>{"id": [0, null]}</code>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/sewingTeamOutput/search
     * Body:
     * {
     *   "pageIndex": 0,
     *   "maxRows": 3,
     *   "sort": {
     *     "id": 1
     *   },
     *   "query": {
     *      "amount": 3000
     *   }
     * }
     * @apiSuccess (Success 200) {Number} pageIndex 目前的頁碼
     * @apiSuccess (Success 200) {Number} maxRows 每一頁的最大筆數
     * @apiSuccess (Success 200) {Number} totalPage 總頁數
     * @apiSuccess (Success 200) {Array} records 查詢的結果。各欄位定義請參考: <a href="#sewingTeamOutput">車縫班組排產欄位定義</a>
     * @apiSuccessExample {json} Response Example
     * {
     *   "pageIndex": 1,
     *   "maxRows": 100,
     *   "totalPage": 2,
     *   "records": [{
     *     "sewingTeamOutput": 1111,
     *     "date": "2000-01-01T00:00:00+08:00",
     *     "amount": 3000,
     *     "productCategory": "xxx",
     *     "capacity": 100,
     *     "efficiency": 10,
     *     ...
     *     },
     *     ...
     *   ]
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    sewingTeamOutRouter.post('/sewingTeamOutput/search', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:63', 400);
        }
        else {
            let resp = dbquery_1.queryResponsePacket(ctx.request.body);
            let countQuery = dbquery_1.queryTotalCount(ctx.request.body);
            let query = dbquery_1.queryDBGenerator(ctx.request.body);
            try {
                let count = await SewingTeamOutput_1.SewingTeamOutput.count(countQuery);
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
                    let outputdoclist = await SewingTeamOutput_1.SewingTeamOutput.findAll(query);
                    if (outputdoclist && outputdoclist.length > 0) {
                        for (let item of outputdoclist) {
                            let itemFmt = item.toJSON();
                            if (itemFmt.sewingTeamScheduling) {
                                let sch = await SewingTeamScheduling_1.SewingTeamScheduling.findById(itemFmt.sewingTeamScheduling);
                                if (sch) {
                                    itemFmt.sewingTeamScheduling = sch.toJSON();
                                }
                            }
                            resp.records.push(itemFmt);
                        }
                    }
                }
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
     * @apiIgnore disabled
     * @api {post} /sewingTeamOutput [車縫班組排產]-新增
     * @apiDescription 新增車縫班組排產
     * @apiGroup Production
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number} sewingTeamOutput 車縫班組排產編號
     * @apiParam {Number} amount 完成數量
     * @apiParam {Date} date 生產日期
     * @apiParam {Number} productCategory 品類
     * @apiParam {Number} capacity 平均產能
     * @apiParam {Number} efficiency 效率
     * @apiParam {Mix} [others] 其他欄位，請參考: <a href="#sewingTeamOutput">車縫班組排產欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/sewingTeamOutput
     * Body:
     * {
     *   "sewingTeamOutput": 1111,
     *   "date": "2000-01-01T00:00:00+08:00",
     *   "amount": 3000,
     *   "productCategory": "xxx",
     *   "capacity": 100,
     *   "efficiency": 10,
     *   ...........
     * }
     * @apiSuccess (Success 200) {String} id 車縫班組排產的資料庫唯一ID，可以拿來查詢或是修改使用
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "id": "5b6d0d03993dc24293de551c"
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    sewingTeamOutRouter.post('/sewingTeamOutput', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:129', 400);
        }
        else {
            try {
                let prod = new SewingTeamOutput_1.SewingTeamOutput(ctx.request.body);
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
     * @apiIgnore disabled
     * @api {post} /sewingTeamOutput/update [車縫班組排產]-修改
     * @apiDescription 修改車縫班組排產資料
     * @apiGroup Production
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Object} condition 符合此條件的車縫班組排產會被修改
     * @apiParam {Number} condition.id 車縫班組排產編號，目前只開放依照車縫班組排產編號修改，將來若有需要批次修改的，再增加欄位
     * @apiParam {Object} update 欲修改的欄位
     * @apiParam {ooo} update.xxx 只需要填欲修改的欄位，沒有要修改的就不用填。欄位請參考: <a href="#sewingTeamOutput">車縫班組排產欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/sewingTeamOutput/update
     * Body:
     * {
     *   "condition": {
     *     id: 123456,
     *   },
     *   "update": {
     *     "amount": 1000,
     *     ...........
     *   }
     * }
     * @apiSuccess (Success 200) {Number} updateCount 修改成功的車縫班組排產筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "updateCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    sewingTeamOutRouter.post('/sewingTeamOutput/update', async (ctx) => {
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
                let updateres = await SewingTeamOutput_1.SewingTeamOutput.update(ctx.request.body.update, query);
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
     * @apiIgnore disabled
     * @api {delete} /sewingTeamOutput [車縫班組排產]-刪除
     * @apiDescription 刪除車縫班組排產
     * @apiGroup Production
     * @apiVersion 0.0.1
     * @apiParam {Number} id 車縫班組排產編號
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/sewingTeamOutput
     * Body:
     * {
     *   "id": 123456
     * }
     * @apiSuccess (Success 200) {Number} deleteCount 刪除成功的車縫班組排產筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "deleteCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    sewingTeamOutRouter.delete('/sewingTeamOutput', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:238', 400);
        }
        else {
            try {
                let condition = {
                    where: ctx.request.body
                };
                let delcount = await SewingTeamOutput_1.SewingTeamOutput.destroy(condition);
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
