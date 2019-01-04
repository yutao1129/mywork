"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Supplier_1 = require("../database/models/Supplier");
const dbquery_1 = require("../database/dbquery");
exports.registerSupplierAPI = function (supplierRouter) {
    /**
     * @api {post} /supplier/search [供應商]-查詢
     * @apiDescription 查詢符合條件的供應商，並將結果分頁回傳
     * @apiGroup Supplier
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number=0} [pageIndex] 頁碼
     * @apiParam {Number=100} [maxRows] 每一頁的最大筆數
     * @apiParam {Object} [sort] 將結果指定欄位排序。1是從小到大排序，-1是從大到小。可指定的欄位請參考: <a href="#supplier">供應商欄位定義</a> <p> 例如根據<code>supplierID</code>從小到大排序就是：<code>{"supplierID":1}</code>
     * @apiParam {Object} [query] 查詢條件。可以指定欄位等於某個值，或是介於某個範圍。範圍用<code>[大於某值，小於某值]</code>來描述，範圍中的兩個值其中之一，可以設定為<code>null</code>，表示不指定，但不能兩者皆為<code>null</code><p> 例如想指定<code>supplierID</code>大於1000的供應商就是：<code>{"supplierID": [1000, null]}</code>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/supplier/search
     * Body:
     * {
     *   "pageIndex": 0,
     *   "maxRows": 3,
     *   "sort": {
     *     "id": 1
     *   },
     *   "query": {
     *      "type": "面料"
     *   }
     * }
     * @apiSuccess (Success 200) {Number} pageIndex 目前的頁碼
     * @apiSuccess (Success 200) {Number} maxRows 每一頁的最大筆數
     * @apiSuccess (Success 200) {Number} totalPage 總頁數
     * @apiSuccess (Success 200) {Array} records 查詢的結果。各欄位定義請參考: <a href="#supplier">供應商欄位定義</a>
     * @apiSuccessExample {json} Response Example
     * {
     *   "pageIndex": 1,
     *   "maxRows": 100,
     *   "totalPage": 2,
     *   "records": [{
     *     "supplierID": 123456789,
     *     "type": "面料",
     *     ...
     *     },
     *     ...
     *   ]
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    supplierRouter.post('/supplier/search', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:63', 400);
        }
        else {
            let resp = dbquery_1.queryResponsePacket(ctx.request.body);
            let countQuery = dbquery_1.queryTotalCount(ctx.request.body);
            let query = dbquery_1.queryDBGenerator(ctx.request.body);
            try {
                let count = await Supplier_1.Supplier.count(countQuery);
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
                    let supplierdoclist = await Supplier_1.Supplier.findAll(query);
                    if (supplierdoclist && supplierdoclist.length > 0) {
                        supplierdoclist.map((item) => {
                            resp.records.push(item.toJSON());
                        });
                    }
                }
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
     * @api {post} /supplier [供應商]-新增
     * @apiDescription 新增供應商
     * @apiGroup Supplier
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {String} supplierID 供應商編號
     * @apiParam {String} name 供應商名稱
     * @apiParam {Mix} [others] 其他欄位，請參考: <a href="#supplier">供應商欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/supplier
     * Body:
     * {
     *   "supplierID": 123456789,
     *   "name": "oxoxox",
     *   "scale": "100~500",
     *   ...........
     * }
     * @apiSuccess (Success 200) {String} id 供應商的資料庫唯一ID，可以拿來查詢或是修改使用
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "id": "5b6d0d03993dc24293de551c"
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    supplierRouter.post('/supplier', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:127', 400);
        }
        else {
            try {
                let supplier = new Supplier_1.Supplier(ctx.request.body);
                let supplierdata = await supplier.save();
                if (supplierdata && supplierdata.id) {
                    let res = {
                        id: supplierdata.id
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
     * @api {post} /supplier/update [供應商]-修改
     * @apiDescription 修改供應商資料
     * @apiGroup Supplier
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Object} condition 符合此條件的供應商會被修改
     * @apiParam {String} condition.supplierID 供應商編號，目前只開放依照供應商編號修改，將來若有需要批次修改的，再增加欄位
     * @apiParam {Object} update 欲修改的欄位
     * @apiParam {ooo} update.xxx 只需要填欲修改的欄位，沒有要修改的就不用填。欄位請參考: <a href="#supplier">供應商欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/supplier/update
     * Body:
     * {
     *   "condition": {
     *     "supplierID": 123456789,
     *   },
     *   "update": {
     *     "name": "oxoxox",
     *     "scale": "100~500",
     *     ...........
     *   }
     * }
     * @apiSuccess (Success 200) {Number} updateCount 修改成功的供應商筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "updateCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse sc_supplierNotFound
     * @apiUse db_dbNotReady
     */
    supplierRouter.post('/supplier/update', async (ctx) => {
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
                let updateres = await Supplier_1.Supplier.update(ctx.request.body.update, query);
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
     * @api {delete} /supplier [供應商]-刪除
     * @apiDescription 刪除供應商
     * @apiGroup Supplier
     * @apiVersion 0.0.1
     * @apiParam {String} supplierID 供應商編號
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/supplier
     * Body:
     * {
     *   "supplierID": 123456789
     * }
     * @apiSuccess (Success 200) {Number} deleteCount 刪除成功的供應商筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "deleteCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse sc_supplierNotFound
     * @apiUse db_dbNotReady
     */
    supplierRouter.delete('/supplier', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:237', 400);
        }
        else {
            try {
                let condition = {
                    where: ctx.request.body
                };
                let delcount = await Supplier_1.Supplier.destroy(condition);
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
