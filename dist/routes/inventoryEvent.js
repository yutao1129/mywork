"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const InventoryEvent_1 = require("../database/models/InventoryEvent");
const dbquery_1 = require("../database/dbquery");
//export const accRouter = new KoaRouter();
exports.registerInventoryEventAPI = function (inventRouter) {
    /**
     * @api {post} /inventoryEvent/search [倉儲物料庫存異動記錄]-查詢
     * @apiDescription 查詢符合條件的倉儲物料庫存異動記錄，並將結果分頁回傳
     * @apiGroup Warehouse
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number=0} [pageIndex] 頁碼
     * @apiParam {Number=100} [maxRows] 每一頁的最大筆數
     * @apiParam {Object} [sort] 將結果指定欄位排序。1是從小到大排序，-1是從大到小。可指定的欄位請參考: <a href="#inventoryEvent">倉儲物料庫存異動記錄欄位定義</a> <p> 例如根據<code>id</code>從小到大排序就是：<code>{"id":1}</code>
     * @apiParam {Object} [query] 查詢條件。可以指定欄位等於某個值，或是介於某個範圍。範圍用<code>[大於某值，小於某值]</code>來描述，範圍中的兩個值其中之一，可以設定為<code>null</code>，表示不指定，但不能兩者皆為<code>null</code><p> 例如想指定<code>id</code>大於0的倉儲物料庫存異動記錄就是：<code>{"id": [0, null]}</code>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/inventoryEvent/search
     * Body:
     * {
     *   "pageIndex": 0,
     *   "maxRows": 3,
     *   "sort": {
     *     "id": 1
     *   },
     *   "query": {
     *      "purchaseLength": 1000
     *   }
     * }
     * @apiSuccess (Success 200) {Number} pageIndex 目前的頁碼
     * @apiSuccess (Success 200) {Number} maxRows 每一頁的最大筆數
     * @apiSuccess (Success 200) {Number} totalPage 總頁數
     * @apiSuccess (Success 200) {Array} records 查詢的結果。各欄位定義請參考: <a href="#inventoryEvent">倉儲物料庫存異動記錄欄位定義</a>
     * @apiSuccessExample {json} Response Example
     * {
     *   "pageIndex": 1,
     *   "maxRows": 100,
     *   "totalPage": 2,
     *   "records": [{
     *     "purchaseLength": 1000,
     *     "executor": 1111,
     *     "eventType": "進貨",
     *     "receiver": 2222,
     *     ...
     *     },
     *     ...
     *   ]
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    inventRouter.post('/inventoryEvent/search', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:63', 400);
        }
        else {
            let resp = dbquery_1.queryResponsePacket(ctx.request.body);
            //let countQuery = queryTotalCount < InventoryEvent > (ctx.request.body);
            //let query = queryDBGenerator < InventoryEvent > (ctx.request.body);
            let query = dbquery_1.queryDBGeneratorEx(ctx.request.body, InventoryEvent_1.inventoryEventJoin);
            try {
                let orderdocInfo = await InventoryEvent_1.InventoryEvent.findAndCount(query);
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
                    let count = await InventoryEvent.count(countQuery);
                    if (0 === count) {
                        resp.totalPage = 0;
                    } else if (resp.maxRows > 0) {
                        resp.totalPage = Math.ceil(count / resp.maxRows);
                    } else {
                        resp.totalPage = 1;
                    }
    
                    if (undefined === query.offset || (query.offset && query.offset < count)) {
                        let inventdoclist = await InventoryEvent.findAll(query);
                        if (inventdoclist && inventdoclist.length > 0) {
                            inventdoclist.map((item) => {
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
                ctx.throw('db.invalidQuery:93', 400);
            }
        }
    });
    /**
     * @api {post} /inventoryEvent [倉儲物料庫存異動記錄]-新增
     * @apiDescription 新增倉儲物料庫存異動記錄
     * @apiGroup Warehouse
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number} orderMaterial 訂單物料項目記錄編碼
     * @apiParam {Date} eventTime 進出貨時間
     * @apiParam {Number} executor 進退貨人員
     * @apiParam {String} eventType 進退貨類型
     * @apiParam {Number} receiver 倉管人員
     * @apiParam {Mix} [others] 其他欄位，請參考: <a href="#inventoryEvent">倉儲物料庫存異動記錄欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/inventoryEvent
     * Body:
     * {
     *   "orderMaterial": 1000,
     *   "executor": 1111,
     *   "eventType": "進貨",
     *   "receiver": 2222,
     *   ...........
     * }
     * @apiSuccess (Success 200) {String} id 倉儲物料庫存異動記錄的資料庫唯一ID，可以拿來查詢或是修改使用
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "id": "5b6d0d03993dc24293de551c"
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    inventRouter.post('/inventoryEvent', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:126', 400);
        }
        else {
            try {
                let inventEvent = new InventoryEvent_1.InventoryEvent(ctx.request.body);
                let mData = await inventEvent.save();
                if (mData && mData.id) {
                    let res = {
                        id: mData.id
                    };
                    ctx.body = res;
                    ctx.status = 200;
                    ctx.respond = true;
                }
                else {
                    ctx.throw('db.invalidParameters:141', 400);
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:145', 400);
            }
        }
    });
    /**
     * @api {post} /inventoryEvent/update [倉儲物料庫存異動記錄]-修改
     * @apiDescription 修改倉儲物料庫存異動記錄資料
     * @apiGroup Warehouse
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Object} condition 符合此條件的倉儲物料庫存異動記錄會被修改
     * @apiParam {String} condition.id 倉儲物料庫存異動記錄編號，目前只開放依照倉儲物料庫存異動記錄編號修改，將來若有需要批次修改的，再增加欄位
     * @apiParam {Object} update 欲修改的欄位
     * @apiParam {ooo} update.xxx 只需要填欲修改的欄位，沒有要修改的就不用填。欄位請參考: <a href="#inventoryEvent">倉儲物料庫存異動記錄欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/inventoryEvent/update
     * Body:
     * {
     *   "condition": {
     *     "id": 123456,
     *   },
     *   "update": {
     *     "purchaseLength": 1000,
     *     "executor": 1111,
     *     "eventType": "進貨",
     *     "receiver": 2222,
     *     ...........
     *   }
     * }
     * @apiSuccess (Success 200) {Number} updateCount 修改成功的倉儲物料庫存異動記錄筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "updateCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    inventRouter.post('/inventoryEvent/update', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:183', 400);
        }
        else if (false === dbquery_1.checkRequestParamObject(ctx.request.body.condition)) {
            ctx.throw('db.invalidParameters:186', 400);
        }
        else if (false === dbquery_1.checkRequestParamObject(ctx.request.body.update)) {
            ctx.throw('db.invalidParameters:188', 400);
        }
        else {
            try {
                let query = {
                    where: ctx.request.body.condition,
                };
                let updateres = await InventoryEvent_1.InventoryEvent.update(ctx.request.body.update, query);
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
     * @api {delete} /inventoryEvent [倉儲物料庫存異動記錄]-刪除
     * @apiDescription 刪除倉儲物料庫存異動記錄
     * @apiGroup Warehouse
     * @apiVersion 0.0.1
     * @apiParam {String} id 倉儲物料庫存異動記錄編號
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/inventoryEvent
     * Body:
     * {
     *   "id": 123456
     * }
     * @apiSuccess (Success 200) {Number} deleteCount 刪除成功的倉儲物料庫存異動記錄筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "deleteCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    inventRouter.delete('/inventoryEvent', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:238', 400);
        }
        else {
            try {
                let condition = {
                    where: ctx.request.body
                };
                let delcount = await InventoryEvent_1.InventoryEvent.destroy(condition);
                if (null !== delcount && undefined !== delcount) {
                    let res = {
                        deleteCount: delcount
                    };
                    ctx.body = res;
                    ctx.status = 200;
                    ctx.respond = true;
                }
                else {
                    ctx.throw('db.invalidParameters:255', 400);
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:259', 400);
            }
        }
    });
    /**
     * @api {post} /inventoryEvent/bulk [倉儲物料庫存異動記錄]-新增多筆
     * @apiDescription 新增多筆倉儲物料庫存異動記錄
     * @apiGroup Warehouse
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number} orderMaterial 訂單物料項目記錄編碼
     * @apiParam {Date} eventTime 進出貨時間
     * @apiParam {Number} executor 進退貨人員
     * @apiParam {String} eventType 進退貨類型
     * @apiParam {Number} receiver 倉管人員
     * @apiParam {Mix} [others] 其他欄位，請參考: <a href="#inventoryEvent">倉儲物料庫存異動記錄欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/inventoryEvent/bulk
     * Body:
     * [
     *   {
     *     "orderMaterial": 1000,
     *     "executor": 1111,
     *     "eventType": "進貨",
     *     "receiver": 2222,
     *     ...........
     *   },
     *   ......
     * ]
     * @apiSuccess (Success 200) {Array} id 倉儲物料庫存異動記錄的資料庫唯一ID，可以拿來查詢或是修改使用
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "id": [1,2,3]
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    inventRouter.post('/inventoryEvent/bulk', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:127', 400);
        }
        else {
            try {
                let orderdelidata = await InventoryEvent_1.InventoryEvent.bulkCreate(ctx.request.body);
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
    /**
     * @api {post} /inventoryEvent/summary [倉儲物料庫存異動記錄]-退領料匯總
     * @apiDescription 依據訂單號、交期、班組、員工及操作時間，進行退領料匯總查詢
     * @apiGroup Warehouse
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/inventoryEvent/summary
     * Body:
     * {
     * }
     * @apiSuccess (Success 200) {String} orderID 訂單號
     * @apiSuccess (Success 200) {String} deliveryDate 訂單交期
     * @apiSuccess (Success 200) {String} order 訂單資料庫編號
     * @apiSuccess (Success 200) {String} team 班組資料庫編號
     * @apiSuccess (Success 200) {String} teamName 班組名稱
     * @apiSuccess (Success 200) {String} executor 進退貨人員資料庫編號
     * @apiSuccess (Success 200) {String} executorName 進退貨人員名稱
     * @apiSuccess (Success 200) {String} executorChineseName 進退貨人員中文名稱
     * @apiSuccess (Success 200) {String} eventTime 進出貨時間
     * @apiSuccess (Success 200) {String} eventType 進退貨類型(出貨=領料/進貨=退料)
     * @apiSuccess (Success 200) {String} totalPurchaseLength 進貨(退料)總長度
     * @apiSuccess (Success 200) {String} totalShipLength 出貨(領料)總長度
     * @apiSuccessExample {json} Success-Response Example:
     * [
     *   {
     *     "orderID": "o001",
     *     "deliveryDate": "2018-12-12",
     *     "order": 1,
     *     "team": 1,
     *     "teamName": "team1",
     *     "executor": 1,
     *     "executorName": "user1",
     *     "eventTime": "2018-12-12T00:00:00.000Z",
     *     "eventType": "退料",
     *     "totalPurchaseLength": 100,
     *     "totalShipLength": 0
     *   },
     *   ............
     * ]
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    inventRouter.post('/inventoryEvent/summary', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:127', 400);
        }
        else {
            try {
                let sqlcmd = 'SELECT O.orderID AS orderID, O.deliveryDate AS deliveryDate, IE.order, IE.team, T.name AS teamName, IE.executor, UA.username AS executorName, UA.chineseName AS executorChineseName, IE.eventTime, IE.eventType, SUM(IE.purchaseLength) AS totalPurchaseLength, SUM(IE.shipLength) AS totalShipLength FROM InventoryEvent AS IE, `Order` AS O, Team AS T, UserAccount AS UA WHERE O.id = IE.order AND T.id = IE.team AND UA.id = executor GROUP BY IE.order, IE.team, IE.executor, IE.eventTime, IE.eventType';
                let queryRes = await InventoryEvent_1.InventoryEvent.sequelize.query(sqlcmd);
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
function getTotal(crop) {
    return new Promise(async (resolve, reject) => {
        if (crop && crop.order && crop.bedNumber) {
            let sqlcmd = 'SELECT SUM(IE.purchaseLength) AS totalPurchaseLength, SUM(IE.shipLength) AS totalShipLength, IE.order, IE.team, IE.executor, IE.eventTime, IE.eventType FROM InventoryEvent AS IE GROUP BY IE.order, IE.team, IE.executor, IE.eventTime, IE.eventType';
            let queryRes = await InventoryEvent_1.InventoryEvent.sequelize.query(sqlcmd);
            if (queryRes && Array.isArray(queryRes) && Array.isArray(queryRes[0])) {
                //let bn = Number.parseInt(queryRes[0][0].bn) || 0;
                crop.totalLength = Number.parseInt(queryRes[0][0].totalLength) || null;
                crop.totalLayer = Number.parseInt(queryRes[0][0].totalLayer) || null;
                crop.totalVolume = Number.parseInt(queryRes[0][0].totalVolume) || null;
            }
        }
        return resolve(true);
    });
}
