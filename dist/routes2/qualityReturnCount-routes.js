"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const QualityReturnRecord_1 = require("../database/models/QualityReturnRecord");
const QualityInspection_1 = require("../database/models/QualityInspection");
const QualityInspectionResult_1 = require("../database/models/QualityInspectionResult");

const dbquery_1 = require("../database/dbquery");
const sequelize = require("sequelize");
const Op = sequelize.Op;

function pushElementToObject (d,o){
    if(typeof(o)=='object') for(var p in o) {d[p]=o[p]}
}

function getArrDifference(arr1, arr2) {

    return arr1.concat(arr2).filter(function (v, i, arr) {
        return arr.indexOf(v) === arr.lastIndexOf(v);
    });
}

const findOne = async function (query,modelInstance,join,option,condition){
    let queryInstance = {};
    let modelInstanceKeys = Object.keys(modelInstance);
    if(join && modelInstanceKeys.length === 2 ){
        queryInstance = dbquery_1.queryDBGeneratorEx(query, modelInstance[modelInstanceKeys[1]]);
    }else{
        queryInstance = dbquery_1.queryDBGeneratorEx(query);
    }

    if(option){
        pushElementToObject(queryInstance,option)
    }
    if(condition){
        //console.log('condition')
        //console.log(condition)
        queryInstance.where = Object.assign(queryInstance.where,condition)
    }
    //console.log('queryInstance')
    //console.log(queryInstance)

    let oneDoc = await modelInstance[modelInstanceKeys[0]].findOne(queryInstance);
    return  oneDoc;
};

const findAndCount = async function (query,modelInstance,join,option,condition){
    let queryInstance = {};
    let modelInstanceKeys = Object.keys(modelInstance);
    if(join && modelInstanceKeys.length === 2 ){
        queryInstance = dbquery_1.queryDBGeneratorEx(query, modelInstance[modelInstanceKeys[1]]);
    }else{
        queryInstance = dbquery_1.queryDBGeneratorEx(query);
    }
    if(option){
        pushElementToObject(queryInstance,option)
    }

    if(condition){
        queryInstance.where = Object.assign(queryInstance.where,condition)
    }
    //console.log('queryInstance');
    //console.log(queryInstance);

    let tempArray = [];
    let docs = await modelInstance[modelInstanceKeys[0]].findAndCount(queryInstance);
    if (docs && docs.rows) {
        for (let item of docs.rows) {
            tempArray.push(item.toJSON());
        }
    }

    return  tempArray;
};

exports.registerQualityReturnCountAPI = function (qualityReturnCountRouter) {

    qualityReturnCountRouter.post('/qualityReturnCount', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:69', 400);
        }
        else {

            try{
                let nowDate = new Date(new Date().getTime() + 28800000).toISOString();
                let res = {
                    qualityReturnRecordUpdateCount:0,
                    qualityReturnRecordCreatedID:[],
                    qualityInspectionCreatedID:[],
                    qualityInspectionResultUpdateCount:0,
                    qualityInspectionResultCreatedID:[]
                };
                if (false === dbquery_1.checkRequestParamObject(ctx.request.body.query)) {
                    ctx.throw('api.queryIsEmpty:70', 400);
                }
                else {
                    let query = ctx.request.body.query;

                    if (!query.bundleNumber || query.bundleNumber == undefined) {
                        ctx.throw('db.invalidParameters:Q7', 400);
                    }
                    if (!query.qualityStandard || query.qualityStandard == undefined) {
                        ctx.throw('db.invalidParameters:Q6', 400);
                    }
                    if (!query.order || query.order == undefined) {
                        ctx.throw('db.invalidParameters:Q5', 400);
                    }
                    if (!query.type || query.type == undefined) {
                        ctx.throw('db.invalidParameters:Q4', 400);
                    }
                    if (!query.amount || query.amount == undefined) {
                        ctx.throw('db.invalidParameters:Q3', 400);
                    }
                    if (!query.allData || query.allData == undefined) {
                        ctx.throw('db.invalidParameters:Q2', 400);
                    }

                    let qualityReturnRecordQuery = {query:{bundleNumber:query.bundleNumber}};
                    let qualityReturnRecordOne = await findOne(qualityReturnRecordQuery,QualityReturnRecord_1,0,{raw:true});

                    if(qualityReturnRecordOne){
                        let update = {count:qualityReturnRecordOne.count + 1};
                        let updateres = await QualityReturnRecord_1.QualityReturnRecord.update(update,{where:{id:qualityReturnRecordOne.id}});

                        if (updateres && Array.isArray(updateres)) {
                            res.qualityReturnRecordUpdateCount += updateres[0];
                        }
                    }else{
                        let updatedoc = {
                            bundleNumber: query.bundleNumber,
                            count:1
                        };
                        let prod = new QualityReturnRecord_1.QualityReturnRecord(updatedoc);
                        let proddoc = await prod.save();

                        if (proddoc && proddoc.id) {
                            res.qualityReturnRecordCreatedID.push(proddoc.id);
                        }
                    }

                    let allData = query.allData;

                    let checkPassSum = allData.reduce((a,b)=>{
                        return a + b.checkPass;
                    },0);
                    if(checkPassSum === allData.length){
                        //New qualityInspection
                        let updatedoc = {
                            qualityStandard:query.qualityStandard,
                            order:query.order,
                            type:query.type,
                            bundleNumber:query.bundleNumber,
                            worker:allData[0].worker,
                            inspectedTime:nowDate,
                            amount:query.amount
                        };
                        let prod = new QualityInspection_1.QualityInspection(updatedoc);
                        let proddoc = await prod.save();

                        if (proddoc && proddoc.id) {
                            res.qualityInspectionCreatedID.push(proddoc.id);
                        }
                    }else{
                        for(let x = 0; x < allData.length; x++){
                            if(allData[x].checkPass === 1){
                                //update QualityInspectionResult.returnPass = 1
                                let update = {
                                    returnPass:1
                                };
                                let updateres = await QualityInspectionResult_1.QualityInspectionResult.update(update,{where:{id:allData[x].qualityInspectionResult}});

                                if (updateres && Array.isArray(updateres)) {
                                    res.qualityInspectionResultUpdateCount += updateres[0];
                                }
                            }else if(allData[x].checkReturn === 1){
                                //do nothing
                            }else if(allData[x].checkReject === 1){
                                //new QualityInspection, New QualityInspectionResult(result =1, pieceIndex=0)
                                let newQualityInspection = {
                                    qualityStandard:query.qualityStandard,
                                    order:query.order,
                                    type:query.type,
                                    bundleNumber:query.bundleNumber,
                                    worker:allData[x].worker,
                                    inspectedTime:nowDate,
                                    amount:query.amount
                                };
                                let prod = new QualityInspection_1.QualityInspection(newQualityInspection);
                                let proddoc = await prod.save();

                                if (proddoc && proddoc.id) {
                                    res.qualityInspectionCreatedID.push(proddoc.id);
                                    let newQualityInspectionResult = {
                                        qualityInspection:proddoc.id,
                                        category:"车缝",
                                        result:1,
                                        pieceIndex:0,
                                        returnPass:0
                                    };
                                    let prod1 = new QualityInspectionResult_1.QualityInspectionResult(newQualityInspectionResult);
                                    let proddoc1 = await prod1.save();

                                    if (proddoc1 && proddoc1.id) {
                                        res.qualityInspectionResultCreatedID.push(proddoc1.id);
                                    }
                                    break;
                                }
                            }
                        }
                    }

                    ctx.body = res;
                    ctx.status = 200;
                    ctx.respond = true;
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw(err.message, 400);
            }
        }
    });
};
