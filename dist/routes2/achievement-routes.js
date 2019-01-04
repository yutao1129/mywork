"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MemberOutput_1 = require("../database/models/MemberOutput");
const MemberOutputProcess_1 = require("../database/models/MemberOutputProcess");
const QualityInspectionResult_1 = require("../database/models/QualityInspectionResult");
const QualityInspection_1 = require("../database/models/QualityInspection");
const dbquery_1 = require("../database/dbquery");
const Sequelize_1 = require("sequelize")

exports.registerAchievementAPI = function (achievementAPIRouter) {
    /**
     * @api {post} /memberOutput/searchSum [個人生產紀錄]-统计查詢
     * @apiDescription 查詢符合條件的個人生產紀錄，並將結果分頁回傳
     * @apiGroup Production
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number=7} [userID] 用戶ID
     * @apiParam {String="2018-10-10"} [startDate] 查詢起始日期
     * @apiParam {String="2018-10-12"} [startDate] 查詢結束日期
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/memberOutput/searchSum
     * Body:
     * {
     *	"userID":7,
     *	"startDate":"2018-10-10",
     *	"endDate":"2018-10-12"
     * }
     * @apiSuccess (Success 200) {Object} total 查詢時間段內數據匯總
     * @apiSuccess (Success 200) {Number} recordsCount 按日期匯總數據筆數
     * @apiSuccess (Success 200) {Array} records 按日期匯總數據
     * @apiSuccessExample {json} Response Example
     * {
     *     "total": {
     *         "paySum": "360",
     *         "amountSum": "38"
     *     },
     *     "recordsCount": 3,
     *     "records": [
     *         {
     *             "date": "2018-10-10",
     *             "payDateSum": "166",
     *             "amountDateSum": "13"
     *         },
     *          .
     *          .
     *     ],
     *     "userID": 7
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    achievementAPIRouter.post('/memberOutput/searchSum', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:69', 400);
        }
        else {
            let resp = dbquery_1.queryResponsePacket(ctx.request.body);
            // let query = dbquery_1.queryDBGeneratorEx(ctx.request.body, MemberOutput_1.memberOutputJoin);
            try {

                let userid = ctx.request.body.userID;
                let startdate = ctx.request.body.startDate;
                let enddate = ctx.request.body.endDate;
                if (!userid || userid == undefined) {
                    ctx.throw('db.invalidParameters:B0', 400);
                }
                // let datespan = { [Sequelize_1.Op.and]: [{ [Sequelize_1.Op.gte]: startdate+ 'T00:00:00.000Z' }, { [Sequelize_1.Op.lte]:enddate+ 'T23:59:59.000Z' }] };
                
                
                let datespan = { [Sequelize_1.Op.between]: [startdate + 'T00:00:00.000Z', enddate + 'T23:59:59.000Z'] };
                let querydays = {
                    attributes: [
                        [Sequelize_1.fn('DATE', Sequelize_1.col('date')), 'dayDate'],
                        [Sequelize_1.fn('SUM', Sequelize_1.col('pay')), 'payDateSum'],
                        [Sequelize_1.fn('SUM', Sequelize_1.col('amount')), 'amountDateSum']
                    ],
                    group: [Sequelize_1.fn('DATE', Sequelize_1.col('date'))],
                    where: {
                        worker: userid,
                        date: datespan
                    },
                    raw: true
                }
                let docs = await MemberOutput_1.MemberOutput.findAll(querydays);
            //    console.log('docs', docs);
                var amountDataSum={};
                if (docs && docs.length > 0) {
                    for (let item of docs) {
                        amountDataSum[item['dayDate']]=item['amountDateSum']
                    }
                }

                let queryProcesDays = {
                    attributes: [
                        [Sequelize_1.fn('DATE', Sequelize_1.col('MemberOutputProcess.date')), 'dayDate'],
                        [Sequelize_1.fn('SUM', Sequelize_1.col('MemberOutputProcess.pay')), 'payDateSum']
                        //[Sequelize_1.fn('COUNT', Sequelize_1.col('MemberOutputProcess.id')), 'processDateCount']
                    ],
                    include:[
                        {
                            model: MemberOutput_1.MemberOutput,
                            attributes: [
                              //'amount'
                            ],
                            where: {
                                worker: userid
                            },
                        }
                    ],
                    group: [Sequelize_1.fn('DATE', Sequelize_1.col('memberOutputData.date'))],
                    where: {
                        date: datespan
                    },
                    raw: true
                }
                let mp_docs = await MemberOutputProcess_1.MemberOutputProcess.findAll(queryProcesDays);
             //   console.log('mp_docs', mp_docs);
                let resp = {
                    total: {
                        paySum: 0,
                        amountSum: 0
                    },
                    recordsCount: 0,
                    records: []
                };
                resp.userID = userid;
                resp.recordsCount = mp_docs.length;
                if (mp_docs && mp_docs.length > 0) {
                    for (let item of mp_docs) {
                        var record={};
                        record['dayDate']=item['dayDate']
                        record['payDateSum']=item['payDateSum']
                        record['amountDateSum']=amountDataSum[item['dayDate']]
      
                        resp.records.push(record);
                    }
                }

                
                
                
                // let datespan = { [Sequelize_1.Op.between]: [startdate + 'T00:00:00.000Z', enddate + 'T23:59:59.000Z'] };
                // let querydays = {
                //     attributes: [
                //         [Sequelize_1.fn('DATE', Sequelize_1.col('date')), 'dayDate'],
                //         [Sequelize_1.fn('SUM', Sequelize_1.col('pay')), 'payDateSum'],
                //         [Sequelize_1.fn('SUM', Sequelize_1.col('amount')), 'amountDateSum']
                //     ],
                //     group: [Sequelize_1.fn('DATE', Sequelize_1.col('date'))],
                //     where: {
                //         worker: userid,
                //         date: datespan
                //     },
                //     raw: true
                // }
                // let docs = await MemberOutput_1.MemberOutput.findAll(querydays);
                // console.log('docs', docs);
                // let resp = {
                //     total: {
                //         paySum: 0,
                //         amountSum: 0
                //     },
                //     recordsCount: 0,
                //     records: []
                // };
                // resp.userID = userid;
                // resp.recordsCount = docs.length;
                // if (docs && docs.length > 0) {
                //     for (let item of docs) {
                //         resp.records.push(item);
                //     }
                // }
                let querytotal = {
                    attributes: [
                        [Sequelize_1.fn('SUM', Sequelize_1.col('pay')), 'paySum'],
                        [Sequelize_1.fn('SUM', Sequelize_1.col('amount')), 'amountSum']
                    ],
                    where: {
                        worker: userid,
                        date: datespan
                    },
                    raw: true
                }
                let docstotal = await MemberOutput_1.MemberOutput.findOne(querytotal);
                if (docstotal) {
                    resp.total = docstotal;
                }
              //  console.log('resp', resp);
                ctx.body = resp;
                ctx.status = 200;
                ctx.respond = true;
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalorderIDQuery:98,error:'+err.toString(), 400);
            }
        }
    });
    /**
     * @api {post} /qualityInspectionResult/searchRate [品檢結果統計]-统计查詢
     * @apiDescription 查詢符合條件的品檢結果，並將結果分頁回傳
     * @apiGroup Production
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number=7} [userID] 用戶ID
     * @apiParam {String="2018-10-10"} [startDate] 查詢起始日期
     * @apiParam {String="2018-10-12"} [startDate] 查詢結束日期
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/qualityInspectionResult/searchRate
     * Body:
     * {
     *	"userID":7,
     *	"startDate":"2018-10-10",
     *	"endDate":"2018-10-12"
     * }
     * @apiSuccess (Success 200) {Number} pageIndex 目前的頁碼
     * @apiSuccess (Success 200) {Number} maxRows 每一頁的最大筆數
     * @apiSuccess (Success 200) {Number} totalPage 總頁數
     * @apiSuccess (Success 200) {Array} records 查詢的結果。各欄位定義請參考: <a href="#qualityInspectionResult">品檢結果欄位定義</a>
     * @apiSuccessExample {json} Response Example
     * {
     *     "recordsCount": 3,
     *     "records": [
     *         {
     *             "date": "2018-10-10",
     *             "passRate": "0.8611",
     *             "returnRate": "0.0556"，
     *             "rejectRate": "0.0833"
     *         },
     *          .
     *          .
     *     ],
     *     "userID": 7
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    achievementAPIRouter.post('/qualityInspectionResult/searchRate', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:63', 400);
        }
        else {
            try {
                let userid = ctx.request.body.userID;
                let startdate = ctx.request.body.startDate;
                let enddate = ctx.request.body.endDate;
                console.log('startdate', startdate);
                if (!userid || userid == undefined) {
                    ctx.throw('db.invalidParameters:B0', 400);
                }

                let datespan = { [Sequelize_1.Op.between]: [startdate + ' 00:00:00', enddate + ' 23:59:59'] };
                
                let queryreturn = {
                    attributes: [
                        [Sequelize_1.fn('DATE', Sequelize_1.col('inspectedTime')), 'dayDate'],
                    ],
                    include: {
                        model: QualityInspectionResult_1.QualityInspectionResult,
                        attributes: [
                            // [Sequelize_1.fn('COUNT', Sequelize_1.col('result')), 'returnCount']
                            [Sequelize_1.fn('COUNT', Sequelize_1.fn('DISTINCT',Sequelize_1.col('pieceIndex'))),'returnCount']
                        ],
                        where:{
                            result:0
                        }
                    },
                    group: [Sequelize_1.fn('DATE', Sequelize_1.col('inspectedTime'))],
                    where: {
                        worker: userid,
                        inspectedTime: datespan
                    },
                    raw: true
                }
                let docs_return = await QualityInspection_1.QualityInspection.findAll(queryreturn);
                var returnAmount=[];
                console.log('docs_return', docs_return);
                if (docs_return && docs_return.length > 0) {
                    for (let item of docs_return) {
                         var dayDate=item.dayDate;
                        returnAmount[dayDate]=item['qualityInspectionResultData.returnCount']
                    }
                }

                let queryreject = {
                    attributes: [
                        [Sequelize_1.fn('DATE', Sequelize_1.col('inspectedTime')), 'dayDate'],
                    ],
                    include: {
                        model: QualityInspectionResult_1.QualityInspectionResult,
                        attributes: [
                            // [Sequelize_1.fn('COUNT', Sequelize_1.col('result')), 'rejectCount']
                            [Sequelize_1.fn('COUNT', Sequelize_1.fn('DISTINCT',Sequelize_1.col('pieceIndex'))),'rejectCount']
                        ],
                        where:{
                            result:1
                        }
                    },
                    group: [Sequelize_1.fn('DATE', Sequelize_1.col('inspectedTime'))],
                    where: {
                        worker: userid,
                        inspectedTime: datespan
                    },
                    raw: true
                }
                let docs_reject = await QualityInspection_1.QualityInspection.findAll(queryreject);
                var rejectAmount=[];
                console.log('docs_reject', docs_reject);
                if (docs_reject && docs_reject.length > 0) {
                    for (let item of docs_reject) {
                         var dayDate=item.dayDate;
                         rejectAmount[dayDate]=item['qualityInspectionResultData.rejectCount']
                    }
                }

                console.log('rejectAmount', rejectAmount);
                let querydays = {
                    attributes: [
                        [Sequelize_1.fn('DATE', Sequelize_1.col('inspectedTime')), 'dayDate'],
                        [Sequelize_1.fn('SUM', Sequelize_1.col('amount')), 'amountSum']
                    ],
                    group: [Sequelize_1.fn('DATE', Sequelize_1.col('inspectedTime'))],
                    where: {
                        worker: userid,
                        inspectedTime: datespan
                    },
                    raw: true
                }

                //console.log('querydays',querydays);
                let docs = await QualityInspection_1.QualityInspection.findAll(querydays);
                console.log('docs', docs);
                let resp = {
                    recordsCount: 0,
                    records: []
                };
                if (docs && docs.length > 0) {
                    resp.recordsCount = docs.length;
                    for (let item of docs) {
                        var dayDate=item.dayDate;
                        var amountSum=item.amountSum;
                        var returnSum=returnAmount[dayDate]==null? 0:parseInt(returnAmount[dayDate]);
                        var rejectSum=rejectAmount[dayDate]==null? 0:parseInt(rejectAmount[dayDate]);
                        var passSum=amountSum-returnSum-rejectSum;
                        var record = {
                            "date": dayDate,
                            "amountSum": amountSum,
                            "passSum": passSum,
                            "returnSum": returnSum,
                            "rejectSum": rejectSum,
                            "passRate": (passSum/amountSum).toFixed(4),
                            "returnRate": (returnSum/amountSum).toFixed(4),
                            "rejectRate": (rejectSum/amountSum).toFixed(4)
                        }
                        resp.records.push(record);
                    }
                }
                // if (docs && docs.length>0) {
                //     resp.recordsCount=docs.length;
                //     for (let item of docs) {
                //         var amountSum=parseInt(item.passSum)+parseInt(item.returnSum)+parseInt(item.rejectSum);
                //         if(amountSum>0){
                //            // console.log('amountSum',amountSum);
                //             var record={
                //                 "date":item.dayDate,
                //                 "passRate":(item.passSum/amountSum).toFixed(4),
                //                 "returnRate":(item.returnSum/amountSum).toFixed(4),
                //                 "rejectRate":(item.rejectSum/amountSum).toFixed(4),
                //             }
                //             resp.records.push(record);
                //         }
                //         else{
                //             var record={
                //                 "date":item.dayDate,
                //                 "passRate":0,
                //                 "returnRate":0,
                //                 "rejectRate":0,
                //             }
                //             resp.records.push(record);
                //         }
                //     }
                // }

                // let datespan = {[Sequelize_1.Op.between]: [startdate+' 00:00:00',enddate+' 23:59:59']};
                // let querydays={
                //     attributes:[
                //                 'inspectedTime',
                //                 [Sequelize_1.fn('DATE', Sequelize_1.col('inspectedTime')),'dayDate'], 
                //                 [Sequelize_1.fn('SUM', Sequelize_1.col('pass')), 'passSum'],
                //                 [Sequelize_1.fn('SUM', Sequelize_1.col('return')), 'returnSum'],
                //                 [Sequelize_1.fn('SUM', Sequelize_1.col('reject')), 'rejectSum']
                //             ], 
                //     group: [Sequelize_1.fn('DATE', Sequelize_1.col('inspectedTime'))], 
                //     where:{
                //         worker:userid,
                //         inspectedTime:datespan
                //     },
                //     raw:true
                // }

                // //console.log('querydays',querydays);
                // let docs = await QualityInspectionResult_1.QualityInspectionResult.findAll(querydays);
                // console.log('docs',docs);
                // let resp= {
                //     recordsCount: 0,
                //     records: []
                // };

                // if (docs && docs.length>0) {
                //     resp.recordsCount=docs.length;
                //     for (let item of docs) {
                //         var amountSum=parseInt(item.passSum)+parseInt(item.returnSum)+parseInt(item.rejectSum);
                //         if(amountSum>0){
                //            // console.log('amountSum',amountSum);
                //             var record={
                //                 "date":item.dayDate,
                //                 "passRate":(item.passSum/amountSum).toFixed(4),
                //                 "returnRate":(item.returnSum/amountSum).toFixed(4),
                //                 "rejectRate":(item.rejectSum/amountSum).toFixed(4),
                //             }
                //             resp.records.push(record);
                //         }
                //         else{
                //             var record={
                //                 "date":item.dayDate,
                //                 "passRate":0,
                //                 "returnRate":0,
                //                 "rejectRate":0,
                //             }
                //             resp.records.push(record);
                //         }
                //     }
                // }
                ctx.body = resp;
                ctx.status = 200;
                ctx.respond = true;
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidQuery:97,error:' + err.toString(), 400);
            }
        }
    });
}