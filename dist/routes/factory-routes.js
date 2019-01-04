"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Factory_1 = require("../database/models/Factory");
const dbquery_1 = require("../database/dbquery");
// export const accRouter = new KoaRouter();
exports.registerFactoryAPI = function (factoryRouter) {
    /**
     * @api {post} /factory/search [工廠]-查詢
     * @apiDescription 查詢符合條件的工廠，並將結果分頁回傳
     * @apiGroup Production
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number=0} [pageIndex] 頁碼
     * @apiParam {Number=100} [maxRows] 每一頁的最大筆數
     * @apiParam {Object} [sort] 將結果指定欄位排序。1是從小到大排序，-1是從大到小。可指定的欄位請參考: <a href="#factory">工廠欄位定義</a> <p> 例如根據<code>factoryID</code>從小到大排序就是：<code>{"factoryID":1}</code>
     * @apiParam {Object} [query] 查詢條件。可以指定欄位等於某個值，或是介於某個範圍。範圍用<code>[大於某值，小於某值]</code>來描述，範圍中的兩個值其中之一，可以設定為<code>null</code>，表示不指定，但不能兩者皆為<code>null</code><p> 例如想指定<code>factoryID</code>大於0的工廠就是：<code>{"factoryID": [0, null]}</code>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/factory/search
     * Body:
     * {
     *   "pageIndex": 0,
     *   "maxRows": 3,
     *   "sort": {
     *     "id": 1
     *   },
     *   "query": {
     *      "factoryID": "xxx"
     *   }
     * }
     * @apiSuccess (Success 200) {Number} pageIndex 目前的頁碼
     * @apiSuccess (Success 200) {Number} maxRows 每一頁的最大筆數
     * @apiSuccess (Success 200) {Number} totalPage 總頁數
     * @apiSuccess (Success 200) {Array} records 查詢的結果。各欄位定義請參考: <a href="#factory">工廠欄位定義</a>
     * @apiSuccessExample {json} Response Example
     * {
     *   "pageIndex": 1,
     *   "maxRows": 100,
     *   "totalPage": 2,
     *   "records": [{
     *     "factoryID": "xxxx",
     *     "name": "oooo",
     *     ...
     *     },
     *     ...
     *   ]
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    factoryRouter.post('/factory/search', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:63', 400);
        }
        else {
            let resp = dbquery_1.queryResponsePacket(ctx.request.body);
            //let countQuery = queryTotalCount < Factory > (ctx.request.body);
            //let query = queryDBGenerator < Factory > (ctx.request.body);
            let query = dbquery_1.queryDBGeneratorEx(ctx.request.body, Factory_1.factoryJoin);
            try {
                let orderdocInfo = await Factory_1.Factory.findAndCount(query);
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
                    let count = await Factory.count(countQuery);
                    if (0 === count) {
                        resp.totalPage = 0;
                    } else if (resp.maxRows > 0) {
                        resp.totalPage = Math.ceil(count / resp.maxRows);
                    } else {
                        resp.totalPage = 1;
                    }
    
                    if (undefined === query.offset || (query.offset && query.offset < count)) {
                        let facdoclist = await Factory.findAll(query);
                        if (facdoclist && facdoclist.length > 0) {
                            facdoclist.map((item) => {
                                resp.records.push(item.toJSON());
                            });
                        }
                    }*/
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
     * @api {post} /factory [工廠]-新增
     * @apiDescription 新增工廠
     * @apiGroup Production
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {String} factoryID 帳號
     * @apiParam {String} name 名稱
     * @apiParam {Mix} [others] 其他欄位，請參考: <a href="#factory">工廠欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/factory
     * Body:
     * {
     *   "factoryID": "xxxx",
     *   "name": "oooo",
     *   ...........
     * }
     * @apiSuccess (Success 200) {String} id 工廠的資料庫唯一ID，可以拿來查詢或是修改使用
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "id": "5b6d0d03993dc24293de551c"
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    factoryRouter.post('/factory', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:128', 400);
        }
        else {
            try {
                let fac = new Factory_1.Factory(ctx.request.body);
                let facData = await fac.save();
                if (facData && facData.id) {
                    let res = {
                        id: facData.id
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
     * @api {post} /factory/update [工廠]-修改
     * @apiDescription 修改工廠資料
     * @apiGroup Production
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Object} condition 符合此條件的工廠會被修改
     * @apiParam {Number} condition.id 工廠編號，目前只開放依照工廠編號修改，將來若有需要批次修改的，再增加欄位
     * @apiParam {Object} update 欲修改的欄位
     * @apiParam {ooo} update.xxx 只需要填欲修改的欄位，沒有要修改的就不用填。欄位請參考: <a href="#factory">工廠欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/factory/update
     * Body:
     * {
     *   "condition": {
     *     id: 123456,
     *   },
     *   "update": {
     *     "address": "xxxx"
     *     ...........
     *   }
     * }
     * @apiSuccess (Success 200) {Number} updateCount 修改成功的工廠筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "updateCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    factoryRouter.post('/factory/update', async (ctx) => {
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
                let updateres = await Factory_1.Factory.update(ctx.request.body.update, query);
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
     * @api {delete} /factory [工廠]-刪除
     * @apiDescription 刪除工廠
     * @apiGroup Production
     * @apiVersion 0.0.1
     * @apiParam {Number} id 工廠編號
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/factory
     * Body:
     * {
     *   "id": 123456
     * }
     * @apiSuccess (Success 200) {Number} deleteCount 刪除成功的工廠筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "deleteCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    factoryRouter.delete('/factory', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:239', 400);
        }
        else {
            try {
                let condition = {
                    where: ctx.request.body
                };
                let delcount = await Factory_1.Factory.destroy(condition);
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
