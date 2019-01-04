"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dbquery_1 = require("../database/dbquery");
const TeamMember_1 = require("../database/models/TeamMember");
const ProductionLine_1 = require("../database/models/ProductionLine");
const Station_1 = require("../database/models/Station");
const MemberOutput_1 = require("../database/models/MemberOutput");
const OrderDeliveryPlan_1 = require("../database/models/OrderDeliveryPlan");
const EquipmentIntelligence_1 = require("../database/models/EquipmentIntelligence");
const QualityInspection_1 = require("../database/models/QualityInspection");
const ProductionScheduling_1 = require("../database/models/ProductionScheduling");
const Order_1 = require("../database/models/Order");
const SewingTeamScheduling_1 = require("../database/models/SewingTeamScheduling");
const MemberOutputProcess_1 = require("../database/models/MemberOutputProcess");
const UserAccount_1 = require("../database/models/UserAccount");
const StyleProcess_1 = require("../database/models/StyleProcess");
const Process_1 = require("../database/models/Process");

const sequelize = require("sequelize");
const Op = sequelize.Op;

function getWeekStartDate() {
    var now = new Date(); //当前日期
    var nowDayOfWeek = now.getDay(); //今天本周的第几天
    var nowDay = now.getDate(); //当前日
    var nowMonth = now.getMonth(); //当前月
    var nowYear = now.getFullYear(); //当前年
    nowYear += (nowYear < 2000) ? 1900 : 0;
    //格式化日期：yyyy-MM-dd
    function formatDate(date) {
        var myyear = date.getFullYear();
        var mymonth = date.getMonth()+1;
        var myweekday = date.getDate();

        if(mymonth < 10){
            mymonth = "0" + mymonth;
        }
        if(myweekday < 10){
            myweekday = "0" + myweekday;
        }
        return (myyear+"-"+mymonth + "-" + myweekday);
    }

    var weekStartDate = new Date(nowYear, nowMonth, nowDay - nowDayOfWeek);
    return formatDate(weekStartDate);
}

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

//getWorkerList(1,orderOne.id,workerArray,1)

let getWorkerList = async function (type, order, workerArray,flag){

    let qualityInspectionQuery = {};
    if(!flag){
        qualityInspectionQuery = {query: {type:type, order:order}};
    }else{
        let inspectedTime = { [sequelize.Op.and]: [{ [sequelize.Op.gte]: (new Date()).toISOString().slice(0, 11) + '00:00:00.000Z' }, { [sequelize.Op.lte]: (new Date()).toISOString().slice(0, 11) + '23:59:59.000Z' }] };
        qualityInspectionQuery = {query: {type:type,inspectedTime:inspectedTime,order:order}};
    }

    let  qualityInspectionArray = await findAndCount(qualityInspectionQuery, QualityInspection_1, 1,{},{worker:{[Op.in]:workerArray}});
    console.log('qualityInspectionArray');
    console.log(qualityInspectionArray);
    let qualityInspectionNoReturnArray = qualityInspectionArray.filter(value=>{
        if((value.bundleNumber.split("-")[value.bundleNumber.split("-").length -1]).includes('J')){

        }else{
            return true;
        }
    });

    let bundleNumberArray = qualityInspectionNoReturnArray.map(value=>{
        return value.bundleNumber;
    });

    console.log('bundleNumberArray');
    console.log(bundleNumberArray);

    let bundleNumberTypeArray = [...new Set(bundleNumberArray)];
    console.log('bundleNumberTypeArray');
    console.log(bundleNumberTypeArray);

    let bundleNumberResult =  bundleNumberTypeArray.map(value => {

        let oneBundleNumberArray = qualityInspectionNoReturnArray.filter(value1=>{
            if(value1.bundleNumber === value){
                return true;
            }
        });
        console.log('oneBundleNumberArray');
        console.log(JSON.stringify(oneBundleNumberArray) );

        let oneBundleNumberResultSum = oneBundleNumberArray.reduce((a,b)=>{

            if(b.qualityInspectionResultData.length > 0){

                let sum = b.qualityInspectionResultData.reduce((c,d)=>{

                    if(c.result !== 0){
                        return c+ d.result;
                    }
                },0);

                return a +sum;
            }else{
                return a;
            }
        },0);

        console.log('oneBundleNumberResultSum');
        console.log(oneBundleNumberResultSum);

        let oneBundleNumberWorkerResultPairArray = oneBundleNumberArray.map(value2=>{

            let workerResultPairJson ={
                worker:null,
                amount:null,
                reject:null
            };

            workerResultPairJson.worker = value2.worker;
            workerResultPairJson.amount = value2.amount;
            workerResultPairJson.reject = oneBundleNumberResultSum;
            return workerResultPairJson;
        });
        console.log('oneBundleNumberWorkerResultPairArray');
        console.log(oneBundleNumberWorkerResultPairArray);

        oneBundleNumberWorkerResultPairArray.sort((a,b)=>{
            return a.worker - b.worker;
        });

        let oneBundleNumberWorkerResultPairSingleArray = oneBundleNumberWorkerResultPairArray.reduce((a,b)=>{
            if(a.length == 0){
                a.push(b);
            }else{
                if(a[a.length -1].worker !== b.worker) {
                    a = a.concat(b)
                }
            }

            return a;
        },[]);


        return {bundleNumber:value, amount:oneBundleNumberWorkerResultPairArray[0].amount,workerResultPair:oneBundleNumberWorkerResultPairSingleArray};
    });
    console.log('bundleNumberResult5555555');
    console.log(bundleNumberResult);

    let workerTotalList = bundleNumberResult.reduce((a,b)=>{
        a = a.concat(b.workerResultPair);
        return a;
    },[]);

    console.log('workerTotalList');
    console.log(workerTotalList);

    workerTotalList.sort((a,b)=>{
        return a.worker - b.worker;
    });

    let workerList = workerTotalList.reduce((a,b)=>{
        if(a.length == 0){
            a.push(b);
        }else{
            if(a[a.length -1].worker === b.worker) {
                a[a.length -1].amount = a[a.length -1].amount + b.amount;
                a[a.length -1].reject = a[a.length -1].reject + b.reject;
            }else{
                a.push(b)
            }
        }
        return a;
    },[]);

    return workerList;
};

exports.registerForemanKanbanNewAPI = function (foremanKanBanRouter) {
    /**
     * @api {post} /foremanKanBanN/search [组长看板]-查詢
     * @apiDescription 查詢符合條件的班组信息，並將結果分頁回傳
     * @apiGroup Complex
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Object} [query] 查詢條件。可以指定欄位等於某個值。
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/foremanKanBanN/search
     * Body:
     * {
     *   "query": {
     *             "member": 7,
     *             "orderID": "10001",
     *             "deliveryDate":"2018-10-31"
     *   }
     * }
     * @apiSuccess (Success 200) {Number} pageIndex 目前的頁碼
     * @apiSuccess (Success 200) {Number} maxRows 每一頁的最大筆數
     * @apiSuccess (Success 200) {Number} totalPage 總頁數
     * @apiSuccess (Success 200) {Array} records 查詢的結果。
     * @apiSuccessExample {json} Response Example
     * {
     *   "pageIndex": 1,
     *   "maxRows": 100,
     *   "totalPage": 2,
     *   "records": [
     *   {
     *       "material": {
     *           "materialIn": 0,
     *           "materialOut": 0,
     *           "materialDiff": 0,
     *           "scheduling": [],
     *           "endDate": null,
     *           "rejectSum": 0,
     *           "rejectRate": 0,
     *           "returnSum": 0,
     *           "returnRate": 0,
     *           "passSum": 0,
     *           "passRate": 0,
     *           "workerCount": 0,
     *           "workerList": [],
     *           "processOrderArray": [],
     *           "processDayArray": [],
     *           "problemTypeArray": [],
     *           "problemTypeCountOrderArray": [],
     *           "partTypeArray": [],
     *           "partTypeCountOrderArray": [],
     *           "wProblemTypeArray": [],
     *           "wProblemTypeCountOrderArray": [],
     *           "wPartTypeArray": [],
     *           "wPartTypeCountOrderArray": []
     *       },
     *       "worker": [
     *           {
     *               station: 0,
     *               team: 0,
     *               operator: 0,
     *               username: null,
     *               inspectedAmount:0,
     *               amount: 0,
     *               pay: 0,
     *               amountSum:0,
     *               paySum:0,
     *               return: 0,
     *               reject: 0,
     *               returnRate: 0,
     *               rejectRate: 0,
     *               problem: [],
     *               part: [],
     *               wProblem:[],
     *               wPart:[],
     *               process: [],
     *               workerWorkingRate: null,
     *               equipmentMac: null,
     *               workingTimeSpan: 0,
     *               qualityInspectionID: [],
     *               qualityInspectionResultData: {},
     *               qualityInspectionIDwReturn: [],
     *               qualityInspectionResultDatawReturn: {},
     *               weeklyQualityInspectionID: [],
     *               weeklyQualityInspectionResultData: {}
     *           },
     *           ...
     *       ]
     *   }
     *   ]
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    foremanKanBanRouter.post('/foremanKanBanN/search', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:63', 400);
        }
        else {
            let resp = dbquery_1.queryResponsePacket(ctx.request.body);
            let query = ctx.request.body.query;
            if(!query.orderID || query.orderID === null){
                ctx.throw('db.invalidParameters:F1', 400);
            }
            if(!query.member || query.member === null){
                ctx.throw('db.invalidParameters:F2', 400);
            }
            if(!query.deliveryDate || query.deliveryDate === null){
                ctx.throw('db.invalidParameters:F3', 400);
            }
            try {
                //let dateStart = ctx.request.body.query.dateStart;
                //let dateEnd = ctx.request.body.query.dateEnd;
                let timeStart = (new Date().toISOString()).slice(0, 11) + '08:00:00.000Z';
                let noonTimeS = (new Date().toISOString()).slice(0, 11) + '12:00:00.000Z';
                let noonTimeE = (new Date().toISOString()).slice(0, 11) + '13:00:00.000Z';
                let timeEnd = (new Date().toISOString()).slice(0, 11) + '17:00:00.000Z';
                let eveTimeS = (new Date().toISOString()).slice(0, 11) + '18:00:00.000Z';
                let eveTimeE = (new Date().toISOString()).slice(0, 11) + '20:00:00.000Z';
                //console.log(dateStart);
                //console.log(dateEnd);
                let recordAPI = {};
                //let currentDate = new Date(new Date().getTime() + 28800000).toISOString();
                let currentDate = new Date().toISOString();
                let materialJson = {
                    materialIn: 0,
                    materialOut: 0,
                    materialDiff: 0,
                    scheduling: [],
                    endDate:null,
                    style:null,
                    rejectSum:0,
                    rejectRate: 0,
                    returnSum:0,
                    returnRate: 0,
                    passSum:0,
                    passRate: 0,
                    workerCount: 0,
                    workerList: [],
                    processOrderArray: [],
                    processDayArray:[],
                    problemTypeArray: [],
                    problemTypeCountOrderArray: [],
                    partTypeArray: [],
                    partTypeCountOrderArray: [],
                    wProblemTypeArray: [],
                    wProblemTypeCountOrderArray: [],
                    wPartTypeArray: [],
                    wPartTypeCountOrderArray: []
                };
                let stationOperatorJsonArray = [];

                //Check order by query.orderID & query.deliveryDate
                let orderQuery = {query: {orderID: query.orderID, deliveryDate: query.deliveryDate}};
                let orderOne = await findOne(orderQuery, Order_1, 0, {raw: true});
                console.log('orderOne');
                console.log(orderOne);

                let productionSchedulingIDArray = [];
                if (orderOne) {

                    materialJson.style = orderOne.style;
                    //check orderDeliveryPlan by order:id
                    let orderDeliveryPlanQuery = {query: {order: orderOne.id}};
                    let orderDeliveryPlanArray = await findAndCount(orderDeliveryPlanQuery, OrderDeliveryPlan_1, 1,{});
                    console.log('orderDeliveryPlanArray');
                    console.log(orderDeliveryPlanArray);

                    if (orderDeliveryPlanArray.length > 0) {
                        let orderDeliveryPlanIDArray = orderDeliveryPlanArray.map(value => {
                            return value.id;
                        });

                        //check productionScheduling by orderDeliveryPlan:id
                        let productionSchedulingQuery = {query: {}};
                        let productionSchedulingArray = await findAndCount(productionSchedulingQuery, ProductionScheduling_1, 0,{},{orderDeliveryPlan: {[sequelize.Op.in]: orderDeliveryPlanIDArray}});
                        if (productionSchedulingArray.length > 0) {
                            productionSchedulingIDArray = productionSchedulingArray.map(value => {
                                return value.id;
                            });
                        }

                        //check team by query.member
                        let teamMemberQuery = {query: {member: query.member}};
                        let teamMemberOne = await findOne(teamMemberQuery, TeamMember_1, 0, {raw: true});

                        let team = null;
                        if (teamMemberOne) {
                            team = teamMemberOne.team;
                        }

                        //查询当日工序数量
                        let queryToday = {[sequelize.Op.and]: [{[sequelize.Op.gte]: currentDate.slice(0, 11) + '00:00:00.000Z'}, {[sequelize.Op.lte]: currentDate.slice(0, 11) + '23:59:59.000Z'}]};
                        let memberOutputTodayQuery = {query: {date: queryToday,team: team}};
                        //let memberOutputOrderQuery = {query:{team:team,productionScheduling:{[sequelize.Op.in]:productionSchedulingIDArray}/*,date:queryToday*/}};
                        let memberOutputTodayArray = await findAndCount(memberOutputTodayQuery, MemberOutput_1,1,{order:['date']},{productionScheduling: {[sequelize.Op.in]: productionSchedulingIDArray}});
                        console.log('memberOutputTodayArray');
                        console.log(memberOutputTodayQuery);
                        //console.log(team);
                        console.log(productionSchedulingIDArray);
                        console.log(memberOutputTodayArray);
                        if (memberOutputTodayArray.length > 0) {
                            let memberOutputIDArray = memberOutputTodayArray.map(value => {
                                return value.id;
                            });
                            let workerList = memberOutputTodayArray.map(value=>{
                                let tmpJson = {
                                    member:null,
                                    name:null
                                };
                                tmpJson.member = value.worker;
                                tmpJson.name = value.workerData.chineseName;

                                return tmpJson;
                            });

                            workerList.sort((a,b)=>{
                                return a.member -b.member
                            });
                            console.log('567578956423542543');
                            console.log(workerList);
                            let workerArray = workerList.reduce((a,b)=>{
                                if(a.length == 0){
                                    a.push(b);
                                }else{
                                    if(a[a.length -1].member !== b.member) {
                                        a = a.concat(b)
                                    }
                                }
                                return a;
                            },[]);

                            materialJson.workerList = workerArray;
                            materialJson.workerCount = workerArray.length;

                            console.log('materialJson.workerList');
                            console.log(materialJson.workerList);
                            for (let x = 0; x < materialJson.workerList.length; x++) {
                                let stationOperatorJson = {
                                    station: 0,
                                    team: 0,
                                    operator: 0,
                                    memberOutput:[],
                                    username: null,
                                    inspectedAmount:0,
                                    amount: 0,
                                    pay: 0,
                                    amountSum:0,
                                    paySum:0,
                                    return: 0,
                                    reject: 0,
                                    returnRate: 0,
                                    rejectRate: 0,
                                    problem: [],
                                    part: [],
                                    wProblem:[],
                                    wPart:[],
                                    process: [],
                                    workerWorkingRate: null,
                                    equipmentMac: null,
                                    workingTimeSpan: 0,
                                    workingHoursSum: null,
                                    totalSum:null,
                                    qualityInspectionID: [],
                                    qualityInspectionResultData: {},
                                    qualityInspectionIDwReturn: [],
                                    qualityInspectionResultDatawReturn: {},
                                    weeklyQualityInspectionID: [],
                                    weeklyQualityInspectionResultData: {}
                                };

                                stationOperatorJson.operator = materialJson.workerList[x].member;
                                for(let y of memberOutputTodayArray){
                                    if(materialJson.workerList[x].member === y.worker){
                                        stationOperatorJson.station = y.station;
                                        stationOperatorJson.team = team;
                                    }
                                }
                                stationOperatorJson.username = materialJson.workerList[x].name;

                                stationOperatorJsonArray.push(stationOperatorJson);
                            }
                            console.log('stationOperatorJsonArray');
                            console.log(stationOperatorJsonArray);

                            //materialJson.workerCount
                            let memberOutputProcessQuery = {query: {date:queryToday}};
                            let option = {memberOutput: {[sequelize.Op.in]: memberOutputIDArray}};
                            let memberOutputProcessArray = await findAndCount(memberOutputProcessQuery, MemberOutputProcess_1,1,{},option);
                            console.log('memberOutputProcessArray');
                            console.log(memberOutputProcessArray);
                            if (memberOutputProcessArray.length > 0) {

                                let processSumArray = [];
                                memberOutputProcessArray.reduce((a, b) => {
                                    let stationData = [];
                                    let tempJson = {
                                        id:null,
                                        processID: null,
                                        processName: null,
                                        amount: null,
                                        station: []
                                    };
                                    tempJson.id = b.process;
                                    tempJson.processID = b.processData.processID;
                                    tempJson.processName = b.processData.name;
                                    tempJson.amount = b.memberOutputData.amount;
                                    stationData.push({station: b.memberOutputData.station, worker: b.memberOutputData.worker});
                                    tempJson.station = stationData;
                                    processSumArray.push(tempJson);
                                }, 0);
                                console.log('processSumArray');
                                console.log(processSumArray);

                                let processIDArray = processSumArray.map(value => {
                                    return value.processID;
                                });

                                processIDArray = [...new Set(processIDArray)].sort((a, b) => {
                                    return a - b;
                                });
                                //console.log(processIDArray);

                                let processOrderSumArray = processIDArray.map(value => {

                                    let tempArray = [];
                                    for (let item of processSumArray) {
                                        if (item.processID === value) {
                                            tempArray.push(item)
                                        }
                                    }

                                    let result = tempArray.reduce((a, b) => {
                                        let stationData = [];
                                        stationData = a.station.concat(b.station);
                                        return {id:b.id,amount: a.amount + b.amount, processName: b.processName, station: stationData}
                                    }, {id:null,amount: 0, processName: null, station: []});

                                    tempArray[0].id = result.id;
                                    tempArray[0].amount = result.amount;
                                    tempArray[0].processName = result.processName;
                                    tempArray[0].station = result.station;

                                    return tempArray[0];
                                });
                                console.log('processOrderSumArray');
                                console.log(processOrderSumArray);

                                //整合每工序对应的人
                                processOrderSumArray.map(value => {
                                    let uniq = value.station.map(value1 => {
                                        return value1.worker;
                                    });
                                    uniq = [...new Set(uniq)];
                                    console.log('uniq');
                                    console.log(uniq);
                                    value.station = uniq.map(value1 => {
                                        let temp = [];
                                        for (let x of value.station) {
                                            if (x.worker === value1) {
                                                temp.push(x);
                                            }
                                        }
                                        return temp[0];
                                    })
                                });
                                console.log('processOrderSumArray[0]');
                                console.log(processOrderSumArray[0]);
                                materialJson.processDayArray = processOrderSumArray;

                                //查找投料数量
                                let processAmout = processOrderSumArray.map(value => {
                                    return value.amount;
                                });
                                processAmout.sort((a, b) => {
                                    return b - a;
                                });

                                //计件数量最多工序为投料
                                materialJson.materialIn = processAmout[0];
                                //console.log(materialJson.materialIn)
                            }
                        }

                        //查询订单累计工序数量
                        let memberOutputOrderQuery = {query: {team: team}};
                        let memberOutputOrderArray = await findAndCount(memberOutputOrderQuery, MemberOutput_1, 1,{order:['date']},{productionScheduling: {[sequelize.Op.in]: productionSchedulingIDArray}});
                        console.log('memberOutputOrderArray');
                        console.log(memberOutputOrderArray);
                        if (memberOutputOrderArray.length > 0) {
                            let memberOutputIDArray = memberOutputOrderArray.map(value => {
                                return value.id;
                            });
                            console.log('memberOutputIDArray2222222222222222222222');
                            console.log(memberOutputIDArray);
                            let memberOutputProcessQuery = {query: {}};
                            let memberOutputProcessArray = await findAndCount(memberOutputProcessQuery, MemberOutputProcess_1, 1,{},{memberOutput: {[sequelize.Op.in]: memberOutputIDArray}});
                            console.log('memberOutputProcessArray');
                            console.log(memberOutputProcessArray);
                            if (memberOutputProcessArray.length > 0) {

                                let processSumArray = [];
                                memberOutputProcessArray.reduce((a, b) => {
                                    let stationData = [];
                                    let tempJson = {
                                        id:null,
                                        processID: null,
                                        processName:null,
                                        workingHours:null,
                                        //name: null,
                                        amount: null,
                                        station: []
                                    };

                                    tempJson.id = b.process;
                                    tempJson.processID = b.processData.processID;
                                    if(b.processData){
                                        tempJson.processName = b.processData.name;
                                        tempJson.workingHours = b.processData.workingHours;
                                    }
                                    //tempJson.name = b.processData.name;
                                    tempJson.amount = b.memberOutputData.amount;
                                    stationData.push({station: b.memberOutputData.station, worker: b.memberOutputData.worker});
                                    tempJson.station = stationData;
                                    processSumArray.push(tempJson);
                                }, 0);
                                console.log('processSumArray');
                                console.log(processSumArray);

                                let processIDArray = processSumArray.map(value => {
                                    return value.processID;
                                });

                                processIDArray = [...new Set(processIDArray)].sort((a, b) => {
                                    return a - b;
                                });
                                //console.log(processIDArray);

                                let processOrderSumArray = processIDArray.map(value => {

                                    let tempArray = [];
                                    for (let item of processSumArray) {
                                        if (item.processID === value) {
                                            tempArray.push(item)
                                        }
                                    }

                                    let result = tempArray.reduce((a, b) => {
                                        let stationData = [];
                                        stationData = a.station.concat(b.station);
                                        return {id:b.id,amount: a.amount + b.amount, processName: b.processName,station: stationData}
                                    }, {id:null,amount: 0, processName: null, station: []});

                                    tempArray[0].id = result.id;
                                    tempArray[0].amount = result.amount;
                                    tempArray[0].processName = result.processName;
                                    tempArray[0].station = result.station;

                                    return tempArray[0];
                                });
                                console.log('processOrderSumArray');
                                console.log(processOrderSumArray);

                                //整合每工序对应的人
                                processOrderSumArray.map(value => {
                                    let uniq = value.station.map(value1 => {
                                        return value1.worker;
                                    });
                                    uniq = [...new Set(uniq)];
                                    console.log('uniq');
                                    console.log(uniq);
                                    value.station = uniq.map(value1 => {
                                        let temp = [];
                                        for (let x of value.station) {
                                            if (x.worker === value1) {
                                                temp.push(x);
                                            }
                                        }
                                        return temp[0];
                                    })
                                });
                                console.log('processOrderSumArray[0]');
                                console.log(processOrderSumArray[0]);
                                materialJson.processOrderArray = processOrderSumArray;
                                materialJson.endDate = memberOutputOrderArray[memberOutputOrderArray.length-1].date;
                            }
                        }

                        //计算计划产量，当日，累计，当前时间
                        let currentDate1 = (new Date()).toLocaleDateString();

                        console.log('-------------------车缝-------------------');
                        let sewingTeamSchedulingQuery = {query: {team:team, startDate: {[sequelize.Op.lte]:currentDate1},endDate: {[sequelize.Op.gte]:currentDate1}}};
                        let sewingTeamSchedulingArray = await findAndCount(sewingTeamSchedulingQuery,SewingTeamScheduling_1,0,{},{productionScheduling:{[sequelize.Op.in]:productionSchedulingIDArray}});
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
                        console.log('totalScheduleAmountSum');
                        console.log(totalScheduleAmountSum);
                        let amountAPI = {
                            dayScheduleAmout:parseInt(dayScheduleAmountSum),
                            currentTimeScheduleAmout:parseInt(currentScheduleAmount),
                            totalScheduleAmount:parseInt(totalScheduleAmountSum)
                        };
                        materialJson.scheduling.push(amountAPI);//当日排产

                        let workerArray = materialJson.workerList.map(value=>{
                            return value.member;
                        });

                        //查询当日所有员工产量以及次品数量
                        let todayWorkerQualityInspectionData = await getWorkerList(1,orderOne.id,workerArray,1);

                        if(todayWorkerQualityInspectionData.length > 0){
                            stationOperatorJsonArray.map(value=>{
                                for(let x of todayWorkerQualityInspectionData){
                                    if(x.worker === value.operator){
                                        //value.reject = x.reject;
                                        //value.rejectRate = x.reject / x.amount;
                                        value.inspectedAmount = x.amount;
                                    }
                                }
                            })
                        }
                        //console.log('stationOperatorJsonArray333333333333333333333333333');
                        //console.log(stationOperatorJsonArray);

                        let qualityInspectionTodayQuery = {query: {inspectedTime:queryToday,type:1,order:orderOne.id}};
                        let qualityInspectionArray = await findAndCount(qualityInspectionTodayQuery, QualityInspection_1,1,{},{worker:{[sequelize.Op.in]: workerArray}});
                        console.log('qualityInspectionArray');
                        console.log(qualityInspectionArray);
                        if(qualityInspectionArray.length > 0){

                            let option = {
                                attributes: [
                                    'id',
                                    'bundleNumber',
                                    'amount'
                                ],

                                group: ['bundleNumber']
                            };
                            let qualityInspectionArray1 = await findAndCount(qualityInspectionTodayQuery, QualityInspection_1, 0, option,{worker:{[sequelize.Op.in]: workerArray}});
                            console.log('qualityInspectionArray1');
                            console.log(qualityInspectionArray1);
                            if(qualityInspectionArray1.length > 0){

                                let returnCardArray = qualityInspectionArray1.filter(value=>{
                                    if((value.bundleNumber.split("-")[value.bundleNumber.split("-").length -1]).includes('J')){
                                        return true;
                                    }
                                });

                                let qualityInspectionAmountSum = qualityInspectionArray1.reduce((a, b) => {
                                    return a + b.amount;
                                }, 0);

                                //检验数量 == 产出数量； 投入 - 产出 = 差异
                                materialJson.materialOut = qualityInspectionAmountSum - returnCardArray.length;
                                materialJson.materialDiff = materialJson.materialIn - materialJson.materialOut;
                            }

                            stationOperatorJsonArray.forEach(value => {
                                let tempArray = [];
                                for (let x of qualityInspectionArray) {
                                    if (value.operator === x.worker) {
                                        if(x.qualityInspectionResultData.length > 0){
                                            value.qualityInspectionIDwReturn.push(x.id);
                                            tempArray = tempArray.concat(x.qualityInspectionResultData)
                                        }
                                        value.qualityInspectionResultDatawReturn = tempArray;
                                    }
                                }
                            });

                            //筛除返工BundleNumber
                            let qualityInspectionNoReturnArray = qualityInspectionArray.filter(value=>{
                                if((value.bundleNumber.split("-")[value.bundleNumber.split("-").length -1]).includes('J')){

                                }else{
                                    return true;
                                }
                            });
                            console.log('qualityInspectionNoReturnArray');
                            console.log(qualityInspectionNoReturnArray);

                            stationOperatorJsonArray.forEach(value => {
                                let tempArray = [];
                                for (let x of qualityInspectionNoReturnArray) {
                                    if (value.operator === x.worker) {
                                        if(x.qualityInspectionResultData.length > 0){
                                            value.qualityInspectionID.push(x.id);
                                            tempArray = tempArray.concat(x.qualityInspectionResultData)
                                        }
                                        value.qualityInspectionResultData = tempArray;
                                    }
                                }
                            });

                            let totalInspectionResultWithReturnArray = [];
                            let totalInspectionResultWithoutReturnArray = [];
                            stationOperatorJsonArray.map(value=>{

                                if(value.qualityInspectionResultData.length > 0){
                                    totalInspectionResultWithoutReturnArray = totalInspectionResultWithoutReturnArray.concat(value.qualityInspectionResultData);
                                }
                                if(value.qualityInspectionResultDatawReturn.length > 0){
                                    totalInspectionResultWithReturnArray = totalInspectionResultWithReturnArray.concat(value.qualityInspectionResultDatawReturn);
                                }

                                //return tempArray;
                            });
                            console.log('totalInspectionResultWithReturnArray');
                            //console.log(totalInspectionResultWithReturnArray);
                            console.log('totalInspectionResultWithoutReturnArray');
                            //console.log(totalInspectionResultWithoutReturnArray);
                            let returnTotalArray = totalInspectionResultWithoutReturnArray.filter(value=>{

                                for(let x of qualityInspectionArray){
                                    if(value.qualityInspection === x.id){

                                        value.bundleNumber = x.bundleNumber;

                                        if(value.result === 0){
                                            value.flag = value.bundleNumber+'-'+value.pieceIndex;
                                            return true;
                                        }
                                        //value.bundleNumber = x.bundleNumber;
                                    }
                                }
                            });
                            console.log('returnTotalArray');
                            //console.log(returnTotalArray);
                            let returnBundleArray = returnTotalArray.map(value=>{
                                return value.flag;
                            });

                            returnBundleArray = [...new Set(returnBundleArray)];
                            materialJson.returnSum = returnBundleArray.length;
                            console.log('returnBundleArray.length');
                            console.log(returnBundleArray.length);

                            //totalInspectionResultWithReturnArray用于统计reject数量
                            //totalInspectionResultWithoutReturnArray用于统计return数量

                            let rejectTotalArray = totalInspectionResultWithReturnArray.filter(value=>{

                                for(let x of qualityInspectionArray){
                                    if(value.qualityInspection === x.id){

                                        value.bundleNumber = x.bundleNumber;

                                        if(value.result === 1){
                                            value.flag = value.bundleNumber+'-'+value.pieceIndex;
                                            return true;
                                        }

                                    }
                                }
                            });
                            //console.log('rejectTotalArray');
                            //console.log(rejectTotalArray);

                            let returnRejectArray = rejectTotalArray.filter(value=>{
                                if((value.bundleNumber.split("-")[value.bundleNumber.split("-").length -1]).includes('J')){
                                    return true;
                                }
                            });
                            let returnRejectAmount = returnRejectArray.length;

                            let doubleReturnArray = returnTotalArray.filter(value=>{
                                if((value.bundleNumber.split("-")[value.bundleNumber.split("-").length -1]).includes('J')){
                                    return true;
                                }
                            });
                            let doubleReturnAmount = doubleReturnArray.length;


                            let rejectBundleArray = rejectTotalArray.map(value=>{
                                return value.flag;
                            });

                            rejectBundleArray = [...new Set(rejectBundleArray)];
                            materialJson.rejectSum = rejectBundleArray.length;
                            materialJson.passSum = materialJson.materialOut - materialJson.returnSum - materialJson.rejectSum + returnRejectAmount;

                            for(let x = 0; x < stationOperatorJsonArray.length; x++){
                                if(stationOperatorJsonArray[x].qualityInspectionResultData. length > 0){

                                    let returnSumArray = stationOperatorJsonArray[x].qualityInspectionResultData.filter(value=>{

                                        for(let x of qualityInspectionArray){
                                            if(value.qualityInspection === x.id){

                                                value.bundleNumber = x.bundleNumber;

                                                if(value.result === 0){
                                                    value.flag = value.bundleNumber+'-'+value.pieceIndex;
                                                    return true;
                                                }
                                                //value.bundleNumber = x.bundleNumber;
                                            }
                                        }
                                    });
                                    console.log('returnSumArray');

                                    let returnPieceBundleArray = returnSumArray.map(value=>{
                                        return value.flag;
                                    });

                                    returnBundleArray = [...new Set(returnPieceBundleArray)];
                                    stationOperatorJsonArray[x].return = returnBundleArray.length;
                                }
                            }
                        }

                        //console.log('stationOperatorJsonArray');
                        //console.log(stationOperatorJsonArray);

                        //let rejectSum = 0;
                        //let returnSum = 0;
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

                                let rejectTypewReturn = stationOperatorJsonArray[x].qualityInspectionResultDatawReturn.reduce((a, b) => {

                                    if (b.result === 1) {
                                        a.result1++;
                                    } else {
                                        a.result0++;
                                    }
                                    return a;
                                }, {result0: 0, result1: 0});

                                let categoryAndProblem = stationOperatorJsonArray[x].qualityInspectionResultDatawReturn.reduce((a, b) => {

                                    if(b.result === 0){
                                        a.part.push(b.part);
                                        a.problem.push(b.problem);
                                    }
                                    return a;
                                }, {part: [], problem: []});

                                //stationOperatorJsonArray[x].return = rejectType.result0;
                                //stationOperatorJsonArray[x].reject = rejectType.result1;
                                stationOperatorJsonArray[x].returnRate = stationOperatorJsonArray[x].return / (stationOperatorJsonArray[x].inspectedAmount || 1);
                                //stationOperatorJsonArray[x].rejectRate = stationOperatorJsonArray[x].reject / (stationOperatorJsonArray[x].inspectedAmount || 1);
                                stationOperatorJsonArray[x].part = categoryAndProblem.part;
                                stationOperatorJsonArray[x].problem = categoryAndProblem.problem;
                                //console.log("returnSum333333333333333333");
                                //console.log(rejectType.result0 + "worker"+ stationOperatorJsonArray[x].operator);
                                //console.log('rejectTypewReturn.result1');
                                //console.log(rejectTypewReturn.result1 + "worker"+ stationOperatorJsonArray[x].operator);
                                //rejectSum += rejectTypewReturn.result1;
                                //returnSum += stationOperatorJsonArray[x].return;
                            }
                        }

                        console.log('222222222222255555555555555555555555555555555555555555555');
                        //console.log(rejectSum);
                        //console.log(returnSum);
                        //materialJson.rejectSum = rejectSum;
                        //materialJson.returnSum = returnSum;
                        materialJson.rejectRate = materialJson.rejectSum / (materialJson.materialOut || 1);
                        materialJson.returnRate = materialJson.returnSum / (materialJson.materialOut || 1);
                        materialJson.passRate = materialJson.passSum / (materialJson.materialOut || 1);

                        //当日memberOutput查询员工生产数量
                        //let queryDate = {[sequelize.Op.and]: [{[sequelize.Op.gte]: currentDate.slice(0, 11) + '00:00:00.000Z'}, {[sequelize.Op.lte]: currentDate.slice(0, 11) + '23:59:59.000Z'}]};
                        let memberOutputQuery = {query: {date: queryToday}};
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
                        //console.log(workerArray)
                        //console.log(productionSchedulingIDArray)
                        //console.log('11111111111111memberOutputArray');
                        //console.log(memberOutputArray);

                        stationOperatorJsonArray.map(value => {

                            for (let x of memberOutputArray) {
                                if (value.operator === x.worker) {
                                    value.amount = parseFloat(x.amountSum);
                                    value.pay = parseFloat(x.paySum);
                                }
                            }
                        });
                        //console.log('stationOperatorJsonArray44444444444444444444444444');
                        //console.log(stationOperatorJsonArray);

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
                        console.log('memberOutputSumArray');
                        //console.log(memberOutputSumArray);

                        stationOperatorJsonArray.map(value => {
                            for (let x of memberOutputSumArray) {
                                if (value.operator === x.worker) {
                                    value.amountSum = parseFloat(x.amountSum);
                                    value.paySum = parseFloat(x.paySum);
                                }
                            }
                        });
                        //console.log('stationOperatorJsonArray555555555555544444444444444');
                        //console.log(stationOperatorJsonArray);

                        //查询计算每人每天工序总时长，用于计算  效率   processWorkingHour * amount / equipmentWorkingSpan
                        let memberOutputArray3 = await findAndCount({query:{date:queryToday}}, MemberOutput_1, 0, {}, {
                            worker: {[sequelize.Op.in]: workerArray},
                            productionScheduling: {[sequelize.Op.in]: productionSchedulingIDArray}
                        });
                        console.log('memberOutputArray3');
                        console.log(memberOutputArray3);
                        if(memberOutputArray3.length > 0){

                            for(let i = 0; i<stationOperatorJsonArray.length;i++){
                                for(let x of memberOutputArray3){
                                    //let temp ={worker: x.worker,id:[{id:1,processList:[]}]}
                                    if(stationOperatorJsonArray[i].operator === x.worker){
                                        let tempJson = {
                                            id:null,
                                            amount:null,
                                            processList:[]
                                        };
                                        tempJson.id = x.id;
                                        tempJson.amount = x.amount;

                                        //stationOperatorJsonArray[i].amount = stationOperatorJsonArray[i].amount + x.amount;
                                        //stationOperatorJsonArray[i].pay = stationOperatorJsonArray[i].pay + x.pay;
                                        stationOperatorJsonArray[i].memberOutput.push(tempJson);
                                    }
                                }
                                if(stationOperatorJsonArray[i].memberOutput.length > 0){
                                    let memberOutputOne = stationOperatorJsonArray[i].memberOutput;
                                    let mProcessQuery = {query:{}};
                                    let meOutputID = memberOutputOne.map(value=>{
                                        return value.id;
                                    });
                                    let mProcessArray = await findAndCount(mProcessQuery,MemberOutputProcess_1,1,{},{memberOutput:{[sequelize.Op.in]:meOutputID}});
                                    console.log('mProcessArray');
                                    console.log(mProcessArray);
                                    if(mProcessArray.length > 0){
                                        //console.log('stationOperatorJsonArray[i].memberOutput');
                                        //console.log(stationOperatorJsonArray[i].memberOutput);

                                        stationOperatorJsonArray[i].memberOutput.map(value1=>{

                                            let rawProcessArray = mProcessArray.filter(value2=>{
                                                if(value2.memberOutput === value1.id ){
                                                    return true;
                                                }
                                            });

                                            let processArray =  rawProcessArray.map(value3=>{
                                                return {id:value3.processData.id,processID:value3.processData.processID,name:value3.processData.name, workingHours:value3.processData.workingHours}
                                            });
                                            value1.processList = value1.processList.concat(processArray);

                                            return true;
                                        });

                                        let sumArray = stationOperatorJsonArray[i].memberOutput.map(value=>{
                                            let oneHourSum = value.processList.reduce((a,b)=>{
                                                return a + parseFloat(b.workingHours);
                                            },0);

                                            return oneHourSum * value.amount;
                                        });

                                        stationOperatorJsonArray[i].totalSum = sumArray.reduce((a,b)=>{
                                            return a + b;
                                        },0);

                                        let processData = mProcessArray.reduce((a,b)=>{
                                            delete b.processData.type;
                                            delete b.processData.partCard;
                                            delete b.processData.step;
                                            delete b.processData.equipmentCategory;
                                            delete b.processData.mold;
                                            delete b.processData.workingPrice;
                                            delete b.processData.operationalRequirement;
                                            return a.concat(b.processData)
                                        },[]);
                                        console.log('processD555555555555555ata');
                                        console.log(processData);

                                        processData.sort((a,b)=>{
                                            return a.processID -b.processID
                                        });
                                        stationOperatorJsonArray[i].process = processData.reduce((a,b)=>{
                                            if(a.length == 0){
                                                a.push(b);
                                            }else{
                                                if(a[a.length -1].processID !== b.processID) {
                                                    a = a.concat(b)
                                                }
                                            }
                                            return a;
                                        },[]);
                                    }
                                }
                            }
                        }

                        let stationIDArray = stationOperatorJsonArray.map(value=>{
                            return value.station;
                        });
                        let productionLineQuery = {query:{}};
                        let productionLineArray = await findAndCount(productionLineQuery,ProductionLine_1,1,{},{station:{[sequelize.Op.in]:stationIDArray}});
                        console.log('productionLineArray');
                        console.log(productionLineArray);
                        if(productionLineArray.length > 0){

                            stationOperatorJsonArray.map(value=>{
                                for(let x of productionLineArray){
                                    if(x.station === value.station){
                                        if(x.equipmentData){
                                            value.equipmentMac = x.equipmentData.macAddress;
                                        }
                                    }
                                }
                            })
                        }

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

                        let typeCollectionArray = stationOperatorJsonArray.reduce((a,b)=>{
                            return a.concat(b.part)
                        },[]);

                        let typeTypeArray = [...new Set (typeCollectionArray)];

                        materialJson.partTypeArray = typeTypeArray;

                        let typeTypeCountArray = typeTypeArray.map(value => {
                            let typeCount = typeCollectionArray.reduce((a,b)=>{
                                if(b === value){
                                    a++;
                                }

                                return a;
                            },0);

                            return {[value]:typeCount}
                        });

                        let typeTypeCountOrderArray = typeTypeCountArray.sort(function (a, b) {
                            return Object.values(a) - Object.values(b);
                        });
                        materialJson.partTypeCountOrderArray = getKeyValueFromAJsonArray(typeTypeCountOrderArray);

                        ////////////////////////////////////////////////////////////////
                        //本周问题汇总
                        let weekStartDate = getWeekStartDate();
                        let weeklyQueryDate = { [sequelize.Op.and]: [{ [sequelize.Op.gte]: (new Date(weekStartDate)).toISOString().slice(0, 11) + '00:00:00.000Z' }, { [sequelize.Op.lte]: (new Date()).toISOString().slice(0, 11) + '23:59:59.000Z' }] };
                        let weeklyQualityInspectionQuery = {query: {inspectedTime:weeklyQueryDate,type:1,order: orderOne.id}};
                        let weeklyQualityInspectionArray = await findAndCount(weeklyQualityInspectionQuery, QualityInspection_1, 1,{},{worker: {[sequelize.Op.in]: workerArray}});
                        //console.log('qualityInspectionArray');
                        //console.log(qualityInspectionArray);

                        stationOperatorJsonArray.forEach(value => {
                            let tempArray = [];
                            for (let x of weeklyQualityInspectionArray) {
                                if (value.operator === x.worker) {
                                    if(x.qualityInspectionResultData.length > 0){
                                        value.weeklyQualityInspectionID.push(x.id);
                                        tempArray = tempArray.concat(x.qualityInspectionResultData)
                                    }
                                    value.weeklyQualityInspectionResultData = tempArray;
                                }
                            }
                        });

                        for (let x = 0; x < stationOperatorJsonArray.length; x++) {

                            if(stationOperatorJsonArray[x].weeklyQualityInspectionResultData. length > 0){

                                let categoryAndProblem = stationOperatorJsonArray[x].weeklyQualityInspectionResultData.reduce((a, b) => {

                                    if(b.result === 0){
                                        a.part.push(b.part);
                                        a.problem.push(b.problem);
                                    }
                                    return a;
                                }, {part: [], problem: []});

                                stationOperatorJsonArray[x].wPart = categoryAndProblem.part;
                                stationOperatorJsonArray[x].wProblem = categoryAndProblem.problem;
                            }
                        }

                        let wProblemCollectionArray = stationOperatorJsonArray.reduce((a,b)=>{
                            return a.concat(b.wProblem)
                        },[]);

                        let wProblemTypeArray = [...new Set (wProblemCollectionArray)];

                        materialJson.wProblemTypeArray = wProblemTypeArray;

                        let wProblemTypeCountArray = wProblemTypeArray.map(value => {
                            let typeCount = wProblemCollectionArray.reduce((a,b)=>{
                                if(b === value){
                                    a++;
                                }

                                return a;
                            },0);

                            return {[value]:typeCount}
                        });

                        let wProblemTypeCountOrderArray = wProblemTypeCountArray.sort(function (a, b) {
                            return Object.values(a) - Object.values(b);
                        });

                        materialJson.wProblemTypeCountOrderArray = getKeyValueFromAJsonArray(wProblemTypeCountOrderArray) ;

                        let wPartCollectionArray = stationOperatorJsonArray.reduce((a,b)=>{
                            return a.concat(b.wPart)
                        },[]);

                        let wPartTypeArray = [...new Set (wPartCollectionArray)];

                        materialJson.wPartTypeArray = wPartTypeArray;

                        let wPartTypeCountArray = wPartTypeArray.map(value => {
                            let typeCount = wPartCollectionArray.reduce((a,b)=>{
                                if(b === value){
                                    a++;
                                }

                                return a;
                            },0);

                            return {[value]:typeCount}
                        });

                        let wPartTypeCountOrderArray = wPartTypeCountArray.sort(function (a, b) {
                            return Object.values(a) - Object.values(b);
                        });
                        materialJson.wPartTypeCountOrderArray = getKeyValueFromAJsonArray(wPartTypeCountOrderArray);

                        ////////////////////////////////////////////////////////////////
                        //设备工作时间
                        let macArray = stationOperatorJsonArray.map(value => {
                            return value.equipmentMac;
                        });
                        let equipmentIntelligenceQuery = {query:{updateTime:queryToday}};
                        let equipmentIntelligenceArray = await findAndCount(equipmentIntelligenceQuery,EquipmentIntelligence_1,0,{},{mac:{[sequelize.Op.in]:macArray}});
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

                            if(!x.workingTimeSpan){
                                x.workerWorkingRate = 0;
                            }else{
                                x.workerWorkingRate = (x.totalSum || 0) /(x.workingTimeSpan|| 1);
                            }

                            delete x.workingHoursSum;
                            delete x.totalSum;
                            delete x.memberOutput;
                        }
                    }
                }

                stationOperatorJsonArray.map(value => {
                    value.returnRate = value.return / (value.inspectedAmount?value.inspectedAmount:1);
                    value.rejectRate = 0;
                    value.reject = 0;
                });

                let styleSewingProcessArray = [];
                let styleProcessQuery = {query:{style:materialJson.style}};
                let styleProcessArray = await findAndCount(styleProcessQuery, StyleProcess_1,1);

                if(styleProcessArray.length > 0){
                    let processArray = [];
                    styleProcessArray.map(value =>{
                        processArray.push(value.processData);
                    });
                    console.log('processArray');
                    console.log(processArray);

                    let sewingProcessArray = processArray.filter(value=>{
                        if(value.step === "车缝" || value.step === "sewing"){
                            return true;
                        }
                    });

                    let sewingProcessIDArray = sewingProcessArray.map(value=>{
                        return value.processID;
                    });

                    sewingProcessIDArray.sort((a,b)=>{
                        return a-b;
                    });

                    styleSewingProcessArray = sewingProcessIDArray.map(value=>{
                        let tempJson = {
                            id:null,
                            processID:null,
                            processName:null,
                            workingHours:null,
                            amount:null,
                            station:[]
                        };
                        for(let x of sewingProcessArray){
                            if(value === x.processID){
                                tempJson.id = x.id;
                                tempJson.processID = x.processID;
                                tempJson.processName = x.name;
                                tempJson.workingHours = x.workingHours;
                                tempJson.amount = 0;
                                tempJson.station = [];
                                return tempJson;
                            }
                        }
                    });
                }

                let processArrayDay = styleSewingProcessArray.map(value=>{
                    let tempJson = {
                        id:value.id,
                        processID:value.processID,
                        processName:value.processName,
                        workingHours:value.workingHours,
                        amount:0,
                        station:[]
                    };
                    for(let x of materialJson.processDayArray){
                        if(value.processID === x.processID){
                            tempJson.amount = x.amount;
                            tempJson.station = x.station;
                        }
                    }
                    return tempJson;

                });

                let processArrayOrder = styleSewingProcessArray.map(value=>{
                    let tempJson = {
                        id:value.id,
                        processID:value.processID,
                        processName:value.processName,
                        workingHours:value.workingHours,
                        amount:0,
                        station:[]
                    };
                    for(let x of materialJson.processOrderArray){
                        if(value.processID === x.processID){
                            tempJson.amount = x.amount;
                            tempJson.station = x.station;
                        }
                    }
                    return tempJson;
                });

                materialJson.processDayArray = processArrayDay;
                materialJson.processOrderArray = processArrayOrder;


                if(materialJson.processDayArray.length > 0){

                    let stationIDArray = [];
                    let workerIDArray = [];
                    for(let x = 0; x<materialJson.processDayArray.length;x++){
                        let oneProcessStationArray = materialJson.processDayArray[x].station.map(value1=>{
                                return value1.station;
                        });
                        let oneProcessWorkerArray = materialJson.processDayArray[x].station.map(value1=>{
                                return value1.worker;
                        });
                        stationIDArray = stationIDArray.concat(oneProcessStationArray);
                        workerIDArray = workerIDArray.concat(oneProcessWorkerArray);
                    }

                    stationIDArray = [...new Set(stationIDArray)];
                    let stationArray = await findAndCount({query:{id:{[sequelize.Op.in]:stationIDArray}}},Station_1,0);
                    if(stationArray.length > 0){
                        materialJson.processDayArray.map(value=>{
                            value.station.map(value1=>{
                                for(let x of stationArray){
                                    if(value1.station === x.id){
                                        value1.station = x.stationID;
                                    }
                                }
                            })
                        });
                    }

                    workerIDArray = [...new Set(workerIDArray)];
                    let workerArray = await findAndCount({query:{id:{[sequelize.Op.in]:workerIDArray}}},UserAccount_1,0);
                    if(workerArray.length > 0){
                        materialJson.processDayArray.map(value=>{
                            value.station.map(value1=>{
                                for(let x of workerArray){
                                    if(value1.worker === x.id){
                                        value1.workerName = x.chineseName;
                                    }
                                }
                            })
                        });
                    }
                }

                if(materialJson.processOrderArray.length > 0){

                    let stationIDArray = [];
                    let workerIDArray = [];
                    for(let x = 0; x<materialJson.processOrderArray.length;x++){
                        let oneProcessStationArray = materialJson.processOrderArray[x].station.map(value1=>{
                                return value1.station;
                        });
                        let oneProcessWorkerArray = materialJson.processOrderArray[x].station.map(value1=>{
                                return value1.worker;
                        });
                        stationIDArray = stationIDArray.concat(oneProcessStationArray);
                        workerIDArray = workerIDArray.concat(oneProcessWorkerArray);
                    }

                    stationIDArray = [...new Set(stationIDArray)];
                    let stationArray = await findAndCount({query:{id:{[sequelize.Op.in]:stationIDArray}}},Station_1,0);
                    if(stationArray.length > 0){
                        materialJson.processOrderArray.map(value=>{
                            value.station.map(value1=>{
                                for(let x of stationArray){
                                    if(value1.station === x.id){
                                        value1.station = x.stationID;
                                    }
                                }
                            })
                        });
                    }

                    workerIDArray = [...new Set(workerIDArray)];
                    let workerArray = await findAndCount({query:{id:{[sequelize.Op.in]:workerIDArray}}},UserAccount_1,0);
                    if(workerArray.length > 0){
                        materialJson.processOrderArray.map(value=>{
                            value.station.map(value1=>{
                                for(let x of workerArray){
                                    if(value1.worker === x.id){
                                        value1.workerName = x.chineseName;
                                    }
                                }
                            })
                        });
                    }
                }

                recordAPI = {
                    material:materialJson,
                    worker:stationOperatorJsonArray
                };
                resp.records.push(recordAPI);

                ctx.body = resp;
                ctx.status = 200;
                ctx.respond = true;
            }catch (e) {
                console.log(e);
                ctx.throw(e.message, 400);
            }
        }
    });
};
