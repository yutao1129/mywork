"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Team_1 = require("../database/models/Team");
const dbquery_1 = require("../database/dbquery");
// export const accRouter = new KoaRouter();
exports.registerTeamAPI = function (teamRouter) {
    /**
     * @api {post} /team/search [班組]-查詢
     * @apiDescription 查詢符合條件的班組，並將結果分頁回傳
     * @apiGroup Production
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number=0} [pageIndex] 頁碼
     * @apiParam {Number=100} [maxRows] 每一頁的最大筆數
     * @apiParam {Object} [sort] 將結果指定欄位排序。1是從小到大排序，-1是從大到小。可指定的欄位請參考: <a href="#team">班組欄位定義</a> <p> 例如根據<code>teamID</code>從小到大排序就是：<code>{"teamID":1}</code>
     * @apiParam {Object} [query] 查詢條件。可以指定欄位等於某個值，或是介於某個範圍。範圍用<code>[大於某值，小於某值]</code>來描述，範圍中的兩個值其中之一，可以設定為<code>null</code>，表示不指定，但不能兩者皆為<code>null</code><p> 例如想指定<code>teamID</code>大於0的班組就是：<code>{"teamID": [0, null]}</code>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/team/search
     * Body:
     * {
     *   "pageIndex": 0,
     *   "maxRows": 3,
     *   "sort": {
     *     "id": 1
     *   },
     *   "query": {
     *      "teamID": "xxx"
     *   }
     * }
     * @apiSuccess (Success 200) {Number} pageIndex 目前的頁碼
     * @apiSuccess (Success 200) {Number} maxRows 每一頁的最大筆數
     * @apiSuccess (Success 200) {Number} totalPage 總頁數
     * @apiSuccess (Success 200) {Array} records 查詢的結果。各欄位定義請參考: <a href="#team">班組欄位定義</a>
     * @apiSuccessExample {json} Response Example
     * {
     *   "pageIndex": 1,
     *   "maxRows": 100,
     *   "totalPage": 2,
     *   "records": [{
     *     "teamID": "xxxx",
     *     "name": "車縫1組",
     *     "category": "車縫",
     *     ...
     *     },
     *     ...
     *   ]
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    teamRouter.post('/team/search', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:63', 400);
        }
        else {
            let resp = dbquery_1.queryResponsePacket(ctx.request.body);
            //let countQuery = queryTotalCount < Team > (ctx.request.body);
            //let query = queryDBGenerator < Team > (ctx.request.body);
            let query = dbquery_1.queryDBGeneratorEx(ctx.request.body, Team_1.teamJoin);
            try {
                let orderdocInfo = await Team_1.Team.findAndCount(query);
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
                    let count = await Team.count(countQuery);
                    if (0 === count) {
                        resp.totalPage = 0;
                    } else if (resp.maxRows > 0) {
                        resp.totalPage = Math.ceil(count / resp.maxRows);
                    } else {
                        resp.totalPage = 1;
                    }
    
                    if (undefined === query.offset || (query.offset && query.offset < count)) {
                        let teamdoclist = await Team.findAll(query);
                        if (teamdoclist && teamdoclist.length > 0) {
                            teamdoclist.map((item) => {
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
     * @api {post} /team [班組]-新增
     * @apiDescription 新增班組
     * @apiGroup Production
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {String} teamID 組號
     * @apiParam {String} name 名稱
     * @apiParam {Number} factory 工廠編號
     * @apiParam {String} category 屬性(車縫,裁剪,粘襯)
     * @apiParam {Mix} [others] 其他欄位，請參考: <a href="#team">班組欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/team
     * Body:
     * {
     *   "teamID": "xxxx",
     *   "name": "車縫1組",
     *   "category": "車縫",
     *   ...........
     * }
     * @apiSuccess (Success 200) {String} id 班組的資料庫唯一ID，可以拿來查詢或是修改使用
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "id": "5b6d0d03993dc24293de551c"
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    teamRouter.post('/team', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:127', 400);
        }
        else {
            try {
                let team = new Team_1.Team(ctx.request.body);
                let teamdata = await team.save();
                if (teamdata && teamdata.id) {
                    let res = {
                        id: teamdata.id
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
     * @api {post} /team/update [班組]-修改
     * @apiDescription 修改班組資料
     * @apiGroup Production
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Object} condition 符合此條件的班組會被修改
     * @apiParam {Number} condition.id 班組編號，目前只開放依照班組編號修改，將來若有需要批次修改的，再增加欄位
     * @apiParam {Object} update 欲修改的欄位
     * @apiParam {ooo} update.xxx 只需要填欲修改的欄位，沒有要修改的就不用填。欄位請參考: <a href="#team">班組欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/team/update
     * Body:
     * {
     *   "condition": {
     *     id: 123456,
     *   },
     *   "update": {
     *     "name": "車縫1組",
     *     "category": "車縫",
     *     ...........
     *   }
     * }
     * @apiSuccess (Success 200) {Number} updateCount 修改成功的班組筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "updateCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    teamRouter.post('/team/update', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:187', 400);
        }
        else if (false === dbquery_1.checkRequestParamObject(ctx.request.body.condition)) {
            ctx.throw('db.invalidParameters:189', 400);
        }
        else if (false === dbquery_1.checkRequestParamObject(ctx.request.body.update)) {
            ctx.throw('db.invalidParameters:191', 400);
        }
        else {
            try {
                let query = {
                    where: ctx.request.body.condition,
                };
                let updateres = await Team_1.Team.update(ctx.request.body.update, query);
                if (updateres && Array.isArray(updateres)) {
                    let res = {
                        updateCount: updateres[0]
                    };
                    ctx.body = res;
                    ctx.status = 200;
                    ctx.respond = true;
                }
                else {
                    ctx.throw('db.invalidParameters:208', 400);
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:212', 400);
            }
        }
    });
    /**
     * @api {delete} /team [班組]-刪除
     * @apiDescription 刪除班組
     * @apiGroup Production
     * @apiVersion 0.0.1
     * @apiParam {Number} id 班組編號
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/team
     * Body:
     * {
     *   "id": 123456
     * }
     * @apiSuccess (Success 200) {Number} deleteCount 刪除成功的班組筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "deleteCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    teamRouter.delete('/team', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:237', 400);
        }
        else {
            try {
                let condition = {
                    where: ctx.request.body
                };
                let delcount = await Team_1.Team.destroy(condition);
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
