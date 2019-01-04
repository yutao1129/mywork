"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Notification_1 = require("../database/models/Notification");
const dbquery_1 = require("../database/dbquery");
// export const accRouter = new KoaRouter();
exports.registerNotificationAPI = function (notifRouter) {
    /**
     * @api {post} /notification/search [通知]-查詢
     * @apiDescription 查詢符合條件的通知，並將結果分頁回傳
     * @apiGroup Maintenance
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number=0} [pageIndex] 頁碼
     * @apiParam {Number=100} [maxRows] 每一頁的最大筆數
     * @apiParam {Object} [sort] 將結果指定欄位排序。1是從小到大排序，-1是從大到小。可指定的欄位請參考: <a href="#notification">通知欄位定義</a> <p> 例如根據<code>id</code>從小到大排序就是：<code>{"id":1}</code>
     * @apiParam {Object} [query] 查詢條件。可以指定欄位等於某個值，或是介於某個範圍。範圍用<code>[大於某值，小於某值]</code>來描述，範圍中的兩個值其中之一，可以設定為<code>null</code>，表示不指定，但不能兩者皆為<code>null</code><p> 例如想指定<code>id</code>大於0的通知就是：<code>{"id": [0, null]}</code>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/notification/search
     * Body:
     * {
     *   "pageIndex": 0,
     *   "maxRows": 3,
     *   "sort": {
     *     "id": 1
     *   },
     *   "query": {
     *      "target": 2222
     *   }
     * }
     * @apiSuccess (Success 200) {Number} pageIndex 目前的頁碼
     * @apiSuccess (Success 200) {Number} maxRows 每一頁的最大筆數
     * @apiSuccess (Success 200) {Number} totalPage 總頁數
     * @apiSuccess (Success 200) {Array} records 查詢的結果。各欄位定義請參考: <a href="#notification">通知欄位定義</a>
     * @apiSuccessExample {json} Response Example
     * {
     *   "pageIndex": 1,
     *   "maxRows": 100,
     *   "totalPage": 2,
     *   "records": [{
     *     "date": "2000-01-01T00:00:00+08:00",
     *     "target": 2222,
     *     "message": "ooooo",
     *     "subject": "xxx",
     *     "status": 0,
     *     ...
     *     },
     *     ...
     *   ]
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    notifRouter.post('/notification/search', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:63', 400);
        }
        else {
            let resp = dbquery_1.queryResponsePacket(ctx.request.body);
            //let countQuery = queryTotalCount < Notification > (ctx.request.body);
            //let query = queryDBGenerator < Notification > (ctx.request.body);
            let query = dbquery_1.queryDBGeneratorEx(ctx.request.body, Notification_1.notificationJoin);
            try {
                let orderdocInfo = await Notification_1.Notification.findAndCount(query);
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
                    let count = await Notification.count(countQuery);
                    if (0 === count) {
                        resp.totalPage = 0;
                    } else if (resp.maxRows > 0) {
                        resp.totalPage = Math.ceil(count / resp.maxRows);
                    } else {
                        resp.totalPage = 1;
                    }
    
                    if (undefined === query.offset || (query.offset && query.offset < count)) {
                        let notifdoclist = await Notification.findAll(query);
                        if (notifdoclist && notifdoclist.length > 0) {
                            for (let item of notifdoclist) {
                                let itemFmt = item.toJSON();
                                if (itemFmt.target) {
                                    let acc = await UserAccount.findById(itemFmt.target);
                                    if (acc) {
                                        itemFmt.target = acc.toJSON();
                                    }
                                }
                                resp.records.push(itemFmt);
                            }
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
     * @api {post} /notification [通知]-新增
     * @apiDescription 新增通知
     * @apiGroup Maintenance
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number} target 對象
     * @apiParam {String} subject 主題
     * @apiParam {String} message 訊息
     * @apiParam {Date} date 發布時間
     * @apiParam {Number} status 狀態(0:未查看/1:已查看)
     * @apiParam {Mix} [others] 其他欄位，請參考: <a href="#notification">通知欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/notification
     * Body:
     * {
     *   "date": "2000-01-01T00:00:00+08:00",
     *   "target": 2222,
     *   "message": "ooooo",
     *   "subject": "xxx",
     *   "status": 0,
     *   ...........
     * }
     * @apiSuccess (Success 200) {String} id 通知的資料庫唯一ID，可以拿來查詢或是修改使用
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "id": "5b6d0d03993dc24293de551c"
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    notifRouter.post('/notification', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:126', 400);
        }
        else {
            try {
                let notify = new Notification_1.Notification(ctx.request.body);
                let nData = await notify.save();
                if (nData && nData.id) {
                    let res = {
                        id: nData.id
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
     * @api {post} /notification/update [通知]-修改
     * @apiDescription 修改通知資料
     * @apiGroup Maintenance
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Object} condition 符合此條件的通知會被修改
     * @apiParam {Number} condition.id 通知編號，目前只開放依照通知編號修改，將來若有需要批次修改的，再增加欄位
     * @apiParam {Object} update 欲修改的欄位
     * @apiParam {ooo} update.xxx 只需要填欲修改的欄位，沒有要修改的就不用填。欄位請參考: <a href="#notification">通知欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/notification/update
     * Body:
     * {
     *   "condition": {
     *     id: 123456,
     *   },
     *   "update": {
     *     "status": 1,
     *     ...........
     *   }
     * }
     * @apiSuccess (Success 200) {Number} updateCount 修改成功的通知筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "updateCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    notifRouter.post('/notification/update', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:188', 400);
        }
        else if (false === dbquery_1.checkRequestParamObject(ctx.request.body.condition)) {
            ctx.throw('db.invalidParameters:190', 400);
        }
        else if (false === dbquery_1.checkRequestParamObject(ctx.request.body.update)) {
            ctx.throw('db.invalidParameters:192', 400);
        }
        else {
            try {
                let query = {
                    where: ctx.request.body.condition,
                };
                let updatefields = ctx.request.body.update;
                if (updatefields.content) {
                    updatefields.content = JSON.stringify(updatefields.content);
                }
                let updateres = await Notification_1.Notification.update(updatefields, query);
                if (updateres && Array.isArray(updateres)) {
                    let res = {
                        updateCount: updateres[0]
                    };
                    ctx.body = res;
                    ctx.status = 200;
                    ctx.respond = true;
                }
                else {
                    ctx.throw('db.invalidParameters:213', 400);
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:217', 400);
            }
        }
    });
    /**
     * @api {delete} /notification [通知]-刪除
     * @apiDescription 刪除通知
     * @apiGroup Maintenance
     * @apiVersion 0.0.1
     * @apiParam {Number} id 通知編號
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/notification
     * Body:
     * {
     *   "id": 123456
     * }
     * @apiSuccess (Success 200) {Number} deleteCount 刪除成功的通知筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "deleteCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    notifRouter.delete('/notification', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:245', 400);
        }
        else {
            try {
                let cond = ctx.request.body;
                if (cond.content) {
                    cond.content = JSON.stringify(cond.cont);
                }
                let condition = {
                    where: cond
                };
                let delcount = await Notification_1.Notification.destroy(condition);
                if (null !== delcount && undefined !== delcount) {
                    let res = {
                        deleteCount: delcount
                    };
                    ctx.body = res;
                    ctx.status = 200;
                    ctx.respond = true;
                }
                else {
                    ctx.throw('db.invalidParameters:267', 400);
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:271', 400);
            }
        }
    });
};
