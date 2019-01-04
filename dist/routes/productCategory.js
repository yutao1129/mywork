"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ProductCategory_1 = require("../database/models/ProductCategory");
const dbquery_1 = require("../database/dbquery");
//export const accRouter = new KoaRouter();
exports.registerProdCategoryAPI = function (prodCatRouter) {
    /**
     * @api {post} /productCategory/search [品類]-查詢
     * @apiDescription 查詢符合條件的品類，並將結果分頁回傳
     * @apiGroup Knowledge Base
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number=0} [pageIndex] 頁碼
     * @apiParam {Number=100} [maxRows] 每一頁的最大筆數
     * @apiParam {Object} [sort] 將結果指定欄位排序。1是從小到大排序，-1是從大到小。可指定的欄位請參考: <a href="#productCategory">品類欄位定義</a> <p> 例如根據<code>productCategoryName</code>從小到大排序就是：<code>{"productCategoryName":1}</code>
     * @apiParam {Object} [query] 查詢條件。可以指定欄位等於某個值。
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/productCategory/search
     * Body:
     * {
     *   "pageIndex": 0,
     *   "maxRows": 3,
     *   "sort": {
     *     "productCategoryName": 1
     *   },
     *   "query": {
     *      "productCategoryName": "品類01"
     *   }
     * }
     * @apiSuccess (Success 200) {Number} pageIndex 目前的頁碼
     * @apiSuccess (Success 200) {Number} maxRows 每一頁的最大筆數
     * @apiSuccess (Success 200) {Number} totalPage 總頁數
     * @apiSuccess (Success 200) {Array} records 查詢的結果。各欄位定義請參考: <a href="#productCategory">品類欄位定義</a>
     * @apiSuccessExample {json} Response Example
     * {
     *   "pageIndex": 1,
     *   "maxRows": 100,
     *   "totalPage": 2,
     *   "records": [{
     *     "productCategoryName": "品類01,
     *     },
     *     ...
     *   ]
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    prodCatRouter.post('/productCategory/search', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:63', 400);
        }
        else {
            let resp = dbquery_1.queryResponsePacket(ctx.request.body);
            let countQuery = dbquery_1.queryTotalCount(ctx.request.body);
            let query = dbquery_1.queryDBGenerator(ctx.request.body);
            try {
                let count = await ProductCategory_1.ProductCategory.count(countQuery);
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
                    let prodcatdoclist = await ProductCategory_1.ProductCategory.findAll(query);
                    if (prodcatdoclist && prodcatdoclist.length > 0) {
                        prodcatdoclist.map((item) => {
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
     * @api {post} /productCategory [品類]-新增
     * @apiDescription 新增品類
     * @apiGroup Knowledge Base
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {String} productCategoryName 品類名稱
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/productCategory
     * Body:
     * {
     *   "productCategoryName": "品類01",
     * }
     * @apiSuccess (Success 200) {String} productCategoryName 品類名稱，此為品類的資料庫唯一ID，可以拿來查詢或是修改使用
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "productCategoryName": "品類01"
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    prodCatRouter.post('/productCategory', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:128', 400);
        }
        else {
            try {
                let prod = new ProductCategory_1.ProductCategory(ctx.request.body);
                let proddoc = await prod.save();
                if (proddoc && proddoc.productCategoryName) {
                    let res = {
                        productCategoryName: proddoc.productCategoryName
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
     * @api {delete} /productCategory [品類]-刪除
     * @apiDescription 刪除品類
     * @apiGroup Knowledge Base
     * @apiVersion 0.0.1
     * @apiParam {String} productCategoryName 品類名稱
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/productCategory
     * Body:
     * {
     *   "productCategoryName": "品類01"
     * }
     * @apiSuccess (Success 200) {Number} deleteCount 刪除成功的品類筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "deleteCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    prodCatRouter.delete('/productCategory', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:175', 400);
        }
        else {
            try {
                let condition = {
                    where: ctx.request.body
                };
                let delcount = await ProductCategory_1.ProductCategory.destroy(condition);
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
