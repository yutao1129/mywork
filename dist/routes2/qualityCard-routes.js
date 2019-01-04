"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const dbquery_1 = require("../database/dbquery");
const Sequelize_1 = require("sequelize");
const QualityInspectionResult_1 = require("../database/models/QualityInspectionResult");
const QualityInspection_1 = require("../database/models/QualityInspection");
const RFID_1 = require("../database/models/RFID");
const CropCard_1 = require("../database/models/CropCard");
const UserAccount_1 = require("../database/models/UserAccount");
function DebugOutput(title, content) {
    //console.log(title,content);
}
exports.registerAPI = function (APIRouter) {
    //刷卡查询组检或总检记录，包含正常卡和返工卡
    APIRouter.post('/qualityCard/searchRecord', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:63', 400);
        }
        else {
            try {
                let cardNumber = ctx.request.body.cardNumber;
                if (!cardNumber || cardNumber == undefined) {
                    ctx.throw('db.invalidParameters:B1', 400);
                }
                let qualityType = ctx.request.body.qualityType;
                if (!cardNumber || cardNumber == undefined) {
                    ctx.throw('db.invalidParameters:B1', 400);
                }

                let resp = {
                    recordsCount: -1,
                    returnFlag: -1,
                    bundleNumber: "",
                    valid: -1,
                    records: []

                }

                let queryCropCard = {
                    attributes: [
                        'bundleNumber',
                        'return',
                        'valid',
                        'returnPieceIndex'
                    ],
                    include: [
                        {
                            model: RFID_1.RFID,
                            where: { cardNumber: cardNumber }
                        }
                    ],
                    order: [['createTime', 'DESC']],
                    raw: true

                }
                let cropCard_docs = await CropCard_1.CropCard.findOne(queryCropCard);
                DebugOutput('cropCard_docs', cropCard_docs)

                if (cropCard_docs) {

                    var bundleNumber = cropCard_docs.bundleNumber;
                    var returnFlag = cropCard_docs.return;
                    resp.returnFlag = returnFlag;
                    resp.bundleNumber = bundleNumber;
                    resp.valid = cropCard_docs.valid;;
                    let queryIns = {
                        include: [
                            {
                                model: QualityInspectionResult_1.QualityInspectionResult
                            }
                            ,
                            {
                                model: UserAccount_1.UserAccount,
                                attributes: [
                                    'chineseName'
                                ],
                            }
                        ],
                        where: {
                            bundleNumber: bundleNumber,
                            type: qualityType
                        },
                        // raw:true
                    }
                    let quality_docs = await QualityInspection_1.QualityInspection.findAll(queryIns);
                    DebugOutput('quality_docs', quality_docs)
                    if (quality_docs && quality_docs.length > 0) {
                        //如果找到当前bundleNumber对应的检测记录，就返回记录及详情
                        resp.recordsCount = quality_docs.length

                        for (var i = 0; i < quality_docs.length; i++) {
                            var item = quality_docs[i];
                            resp.records.push(item);
                        }
                    }
                    else {
                        // if(returnFlag==1)  OK
                        //如果找不到当前bundleNumber对应的检测记录，eturnFlag==1||returnFlag==2 便是返工卡
                        if (returnFlag == 1 || returnFlag == 2) {
                            //如果是返工卡，去掉J*，获得原始bundleNumberOld，根据bundleNumberOld查询上一次流线检测记录
                            var returnPieceIndex = cropCard_docs.returnPieceIndex;
                            var bundleNumberArray = bundleNumber.split('-');
                            bundleNumberArray.pop();
                            var bundleNumberOld = bundleNumberArray.join('-');
                            console.log('bundleNumberOld', bundleNumberOld)

                            var returnFlag = cropCard_docs.return;
                            let queryIns = {
                                include: [
                                    {
                                        model: QualityInspectionResult_1.QualityInspectionResult,
                                        where: {
                                            pieceIndex: returnPieceIndex
                                        }
                                    },
                                    {
                                        model: UserAccount_1.UserAccount,
                                        attributes: [
                                            'chineseName'
                                        ],
                                    }
                                ],

                                where: {
                                    bundleNumber: bundleNumberOld,
                                    type: qualityType
                                },
                                // raw:true
                            }
                            let quality_docs = await QualityInspection_1.QualityInspection.findAll(queryIns);
                            DebugOutput('quality_docs 2', quality_docs)
                            if (quality_docs && quality_docs.length > 0) {
                                resp.recordsCount = quality_docs.length
                                for (var i = 0; i < quality_docs.length; i++) {
                                    var item = quality_docs[i];
                                    resp.records.push(item);
                                }
                            }
                            else {
                                //无初次流线检测Fail记录，异常？
                            }

                        }
                    }
                }

                ctx.body = resp;
                ctx.status = 200;
                ctx.respond = true;
            }
            catch (e) {
                console.log(e.message);
                ctx.throw(e.message, 400);
            }
        }
    })


};
