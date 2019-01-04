"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dbquery_1 = require("../database/dbquery");
const TeamMember_1 = require("../database/models/TeamMember");
const ProductionLine_1 = require("../database/models/ProductionLine");
const Station_1 = require("../database/models/Station");
const MemberOutput_1 = require("../database/models/MemberOutput");
const OrderDeliveryPlan_1 = require("../database/models/OrderDeliveryPlan");
const ProcessStation_1 = require("../database/models/ProcessStation");
const StyleProcess_1 = require("../database/models/StyleProcess");
const StationEquipment_1 = require("../database/models/StationEquipment");
const EquipmentIntelligence_1 = require("../database/models/EquipmentIntelligence");
const QualityInspection_1 = require("../database/models/QualityInspection");
const ProductionScheduling_1 = require("../database/models/ProductionScheduling");
const Order_1 = require("../database/models/Order");
const Process_1 = require("../database/models/Process");
const SewingTeamScheduling_1 = require("../database/models/SewingTeamScheduling");

const sequelize = require("sequelize");

function calculateDayCount(startDay,endDay){
    let startDayTimestamp = Date.parse(new Date(startDay).toLocaleString());
    let endDayTimestamp = Date.parse(new Date(endDay).toLocaleString());
    let oneDayTimestamp = 24*60*60*1000;
    let dayCount = 0;
    if (startDayTimestamp <= endDayTimestamp){
        dayCount = (endDayTimestamp -  startDayTimestamp)/oneDayTimestamp;
    }else{
        dayCount = (startDayTimestamp -endDayTimestamp)/oneDayTimestamp;
    }
    dayCount += 1;

    return dayCount;
}

function calcDayScheduleAmount(amount,timeStart,noonTimeS,noonTimeE,timeEnd,eveTimeS,eveTimeE){
    let aaa = new Date(timeStart);
    let bbb = new Date(noonTimeS);
    let ccc = new Date(noonTimeE);
    let ddd = new Date(timeEnd);
    let eee = new Date(eveTimeS);
    let fff = new Date(eveTimeE);
    let restSpan1 = 0;
    let restSpan2 = 0;

    let resAmount = 0;
    let ttt = new Date(new Date(new Date().getTime() + 28800000).toISOString());

    if((ttt >=aaa) && (ttt <=bbb)){
        resAmount = amount / 10 * ((ttt - aaa)/3600000)
    }else if((ttt >=bbb)&&(ttt <=ccc)){
        resAmount = amount / 10 * ((ttt - aaa - (ttt - bbb))/3600000)
    }else if((ttt >=ccc)&&(ttt <=ddd)){
        resAmount = amount / 10 * ((ttt - aaa - restSpan1)/3600000)
    }else if((ttt >=ddd)&&(ttt <=eee)){
        resAmount = amount / 10 * ((ttt - aaa - restSpan1 - (ttt - ddd))/3600000)
    }else if(ttt >=eee){
        resAmount = amount / 10 * ((ttt - aaa - restSpan1 - restSpan2)/3600000)
    }else {
        resAmount = 0
    }

    return resAmount;
}

function getKeyValueFromAJsonArray(jsonArray){

    if(Array.isArray(jsonArray)){
        let keyValueArray =  jsonArray.map(value => {

            let tempJson = {
                key:null,
                value:null
            };
            for(let x in value){
                tempJson.key = x;
                tempJson.value = value[x];
            }

            return tempJson
        });

        return keyValueArray
    }else {
        return jsonArray;
    }
}

function pushElementToObject (d,o){
    if(typeof(o)=='object') for(var p in o) {d[p]=o[p]}
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

exports.registerForemanKanbanAPI = function (foremanKanBanRouter) {

    foremanKanBanRouter.post('/foremanKanBan/search', async (ctx) => {

        try {
            let dateStart = ctx.request.body.query.dateStart;
            let dateEnd = ctx.request.body.query.dateEnd;
            let timeStart = (new Date().toISOString()).slice(0,11)+'08:00:00.000Z';
            let noonTimeS = (new Date().toISOString()).slice(0,11)+'12:00:00.000Z';
            let noonTimeE = (new Date().toISOString()).slice(0,11)+'13:00:00.000Z';
            let timeEnd = (new Date().toISOString()).slice(0,11)+'17:00:00.000Z';
            let eveTimeS = (new Date().toISOString()).slice(0,11)+'18:00:00.000Z';
            let eveTimeE = (new Date().toISOString()).slice(0,11)+'20:00:00.000Z';

            //console.log(dateStart);
            //console.log(dateEnd);

            let recordAPI = {};
            let query = ctx.request.body.query;
            //let currentDate = new Date(new Date().getTime() + 28800000).toISOString();
            let currentDate = new Date().toISOString();
            let resp = dbquery_1.queryResponsePacket(ctx.request.body);

            let teamMemberQuery = {query:{member:ctx.request.body.query.member}};
            let tempArray = await findAndCount(teamMemberQuery,TeamMember_1,0);
            //console.log('tempArray');
            //console.log(tempArray);

            if(tempArray.length >0){

                let productionLineQuery = {query:{team:tempArray[0].team}};
                let productionLineArray = await findAndCount(productionLineQuery,ProductionLine_1,1);
                //console.log('productionLineArray')
                //console.log(productionLineArray)

                let materialJson = {
                    materialIn: 0,
                    materialOut: 0,
                    materialDiff: 0,
                    scheduling:[],
                    rejectRate: 0,
                    returnRate:0,
                    passRate: 0,
                    workerCount: 0,
                    workerList: [],
                    processOrderArray: [],
                    problemTypeArray: [],
                    problemTypeCountOrderArray: [],
                    categoryTypeArray: [],
                    categoryTypeCountOrderArray: []
                };

                if(productionLineArray && productionLineArray.length > 0) {

                    let stationOperatorJsonArray = [];
                    for (let x = 0; x < productionLineArray.length; x++) {
                        let stationOperatorJson = {
                            station: 0,
                            team: 0,
                            operator: 0,
                            username: null,
                            amount: 0,
                            pay: 0,
                            amountSum:0,
                            paySum:0,
                            return: 0,
                            reject: 0,
                            returnRate: 0,
                            rejectRate: 0,
                            problem: [],
                            category: [],
                            process: [],
                            workerWorkingRate: null,
                            equipmentMac: null,
                            workingTimeSpan: null,
                            workingHoursSum: null,
                            qualityInspectionID: [],
                            qualityInspectionResultData: {}
                        };

                        stationOperatorJson.station = productionLineArray[x].station;
                        stationOperatorJson.team = productionLineArray[x].team;
                        if (productionLineArray[x].stationData)
                            stationOperatorJson.operator = productionLineArray[x].stationData.operator;//////////////////////////////////11111111111111111111111111
                        if (productionLineArray[x].equipmentData)
                            stationOperatorJson.equipmentMac = productionLineArray[x].equipmentData.macAddress;

                        stationOperatorJsonArray.push(stationOperatorJson);
                    }
                    //console.log('stationOperatorJsonArray');
                    //console.log(stationOperatorJsonArray);

                    let stationIDArray = stationOperatorJsonArray.map(value => {
                        return value.station;
                    });
                    //console.log('stationIDArray');
                    //console.log(stationIDArray);

                    let stationQuery = {query: {id: {[sequelize.Op.in]: stationIDArray}}};
                    let stationArray = await findAndCount(stationQuery, Station_1, 1);

                    if (stationArray && stationArray.length > 0) {
                        stationOperatorJsonArray.map(value => {
                            for (let y of stationArray) {
                                if (y.operator === value.operator) {
                                    if (y.operatorData) {
                                        value.username = y.operatorData.chineseName;
                                    }

                                    return value;
                                }
                            }
                        })
                        //console.log('stationOperatorJsonArray')
                        //console.log(stationOperatorJsonArray)
                    }

                    let orderQuery = {query: {orderID: query.orderID, deliveryDate: query.deliveryDate}};
                    let orderOne = await findOne(orderQuery, Order_1, 0, {raw: true});
                    //console.log('orderOne');
                    //console.log(orderOne)

                    if (orderOne) {
                        for (let x = 0; x < stationOperatorJsonArray.length; x++) {
                            let processStationQuery = {
                                query: {
                                    order: orderOne.id,
                                    station: stationOperatorJsonArray[x].station
                                }
                            };
                            let processStationArray = await findAndCount(processStationQuery, ProcessStation_1, 0);
                            //console.log('processStationArray');
                            //console.log(processStationArray);

                            let styleProcessIDArray = processStationArray.map(value => {
                                return value.styleProcess;
                            });
                            //console.log('styleProcessIDArray');
                            //console.log(styleProcessIDArray);
                            let styleProcessQuery = {query: {id: {[sequelize.Op.in]: styleProcessIDArray}}};
                            let styleProcessArray = await findAndCount(styleProcessQuery, StyleProcess_1, 0);
                            //console.log('styleProcessArray')
                            //console.log(styleProcessArray)

                            let processIDArray = styleProcessArray.map(value => {
                                return value.process;
                            });
                            let processQuery = {query: {id: {[sequelize.Op.in]: processIDArray}}};
                            let processArray = await findAndCount(processQuery, Process_1, 0, {
                                attributes: ['id', 'name', 'workingHours','processID'],
                                order: ['id']
                            });
                            //console.log('processArray')
                            //console.log(processArray)

                            stationOperatorJsonArray[x].process = processArray;
                        }

                        let orderDeliveryPlanQuery = {query: {order: orderOne.id}};
                        let orderDeliveryPlanArray = await findAndCount(orderDeliveryPlanQuery, OrderDeliveryPlan_1, 0, {attributes: ['id']});
                        //console.log('orderDeliveryPlanArray')
                        //console.log(orderDeliveryPlanArray)

                        let orderDeliveryPlanIDArray = orderDeliveryPlanArray.map(value => {
                            return value.id;
                        });

                        let productionSchedulingQuery = {query: {orderDeliveryPlan: {[sequelize.Op.in]: orderDeliveryPlanIDArray}}};
                        let productionSchedulingArray = await findAndCount(productionSchedulingQuery, ProductionScheduling_1, 0, {attributes: ['id']});
                        //console.log('productionSchedulingArray')
                        //console.log(productionSchedulingArray)
                        let productionSchedulingIDArray = productionSchedulingArray.map(value => {
                            return value.id;
                        });

                        let workerArray = stationOperatorJsonArray.map(value => {
                            return value.operator;
                        });

                        let memberList = stationOperatorJsonArray.map(value =>{
                            let temp = {};
                            temp.member = value.operator;
                            temp.username = value.username;

                            return temp;
                        });


                        let currentDate = (new Date()).toLocaleDateString();

                        console.log('-------------------车缝-------------------');
                        let sewingTeamSchedulingQuery = {query: {team:stationOperatorJsonArray[0].team, startDate: {[sequelize.Op.lte]:currentDate},endDate: {[sequelize.Op.gte]:currentDate},productionScheduling:{[sequelize.Op.in]:productionSchedulingIDArray}}};

                        let sewingTeamSchedulingArray = await findAndCount(sewingTeamSchedulingQuery,SewingTeamScheduling_1,1);
                        //console.log('sewingTeamSchedulingArray');
                        //console.log(sewingTeamSchedulingArray);

                        let dayScheduleAmountArray = sewingTeamSchedulingArray.map(value=>{
                            let resultJson = {};
                            resultJson.category = "车缝";
                            resultJson.amount = value.amount/calculateDayCount(value.startDate,value.endDate);
                            return resultJson;
                        });

                        //console.log('dayScheduleAmountArray')
                        //console.log(dayScheduleAmountArray)

                        let dayScheduleAmountSum = dayScheduleAmountArray.reduce((a,b)=>{
                            return parseFloat(a)  + parseFloat(b.amount);
                        },0);
                        //console.log('dayScheduleAmountSum')
                        //console.log(dayScheduleAmountSum)
                        //调用计算当前时间计划产量函数

                        let currentScheduleAmount = calcDayScheduleAmount(dayScheduleAmountSum,timeStart,noonTimeS,noonTimeE,timeEnd,eveTimeS,eveTimeE);
                        //console.log('currentScheduleAmount')
                        //console.log(currentScheduleAmount)
                        //订单总计划产量
                        let totalScheduleAmountArray = sewingTeamSchedulingArray.map(value=>{
                            let resultJson = {};
                            resultJson.category = "车缝";
                            resultJson.amount = (value.amount/calculateDayCount(value.startDate,value.endDate)) * calculateDayCount(value.startDate,currentDate);
                            return resultJson;
                        });
                        //console.log('totalScheduleAmountArray')
                        //console.log(totalScheduleAmountArray)
                        let totalScheduleAmountSum = totalScheduleAmountArray.reduce((a,b)=>{
                            return parseFloat(a)  + parseFloat(b.amount);
                        },0);
                        //console.log('totalScheduleAmountSum')
                        //console.log(totalScheduleAmountSum)
                        let amountAPI = {
                            dayScheduleAmout:parseInt(dayScheduleAmountSum),
                            currentTimeScheduleAmout:parseInt(currentScheduleAmount),
                            totalScheduleAmount:parseInt(totalScheduleAmountSum)

                        };
                        materialJson.scheduling.push(amountAPI);//当日排产

                        //console.log('memberList');
                        //console.log(memberList);

                        //console.log('workerArray')
                        //console.log(workerArray)

                        //当日memberOutput查询员工生产数量
                        let queryDate = {[sequelize.Op.and]: [{[sequelize.Op.gte]: currentDate.slice(0, 11) + '00:00:00.000Z'}, {[sequelize.Op.lte]: currentDate.slice(0, 11) + '23:59:59.000Z'}]};
                        let memberOutputQuery = {query: {date: queryDate}};
                        let option = {
                            attributes: [
                                'productionScheduling',
                                'worker',
                                [sequelize.fn('SUM', sequelize.col('amount')), 'amountSum'],
                                [sequelize.fn('SUM', sequelize.col('pay')), 'paySum']
                            ],
                            group: ['worker']
                        };
                        let memberOutputArray = await findAndCount(memberOutputQuery, MemberOutput_1, 0, option, {
                            worker: {[sequelize.Op.in]: workerArray},
                            productionScheduling: {[sequelize.Op.in]: productionSchedulingIDArray}
                        });
                        //console.log('memberOutputArray');
                        //console.log(memberOutputArray);

                        stationOperatorJsonArray.forEach(value => {

                            for (let x of memberOutputArray) {
                                if (value.operator === x.worker) {
                                    value.amount = parseFloat(x.amountSum);
                                    value.pay = parseFloat(x.paySum);

                                }
                            }
                        });
                        stationOperatorJsonArray.sort((a, b) => {
                            return b.amount - a.amount;
                        });
                        //console.log('stationOperatorJsonArray');
                        //console.log(stationOperatorJsonArray);

                        //当日产出数量最多员工 == 投料
                        materialJson.materialIn = stationOperatorJsonArray[0].amount;
                        //console.log('materialJson.materialIn');
                        //console.log(materialJson.materialIn);

                        //累计生产单数量，memberOutput查询
                        let memberOutputSumQuery = {query: {}};
                        option = {
                            attributes: [
                                'productionScheduling',
                                'worker',
                                [sequelize.fn('SUM', sequelize.col('amount')), 'amountSum'],
                                [sequelize.fn('SUM', sequelize.col('pay')), 'paySum']
                            ],
                            group: ['worker']
                        };
                        let memberOutputSumArray = await findAndCount(memberOutputSumQuery, MemberOutput_1, 0, option, {
                            worker: {[sequelize.Op.in]: workerArray},
                            productionScheduling: {[sequelize.Op.in]: productionSchedulingIDArray}
                        });
                        //console.log('memberOutputSumArray');
                        //console.log(memberOutputSumArray);

                        stationOperatorJsonArray.forEach(value => {
                            for (let x of memberOutputSumArray) {
                                if (value.operator === x.worker) {
                                    value.amountSum = parseFloat(x.amountSum);
                                    value.paySum = parseFloat(x.paySum);
                                }
                            }
                        });
                        //console.log('stationOperatorJsonArray');
                        //console.log(stationOperatorJsonArray);


                        //查询当日检验数量 == 当日产出数量
                        if(dateEnd && dateStart){
                            dateStart = new Date(dateStart).toISOString();
                            dateEnd = (new Date(dateEnd).toISOString()).slice(0, 11) + '23:59:59.000Z';
                            queryDate = { [sequelize.Op.and]: [{ [sequelize.Op.gte]:dateStart }, { [sequelize.Op.lte]: dateEnd }] };
                        }else{
                            queryDate = { [sequelize.Op.and]: [{ [sequelize.Op.gte]: currentDate.slice(0, 11) + '00:00:00.000Z' }, { [sequelize.Op.lte]: currentDate.slice(0, 11) + '23:59:59.000Z' }] };
                        }

                        let qualityInspectionQuery = {
                            query: {
                                worker: {[sequelize.Op.in]: workerArray},
                                order: orderOne.id,
                                inspectedTime:queryDate
                            }
                        };
                        let qualityInspectionArray = await findAndCount(qualityInspectionQuery, QualityInspection_1, 1);
                        //console.log('qualityInspectionArray');
                        //console.log(qualityInspectionArray);

                        stationOperatorJsonArray.forEach(value => {
                            let tempArray = [];
                            for (let x of qualityInspectionArray) {
                                if (value.operator === x.worker) {
                                    if(x.qualityInspectionResultData.length > 0){
                                        value.qualityInspectionID.push(x.id);
                                        tempArray = tempArray.concat(x.qualityInspectionResultData)
                                    }
                                    value.qualityInspectionResultData = tempArray;
                                }
                            }
                        });

                        option = {
                            attributes: [
                                'id',
                                'bundleNumber',
                                'amount'
                            ],

                            group: ['bundleNumber']
                        };
                        let qualityInspectionArray1 = await findAndCount(qualityInspectionQuery, QualityInspection_1, 0, option);
                        //console.log('qualityInspectionArray1');
                        //console.log(qualityInspectionArray1);

                        let qualityInspectionAmountSum = qualityInspectionArray1.reduce((a, b) => {
                            return a + b.amount;
                        }, 0);

                        //检验数量 == 产出数量； 投入 - 产出 = 差异
                        materialJson.materialOut = qualityInspectionAmountSum;
                        materialJson.materialDiff = materialJson.materialIn - materialJson.materialOut;
                        //console.log('stationOperatorJsonArray');
                        //console.log(stationOperatorJsonArray);

                        let rejectSum = 0;
                        let returnSum = 0;
                        for (let x = 0; x < stationOperatorJsonArray.length; x++) {

                            if(stationOperatorJsonArray[x].qualityInspectionResultData. length > 0){

                                let rejectType = stationOperatorJsonArray[x].qualityInspectionResultData.reduce((a, b) => {

                                    if (b.result === 1) {
                                        a.result1++;
                                    } else {
                                        a.result0++;
                                    }
                                    return a;
                                }, {result0: 0, result1: 0});

                                let categoryAndProblem = stationOperatorJsonArray[x].qualityInspectionResultData.reduce((a, b) => {

                                    if(b.result === 0){
                                        a.category.push(b.category);
                                        a.problem.push(b.problem);
                                    }
                                    return a;
                                }, {category: [], problem: []});

                                stationOperatorJsonArray[x].return = rejectType.result0;
                                stationOperatorJsonArray[x].reject = rejectType.result1;
                                stationOperatorJsonArray[x].returnRate = stationOperatorJsonArray[x].return / (stationOperatorJsonArray[x].amount || 1);
                                stationOperatorJsonArray[x].rejectRate = stationOperatorJsonArray[x].reject / (stationOperatorJsonArray[x].amount || 1);
                                stationOperatorJsonArray[x].category = categoryAndProblem.category;
                                stationOperatorJsonArray[x].problem = categoryAndProblem.problem;

                                rejectSum += stationOperatorJsonArray[x].reject;
                                returnSum += stationOperatorJsonArray[x].return;
                            }
                        }

                        materialJson.rejectRate = rejectSum / (materialJson.materialIn || 1);
                        materialJson.returnRate = returnSum / (materialJson.materialIn || 1);
                        materialJson.passRate = 1 - materialJson.rejectRate - materialJson.returnRate;

                        //产线员工数量，名单
                        materialJson.workerCount = memberList.length;
                        materialJson.workerList = memberList;

                        //产线所有工位工序数量列表
                        for(let x = 0; x < stationOperatorJsonArray.length; x++){
                            stationOperatorJsonArray[x].process.forEach(value => {
                                value.amount = stationOperatorJsonArray[x].amount;
                                value.amountSum = stationOperatorJsonArray[x].amountSum;
                            })
                        }

                        let processSumArray = stationOperatorJsonArray.reduce((a,b)=>{
                            return a.concat(b.process)
                        },[]);
                        //console.log('processSumArray');
                        //console.log(processSumArray);

                        let processIDArray = processSumArray.map(value=>{
                            return value.id;
                        });

                        processIDArray = [...new Set(processIDArray)].sort((a,b)=>{
                            return a-b;
                        });
                        //console.log('processIDArray');
                        //console.log(processIDArray);

                        let processOrderSumArray =  processIDArray.map(value => {

                            let tempArray = [];
                            for(let item of processSumArray){
                                if(item.id === value ){
                                    tempArray.push(item)
                                }
                            }

                            let result =  tempArray.reduce((a,b)=>{
                                return {amount:a.amount+ b.amount,amountSum:a.amountSum+ b.amountSum}
                            },{amount:0,amountSum:0});

                            tempArray[0].amount = result.amount;
                            tempArray[0].amountSum = result.amountSum;

                            return tempArray[0];
                        });

                        materialJson.processOrderArray = processOrderSumArray;

                        //产线员工问题汇总
                        let problemCollectionArray = stationOperatorJsonArray.reduce((a,b)=>{
                            return a.concat(b.problem)
                        },[]);

                        let problemTypeArray = [...new Set (problemCollectionArray)];

                        materialJson.problemTypeArray = problemTypeArray;

                        let problemTypeCountArray = problemTypeArray.map(value => {
                            let typeCount = problemCollectionArray.reduce((a,b)=>{
                                if(b === value){
                                    a++;
                                }

                                return a;
                            },0);

                            return {[value]:typeCount}
                        });

                        let problemTypeCountOrderArray = problemTypeCountArray.sort(function (a, b) {
                            return Object.values(a) - Object.values(b);
                        });

                        materialJson.problemTypeCountOrderArray = getKeyValueFromAJsonArray(problemTypeCountOrderArray) ;

                        let categoryCollectionArray = stationOperatorJsonArray.reduce((a,b)=>{
                            return a.concat(b.category)
                        },[]);

                        let categoryTypeArray = [...new Set (categoryCollectionArray)];

                        materialJson.categoryTypeArray = categoryTypeArray;

                        let categoryTypeCountArray = categoryTypeArray.map(value => {
                            let typeCount = categoryCollectionArray.reduce((a,b)=>{
                                if(b === value){
                                    a++;
                                }

                                return a;
                            },0);

                            return {[value]:typeCount}
                        });

                        let categoryTypeCountOrderArray = categoryTypeCountArray.sort(function (a, b) {
                            return Object.values(a) - Object.values(b);
                        });
                        materialJson.categoryTypeCountOrderArray = getKeyValueFromAJsonArray(categoryTypeCountOrderArray);

                        //设备工作时间
                        let macArray = stationOperatorJsonArray.map(value => {
                            return value.equipmentMac;
                        });
                        let equipmentIntelligenceQuery = {query:{mac:{[sequelize.Op.in]:macArray},updateTime:queryDate}};
                        let equipmentIntelligenceArray = await findAndCount(equipmentIntelligenceQuery,EquipmentIntelligence_1,0);
                        //console.log('equipmentIntelligenceArray');
                        //console.log(equipmentIntelligenceArray);

                        for(let x of equipmentIntelligenceArray){
                            for(let y of stationOperatorJsonArray){
                                if(x.mac === y.equipmentMac) {
                                    y.workingTimeSpan = x.workingTimeSpan;
                                    break;
                                }
                            }
                        }

                        //员工工作效率
                        for(let x of stationOperatorJsonArray){
                            let workingHoursSum =  x.process.reduce((a,b)=>{
                                return parseFloat(a) + parseFloat(b.workingHours);
                            },0);
                            x.workingHoursSum = workingHoursSum;
                            if(!x.workingTimeSpan){
                                x.workerWorkingRate = 0;
                            }else{
                                x.workerWorkingRate = 3600*((x.amount || 0) * x.workingHoursSum )/(x.workingTimeSpan|| 1);
                            }
                        }
                        //console.log('stationOperatorJsonArray');
                        //console.log(stationOperatorJsonArray);
                        //console.log('materialJson');
                        //console.log(materialJson);

                        recordAPI = {
                            material:materialJson,
                            worker:stationOperatorJsonArray
                        };

                        resp.records.push(recordAPI);
                    } else {
                        //console.log('order data not found');
                        ctx.throw('db.invalidQuery:F4', 400);
                    }
                }
            }

            ctx.body = resp;
            ctx.status = 200;
            ctx.respond = true;
        }catch (e) {
            console.log(e);
            ctx.throw(e.message, 400);
        }
    });
};
