"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const OrderDeliveryPlan_1 = require("../database/models/OrderDeliveryPlan");
const dbquery_1 = require("../database/dbquery");
// export const accRouter = new KoaRouter();
exports.registerOrderDelivPlanAPI = function (orderDelivRouter) {
    /**
     * @api {post} /orderDeliveryPlan/search [訂單交付計畫]-查詢
     * @apiDescription 查詢符合條件的訂單交付計畫，並將結果分頁回傳
     * @apiGroup Order
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number=0} [pageIndex] 頁碼
     * @apiParam {Number=100} [maxRows] 每一頁的最大筆數
     * @apiParam {Object} [sort] 將結果指定欄位排序。1是從小到大排序，-1是從大到小。可指定的欄位請參考: <a href="#orderDeliveryPlan">訂單交付計畫欄位定義</a> <p> 例如根據<code>id</code>從小到大排序就是：<code>{"id":1}</code>
     * @apiParam {Object} [query] 查詢條件。可以指定欄位等於某個值，或是介於某個範圍。範圍用<code>[大於某值，小於某值]</code>來描述，範圍中的兩個值其中之一，可以設定為<code>null</code>，表示不指定，但不能兩者皆為<code>null</code><p> 例如想指定<code>id</code>大於0的訂單交付計畫就是：<code>{"id": [0, null]}</code>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/orderDeliveryPlan/search
     * Body:
     * {
     *   "pageIndex": 0,
     *   "maxRows": 3,
     *   "sort": {
     *     "id": 1
     *   },
     *   "query": {
     *      "totalAmount": 1000
     *   }
     * }
     * @apiSuccess (Success 200) {Number} pageIndex 目前的頁碼
     * @apiSuccess (Success 200) {Number} maxRows 每一頁的最大筆數
     * @apiSuccess (Success 200) {Number} totalPage 總頁數
     * @apiSuccess (Success 200) {Array} records 查詢的結果。各欄位定義請參考: <a href="#orderDeliveryPlan">訂單交付計畫欄位定義</a>
     * @apiSuccessExample {json} Response Example
     * {
     *   "pageIndex": 1,
     *   "maxRows": 100,
     *   "totalPage": 2,
     *   "records": [{
     *     "totalAmount": 1000,
     *     "colorCode": 100,
     *     "size": 111,
     *     "deliveryDate": "2000-01-01T00:00:00+08:00",
     *     ...
     *     },
     *     ...
     *   ]
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    orderDelivRouter.post('/orderDeliveryPlan/search', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:65', 400);
        }
        else {
            let resp = dbquery_1.queryResponsePacket(ctx.request.body);
            //let countQuery = queryTotalCount < OrderDeliveryPlan > (ctx.request.body);
            //let query = queryDBGenerator < OrderDeliveryPlan > (ctx.request.body);
            let query = dbquery_1.queryDBGeneratorEx(ctx.request.body, OrderDeliveryPlan_1.orderDeliveryPlanJoin);
            try {
                let orderdocInfo = await OrderDeliveryPlan_1.OrderDeliveryPlan.findAndCount(query);
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
                    let count = await OrderDeliveryPlan.count(countQuery);
                    if (0 === count) {
                        resp.totalPage = 0;
                    } else if (resp.maxRows > 0) {
                        resp.totalPage = Math.ceil(count / resp.maxRows);
                    } else {
                        resp.totalPage = 1;
                    }
    
                    if (undefined === query.offset || (query.offset && query.offset < count)) {
                        let orderdevdoclist = await OrderDeliveryPlan.findAll(query);
                        if (orderdevdoclist && orderdevdoclist.length > 0) {
                            orderdevdoclist.map((item) => {
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
                ctx.throw('db.invalidQuery:95', 400);
            }
        }
    });
    /**
     * @api {post} /orderDeliveryPlan [訂單交付計畫]-新增
     * @apiDescription 新增訂單交付計畫
     * @apiGroup Order
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number} order 訂單編號
     * @apiParam {Number} colorCode 色號編號
     * @apiParam {Number} size 尺碼編號
     * @apiParam {Date} deliveryDate 訂單交期
     * @apiParam {String} deliveryRegion 交地
     * @apiParam {Number} totalAmount 總量
     * @apiParam {Mix} [others] 其他欄位，請參考: <a href="#orderDeliveryPlan">訂單交付計畫欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/orderDeliveryPlan
     * Body:
     * {
     *   "totalAmount": 1000,
     *   "colorCode": 100,
     *   "size": 111,
     *   "deliveryDate": "2000-01-01T00:00:00+08:00",
     *   ..........
     * }
     * @apiSuccess (Success 200) {String} id 訂單交付計畫的資料庫唯一ID，可以拿來查詢或是修改使用
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "id": "5b6d0d03993dc24293de551c"
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    orderDelivRouter.post('/orderDeliveryPlan', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:127', 400);
        }
        else {
            try {
                let orderdeli = new OrderDeliveryPlan_1.OrderDeliveryPlan(ctx.request.body);
                let orderdelidata = await orderdeli.save();
                if (orderdelidata && orderdelidata.id) {
                    let res = {
                        id: orderdelidata.id
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
     * @api {post} /orderDeliveryPlan/update [訂單交付計畫]-修改
     * @apiDescription 修改訂單交付計畫資料
     * @apiGroup Order
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Object} condition 符合此條件的訂單交付計畫會被修改
     * @apiParam {String} condition.id 訂單交付計畫編號，目前只開放依照訂單交付計畫編號修改，將來若有需要批次修改的，再增加欄位
     * @apiParam {Object} update 欲修改的欄位
     * @apiParam {ooo} update.xxx 只需要填欲修改的欄位，沒有要修改的就不用填。欄位請參考: <a href="#orderDeliveryPlan">訂單交付計畫欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/orderDeliveryPlan/update
     * Body:
     * {
     *   "condition": {
     *     "id": 123456,
     *   },
     *   "update": {
     *     "totalAmount": 1000,
     *     "colorCode": 100,
     *     "size": 111,
     *     "deliveryDate": "2000-01-01T00:00:00+08:00",
     *   }
     * }
     * @apiSuccess (Success 200) {Number} updateCount 修改成功的訂單交付計畫筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "updateCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    orderDelivRouter.post('/orderDeliveryPlan/update', async (ctx) => {
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
                let updateres = await OrderDeliveryPlan_1.OrderDeliveryPlan.update(ctx.request.body.update, query);
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
     * @api {delete} /orderDeliveryPlan [訂單交付計畫]-刪除
     * @apiDescription 刪除訂單交付計畫
     * @apiGroup Order
     * @apiVersion 0.0.1
     * @apiParam {String} id 訂單交付計畫編號
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/orderDeliveryPlan
     * Body:
     * {
     *   "id": 123456
     * }
     * @apiSuccess (Success 200) {Number} deleteCount 刪除成功的訂單交付計畫筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "deleteCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    orderDelivRouter.delete('/orderDeliveryPlan', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:238', 400);
        }
        else {
            try {
                let condition = {
                    where: ctx.request.body
                };
                let delcount = await OrderDeliveryPlan_1.OrderDeliveryPlan.destroy(condition);
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
    /**
     * @api {post} /orderDeliveryPlan/bulk [訂單交付計畫]-新增多筆
     * @apiDescription 新增多筆訂單交付計畫
     * @apiGroup Order
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number} order 訂單編號
     * @apiParam {Number} colorCode 色號編號
     * @apiParam {Number} size 尺碼編號
     * @apiParam {Date} deliveryDate 訂單交期
     * @apiParam {String} deliveryRegion 交地
     * @apiParam {Number} totalAmount 總量
     * @apiParam {Mix} [others] 其他欄位，請參考: <a href="#orderDeliveryPlan">訂單交付計畫欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/orderDeliveryPlan/bulk
     * Body:
     * [
     *   {
     *     "totalAmount": 1000,
     *     "colorCode": 100,
     *     "size": 111,
     *     "deliveryDate": "2000-01-01T00:00:00+08:00",
     *     ..........
     *   },
     *   {
     *     "totalAmount": 1000,
     *     "colorCode": 100,
     *     "size": 111,
     *     "deliveryDate": "2000-01-01T00:00:00+08:00",
     *     ..........
     *   },
     *   ....
     * ]
     * @apiSuccess (Success 200) {Array} id 訂單交付計畫的資料庫唯一ID，可以拿來查詢或是修改使用
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "id": [1,2,3]
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    orderDelivRouter.post('/orderDeliveryPlan/bulk', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:127', 400);
        }
        else {
            try {
                let orderdelidata = await OrderDeliveryPlan_1.OrderDeliveryPlan.bulkCreate(ctx.request.body);
                if (orderdelidata) {
                    let res = {
                        id: Array()
                    };
                    orderdelidata.map((item) => {
                        res.id.push(item.id);
                    });
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
};
