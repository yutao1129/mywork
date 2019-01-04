"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const QualityInspection_1 = require("../database/models/QualityInspection");
const Team_1 = require("../database/models/Team");
const Order_1 = require("../database/models/Order");
const Style_1 = require("../database/models/Style");
const OrderDeliveryPlan_1 = require("../database/models/OrderDeliveryPlan");
const dbquery_1 = require("../database/dbquery");
const UserAccount_1 = require("../database/models/UserAccount");
// export const accRouter = new KoaRouter();
exports.registerQualityInspectAPI = function (qualityInspRouter) {
    /**
     * @api {post} /qualityInspection/search [品檢]-查詢
     * @apiDescription 查詢符合條件的品檢，並將結果分頁回傳
     * @apiGroup Production
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number=0} [pageIndex] 頁碼
     * @apiParam {Number=100} [maxRows] 每一頁的最大筆數
     * @apiParam {Object} [sort] 將結果指定欄位排序。1是從小到大排序，-1是從大到小。可指定的欄位請參考: <a href="#qualityInspection">品檢欄位定義</a> <p> 例如根據<code>qualityStandard</code>從小到大排序就是：<code>{"qualityStandard":1}</code>
     * @apiParam {Object} [query] 查詢條件。可以指定欄位等於某個值，或是介於某個範圍。範圍用<code>[大於某值，小於某值]</code>來描述，範圍中的兩個值其中之一，可以設定為<code>null</code>，表示不指定，但不能兩者皆為<code>null</code><p> 例如想指定<code>qualityStandard</code>大於0的品檢就是：<code>{"qualityStandard": [0, null]}</code>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/qualityInspection/search
     * Body:
     * {
     *   "pageIndex": 0,
     *   "maxRows": 3,
     *   "sort": {
     *     "id": 1
     *   },
     *   "query": {
     *      "qualityStandard": 12
     *   }
     * }
     * @apiSuccess (Success 200) {Number} pageIndex 目前的頁碼
     * @apiSuccess (Success 200) {Number} maxRows 每一頁的最大筆數
     * @apiSuccess (Success 200) {Number} totalPage 總頁數
     * @apiSuccess (Success 200) {Array} records 查詢的結果。各欄位定義請參考: <a href="#qualityInspection">品檢欄位定義</a>
     * @apiSuccessExample {json} Response Example
     * {
     *   "pageIndex": 1,
     *   "maxRows": 100,
     *   "totalPage": 2,
     *   "records": [{
     *     "qualityStandard": 12,
     *     "trussPlan": 1222,
     *     "cropCard": 1234,
     *     "type": "總檢",
     *     ...
     *     },
     *     ...
     *   ]
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    qualityInspRouter.post('/qualityInspection/search', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:90', 400);
        }
        else {
            let resp = dbquery_1.queryResponsePacket(ctx.request.body);
            //let countQuery = queryTotalCount < QualityInspection > (ctx.request.body);
            //let query = queryDBGenerator < QualityInspection > (ctx.request.body);
            let query = dbquery_1.queryDBGeneratorEx(ctx.request.body, QualityInspection_1.qualityInspectionJoin);
            try {
                let orderdocInfo = await QualityInspection_1.QualityInspection.findAndCount(query);
                let count = orderdocInfo.count;
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
                if (orderdocInfo && orderdocInfo.rows) {
                    for (let item of orderdocInfo.rows) {
                        resp.records.push(item.toJSON());
                    }
                }
                /*try {
                    let count = await QualityInspection.count(countQuery);
                    if (0 === count) {
                        resp.totalPage = 0;
                    } else if (resp.maxRows > 0) {
                        resp.totalPage = Math.ceil(count / resp.maxRows);
                    } else {
                        resp.totalPage = 1;
                    }

                    if (undefined === query.offset || (query.offset && query.offset < count)) {
                        let qidoclist = await QualityInspection.findAll(query);
                        if (qidoclist && qidoclist.length > 0) {
                            qidoclist.map((item) => {
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
                ctx.throw('db.invalidQuery:141', 400);
            }
        }
    });
    /**
     * @api {post} /qualityInspection [品檢]-新增
     * @apiDescription 新增品檢
     * @apiGroup Production
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number} qualityStandard 品檢標準編號
     * @apiParam {Number} trussPlan 嘜架計畫編號
     * @apiParam {Number} cropCard 裁剪製卡編號
     * @apiParam {String} type 類別(總檢,組檢,中查)
     * @apiParam {Mix} [others] 其他欄位，請參考: <a href="#qualityInspection">品檢欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/qualityInspection
     * Body:
     * {
     *   "qualityStandard": 1112,
     *   "trussPlan": 1222,
     *   "cropCard": 1234,
     *   "type": "總檢",
     *   ...........
     * }
     * @apiSuccess (Success 200) {String} id 品檢的資料庫唯一ID，可以拿來查詢或是修改使用
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "id": "5b6d0d03993dc24293de551c"
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    qualityInspRouter.post('/qualityInspection', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:178', 400);
        }
        else {
            try {
                let qi = new QualityInspection_1.QualityInspection(ctx.request.body);
                let qidoc = await qi.save();
                if (qidoc && qidoc.id) {
                    let res = {
                        id: qidoc.id
                    };
                    ctx.body = res;
                    ctx.status = 200;
                    ctx.respond = true;
                }
                else {
                    ctx.throw('db.invalidParameters:193', 400);
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:197', 400);
            }
        }
    });
    /**
     * @api {post} /qualityInspection/update [品檢]-修改
     * @apiDescription 修改品檢資料
     * @apiGroup Production
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Object} condition 符合此條件的品檢會被修改
     * @apiParam {Number} condition.id 品檢編號，目前只開放依照品檢編號修改，將來若有需要批次修改的，再增加欄位
     * @apiParam {Object} update 欲修改的欄位
     * @apiParam {ooo} update.xxx 只需要填欲修改的欄位，沒有要修改的就不用填。欄位請參考: <a href="#qualityInspection">品檢欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/qualityInspection/update
     * Body:
     * {
     *   "condition": {
     *     id: 123456,
     *   },
     *   "update": {
     *     "qualityStandard": 1002,
     *     ...........
     *   }
     * }
     * @apiSuccess (Success 200) {Number} updateCount 修改成功的品檢筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "updateCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    qualityInspRouter.post('/qualityInspection/update', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:235', 400);
        }
        else if (false === dbquery_1.checkRequestParamObject(ctx.request.body.condition)) {
            ctx.throw('db.invalidParameters:237', 400);
        }
        else if (false === dbquery_1.checkRequestParamObject(ctx.request.body.update)) {
            ctx.throw('db.invalidParameters:239', 400);
        }
        else {
            try {
                let query = {
                    where: ctx.request.body.condition,
                };
                let updateres = await QualityInspection_1.QualityInspection.update(ctx.request.body.update, query);
                if (updateres && Array.isArray(updateres)) {
                    let res = {
                        updateCount: updateres[0]
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
    /**
     * @api {delete} /qualityInspection [品檢]-刪除
     * @apiDescription 刪除品檢
     * @apiGroup Production
     * @apiVersion 0.0.1
     * @apiParam {Number} id 品檢編號
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/qualityInspection
     * Body:
     * {
     *   "id": 123456
     * }
     * @apiSuccess (Success 200) {Number} deleteCount 刪除成功的品檢筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "deleteCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    qualityInspRouter.delete('/qualityInspection', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:289', 400);
        }
        else {
            try {
                let condition = {
                    where: ctx.request.body
                };
                let delcount = await QualityInspection_1.QualityInspection.destroy(condition);
                if (null !== delcount && undefined !== delcount) {
                    let res = {
                        deleteCount: delcount
                    };
                    ctx.body = res;
                    ctx.status = 200;
                    ctx.respond = true;
                }
                else {
                    ctx.throw('db.invalidParameters:306', 400);
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:310', 400);
            }
        }
    });
    /**
     * @api {post} /qualityInspection/bulk [品檢]-新增多筆
     * @apiDescription 新增多筆品檢
     * @apiGroup Production
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number} qualityStandard 品檢標準編號
     * @apiParam {Number} trussPlan 嘜架計畫編號
     * @apiParam {Number} cropCard 裁剪製卡編號
     * @apiParam {String} type 類別(總檢,組檢,中查)
     * @apiParam {Mix} [others] 其他欄位，請參考: <a href="#qualityInspection">品檢欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/qualityInspection/bulk
     * Body:
     *   {
     *     "qualityStandard": 1112,
     *     "trussPlan": 1222,
     *     "cropCard": 1234,
     *     "type": "總檢",
     *     ...........
     *   }
     * @apiSuccess (Success 200) {Array} id 品檢的資料庫唯一ID，可以拿來查詢或是修改使用
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "id": [1,2,3]
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    qualityInspRouter.post('/qualityInspection/bulk', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:347', 400);
        }
        else {
            try {
                let orderdelidata = await QualityInspection_1.QualityInspection.bulkCreate(ctx.request.body);
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
                    ctx.throw('db.invalidParameters:364', 400);
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:368', 400);
            }
        }
    });
    /**
     * @api {post} /qualityInspection/orderReport [品檢]-品質數據
     * @apiDescription 取得品質數據
     * @apiGroup Production
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number} [order] 訂單 id.
     * @apiParam {Number} [factory] 工廠 id.
     * @apiParam {String} [orderID] 訂單編號.
     * @apiParam {Date} [deliveryDate] 訂單交期
     * @apiParam {Boolean} [groupByTeam=false] 取得班組數據
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/qualityInspection/orderReport
     * Body:
     * {
     *     "orderID": '1001'
     *     ...........
     * }
     * @apiSuccess (Success 200) {Array} records 品檢統計表.
     * @apiSuccess (Success 200) {String} records.sytleID 款號.
     * @apiSuccess (Success 200) {String} records.productName 品名.
     * @apiSuccess (Success 200) {Number} records.id 生產單 id.
     * @apiSuccess (Success 200) {String} records.orderID 生產單號.
     * @apiSuccess (Success 200) {String} records.orderTotalAmount 訂單數量.
     * @apiSuccess (Success 200) {Date} records.orderDeliveryDate 生產單交期.
     * @apiSuccess (Success 200) {Number} records.type 檢驗類別(組檢/中檢/總檢).
     * - null: 該訂單沒有進行任何 品檢.
     * - not null : 該類別的組檢資料.
     * @apiSuccess (Success 200) {Number} records.totalAmount 總檢驗數量.
     * - null: 沒有任何品檢資料.
     * @apiSuccess (Success 200) {Number} [records.returnCount] 返工數量.
     * @apiSuccess (Success 200) {Number} [records.rejectCount] 次品數量.
     * @apiSuccess (Success 200) {Array} [records.teamData] 依班組統計資料列表. groupByTeam=true 時才呈現.
     * @apiSuccess (Success 200) {String} [records.teamData.type] 檢驗類別
     * @apiSuccess (Success 200) {Number} [records.teamData.team] 班組 id
     * @apiSuccess (Success 200) {String} [records.teamData.teamID] 班組編碼
     * @apiSuccess (Success 200) {String} [records.teamData.teamName] 班組名稱
     * @apiSuccess (Success 200) {String} [records.teamData.teamCategory] 班組類別
     * @apiSuccess (Success 200) {Number} [records.teamData.totalAmount] 檢驗數量
     * @apiSuccess (Success 200) {Number} [records.teamData.returnCount] 返工數量
     * @apiSuccess (Success 200) {Number} [records.teamData.rejectCount] 次品數量
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *  records: [{
     *      "styleID": "157150/1912",
     *      "productName": "七分裤",
     *      "orderID": "10001",
     *      "orderDeliveryDate": "2018-10-31",
     *      "type":"組檢",
     *      "totalAmount":1000,
     *      "returnCount": 30,
     *      "rejectCount": 10,
     *  }]
     * }
     * @apiSuccessExample {json} Success-Response Example-groupByTeam:
     * {
     *  records: [{
     *      "styleID": "157150/1912",
     *      "productName": "七分裤",
     *      "orderID": "10001",
     *      "orderDeliveryDate": "2018-10-31",
     *      "type":"組檢",
     *      "totalAmount":1000,
     *      "teamData": [
     *          {
     *              "team": 2,
     *              "type": "1",
     *              "rejectCount": 3,
     *              "returnCount": 5,
     *              "totalAmount": 283,
     *              "teamID": "CJ01",
     *              "teamName": "裁剪1组"
     *              "teamCategory": "裁剪"
     *          },
     *          {
     *              "team": 4,
     *              "type": "1",
     *              "rejectCount": 0,
     *              "returnCount": 0,
     *              "totalAmount": 10,
     *              "teamID": "CF01",
     *              "teamName": "车缝1组"
     *          }
     *      ]
     *  }]
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    qualityInspRouter.post('/qualityInspection/orderReport', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:466', 400);
        }
        else {
            try {
                let params = ctx.request.body;
                let args = [];
                let whereO = [];
                let sqlOCmd = 'SELECT Style.styleID as styleID, Style.productName as productName, ' +
                    'Orders.orderID as orderID, Orders.id as id, ' +
                    'Orders.deliveryDate as orderDeliveryDate, ' +
                    'QI.type as type, ' +
                    'SUM(QI.amount) as totalAmount ' +
                    'FROM `Order` as Orders ' +
                    'LEFT OUTER JOIN QualityInspection AS QI ON Orders.id=QI.order ' +
                    'LEFT JOIN Style AS Style ON Orders.style=Style.styleID ';
                if (params.order) {
                    whereO.push(' Orders.id=? ');
                    args.push(params.order);
                }
                if (params.orderID) {
                    whereO.push(' Orders.orderID=? ');
                    args.push(params.orderID);
                }
                if (params.deliveryDate) {
                    whereO.push(' Orders.deliveryDate=? ');
                    args.push(params.deliveryDate);
                }
                if (params.factory) {
                    sqlOCmd += 'LEFT JOIN TeamMember AS TM ON QI.worker=TM.member ';
                    whereO.push(' TM.team IN (SELECT id FROM Team WHERE Team.factory=?) ');
                    args.push(params.factory);
                }
                if (whereO.length > 0) {
                    sqlOCmd += ('WHERE' + whereO.join('AND'));
                }
                sqlOCmd += ' GROUP BY id, QI.type;';
                let SqlResCmd = 'SELECT QI.type as type, Count(QIR.id) as issueCount, QIR.result as result ' +
                    'FROM QualityInspection AS QI ' +
                    'LEFT JOIN QualityInspectionResult as QIR ON QI.id=QIR.qualityInspection ';
                //                               'WHERE QI.order=? AND QI.type=? GROUP BY result;';
                let sqlSumInspect = 'SELECT SUM(QI.amount) as total ';
                sqlSumInspect += 'FROM QualityInspection AS QI ';
                sqlSumInspect += 'LEFT JOIN TeamMember AS TM ON QI.worker=TM.member ';
                sqlSumInspect += 'WHERE QI.order=? AND QI.type=? AND team=? ;';
                if (params.factory) {
                    SqlResCmd += 'LEFT JOIN TeamMember AS TM ON QI.worker=TM.member ';
                    SqlResCmd += 'WHERE QI.order=? AND QI.type=? ';
                    SqlResCmd += 'AND TM.team IN (SELECT id FROM Team WHERE Team.factory=?) ';
                    SqlResCmd += 'GROUP BY result;';
                }
                else {
                    SqlResCmd += 'WHERE QI.order=? AND QI.type=? GROUP BY result;';
                }
                if (params.groupByTeam) {
                    SqlResCmd = 'SELECT QI.type as `type`, Count(QIR.id) as issueCount, QIR.result as result, ';
                    SqlResCmd += 'TM.team as team ';
                    SqlResCmd += 'FROM QualityInspection AS QI ';
                    SqlResCmd += 'LEFT JOIN QualityInspectionResult AS QIR ON QI.id=QIR.qualityInspection ';
                    SqlResCmd += 'LEFT JOIN TeamMember AS TM ON QI.worker=TM.member ';
                    SqlResCmd += 'WHERE QI.order=? AND QI.type=? ';
                    if (params.factory) {
                        SqlResCmd += 'AND TM.team IN (SELECT id FROM Team WHERE Team.factory=?) ';
                    }
                    SqlResCmd += 'GROUP BY `type`, team, result ORDER BY type, team, result;';
                }
                let resOrderGroup = await QualityInspection_1.QualityInspection.sequelize.query({
                    query: sqlOCmd,
                    values: args
                });
                let reports = [];
                if (resOrderGroup && Array.isArray(resOrderGroup) && Array.isArray(resOrderGroup[0])) {
                    // console.log(resOrderGroup[0]);
                    for (let report of resOrderGroup[0]) {
                        if (undefined === params.groupByTeam || false === params.groupByTeam) {
                            report.returnCount = 0;
                            report.rejectCount = 0;
                            if (report.totalAmount && 'string' === typeof report.totalAmount) {
                                report.totalAmount = Number.parseInt(report.totalAmount);
                            }
                            if (report.id) {
                                let id = report.id;
                                if ('string' === typeof report.id) {
                                    id = Number.parseInt(report.id);
                                }
                                let orderids = [id, report.type];
                                if (params.factory) {
                                    orderids.push(params.factory);
                                }
                                let issueRes = await QualityInspection_1.QualityInspection.sequelize.query({
                                    query: SqlResCmd,
                                    values: orderids
                                });
                                if (issueRes && Array.isArray(issueRes) && Array.isArray(issueRes[0])) {
                                    for (let issue of issueRes[0]) {
                                        if (0 === issue.result || '0' === issue.result) {
                                            report.returnCount = issue.issueCount;
                                            if ('string' === typeof report.returnCount) {
                                                report.returnCount = Number.parseInt(report.returnCount);
                                            }
                                        }
                                        else if (1 === issue.result || '1' === issue.result) {
                                            report.rejectCount = issue.issueCount;
                                            if ('string' === typeof report.rejectCount) {
                                                report.rejectCount = Number.parseInt(report.rejectCount);
                                            }
                                        }
                                    }
                                }
                            }
                            reports.push(report);
                        }
                        else {
                            if (report.id) {
                                let id = report.id;
                                if ('string' === typeof report.id) {
                                    id = Number.parseInt(report.id);
                                }
                                let orderids = [id, report.type];
                                if (params.factory) {
                                    orderids.push(params.factory);
                                }
                                let issueRes = await QualityInspection_1.QualityInspection.sequelize.query({
                                    query: SqlResCmd,
                                    values: orderids
                                });
                                report.teamData = [];
                                if (issueRes && Array.isArray(issueRes) && Array.isArray(issueRes[0])) {
                                    let curteam = null;
                                    for (let issue of issueRes[0]) {
                                        if (null === curteam || curteam.team !== issue.team || curteam.type !== issue.type) {
                                            if (null !== curteam) {
                                                report.teamData.push(curteam);
                                            }
                                            curteam = {
                                                team: issue.team,
                                                type: issue.type,
                                                rejectCount: 0,
                                                returnCount: 0,
                                                totalAmount: 0,
                                            };
                                            let tagTeam = await Team_1.Team.findById(issue.team);
                                            if (tagTeam) {
                                                curteam.teamID = tagTeam.teamID;
                                                curteam.teamName = tagTeam.name;
                                                curteam.teamCategory = tagTeam.category;
                                            }
                                            let sumArgs = [id, report.type, issue.team];
                                            if (params.factory) {
                                                sumArgs.push(params.factory);
                                            }
                                            let sumRes = await QualityInspection_1.QualityInspection.sequelize.query({
                                                query: sqlSumInspect,
                                                values: sumArgs
                                            });
                                            if (sumRes && Array.isArray(sumRes) && Array.isArray(sumRes[0])) {
                                                curteam.totalAmount = sumRes[0][0].total;
                                                if ('string' === typeof curteam.totalAmount) {
                                                    curteam.totalAmount = Number.parseInt(curteam.totalAmount);
                                                }
                                            }
                                        }
                                        if (0 === issue.result || '0' === issue.result) {
                                            curteam.returnCount = issue.issueCount;
                                            if ('string' === typeof curteam.returnCount) {
                                                curteam.returnCount = Number.parseInt(curteam.returnCount);
                                            }
                                        }
                                        else if (1 === issue.result || '1' === issue.result) {
                                            curteam.rejectCount = issue.issueCount;
                                            if ('string' === typeof curteam.rejectCount) {
                                                curteam.rejectCount = Number.parseInt(curteam.rejectCount);
                                            }
                                        }
                                    }
                                    if (null !== curteam) {
                                        report.teamData.push(curteam);
                                    }
                                }
                            }
                            reports.push(report);
                        }
                    }
                }
                ctx.body = {
                    records: reports
                };
                ctx.status = 200;
                ctx.respond = true;
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:665', 400);
            }
        }
    });
    /**
     * @api {post} /qualityInspection/orderFactoryReport [品檢]-工廠品檢數據
     * @apiDescription 取得工廠 檢查 返工,次品統計量
     * @apiGroup Production
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number} factory 工廠 id.
     * @apiParam {Number} [order] 訂單 id.
     * @apiParam {String} [orderID] 訂單編號.
     * @apiParam {String} [orderDateRange] 查詢時間範圍內的訂單.
     * @apiParam {String} [orderDateRange.startDate] 訂單交期 開始日期.
     * @apiParam {String} [orderDateRange.endDate] 訂單交期 結束日期.
     * @apiParam {Date} [deliveryDate] 訂單交期
     * @apiParam {Boolean} [groupByTeam=false] 取得班組數據
     * @apiParam {Array} format 要統計的項目及條件.
     * @apiParam {String} format.name 顯示數據的項目名稱.
     * @apiParam {String} format.type 統計目標的檢驗類別.
     * @apiParam {String} [format.category] 統計目標的問題種類.
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/qualityInspection/orderReport
     * Body:
     * {
     *     "order": 1,
     *     "factory": 1,
     *     "format": [{ "name":"組檢", "type":"0"},
     *          { "name":"中查", "type":"1"},
     *          { "name":"總檢", "type":"2"},
     *          { "name":"鎖釘", "type":"2", "category":"lock"},
     *          { "name":"整燙", "type":"2", "category":"iron"},
     *     ]
     * }
     * @apiSuccess (Success 200) {Array} records 生產單品檢統計表.
     * @apiSuccess (Success 200) {Number} records.order 生產單 id.
     * @apiSuccess (Success 200) {String} records.sytleID 款號.
     * @apiSuccess (Success 200) {String} records.productName 品名.
     * @apiSuccess (Success 200) {String} records.orderID 生產單號.
     * @apiSuccess (Success 200) {Date} records.orderDeliveryDate 生產單交期.
     * @apiSuccess (Success 200) {Number} records.orderTotalAmount 生產單總量.
     * @apiSuccess (Success 200) {Number} records.factory 工廠 id.
     * @apiSuccess (Success 200) {Number} records.factoryAmount 工廠排產數量.
     * @apiSuccess (Success 200) {Number} [records.FormatNameInspectionCount] 檢驗次數
     * - groupByTeam 為 false 時才計算
     * - FormatName 為 format 參數子項 Name
     * @apiSuccess (Success 200) {Number} [records.FormatNameReturnCount] 返工數量
     * - groupByTeam 為 false 時才計算
     * - FormatName 為 format 參數子項 Name
     * @apiSuccess (Success 200) {Number} [records.FormatNameRejectCount] 次品數量
     * - groupByTeam 為 false 時才計算
     * - FormatName 為 format 參數子項 Name
     * @apiSuccess (Success 200) {Number} [records.returnCount] 返工數量.
     * @apiSuccess (Success 200) {Number} [records.rejectCount] 次品數量.
     * @apiSuccess (Success 200) {Array} [records.teamData] 依班組統計資料列表. groupByTeam=true 時才呈現.
     * @apiSuccess (Success 200) {Number} [records.teamData.team] 班組 id
     * @apiSuccess (Success 200) {String} [records.teamData.teamID] 班組編碼
     * @apiSuccess (Success 200) {String} [records.teamData.teamName] 班組名稱
     * @apiSuccess (Success 200) {String} [records.teamData.teamCategory] 班組類別
     * @apiSuccess (Success 200) {String} [records.teamData.teamAmount] 班組排產數量
     * @apiSuccess (Success 200) {Number} [records.teamData.FormatNameInspectionCount] 檢驗次數
     * - FormatName 為 format 參數子項 Name
     * @apiSuccess (Success 200) {Number} [records.teamData.FormatNameReturnCount] 返工數量
     * - FormatName 為 format 參數子項 Name
     * @apiSuccess (Success 200) {Number} [records.teamData.FormatNameRejectCount] 次品數量
     * - FormatName 為 format 參數子項 Name
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *  records: [{
     *      "order": 1,
     *      "orderID": "order001",
     *      "orderDeliveryDate": "2018-10-25",
     *      "style": "fashion",
     *      "productName": "jacket",
     *      "orderTotalAmount": 5000,
     *      "factory": 1,
     *      "factoryAmount": 335,
     *      "中查InspectionCount": 30,
     *      "中查RetrunCount": 0,
     *      "中查RejectCount": 0,
     *      "總檢InspectionCount": 0,
     *      "總檢RetrunCount": 0,
     *      "總檢RejectCount": 0,
     *      "鎖釘InspectionCount": 0,
     *      "鎖釘RetrunCount": 0,
     *      "鎖釘RejectCount": 0,
     *      "整燙InspectionCount": 0,
     *      "整燙RetrunCount": 0,
     *      "整燙RejectCount": 0
     *  }]
     * }
     * @apiSuccessExample {json} Success-Response Example-groupByTeam:
     * {
     *  records: [{
     *      "order": 1,
     *      "orderID": "order001",
     *      "orderDeliveryDate": "2018-10-25",
     *      "style": "fashion",
     *      "productName": "jacket",
     *      "orderTotalAmount": 5000,
     *      "factory": 1,
     *      "factoryAmount": 335,
     *      "teamData": [{
     *              "team": 1,
     *              "teamID": "T01",
     *              "teamName": "CRT01",
     *              "teamCategory": "裁剪",
     *              "teamAmount":100
     *              "中查InspectionCount": 30,
     *              "中查RetrunCount": 0,
     *              "中查RejectCount": 0,
     *              "總檢InspectionCount": 0,
     *              "總檢RetrunCount": 0,
     *              "總檢RejectCount": 0,
     *              "鎖釘InspectionCount": 0,
     *              "鎖釘RetrunCount": 0,
     *              "鎖釘RejectCount": 0,
     *              "整燙InspectionCount": 0,
     *              "整燙RetrunCount": 0,
     *              "整燙RejectCount": 0
     *          },
     *          {
     *              "team": 2,
     *              "teamID": "CJ01",
     *              "teamName": "裁剪1组",
     *              "teamCategory": "裁剪",
     *              "teamAmount":310
     *              "中查InspectionCount": 303,
     *              "中查RetrunCount": 5,
     *              "中查RejectCount": 2,
     *              "總檢InspectionCount": 0,
     *              "總檢RetrunCount": 0,
     *              "總檢RejectCount": 0,
     *              "鎖釘InspectionCount": 20,
     *              "鎖釘RetrunCount": 2,
     *              "鎖釘RejectCount": 0,
     *              "整燙InspectionCount": 0,
     *              "整燙RetrunCount": 0,
     *              "整燙RejectCount": 0
     *          }]
     *      }]
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    qualityInspRouter.post('/qualityInspection/orderFactoryReport', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:815', 400);
        }
        else if (undefined === ctx.request.body.factory) {
            ctx.throw('api.bodyIsEmpty:817', 400);
        }
        else if (undefined === ctx.request.body.format &&
            false === Array.isArray(ctx.request.body.format)) {
            ctx.throw('api.bodyIsEmpty:820', 400);
        }
        else {
            try {
                let params = ctx.request.body;
                let args = [];
                let whereO = [];
                let reports = [];
                let orders = [];
               
                let status=[3];
                if (params.status){
                    status=params.status;
                } 
                if (params.order) {
                    let o = await Order_1.Order.findById(params.order);
                    if (o) {
                        orders.push(o.toJSON());
                    }
                }
                else if (params.orderID && params.deliveryDate) {
                    let os = await Order_1.Order.findAll({
                        where: {
                            orderID: params.orderID,
                            deliveryDate: params.deliveryDate,
                            status:status
                        }
                        ,order:[['deliveryDate','DESC']]
                    });
                    if (os) {
                        if (os && Array.isArray(os)) {
                            for (let o of os) {
                                orders.push(o.toJSON());
                            }
                        }
                    }
                }
                else if (params.orderID) {
                    let os = await Order_1.Order.findAll({
                        where: {
                            orderID: params.orderID,
                            status:status
                        }
                        ,order:[['deliveryDate','DESC']]
                    });
                    if (os && Array.isArray(os)) {
                        for (let o of os) {
                            orders.push(o.toJSON());
                        }
                    }
                }
                else if (params.orderDateRange && params.orderDateRange.startDate &&
                    params.orderDateRange.endDate) {
                    let os = await Order_1.Order.findAll({
                        where: {
                            deliveryDate: {
                                [Op.between]: [params.orderDateRange.startDate, params.orderDateRange.endDate]
                            },
                            status:status
                        },
                        order:[['deliveryDate','DESC']]
                    });
                    if (os && Array.isArray(os)) {
                        for (let o of os) {
                            orders.push(o.toJSON());
                        }
                    }
                }
                else {
                    let os = await Order_1.Order.findAll({
                        where:{status:status}, 
                        order:[['deliveryDate','DESC']]
                    });
                    if (os && Array.isArray(os)) {
                        for (let o of os) {
                            orders.push(o.toJSON());
                        }
                    }
                }
                // if (0 === orders.length) {
                //     ctx.throw('api.orderNotSpecified:885', 790);
                //     return;
                // }
                for (let order of orders) {
                    let orderreport = await queryOrderQualityInspectReport(order, params.factory, params.format, params.groupByTeam);
                    if (null !== orderreport) {
                        reports.push(orderreport);
                    }
                }
                ctx.body = {
                    records: reports
                };
                ctx.status = 200;
                ctx.respond = true;
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:901，error:'+err.toString(), 400);
            }
        }
    });
    /**
     * @api {post} /qualityInspection/orderQualityTypeReport [品檢]-品檢問題數據
     * @apiDescription 取得品檢問題細項統計數據
     * @apiGroup Production
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {String} type 檢驗類別 (組檢/總檢/中查)
     * @apiParam {Number} [order] 訂單 id.
     * @apiParam {Number} [factory] 工廠 id.
     * @apiParam {String} [orderID] 訂單編號.
     * @apiParam {Date} [deliveryDate] 訂單交期
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/qualityInspection/orderQualityTypeReport
     * Body:
     *   {
     *     "type": "總檢"
     *     ...........
     *   }
     * @apiSuccess (Success 200) {Array} records 品檢統計表.
     * @apiSuccess (Success 200) {String} records.sytleID 款號.
     * @apiSuccess (Success 200) {String} records.productName 品名.
     * @apiSuccess (Success 200) {Number} records.order 生產單 id.
     * @apiSuccess (Success 200) {String} records.orderID 生產單號.
     * @apiSuccess (Success 200) {Date} records.orderDeliveryDate 生產單交期.
     * @apiSuccess (Success 200) {Number} records.type 檢驗類別(組檢/中檢/總檢).
     * - null: 該訂單沒有進行任何 品檢.
     * - not null : 該類別的組檢資料.
     * @apiSuccess (Success 200) {Number} records.totalInspectionAmount 總檢驗次數.
     * - null: 沒有任何品檢資料.
     * @apiSuccess (Success 200) {Array} [records.categoryData] 檢驗項目計錄
     * @apiSuccess (Success 200) {String} [records.categoryData.category] 檢驗項目類別
     * @apiSuccess (Success 200) {Number} [records.categoryData.returnCount] 返工數量
     * @apiSuccess (Success 200) {Number} [records.categoryData.rejectCount] 次品數量
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *  records: [{
     *      "styleID": "157150/1912",
     *      "productName": "七分裤",
     *      "orderID": "10001",
     *      "orderDeliveryDate": "2018-10-31",
     *      "type":"總檢",
     *      "totalInspectionAmount":1000,
     *      "categoryData": [
     *          {
     *              "category": "鎖釘",
     *              "returnCount": 16,
     *              "rejectCount": 5
     *          },
     *          {
     *              "category": "整燙",
     *              "returnCount": 3,
     *              "rejectCount": 0
     *          }
     *      ]
     *  }]
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    qualityInspRouter.post('/qualityInspection/orderQualityTypeReport', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:968', 400);
        }
        else if (undefined === ctx.request.body.type) {
            ctx.throw('api.bodyIsEmpty:970', 400);
        }
        else {
            try {
                let params = ctx.request.body;
                let args = [];
                let whereO = [];
                let sqlOCmd = 'SELECT Orders.orderID as orderID, Orders.id as `order`, ' +
                    'Orders.deliveryDate as orderDeliveryDate, ' +
                    'QI.type as type, ' +
                    'SUM(QI.amount) as totalInspectionAmount ' +
                    'FROM QualityInspection as QI ' +
                    'LEFT JOIN `Order` as Orders ON QI.order=Orders.id ';
                if (params.type) {
                    whereO.push(' QI.type=? ');
                    args.push(params.type);
                }
                if (params.id) {
                    whereO.push(' Orders.id=? ');
                    args.push(params.id);
                }
                if (params.orderID) {
                    whereO.push(' Orders.orderID=? ');
                    args.push(params.orderID);
                }
                if (params.deliveryDate) {
                    whereO.push(' Orders.deliveryDate=? ');
                    args.push(params.deliveryDate);
                }
                if (params.factory) {
                    sqlOCmd += 'LEFT JOIN TeamMember AS TM ON QI.worker=TM.member ';
                    whereO.push(' TM.team IN (SELECT id FROM Team WHERE Team.factory=?) ');
                    args.push(params.factory);
                }
                if (whereO.length > 0) {
                    sqlOCmd += ('WHERE' + whereO.join('AND'));
                }
                sqlOCmd += ' GROUP BY QI.order, QI.type;';
                let SqlResCmd = 'SELECT QI.type as type, Count(QIR.id) as issueCount, QIR.category as category, ' +
                    'QIR.result as result ' +
                    'FROM QualityInspection AS QI ' +
                    'LEFT JOIN QualityInspectionResult as QIR ON QI.id=QIR.qualityInspection ' +
                    'LEFT JOIN TeamMember as TM ON QI.worker=TM.member ' +
                    'WHERE QI.order=? AND QI.type=? ';
                if (params.factory) {
                    SqlResCmd += ' AND TM.team IN (SELECT id FROM Team WHERE Team.factory=?) ';
                }
                SqlResCmd += 'GROUP BY category, result ORDER BY category';
                let resOrderGroup = await QualityInspection_1.QualityInspection.sequelize.query({
                    query: sqlOCmd,
                    values: args
                });
                let reports = [];
                let order = null;
                let style = null;
                if (resOrderGroup && Array.isArray(resOrderGroup) && Array.isArray(resOrderGroup[0])) {
                    // console.log(resOrderGroup[0]);
                    for (let report of resOrderGroup[0]) {
                        if (report.totalInspectionAmount && 'string' === typeof report.totalInspectionAmount) {
                            report.totalInspectionAmount = Number.parseInt(report.totalInspectionAmount);
                        }
                        if (null === order || order.id !== report.order) {
                            let odoc = await Order_1.Order.findById(report.order);
                            if (odoc) {
                                order = odoc.toJSON();
                                let ostyle = await Style_1.Style.findById(order.style);
                                if (ostyle) {
                                    style = ostyle.toJSON();
                                }
                            }
                        }
                        if (style) {
                            report.styleID = style.styleID;
                            report.productName = style.productName;
                        }
                        report.categoryData = [];
                        if (report.order) {
                            let id = report.order;
                            if ('string' === typeof report.order) {
                                id = Number.parseInt(report.order);
                            }
                            let orderids = [id, report.type];
                            if (params.factory) {
                                orderids.push(params.factory);
                            }
                            let issueRes = await QualityInspection_1.QualityInspection.sequelize.query({
                                query: SqlResCmd,
                                values: orderids
                            });
                            if (issueRes && Array.isArray(issueRes) && Array.isArray(issueRes[0])) {
                                let catReport = null;
                                for (let issue of issueRes[0]) {
                                    if (null === catReport || issue.category !== catReport.category) {
                                        if (null !== catReport && catReport.category) {
                                            report.categoryData.push(catReport);
                                        }
                                        catReport = {
                                            category: issue.category,
                                            returnCount: 0,
                                            rejectCount: 0
                                        };
                                    }
                                    if (0 === issue.result || '0' === issue.result) {
                                        catReport.returnCount = issue.issueCount;
                                        if ('string' === typeof catReport.returnCount) {
                                            catReport.returnCount = Number.parseInt(catReport.returnCount);
                                        }
                                    }
                                    else if (1 === issue.result || '1' === issue.result) {
                                        catReport.rejectCount = issue.issueCount;
                                        if ('string' === typeof catReport.rejectCount) {
                                            catReport.rejectCount = Number.parseInt(catReport.rejectCount);
                                        }
                                    }
                                }
                                if (null !== catReport && null !== catReport.category) {
                                    report.categoryData.push(catReport);
                                }
                            }
                        }
                        reports.push(report);
                    }
                }
                ctx.body = {
                    records: reports
                };
                ctx.status = 200;
                ctx.respond = true;
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:1111', 400);
            }
        }
    });
    /**
     * @api {post} /qualityInspection/memberReport [品檢]-品檢個人數據查詢
     * @apiDescription 取得個人品檢數據
     * @apiGroup Production
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {String} employeeID 工號
     * @apiParam {Date} startTime 查詢開始時間
     * @apiParam {Date} endTime 查詢結束時間
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/qualityInspection/memberReport
     * Body:
     * {
     *   "employeeID": "A000001",
     *   "startTime": "2018-10-01T00:00:00.000Z",
     *   "endTime": "2018-10-31T00:00:00.000Z",
     * },
     * @apiSuccess (Success 200) {Number} id 帳號 id.
     * @apiSuccess (Success 200) {String} employeeID 員工編號
     * @apiSuccess (Success 200) {String} username 帳號.
     * @apiSuccess (Success 200) {String} chineseName 中文姓名.
     * @apiSuccess (Success 200) {Date} startTime 開始時間.
     * @apiSuccess (Success 200) {Date} endTime 結束時間.
     * @apiSuccess (Success 200) {Number} totalAmount 總檢查數.
     * @apiSuccess (Success 200) {Number} totalReturnCount 返工總量.
     * @apiSuccess (Success 200) {Number} totalRejectCount 次品總量.
     * @apiSuccess (Success 200) {Number} returnRate 返工比率.
     * @apiSuccess (Success 200) {Number} rejectRate 次品比率.
     * @apiSuccess (Success 200) {Number} passRate 合格比率.
     * @apiSuccess (Success 200) {Array} records 品檢依日期統計表.
     * @apiSuccess (Success 200) {String} records.inspectedDate 日期.
     * @apiSuccess (Success 200) {String} records.amount 總檢查量.
     * @apiSuccess (Success 200) {Number} records.returnCount 返工量.
     * @apiSuccess (Success 200) {Number} records.rejectCount 次品量.
     * @apiSuccess (Success 200) {Number} records.returnRate 返工率.
     * @apiSuccess (Success 200) {Number} records.rejectRate 次品率.
     * @apiSuccess (Success 200) {Number} records.passRate 合格.
     * - null: 該訂單沒有進行任何 品檢.
     * - not null : 該類別的組檢資料.
     * @apiSuccess (Success 200) {Number} records.totalAmount 檢驗數量.
     * - null: 沒有任何品檢資料.
     * @apiSuccess (Success 200) {Array} [records.categoryData] 檢驗項目計錄
     * @apiSuccess (Success 200) {Number} [records.categoryData.category] 檢驗項目類別
     * @apiSuccess (Success 200) {Number} [records.categoryData.returnCount] 返工數量
     * @apiSuccess (Success 200) {Number} [records.categoryData.rejectCount] 次品數量
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *  records: [{
     *      "styleID": "157150/1912",
     *      "productName": "七分裤",
     *      "orderID": "10001",
     *      "deliveryDate": "2018-10-31",
     *      "type":"總檢",
     *      "totalAmount":1000,
     *      "categoryData": [
     *          {
     *              "category": "鎖釘",
     *              "returnCount": 16,
     *              "rejectCount": 5
     *          },
     *          {
     *              "category": "整燙",
     *              "returnCount": 3,
     *              "rejectCount": 0
     *          }
     *      ]
     *  }]
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    qualityInspRouter.post('/qualityInspection/memberReport', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:1190', 400);
        }
        else if (undefined === ctx.request.body.employeeID ||
            undefined === ctx.request.body.startTime ||
            undefined === ctx.request.body.endTime) {
            ctx.throw('api.bodyIsEmpty:1194', 400);
        }
        else {
            try {
                let params = ctx.request.body;
                let args = [];
                let whereO = [];
                let startTime = new Date(params.startTime);
                let endTime = new Date(params.endTime);
                let AccInfo = await UserAccount_1.UserAccount.findOne({
                    where: {
                        employeeID: params.employeeID
                    }
                });
                if (null === AccInfo || undefined === AccInfo) {
                    ctx.body = {
                        records: []
                    };
                    ctx.status = 200;
                    ctx.respond = true;
                    return;
                }
                let sqlQICountCmd = 'SELECT DATE_FORMAT(QI.inspectedTime, "%Y-%m-%d") as inspectedDate, ' +
                    'SUM(QI.amount) AS amount ' +
                    'FROM QualityInspection AS QI ' +
                    'WHERE QI.worker=? AND QI.inspectedTime BETWEEN ? AND ? ' +
                    'GROUP BY inspectedDate; ';
                let sqlQIRCmd = 'SELECT Count(QIR.id) AS issueCount, ' +
                    'QIR.result as result ' +
                    'FROM QualityInspection AS QI ' +
                    'LEFT JOIN QualityInspectionResult AS QIR ON QI.id=QIR.qualityInspection ' +
                    'WHERE QI.worker=? AND QI.inspectedTime BETWEEN ? AND ? ' +
                    'GROUP BY result; ';
                args.push(AccInfo.id);
                args.push(params.startTime);
                args.push(params.endTime);
                let resOrderGroup = await QualityInspection_1.QualityInspection.sequelize.query({
                    query: sqlQICountCmd,
                    values: args
                });
                let reports = [];
                let totalReport = {
                    totalAmount: 0,
                    returnCount: 0,
                    rejectCount: 0,
                    returnRate: 0,
                    rejectRate: 0,
                    passRate: 100
                };
                if (resOrderGroup && Array.isArray(resOrderGroup) && Array.isArray(resOrderGroup[0])) {
                    // console.log(resOrderGroup[0]);
                    for (let reportDaily of resOrderGroup[0]) {
                        if (reportDaily.amount && 'string' === typeof reportDaily.amount) {
                            reportDaily.amount = Number.parseInt(reportDaily.amount);
                        }
                        let dateStart = new Date(reportDaily.inspectedDate);
                        let dateEnd = new Date(dateStart.getTime() + 24 * 36000 * 1000);
                        console.log('date ', dateStart, dateEnd);
                        if (dateStart < startTime) {
                            dateStart = startTime;
                        }
                        if (dateEnd > endTime) {
                            dateEnd = endTime;
                        }
                        let dailyArgs = [AccInfo.id, dateStart, dateEnd];
                        let resQIRGroup = await QualityInspection_1.QualityInspection.sequelize.query({
                            query: sqlQIRCmd,
                            values: dailyArgs
                        });
                        if (resQIRGroup && Array.isArray(resQIRGroup) && Array.isArray(resQIRGroup[0])) {
                            for (let qirGroup of resQIRGroup[0]) {
                                if (0 === qirGroup.result || '0' === qirGroup.result) {
                                    reportDaily.returnCount = qirGroup.issueCount;
                                    if ('string' === typeof reportDaily.returnCount) {
                                        reportDaily.returnCount = Number.parseInt(reportDaily.returnCount);
                                    }
                                }
                                if (1 === qirGroup.result || '1' === qirGroup.result) {
                                    reportDaily.rejectCount = qirGroup.issueCount;
                                    if ('string' === typeof reportDaily.rejectCount) {
                                        reportDaily.rejectCount = Number.parseInt(reportDaily.rejectCount);
                                    }
                                }
                            }
                        }
                        reportDaily.returnRate = 0;
                        reportDaily.rejectRate = 0;
                        reportDaily.passRate = 100;
                        if (reportDaily.amount && 'number' === typeof reportDaily.amount) {
                            totalReport.totalAmount += reportDaily.amount;
                            if (reportDaily.amount > 0) {
                                if (reportDaily.returnCount && 'number' === typeof reportDaily.returnCount) {
                                    reportDaily.returnRate = (reportDaily.returnCount * 100) / reportDaily.amount;
                                }
                                if (reportDaily.rejectCount && 'number' === typeof reportDaily.rejectCount) {
                                    reportDaily.rejectRate = (reportDaily.rejectCount * 100) / reportDaily.amount;
                                }
                                reportDaily.passRate = 100 - reportDaily.returnRate - reportDaily.rejectRate;
                            }
                        }
                        if (reportDaily.returnCount) {
                            if ('number' === typeof reportDaily.returnCount) {
                                totalReport.returnCount += reportDaily.returnCount;
                            }
                        }
                        else {
                            reportDaily.returnCount = 0;
                        }
                        if (reportDaily.rejectCount) {
                            if ('number' === typeof reportDaily.rejectCount) {
                                totalReport.rejectCount += reportDaily.rejectCount;
                            }
                        }
                        else {
                            reportDaily.rejectCount = 0;
                        }
                        reports.push(reportDaily);
                    }
                }
                if (0 !== totalReport.totalAmount) {
                    totalReport.returnRate = totalReport.returnCount * 100 / totalReport.totalAmount;
                    totalReport.rejectRate = totalReport.rejectCount * 100 / totalReport.totalAmount;
                    totalReport.passRate = 100 - totalReport.returnRate - totalReport.rejectRate;
                }
                ctx.body = {
                    id: AccInfo.id,
                    employeeID: AccInfo.employeeID,
                    username: AccInfo.username,
                    chineseName: AccInfo.chineseName,
                    startTime: params.startTime,
                    endTime: params.endTime,
                    totalAmount: totalReport.totalAmount,
                    totalReturnCount: totalReport.returnCount,
                    totalRejectCount: totalReport.rejectCount,
                    returnRate: totalReport.returnRate,
                    rejectRate: totalReport.rejectRate,
                    passRate: totalReport.passRate,
                    records: reports
                };
                ctx.status = 200;
                ctx.respond = true;
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:1343', 400);
            }
        }
    });
    /**
     * @api {post} /qualityInspection/issueRate [品檢]-統計問題類別比例
     * @apiDescription 取得問題類別比例
     * @apiGroup Production
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {number} [order] 訂單 id.
     * @apiParam {String} [orderID] 訂單編號.
     * @apiParam {Date}   [deliveryDate] 訂單交期
     * @apiParam {number} [factory] 工廠 id
     * @apiParam {string} [teamCategory] 班組屬性 只計算該類別班組
     * @apiParam {boolean} [groupByTeam=true] 是否依班組統計.
     * - true: 依班組為單位統計.
     * - false: 乎略班組資訊.
     * @apiParam {number} [team] 班組 id
     * @apiParam {string} [teamID] 班組組號
     * @apiParam {string} [teamName] 班組名稱
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/qualityInspection/issueRate
     * Body:
     * {
     *  "team":2
     * }
     * @apiSuccess (Success 200) {Array} records 問題列表.
     * @apiSuccess (Success 200) {String} records.type 檢驗類別(組檢/中檢/總檢).
     * @apiSuccess (Success 200) {String} records.category 問題類別.
     * @apiSuccess (Success 200) {String} [records.typeIssueCount] 檢驗類別總問題數量.
     * - groupByTeam 為 false 顯示.
     * @apiSuccess (Success 200) {String} [records.team] 班組 id.
     * - groupByTeam 為 true 顯示.
     * @apiSuccess (Success 200) {String} [records.teamName] 班組名稱..
     * - groupByTeam 為 true 顯示.
     * @apiSuccess (Success 200) {String} [records.teamCategory] 班組屬性..
     * - groupByTeam 為 true 顯示.
     * @apiSuccess (Success 200) {String} [records.teamIssueCount] 班組總問題數量.
     * - groupByTeam 為 true 顯示.
     * - null: 班組無 錯誤記錄
     * @apiSuccess (Success 200) {Number} records.issueCount 問題類號累計數量
     * @apiSuccess (Success 200) {Number} records.issueRate 比例.
     * @apiSuccessExample {json} Success-Response (groupByTeam=true) Example:
     * {
     *     "records": [
     *         {
     *             "team": 2,
     *             "teamName": "裁剪1组",
     *             "teamCategory": "裁剪",
     *             "issueCount": 5,
     *             "type": "1",
     *             "teamIssueCount": 1,
     *             "category": "cat2",
     *             "issueRate": 20
     *         },
     *         {
     *             "team": 2,
     *             "teamName": "裁剪1组",
     *             "teamCategory": "裁剪",
     *             "issueCount": 5,
     *             "type": "1",
     *             "teamIssueCount": 1,
     *             "category": "cat3",
     *             "issueRate": 20
     *         },
     *         {
     *             "team": 2,
     *             "teamName": "裁剪1组",
     *             "teamCategory": "裁剪",
     *             "issueCount": 5,
     *             "type": "1",
     *             "teamIssueCount": 2,
     *             "category": "cat4",
     *             "issueRate": 40
     *         },
     *         {
     *             "team": 2,
     *             "teamName": "裁剪1组",
     *             "teamCategory": "裁剪",
     *             "issueCount": 5,
     *             "type": "1",
     *             "teamIssueCount": 1,
     *             "category": "category1",
     *             "issueRate": 20
     *         }
     *     ]
     * }
     * @apiSuccessExample {json} Success-Response (groupByTeam=false) Example:
     * {
     *     "records": [
     *         {
     *             "type": "1",
     *             "typeIssueCount": 5,
     *             "issueCount": 1,
     *             "category": "cat2",
     *             "issueRate": 20
     *         },
     *         {
     *             "type": "1",
     *             "typeIssueCount": 5,
     *             "issueCount": 4,
     *             "category": "category1",
     *             "issueRate": 80
     *         }
     *     ]
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    qualityInspRouter.post('/qualityInspection/issueRate', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:1423', 400);
        }
        else {
            try {
                let teamGrouping = true;
                let queryTeam = false;
                let params = ctx.request.body;
                let teamWhere = {};
                if (params.team) {
                    teamWhere.id = params.team;
                    queryTeam = true;
                }
                if (params.teamID) {
                    teamWhere.teamID = params.teamID;
                    queryTeam = true;
                }
                if (params.teamName) {
                    teamWhere.name = params.teamName;
                    queryTeam = true;
                }
                if (false === params.groupByTeam) {
                    teamGrouping = false;
                    queryTeam = false;
                }
                let tagTeam = null;
                if (queryTeam) {
                    tagTeam = await Team_1.Team.findOne({
                        where: teamWhere
                    });
                    if (null === tagTeam || undefined === tagTeam) {
                        ctx.body = {
                            records: []
                        };
                        ctx.status = 200;
                        ctx.respond = true;
                        return;
                    }
                }
                let args = [];
                let whereO = [];
                if (params.order) {
                    whereO.push(' Orders.id=? ');
                    args.push(params.order);
                }
                if (params.orderID) {
                    whereO.push(' Orders.orderID=? ');
                    args.push(params.orderID);
                }
                if (params.deliveryDate) {
                    whereO.push(' Orders.deliveryDate=? ');
                    args.push(params.deliveryDate);
                }
                if (params.factory && params.teamCategory) {
                    whereO.push(' TM.team IN (SELECT id FROM Team WHERE Team.factory=? AND Team.category=?) ');
                    args.push(params.factory);
                    args.push(params.teamCategory);
                }
                else if (params.factory) {
                    whereO.push(' TM.team IN (SELECT id FROM Team WHERE Team.factory=? ) ');
                    args.push(params.factory);
                }
                else if (params.teamCategory) {
                    whereO.push(' TM.team IN (SELECT id FROM Team WHERE Team.category=? ) ');
                    args.push(params.teamCategory);
                }
                let sqlOCmd = 'SELECT QI.type as type, Count(QIR.id) as issueCount, ' +
                    'QIR.category as category ';
                if (teamGrouping) {
                    sqlOCmd += ', TM.team as team ';
                }
                sqlOCmd += 'FROM QualityInspection AS QI ';
                sqlOCmd += 'LEFT JOIN QualityInspectionResult AS QIR ON QI.id = QIR.qualityInspection ';
                sqlOCmd += 'LEFT JOIN `Order` AS Orders ON QI.order = Orders.id ';
                sqlOCmd += 'LEFT JOIN TeamMember AS TM ON QI.worker=TM.member ';
                let sqlCount = 'SELECT Count(QIR.id) as totalCount ' +
                    'FROM QualityInspection AS QI ' +
                    'LEFT JOIN QualityInspectionResult AS QIR ON QI.id = QIR.qualityInspection ' +
                    'LEFT JOIN `Order` AS Orders ON QI.order = Orders.id ' +
                    'LEFT JOIN TeamMember AS TM ON QI.worker=TM.member ';
                if (tagTeam) {
                    whereO.push(' TM.team=? ');
                    args.push(tagTeam.id);
                    let wherecondition = 'WHERE' + whereO.join(' AND ');
                    sqlOCmd += wherecondition;
                    whereO.push(' QI.type=? ');
                    let whereconditionex = 'WHERE' + whereO.join(' AND ');
                    sqlCount += whereconditionex;
                }
                else {
                    if (whereO.length > 0) {
                        let wherecondition = 'WHERE' + whereO.join(' AND ');
                        sqlOCmd += wherecondition;
                    }
                    if (teamGrouping) {
                        whereO.push(' TM.team=? ');
                    }
                    whereO.push(' QI.type=? ');
                    let whereconditionex = 'WHERE' + whereO.join(' AND ');
                    sqlCount += whereconditionex;
                }
                //                }
                if (teamGrouping) {
                    sqlOCmd += ' GROUP BY type, team, category ORDER BY type, team;';
                }
                else {
                    sqlOCmd += ' GROUP BY type, category ORDER BY type;';
                }
                let resOrderGroup = await QualityInspection_1.QualityInspection.sequelize.query({
                    query: sqlOCmd,
                    values: args
                });
                let reports = [];
                if (resOrderGroup && Array.isArray(resOrderGroup) && Array.isArray(resOrderGroup[0])) {
                    console.log(resOrderGroup[0]);
                    let data = null;
                    for (let report of resOrderGroup[0]) {
                        if (teamGrouping) {
                            if (null === data || data.team !== report.team || data.type !== report.type) {
                                data = {
                                    team: report.team,
                                    type: report.type,
                                    issueCount: 0,
                                };
                                let countArgs = args.concat([report.team, report.type]);
                                console.log(' count args', countArgs);
                                let totalCount = await QualityInspection_1.QualityInspection.sequelize.query({
                                    query: sqlCount,
                                    values: countArgs
                                });
                                if (totalCount && Array.isArray(totalCount) && Array.isArray(totalCount[0])) {
                                    data.issueCount = totalCount[0][0].totalCount;
                                    if ('string' === typeof data.issueCount) {
                                        data.issueCount = Number.parseInt(data.issueCount);
                                    }
                                }
                            }
                            if (null === tagTeam || report.team !== tagTeam.id) {
                                tagTeam = await Team_1.Team.findById(report.team);
                            }
                            if (null !== tagTeam) {
                                report.teamName = tagTeam.name;
                                report.teamCategory = tagTeam.category;
                            }
                            report.teamIssueCount = data.issueCount;
                            if (0 !== report.teamIssueCount) {
                                report.issueRate = (report.issueCount * 100) / report.teamIssueCount;
                            }
                        }
                        else {
                            if (null === data || data.type !== report.type) {
                                data = {
                                    team: report.team,
                                    type: report.type,
                                    issueCount: 0,
                                };
                                let countArgs = args.concat([report.type]);
                                let totalCount = await QualityInspection_1.QualityInspection.sequelize.query({
                                    query: sqlCount,
                                    values: countArgs
                                });
                                if (totalCount && Array.isArray(totalCount) && Array.isArray(totalCount[0])) {
                                    data.issueCount = totalCount[0][0].totalCount;
                                    if ('string' === typeof data.issueCount) {
                                        data.issueCount = Number.parseInt(data.issueCount);
                                    }
                                }
                            }
                            report.typeIssueCount = data.issueCount;
                            if (0 !== report.typeIssueCount) {
                                report.issueRate = (report.issueCount * 100) / report.typeIssueCount;
                            }
                        }
                        if (0 !== report.issueCount) {
                            reports.push(report);
                        }
                    }
                }
                ctx.body = {
                    records: reports
                };
                ctx.status = 200;
                ctx.respond = true;
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:1572', 400);
            }
        }
    });
    /**
     * @api {post} /qualityInspection/problemRate [品檢]-統計問題比例
     * @apiDescription 取得問題比例
     * @apiGroup Production
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {string} [category] 問題類別.
     * @apiParam {number} [order] 訂單 id.
     * @apiParam {String} [orderID] 訂單編號.
     * @apiParam {Date}   [deliveryDate] 訂單交期
     * @apiParam {number} [factory] 工廠 id
     * @apiParam {string} [teamCategory] 班組屬性 只計算該類別班組
     * @apiParam {boolean} [groupByTeam=true] 是否依班組統計.
     * - true: 依班組為單位統計.
     * - false: 乎略班組資訊.
     * @apiParam {number} [team] 班組 id
     * @apiParam {string} [teamID] 班組組號
     * @apiParam {string} [teamName] 班組名稱
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/qualityInspection/problemRate
     * Body:
     * {
     *  "category":"整燙"
     * }
     * @apiSuccess (Success 200) {Array} records 問題列表.
     * @apiSuccess (Success 200) {String} records.type 檢驗類別(組檢/中檢/總檢).
     * @apiSuccess (Success 200) {String} records.category 問題類別.
     * @apiSuccess (Success 200) {String} records.problem 問題.
     * @apiSuccess (Success 200) {String} [records.categoryIssueCount] 檢驗類別總問題數量.
     * - groupByTeam 為 false 顯示.
     * @apiSuccess (Success 200) {String} [records.team] 班組 id.
     * - groupByTeam 為 true 顯示.
     * @apiSuccess (Success 200) {String} [records.teamName] 班組名稱..
     * - groupByTeam 為 true 顯示.
     * @apiSuccess (Success 200) {String} [records.teamCategory] 班組屬性..
     * - groupByTeam 為 true 顯示.
     * @apiSuccess (Success 200) {String} [records.teamIssueCount] 班組總問題數量.
     * - groupByTeam 為 true 顯示.
     * - null: 班組無 錯誤記錄
     * @apiSuccess (Success 200) {Number} records.issueCount 問題類號累計數量
     * @apiSuccess (Success 200) {Number} records.issueRate 比例.
     * @apiSuccessExample {json} Success-Response (groupByTeam=true) Example:
     * {
     *     "records": [
     *         {
     *             "team": 2,
     *             "teamName": "裁剪1组",
     *             "teamCategory": "裁剪",
     *             "issueCount": 5,
     *             "type": "1",
     *             "teamIssueCount": 1,
     *             "category": "cat2",
     *             "problem":"漏線",
     *             "issueRate": 20
     *         },
     *         {
     *             "team": 2,
     *             "teamName": "裁剪1组",
     *             "teamCategory": "裁剪",
     *             "issueCount": 5,
     *             "type": "1",
     *             "teamIssueCount": 1,
     *             "category": "cat3",
     *             "problem":"偏移",
     *             "issueRate": 20
     *         },
     *         {
     *             "team": 2,
     *             "teamName": "裁剪1组",
     *             "teamCategory": "裁剪",
     *             "issueCount": 5,
     *             "type": "1",
     *             "teamIssueCount": 2,
     *             "category": "cat4",
     *             "problem":"污損",
     *             "issueRate": 40
     *         },
     *         {
     *             "team": 2,
     *             "teamName": "裁剪1组",
     *             "teamCategory": "裁剪",
     *             "issueCount": 5,
     *             "type": "1",
     *             "teamIssueCount": 1,
     *             "category": "category1",
     *             "problem":"破洞",
     *             "issueRate": 20
     *         }
     *     ]
     * }
     * @apiSuccessExample {json} Success-Response (groupByTeam=false) Example:
     * {
     *     "records": [
     *         {
     *             "type": "1",
     *             "categoryIssueCount": 5,
     *             "issueCount": 1,
     *             "category": "cat2",
     *             "problem":"破洞",
     *             "issueRate": 20
     *         },
     *         {
     *             "type": "1",
     *             "categoryIssueCount": 5,
     *             "issueCount": 4,
     *             "category": "cat2",
     *             "problem":"偏移",
     *             "issueRate": 80
     *         }
     *     ]
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    qualityInspRouter.post('/qualityInspection/problemRate', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:1423', 400);
        }
        else {
            try {
                let teamGrouping = true;
                let queryTeam = false;
                let params = ctx.request.body;
                let teamWhere = {};
                if (params.team) {
                    teamWhere.id = params.team;
                    queryTeam = true;
                }
                if (params.teamID) {
                    teamWhere.teamID = params.teamID;
                    queryTeam = true;
                }
                if (params.teamName) {
                    teamWhere.name = params.teamName;
                    queryTeam = true;
                }
                if (false === params.groupByTeam) {
                    teamGrouping = false;
                    queryTeam = false;
                }
                let tagTeam = null;
                if (queryTeam) {
                    tagTeam = await Team_1.Team.findOne({
                        where: teamWhere
                    });
                    if (null === tagTeam || undefined === tagTeam) {
                        ctx.body = {
                            records: []
                        };
                        ctx.status = 200;
                        ctx.respond = true;
                        return;
                    }
                }
                let args = [];
                let whereO = [];
                if (params.order) {
                    whereO.push(' Orders.id=? ');
                    args.push(params.order);
                }
                if (params.orderID) {
                    whereO.push(' Orders.orderID=? ');
                    args.push(params.orderID);
                }
                if (params.deliveryDate) {
                    whereO.push(' Orders.deliveryDate=? ');
                    args.push(params.deliveryDate);
                }
                if (params.category) {
                    whereO.push(' QIR.category=? ');
                    args.push(params.category);
                }
                if (params.factory && params.teamCategory) {
                    whereO.push(' TM.team IN (SELECT id FROM Team WHERE Team.factory=? AND Team.category=?) ');
                    args.push(params.factory);
                    args.push(params.teamCategory);
                }
                else if (params.factory) {
                    whereO.push(' TM.team IN (SELECT id FROM Team WHERE Team.factory=? ) ');
                    args.push(params.factory);
                }
                else if (params.teamCategory) {
                    whereO.push(' TM.team IN (SELECT id FROM Team WHERE Team.category=? ) ');
                    args.push(params.teamCategory);
                }
                let sqlOCmd = 'SELECT QI.type as type, Count(QIR.id) as issueCount, ' +
                    'QIR.category as category, QIR.problem as problem ';
                if (teamGrouping) {
                    sqlOCmd += ', TM.team as team ';
                }
                sqlOCmd += 'FROM QualityInspection AS QI ';
                sqlOCmd += 'LEFT JOIN QualityInspectionResult AS QIR ON QI.id = QIR.qualityInspection ';
                sqlOCmd += 'LEFT JOIN `Order` AS Orders ON QI.order = Orders.id ';
                sqlOCmd += 'LEFT JOIN TeamMember AS TM ON QI.worker=TM.member ';
                let sqlCount = 'SELECT Count(QIR.id) as totalCount ' +
                    'FROM QualityInspection AS QI ' +
                    'LEFT JOIN QualityInspectionResult AS QIR ON QI.id = QIR.qualityInspection ' +
                    'LEFT JOIN `Order` AS Orders ON QI.order = Orders.id ' +
                    'LEFT JOIN TeamMember AS TM ON QI.worker=TM.member ';
                if (tagTeam) {
                    whereO.push(' TM.team=? ');
                    args.push(tagTeam.id);
                    let wherecondition = 'WHERE' + whereO.join(' AND ');
                    sqlOCmd += wherecondition;
                    whereO.push(' QI.type=? ');
                    whereO.push(' QIR.category=? ');
                    let whereconditionex = 'WHERE' + whereO.join(' AND ');
                    sqlCount += whereconditionex;
                }
                else {
                    if (whereO.length > 0) {
                        let wherecondition = 'WHERE' + whereO.join(' AND ');
                        sqlOCmd += wherecondition;
                    }
                    if (teamGrouping) {
                        whereO.push(' TM.team=? ');
                    }
                    whereO.push(' QI.type=? ');
                    whereO.push(' QIR.category=? ');
                    let whereconditionex = 'WHERE' + whereO.join(' AND ');
                    sqlCount += whereconditionex;
                }
                //                }
                if (teamGrouping) {
                    sqlOCmd += ' GROUP BY type, team, category, problem ORDER BY type, team, category;';
                }
                else {
                    sqlOCmd += ' GROUP BY type, category, problem ORDER BY type, category;';
                }
                let resOrderGroup = await QualityInspection_1.QualityInspection.sequelize.query({
                    query: sqlOCmd,
                    values: args
                });
                let reports = [];
                if (resOrderGroup && Array.isArray(resOrderGroup) && Array.isArray(resOrderGroup[0])) {
                    console.log(resOrderGroup[0]);
                    let data = null;
                    for (let report of resOrderGroup[0]) {
                        if (null === report.problem && null === report.category) {
                            continue;
                        }
                        if (teamGrouping) {
                            if (null === data || data.team !== report.team
                                || data.type !== report.type || data.category !== report.category) {
                                data = {
                                    team: report.team,
                                    type: report.type,
                                    category: report.category,
                                    issueCount: 0,
                                };
                                let countArgs = args.concat([report.team, report.type, report.category]);
                                console.log(' count args', countArgs);
                                let totalCount = await QualityInspection_1.QualityInspection.sequelize.query({
                                    query: sqlCount,
                                    values: countArgs
                                });
                                if (totalCount && Array.isArray(totalCount) && Array.isArray(totalCount[0])) {
                                    data.issueCount = totalCount[0][0].totalCount;
                                    if ('string' === typeof data.issueCount) {
                                        data.issueCount = Number.parseInt(data.issueCount);
                                    }
                                }
                            }
                            if (null === tagTeam || report.team !== tagTeam.id) {
                                tagTeam = await Team_1.Team.findById(report.team);
                            }
                            if (null !== tagTeam) {
                                report.teamName = tagTeam.name;
                                report.teamCategory = tagTeam.category;
                            }
                            report.teamIssueCount = data.issueCount;
                            if (0 !== report.teamIssueCount) {
                                report.issueRate = (report.issueCount * 100) / report.teamIssueCount;
                            }
                        }
                        else {
                            if (null === data || data.type !== report.type || data.category !== report.category) {
                                data = {
                                    team: report.team,
                                    type: report.type,
                                    category: report.category,
                                    issueCount: 0,
                                };
                                let countArgs = args.concat([report.type, report.category]);
                                let totalCount = await QualityInspection_1.QualityInspection.sequelize.query({
                                    query: sqlCount,
                                    values: countArgs
                                });
                                if (totalCount && Array.isArray(totalCount) && Array.isArray(totalCount[0])) {
                                    data.issueCount = totalCount[0][0].totalCount;
                                    if ('string' === typeof data.issueCount) {
                                        data.issueCount = Number.parseInt(data.issueCount);
                                    }
                                }
                            }
                            report.categoryIssueCount = data.issueCount;
                            if (0 !== report.categoryIssueCount) {
                                report.issueRate = (report.issueCount * 100) / report.categoryIssueCount;
                            }
                        }
                        if (0 !== report.issueCount) {
                            reports.push(report);
                        }
                    }
                }
                ctx.body = {
                    records: reports
                };
                ctx.status = 200;
                ctx.respond = true;
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:1572', 400);
            }
        }
    });
};
function countFactoryQualityInspectResult(order, factory, itype, cat, team) {
    return new Promise(async (resolve, reject) => {
        let args = [order, itype];
        let report = {
            inspectionCount: 0,
            returnCount: 0,
            rejectCount: 0
        };
        
        /*
        let sqlSumCmd = 'SELECT SUM(QI.amount) as totalCount ' +
            'FROM QualityInspection AS QI ' +
            'LEFT JOIN TeamMember as TM ON QI.worker=TM.member ' +
            'LEFT JOIN QualityInspectionResult as QIR ON QI.id=QIR.qualityInspection ' +
            'WHERE QI.order=? AND QI.type=? '; // AND QIR.category=? ' +
        */    
    //    let sqlSumCmd = 'SELECT DISTINCT QI.bundleNumber,QI.amount ' +
    //    'FROM QualityInspection AS QI ' +
    //    'LEFT JOIN TeamMember as TM ON QI.worker=TM.member ' +
    //    'LEFT JOIN QualityInspectionResult as QIR ON QI.id=QIR.qualityInspection ' +
    //    'WHERE QI.bundleNumber NOT LIKE "%J%" AND QI.order=? AND QI.type=? '; // AND QIR.category=? ' +
    let sqlSumCmd = 'SELECT DISTINCT QI.bundleNumber,QI.amount ' +
    'FROM QualityInspection AS QI ' +
    'LEFT JOIN TeamMember as TM ON QI.worker=TM.member ' +
    'LEFT JOIN CropCard as CC ON QI.bundleNumber=CC.bundleNumber ' +
    'WHERE CC.return!=QI.type AND QI.order=? AND QI.type=? '; // AND QIR.category=? ' +

        /*
            SELECT SUM(k.amount) FROM(
                SELECT DISTINCT QI.bundleNumber,QI.amount 
                FROM QualityInspection AS QI 
                LEFT JOIN TeamMember as TM ON QI.worker=TM.member 
                LEFT JOIN QualityInspectionResult as QIR ON QI.id=QIR.qualityInspection 
                WHERE QI.order=40 AND QI.type=1
            ) 
            */

        // let sqlSumCmd = 'SELECT SUM(QI.amount) as totalCount ' +
        //     'FROM QualityInspection AS QI ' +
        //     'LEFT JOIN TeamMember as TM ON QI.worker=TM.member ' +
        //     'LEFT JOIN QualityInspectionResult as QIR ON QI.id=QIR.qualityInspection ' +
        //     'WHERE QI.order=? AND QI.type=? '; // AND QIR.category=? ' +
        // 'AND TM.team IN (SELECT id FROM Team WHERE Team.factory=?); '; 
        // let SqlResCmd = 'SELECT QI.type as type, Count(QIR.id) as issueCount, QIR.category as category, ' +
        // 'QIR.result as result ' +
        // 'FROM QualityInspection AS QI ' +
        // 'LEFT JOIN QualityInspectionResult as QIR ON QI.id=QIR.qualityInspection ' +
        // 'LEFT JOIN TeamMember as TM ON QI.worker=TM.member ' +
        // 'WHERE QI.order=? AND QI.type=? '; // AND QIR.category=? ' +

        //type: 1:组检， 2：总检
        //result: 0:返工，1：次品
            let SqlResCmd = 'SELECT QI.type as type, COUNT(DISTINCT QI.bundleNumber,QIR.pieceIndex) as issueCount, QIR.category as category, ' +
            'QIR.result as result ' +
            'FROM QualityInspection AS QI ' +
            'LEFT JOIN CropCard as CC ON QI.bundleNumber=CC.bundleNumber ' +
            'LEFT JOIN QualityInspectionResult as QIR ON QI.id=QIR.qualityInspection ' +
            'LEFT JOIN TeamMember as TM ON QI.worker=TM.member ' +
            'WHERE (CC.return=0 OR CC.return=(QI.type-1) OR CC.return=(QIR.result+QI.type-1) ) AND QI.order=? AND QI.type=? '; // AND QIR.category=? ' +
            // 'WHERE (CC.return=0 OR CC.return=(QI.type-1)) AND QI.order=? AND QI.type=? '; // AND QIR.category=? ' +
           
            let SqlResFirstCmd = 'SELECT QI.type as type, COUNT(DISTINCT QI.bundleNumber,QIR.pieceIndex) as issueCount, QIR.category as category, ' +
            'QIR.result as result ' +
            'FROM QualityInspection AS QI ' +
            'LEFT JOIN CropCard as CC ON QI.bundleNumber=CC.bundleNumber ' +
            'LEFT JOIN QualityInspectionResult as QIR ON QI.id=QIR.qualityInspection ' +
            'LEFT JOIN TeamMember as TM ON QI.worker=TM.member ' +
            'WHERE (CC.return=0 OR CC.return=(QI.type-1)) AND QI.order=? AND QI.type=? '; // AND QIR.category=? ' +

        // 'AND TM.team IN (SELECT id FROM Team WHERE Team.factory=?) ' +
        // 'GROUP BY result;';
        var argsSum=JSON.parse(JSON.stringify(args));
        var argsRes=JSON.parse(JSON.stringify(args));
       
        if (cat && null !== cat) {
            argsRes.push(cat);
            //sqlSumCmd += 'AND QIR.category=? ';
            SqlResCmd += 'AND QIR.category=? ';
            SqlResFirstCmd += 'AND QIR.category=? ';
        }
        if (team) {
            argsSum.push(team);
            argsRes.push(team);

            sqlSumCmd += 'AND TM.team=? ';
            SqlResCmd += 'AND TM.team=? GROUP BY result;';        //resut:0 return，返工  return：1 reject，拒收，次品
            SqlResFirstCmd += 'AND TM.team=? GROUP BY result;';        //resut:0 return，返工  return：1 reject，拒收，次品
        }
        else {
            argsSum.push(factory);
            argsRes.push(factory);
            sqlSumCmd += 'AND TM.team IN (SELECT id FROM Team WHERE Team.factory=?) ';
            SqlResCmd += 'AND TM.team IN (SELECT id FROM Team WHERE Team.factory=?) ';
            SqlResCmd += 'GROUP BY result ;';
            SqlResFirstCmd += 'AND TM.team IN (SELECT id FROM Team WHERE Team.factory=?) ';
            SqlResFirstCmd += 'GROUP BY result ;';
        }
       

        sqlSumCmd = 'SELECT SUM(k.amount) as totalCount FROM (' + sqlSumCmd +' ) k ;';
        let queryCount = await QualityInspection_1.QualityInspection.sequelize.query({
            query: sqlSumCmd,
            values: argsSum
        });
        if (queryCount && Array.isArray(queryCount) && Array.isArray(queryCount[0])) {
            if (queryCount[0][0].totalCount) {
                report.inspectionCount = queryCount[0][0].totalCount;
                if ('string' === typeof report.inspectionCount) {
                    report.inspectionCount = Number.parseInt(report.inspectionCount);
                }
            }
        }

        if (report.inspectionCount > 0) {

            let queryQIRCount = await QualityInspection_1.QualityInspection.sequelize.query({
                query: SqlResCmd,
                values: argsRes
            });
            if (queryQIRCount && Array.isArray(queryQIRCount) && Array.isArray(queryQIRCount[0])) {
                for (let item of queryQIRCount[0]) {
                    if ('0' === item.result || 0 === item.result) {
                        report.returnCount = item.issueCount;
                        if ('string' === typeof report.returnCount) {
                            report.returnCount = Number.parseInt(report.returnCount);
                        }
                    }
                    else if ('1' === item.result || 1 === item.result) {
                        report.rejectCount = item.issueCount;
                        if ('string' === typeof report.rejectCount) {
                            report.rejectCount = Number.parseInt(report.rejectCount);
                        }
                    }
                }
            }


            let queryQIRFirstCount = await QualityInspection_1.QualityInspection.sequelize.query({
                query: SqlResFirstCmd,
                values: argsRes
            });
            if (queryQIRFirstCount && Array.isArray(queryQIRFirstCount) && Array.isArray(queryQIRFirstCount[0])) {
                for (let item of queryQIRFirstCount[0]) {
             
                    if ('1' === item.result || 1 === item.result) {
                        report.rejectFirstCount = item.issueCount;
                        if ('string' === typeof report.rejectCount) {
                            report.rejectFirstCount = Number.parseInt(report.rejectFirstCount);
                        }
                    }
                }
            }
            console.log(cat, report, queryQIRFirstCount[0]);

        }
        resolve(report);
    });
}
function queryInspectTeams(order, factory) {
    return new Promise(async (resolve, reject) => {
        let teams = [];
        let sqlCmd = 'SELECT Count(QI.id) as Acount, TM.team as team ' +
            'FROM QualityInspection AS QI ' +
            'LEFT JOIN TeamMember as TM ON QI.worker=TM.member ' +
            'WHERE QI.order=? ' +
            'AND TM.team IN (SELECT id FROM Team WHERE Team.factory=?) ' +
            'GROUP BY team;';
        let sqlArgs = [order, factory];
        let queryRes = await QualityInspection_1.QualityInspection.sequelize.query({
            query: sqlCmd,
            values: sqlArgs
        });
        if (queryRes && Array.isArray(queryRes) && Array.isArray(queryRes[0])) {
            for (let item of queryRes[0]) {
                console.log('res item', item);
                if (item.team && item.Acount) {
                    let acount = Number.parseInt(item.Acount);
                    if (acount > 0) {
                        let team = Number.parseInt(item.team);
                        teams.push(team);
                    }
                }
            }
        }
        resolve(teams);
    });
}
function queryOrderQualityInspectReport(order, factory, formats, groupByTeam) {
    return new Promise(async (resolve, reject) => {
        let teams = [];
        let report = {
            order: order.id,
            orderID: order.orderID,
            orderDeliveryDate: order.deliveryDate
        };
        let tagStyle = await Style_1.Style.findById(order.style);
        if (tagStyle) {
            report.style = tagStyle.styleID,
                report.productName = tagStyle.productName;
        }
        let totalAmount = await OrderDeliveryPlan_1.OrderDeliveryPlan.aggregate('totalAmount', 'SUM', {
            where: {
                order: order.id
            }
        });
        if (totalAmount) {
            report.orderTotalAmount = totalAmount;
        }
        else {
            resolve(null);
            return;
        }
        let facAmountSql = 'SELECT SUM(PSch.amount) as facAmount FROM OrderDeliveryPlan AS ODP ';
        facAmountSql += 'LEFT OUTER JOIN ProductionScheduling AS PSch ON ODP.id=PSch.orderDeliveryPlan ';
        facAmountSql += 'WHERE ODP.order=? AND PSch.factory=? ;';
        let facAmountArgs = [order.id, factory];
        let facAmountRes = await OrderDeliveryPlan_1.OrderDeliveryPlan.sequelize.query({
            query: facAmountSql,
            values: facAmountArgs
        });
        console.log(' Factory amount', facAmountRes);
        if (facAmountRes && Array.isArray(facAmountRes) && Array.isArray(facAmountRes[0])) {
            report.factory = factory;
            if (facAmountRes[0][0].facAmount) {
                report.factoryAmount = facAmountRes[0][0].facAmount;
            }
            else {
                resolve(null);
                return;
            }
            if ('string' === typeof report.factoryAmount) {
                report.factoryAmount = Number.parseInt(report.factoryAmount);
            }
        }
        let teamAmountMap = null;
		if (true === groupByTeam || "true" === groupByTeam) {
        //if (true === groupByTeam) {
            teamAmountMap = await getProductionTeamSch(order.id, factory);
            if (teamAmountMap) {
                let mapteams = teamAmountMap.keys();
                for (let t of mapteams) {
                    teams.push(t);
                }
            }
            let datateams = await queryInspectTeams(order.id, factory);
            for (let dt of datateams) {
                if (teamAmountMap && false === teamAmountMap.has(dt)) {
                    teams.push(dt);
                }
                else {
                    teams.push(dt);
                }
            }
        }
        else {
            for (let fmt of formats) {
                let inspectionKey = fmt.name + 'InspectionCount';
                let returnKey = fmt.name + 'RetrunCount';
                let rejectKey = fmt.name + 'RejectCount';
                let rejectFirstKey = fmt.name + 'RejectFirstCount';
                let data = await countFactoryQualityInspectResult(order.id, factory, fmt.type, fmt.category);
                if (data.inspectionCount) {
                    report[inspectionKey] = data.inspectionCount;
                }
                else {
                    report[inspectionKey] = 0;
                }
                if (data.returnCount) {
                    report[returnKey] = data.returnCount;
                }
                else {
                    report[returnKey] = 0;
                }
                if (data.rejectCount) {
                    report[rejectKey] = data.rejectCount;
                }
                else {
                    report[rejectKey] = 0;
                }

                if (data.rejectFirstCount) {
                    report[rejectFirstKey] = data.rejectFirstCount;
                }
                else {
                    report[rejectFirstKey] = 0;
                }
            }
        }
        if (teams.length > 0) {
            report.teamData = [];
            for (let team of teams) {
                let tagTeam = await Team_1.Team.findById(team);
                let teamReport = {
                    team: team
                };
                if (tagTeam) {
                    teamReport.teamID = tagTeam.teamID;
                    teamReport.teamName = tagTeam.name;
                    teamReport.teamCategory = tagTeam.category;
                    teamReport.teamAmount = 0;
                    if (teamAmountMap) {
                        if (teamAmountMap.has(tagTeam.id)) {
                            teamReport.teamAmount = teamAmountMap.get(tagTeam.id);
                        }
                    }
                }
                else {
                    continue;
                }
                for (let fmt of formats) {
                    let inspectionKey = fmt.name + 'InspectionCount';
                    let returnKey = fmt.name + 'RetrunCount';
                    let rejectKey = fmt.name + 'RejectCount';
                    let rejectFirstKey = fmt.name + 'RejectFirstCount';
                    let data = await countFactoryQualityInspectResult(order.id, factory, fmt.type, fmt.category, team);
                    if (data.inspectionCount) {
                        teamReport[inspectionKey] = data.inspectionCount;
                    }
                    else {
                        teamReport[inspectionKey] = 0;
                    }
                    if (data.returnCount) {
                        teamReport[returnKey] = data.returnCount;
                    }
                    else {
                        teamReport[returnKey] = 0;
                    }

                    if (data.rejectCount) {
                        teamReport[rejectKey] = data.rejectCount;
                    }
                    else {
                        teamReport[rejectKey] = 0;
                    }

                    if (data.rejectFirstCount) {
                        teamReport[rejectFirstKey] = data.rejectFirstCount;
                    }
                    else {
                        teamReport[rejectFirstKey] = 0;
                    }
                }
                report.teamData.push(teamReport);
            }
        }
        resolve(report);
    });
}
function getProductionTeamSch(orderid, factory) {
    return new Promise(async (resolve, reject) => {
        let ret = new Map();
        let args = [orderid, factory];
        let sewSchSql = 'SELECT SUM(SW.amount) as amount, SW.team as team ' +
            'FROM SewingTeamScheduling AS SW ' +
            'LEFT JOIN ProductionScheduling AS PSch ON SW.productionScheduling=PSch.id ' +
            'WHERE PSch.orderDeliveryPlan IN (SELECT id FROM OrderDeliveryPlan AS OP WHERE OP.order=?) ' +
            ' AND PSch.factory=?';
        'GROUP by team; ';
        let sewRes = await QualityInspection_1.QualityInspection.sequelize.query({ query: sewSchSql, values: args });
        if (sewRes && Array.isArray(sewRes) && Array.isArray(sewRes[0])) {
            for (let sewTeam of sewRes[0]) {
                if (null === sewTeam.team) {
                    continue;
                }
                // console.log('sew', orderid, factory, sewTeam);
                let amount = sewTeam.amount;
                if ('string' === typeof amount) {
                    amount = Number.parseInt(amount);
                }
                if (ret.has(sewTeam.team)) {
                    let sumamount = ret.get(sewTeam.team) + amount;
                    ret.delete(sewTeam.team);
                    ret.set(sewTeam.team, sumamount);
                }
                else {
                    ret.set(sewTeam.team, amount);
                }
            }
        }
        let cropSchSql = 'SELECT SUM(TeamSch.amount) as amount, TeamSch.cropTeam as team ' +
            'FROM PrecedingTeamScheduling AS TeamSch ' +
            'LEFT JOIN ProductionScheduling AS PSch ON TeamSch.productionScheduling=PSch.id ' +
            'WHERE PSch.orderDeliveryPlan IN (SELECT id FROM OrderDeliveryPlan AS OP WHERE OP.order=?) ' +
            ' AND PSch.factory=?';
        'GROUP by team; ';
        let cropRes = await QualityInspection_1.QualityInspection.sequelize.query({ query: cropSchSql, values: args });
        if (cropRes && Array.isArray(cropRes) && Array.isArray(cropRes[0])) {
            for (let teamSch of cropRes[0]) {
                if (null === teamSch.team) {
                    continue;
                }
                // console.log('crop', orderid, factory, teamSch);
                let amount = teamSch.amount;
                if ('string' === typeof amount) {
                    amount = Number.parseInt(amount);
                }
                if (ret.has(teamSch.team)) {
                    let sumamount = ret.get(teamSch.team) + amount;
                    ret.delete(teamSch.team);
                    ret.set(teamSch.team, sumamount);
                }
                else {
                    ret.set(teamSch.team, amount);
                }
            }
        }
        let stickSchSql = 'SELECT SUM(TeamSch.amount) as amount, TeamSch.cropTeam as team ' +
            'FROM PrecedingTeamScheduling AS TeamSch ' +
            'LEFT JOIN ProductionScheduling AS PSch ON TeamSch.productionScheduling=PSch.id ' +
            'WHERE PSch.orderDeliveryPlan IN (SELECT id FROM OrderDeliveryPlan AS OP WHERE OP.order=?) ' +
            ' AND PSch.factory=?';
        'GROUP by team; ';
        let stickRes = await QualityInspection_1.QualityInspection.sequelize.query({ query: stickSchSql, values: args });
        if (stickRes && Array.isArray(stickRes) && Array.isArray(stickRes[0])) {
            for (let teamSch of stickRes[0]) {
                // console.log('stick', orderid, factory, teamSch);
                if (null === teamSch.team) {
                    continue;
                }
                let amount = teamSch.amount;
                if ('string' === typeof amount) {
                    amount = Number.parseInt(amount);
                }
                if (ret.has(teamSch.team)) {
                    let sumamount = ret.get(teamSch.team) + amount;
                    ret.delete(teamSch.team);
                    ret.set(teamSch.team, sumamount);
                }
                else {
                    ret.set(teamSch.team, amount);
                }
            }
        }
        let lockSchSql = 'SELECT SUM(TeamSch.amount) as amount, TeamSch.lockTeam as team ' +
            'FROM FollowingTeamScheduling AS TeamSch ' +
            'LEFT JOIN ProductionScheduling AS PSch ON TeamSch.productionScheduling=PSch.id ' +
            'WHERE PSch.orderDeliveryPlan IN (SELECT id FROM OrderDeliveryPlan AS OP WHERE OP.order=?) ' +
            ' AND PSch.factory=?';
        'GROUP by team; ';
        let lockRes = await QualityInspection_1.QualityInspection.sequelize.query({ query: lockSchSql, values: args });
        if (lockRes && Array.isArray(lockRes) && Array.isArray(lockRes[0])) {
            for (let teamSch of lockRes[0]) {
                if (null === teamSch.team) {
                    continue;
                }
                // console.log('lock', orderid, factory, teamSch);
                let amount = teamSch.amount;
                if ('string' === typeof amount) {
                    amount = Number.parseInt(amount);
                }
                if (ret.has(teamSch.team)) {
                    let sumamount = ret.get(teamSch.team) + amount;
                    ret.delete(teamSch.team);
                    ret.set(teamSch.team, sumamount);
                }
                else {
                    ret.set(teamSch.team, amount);
                }
            }
        }
        let ironSchSql = 'SELECT SUM(TeamSch.amount) as amount, TeamSch.ironTeam as team ' +
            'FROM FollowingTeamScheduling AS TeamSch ' +
            'LEFT JOIN ProductionScheduling AS PSch ON TeamSch.productionScheduling=PSch.id ' +
            'WHERE PSch.orderDeliveryPlan IN (SELECT id FROM OrderDeliveryPlan AS OP WHERE OP.order=?) ' +
            ' AND PSch.factory=?';
        'GROUP by team; ';
        let ironRes = await QualityInspection_1.QualityInspection.sequelize.query({ query: ironSchSql, values: args });
        if (ironRes && Array.isArray(ironRes) && Array.isArray(ironRes[0])) {
            for (let teamSch of ironRes[0]) {
                if (null === teamSch.team) {
                    continue;
                }
                // console.log('iron', orderid, factory, teamSch);
                let amount = teamSch.amount;
                if ('string' === typeof amount) {
                    amount = Number.parseInt(amount);
                }
                if (ret.has(teamSch.team)) {
                    let sumamount = ret.get(teamSch.team) + amount;
                    ret.delete(teamSch.team);
                    ret.set(teamSch.team, sumamount);
                }
                else {
                    ret.set(teamSch.team, amount);
                }
            }
        }
        let packSchSql = 'SELECT SUM(TeamSch.amount) as amount, TeamSch.packTeam as team ' +
            'FROM FollowingTeamScheduling AS TeamSch ' +
            'LEFT JOIN ProductionScheduling AS PSch ON TeamSch.productionScheduling=PSch.id ' +
            'WHERE PSch.orderDeliveryPlan IN (SELECT id FROM OrderDeliveryPlan AS OP WHERE OP.order=?) ' +
            ' AND PSch.factory=?';
        'GROUP by team; ';
        let packRes = await QualityInspection_1.QualityInspection.sequelize.query({ query: packSchSql, values: args });
        if (packRes && Array.isArray(packRes) && Array.isArray(packRes[0])) {
            for (let teamSch of packRes[0]) {
                if (null === teamSch.team) {
                    continue;
                }
                //console.log('pack', orderid, factory, teamSch);
                let amount = teamSch.amount;
                if ('string' === typeof amount) {
                    amount = Number.parseInt(amount);
                }
                if (ret.has(teamSch.team)) {
                    let sumamount = ret.get(teamSch.team) + amount;
                    ret.delete(teamSch.team);
                    ret.set(teamSch.team, sumamount);
                }
                else {
                    ret.set(teamSch.team, amount);
                }
            }
        }
        // console.log(orderid, factory, ret);
        resolve(ret);
    });
}
