"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FollowingTeamScheduling_1 = require("../database/models/FollowingTeamScheduling");
const dbquery_1 = require("../database/dbquery");
// export const accRouter = new KoaRouter();
exports.registerFollowTeamSchAPI = function (followTeamSchRouter) {
    /**
     * @api {post} /followingTeamScheduling/search [後道班組排產]-查詢
     * @apiDescription 查詢符合條件的後道班組排產，並將結果分頁回傳
     * @apiGroup Production
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number=0} [pageIndex] 頁碼
     * @apiParam {Number=100} [maxRows] 每一頁的最大筆數
     * @apiParam {Object} [sort] 將結果指定欄位排序。1是從小到大排序，-1是從大到小。可指定的欄位請參考: <a href="#followingTeamScheduling">後道班組排產欄位定義</a> <p> 例如根據<code>id</code>從小到大排序就是：<code>{"id":1}</code>
     * @apiParam {Object} [query] 查詢條件。可以指定欄位等於某個值，或是介於某個範圍。範圍用<code>[大於某值，小於某值]</code>來描述，範圍中的兩個值其中之一，可以設定為<code>null</code>，表示不指定，但不能兩者皆為<code>null</code><p> 例如想指定<code>id</code>大於0的後道班組排產就是：<code>{"id": [0, null]}</code>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/followingTeamScheduling/search
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
     * @apiSuccess (Success 200) {Array} records 查詢的結果。各欄位定義請參考: <a href="#followingTeamScheduling">後道班組排產欄位定義</a>
     * @apiSuccessExample {json} Response Example
     * {
     *   "pageIndex": 1,
     *   "maxRows": 100,
     *   "totalPage": 2,
     *   "records": [{
     *     "productionScheduling": 1111,
     *     "lockTeam": 2222,
     *     "amount": 3000,
     *     ...
     *     },
     *     ...
     *   ]
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    followTeamSchRouter.post('/followingTeamScheduling/search', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:63', 400);
        }
        else {
            let resp = dbquery_1.queryResponsePacket(ctx.request.body);
            //let countQuery = queryTotalCount < FollowingTeamScheduling > (ctx.request.body);
            //let query = queryDBGenerator < FollowingTeamScheduling > (ctx.request.body);
            let query = dbquery_1.queryDBGeneratorEx(ctx.request.body, FollowingTeamScheduling_1.followingTeamSchedulingJoin);
            try {
                let orderdocInfo = await FollowingTeamScheduling_1.FollowingTeamScheduling.findAndCount(query);
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
                    let count = await FollowingTeamScheduling.count(countQuery);
                    if (0 === count) {
                        resp.totalPage = 0;
                    } else if (resp.maxRows > 0) {
                        resp.totalPage = Math.ceil(count / resp.maxRows);
                    } else {
                        resp.totalPage = 1;
                    }
    
                    if (undefined === query.offset || (query.offset && query.offset < count)) {
                        let schdoclist = await FollowingTeamScheduling.findAll(query);
                        if (schdoclist && schdoclist.length > 0) {
                            for (let item of schdoclist) {
                                let itemFmt = item.toJSON();
                                if (itemFmt.productionScheduling) {
                                    let sch = await ProductionScheduling.findById(itemFmt.productionScheduling);
                                    if (sch) {
                                        itemFmt.productionScheduling = sch.toJSON();
                                    }
                                }
                                if (itemFmt.lockTeam) {
                                    let team = await Team.findById(item.lockTeam);
                                    if (team) {
                                        itemFmt.lockTeam = team.toJSON();
                                    }
                                }
                                if (itemFmt.ironTeam) {
                                    let team = await Team.findById(item.ironTeam);
                                    if (team) {
                                        itemFmt.ironTeam = team.toJSON();
                                    }
                                }
                                if (itemFmt.packTeam) {
                                    let team = await Team.findById(item.packTeam);
                                    if (team) {
                                        itemFmt.packTeam = team.toJSON();
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
     * @api {post} /followingTeamScheduling [後道班組排產]-新增
     * @apiDescription 新增後道班組排產
     * @apiGroup Production
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number} productionScheduling 生產排產編號
     * @apiParam {Number} lockTeam 鎖釘班組編號
     * @apiParam {Number} amount 分派數量
     * @apiParam {Date} lockStartDate 鎖釘開始日期
     * @apiParam {Number} lockEstimatedWorkingDay 鎖釘估計所需工作日
     * @apiParam {Date} lockEndDate 鎖釘交期
     * @apiParam {Mix} [others] 其他欄位，請參考: <a href="#followingTeamScheduling">後道班組排產欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/followingTeamScheduling
     * Body:
     * {
     *   "productionScheduling": 1111,
     *   "lockTeam": 2222,
     *   "amount": 3000,
     *   ...........
     * }
     * @apiSuccess (Success 200) {String} id 後道班組排產的資料庫唯一ID，可以拿來查詢或是修改使用
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "id": "5b6d0d03993dc24293de551c"
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    followTeamSchRouter.post('/followingTeamScheduling', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:129', 400);
        }
        else {
            try {
                let prod = new FollowingTeamScheduling_1.FollowingTeamScheduling(ctx.request.body);
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
     * @api {post} /followingTeamScheduling/update [後道班組排產]-修改
     * @apiDescription 修改後道班組排產資料
     * @apiGroup Production
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Object} condition 符合此條件的後道班組排產會被修改
     * @apiParam {Number} condition.id 後道班組排產編號，目前只開放依照後道班組排產編號修改，將來若有需要批次修改的，再增加欄位
     * @apiParam {Object} update 欲修改的欄位
     * @apiParam {ooo} update.xxx 只需要填欲修改的欄位，沒有要修改的就不用填。欄位請參考: <a href="#followingTeamScheduling">後道班組排產欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/followingTeamScheduling/update
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
     * @apiSuccess (Success 200) {Number} updateCount 修改成功的後道班組排產筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "updateCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    followTeamSchRouter.post('/followingTeamScheduling/update', async (ctx) => {
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
                let updateres = await FollowingTeamScheduling_1.FollowingTeamScheduling.update(ctx.request.body.update, query);
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
     * @api {delete} /followingTeamScheduling [後道班組排產]-刪除
     * @apiDescription 刪除後道班組排產
     * @apiGroup Production
     * @apiVersion 0.0.1
     * @apiParam {Number} id 後道班組排產編號
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/followingTeamScheduling
     * Body:
     * {
     *   "id": 123456
     * }
     * @apiSuccess (Success 200) {Number} deleteCount 刪除成功的後道班組排產筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "deleteCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    followTeamSchRouter.delete('/followingTeamScheduling', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:238', 400);
        }
        else {
            try {
                let condition = {
                    where: ctx.request.body
                };
                let delcount = await FollowingTeamScheduling_1.FollowingTeamScheduling.destroy(condition);
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
     * @api {post} /followingTeamScheduling/bulk [後道班組排產]-新增多筆
     * @apiDescription 新增多筆後道班組排產
     * @apiGroup Production
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number} productionScheduling 生產排產編號
     * @apiParam {Number} lockTeam 鎖釘班組編號
     * @apiParam {Number} amount 分派數量
     * @apiParam {Date} lockStartDate 鎖釘開始日期
     * @apiParam {Number} lockEstimatedWorkingDay 鎖釘估計所需工作日
     * @apiParam {Date} lockEndDate 鎖釘交期
     * @apiParam {Mix} [others] 其他欄位，請參考: <a href="#followingTeamScheduling">後道班組排產欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/followingTeamScheduling/bulk
     * Body:
     * [
     *   {
     *     "productionScheduling": 1111,
     *     "lockTeam": 2222,
     *     "amount": 3000,
     *     ...........
     *   },
     *   ......
     * ]
     * @apiSuccess (Success 200) {Array} id 後道班組排產的資料庫唯一ID，可以拿來查詢或是修改使用
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "id": [1,2,3]
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    followTeamSchRouter.post('/followingTeamScheduling/bulk', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:127', 400);
        }
        else {
            try {
                let orderdelidata = await FollowingTeamScheduling_1.FollowingTeamScheduling.bulkCreate(ctx.request.body);
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
