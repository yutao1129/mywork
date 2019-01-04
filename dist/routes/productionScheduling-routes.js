"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ProductionScheduling_1 = require("../database/models/ProductionScheduling");
const PrecedingTeamScheduling_1 = require("../database/models/PrecedingTeamScheduling");
const SewingTeamScheduling_1 = require("../database/models/SewingTeamScheduling");
const FollowingTeamScheduling_1 = require("../database/models/FollowingTeamScheduling");
const dbquery_1 = require("../database/dbquery");
// export const accRouter = new KoaRouter();
exports.registerProdScheduleAPI = function (prodSchedRouter) {
    /**
     * @api {post} /productionScheduling/search [生產排產]-查詢
     * @apiDescription 查詢符合條件的生產排產，並將結果分頁回傳
     * @apiGroup Production
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number=0} [pageIndex] 頁碼
     * @apiParam {Number=100} [maxRows] 每一頁的最大筆數
     * @apiParam {Object} [sort] 將結果指定欄位排序。1是從小到大排序，-1是從大到小。可指定的欄位請參考: <a href="#productionScheduling">生產排產欄位定義</a> <p> 例如根據<code>id</code>從小到大排序就是：<code>{"id":1}</code>
     * @apiParam {Object} [query] 查詢條件。可以指定欄位等於某個值，或是介於某個範圍。範圍用<code>[大於某值，小於某值]</code>來描述，範圍中的兩個值其中之一，可以設定為<code>null</code>，表示不指定，但不能兩者皆為<code>null</code><p> 例如想指定<code>id</code>大於0的生產排產就是：<code>{"id": [0, null]}</code>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/productionScheduling/search
     * Body:
     * {
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
     * @apiSuccess (Success 200) {Array} records 查詢的結果。各欄位定義請參考: <a href="#productionScheduling">生產排產欄位定義</a>
     * @apiSuccessExample {json} Response Example
     * {
     *   "pageIndex": 1,
     *   "maxRows": 100,
     *   "totalPage": 2,
     *   "records": [{
     *     "orderDeliveryPlan": 1111,
     *     "factory": 2222,
     *     "amount": 3000,
     *     ...
     *     },
     *     ...
     *   ]
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    prodSchedRouter.post('/productionScheduling/search', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:63', 400);
        }
        else {
            let resp = dbquery_1.queryResponsePacket(ctx.request.body);
            //let countQuery = queryTotalCount < ProductionScheduling > (ctx.request.body);
            //let query = queryDBGenerator < ProductionScheduling > (ctx.request.body);
            let query = dbquery_1.queryDBGeneratorEx(ctx.request.body, ProductionScheduling_1.productionSchedulingJoin);
            try {
                let orderdocInfo = await ProductionScheduling_1.ProductionScheduling.findAndCount(query);
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
                    let count = await ProductionScheduling.count(countQuery);
                    if (0 === count) {
                        resp.totalPage = 0;
                    } else if (resp.maxRows > 0) {
                        resp.totalPage = Math.ceil(count / resp.maxRows);
                    } else {
                        resp.totalPage = 1;
                    }
    
                    if (undefined === query.offset || (query.offset && query.offset < count)) {
                        let schdoclist = await ProductionScheduling.findAll(query);
                        if (schdoclist && schdoclist.length > 0) {
                            for (let item of schdoclist) {
                                let itemFmt = item.toJSON();
                                if (itemFmt.orderDeliveryPlan) {
                                    let ord = await OrderDeliveryPlan.findById(itemFmt.orderDeliveryPlan);
                                    if (ord) {
                                        itemFmt.orderDeliveryPlan = ord.toJSON();
                                    }
                                }
                                if (itemFmt.factory) {
                                    let fac = await Factory.findById(item.factory);
                                    if (fac) {
                                        itemFmt.factory = fac.toJSON();
                                    }
                                }
    
                                resp.records.push(itemFmt);
                            }
                        }
                    }*/
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
     * @api {post} /productionScheduling [生產排產]-新增
     * @apiDescription 新增生產排產
     * @apiGroup Production
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number} orderDeliveryPlan 班組編號
     * @apiParam {Number} factory 工廠編號
     * @apiParam {Number} amount 分派數量
     * @apiParam {Mix} [others] 其他欄位，請參考: <a href="#productionScheduling">生產排產欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/productionScheduling
     * Body:
     * {
     *   "orderDeliveryPlan": 1111,
     *   "factory": 2222,
     *   "amount": 3000,
     *   ...........
     * }
     * @apiSuccess (Success 200) {String} id 生產排產的資料庫唯一ID，可以拿來查詢或是修改使用
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "id": "5b6d0d03993dc24293de551c"
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    prodSchedRouter.post('/productionScheduling', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:129', 400);
        }
        else {
            try {
                let prod = new ProductionScheduling_1.ProductionScheduling(ctx.request.body);
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
     * @api {post} /productionScheduling/update [生產排產]-修改
     * @apiDescription 修改生產排產資料
     * @apiGroup Production
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Object} condition 符合此條件的生產排產會被修改
     * @apiParam {Number} condition.id 生產排產編號，目前只開放依照生產排產編號修改，將來若有需要批次修改的，再增加欄位
     * @apiParam {Object} update 欲修改的欄位
     * @apiParam {ooo} update.xxx 只需要填欲修改的欄位，沒有要修改的就不用填。欄位請參考: <a href="#productionScheduling">生產排產欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/productionScheduling/update
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
     * @apiSuccess (Success 200) {Number} updateCount 修改成功的生產排產筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "updateCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    prodSchedRouter.post('/productionScheduling/update', async (ctx) => {
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
                let updateres = await ProductionScheduling_1.ProductionScheduling.update(ctx.request.body.update, query);
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
     * @api {delete} /productionScheduling [生產排產]-刪除
     * @apiDescription 刪除生產排產
     * @apiGroup Production
     * @apiVersion 0.0.1
     * @apiParam {Number} id 生產排產編號
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/productionScheduling
     * Body:
     * {
     *   "id": 123456
     * }
     * @apiSuccess (Success 200) {Number} deleteCount 刪除成功的生產排產筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "deleteCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    prodSchedRouter.delete('/productionScheduling', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:238', 400);
        }
        else {
            try {
                let condition = {
                    where: ctx.request.body
                };
                let delcount = await ProductionScheduling_1.ProductionScheduling.destroy(condition);
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
     * @api {post} /productionScheduling/bulk [生產排產]-新增多筆
     * @apiDescription 新增多筆生產排產
     * @apiGroup Production
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number} orderDeliveryPlan 班組編號
     * @apiParam {Number} factory 工廠編號
     * @apiParam {Number} amount 分派數量
     * @apiParam {Mix} [others] 其他欄位，請參考: <a href="#productionScheduling">生產排產欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/productionScheduling/bulk
     * Body:
     * [
     *   {
     *     "orderDeliveryPlan": 1111,
     *     "factory": 2222,
     *     "amount": 3000,
     *     ...........
     *   },
     *   ......
     * ]
     * @apiSuccess (Success 200) {Array} id 生產排產的資料庫唯一ID，可以拿來查詢或是修改使用
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "id": [1,2,3]
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    prodSchedRouter.post('/productionScheduling/bulk', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:127', 400);
        }
        else {
            try {
                let orderdelidata = await ProductionScheduling_1.ProductionScheduling.bulkCreate(ctx.request.body);
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
    /**
     * @api {post} /productionScheduling/searchTeam [生產排產]-查詢班組
     * @apiDescription 查詢班組當天生產排產計畫
     * @apiGroup Production
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number} team 班組編號
     * @apiParam {Date} today 查詢日期
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/productionScheduling/searchTeam
     * Body:
     * {
     *   "team": 1,
     *   "today": "2018-12-31"
     * }
     * @apiSuccess (Success 200) {Number} id 班組生產排產的資料庫唯一ID，可以拿來查詢或是修改使用
     * @apiSuccess (Success 200) {String} scheduling 排產表類別，目前就是 前道/車縫/後道 三種 (PrecedingTeamScheduling/SewingTeamScheduling/FollowingTeamScheduling)
     * @apiSuccess (Success 200) [others] 其他欄位，請參考前道/車縫/後到生產排產欄位定義
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "id": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    prodSchedRouter.post('/productionScheduling/searchTeam', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:63', 400);
        }
        else {
            let resp = dbquery_1.queryResponsePacket(ctx.request.body);
            let query = dbquery_1.queryDBGeneratorEx({
                query: {
                    "cropTeam": ctx.request.body.query.team,
                    "cropEndDate": [ctx.request.body.query.today, null],
                    "cropStartDate": [null, ctx.request.body.query.today],
                }
            }, PrecedingTeamScheduling_1.precedingTeamSchedulingJoin);
            try {
                let orderdocInfo = await PrecedingTeamScheduling_1.PrecedingTeamScheduling.findAndCount(query);
                if (orderdocInfo && orderdocInfo.rows) {
                    for (let item of orderdocInfo.rows) {
                        let i = item.toJSON();
                        i.scheduling = 'PrecedingTeamScheduling';
                        resp.records.push(i);
                    }
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidQuery:97', 400);
            }
            let query2 = dbquery_1.queryDBGeneratorEx({
                query: {
                    "stickTeam": ctx.request.body.query.team,
                    "stickEndDate": [ctx.request.body.query.today, null],
                    "stickStartDate": [null, ctx.request.body.query.today],
                }
            }, PrecedingTeamScheduling_1.precedingTeamSchedulingJoin);
            try {
                let orderdocInfo = await PrecedingTeamScheduling_1.PrecedingTeamScheduling.findAndCount(query2);
                if (orderdocInfo && orderdocInfo.rows) {
                    for (let item of orderdocInfo.rows) {
                        let i = item.toJSON();
                        i.scheduling = 'PrecedingTeamScheduling';
                        resp.records.push(i);
                    }
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidQuery:97', 400);
            }
            let query3 = dbquery_1.queryDBGeneratorEx({
                query: {
                    "team": ctx.request.body.query.team,
                    "endDate": [ctx.request.body.query.today, null],
                    "startDate": [null, ctx.request.body.query.today],
                }
            }, SewingTeamScheduling_1.sewingTeamSchedulingJoin);
            try {
                let orderdocInfo = await SewingTeamScheduling_1.SewingTeamScheduling.findAndCount(query3);
                if (orderdocInfo && orderdocInfo.rows) {
                    for (let item of orderdocInfo.rows) {
                        let i = item.toJSON();
                        i.scheduling = 'SewingTeamScheduling';
                        resp.records.push(i);
                    }
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidQuery:97', 400);
            }
            let query4 = dbquery_1.queryDBGeneratorEx({
                query: {
                    "lockTeam": ctx.request.body.query.team,
                    "lockEndDate": [ctx.request.body.query.today, null],
                    "lockStartDate": [null, ctx.request.body.query.today],
                }
            }, FollowingTeamScheduling_1.followingTeamSchedulingJoin);
            try {
                let orderdocInfo = await FollowingTeamScheduling_1.FollowingTeamScheduling.findAndCount(query4);
                if (orderdocInfo && orderdocInfo.rows) {
                    for (let item of orderdocInfo.rows) {
                        let i = item.toJSON();
                        i.scheduling = 'FollowingTeamScheduling';
                        resp.records.push(i);
                    }
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidQuery:97', 400);
            }
            let query5 = dbquery_1.queryDBGeneratorEx({
                query: {
                    "ironTeam": ctx.request.body.query.team,
                    "ironEndDate": [ctx.request.body.query.today, null],
                    "ironStartDate": [null, ctx.request.body.query.today],
                }
            }, FollowingTeamScheduling_1.followingTeamSchedulingJoin);
            try {
                let orderdocInfo = await FollowingTeamScheduling_1.FollowingTeamScheduling.findAndCount(query5);
                if (orderdocInfo && orderdocInfo.rows) {
                    for (let item of orderdocInfo.rows) {
                        let i = item.toJSON();
                        i.scheduling = 'FollowingTeamScheduling';
                        resp.records.push(i);
                    }
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidQuery:97', 400);
            }
            let query6 = dbquery_1.queryDBGeneratorEx({
                query: {
                    "packTeam": ctx.request.body.query.team,
                    "packEndDate": [ctx.request.body.query.today, null],
                    "packStartDate": [null, ctx.request.body.query.today],
                }
            }, FollowingTeamScheduling_1.followingTeamSchedulingJoin);
            try {
                let orderdocInfo = await FollowingTeamScheduling_1.FollowingTeamScheduling.findAndCount(query6);
                if (orderdocInfo && orderdocInfo.rows) {
                    for (let item of orderdocInfo.rows) {
                        let i = item.toJSON();
                        i.scheduling = 'FollowingTeamScheduling';
                        resp.records.push(i);
                    }
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidQuery:97', 400);
            }
            ctx.body = resp;
            ctx.status = 200;
            ctx.respond = true;
        }
    });
};
