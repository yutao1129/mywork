"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MemberOutput_1 = require("../database/models/MemberOutput");
const ProductionScheduling_1 = require("../database/models/ProductionScheduling");
const Order_1 = require("../database/models/Order");
const Team_1 = require("../database/models/Team");
const SewingTeamScheduling_1 = require("../database/models/SewingTeamScheduling");
const dbquery_1 = require("../database/dbquery");
// export const accRouter = new KoaRouter();
exports.registerMemberOutputAPI = function (memberOutputRouter) {
    /**
     * @api {post} /memberOutput/search [個人生產紀錄]-查詢
     * @apiDescription 查詢符合條件的個人生產紀錄，並將結果分頁回傳
     * @apiGroup Production
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number=0} [pageIndex] 頁碼
     * @apiParam {Number=100} [maxRows] 每一頁的最大筆數
     * @apiParam {Object} [sort] 將結果指定欄位排序。1是從小到大排序，-1是從大到小。可指定的欄位請參考: <a href="#memberOutput">個人生產紀錄欄位定義</a> <p> 例如根據<code>id</code>從小到大排序就是：<code>{"id":1}</code>
     * @apiParam {Object} [query] 查詢條件。可以指定欄位等於某個值，或是介於某個範圍。範圍用<code>[大於某值，小於某值]</code>來描述，範圍中的兩個值其中之一，可以設定為<code>null</code>，表示不指定，但不能兩者皆為<code>null</code><p> 例如想指定<code>id</code>大於0的個人生產紀錄就是：<code>{"id": [0, null]}</code>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/memberOutput/search
     * Body:
     * {
     *   "pageIndex": 0,
     *   "maxRows": 3,
     *   "sort": {
     *     "id": 1
     *   },
     *   "query": {
     *      "worker": 1111
     *   }
     * }
     * @apiSuccess (Success 200) {Number} pageIndex 目前的頁碼
     * @apiSuccess (Success 200) {Number} maxRows 每一頁的最大筆數
     * @apiSuccess (Success 200) {Number} totalPage 總頁數
     * @apiSuccess (Success 200) {Array} records 查詢的結果。各欄位定義請參考: <a href="#memberOutput">個人生產紀錄欄位定義</a>
     * @apiSuccessExample {json} Response Example
     * {
     *   "pageIndex": 1,
     *   "maxRows": 100,
     *   "totalPage": 2,
     *   "records": [{
     *     "worker": 1111,
     *     "date": "2000-01-01T00:00:00+08:00",
     *     "team": 2222,
     *     "amount": 1,
     *     "processAmount": 10,
     *     "processAmount": 1.5,
     *     ...
     *     },
     *     ...
     *   ]
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    memberOutputRouter.post('/memberOutput/search', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:69', 400);
        }
        else {
            let resp = dbquery_1.queryResponsePacket(ctx.request.body);
            let query = dbquery_1.queryDBGeneratorEx(ctx.request.body, MemberOutput_1.memberOutputJoin);
            try {
                let docs = await MemberOutput_1.MemberOutput.findAndCount(query);
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
                ctx.throw('db.invalorderIDQuery:98', 400);
            }
        }
    });
    /**
     * @api {post} /memberOutput [個人生產紀錄]-新增
     * @apiDescription 新增個人生產紀錄
     * @apiGroup Production
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number} worker 工人編號
     * @apiParam {Number} team 班組編號
     * @apiParam {Number} amount 本扎數量
     * @apiParam {Number} processAmount 工序件數
     * @apiParam {Date} date 紀錄日期
     * @apiParam {Number} pay 工資
     * @apiParam {Mix} [others] 其他欄位，請參考: <a href="#memberOutput">個人生產紀錄欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/memberOutput
     * Body:
     * {
     *   "worker": 1111,
     *   "date": "2000-01-01T00:00:00+08:00",
     *   "team": 2222,
     *   "amount": 1,
     *   "processAmount": 10,
     *   "processAmount": 1.5,
     *   ...........
     * }
     * @apiSuccess (Success 200) {String} id 個人生產紀錄的資料庫唯一ID，可以拿來查詢或是修改使用
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "id": "5b6d0d03993dc24293de551c"
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    memberOutputRouter.post('/memberOutput', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:139', 400);
        }
        else {
            try {
                let memOut = new MemberOutput_1.MemberOutput(ctx.request.body);
                let memOutData = await memOut.save();
                if (memOutData && memOutData.id) {
                    let res = {
                        id: memOutData.id
                    };
                    ctx.body = res;
                    ctx.status = 200;
                    ctx.respond = true;
                    let updatePlanSpeed = await UpdatePlanSpeed(memOutData.productionScheduling, memOutData.step, memOutData.amount);
                }
                else {
                    ctx.throw('db.invalidParameters:154', 400);
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:158', 400);
            }
        }
    });
    /**
     * @api {post} /memberOutput/update [個人生產紀錄]-修改
     * @apiDescription 修改個人生產紀錄資料
     * @apiGroup Production
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Object} condition 符合此條件的個人生產紀錄會被修改
     * @apiParam {Number} condition.id 個人生產紀錄編號，目前只開放依照個人生產紀錄編號修改，將來若有需要批次修改的，再增加欄位
     * @apiParam {Object} update 欲修改的欄位
     * @apiParam {ooo} update.xxx 只需要填欲修改的欄位，沒有要修改的就不用填。欄位請參考: <a href="#memberOutput">個人生產紀錄欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/memberOutput/update
     * Body:
     * {
     *   "condition": {
     *     id: 123456,
     *   },
     *   "update": {
     *     "processAmount": 8,
     *     ...........
     *   }
     * }
     * @apiSuccess (Success 200) {Number} updateCount 修改成功的個人生產紀錄筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "updateCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    memberOutputRouter.post('/memberOutput/update', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:196', 400);
        }
        else if (false === dbquery_1.checkRequestParamObject(ctx.request.body.condition)) {
            ctx.throw('db.invalidParameters:198', 400);
        }
        else if (false === dbquery_1.checkRequestParamObject(ctx.request.body.update)) {
            ctx.throw('db.invalidParameters:200', 400);
        }
        else {
            try {
                let query = {
                    where: ctx.request.body.condition,
                };
                let updateres = await MemberOutput_1.MemberOutput.update(ctx.request.body.update, query);
                if (updateres && Array.isArray(updateres)) {
                    let res = {
                        updateCount: updateres[0]
                    };
                    ctx.body = res;
                    ctx.status = 200;
                    ctx.respond = true;
                }
                else {
                    ctx.throw('db.invalidParameters:217', 400);
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:221', 400);
            }
        }
    });
    /**
     * @api {delete} /memberOutput [個人生產紀錄]-刪除
     * @apiDescription 刪除個人生產紀錄
     * @apiGroup Production
     * @apiVersion 0.0.1
     * @apiParam {Number} id 個人生產紀錄編號
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/memberOutput
     * Body:
     * {
     *   "id": 123456
     * }
     * @apiSuccess (Success 200) {Number} deleteCount 刪除成功的個人生產紀錄筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "deleteCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    memberOutputRouter.delete('/memberOutput', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:249', 400);
        }
        else {
            try {
                let condition = {
                    where: ctx.request.body
                };
                let delcount = await MemberOutput_1.MemberOutput.destroy(condition);
                if (null !== delcount && undefined !== delcount) {
                    let res = {
                        deleteCount: delcount
                    };
                    ctx.body = res;
                    ctx.status = 200;
                    ctx.respond = true;
                }
                else {
                    ctx.throw('db.invalidParameters:266', 400);
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:270', 400);
            }
        }
    });
    /**
     * @api {post} /memberOutput/payroll [個人薪資]-查詢
     * @apiDescription 查詢符合條件的個人生產紀錄，並將結果分頁回傳
     * @apiGroup Production
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {string} [employeeID] 員工編號
     * @apiParam {Date} [startTime] 起始時間
     * @apiParam {Date} [endTime] 結束時間
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/memberOutput/search
     * Body:
     * {
     *   "employeeID": "AC0001"
     *   "startTime": "2018-10-12T00:00:00.000Z",
     *   "endTime": "2018-10-12T00:00:00.000Z"
     * }
     * @apiSuccess (Success 200) {Array} records 目前的頁碼
     * @apiSuccess (Success 200) {Object} records.data 員工薪資資料.
     * @apiSuccess (Success 200) {string} records.data.employeeID 員工編號.
     * @apiSuccess (Success 200) {string} records.data.totalPay 期間 薪資總合.
     * @apiSuccess (Success 200) {string} records.data.totalProcessAmount 期間 工序總合.
     * @apiSuccess (Success 200) {Array}  records.data.daily 期間每日工資列表.
     * @apiSuccess (Success 200) {Date}  records.data.daily.date 日期.
     * @apiSuccess (Success 200) {pay}  records.data.daily.pay 當日 薪資.
     * @apiSuccess (Success 200) {pay}  records.data.daily.processAmount 當日 工序數合.
     * @apiSuccessExample {json} Response Example
     * {
     *   "records": [{
     *      "employeeID": "AC0001",
     *      "totalPay": "278",
     *      "totalProcessAmount": "17",
     *      "daily": [
     *          {
     *              "date": "2018-10-10",
     *              "pay": "188",
     *              "processAmount": "11"
     *          },
     *          {
     *              "date": "2018-10-12",
     *              "pay": "36",
     *              "processAmount": "4"
     *          },
     *          {
     *              "date": "2018-10-15",
     *              "pay": "54",
     *              "processAmount": "2"
     *          }
     *      ]
     *   },
     *     ...
     *   ]
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    memberOutputRouter.post('/memberOutput/payroll', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:339', 400);
        }
        else {
            try {
                let params = ctx.request.body;
                let args = [];
                let tsargs = [];
                let wherecond = [];
                let accWherecond = [];
                let sqlCmd = 'SELECT Acc.employeeID as employeeID, SUM(MemOut.pay) as totalPay, ' +
                    'SUM(MemOut.processAmount) as totalProcessAmount ' +
                    'FROM MemberOutput as MemOut ' +
                    'LEFT JOIN UserAccount AS Acc ON MemOut.worker=Acc.id ';
                let sqlDalyCmd = 'SELECT DATE_FORMAT(MemOut.date, "%Y-%m-%d") as date, SUM(MemOut.pay) as pay, ' +
                    'SUM(MemOut.processAmount) as processAmount ' +
                    'FROM MemberOutput as MemOut ' +
                    'LEFT JOIN UserAccount AS Acc ON MemOut.worker=Acc.id ';
                if (params.employeeID) {
                    wherecond.push(' Acc.employeeID=? ');
                    args.push(params.employeeID);
                }
                accWherecond.push(' Acc.employeeID=? ');
                if (params.startTime && params.endTime) {
                    wherecond.push(' MemOut.date BETWEEN ? AND ? ');
                    accWherecond.push(' MemOut.date BETWEEN ? AND ? ');
                    args.push(params.startTime);
                    args.push(params.endTime);
                    tsargs.push(params.startTime);
                    tsargs.push(params.endTime);
                }
                else if (params.startTime) {
                    wherecond.push(' MemOut.date >= ? ');
                    accWherecond.push(' MemOut.date >= ? ');
                    args.push(params.startTime);
                    tsargs.push(params.startTime);
                }
                else if (params.endTime) {
                    wherecond.push(' MemOut.date <= ? ');
                    accWherecond.push(' MemOut.date <= ? ');
                    args.push(params.startTime);
                    tsargs.push(params.startTime);
                }
                if (wherecond.length > 0) {
                    sqlCmd += (' WHERE ' + wherecond.join(' AND '));
                }
                if (accWherecond.length > 0) {
                    sqlDalyCmd += (' WHERE ' + accWherecond.join(' AND '));
                }
                sqlCmd += ' GROUP BY MemOut.worker;';
                sqlDalyCmd += ' GROUP BY DATE_FORMAT(MemOut.date, "%Y-%m-%d");';
                let queryRes = await MemberOutput_1.MemberOutput.sequelize.query({
                    query: sqlCmd,
                    values: args
                });
                if (queryRes && Array.isArray(queryRes)) {
                    let report = [];
                    for (let accsum of queryRes[0]) {
                        let dailyArgs = [];
                        dailyArgs.push(accsum.employeeID);
                        dailyArgs = dailyArgs.concat(tsargs);
                        console.log('q args ', dailyArgs, sqlDalyCmd);
                        let dailyPay = await MemberOutput_1.MemberOutput.sequelize.query({
                            query: sqlDalyCmd,
                            values: dailyArgs
                        });
                        accsum.daily = [];
                        if (dailyPay && Array.isArray(dailyPay)) {
                            accsum.daily = dailyPay[0];
                        }
                        report.push(accsum);
                    }
                    ctx.body = { records: report };
                    ctx.status = 200;
                    ctx.respond = true;
                }
                else {
                    ctx.throw('db.invalorderIDQuery:420', 400);
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalorderIDQuery:424', 400);
            }
        }
    });
    /**
     * @api {post} /memberOutput/planspeed [班組進度]-查詢進度
     * @apiDescription 查詢符合條件的訂單, 依班組統計完成進度
     * 必需在 MemberOutput 中的"step" 生產環節 必需為 裁剪、粘衬、车缝、锁钉、整烫、包装 我們才有辦法查詢到相關的生產排程量.
     * @apiGroup Production
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {number} [orderid] 訂單 id
     * @apiParam {string} [orderID] 訂單編號 orderID
     * @apiParam {string} [deliveryDate] 訂單交期.
     * @apiParam {string} [style] 款號.
     * @apiParam {string} [productName] 品名.
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/order/planspeed
     * Body:
     * {
     *   "orderID": "O01",
     *   "deliveryDate": '2018-10-10',
     * }
     * @apiSuccess (Success 200) {Array} records 查詢的結果。各欄位定義請參考: 訂單進度欄位定義
     * @apiSuccess (Success 200) {Object} records.data 進度欄位定義
     * @apiSuccess (Success 200) {number} records.data.id 訂單 id
     * @apiSuccess (Success 200) {number} records.data.orderID 訂單編號
     * @apiSuccess (Success 200) {string} records.data.deliveryDate 訂單交期
     * @apiSuccess (Success 200) {number} records.data.schedulingAmount 排產總量
     * @apiSuccess (Success 200) {number} records.data.team 班組編號
     * @apiSuccess (Success 200) {number} records.data.teamName 班組名稱
     * @apiSuccess (Success 200) {number} records.data.completeAmount 完成數量
     * @apiSuccess (Success 200) {number} records.data.startDate 排程開始時間
     * @apiSuccess (Success 200) {number} records.data.endDate 排程結束時間
     * @apiSuccessExample {json} Response Example
     * {
     *  records:[
     *  {
     *      "id": 1,
     *      "step": "整烫",
     *      "team": 6,
     *      "completeAmount": "42",
     *      "teamID": "ZT01",
     *      "teamName": "整烫1组",
     *      "schedulingAmount": 1000,
     *      "startDate": "2018-09-25",
     *      "endDate": "2018-10-24",
     *      "orderID": "order001",
     *      "deliveryDate": "2018-10-25"
     *  },
     *  {
     *      "id": 1,
     *      "step": "裁剪",
     *      "team": 2,
     *      "completeAmount": "42",
     *      "teamID": "CJ01",
     *      "teamName": "裁剪1组",
     *      "schedulingAmount": 500,
     *      "startDate": "2018-09-25",
     *      "endDate": "2018-10-25",
     *      "orderID": "order001",
     *      "deliveryDate": "2018-10-25"
     *  },
     * ]}
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    memberOutputRouter.post('/memberOutput/planspeed', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:499', 400);
        }
        else {
            try {
                let params = ctx.request.body;
                let args = [];
                let sqlWheres = [];
                let sqlOrdersWhere = [];
                let sqlOrders = 'SELECT id FROM `Order` ';
                if (params.style) {
                    args.push(params.style);
                    sqlWheres.push(' style=? ');
                }
                if (params.orderID) {
                    args.push(params.orderID);
                    sqlWheres.push(' orderID=? ');
                }
                if (params.deliveryDate) {
                    args.push(params.deliveryDate);
                    sqlWheres.push(' deliveryDate=? ');
                }
                if (params.orderid) {
                    args.push(params.orderid);
                    sqlWheres.push(' id=? ');
                }
                if (args.length === 0 && params.productName) {
                    args.push(params.productName);
                    sqlOrders += 'LEFT JOIN Style ON Style.styleID=`Order`.style ';
                    sqlOrders += 'WHERE Style.productName=?';
                    sqlOrders = '(' + sqlOrders + ')';
                }
                else {
                    sqlOrders += 'WHERE ';
                    sqlOrders += sqlWheres.join(' AND ');
                    sqlOrders = '(' + sqlOrders + ')';
                }
                let sqlCmd = 'SELECT OrderDev.order as id, ' +
                    'MemOut.step as step, MemOut.team as team, SUM(MemOut.amount) as completeAmount ' +
                    'FROM ProductionScheduling as ProdSch ' +
                    'LEFT OUTER JOIN MemberOutput as MemOut ON ProdSch.id=MemOut.productionScheduling ' +
                    'LEFT JOIN OrderDeliveryPlan as OrderDev ON ProdSch.orderDeliveryPlan=OrderDev.id ';
                if (args.length > 0) {
                    sqlCmd += ('WHERE OrderDev.order in ' + sqlOrders);
                }
                // WHERE OrderDev.order IN (SELECT id FROM `Order`)
                sqlCmd += ' GROUP BY OrderDev.order, MemOut.step, MemOut.team ORDER BY OrderDev.order, step, team;';
                let resSpeedPlan = await MemberOutput_1.MemberOutput.sequelize.query({
                    query: sqlCmd,
                    values: args
                });
                let reports = [];
                if (resSpeedPlan && Array.isArray(resSpeedPlan) && Array.isArray(resSpeedPlan[0])) {
                    for (let sch of resSpeedPlan[0]) {
                        if (sch.team) {
                            let tagTeam = await Team_1.Team.findById(sch.team);
                            if (tagTeam) {
                                sch.teamID = tagTeam.teamID;
                                sch.teamName = tagTeam.name;
                            }
                        }
                        if (sch.completeAmount) {
                            if ('string' === typeof sch.completeAmount) {
                                sch.completeAmount = Number.parseInt(sch.completeAmount);
                            }
                        }
                        sch.schedulingAmount = 0;
                        sch.startDate = null;
                        sch.endDate = null;
                        if (sch.id) {
                            let tagOrder = await Order_1.Order.findById(sch.id);
                            if (tagOrder) {
                                sch.orderID = tagOrder.orderID;
                                sch.deliveryDate = tagOrder.deliveryDate;
                            }
                            switch (sch.step) {
                                case '裁剪':
                                    let cropInfo = await sumTeamScheduleAmount(sch.id, sch.team, 'PrecedingTeamScheduling', 'cropTeam', 'cropStartDate', 'cropEndDate');
                                    if (cropInfo) {
                                        sch.schedulingAmount = cropInfo.schedulingAmount;
                                        sch.startDate = cropInfo.startDate;
                                        sch.endDate = cropInfo.endDate;
                                    }
                                    break;
                                case '粘衬':
                                    let stickInfo = await sumTeamScheduleAmount(sch.id, sch.team, 'PrecedingTeamScheduling', 'stickTeam', 'stickStartDate', 'stickEndDate');
                                    if (stickInfo) {
                                        sch.schedulingAmount = stickInfo.schedulingAmount;
                                        sch.startDate = stickInfo.startDate;
                                        sch.endDate = stickInfo.endDate;
                                    }
                                    break;
                                case '车缝':
                                    let sewInfo = await sumTeamScheduleAmount(sch.id, sch.team, 'SewingTeamScheduling', 'team', 'startDate', 'endDate');
                                    if (sewInfo) {
                                        sch.schedulingAmount = sewInfo.schedulingAmount;
                                        sch.startDate = sewInfo.startDate;
                                        sch.endDate = sewInfo.endDate;
                                    }
                                    break;
                                case '锁钉':
                                    let lockInfo = await sumTeamScheduleAmount(sch.id, sch.team, 'FollowingTeamScheduling', 'lockTeam', 'lockStartDate', 'lockEndDate');
                                    if (lockInfo) {
                                        sch.schedulingAmount = lockInfo.schedulingAmount;
                                        sch.startDate = lockInfo.startDate;
                                        sch.endDate = lockInfo.endDate;
                                    }
                                    break;
                                case '整烫':
                                    let ironInfo = await sumTeamScheduleAmount(sch.id, sch.team, 'FollowingTeamScheduling', 'ironTeam', 'ironStartDate', 'ironEndDate');
                                    if (ironInfo) {
                                        sch.schedulingAmount = ironInfo.schedulingAmount;
                                        sch.startDate = ironInfo.startDate;
                                        sch.endDate = ironInfo.endDate;
                                    }
                                    break;
                                case '包装':
                                    let packInfo = await sumTeamScheduleAmount(sch.id, sch.team, 'FollowingTeamScheduling', 'packTeam', 'packStartDate', 'packEndDate');
                                    if (packInfo) {
                                        sch.schedulingAmount = packInfo.schedulingAmount;
                                        sch.startDate = packInfo.startDate;
                                        sch.endDate = packInfo.endDate;
                                    }
                                    break;
                            }
                        }
                        reports.push(sch);
                    }
                }
                ctx.body = { records: reports };
                ctx.respond = true;
                ctx.status = 200;
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:311', 400);
            }
        }
    });
};
function UpdatePlanSpeed(prodSchId, stepName, amount) {
    return new Promise(async (resolve, reject) => {
        try {
            let amountObj = await MemberOutput_1.MemberOutput.aggregate('amount', 'SUM', {
                where: {
                    productionScheduling: prodSchId,
                    step: stepName
                }
            });
            let amount = 0;
            if (amountObj) {
                if ('number' === typeof amountObj) {
                    amount = amountObj;
                }
                else {
                    amount = Number.parseInt(amountObj.toString());
                }
                let prodSch = await ProductionScheduling_1.ProductionScheduling.findById(prodSchId);
                console.log('update amount', stepName, amount);
                let res;
                if (prodSch) {
                    switch (stepName) {
                        case '裁剪':
                            prodSch.cropCompleteAmount = amount;
                            res = await prodSch.save();
                            break;
                        case '粘衬':
                            prodSch.stickCompleteAmount = amount;
                            res = await prodSch.save();
                            break;
                        case '车缝':
                            prodSch.sewingCompleteAmount = amount;
                            res = await prodSch.save();
                            break;
                        case '锁钉':
                            prodSch.lockCompleteAmount = amount;
                            res = await prodSch.save();
                            break;
                        case '整烫':
                            prodSch.ironCompleteAmount = amount;
                            res = await prodSch.save();
                            break;
                        case '包装':
                            prodSch.packCompleteAmount = amount;
                            res = await prodSch.save();
                            break;
                    }
                }
                resolve(true);
            }
            else {
                resolve(false);
            }
        }
        catch (err) {
            resolve(false);
        }
    });
}
function sumTeamScheduleAmount(id, teamid, tableName, teamField, startDateField, endDateField) {
    return new Promise(async (result, reject) => {
        let ret = {
            schedulingAmount: 0
        };
        let args = [];
        let orderSql = ' (SELECT id FROM OrderDeliveryPlan WHERE OrderDeliveryPlan.order=?) ';
        let cmdSql = 'SELECT SUM(TeamOut.amount) as schedulingAmount ';
        cmdSql += (', MIN(TeamOut.' + startDateField + ') AS starDate ');
        cmdSql += (', MAX(TeamOut.' + endDateField + ') AS endDate ');
        cmdSql += ('FROM ' + tableName + ' as TeamOut ');
        cmdSql += 'LEFT JOIN ProductionScheduling AS ProdSch ON TeamOut.productionScheduling= ProdSch.id ';
        cmdSql += 'WHERE TeamOut.' + teamField + '=?';
        args.push(teamid);
        cmdSql += (' AND ProdSch.orderDeliveryPlan IN ' + orderSql);
        args.push(id);
        let resData = await SewingTeamScheduling_1.SewingTeamScheduling.sequelize.query({
            query: cmdSql,
            values: args
        });
        if (resData && Array.isArray(resData) && Array.isArray(resData[0])) {
            console.log(resData[0], cmdSql, args);
            ret = resData[0][0];
            if ('string' === typeof ret.schedulingAmount) {
                ret.schedulingAmount = Number.parseInt(ret.schedulingAmount);
            }
            result(ret);
        }
        else {
            result(null);
        }
    });
}
