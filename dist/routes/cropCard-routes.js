"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CropCard_1 = require("../database/models/CropCard");
const RFID_1 = require("../database/models/RFID");
const dbquery_1 = require("../database/dbquery");
// export const accRouter = new KoaRouter();
exports.registerCropCardAPI = function (cropCardRouter) {
    /**
     * @api {post} /cropCard/search [裁剪製卡]-查詢
     * @apiDescription 查詢符合條件的裁剪製卡，並將結果分頁回傳
     * @apiGroup Crop
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number=0} [pageIndex] 頁碼
     * @apiParam {Number=100} [maxRows] 每一頁的最大筆數
     * @apiParam {Object} [sort] 將結果指定欄位排序。1是從小到大排序，-1是從大到小。可指定的欄位請參考: <a href="#cropCard">裁剪製卡欄位定義</a> <p> 例如根據<code>bundleNumber</code>從小到大排序就是：<code>{"bundleNumber":1}</code>
     * @apiParam {Object} [query] 查詢條件。可以指定欄位等於某個值，或是介於某個範圍。範圍用<code>[大於某值，小於某值]</code>來描述，範圍中的兩個值其中之一，可以設定為<code>null</code>，表示不指定，但不能兩者皆為<code>null</code><p> 例如想指定<code>bundleNumber</code>大於0的裁剪製卡就是：<code>{"bundleNumber": [0, null]}</code>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/cropCard/search
     * Body:
     * {
     *   "pageIndex": 0,
     *   "maxRows": 3,
     *   "sort": {
     *     "id": 1
     *   },
     *   "query": {
     *      "bundleNumber": 12
     *   }
     * }
     * @apiSuccess (Success 200) {Number} pageIndex 目前的頁碼
     * @apiSuccess (Success 200) {Number} maxRows 每一頁的最大筆數
     * @apiSuccess (Success 200) {Number} totalPage 總頁數
     * @apiSuccess (Success 200) {Array} records 查詢的結果。各欄位定義請參考: <a href="#cropCard">裁剪製卡欄位定義</a>
     * @apiSuccessExample {json} Response Example
     * {
     *   "pageIndex": 1,
     *   "maxRows": 100,
     *   "totalPage": 2,
     *   "records": [{
     *     "bundleNumber": 12,
     *     "colorCode": 11112,
     *     "bundleNumber": 12,
     *     "amount": 12,
     *     "rfid": 1002,
     *     ...
     *     },
     *     ...
     *   ]
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    cropCardRouter.post('/cropCard/search', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:59', 400);
        }
        else {
            let resp = dbquery_1.queryResponsePacket(ctx.request.body);
            //let countQuery = queryTotalCount < CropCard > (ctx.request.body);
            //let query = queryDBGenerator < CropCard > (ctx.request.body);
            let query = dbquery_1.queryDBGeneratorEx(ctx.request.body, CropCard_1.cropCardJoin);
            try {
                let orderdocInfo = await CropCard_1.CropCard.findAndCount(query);
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
                    let count = await CropCard.count(countQuery);
                    if (0 === count) {
                        resp.totalPage = 0;
                    } else if (resp.maxRows > 0) {
                        resp.totalPage = Math.ceil(count / resp.maxRows);
                    } else {
                        resp.totalPage = 1;
                    }
    
                    if (undefined === query.offset || (query.offset && query.offset < count)) {
                        let cropdoclist = await CropCard.findAll(query);
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
     * @api {post} /cropCard [裁剪製卡]-新增
     * @apiDescription 新增裁剪製卡
     * @apiGroup Crop
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number} crop 裁剪編號
     * @apiParam {Number} colorCode 色號
     * @apiParam {Number} bundleNumber 扎號
     * @apiParam {Number} amount 數量
     * @apiParam {Number} rfid RFID編號，也可以直接使用rfid.cardNumber來指定RFID卡號，見範例。
     * @apiParam {Mix} [others] 其他欄位，請參考: <a href="#cropCard">裁剪製卡欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/cropCard
     * Body:
     * {
     *   "crop": 11222,
     *   "colorCode": 11112,
     *   "bundleNumber": 12,
     *   "amount": 12,
     *   "rfid": {
     *      "cardNumber": "123-456-789-XYZ"
     *   },
     *   ...........
     * }
     * @apiSuccess (Success 200) {String} id 裁剪製卡的資料庫唯一ID，可以拿來查詢或是修改使用
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "id": "5b6d0d03993dc24293de551c"
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    cropCardRouter.post('/cropCard', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:124', 400);
        }
        else {
            try {
                if ('object' === typeof ctx.request.body.rfid && ctx.request.body.rfid.cardNumber) {
                    let sqlcmd = 'SELECT * FROM RFID WHERE cardNumber = "' + ctx.request.body.rfid.cardNumber + '"';
                    let queryRes = await RFID_1.RFID.sequelize.query(sqlcmd);
                    if (queryRes && Array.isArray(queryRes) && Array.isArray(queryRes[0]) && queryRes[0].length > 0) {
                        ctx.request.body.rfid = Number.parseInt(queryRes[0][0].id);
                    }
                    else {
                        let rfid = new RFID_1.RFID({
                            cardNumber: ctx.request.body.rfid.cardNumber
                        });
                        let rfidData = await rfid.save();
                        if (rfidData && rfidData.id) {
                            ctx.request.body.rfid = rfidData.id;
                        }
                        else {
                            return ctx.throw('api.invalidParameters:178', 400);
                        }
                    }
                }
                let code = new CropCard_1.CropCard(ctx.request.body);
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
     * @api {post} /cropCard/update [裁剪製卡]-修改
     * @apiDescription 修改裁剪製卡資料
     * @apiGroup Crop
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Object} condition 符合此條件的裁剪製卡會被修改
     * @apiParam {Number} condition.id 裁剪製卡編號，目前只開放依照裁剪製卡編號修改，將來若有需要批次修改的，再增加欄位
     * @apiParam {Object} update 欲修改的欄位
     * @apiParam {ooo} update.xxx 只需要填欲修改的欄位，沒有要修改的就不用填。欄位請參考: <a href="#cropCard">裁剪製卡欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/cropCard/update
     * Body:
     * {
     *   "condition": {
     *     id: 123456,
     *   },
     *   "update": {
     *     "colorCode": 11112,
     *     "bundleNumber": 12,
     *     ...........
     *   }
     * }
     * @apiSuccess (Success 200) {Number} updateCount 修改成功的裁剪製卡筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "updateCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    cropCardRouter.post('/cropCard/update', async (ctx) => {
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
                let updateres = await CropCard_1.CropCard.update(ctx.request.body.update, query);
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
     * @api {delete} /cropCard [裁剪製卡]-刪除
     * @apiDescription 刪除裁剪製卡
     * @apiGroup Crop
     * @apiVersion 0.0.1
     * @apiParam {Number} id 裁剪製卡編號
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/cropCard
     * Body:
     * {
     *   "id": 123456
     * }
     * @apiSuccess (Success 200) {Number} deleteCount 刪除成功的裁剪製卡筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "deleteCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    cropCardRouter.delete('/cropCard', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:235', 400);
        }
        else {
            try {
                let condition = {
                    where: ctx.request.body
                };
                let delcount = await CropCard_1.CropCard.destroy(condition);
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
     * @api {post} /cropCard/completedAmount [裁剪製卡]-統計達成件數
     * @apiDescription 根據訂單編號，或是訂單號與交期，統計達成件數
     * @apiGroup Crop
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number} order 訂單資料庫唯一編號
     * @apiParam {String} order.orderID 訂單號
     * @apiParam {String} order.deliveryDate 訂單交期
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/cropCard/completedAmount
     * Body:
     * {
     *   "order": 1
     * }
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/cropCard/completedAmount
     * Body:
     * {
     *   "order": {
     *     "orderID": "0001",
     *     "deliveryDate": "2018-12-31"
     *   }
     * }
     * @apiSuccess (Success 200) {Number} colorCode 色號編碼
     * @apiSuccess (Success 200) {String} code 色碼
     * @apiSuccess (Success 200) {String} color 顏色
     * @apiSuccess (Success 200) {String} size 尺碼
     * @apiSuccess (Success 200) {Number} amount 達成數量
     * @apiSuccess (Success 200) {Number} totalAmount 計畫總數量
     * @apiSuccess (Success 200) {Number} diff 差異數量
     * @apiSuccessExample {json} Response Example
     * [
     *   {
     *       "order": 2,
     *      "colorCode": 1,
     *      "code": "1001",
     *      "color": "黑色",
     *      "size": "国标",
     *      "amount": "60",
     *      "totalAmount": "6000",
     *      "diff": "5940"
     *   },
     *   .............
     * ]
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    cropCardRouter.post('/cropCard/completedAmount', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:127', 400);
        }
        else {
            try {
                let inCond = '';
                if ('object' === typeof ctx.request.body.order && ctx.request.body.order.orderID && ctx.request.body.order.deliveryDate) {
                    let sqlcmd = 'SELECT O.id FROM `Order` AS O WHERE O.orderID = "' + ctx.request.body.order.orderID + '" AND O.deliveryDate = "' + ctx.request.body.order.deliveryDate + '"';
                    let queryRes = await CropCard_1.CropCard.sequelize.query(sqlcmd);
                    if (queryRes && Array.isArray(queryRes) && Array.isArray(queryRes[0])) {
                        queryRes[0].map((item) => {
                            if (inCond.length === 0) {
                                inCond = inCond + item.id;
                            }
                            else {
                                inCond = inCond + ',' + item.id;
                            }
                        });
                    }
                    if (inCond.length === 0) {
                        ctx.body = [];
                        ctx.status = 200;
                        ctx.respond = true;
                        return;
                    }
                }
                else if ('number' === typeof ctx.request.body.order || 'string' === typeof ctx.request.body.order) {
                    inCond = inCond + ctx.request.body.order;
                }
                if (inCond.length > 0) {
                    inCond = 'AND O.id IN (' + inCond + ')';
                }
                let sqlcmd = 'SELECT O.id AS `order`, ODP.colorCode, C.code, C.color, ODP.size, SUM(CC.amount) AS amount, SUM(ODP.totalAmount) AS totalAmount, SUM(ODP.totalAmount) - SUM(CC.amount) AS diff FROM CropCard AS CC, ProductionScheduling AS PS, `Order` AS O, OrderDeliveryPlan AS ODP, ColorCode AS C WHERE CC.productionScheduling = PS.id AND PS.orderDeliveryPlan = ODP.id AND ODP.order = O.id AND ODP.colorCode = C.id ' + inCond + ' GROUP BY CC.bundleNumber, CC.productionScheduling';
                let queryRes = await CropCard_1.CropCard.sequelize.query(sqlcmd);
                if (queryRes && Array.isArray(queryRes) && Array.isArray(queryRes[0])) {
                    let res = [];
                    queryRes[0].map((item) => {
                        res.push(item);
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
