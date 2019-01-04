"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const HeadCloth_1 = require("../database/models/HeadCloth");
const dbquery_1 = require("../database/dbquery");
// export const accRouter = new KoaRouter();
exports.regiterHeadClothAPI = function (headClRouter) {
    /**
     * @api {post} /headCloth/search [機頭布]-查詢
     * @apiDescription 查詢符合條件的機頭布，並將結果分頁回傳
     * @apiGroup Crop
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number=0} [pageIndex] 頁碼
     * @apiParam {Number=100} [maxRows] 每一頁的最大筆數
     * @apiParam {Object} [sort] 將結果指定欄位排序。1是從小到大排序，-1是從大到小。可指定的欄位請參考: <a href="#headCloth">機頭布欄位定義</a> <p> 例如根據<code>length</code>從小到大排序就是：<code>{"length":1}</code>
     * @apiParam {Object} [query] 查詢條件。可以指定欄位等於某個值，或是介於某個範圍。範圍用<code>[大於某值，小於某值]</code>來描述，範圍中的兩個值其中之一，可以設定為<code>null</code>，表示不指定，但不能兩者皆為<code>null</code><p> 例如想指定<code>length</code>大於0的機頭布就是：<code>{"length": [0, null]}</code>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/headCloth/search
     * Body:
     * {
     *   "pageIndex": 0,
     *   "maxRows": 3,
     *   "sort": {
     *     "id": 1
     *   },
     *   "query": {
     *      "length": 12
     *   }
     * }
     * @apiSuccess (Success 200) {Number} pageIndex 目前的頁碼
     * @apiSuccess (Success 200) {Number} maxRows 每一頁的最大筆數
     * @apiSuccess (Success 200) {Number} totalPage 總頁數
     * @apiSuccess (Success 200) {Array} records 查詢的結果。各欄位定義請參考: <a href="#headCloth">機頭布欄位定義</a>
     * @apiSuccessExample {json} Response Example
     * {
     *   "pageIndex": 1,
     *   "maxRows": 100,
     *   "totalPage": 2,
     *   "records": [{
     *     "orderDeliveryPlan": 1002,
     *     "length": 12,
     *     "changeLength": 12,
     *     ...
     *     },
     *     ...
     *   ]
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    headClRouter.post('/headCloth/search', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:63', 400);
        }
        else {
            let resp = dbquery_1.queryResponsePacket(ctx.request.body);
            //let countQuery = queryTotalCount < HeadCloth > (ctx.request.body);
            //let query = queryDBGenerator < HeadCloth > (ctx.request.body);
            let query = dbquery_1.queryDBGeneratorEx(ctx.request.body, HeadCloth_1.headClothJoin);
            try {
                let orderdocInfo = await HeadCloth_1.HeadCloth.findAndCount(query);
                let count = orderdocInfo.count;
                // let count = await Order.count(countQuery);
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
                    let count = await HeadCloth.count(countQuery);
                    if (0 === count) {
                        resp.totalPage = 0;
                    } else if (resp.maxRows > 0) {
                        resp.totalPage = Math.ceil(count / resp.maxRows);
                    } else {
                        resp.totalPage = 1;
                    }
    
                    if (undefined === query.offset || (query.offset && query.offset < count)) {
                        let hcdoclist = await HeadCloth.findAll(query);
                        if (hcdoclist && hcdoclist.length > 0) {
                            hcdoclist.map((item) => {
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
     * @api {post} /headCloth [機頭布]-新增
     * @apiDescription 新增機頭布
     * @apiGroup Crop
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number} orderDeliveryPlan 訂單交付計畫編號
     * @apiParam {Number} length 長度
     * @apiParam {Number} changeLength 換片長度
     * @apiParam {Mix} [others] 其他欄位，請參考: <a href="#headCloth">機頭布欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/headCloth
     * Body:
     * {
     *   "orderDeliveryPlan": 1002,
     *   "length": 12,
     *   "changeLength": 12,
     *   ...........
     * }
     * @apiSuccess (Success 200) {String} id 機頭布的資料庫唯一ID，可以拿來查詢或是修改使用
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "id": "5b6d0d03993dc24293de551c"
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    headClRouter.post('/headCloth', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:128', 400);
        }
        else {
            try {
                let hc = new HeadCloth_1.HeadCloth(ctx.request.body);
                let hcData = await hc.save();
                if (hcData && hcData.id) {
                    let res = {
                        id: hcData.id
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
     * @api {post} /headCloth/update [機頭布]-修改
     * @apiDescription 修改機頭布資料
     * @apiGroup Crop
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Object} condition 符合此條件的機頭布會被修改
     * @apiParam {Number} condition.id 機頭布編號，目前只開放依照機頭布編號修改，將來若有需要批次修改的，再增加欄位
     * @apiParam {Object} update 欲修改的欄位
     * @apiParam {ooo} update.xxx 只需要填欲修改的欄位，沒有要修改的就不用填。欄位請參考: <a href="#headCloth">機頭布欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/headCloth/update
     * Body:
     * {
     *   "condition": {
     *     id: 123456,
     *   },
     *   "update": {
     *     "length": 200,
     *     ...........
     *   }
     * }
     * @apiSuccess (Success 200) {Number} updateCount 修改成功的機頭布筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "updateCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    headClRouter.post('/headCloth/update', async (ctx) => {
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
                let updateres = await HeadCloth_1.HeadCloth.update(ctx.request.body.update, query);
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
     * @api {delete} /headCloth [機頭布]-刪除
     * @apiDescription 刪除機頭布
     * @apiGroup Crop
     * @apiVersion 0.0.1
     * @apiParam {Number} id 機頭布編號
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/headCloth
     * Body:
     * {
     *   "id": 123456
     * }
     * @apiSuccess (Success 200) {Number} deleteCount 刪除成功的機頭布筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "deleteCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    headClRouter.delete('/headCloth', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:239', 400);
        }
        else {
            try {
                let condition = {
                    where: ctx.request.body
                };
                let delcount = await HeadCloth_1.HeadCloth.destroy(condition);
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
