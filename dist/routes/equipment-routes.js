"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Equipment_1 = require("../database/models/Equipment");
const dbquery_1 = require("../database/dbquery");
exports.registerEquipmentAPI = function (equipmentRouter) {
    /**
     * @api {post} /equipment/search [設備台帳]-查詢
     * @apiDescription 查詢符合條件的設備台帳，並將結果分頁回傳
     * @apiGroup Knowledge Base
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number=0} [pageIndex] 頁碼
     * @apiParam {Number=100} [maxRows] 每一頁的最大筆數
     * @apiParam {Object} [sort] 將結果指定欄位排序。1是從小到大排序，-1是從大到小。可指定的欄位請參考: <a href="#equipment">設備台帳欄位定義</a> <p> 例如根據<code>equipmentID</code>從小到大排序就是：<code>{"equipmentID":1}</code>
     * @apiParam {Object} [query] 查詢條件。可以指定欄位等於某個值，或是介於某個範圍。範圍用<code>[大於某值，小於某值]</code>來描述，範圍中的兩個值其中之一，可以設定為<code>null</code>，表示不指定，但不能兩者皆為<code>null</code><p> 例如想指定<code>equipmentID</code>大於1000的設備台帳就是：<code>{"equipmentID": [1000, null]}</code>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/equipment/search
     * Body:
     * {
     *   "pageIndex": 0,
     *   "maxRows": 3,
     *   "sort": {
     *     "id": 1
     *   },
     *   "query": {
     *      "service": "金融"
     *   }
     * }
     * @apiSuccess (Success 200) {Number} pageIndex 目前的頁碼
     * @apiSuccess (Success 200) {Number} maxRows 每一頁的最大筆數
     * @apiSuccess (Success 200) {Number} totalPage 總頁數
     * @apiSuccess (Success 200) {Array} records 查詢的結果。各欄位定義請參考: <a href="#equipment">設備台帳欄位定義</a>
     * @apiSuccessExample {json} Response Example
     * {
     *   "pageIndex": 1,
     *   "maxRows": 100,
     *   "totalPage": 2,
     *   "records": [{
     *     "equipmentID": 123456789,
     *     "service": "金融",
     *     ...
     *     },
     *     ...
     *   ]
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    equipmentRouter.post('/equipment/search', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:59', 400);
        }
        else {
            let resp = dbquery_1.queryResponsePacket(ctx.request.body);
            //let countQuery = queryTotalCount < Equipment > (ctx.request.body);
            //let query = queryDBGenerator < Equipment > (ctx.request.body);
            let query = dbquery_1.queryDBGeneratorEx(ctx.request.body, Equipment_1.equipmentJoin);
            try {
                let orderdocInfo = await Equipment_1.Equipment.findAndCount(query);
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
                    let count = await Equipment.count(countQuery);
                    if (0 === count) {
                        resp.totalPage = 0;
                    } else if (resp.maxRows > 0) {
                        resp.totalPage = Math.ceil(count / resp.maxRows);
                    } else {
                        resp.totalPage = 1;
                    }
    
                    if (undefined === query.offset || (query.offset && query.offset < count)) {
                        let equipmentdoclist = await Equipment.findAll(query);
                        if (equipmentdoclist && equipmentdoclist.length > 0) {
                            equipmentdoclist.map((item) => {
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
                ctx.throw('db.invalidQuery:89', 400);
            }
        }
    });
    /**
     * @api {post} /equipment [設備台帳]-新增
     * @apiDescription 新增設備台帳
     * @apiGroup Knowledge Base
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {String} equipmentID 設備台帳編號
     * @apiParam {String} name 設備台帳名稱
     * @apiParam {Mix} [others] 其他欄位，請參考: <a href="#equipment">設備台帳欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/equipment
     * Body:
     * {
     *   "equipmentID": 123456789,
     *   "name": "oxoxox"
     *   ...........
     * }
     * @apiSuccess (Success 200) {String} id 設備台帳的資料庫唯一ID，可以拿來查詢或是修改使用
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "id": "5b6d0d03993dc24293de551c"
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    equipmentRouter.post('/equipment', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:122', 400);
        }
        else {
            try {
                let equip = new Equipment_1.Equipment(ctx.request.body);
                let equipdata = await equip.save();
                if (equipdata && equipdata.id) {
                    let res = {
                        id: equipdata.id
                    };
                    ctx.body = res;
                    ctx.status = 200;
                    ctx.respond = true;
                }
                else {
                    ctx.throw('db.invalidParameters:137', 400);
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:141', 400);
            }
        }
    });
    /**
     * @api {post} /equipment/update [設備台帳]-修改
     * @apiDescription 修改設備台帳資料
     * @apiGroup Knowledge Base
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Object} condition 符合此條件的設備台帳會被修改
     * @apiParam {String} condition.equipmentID 設備台帳編號，目前只開放依照設備台帳編號修改，將來若有需要批次修改的，再增加欄位
     * @apiParam {Object} update 欲修改的欄位
     * @apiParam {ooo} update.xxx 只需要填欲修改的欄位，沒有要修改的就不用填。欄位請參考: <a href="#equipment">設備台帳欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/equipment/update
     * Body:
     * {
     *   "condition": {
     *     "equipmentID": 123456789,
     *   },
     *   "update": {
     *     "name": "oxoxox",
     *     "useYears": "2020/10",
     *     ...........
     *   }
     * }
     * @apiSuccess (Success 200) {Number} updateCount 修改成功的設備台帳筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "updateCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse km_equipmentNotFound
     * @apiUse db_dbNotReady
     */
    equipmentRouter.post('/equipment/update', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:181', 400);
        }
        else if (false === dbquery_1.checkRequestParamObject(ctx.request.body.condition)) {
            ctx.throw('db.invalidParameters:183', 400);
        }
        else if (false === dbquery_1.checkRequestParamObject(ctx.request.body.update)) {
            ctx.throw('db.invalidParameters:158', 400);
        }
        else {
            try {
                let query = {
                    where: ctx.request.body.condition,
                };
                let updateres = await Equipment_1.Equipment.update(ctx.request.body.update, query);
                if (updateres && Array.isArray(updateres)) {
                    let res = {
                        updateCount: updateres[0]
                    };
                    ctx.body = res;
                    ctx.status = 200;
                    ctx.respond = true;
                }
                else {
                    ctx.throw('db.invalidParameters:202', 400);
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:206', 400);
            }
        }
    });
    /**
     * @api {delete} /equipment [設備台帳]-刪除
     * @apiDescription 刪除設備台帳
     * @apiGroup Knowledge Base
     * @apiVersion 0.0.1
     * @apiParam {String} equipmentID 設備台帳編號
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/equipment
     * Body:
     * {
     *   "equipmentID": 123456789
     * }
     * @apiSuccess (Success 200) {Number} deleteCount 刪除成功的設備台帳筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "deleteCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse km_equipmentNotFound
     * @apiUse db_dbNotReady
     */
    equipmentRouter.delete('/equipment', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:231', 400);
        }
        else {
            try {
                let condition = {
                    where: ctx.request.body
                };
                let delcount = await Equipment_1.Equipment.destroy(condition);
                if (null !== delcount && undefined !== delcount) {
                    let res = {
                        deleteCount: delcount
                    };
                    ctx.body = res;
                    ctx.status = 200;
                    ctx.respond = true;
                }
                else {
                    ctx.throw('db.invalidParameters:248', 400);
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:252', 400);
            }
        }
    });
};
