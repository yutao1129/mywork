"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const QualityInspectionResult_1 = require("../database/models/QualityInspectionResult");
const dbquery_1 = require("../database/dbquery");
// export const accRouter = new KoaRouter();
exports.registerQualityInspResAPI = function (qualInspResRouter) {
    /**
     * @api {post} /qualityInspectionResult/search [品檢結果]-查詢
     * @apiDescription 查詢符合條件的品檢結果，並將結果分頁回傳
     * @apiGroup Production
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number=0} [pageIndex] 頁碼
     * @apiParam {Number=100} [maxRows] 每一頁的最大筆數
     * @apiParam {Object} [sort] 將結果指定欄位排序。1是從小到大排序，-1是從大到小。可指定的欄位請參考: <a href="#qualityInspectionResult">品檢結果欄位定義</a> <p> 例如根據<code>pass</code>從小到大排序就是：<code>{"pass":1}</code>
     * @apiParam {Object} [query] 查詢條件。可以指定欄位等於某個值，或是介於某個範圍。範圍用<code>[大於某值，小於某值]</code>來描述，範圍中的兩個值其中之一，可以設定為<code>null</code>，表示不指定，但不能兩者皆為<code>null</code><p> 例如想指定<code>pass</code>大於0的品檢結果就是：<code>{"pass": [0, null]}</code>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/qualityInspectionResult/search
     * Body:
     * {
     *   "pageIndex": 0,
     *   "maxRows": 3,
     *   "sort": {
     *     "id": 1
     *   },
     *   "query": {
     *      "qualityInspection": 1002
     *   }
     * }
     * @apiSuccess (Success 200) {Number} pageIndex 目前的頁碼
     * @apiSuccess (Success 200) {Number} maxRows 每一頁的最大筆數
     * @apiSuccess (Success 200) {Number} totalPage 總頁數
     * @apiSuccess (Success 200) {Array} records 查詢的結果。各欄位定義請參考: <a href="#qualityInspectionResult">品檢結果欄位定義</a>
     * @apiSuccessExample {json} Response Example
     * {
     *   "pageIndex": 1,
     *   "maxRows": 100,
     *   "totalPage": 2,
     *   "records": [{
     *     "qualityInspection": 1002,
     *     "category": "xxx",
     *     "problem": "ooo",
     *     ...
     *     },
     *     ...
     *   ]
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    qualInspResRouter.post('/qualityInspectionResult/search', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:63', 400);
        }
        else {
            let resp = dbquery_1.queryResponsePacket(ctx.request.body);
            //let countQuery = queryTotalCount < QualityInspectionResult > (ctx.request.body);
            //let query = queryDBGenerator < QualityInspectionResult > (ctx.request.body);
            let query = dbquery_1.queryDBGeneratorEx(ctx.request.body, QualityInspectionResult_1.qualityInspectionResultJoin);
            try {
                let orderdocInfo = await QualityInspectionResult_1.QualityInspectionResult.findAndCount(query);
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
                    let count = await QualityInspectionResult.count(countQuery);
                    if (0 === count) {
                        resp.totalPage = 0;
                    } else if (resp.maxRows > 0) {
                        resp.totalPage = Math.ceil(count / resp.maxRows);
                    } else {
                        resp.totalPage = 1;
                    }
    
                    if (undefined === query.offset || (query.offset && query.offset < count)) {
                        let qidoclist = await QualityInspectionResult.findAll(query);
                        if (qidoclist && qidoclist.length > 0) {
                            qidoclist.map((item) => {
                                let itemFmt = item.toJSON();
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
                ctx.throw('db.invalidQuery:97', 400);
            }
        }
    });
    /**
     * @api {post} /qualityInspectionResult [品檢結果]-新增
     * @apiDescription 新增品檢結果
     * @apiGroup Production
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number} qualityInspection 品檢編號
     * @apiParam {Number} worker 工人編號
     * @apiParam {Number} pass 合格數量
     * @apiParam {Mix} [others] 其他欄位，請參考: <a href="#qualityInspectionResult">品檢結果欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/qualityInspectionResult
     * Body:
     * {
     *   "qualityInspection": 1002,
     *   "category": "xxx",
     *   "problem": "ooo",
     *   ...........
     * }
     * @apiSuccess (Success 200) {String} id 品檢結果的資料庫唯一ID，可以拿來查詢或是修改使用
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "id": "5b6d0d03993dc24293de551c"
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    qualInspResRouter.post('/qualityInspectionResult', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:128', 400);
        }
        else {
            try {
                let qi = new QualityInspectionResult_1.QualityInspectionResult(ctx.request.body);
                let qidoc = await qi.save();
                if (qidoc && qidoc.id) {
                    let res = {
                        id: qidoc.id
                    };
                    ctx.body = res;
                    ctx.status = 200;
                    ctx.respond = true;
                }
                else {
                    ctx.throw('db.invalidParameters:143', 400);
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:146', 400);
            }
        }
    });
    /**
     * @api {post} /qualityInspectionResult/update [品檢結果]-修改
     * @apiDescription 修改品檢結果資料
     * @apiGroup Production
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Object} condition 符合此條件的品檢結果會被修改
     * @apiParam {Number} condition.id 品檢結果編號，目前只開放依照品檢結果編號修改，將來若有需要批次修改的，再增加欄位
     * @apiParam {Object} update 欲修改的欄位
     * @apiParam {ooo} update.xxx 只需要填欲修改的欄位，沒有要修改的就不用填。欄位請參考: <a href="#qualityInspectionResult">品檢結果欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/qualityInspectionResult/update
     * Body:
     * {
     *   "condition": {
     *     id: 123456,
     *   },
     *   "update": {
     *     "problem": "ooo",
     *     ...........
     *   }
     * }
     * @apiSuccess (Success 200) {Number} updateCount 修改成功的品檢結果筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "updateCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    qualInspResRouter.post('/qualityInspectionResult/update', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:185', 400);
        }
        else if (false === dbquery_1.checkRequestParamObject(ctx.request.body.condition)) {
            ctx.throw('db.invalidParameters:187', 400);
        }
        else if (false === dbquery_1.checkRequestParamObject(ctx.request.body.update)) {
            ctx.throw('db.invalidParameters:189', 400);
        }
        else {
            try {
                let query = {
                    where: ctx.request.body.condition,
                };
                let updateres = await QualityInspectionResult_1.QualityInspectionResult.update(ctx.request.body.update, query);
                if (updateres && Array.isArray(updateres)) {
                    let res = {
                        updateCount: updateres[0]
                    };
                    ctx.body = res;
                    ctx.status = 200;
                    ctx.respond = true;
                }
                else {
                    ctx.throw('db.invalidParameters:206', 400);
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:210', 400);
            }
        }
    });
    /**
     * @api {delete} /qualityInspectionResult [品檢結果]-刪除
     * @apiDescription 刪除品檢結果
     * @apiGroup Production
     * @apiVersion 0.0.1
     * @apiParam {Number} id 品檢結果編號
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/qualityInspectionResult
     * Body:
     * {
     *   "id": 123456
     * }
     * @apiSuccess (Success 200) {Number} deleteCount 刪除成功的品檢結果筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "deleteCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    qualInspResRouter.delete('/qualityInspectionResult', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:239', 400);
        }
        else {
            try {
                let condition = {
                    where: ctx.request.body
                };
                let delcount = await QualityInspectionResult_1.QualityInspectionResult.destroy(condition);
                if (null !== delcount && undefined !== delcount) {
                    let res = {
                        deleteCount: delcount
                    };
                    ctx.body = res;
                    ctx.status = 200;
                    ctx.respond = true;
                }
                else {
                    ctx.throw('db.invalidParameters:256', 400);
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:260', 400);
            }
        }
    });
    /**
     * @api {post} /qualityInspectionResult/bulk [品檢結果]-新增多筆
     * @apiDescription 新增多筆品檢結果
     * @apiGroup Production
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number} crop 裁剪編號
     * @apiParam {String} size 尺寸
     * @apiParam {Number} packageNumber 包號
     * @apiParam {Number} layerAmount 層數
     * @apiParam {Mix} [others] 其他欄位，請參考: <a href="#qualityInspectionResult">品檢結果欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/qualityInspectionResult/bulk
     * Body:
     * [
     *   {
     *     "qualityInspection": 1002,
     *     "category": "xxx",
     *     "problem": "ooo",
     *     ...........
     *   },
     *   ......
     * ]
     * @apiSuccess (Success 200) {Array} id 品檢結果的資料庫唯一ID，可以拿來查詢或是修改使用
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "id": [1,2,3]
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    qualInspResRouter.post('/qualityInspectionResult/bulk', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:127', 400);
        }
        else {
            try {
                let orderdelidata = await QualityInspectionResult_1.QualityInspectionResult.bulkCreate(ctx.request.body);
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
