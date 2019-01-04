"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PurchasePlanAttachment_1 = require("../database/models/PurchasePlanAttachment");
const dbquery_1 = require("../database/dbquery");
// export const accRouter = new KoaRouter();
exports.registerPurchasePlanAttachAPI = function (purchPlanAttRouter) {
    /**
     * @api {post} /purchasePlanAttachment/search [生產採購計劃項目附件]-查詢
     * @apiDescription 查詢符合條件的生產採購計劃項目附件，並將結果分頁回傳
     * @apiGroup Warehouse
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number=0} [pageIndex] 頁碼
     * @apiParam {Number=100} [maxRows] 每一頁的最大筆數
     * @apiParam {Object} [sort] 將結果指定欄位排序。1是從小到大排序，-1是從大到小。可指定的欄位請參考: <a href="#purchasePlanAttachment">生產採購計劃項目附件欄位定義</a> <p> 例如根據<code>id</code>從小到大排序就是：<code>{"id":1}</code>
     * @apiParam {Object} [query] 查詢條件。可以指定欄位等於某個值，或是介於某個範圍。範圍用<code>[大於某值，小於某值]</code>來描述，範圍中的兩個值其中之一，可以設定為<code>null</code>，表示不指定，但不能兩者皆為<code>null</code><p> 例如想指定<code>id</code>大於0的生產採購計劃項目附件就是：<code>{"id": [0, null]}</code>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/purchasePlanAttachment/search
     * Body:
     * {
     *   "pageIndex": 0,
     *   "maxRows": 3,
     *   "sort": {
     *     "id": 1
     *   },
     *   "query": {
     *      "purchaseItem": 1111
     *   }
     * }
     * @apiSuccess (Success 200) {Number} pageIndex 目前的頁碼
     * @apiSuccess (Success 200) {Number} maxRows 每一頁的最大筆數
     * @apiSuccess (Success 200) {Number} totalPage 總頁數
     * @apiSuccess (Success 200) {Array} records 查詢的結果。各欄位定義請參考: <a href="#purchasePlanAttachment">生產採購計劃項目附件欄位定義</a>
     * @apiSuccessExample {json} Response Example
     * {
     *   "pageIndex": 1,
     *   "maxRows": 100,
     *   "totalPage": 2,
     *   "records": [{
     *     "purchaseItem": 1111,
     *     "attachment": 2222,
     *     ...
     *     },
     *     ...
     *   ]
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    purchPlanAttRouter.post('/purchasePlanAttachment/search', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:63', 400);
        }
        else {
            let resp = dbquery_1.queryResponsePacket(ctx.request.body);
            //let countQuery = queryTotalCount < PurchasePlanAttachment > (ctx.request.body);
            //let query = queryDBGenerator < PurchasePlanAttachment > (ctx.request.body);
            let query = dbquery_1.queryDBGeneratorEx(ctx.request.body, PurchasePlanAttachment_1.purchasePlanAttachmentJoin);
            try {
                let orderdocInfo = await PurchasePlanAttachment_1.PurchasePlanAttachment.findAndCount(query);
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
                    let count = await PurchasePlanAttachment.count(countQuery);
                    if (0 === count) {
                        resp.totalPage = 0;
                    } else if (resp.maxRows > 0) {
                        resp.totalPage = Math.ceil(count / resp.maxRows);
                    } else {
                        resp.totalPage = 1;
                    }
    
                    if (undefined === query.offset || (query.offset && query.offset < count)) {
                        let purchdoclist = await PurchasePlanAttachment.findAll(query);
                        if (purchdoclist && purchdoclist.length > 0) {
                            purchdoclist.map((item) => {
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
     * @api {post} /purchasePlanAttachment [生產採購計劃項目附件]-新增
     * @apiDescription 新增生產採購計劃項目附件
     * @apiGroup Warehouse
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number} purchaseItem 生產採購計劃項目編號
     * @apiParam {Number} attachment 附件/圖片編號
     * @apiParam {Mix} [others] 其他欄位，請參考: <a href="#purchasePlanAttachment">生產採購計劃項目附件欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/purchasePlanAttachment
     * Body:
     * {
     *   "purchaseItem": 1111,
     *   "attachment": 2222,
     *   ...........
     * }
     * @apiSuccess (Success 200) {String} id 生產採購計劃項目附件的資料庫唯一ID，可以拿來查詢或是修改使用
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "id": "5b6d0d03993dc24293de551c"
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    purchPlanAttRouter.post('/purchasePlanAttachment', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:128', 400);
        }
        else {
            try {
                let purch = new PurchasePlanAttachment_1.PurchasePlanAttachment(ctx.request.body);
                let purchdoc = await purch.save();
                if (purchdoc && purchdoc.id) {
                    let res = {
                        id: purchdoc.id
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
     * @api {post} /purchasePlanAttachment/update [生產採購計劃項目附件]-修改
     * @apiDescription 修改生產採購計劃項目附件資料
     * @apiGroup Warehouse
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Object} condition 符合此條件的生產採購計劃項目附件會被修改
     * @apiParam {Number} condition.id 生產採購計劃項目附件編號，目前只開放依照生產採購計劃項目附件編號修改，將來若有需要批次修改的，再增加欄位
     * @apiParam {Object} update 欲修改的欄位
     * @apiParam {ooo} update.xxx 只需要填欲修改的欄位，沒有要修改的就不用填。欄位請參考: <a href="#purchasePlanAttachment">生產採購計劃項目附件欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/purchasePlanAttachment/update
     * Body:
     * {
     *   "condition": {
     *     id: 123456,
     *   },
     *   "update": {
     *     "attachment": 2222,
     *     ...........
     *   }
     * }
     * @apiSuccess (Success 200) {Number} updateCount 修改成功的生產採購計劃項目附件筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "updateCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    purchPlanAttRouter.post('/purchasePlanAttachment/update', async (ctx) => {
        ctx.body = '';
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
                let updateres = await PurchasePlanAttachment_1.PurchasePlanAttachment.update(ctx.request.body.update, query);
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
     * @api {delete} /purchasePlanAttachment [生產採購計劃項目附件]-刪除
     * @apiDescription 刪除生產採購計劃項目附件
     * @apiGroup Warehouse
     * @apiVersion 0.0.1
     * @apiParam {Number} id 生產採購計劃項目附件編號
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/purchasePlanAttachment
     * Body:
     * {
     *   "id": 123456
     * }
     * @apiSuccess (Success 200) {Number} deleteCount 刪除成功的生產採購計劃項目附件筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "deleteCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    purchPlanAttRouter.delete('/purchasePlanAttachment', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:239', 400);
        }
        else {
            try {
                let condition = {
                    where: ctx.request.body
                };
                let delcount = await PurchasePlanAttachment_1.PurchasePlanAttachment.destroy(condition);
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
};
