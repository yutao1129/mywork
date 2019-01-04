//author : Yutao.liu
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Module_1 = require("../database/models/Module");
const dbquery_1 = require("../database/dbquery");
exports.registerModuleAPI = function (moduleRouter) {
    /**
     * @api {post} /module/search [模塊設定]-查詢
     * @apiDescription 查詢符合條件的模塊設定，並將結果分頁回傳
     * @apiGroup Account
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number=0} [pageIndex] 頁碼
     * @apiParam {Number=100} [maxRows] 每一頁的最大筆數
     * @apiParam {Object} [sort] 將結果指定欄位排序。1是從小到大排序，-1是從大到小。可指定的欄位請參考: <a href="#module">模塊設定欄位定義</a> <p> 例如根據<code>role</code>從小到大排序就是：<code>{"role":1}</code>
     * @apiParam {Object} [query] 查詢條件。可以指定欄位等於某個值。
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/module/search
     * Body:
     * {
     *   "pageIndex": 0,
     *   "maxRows": 3,
     *   "sort": {
     *     "id": 1
     *   },
     *   "query": {
     *      "modulename": "生產管理"
     *   }
     * }
     * @apiSuccess (Success 200) {Number} pageIndex 目前的頁碼
     * @apiSuccess (Success 200) {Number} maxRows 每一頁的最大筆數
     * @apiSuccess (Success 200) {Number} totalPage 總頁數
     * @apiSuccess (Success 200) {Array} records 查詢的結果。各欄位定義請參考: <a href="#module">帳號欄位定義</a>
     * @apiSuccessExample {json} Response Example
     * {
     *   "pageIndex": 1,
     *   "maxRows": 100,
     *   "totalPage": 2,
     *   "records": [{
     *     "modulename": "生產管理",
     *     "url": {}
     *     },
     *     ...
     *   ]
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    moduleRouter.post('/module/search', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:58', 400);
        }
        else {
            let resp = dbquery_1.queryResponsePacket(ctx.request.body);
            let countQuery = dbquery_1.queryTotalCount(ctx.request.body);
            let query = dbquery_1.queryDBGenerator(ctx.request.body);
            try {
                let count = await Module_1.Module.count(countQuery);
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
                    let moduledoclist = await Module_1.Module.findAll(query);
                    if (moduledoclist && moduledoclist.length > 0) {
                        moduledoclist.map((item) => {
                            resp.records.push(item);
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
     * @api {post} /module [模塊設定]-新增
     * @apiDescription 新增模塊設定
     * @apiGroup Account
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {String} modulename 模塊名稱
     * @apiParam {String} url 模塊url
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/module
     * Body:
     * {
     *   "modulename": "生產管理",
     *   "url": "/shenchanguanli"
     * }
     * @apiSuccess (Success 200) {String} module 模塊設定的資料庫唯一ID，可以拿來查詢或是修改使用
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "id": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    moduleRouter.post('/module', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:123', 400);
        }
        else if ('string' !== typeof ctx.request.body.modulename) {
            ctx.throw('api.invalidParameters:126', 400);
        }
        else {
            try {
                let moduleData = {
                    modulename: ctx.request.body.modulename
                };
                moduleData.url =(ctx.request.body.url)?ctx.request.body.url:"";

                let module = new Module_1.Module(moduleData);
                let moduledoc = await module.save();
                if (moduledoc && moduledoc.modulename) {
                    let res = {
                        id: moduledoc.id
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
     * @api {post} /module/update [模塊設定]-修改
     * @apiDescription 修改模塊設定
     * @apiGroup Account
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Object} condition 符合此條件的模塊設定會被修改
     * @apiParam {String} condition.modulename 模塊名稱
     * @apiParam {Object} update 欲修改的欄位
     * @apiParam {ooo} update.xxx 只需要填欲修改的欄位，沒有要修改的就不用填。欄位請參考: <a href="#module">模塊設定欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/module/update
     * Body:
     * {
     *   "condition": {
     *     "id": "1",
     *   },
     *   "update": {
     *     "modulename":"生產管理者"
     *     "url": "shenchanguanlizhe"
     *   }
     * }
     * @apiSuccess (Success 200) {Number} success 修改成功的模塊設定筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "success": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse ac_roleNotFound
     * @apiUse db_dbNotReady
     */
    moduleRouter.post('/module/update', async (ctx) => {
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
                /*
                if (updatefields.modulename) {
                    updatefields.modulename = JSON.stringify(updatefields.modulename);
                }
                if (updatefields.url) {
                    updatefields.url = JSON.stringify(updatefields.url);
                }
                */
                let updateres = await Module_1.Module.update(updatefields, query);
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
     * @api {delete} /module [模塊設定]-刪除
     * @apiDescription 刪除模塊設定
     * @apiGroup Account
     * @apiVersion 0.0.1
     * @apiParam {String} id 模塊id
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/module
     * Body:
     * {
     *   "id": 1
     * }
     * @apiSuccess (Success 200) {Number} deleteCount 刪除成功的模塊設定筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "deleteCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse ac_roleNotFound
     * @apiUse db_dbNotReady
     */
    moduleRouter.delete('/module', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:238', 400);
        }
        else {
            try {
                let condition = {
                    where: ctx.request.body
                };
                let delcount = await Module_1.Module.destroy(condition);
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
