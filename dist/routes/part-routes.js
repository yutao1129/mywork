"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Part_1 = require("../database/models/Part");
const dbquery_1 = require("../database/dbquery");
// export const accRouter = new KoaRouter();
exports.registerPartAPI = function (partRouter) {
    /**
     * @api {post} /part/search [部件]-查詢
     * @apiDescription 查詢符合條件的部件，並將結果分頁回傳
     * @apiGroup Knowledge Base
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number=0} [pageIndex] 頁碼
     * @apiParam {Number=100} [maxRows] 每一頁的最大筆數
     * @apiParam {Object} [sort] 將結果指定欄位排序。1是從小到大排序，-1是從大到小。可指定的欄位請參考: <a href="#part">部件欄位定義</a> <p> 例如根據<code>partName</code>從小到大排序就是：<code>{"partName":1}</code>
     * @apiParam {Object} [query] 查詢條件。可以指定欄位等於某個值。
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/part/search
     * Body:
     * {
     *   "pageIndex": 0,
     *   "maxRows": 3,
     *   "sort": {
     *     "partName": 1
     *   },
     *   "query": {
     *      "partName": "前片"
     *   }
     * }
     * @apiSuccess (Success 200) {Number} pageIndex 目前的頁碼
     * @apiSuccess (Success 200) {Number} maxRows 每一頁的最大筆數
     * @apiSuccess (Success 200) {Number} totalPage 總頁數
     * @apiSuccess (Success 200) {Array} records 查詢的結果。各欄位定義請參考: <a href="#part">部件欄位定義</a>
     * @apiSuccessExample {json} Response Example
     * {
     *   "pageIndex": 1,
     *   "maxRows": 100,
     *   "totalPage": 2,
     *   "records": [{
     *     "partName": "前片",
     *     ...
     *     },
     *     ...
     *   ]
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    partRouter.post('/part/search', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:63', 400);
        }
        else {
            let resp = dbquery_1.queryResponsePacket(ctx.request.body);
            let countQuery = dbquery_1.queryTotalCount(ctx.request.body);
            let query = dbquery_1.queryDBGenerator(ctx.request.body);
            try {
                let count = await Part_1.Part.count(countQuery);
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
                    let partdoclist = await Part_1.Part.findAll(query);
                    if (partdoclist && partdoclist.length > 0) {
                        partdoclist.map((item) => {
                            let itemFmt = item.toJSON();
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
                ctx.throw('db.invalidQuery:97', 400);
            }
        }
    });
    /**
     * @api {post} /part [部件]-新增
     * @apiDescription 新增部件
     * @apiGroup Knowledge Base
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {String} partName 部件名稱
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/part
     * Body:
     * {
     *   "partName": "前片",
     * }
     * @apiSuccess (Success 200) {String} partName 部件名稱，此為部件的資料庫唯一ID，可以拿來查詢或是修改使用
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "partName": "前片"
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    partRouter.post('/part', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:128', 400);
        }
        else {
            try {
                let part = new Part_1.Part(ctx.request.body);
                let partdoc = await part.save();
                if (partdoc && partdoc.partName) {
                    let res = {
                        partName: partdoc.partName
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
                ctx.throw('db.invalidParameters:157', 400);
            }
        }
    });
    /**
     * @api {delete} /part [部件]-刪除
     * @apiDescription 刪除部件
     * @apiGroup Knowledge Base
     * @apiVersion 0.0.1
     * @apiParam {String} partName 部件名稱
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/part
     * Body:
     * {
     *   "partName": "前片"
     * }
     * @apiSuccess (Success 200) {Number} deleteCount 刪除成功的部件筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "deleteCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    partRouter.delete('/part', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:175', 400);
        }
        else {
            try {
                let condition = {
                    where: ctx.request.body
                };
                let delcount = await Part_1.Part.destroy(condition);
                if (null !== delcount && undefined !== delcount) {
                    let res = {
                        deleteCount: delcount
                    };
                    ctx.body = res;
                    ctx.status = 200;
                    ctx.respond = true;
                }
                else {
                    ctx.throw('db.invalidParameters:192', 400);
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:196', 400);
            }
        }
    });
};
