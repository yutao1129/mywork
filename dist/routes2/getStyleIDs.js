"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Style_1 = require("../database/models/Style");
const Material_1 = require("../database/models/Material");
const StyleOperation_1 = require("../database/models/StyleOperation");
const StyleProcess_1 = require("../database/models/StyleProcess");
const StyleQualityStandard_1 = require("../database/models/StyleQualityStandard");
const Client_1 = require("../database/models/Client");
const Order_1 = require("../database/models/Order");
const dbquery_1 = require("../database/dbquery");
// export const accRouter = new KoaRouter();
exports.registerStyleAPI = function (styleRouter) {
    /**
     * @api {post} /style/search [款式]-查詢
     * @apiDescription 查詢符合條件的款式，並將結果分頁回傳
     * @apiGroup Style
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number=0} [pageIndex] 頁碼
     * @apiParam {Number=100} [maxRows] 每一頁的最大筆數
     * @apiParam {Object} [sort] 將結果指定欄位排序。1是從小到大排序，-1是從大到小。可指定的欄位請參考: <a href="#style">款式欄位定義</a> <p> 例如根據<code>styleID</code>從小到大排序就是：<code>{"styleID":1}</code>
     * @apiParam {Object} [query] 查詢條件。可以指定欄位等於某個值，或是介於某個範圍。範圍用<code>[大於某值，小於某值]</code>來描述，範圍中的兩個值其中之一，可以設定為<code>null</code>，表示不指定，但不能兩者皆為<code>null</code><p> 例如想指定<code>styleID</code>大於0的款式就是：<code>{"styleID": [0, null]}</code>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/style/search
     * Body:
     * {
     *   "pageIndex": 0,
     *   "maxRows": 3,
     *   "sort": {
     *     "styleID": 1
     *   },
     *   "query": {
     *      "status": 0
     *   }
     * }
     * @apiSuccess (Success 200) {Number} pageIndex 目前的頁碼
     * @apiSuccess (Success 200) {Number} maxRows 每一頁的最大筆數
     * @apiSuccess (Success 200) {Number} totalPage 總頁數
     * @apiSuccess (Success 200) {Array} records 查詢的結果。各欄位定義請參考: <a href="#style">款式欄位定義</a>
     * @apiSuccessExample {json} Response Example
     * {
     *   "pageIndex": 1,
     *   "maxRows": 100,
     *   "totalPage": 2,
     *   "records": [{
     *     "styleID": "xxxx",
     *     "status": 0,
     *     ...
     *     },
     *     ...
     *   ]
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    styleRouter.post('/style/getStyleIDs', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:63', 400);
        }
        else {
            let resp = dbquery_1.queryResponsePacket(ctx.request.body);
            let query = dbquery_1.queryDBGenerator(ctx.request.body, Style_1.Style);
            try {
                let stylesResp = await Style_1.Style.findAndCount(query);
                let count = stylesResp.count;
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
                    if (stylesResp.rows && stylesResp.rows.length > 0) {
                        for (let item of stylesResp.rows) {
                            let itemFmt = item.toJSON();
                            resp.records.push(itemFmt);
                        }
                    }
                }
                ctx.body = resp;
                ctx.status = 200;
                ctx.respond = true;
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidQuery:94', 400);
            }
        }
    });

};
