"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Template_1 = require("../database/models/Template");
const dbquery_1 = require("../database/dbquery");
// export const accRouter = new KoaRouter();
exports.registerTemplateAPI = function (templateRouter) {
    /**
     * @api {post} /template/search [樣板清單]-查詢
     * @apiDescription 查詢符合條件的樣板清單，並將結果分頁回傳
     * @apiGroup Knowledge Base
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number=0} [pageIndex] 頁碼
     * @apiParam {Number=100} [maxRows] 每一頁的最大筆數
     * @apiParam {Object} [sort] 將結果指定欄位排序。1是從小到大排序，-1是從大到小。可指定的欄位請參考: <a href="#template">樣板清單欄位定義</a> <p> 例如根據<code>templateName</code>從小到大排序就是：<code>{"templateName":1}</code>
     * @apiParam {Object} [query] 查詢條件。可以指定欄位等於某個值。
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/template/search
     * Body:
     * {
     *   "pageIndex": 0,
     *   "maxRows": 3,
     *   "sort": {
     *     "templateName": 1
     *   },
     *   "query": {
     *      "templateName": "前片"
     *   }
     * }
     * @apiSuccess (Success 200) {Number} pageIndex 目前的頁碼
     * @apiSuccess (Success 200) {Number} maxRows 每一頁的最大筆數
     * @apiSuccess (Success 200) {Number} totalPage 總頁數
     * @apiSuccess (Success 200) {Array} records 查詢的結果。各欄位定義請參考: <a href="#template">樣板清單欄位定義</a>
     * @apiSuccessExample {json} Response Example
     * {
     *   "pageIndex": 1,
     *   "maxRows": 100,
     *   "totalPage": 2,
     *   "records": [{
     *     "templateName": "前片",
     *     ...
     *     },
     *     ...
     *   ]
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    templateRouter.post('/template/search', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:63', 400);
        }
        else {
            let resp = dbquery_1.queryResponsePacket(ctx.request.body);
            let countQuery = dbquery_1.queryTotalCount(ctx.request.body);
            let query = dbquery_1.queryDBGenerator(ctx.request.body);
            try {
                let count = await Template_1.Template.count(countQuery);
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
                    let templatedoclist = await Template_1.Template.findAll(query);
                    if (templatedoclist && templatedoclist.length > 0) {
                        templatedoclist.map((item) => {
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
     * @api {post} /template [樣板清單]-新增
     * @apiDescription 新增樣板清單
     * @apiGroup Knowledge Base
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {String} templateName 樣板清單名稱
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/template
     * Body:
     * {
     *   "templateName": "前片",
     * }
     * @apiSuccess (Success 200) {String} templateName 樣板清單名稱，此為樣板清單的資料庫唯一ID，可以拿來查詢或是修改使用
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "templateName": "前片"
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    templateRouter.post('/template', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:128', 400);
        }
        else {
            try {
                let template = new Template_1.Template(ctx.request.body);
                let templatedoc = await template.save();
                if (templatedoc && templatedoc.templateName) {
                    let res = {
                        templateName: templatedoc.templateName
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
     * @api {delete} /template [樣板清單]-刪除
     * @apiDescription 刪除樣板清單
     * @apiGroup Knowledge Base
     * @apiVersion 0.0.1
     * @apiParam {String} templateName 樣板清單名稱
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/template
     * Body:
     * {
     *   "templateName": "前片"
     * }
     * @apiSuccess (Success 200) {Number} deleteCount 刪除成功的樣板清單筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "deleteCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    templateRouter.delete('/template', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:175', 400);
        }
        else {
            try {
                let condition = {
                    where: ctx.request.body
                };
                let delcount = await Template_1.Template.destroy(condition);
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
