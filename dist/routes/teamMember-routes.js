"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Factory_1 = require("../database/models/Factory");
const TeamMember_1 = require("../database/models/TeamMember");
const dbquery_1 = require("../database/dbquery");
// export const accRouter = new KoaRouter();
exports.registerTeamMemberAPI = function (teamMemberRouter) {
    /**
     * @api {post} /teamMember/search [班組人員]-查詢
     * @apiDescription 查詢符合條件的班組人員，並將結果分頁回傳
     * @apiGroup Production
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number=0} [pageIndex] 頁碼
     * @apiParam {Number=100} [maxRows] 每一頁的最大筆數
     * @apiParam {Object} [sort] 將結果指定欄位排序。1是從小到大排序，-1是從大到小。可指定的欄位請參考: <a href="#teamMember">班組人員欄位定義</a> <p> 例如根據<code>title</code>從小到大排序就是：<code>{"title":1}</code>
     * @apiParam {Object} [query] 查詢條件。可以指定欄位等於某個值，或是介於某個範圍。範圍用<code>[大於某值，小於某值]</code>來描述，範圍中的兩個值其中之一，可以設定為<code>null</code>，表示不指定，但不能兩者皆為<code>null</code><p> 例如想指定<code>id</code>大於0的班組人員就是：<code>{"id": [0, null]}</code>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/teamMember/search
     * Body:
     * {
     *   "pageIndex": 0,
     *   "maxRows": 3,
     *   "sort": {
     *     "id": 1
     *   },
     *   "query": {
     *      "title": "xxx"
     *   }
     * }
     * @apiSuccess (Success 200) {Number} pageIndex 目前的頁碼
     * @apiSuccess (Success 200) {Number} maxRows 每一頁的最大筆數
     * @apiSuccess (Success 200) {Number} totalPage 總頁數
     * @apiSuccess (Success 200) {Array} records 查詢的結果。各欄位定義請參考: <a href="#teamMember">班組人員欄位定義</a>
     * @apiSuccessExample {json} Response Example
     * {
     *   "pageIndex": 1,
     *   "maxRows": 100,
     *   "totalPage": 2,
     *   "records": [{
     *     "title": "xxxx",
     *     "team": 1111,
     *     "member": 2222,
     *     ...
     *     },
     *     ...
     *   ]
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    teamMemberRouter.post('/teamMember/search', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:62', 400);
        }
        else {
            let resp = dbquery_1.queryResponsePacket(ctx.request.body);
            //let countQuery = queryTotalCount < TeamMember > (ctx.request.body);
            //let query = queryDBGenerator < TeamMember > (ctx.request.body);
            let query = dbquery_1.queryDBGeneratorEx(ctx.request.body, TeamMember_1.teamMemberJoin);
            try {
                let orderdocInfo = await TeamMember_1.TeamMember.findAndCount(query);
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
                        let i = item.toJSON();
                        await UpdateFactory(i);
                        resp.records.push(i);
                    }
                }
                /*try {
                    let count = await TeamMember.count(countQuery);
                    if (0 === count) {
                        resp.totalPage = 0;
                    } else if (resp.maxRows > 0) {
                        resp.totalPage = Math.ceil(count / resp.maxRows);
                    } else {
                        resp.totalPage = 1;
                    }
    
                    if (undefined === query.offset || (query.offset && query.offset < count)) {
                        let teamdoclist = await TeamMember.findAll(query);
                        if (teamdoclist && teamdoclist.length > 0) {
                            teamdoclist.map((item) => {
                                let itemFmt = item.toJSON();
                                if (itemFmt && 'string' === typeof itemFmt.budget) {
                                    itemFmt.budget = JSON.parse(itemFmt.budget);
                                }
                                resp.records.push(itemFmt);
                            });
                        }
                    }*/
                ctx.body = resp;
                ctx.status = 200;
                ctx.respond = true;
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidQuery:96', 400);
            }
        }
    });
    /**
     * @api {post} /teamMember [班組人員]-新增
     * @apiDescription 新增班組人員
     * @apiGroup Production
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number} team 班組編號
     * @apiParam {Number} member 人員編號
     * @apiParam {String} title 職稱(組長,組員)
     * @apiParam {String} phoneNumber 聯繫電話
     * @apiParam {Mix} [others] 其他欄位，請參考: <a href="#teamMember">班組人員欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/teamMember
     * Body:
     * {
     *   "team": 1111,
     *   "member": 2222,
     *   "title": "組長",
     *   ...........
     * }
     * @apiSuccess (Success 200) {String} id 班組人員的資料庫唯一ID，可以拿來查詢或是修改使用
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "id": "5b6d0d03993dc24293de551c"
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    teamMemberRouter.post('/teamMember', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:127', 400);
        }
        else {
            try {
                let teamMem = new TeamMember_1.TeamMember(ctx.request.body);
                let teamMemdata = await teamMem.save();
                if (teamMemdata && teamMemdata.id) {
                    let res = {
                        id: teamMemdata.id
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
     * @api {post} /teamMember/update [班組人員]-修改
     * @apiDescription 修改班組人員資料
     * @apiGroup Production
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Object} condition 符合此條件的班組人員會被修改
     * @apiParam {Number} condition.id 班組人員編號，目前只開放依照班組人員編號修改，將來若有需要批次修改的，再增加欄位
     * @apiParam {Object} update 欲修改的欄位
     * @apiParam {ooo} update.xxx 只需要填欲修改的欄位，沒有要修改的就不用填。欄位請參考: <a href="#teamMember">班組人員欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/teamMember/update
     * Body:
     * {
     *   "condition": {
     *     id: 123456,
     *   },
     *   "update": {
     *     "phoneNumber": "123456789",
     *     ...........
     *   }
     * }
     * @apiSuccess (Success 200) {Number} updateCount 修改成功的班組人員筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "updateCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    teamMemberRouter.post('/teamMember/update', async (ctx) => {
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
                let updateres = await TeamMember_1.TeamMember.update(ctx.request.body.update, query);
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
     * @api {delete} /teamMember [班組人員]-刪除
     * @apiDescription 刪除班組人員
     * @apiGroup Production
     * @apiVersion 0.0.1
     * @apiParam {Number} id 班組人員編號
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/teamMember
     * Body:
     * {
     *   "id": 123456
     * }
     * @apiSuccess (Success 200) {Number} deleteCount 刪除成功的班組人員筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "deleteCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    teamMemberRouter.delete('/teamMember', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:237', 400);
        }
        else {
            try {
                let condition = {
                    where: ctx.request.body
                };
                let delcount = await TeamMember_1.TeamMember.destroy(condition);
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
function UpdateFactory(teamMember) {
    return new Promise(async (resolve, reject) => {
        if (teamMember.teamData.factory && teamMember.teamData.factory) {
            let query = dbquery_1.queryDBGeneratorEx({
                query: { "id": teamMember.teamData.factory }
            }, Factory_1.factoryJoin);
            let qs = await Factory_1.Factory.findOne(query);
            if (qs) {
                teamMember.factoryData = qs.toJSON();
            }
        }
        return resolve(true);
    });
}
