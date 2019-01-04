"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ProductionLine_1 = require("../database/models/ProductionLine");
const dbquery_1 = require("../database/dbquery");
// export const accRouter = new KoaRouter();
exports.registerProductionLineAPI = function (prodLineRouter) {
    /**
     * @api {post} /productionLine/search [產線]-查詢
     * @apiDescription 查詢符合條件的產線，並將結果分頁回傳
     * @apiGroup Production
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number=0} [pageIndex] 頁碼
     * @apiParam {Number=100} [maxRows] 每一頁的最大筆數
     * @apiParam {Object} [sort] 將結果指定欄位排序。1是從小到大排序，-1是從大到小。可指定的欄位請參考: <a href="#productionLine">產線欄位定義</a> <p> 例如根據<code>id</code>從小到大排序就是：<code>{"id":1}</code>
     * @apiParam {Object} [query] 查詢條件。可以指定欄位等於某個值，或是介於某個範圍。範圍用<code>[大於某值，小於某值]</code>來描述，範圍中的兩個值其中之一，可以設定為<code>null</code>，表示不指定，但不能兩者皆為<code>null</code><p> 例如想指定<code>id</code>大於0的產線就是：<code>{"id": [0, null]}</code>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/productionLine/search
     * Body:
     * {
     *   "pageIndex": 0,
     *   "maxRows": 3,
     *   "sort": {
     *     "id": 1
     *   },
     *   "query": {
     *      "team": 1111
     *   }
     * }
     * @apiSuccess (Success 200) {Number} pageIndex 目前的頁碼
     * @apiSuccess (Success 200) {Number} maxRows 每一頁的最大筆數
     * @apiSuccess (Success 200) {Number} totalPage 總頁數
     * @apiSuccess (Success 200) {Array} records 查詢的結果。各欄位定義請參考: <a href="#productionLine">產線欄位定義</a>
     * @apiSuccessExample {json} Response Example
     * {
     *   "pageIndex": 1,
     *   "maxRows": 100,
     *   "totalPage": 2,
     *   "records": [{
     *     "team": 1111,
     *     "station": 2222,
     *     "equipment": 3333,
     *     "pad": 4444,
     *     ...
     *     },
     *     ...
     *   ]
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    prodLineRouter.post('/productionLine/search', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:67', 400);
        }
        else {
            let resp = dbquery_1.queryResponsePacket(ctx.request.body);
            let query = dbquery_1.queryDBGeneratorEx(ctx.request.body, ProductionLine_1.productionLineJoin);
//            console.log('query')
 //           console.log(query)

/*
            if(query.order && query.order.length > 0){
                let ProductionLineAttributes = Object.keys(ProductionLine_1.ProductionLine.attributes)
                let orderKey = query.order[0][0];
                let orderValue = query.order[0][1];
                let flag = ProductionLineAttributes.includes(orderKey);
                if(!flag){
                    for(let value of query.include){
                        let modelAttributes = Object.keys(value.model.attributes);
                        if(modelAttributes.includes(orderKey)){
                            query.order = [[ {mode:value.model}, orderKey, orderValue ]];
                            break;
                        }
                    }
                }
            }else{

                for(let value of query.include){
                    if(value.model.name === 'Station'){
                        query.order = [[ {mode:value.model}, 'stationID', 'ASC' ]];
                        break;
                    }
                }
            }
*/

            for(let value of query.include){
                if(value.model.name === 'Station'){
                    query.order = [[ {mode:value.model}, 'stationID', 'ASC' ]];
                    break;
                }
            }
//            console.log('query')
//            console.log(query)

            try {
                let docs = await ProductionLine_1.ProductionLine.findAndCount(query);
                let count = docs.count;
                // let count = await Order.count(countQuery);
                if (0 === count) {
                    resp.totalPage = 0;
                }
                else if (resp.maxRows > 0) {
                    resp.totalPage = Math.ceil(count / resp.maxRows);
                }
                else {
                    resp.totalPage = 1;
                }
                if (docs && docs.rows) {
                    for (let item of docs.rows) {
                        resp.records.push(item.toJSON());
                    }

                }
                ctx.body = resp;
                ctx.status = 200;
                ctx.respond = true;
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalorderIDQuery:93', 400);
            }
        }
    });
    /**
     * @api {post} /productionLine [產線]-新增
     * @apiDescription 新增產線
     * @apiGroup Production
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number} team 班組編號
     * @apiParam {Number} station 工位編號
     * @apiParam {Number} equipment 設備編號
     * @apiParam {Number} pad PAD編號
     * @apiParam {Mix} [others] 其他欄位，請參考: <a href="#productionLine">產線欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/productionLine
     * Body:
     * {
     *   "team": 1111,
     *   "station": 2222,
     *   "equipment": 3333,
     *   "pad": 4444,
     *   ...........
     * }
     * @apiSuccess (Success 200) {String} id 產線的資料庫唯一ID，可以拿來查詢或是修改使用
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "id": "5b6d0d03993dc24293de551c"
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    prodLineRouter.post('/productionLine', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:133', 400);
        }
        else {
            try {
                let prodOut = new ProductionLine_1.ProductionLine(ctx.request.body);
                let prodOutData = await prodOut.save();
                if (prodOutData && prodOutData.id) {
                    let res = {
                        id: prodOutData.id
                    };
                    ctx.body = res;
                    ctx.status = 200;
                    ctx.respond = true;
                }
                else {
                    ctx.throw('db.invalidParameters:148', 400);
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:152', 400);
            }
        }
    });
    /**
     * @api {post} /productionLine/update [產線]-修改
     * @apiDescription 修改產線資料
     * @apiGroup Production
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Object} condition 符合此條件的產線會被修改
     * @apiParam {Number} condition.id 產線編號，目前只開放依照產線編號修改，將來若有需要批次修改的，再增加欄位
     * @apiParam {Object} update 欲修改的欄位
     * @apiParam {ooo} update.xxx 只需要填欲修改的欄位，沒有要修改的就不用填。欄位請參考: <a href="#productionLine">產線欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/productionLine/update
     * Body:
     * {
     *   "condition": {
     *     id: 123456,
     *   },
     *   "update": {
     *     "equipment": 3333,
     *     "pad": 4444,
     *     ...........
     *   }
     * }
     * @apiSuccess (Success 200) {Number} updateCount 修改成功的產線筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "updateCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    prodLineRouter.post('/productionLine/update', async (ctx) => {
        ctx.body = '';
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:193', 400);
        }
        else if (false === dbquery_1.checkRequestParamObject(ctx.request.body.condition)) {
            ctx.throw('db.invalidParameters:195', 400);
        }
        else if (false === dbquery_1.checkRequestParamObject(ctx.request.body.update)) {
            ctx.throw('db.invalidParameters:197', 400);
        }
        else {
            try {
                let query = {
                    where: ctx.request.body.condition,
                };
                let updateres = await ProductionLine_1.ProductionLine.update(ctx.request.body.update, query);
                if (updateres && Array.isArray(updateres)) {
                    let res = {
                        updateCount: updateres[0]
                    };
                    ctx.body = res;
                    ctx.status = 200;
                    ctx.respond = true;
                }
                else {
                    ctx.throw('db.invalidParameters:214', 400);
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:218', 400);
            }
        }
    });
    /**
     * @api {delete} /productionLine [產線]-刪除
     * @apiDescription 刪除產線
     * @apiGroup Production
     * @apiVersion 0.0.1
     * @apiParam {Number} id 產線編號
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/productionLine
     * Body:
     * {
     *   "id": 123456
     * }
     * @apiSuccess (Success 200) {Number} deleteCount 刪除成功的產線筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "deleteCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    prodLineRouter.delete('/productionLine', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:246', 400);
        }
        else {
            try {
                let condition = {
                    where: ctx.request.body
                };
                let delcount = await ProductionLine_1.ProductionLine.destroy(condition);
                if (null !== delcount && undefined !== delcount) {
                    let res = {
                        deleteCount: delcount
                    };
                    ctx.body = res;
                    ctx.status = 200;
                    ctx.respond = true;
                }
                else {
                    ctx.throw('db.invalidParameters:263', 400);
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:267', 400);
            }
        }
    });
};
