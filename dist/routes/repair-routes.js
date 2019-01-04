"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Repair_1 = require("../database/models/Repair");
const dbquery_1 = require("../database/dbquery");
// export const accRouter = new KoaRouter();
exports.registerRepairAPI = function (repairRouter) {
    /**
     * @api {post} /repair/search [報修]-查詢
     * @apiDescription 查詢符合條件的報修，並將結果分頁回傳
     * @apiGroup Maintenance
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number=0} [pageIndex] 頁碼
     * @apiParam {Number=100} [maxRows] 每一頁的最大筆數
     * @apiParam {Object} [sort] 將結果指定欄位排序。1是從小到大排序，-1是從大到小。可指定的欄位請參考: <a href="#repair">報修欄位定義</a> <p> 例如根據<code>id</code>從小到大排序就是：<code>{"id":1}</code>
     * @apiParam {Object} [query] 查詢條件。可以指定欄位等於某個值，或是介於某個範圍。範圍用<code>[大於某值，小於某值]</code>來描述，範圍中的兩個值其中之一，可以設定為<code>null</code>，表示不指定，但不能兩者皆為<code>null</code><p> 例如想指定<code>id</code>大於0的報修就是：<code>{"id": [0, null]}</code>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/repair/search
     * Body:
     * {
     *   "pageIndex": 0,
     *   "maxRows": 3,
     *   "sort": {
     *     "id": 1
     *   },
     *   "query": {
     *      "repoter": 2222
     *   }
     * }
     * @apiSuccess (Success 200) {Number} pageIndex 目前的頁碼
     * @apiSuccess (Success 200) {Number} maxRows 每一頁的最大筆數
     * @apiSuccess (Success 200) {Number} totalPage 總頁數
     * @apiSuccess (Success 200) {Array} records 查詢的結果。各欄位定義請參考: <a href="#repair">報修欄位定義</a>
     * @apiSuccessExample {json} Response Example
     * {
     *   "pageIndex": 1,
     *   "maxRows": 100,
     *   "totalPage": 2,
     *   "records": [{
     *     "type": "電工",
     *     "date": "2000-01-01T00:00:00+08:00",
     *     "repoter": 2222,
     *     "equipment": 1111,
     *     "status": "修理中",
     *     ...
     *     },
     *     ...
     *   ]
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    repairRouter.post('/repair/search', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:63', 400);
        }
        else {
            let resp = dbquery_1.queryResponsePacket(ctx.request.body);
            //let countQuery = queryTotalCount < Repair > (ctx.request.body);
            //let query = queryDBGenerator < Repair > (ctx.request.body);
            let query = dbquery_1.queryDBGeneratorEx(ctx.request.body, Repair_1.repairJoin);
            try {
                let orderdocInfo = await Repair_1.Repair.findAndCount(query);
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
                    let count = await Repair.count(countQuery);
                    if (0 === count) {
                        resp.totalPage = 0;
                    } else if (resp.maxRows > 0) {
                        resp.totalPage = Math.ceil(count / resp.maxRows);
                    } else {
                        resp.totalPage = 1;
                    }
    
                    if (undefined === query.offset || (query.offset && query.offset < count)) {
                        let repairdoclist = await Repair.findAll(query);
                        if (repairdoclist && repairdoclist.length > 0) {
                            for (let item of repairdoclist) {
                                let itemFmt = item.toJSON();
                                if (itemFmt.reporter) {
                                    let erpoter = await UserAccount.findById(itemFmt.reporter);
                                    if (erpoter) {
                                        itemFmt.reporter = erpoter.toJSON();
                                    }
                                }
                                if (itemFmt.equipment) {
                                    let equip = await Equipment.findById(itemFmt.equipment);
                                    if (equip) {
                                        itemFmt.equipment = equip.toJSON();
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
     * @api {post} /repair [報修]-新增
     * @apiDescription 新增報修
     * @apiGroup Maintenance
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {String} type 類型(電工/管道/機修)
     * @apiParam {Number} repoter 報修人員
     * @apiParam {Number} equipment 設備編號
     * @apiParam {Date} date 紀錄日期
     * @apiParam {String} status 狀態
     * @apiParam {Mix} [others] 其他欄位，請參考: <a href="#repair">報修欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/repair
     * Body:
     * {
     *   "type": "電工",
     *   "date": "2000-01-01T00:00:00+08:00",
     *   "repoter": 2222,
     *   "equipment": 1111,
     *   "status": "修理中",
     *   ...........
     * }
     * @apiSuccess (Success 200) {String} id 報修的資料庫唯一ID，可以拿來查詢或是修改使用
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "id": "5b6d0d03993dc24293de551c"
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    repairRouter.post('/repair', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:129', 400);
        }
        else {
            try {
                let prod = new Repair_1.Repair(ctx.request.body);
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
     * @api {post} /repair/update [報修]-修改
     * @apiDescription 修改報修資料
     * @apiGroup Maintenance
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Object} condition 符合此條件的報修會被修改
     * @apiParam {Number} condition.id 報修編號，目前只開放依照報修編號修改，將來若有需要批次修改的，再增加欄位
     * @apiParam {Object} update 欲修改的欄位
     * @apiParam {ooo} update.xxx 只需要填欲修改的欄位，沒有要修改的就不用填。欄位請參考: <a href="#repair">報修欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/repair/update
     * Body:
     * {
     *   "condition": {
     *     id: 123456,
     *   },
     *   "update": {
     *     "status": "修理完畢",
     *     ...........
     *   }
     * }
     * @apiSuccess (Success 200) {Number} updateCount 修改成功的報修筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "updateCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    repairRouter.post('/repair/update', async (ctx) => {
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
                let updateres = await Repair_1.Repair.update(ctx.request.body.update, query);
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
     * @api {delete} /repair [報修]-刪除
     * @apiDescription 刪除報修
     * @apiGroup Maintenance
     * @apiVersion 0.0.1
     * @apiParam {Number} id 報修編號
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/repair
     * Body:
     * {
     *   "id": 123456
     * }
     * @apiSuccess (Success 200) {Number} deleteCount 刪除成功的報修筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "deleteCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    repairRouter.delete('/repair', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:238', 400);
        }
        else {
            try {
                let condition = {
                    where: ctx.request.body
                };
                let delcount = await Repair_1.Repair.destroy(condition);
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
