"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const OperationStep_1 = require("../database/models/OperationStep");
const dbquery_1 = require("../database/dbquery");
// export const accRouter = new KoaRouter();
exports.registerOperationStepAPI = function (operationStepRouter) {
    /**
     * @api {post} /operationStep/search [工藝環節]-查詢
     * @apiDescription 查詢符合條件的工藝環節，並將結果分頁回傳
     * @apiGroup Knowledge Base
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number=0} [pageIndex] 頁碼
     * @apiParam {Number=100} [maxRows] 每一頁的最大筆數
     * @apiParam {Object} [sort] 將結果指定欄位排序。1是從小到大排序，-1是從大到小。可指定的欄位請參考: <a href="#operationStep">工藝環節欄位定義</a> <p> 例如根據<code>stepName</code>從小到大排序就是：<code>{"stepName":1}</code>
     * @apiParam {Object} [query] 查詢條件。可以指定欄位等於某個值。
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/operationStep/search
     * Body:
     * {
     *   "pageIndex": 0,
     *   "maxRows": 3,
     *   "sort": {
     *     "stepName": 1
     *   },
     *   "query": {
     *      "stepName": "尺寸"
     *   }
     * }"stepName": "operation1"
     * @apiSuccess (Success 200) {Number} pageIndex 目前的頁碼
     * @apiSuccess (Success 200) {Number} maxRows 每一頁的最大筆數
     * @apiSuccess (Success 200) {Number} totalPage 總頁數
     * @apiSuccess (Success 200) {Array} records 查詢的結果。各欄位定義請參考: <a href="#operationStep">工藝環節欄位定義</a>
     * @apiSuccessExample {json} Response Example
     * {
     *   "pageIndex": 1,
     *   "maxRows": 100,
     *   "totalPage": 2,
     *   "records": [{
     *     "stepName": "尺寸",
     *     ...
     *     },
     *     ...
     *   ]
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    operationStepRouter.post('/operationStep/search', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:63', 400);
        }
        else {
            let resp = dbquery_1.queryResponsePacket(ctx.request.body);
            let countQuery = dbquery_1.queryTotalCount(ctx.request.body);
            let query = dbquery_1.queryDBGenerator(ctx.request.body);
            try {
                let count = await OperationStep_1.OperationStep.count(countQuery);
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
                    let operationStepdoclist = await OperationStep_1.OperationStep.findAll(query);
                    if (operationStepdoclist && operationStepdoclist.length > 0) {
                        operationStepdoclist.map((item) => {
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
     * @api {post} /operationStep [工藝環節]-新增
     * @apiDescription 新增工藝環節
     * @apiGroup Knowledge Base
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {String} stepName 工藝環節名稱
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/operationStep
     * Body:
     * {
     *   "stepName": "尺寸",
     * }
     * @apiSuccess (Success 200) {String} stepName 工藝環節名稱，此為工藝環節的資料庫唯一ID，可以拿來查詢或是修改使用
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "stepName": "尺寸"
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    operationStepRouter.post('/operationStep', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:128', 400);
        }
        else {
            try {
                let operationStep = new OperationStep_1.OperationStep(ctx.request.body);
                let operationStepdoc = await operationStep.save();
                if (operationStepdoc && operationStepdoc.stepName) {
                    let res = {
                        stepName: operationStepdoc.stepName
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
     * @api {delete} /operationStep [工藝環節]-刪除
     * @apiDescription 刪除工藝環節
     * @apiGroup Knowledge Base
     * @apiVersion 0.0.1
     * @apiParam {String} stepName 工藝環節名稱
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/operationStep
     * Body:
     * {
     *   "stepName": "尺寸"
     * }
     * @apiSuccess (Success 200) {Number} deleteCount 刪除成功的工藝環節筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "deleteCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    operationStepRouter.delete('/operationStep', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:175', 400);
        }
        else {
            try {
                let condition = {
                    where: ctx.request.body
                };
                let delcount = await OperationStep_1.OperationStep.destroy(condition);
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
