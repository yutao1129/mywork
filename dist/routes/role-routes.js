"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Role_1 = require("../database/models/Role");
const dbquery_1 = require("../database/dbquery");
exports.registerRoleAPI = function (roleRouter) {
    /**
     * @api {post} /role/search [角色權限設定]-查詢
     * @apiDescription 查詢符合條件的角色權限設定，並將結果分頁回傳
     * @apiGroup Account
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number=0} [pageIndex] 頁碼
     * @apiParam {Number=100} [maxRows] 每一頁的最大筆數
     * @apiParam {Object} [sort] 將結果指定欄位排序。1是從小到大排序，-1是從大到小。可指定的欄位請參考: <a href="#role">角色權限設定欄位定義</a> <p> 例如根據<code>role</code>從小到大排序就是：<code>{"role":1}</code>
     * @apiParam {Object} [query] 查詢條件。可以指定欄位等於某個值。
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/role/search
     * Body:
     * {
     *   "pageIndex": 0,
     *   "maxRows": 3,
     *   "sort": {
     *     "id": 1
     *   },
     *   "query": {
     *      "role": "車縫"
     *   }
     * }
     * @apiSuccess (Success 200) {Number} pageIndex 目前的頁碼
     * @apiSuccess (Success 200) {Number} maxRows 每一頁的最大筆數
     * @apiSuccess (Success 200) {Number} totalPage 總頁數
     * @apiSuccess (Success 200) {Array} records 查詢的結果。各欄位定義請參考: <a href="#role">帳號欄位定義</a>
     * @apiSuccessExample {json} Response Example
     * {
     *   "pageIndex": 1,
     *   "maxRows": 100,
     *   "totalPage": 2,
     *   "records": [{
     *     "role": "車縫",
     *     "permission": {}
     *     },
     *     ...
     *   ]
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    roleRouter.post('/role/search', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:58', 400);
        }
        else {
            let resp = dbquery_1.queryResponsePacket(ctx.request.body);
            let countQuery = dbquery_1.queryTotalCount(ctx.request.body);
            let query = dbquery_1.queryDBGenerator(ctx.request.body);
            try {
                let count = await Role_1.Role.count(countQuery);
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
                    let roledoclist = await Role_1.Role.findAll(query);
                    if (roledoclist && roledoclist.length > 0) {
                        roledoclist.map((item) => {
                            let itemFmt = item.toJSON();
                            if (itemFmt && 'string' === typeof itemFmt.permission) {
                                itemFmt.permission = JSON.parse(itemFmt.permission);
                            }
                            resp.records.push(itemFmt);
                        });
                    }
                }
                ctx.body = resp;
                ctx.status = 200;
                ctx.respond = true;
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidQuery:92', 400);
            }
        }
    });
    /**
     * @api {post} /role [角色權限設定]-新增
     * @apiDescription 新增角色權限設定
     * @apiGroup Account
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {String} role 角色名稱
     * @apiParam {Json} permission 權限
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/role
     * Body:
     * {
     *   "role": "車縫",
     *   "permission": {}
     * }
     * @apiSuccess (Success 200) {String} role 角色權限設定的資料庫唯一ID，可以拿來查詢或是修改使用
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "role": "車縫"
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    roleRouter.post('/role', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:123', 400);
        }
        else if (false === dbquery_1.checkRequestParamObject(ctx.request.body.permission) ||
            'string' !== typeof ctx.request.body.role) {
            ctx.throw('api.invalidParameters:126', 400);
        }
        else {
            try {
                let roleData = {
                    role: ctx.request.body.role,
                    permission: JSON.stringify(ctx.request.body.permission)
                };
                let role = new Role_1.Role(roleData);
                let roledoc = await role.save();
                if (roledoc && roledoc.role) {
                    let res = {
                        role: roledoc.role
                    };
                    ctx.body = res;
                    ctx.status = 200;
                    ctx.respond = true;
                }
                else {
                    ctx.throw('db.invalidParameters:146', 400);
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:150', 400);
            }
        }
    });
    /**
     * @api {post} /role/update [角色權限設定]-修改
     * @apiDescription 修改角色權限設定
     * @apiGroup Account
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Object} condition 符合此條件的角色權限設定會被修改
     * @apiParam {String} condition.role 角色名稱，目前只開放依照角色名稱修改，將來若有需要批次修改的，再增加欄位
     * @apiParam {Object} update 欲修改的欄位
     * @apiParam {ooo} update.xxx 只需要填欲修改的欄位，沒有要修改的就不用填。欄位請參考: <a href="#role">角色權限設定欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/role/update
     * Body:
     * {
     *   "condition": {
     *     "role": "車縫",
     *   },
     *   "update": {
     *     "permission": {}
     *   }
     * }
     * @apiSuccess (Success 200) {Number} success 修改成功的角色權限設定筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "success": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse ac_roleNotFound
     * @apiUse db_dbNotReady
     */
    roleRouter.post('/role/update', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:188', 400);
        }
        else if (false === dbquery_1.checkRequestParamObject(ctx.request.body.condition)) {
            ctx.throw('db.invalidParameters:190', 400);
        }
        else if (false === dbquery_1.checkRequestParamObject(ctx.request.body.update)) {
            ctx.throw('db.invalidParameters:192', 400);
        }
        else {
            try {
                let query = {
                    where: ctx.request.body.condition,
                };
                let updatefields = ctx.request.body.update;
                if (updatefields.permission) {
                    updatefields.permission = JSON.stringify(updatefields.permission);
                }
                let updateres = await Role_1.Role.update(updatefields, query);
                if (updateres && Array.isArray(updateres)) {
                    let res = {
                        updateCount: updateres[0]
                    };
                    ctx.body = res;
                    ctx.status = 200;
                    ctx.respond = true;
                }
                else {
                    ctx.throw('db.invalidParameters:209', 400);
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:213', 400);
            }
        }
    });
    /**
     * @api {delete} /role [角色權限設定]-刪除
     * @apiDescription 刪除角色權限設定
     * @apiGroup Account
     * @apiVersion 0.0.1
     * @apiParam {String} role 角色名稱
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/role
     * Body:
     * {
     *   "role": "車縫"
     * }
     * @apiSuccess (Success 200) {Number} deleteCount 刪除成功的角色權限設定筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "deleteCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse ac_roleNotFound
     * @apiUse db_dbNotReady
     */
    roleRouter.delete('/role', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:238', 400);
        }
        else {
            try {
                let condition = {
                    where: ctx.request.body
                };
                let delcount = await Role_1.Role.destroy(condition);
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
