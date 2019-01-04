"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Material_1 = require("../database/models/Material");
const dbquery_1 = require("../database/dbquery");
//export const accRouter = new KoaRouter();
exports.registerMaterialAPI = function (materialRouter) {
    /**
     * @api {post} /material/search [倉儲物料項目]-查詢
     * @apiDescription 查詢符合條件的倉儲物料項目，並將結果分頁回傳
     * @apiGroup Style
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number=0} [pageIndex] 頁碼
     * @apiParam {Number=100} [maxRows] 每一頁的最大筆數
     * @apiParam {Object} [sort] 將結果指定欄位排序。1是從小到大排序，-1是從大到小。可指定的欄位請參考: <a href="#material">倉儲物料項目欄位定義</a> <p> 例如根據<code>id</code>從小到大排序就是：<code>{"id":1}</code>
     * @apiParam {Object} [query] 查詢條件。可以指定欄位等於某個值。
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/material/search
     * Body:
     * {
     *   "pageIndex": 0,
     *   "maxRows": 3,
     *   "sort": {
     *     "id": 1
     *   },
     *   "query": {
     *      "name": "xxx"
     *   }
     * }
     * @apiSuccess (Success 200) {Number} pageIndex 目前的頁碼
     * @apiSuccess (Success 200) {Number} maxRows 每一頁的最大筆數
     * @apiSuccess (Success 200) {Number} totalPage 總頁數
     * @apiSuccess (Success 200) {Array} records 查詢的結果。各欄位定義請參考: <a href="#material">倉儲物料項目欄位定義</a>
     * @apiSuccessExample {json} Response Example
     * {
     *   "pageIndex": 1,
     *   "maxRows": 100,
     *   "totalPage": 2,
     *   "records": [{
     *     "name": "xxx"
     *     ...
     *     },
     *     ...
     *   ]
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    materialRouter.post('/material/search', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:63', 400);
        }
        else {
            let resp = dbquery_1.queryResponsePacket(ctx.request.body);
            //let countQuery = queryTotalCount < Material > (ctx.request.body);
            //let query = queryDBGenerator < Material > (ctx.request.body);
            let query = dbquery_1.queryDBGeneratorEx(ctx.request.body, Material_1.materialJoin);
            try {
                let orderdocInfo = await Material_1.Material.findAndCount(query);
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
                    let count = await Material.count(countQuery);
                    if (0 === count) {
                        resp.totalPage = 0;
                    } else if (resp.maxRows > 0) {
                        resp.totalPage = Math.ceil(count / resp.maxRows);
                    } else {
                        resp.totalPage = 1;
                    }
    
                    if (undefined === query.offset || (query.offset && query.offset < count)) {
                        let materialdoclist = await Material.findAll(query);
                        if (materialdoclist && materialdoclist.length > 0) {
                            materialdoclist.map((item) => {
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
     * @api {post} /material [倉儲物料項目]-新增
     * @apiDescription 新增倉儲物料項目
     * @apiGroup Style
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {String} materialID 倉儲物料項目編碼
     * @apiParam {String} name 品名
     * @apiParam {Mix} [others] 其他欄位，請參考: <a href="#material">倉儲物料項目欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/material
     * Body:
     * {
     *   "name": "xxxx",
     *   "materialID": "oooo",
     *   ...........
     * }
     * @apiSuccess (Success 200) {String} id 倉儲物料項目的資料庫唯一ID，可以拿來查詢或是修改使用
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "id": "5b6d0d03993dc24293de551c"
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    materialRouter.post('/material', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:126', 400);
        }
        else {
            try {
                let material = new Material_1.Material(ctx.request.body);
                let mData = await material.save();
                if (mData && mData.id) {
                    let res = {
                        id: mData.id
                    };
                    ctx.body = res;
                    ctx.status = 200;
                    ctx.respond = true;
                }
                else {
                    ctx.throw('db.invalidParameters:141', 400);
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:145', 400);
            }
        }
    });
    /**
     * @api {post} /material/update [倉儲物料項目]-修改
     * @apiDescription 修改倉儲物料項目資料
     * @apiGroup Style
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Object} condition 符合此條件的倉儲物料項目會被修改
     * @apiParam {String} condition.id 倉儲物料項目編號，目前只開放依照編號修改，將來若有需要批次修改的，再增加欄位
     * @apiParam {Object} update 欲修改的欄位
     * @apiParam {ooo} update.xxx 只需要填欲修改的欄位，沒有要修改的就不用填。欄位請參考: <a href="#material">倉儲物料項目欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/material/update
     * Body:
     * {
     *   "condition": {
     *     "id"": 123456789,
     *   },
     *   "update": {
     *     "name": "xxxx",
     *     ...........
     *   }
     * }
     * @apiSuccess (Success 200) {Number} updateCount 修改成功的倉儲物料項目筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "updateCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    materialRouter.post('/material/update', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:183', 400);
        }
        else if (false === dbquery_1.checkRequestParamObject(ctx.request.body.condition)) {
            ctx.throw('db.invalidParameters:186', 400);
        }
        else if (false === dbquery_1.checkRequestParamObject(ctx.request.body.update)) {
            ctx.throw('db.invalidParameters:188', 400);
        }
        else {
            try {
                let query = {
                    where: ctx.request.body.condition,
                };
                let updateres = await Material_1.Material.update(ctx.request.body.update, query);
                if (updateres && Array.isArray(updateres)) {
                    let res = {
                        updateCount: updateres[0]
                    };
                    ctx.body = res;
                    ctx.status = 200;
                    ctx.respond = true;
                }
                else {
                    ctx.throw('db.invalidParameters:205', 400);
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:209', 400);
            }
        }
    });
    /**
     * @api {delete} /material [倉儲物料項目]-刪除
     * @apiDescription 刪除倉儲物料項目
     * @apiGroup Style
     * @apiVersion 0.0.1
     * @apiParam {String} id 倉儲物料項目編號
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/material
     * Body:
     * {
     *   "id": 123456789
     * }
     * @apiSuccess (Success 200) {Number} deleteCount 刪除成功的倉儲物料項目筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "deleteCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    materialRouter.delete('/material', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:238', 400);
        }
        else {
            try {
                let condition = {
                    where: ctx.request.body
                };
                let delcount = await Material_1.Material.destroy(condition);
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
     * @api {post} /material/bulk [倉儲物料項目]-新增多筆
     * @apiDescription 新增多筆倉儲物料項目
     * @apiGroup Style
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {String} materialID 倉儲物料項目編碼
     * @apiParam {String} name 品名
     * @apiParam {Mix} [others] 其他欄位，請參考: <a href="#material">倉儲物料項目欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/material/bulk
     * Body:
     * [
     *   {
     *     "name": "xxxx",
     *     "materialID": "oooo",
     *     ..........
     *   },
     *   {
     *     "name": "xx",
     *     "materialID": "oo",
     *     ..........
     *   },
     *   ....
     * ]
     * @apiSuccess (Success 200) {Array} id 倉儲物料項目的資料庫唯一ID，可以拿來查詢或是修改使用
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "id": [1,2,3]
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    materialRouter.post('/material/bulk', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:127', 400);
        }
        else {
            try {
                let orderdelidata = await Material_1.Material.bulkCreate(ctx.request.body);
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
