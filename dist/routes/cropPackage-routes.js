"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CropPackage_1 = require("../database/models/CropPackage");
const dbquery_1 = require("../database/dbquery");
// export const accRouter = new KoaRouter();
exports.registerCropPackageAPI = function (cropPackageRouter) {
    /**
     * @api {post} /cropPackage/search [裁剪分包]-查詢
     * @apiDescription 查詢符合條件的裁剪分包，並將結果分頁回傳
     * @apiGroup Crop
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number=0} [pageIndex] 頁碼
     * @apiParam {Number=100} [maxRows] 每一頁的最大筆數
     * @apiParam {Object} [sort] 將結果指定欄位排序。1是從小到大排序，-1是從大到小。可指定的欄位請參考: <a href="#cropPackage">裁剪分包欄位定義</a> <p> 例如根據<code>bundleNumber</code>從小到大排序就是：<code>{"bundleNumber":1}</code>
     * @apiParam {Object} [query] 查詢條件。可以指定欄位等於某個值，或是介於某個範圍。範圍用<code>[大於某值，小於某值]</code>來描述，範圍中的兩個值其中之一，可以設定為<code>null</code>，表示不指定，但不能兩者皆為<code>null</code><p> 例如想指定<code>bundleNumber</code>大於0的裁剪分包就是：<code>{"bundleNumber": [0, null]}</code>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/cropPackage/search
     * Body:
     * {
     *   "pageIndex": 0,
     *   "maxRows": 3,
     *   "sort": {
     *     "id": 1
     *   },
     *   "query": {
     *      "packageNumber": 12
     *   }
     * }
     * @apiSuccess (Success 200) {Number} pageIndex 目前的頁碼
     * @apiSuccess (Success 200) {Number} maxRows 每一頁的最大筆數
     * @apiSuccess (Success 200) {Number} totalPage 總頁數
     * @apiSuccess (Success 200) {Array} records 查詢的結果。各欄位定義請參考: <a href="#cropPackage">裁剪分包欄位定義</a>
     * @apiSuccessExample {json} Response Example
     * {
     *   "pageIndex": 1,
     *   "maxRows": 100,
     *   "totalPage": 2,
     *   "records": [{
     *     "packageNumber": 12,
     *     "size": "S",
     *     ...
     *     },
     *     ...
     *   ]
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    cropPackageRouter.post('/cropPackage/search', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:59', 400);
        }
        else {
            let resp = dbquery_1.queryResponsePacket(ctx.request.body);
            //let countQuery = queryTotalCount < CropPackage > (ctx.request.body);
            //let query = queryDBGenerator < CropPackage > (ctx.request.body);
            let query = dbquery_1.queryDBGeneratorEx(ctx.request.body, CropPackage_1.cropPackageJoin);
            try {
                let orderdocInfo = await CropPackage_1.CropPackage.findAndCount(query);
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
                    let count = await CropPackage.count(countQuery);
                    if (0 === count) {
                        resp.totalPage = 0;
                    } else if (resp.maxRows > 0) {
                        resp.totalPage = Math.ceil(count / resp.maxRows);
                    } else {
                        resp.totalPage = 1;
                    }
    
                    if (undefined === query.offset || (query.offset && query.offset < count)) {
                        let cropdoclist = await CropPackage.findAll(query);
                        if (cropdoclist && cropdoclist.length > 0) {
                            cropdoclist.map((item) => {
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
     * @api {post} /cropPackage [裁剪分包]-新增
     * @apiDescription 新增裁剪分包
     * @apiGroup Crop
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number} crop 裁剪編號
     * @apiParam {String} size 尺寸
     * @apiParam {Number} packageNumber 包號
     * @apiParam {Number} layerAmount 層數
     * @apiParam {Mix} [others] 其他欄位，請參考: <a href="#cropPackage">裁剪分包欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/cropPackage
     * Body:
     * {
     *   "crop": 11222,
     *   "packageNumber": 12,
     *   "size": "S",
     *   "layerAmount": 2,
     *   ...........
     * }
     * @apiSuccess (Success 200) {String} id 裁剪分包的資料庫唯一ID，可以拿來查詢或是修改使用
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "id": "5b6d0d03993dc24293de551c"
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    cropPackageRouter.post('/cropPackage', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:124', 400);
        }
        else {
            try {
                let code = new CropPackage_1.CropPackage(ctx.request.body);
                let codedata = await code.save();
                if (codedata && codedata.id) {
                    let res = {
                        id: codedata.id
                    };
                    ctx.body = res;
                    ctx.status = 200;
                    ctx.respond = true;
                }
                else {
                    ctx.throw('db.invalidParameters:139', 400);
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:143', 400);
            }
        }
    });
    /**
     * @api {post} /cropPackage/update [裁剪分包]-修改
     * @apiDescription 修改裁剪分包資料
     * @apiGroup Crop
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Object} condition 符合此條件的裁剪分包會被修改
     * @apiParam {Number} condition.id 裁剪分包編號，目前只開放依照裁剪分包編號修改，將來若有需要批次修改的，再增加欄位
     * @apiParam {Object} update 欲修改的欄位
     * @apiParam {ooo} update.xxx 只需要填欲修改的欄位，沒有要修改的就不用填。欄位請參考: <a href="#cropPackage">裁剪分包欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/cropPackage/update
     * Body:
     * {
     *   "condition": {
     *     id: 123456,
     *   },
     *   "update": {
     *     "packageNumber": 12,
     *     ...........
     *   }
     * }
     * @apiSuccess (Success 200) {Number} updateCount 修改成功的裁剪分包筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "updateCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    cropPackageRouter.post('/cropPackage/update', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:184', 400);
        }
        else if (false === dbquery_1.checkRequestParamObject(ctx.request.body.condition)) {
            ctx.throw('db.invalidParameters:187', 400);
        }
        else if (false === dbquery_1.checkRequestParamObject(ctx.request.body.update)) {
            ctx.throw('db.invalidParameters:188', 400);
        }
        else {
            try {
                let query = {
                    where: ctx.request.body.condition,
                };
                let updateres = await CropPackage_1.CropPackage.update(ctx.request.body.update, query);
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
     * @api {delete} /cropPackage [裁剪分包]-刪除
     * @apiDescription 刪除裁剪分包
     * @apiGroup Crop
     * @apiVersion 0.0.1
     * @apiParam {Number} id 裁剪分包編號
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/cropPackage
     * Body:
     * {
     *   "id": 123456
     * }
     * @apiSuccess (Success 200) {Number} deleteCount 刪除成功的裁剪分包筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "deleteCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    cropPackageRouter.delete('/cropPackage', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:235', 400);
        }
        else {
            try {
                let condition = {
                    where: ctx.request.body
                };
                let delcount = await CropPackage_1.CropPackage.destroy(condition);
                if (null !== delcount && undefined !== delcount) {
                    let res = {
                        deleteCount: delcount
                    };
                    ctx.body = res;
                    ctx.status = 200;
                    ctx.respond = true;
                }
                else {
                    ctx.throw('db.invalidParameters:252', 400);
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:256', 400);
            }
        }
    });
    /**
     * @api {post} /cropPackage/bulk [裁剪分包]-新增多筆
     * @apiDescription 新增多筆裁剪分包
     * @apiGroup Crop
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number} crop 裁剪編號
     * @apiParam {String} size 尺寸
     * @apiParam {Number} packageNumber 包號
     * @apiParam {Number} layerAmount 層數
     * @apiParam {Mix} [others] 其他欄位，請參考: <a href="#cropPackage">裁剪分包欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/cropPackage/bulk
     * Body:
     * [
     *   {
     *     "crop": 11222,
     *     "packageNumber": 12,
     *     "size": "S",
     *     "layerAmount": 2,
     *     ...........
     *   },
     *   ......
     * ]
     * @apiSuccess (Success 200) {Array} id 裁剪分包的資料庫唯一ID，可以拿來查詢或是修改使用
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "id": [1,2,3]
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    cropPackageRouter.post('/cropPackage/bulk', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:127', 400);
        }
        else {
            try {
                let orderdelidata = await CropPackage_1.CropPackage.bulkCreate(ctx.request.body);
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
