"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const dbquery_1 = require("../database/dbquery");
const Order_1 = require("../database/models/Order");
const PurchasePlan_1 = require("../database/models/PurchasePlan");
const ColorCode_1 = require("../database/models/ColorCode");
const FabricInspectionResult_1 = require("../database/models/FabricInspectionResult");

const sequelize = require("sequelize");
const Op = sequelize.Op;

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

            return tempJson;
        });

        return keyValueArray;
    }else {
        return jsonArray;
    }
}

function getKeyValueFromAJsonV2Array(jsonArray){
    if(Array.isArray(jsonArray)){
        let keyValueArray =  jsonArray.map(value => {
            let keys = Object.keys(value);
            let mergeJson = {key:null,value:0}
            mergeJson.key = keys[0];
            mergeJson.value = value[keys[0]];
            delete value[keys[0]];
            mergeJson = Object.assign(mergeJson,value)

            return mergeJson;
        });

        return keyValueArray;
    }else {
        return jsonArray;
    }
}

function pushElementToObject (d,o){
    if(typeof(o)=='object') for(var p in o) {d[p]=o[p]}
}

const findOne = async function (query,modelInstance,join,option){
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

    console.log(queryInstance);

    let oneDoc = await modelInstance[modelInstanceKeys[0]].findOne(queryInstance);

    return  oneDoc;
};

const findAndCount = async function (query,modelInstance,join,option){
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

function continueDays(darr_ays){
    let days = darr_ays.sort().map((d,i)=>{
        let dt = new Date(d);

        dt.setDate(dt.getDate() + 4 -i);
        dt.setHours(0);
        dt.setMinutes(0);
        dt.setMilliseconds(0);

        return +dt;
    }) ;

    let ret = true;

    days.forEach(d=>{
        if(days[0] !== d){
            ret = false;
        }
    });

    return ret;
}

function DateSegmentation(days){
    let resultJson={
        '1':[]
    };

    let group='1';
    resultJson[group]=[];
    resultJson[group].push(days[0]);

    for(let x = 0; x < days.length-1; x++){
        if(continueDays([days[x].date,days[x+1].date]) )
        {
            resultJson[group].push(days[x+1])
        }
        else
        {
            group++;
            resultJson[group]=[];
            resultJson[group].push(days[x+1])
        }
    }

    return resultJson;
}

function mergeSameDay(days){
    days.forEach(value => {
        for (let y =0; y< days.length; y++){
            if (days[y].date === value.date){
                value.idArray.push(days[y].id);
                value.lengthArray.push(parseFloat(days[y].length));
            }
        }
    });

    let dateArray = days.map(value => {
        return value.date
    });

    let dateDistinctArray= [...new Set(dateArray)];
    let resultArray =  dateDistinctArray.map(value => {
        for(let x = 0; x < days.length; x++){
            if(value === days[x].date){
                return {date:value, idArray:days[x].idArray, lengthArray:days[x].lengthArray}
            }
        }
    });

    return resultArray;
}

function mergeSameDayV2(days){
    days.forEach(value => {
        for (let y =0; y< days.length; y++){
            if (days[y].date === value.date){
                value.idArray.push(days[y].id);
                value.lengthArray.push(parseFloat(days[y].length));

            }
        }
    });

    let dateArray = days.map(value => {
        return value.date
    });

    let dateDistinctArray= [...new Set(dateArray)];
    let resultArray =  dateDistinctArray.map(value => {
        let oneDay =  days.filter(value1=>{
            if(value1.date === value){
                return true;
            }

        });
        console.log('oneDay')
        console.log(oneDay)


        let oneDayPassLengthArray = oneDay.filter(value1=>{
            if(value1.summary === '合格'){
                return true;
            }
        });

        let passLengthArray =oneDayPassLengthArray.map(value=>{
            return parseFloat(value.length);
        })


        let oneDayRejectLengthArray = oneDay.filter(value1=>{
            if(value1.summary === '不合格'){
                return true;
            }
        });

        let rejectLengthArray =oneDayRejectLengthArray.map(value=>{
            return parseFloat(value.length);
        })


        return {date:value, idArray:oneDay[0].idArray, lengthArray:oneDay[0].lengthArray,rejectLengthArray:rejectLengthArray,passLengthArray:passLengthArray}

    });

    return resultArray;
}

const findAndCountAll = async function (query,modelInstance,join,option){
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
    //console.log(queryInstance);

    let tempArray = [];
    let docs = await modelInstance[modelInstanceKeys[0]].findAndCountAll(queryInstance);

    if (docs && docs.rows) {
        for (let item of docs.rows) {
            tempArray.push(item.toJSON());
        }
    }

    return  tempArray;
};

/*
/daHuoReport/search
{
"query":{
"orderID":"10001","deliveryDate":"2019-01-31","flag":2,"dateStart":"2018-11-11","dateEnd":"2018-11-20"
        }
 }

 */

exports.registerDaHuoReportAPI = function (daHuoReportRouter) {

    daHuoReportRouter.post('/daHuoReport/search', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:63', 400);
        }
        else {
            let resp = dbquery_1.queryResponsePacket(ctx.request.body);
            let dateStart = ctx.request.body.query.dateStart;
            let dateEnd = ctx.request.body.query.dateEnd;
            let flag = ctx.request.body.query.flag;
            //console.log(dateStart);
            //console.log(dateEnd);
            //console.log(flag);

            let reportJson = {
                order:null,
                productName:null,
                styleID:null,
                productCategory:null,
                materialArray: [],
            };
            let query = {query:{orderID:ctx.request.body.query.orderID, deliveryDate:ctx.request.body.query.deliveryDate}};
            let orderArray =  await findAndCount(query,Order_1,1);
//            console.log('orderArray');
//            console.log(orderArray);

            //step 1
            if(orderArray.length > 0){
                reportJson.order = orderArray[0]['id'];
                reportJson.productName = orderArray[0]['styleData']['productName'];
                reportJson.styleID = orderArray[0]['styleData']['styleID'];
                reportJson.productCategory = orderArray[0]['styleData']['productCategory'];

            //step 2
                query = {query:{order:reportJson.order}};
                let purchasePlanArray =  await findAndCount(query,PurchasePlan_1,1);
                console.log('purchasePlanArray');
                console.log(JSON.stringify(purchasePlanArray) );

                for(let x = 0; x < purchasePlanArray.length; x++){
                    let value = purchasePlanArray[x];
                    let tempJson = {
                        reportName:null,
                        id:null,
                        material:null,
                        materialID:null,
                        name:null,
                        color:null,
                        colorCode:null,
                        width:null,
                        category:null,
                        spec:null,
                        purchaseAmount:null,
                        supplier:null,
                        fabricInspectedStartDate:null,
                        fabricInspectedEndDate:null,
                        materialReceivingData:[],
                        materialReceivinglengthSum:null,
                        fabricInspectionID:[],
                        fabricInspectedIDDate:[],
                        fabricInspectedDate:[],
                        fabricInspectionLengthSum:0,
                        fabricInspectionRejectLengthSum:0,
                        fabricInspectionPassLengthSum:0,
                        fabricInspectionData:[],
                        fabricInspectionResult:{}
                    };

                    tempJson.id = value.id;
                    tempJson.material = value.material;

                    if(value['materialData']){

                        tempJson.color = value['materialData'].color;
                        tempJson.width = value['materialData'].width;
                        tempJson.category = value['materialData'].category;
                        tempJson.spec = value['materialData'].spec;
                        tempJson.materialID = value['materialData'].materialID;
                        tempJson.name = value['materialData'].name;
//                        console.log(tempJson.materialID )
                        query = {query:{color: tempJson.color}};
                        let colorCode =  await findOne(query,ColorCode_1,0,{raw:true});

                        if(colorCode){
                            tempJson.colorCode = colorCode['code'];
                        }

                    }

                    tempJson.purchaseAmount = value.purchaseAmount;
                    if(value['supplierData']){
                        tempJson.supplier = value['supplierData']['name'];
                    }

                    if(value['materialReceivingData'].length > 0){
                        tempJson.materialReceivingData = value['materialReceivingData'];

                        tempJson.materialReceivinglengthSum =  tempJson.materialReceivingData.reduce((a,b)=>{
                            return a + b.length;
                        },0);
                    }
                    //console.log('tempJson.materialReceivingData');
                    //console.log(tempJson.materialReceivingData);

                    if(value['fabricInspectionData'].length > 0){
                        tempJson.fabricInspectionData = value['fabricInspectionData'];
//                        console.log('tempJson.fabricInspectionData');
//                        console.log(tempJson.fabricInspectionData);

                        tempJson.fabricInspectionLengthSum =  tempJson.fabricInspectionData.reduce((a,b)=>{
                            tempJson.fabricInspectionID.push(b.id);
                            tempJson.fabricInspectedDate.push(b.inspectedDate);
                            tempJson.fabricInspectedIDDate.push({id:b.id,date:b.inspectedDate,length:b.length, summary:b.summary, idArray:[],lengthArray:[],rejectLengthArray:[],passLengthArray:[]});

                            if(b.summary === '不合格'){
                                tempJson.fabricInspectionRejectLengthSum += parseFloat(b.length);
                            }else {
                                tempJson.fabricInspectionPassLengthSum +=  parseFloat(b.length);
                            }
                            return  parseFloat(a) + parseFloat(b.length);
                        },0);
//                        console.log('tempJson.fabricInspectedDate');
//                        console.log(tempJson.fabricInspectedDate);

                        let dateOrderTempArray = tempJson.fabricInspectedDate.sort();
//                        console.log('dateOrderTempArray');
//                        console.log(dateOrderTempArray);

//                        console.log('yyyyyyyyyyyyyyyyyyyy')
//                        console.log(tempJson)
//                        console.log('yyyyyyyyyyyyyyyyyyyy')

                        if(dateOrderTempArray.length > 0){
                            tempJson.fabricInspectedStartDate = dateOrderTempArray[0];
                            tempJson.fabricInspectedEndDate = dateOrderTempArray[dateOrderTempArray.length -1];
//                            console.log('1111111111111===>>>')
//                            console.log(tempJson)
                            tempJson.reportName = ` ${tempJson.materialID}-大货报告-${tempJson.fabricInspectedStartDate}`;
//                            console.log('1111111111111===<<<<')
                        }
//                        console.log('tempJson.fabricInspectedIDDate');
//                        console.log(tempJson.fabricInspectedIDDate);

                        if(flag === 2){
//                            let  dateArrayOriginalArray =  mergeSameDay(tempJson.fabricInspectedIDDate);
                            let  dateArrayOriginalArray =  mergeSameDayV2(tempJson.fabricInspectedIDDate);
//                            console.log('dateArrayOriginalArray');
//                            console.log(dateArrayOriginalArray);

                            dateArrayOriginalArray.forEach(value => {
                                let sum = value.lengthArray.reduce((a,b)=>{
                                    return a + b;
                                },0);

                                let rejectLengthSum = value.rejectLengthArray.reduce((a,b)=>{
                                    return a + b;
                                },0);

                                let passLengthSum = value.passLengthArray.reduce((a,b)=>{
                                    return a + b;
                                },0);

                                value.lengthSum = sum;
                                value.rejectLengthSum = rejectLengthSum;
                                value.passLengthSum = passLengthSum;
                            });

//                            console.log('dateArrayOriginalArray22');
//                            console.log(dateArrayOriginalArray);

                            let  dateSegJson =  DateSegmentation(dateArrayOriginalArray);
//                            console.log('dateSegJson');
//                            console.log(dateSegJson);

                            let dateSegArrayTemp =  Object.values(dateSegJson);
//                            console.log('dateSegArrayTemp');
//                            console.log(dateSegArrayTemp);

                            let  idArray = dateSegArrayTemp.map(value1 => {
                                let tempArray = [];

                                for(let x = 0; x < value1.length; x++ ){
                                    tempArray =  tempArray.concat(value1[x].idArray);
                                }

                                return tempArray;
                            });
/*
                            let  lengthArray = dateSegArrayTemp.map(value1 => {
                                let lengthSum = 0;

                                for(let x = 0; x < value1.length; x++ ){
                                    lengthSum += parseFloat(value1[x].lengthArray) ;
                                }

                                return lengthSum;
                            });

                            dateSegArrayTemp.map(value1 => {
                                value1.forEach(value2 => {

                                })
                            });
*/
                            let  dateArrayTemp = dateSegArrayTemp.map(value1 => {
                                let tempArray = [];

                                for(let x = 0; x < value1.length; x++ ){
                                    tempArray.push(value1[x].date);
                                }

                                return tempArray;
                            });
//                            console.log('dateArrayTemp');
//                            console.log(dateArrayTemp);

                            let dateArray = dateArrayTemp.map(value1 => {
                                return [...new Set(value1)];
                            });

                            //console.log('dateArray');
                            //console.log(dateArray);
                            //console.log('idArray');
                            //console.log(idArray);
                            //console.log(lengthArray);
                            //console.log('dateArray.length');
                            //console.log(dateArray.length);

                            let segmentLengthSumArray  = dateArray.map(value => {
                                let segmentLengthSum = {lengthSum:0,rejectLengthSum:0,passLengthSum:0};


                                for (let x = 0; x < value.length; x++){
                                    for(let y = 0; y < dateArrayOriginalArray.length; y++) {
                                        if (value[x] === dateArrayOriginalArray[y].date){
                                            segmentLengthSum.lengthSum += dateArrayOriginalArray[y].lengthSum;
                                            segmentLengthSum.rejectLengthSum += dateArrayOriginalArray[y].rejectLengthSum;
                                            segmentLengthSum.passLengthSum += dateArrayOriginalArray[y].passLengthSum;
                                        }
                                    }
                                }

                                return segmentLengthSum;
                            });
//                            console.log('segmentLengthSumArray');
//                            console.log(segmentLengthSumArray);

                            console.log('dateArray');
                            console.log(dateArray);

                            for(let y = 0; y < dateArray.length; y++){
                                let tempJsonCopy = {};

                                pushElementToObject(tempJsonCopy,tempJson);
                                tempJsonCopy.fabricInspectionLengthSum = segmentLengthSumArray[y].lengthSum;
                                tempJsonCopy.fabricInspectionRejectLengthSum = segmentLengthSumArray[y].rejectLengthSum;
                                tempJsonCopy.fabricInspectionPassLengthSum = segmentLengthSumArray[y].passLengthSum;
                                query = {query:{fabricInspection:{[Op.in]:idArray[y]},length:{[Op.ne]:0}}};

                                let FabricInspectionResultArray =  await findAndCountAll(query,FabricInspectionResult_1,0/*,{group:['fabricInspection']}*/);
//                                console.log('FabricInspectionResultArray44');
//                                console.log(FabricInspectionResultArray);

                                if(FabricInspectionResultArray.length >0){
                                    let  resultArray  = FabricInspectionResultArray.map(value=>{

                                        return value.fabricInspection;
                                    });
                                    //console.log('resultArray');
                                    //console.log(resultArray);

                                    let  resultDistinctArray = [...new Set(resultArray)];
                                    let resultGroupArray = resultDistinctArray.map(value=>{
                                        let tempArray = [];

                                        for(let x of FabricInspectionResultArray){
                                            if(x.fabricInspection === value){
                                                tempArray.push(x)
                                            }
                                        }

                                        return tempArray;
                                    });

                                    let  lengthSum = 0;
                                    let tempResult = resultGroupArray.map(value=>{
                                        let fabricInspectionResultJson = {
                                            valueType:null,
                                            valueTypeCount:null,
                                            valueTypeCountArray:null
                                        };
                                        //fabricInspectionResultJson.fabricInspection = value[0].fabricInspection;

                                        let fabricInspectionResultValueArray = value.map(value=>{
                                            return value.value;
                                        });

                                        let fabricInspectionResultValueAndScoreArray = value.map(value=>{
                                            let score = 1*value.score1Value + 2*value.score2Value + 3*value.score3Value + 4*value.score4Value;
                                            return {value:value.value,score:score};
                                        });
//                                        console.log('fabricInspectionResultValueAndScoreArray')
//                                        console.log(JSON.stringify(fabricInspectionResultValueAndScoreArray) )

                                        let fabricInspectionResultValueTypeArray = [...new Set(fabricInspectionResultValueArray)];
                                        fabricInspectionResultJson.valueType = [...new Set(fabricInspectionResultValueArray)];

                                        fabricInspectionResultJson.valueTypeCount = fabricInspectionResultJson.valueType.length;
/*
                                        let fabricInspectionResultValueTypeCountArray = fabricInspectionResultValueTypeArray.map(value => {
                                            let typeCount = fabricInspectionResultValueArray.reduce((a,b)=>{
                                                if(b === value){
                                                    a++;
                                                }

                                                return a;
                                            },0);

                                            return {[value]:typeCount}
                                        });
*/
                                        let fabricInspectionResultValueTypeCountArray = fabricInspectionResultValueTypeArray.map(value => {
                                            let typeCount = fabricInspectionResultValueAndScoreArray.reduce((a,b)=>{
                                                if(b.value === value){
                                                    a.count++;
                                                    a.score += b.score;
                                                }

                                                return a;
                                            },{count:0,score:0});

                                            return {[value]:typeCount.count,score:typeCount.score}
                                        });

//                                        console.log('fabricInspectionResultValueTypeCountArray')
//                                        console.log(JSON.stringify(fabricInspectionResultValueTypeCountArray) )

                                        fabricInspectionResultJson.valueTypeCountArray = getKeyValueFromAJsonV2Array(fabricInspectionResultValueTypeCountArray);

                                        return fabricInspectionResultJson;
                                    });
                                    //console.log("00000000000000000000000");
                                    //console.log(tempResult);

                                    let valueType = tempResult.reduce((a,b)=>{
                                        return a.concat(b.valueType);
                                    },[]);
                                    //console.log(valueType);

                                    valueType = [...new Set(valueType)];
                                    //console.log('999999999999999999999999999999999');
                                    //console.log(valueType);

                                    let total = valueType.map(value => {
                                        let tempJson = {
                                            [value]:0,
                                            score:0
                                        };
                                        for(let x = 0; x < tempResult.length; x++){
                                            for (let y = 0; y < tempResult[x].valueTypeCountArray.length; y++){
                                                if (tempResult[x].valueTypeCountArray[y].key === value) {
                                                    tempJson[value] += tempResult[x].valueTypeCountArray[y].value;
                                                    tempJson.score += tempResult[x].valueTypeCountArray[y].score;
                                                }
                                            }
                                        }

                                        return tempJson;
                                    });

                                    total.sort(function (a,b) {
                                        if(Object.values(a)[0] > Object.values(b)[0])
                                            return false;
                                        else
                                            return true;
                                    });
//                                    console.log('total222222')
//                                    console.log(total)


                                    let totalFinal=  getKeyValueFromAJsonV2Array(total);
                                    let rejectLengthSum = totalFinal.reduce((a,b)=>{
                                        return  a + b.value;
                                    },0);


//                                    console.log('totalFinal')
//                                    console.log(totalFinal)
                                    //tempJsonCopy.fabricInspectionResult = tempResult;
                                    tempJsonCopy.fabricInspectionResult = {rejectLengthSum:rejectLengthSum, total: totalFinal , detail: tempResult};
                                    tempJsonCopy.fabricInspectedStartDate = dateArray[y][0];
                                    let endDate = [...new Set(dateArray[y])];
                                    tempJsonCopy.fabricInspectedEndDate =  endDate[endDate.length -1];
//                                    console.log('22222222222===>>>')
//                                    console.log(tempJsonCopy.reportName)
                                    tempJsonCopy.reportName = `${tempJsonCopy.materialID}-大货报告-${tempJsonCopy.fabricInspectedStartDate}`;
//                                    console.log('22222222222===<<<<')
                                    //console.log('fabricInspectionResult11111111111111111111');
                                    //console.log(tempJsonCopy.fabricInspectionResult);
                                    //console.log('tempJsonArray[y]ooooooo');
                                    //console.log(tempJsonCopy);

                                    delete tempJsonCopy.id;
                                    delete tempJsonCopy.fabricInspectedIDDate;
                                    delete tempJsonCopy.fabricInspectionID;
                                    delete tempJsonCopy.fabricInspectionData;
                                    delete tempJsonCopy.materialReceivingData;
                                    delete tempJsonCopy.fabricInspectedDate;
                                    console.log('tempJsonCopy')
                                    console.log(tempJsonCopy)

                                    reportJson.materialArray.push(tempJsonCopy);
                                }
                                else{
                                    tempJsonCopy.fabricInspectionLengthSum = segmentLengthSumArray[y].lengthSum;
                                    tempJsonCopy.fabricInspectionRejectLengthSum = segmentLengthSumArray[y].rejectLengthSum;
                                    tempJsonCopy.fabricInspectionPassLengthSum = segmentLengthSumArray[y].passLengthSum;
                                    //console.log('dateArray[y][0]');
                                    //console.log(dateArray[y][0]);
                                    tempJsonCopy.fabricInspectedStartDate = dateArray[y][0];
                                    let endDate = [...new Set(dateArray[y])];
                                    tempJsonCopy.fabricInspectedEndDate =  endDate[endDate.length -1];
//                                    console.log('33333333333333====>>>')
//                                    console.log(tempJsonCopy.reportName)
                                    tempJsonCopy.reportName = `${tempJsonCopy.materialID}-大货报告-${tempJsonCopy.fabricInspectedStartDate}`;
//                                    console.log('33333333333333====<<<<<')
//                                    console.log('tempJsonCopy4444');
//                                    console.log(tempJsonCopy);

                                    delete tempJsonCopy.id;
                                    delete tempJsonCopy.fabricInspectedIDDate;
                                    delete tempJsonCopy.fabricInspectionID;
                                    delete tempJsonCopy.fabricInspectionData;
                                    delete tempJsonCopy.materialReceivingData;
                                    delete tempJsonCopy.fabricInspectedDate;

                                    reportJson.materialArray.push(tempJsonCopy);
                                }
                            }
                        }

                        else if(flag === 1 || flag === 0){
                            let fabricInspectionID = [];

                            if(flag === 1){
//                                console.log('fabricInspectedIDDate999999999');
//                                console.log(tempJson.fabricInspectedIDDate);
                                let flag1LengthSum = 0;
                                let flag1RejectLengthSum = 0;
                                let flag1PassLengthSum = 0
                                if(dateEnd && dateStart){
                                    let dateCollection = tempJson.fabricInspectedIDDate.filter(value1 => {
                                        if(value1.date >= dateStart && value1.date <= dateEnd){
                                            return true;
                                        }
                                    });

                                    let dateSet = dateCollection.map(value1 => {
                                        return value1.date;
                                    });

                                    dateSet = [...new Set(dateSet)].sort((a,b)=>{
                                        return a > b;
                                    })

                                    tempJson.fabricInspectedStartDate = dateSet[dateSet.length-dateSet.length];
                                    tempJson.fabricInspectedEndDate =  dateSet[dateSet.length-1];;

                                    tempJson.reportName = ` ${tempJson.materialID}-大货报告-${tempJson.fabricInspectedStartDate}`;
                                }



                                for(let x = 0; x< tempJson.fabricInspectedIDDate.length;x++){
                                    if(dateEnd && dateStart){
                                        if (tempJson.fabricInspectedIDDate[x].date <= dateEnd && tempJson.fabricInspectedIDDate[x].date >= dateStart){
                                            fabricInspectionID.push(tempJson.fabricInspectedIDDate[x].id);
                                            flag1LengthSum += parseFloat(tempJson.fabricInspectedIDDate[x].length) ;
                                            if(tempJson.fabricInspectedIDDate[x].summary === '不合格'){
                                                flag1RejectLengthSum +=  parseFloat(tempJson.fabricInspectedIDDate[x].length) ;
                                            }else{
                                                flag1PassLengthSum +=  parseFloat(tempJson.fabricInspectedIDDate[x].length) ;
                                            }

                                        }
                                    }else{
                                        fabricInspectionID.push(tempJson.fabricInspectedIDDate[x].id);
                                    }
                                }

                                tempJson.fabricInspectionRejectLengthSum = flag1RejectLengthSum;
                                tempJson.fabricInspectionLengthSum = flag1LengthSum;
                                tempJson.fabricInspectionPassLengthSum = flag1PassLengthSum;
                                //console.log('fabricInspectionID999999');
                                //console.log(fabricInspectionID);
                            }else{
                                fabricInspectionID = tempJson.fabricInspectionID;
                            }

                            query = {query:{fabricInspection:{[Op.in]:fabricInspectionID},length:{[Op.ne]:0}}};
                            let FabricInspectionResultArray =  await findAndCountAll(query,FabricInspectionResult_1,0);
//                            console.log('FabricInspectionResultArray11111111111');
//                            console.log(FabricInspectionResultArray);

                            if(FabricInspectionResultArray.length >0){
                                let  resultArray  = FabricInspectionResultArray.map(value=>{

                                    return value.fabricInspection;
                                });
//                                console.log('resultArray');
//                                console.log(resultArray);

                                let  resultDistinctArray = [...new Set(resultArray)];
                                let resultGroupArray = resultDistinctArray.map(value=>{
                                    let tempArray = [];

                                    for(let x of FabricInspectionResultArray){
                                        if(x.fabricInspection === value){
                                            tempArray.push(x)
                                        }
                                    }

                                    return tempArray;
                                });
//                                console.log('resultGroupArray');
//                                console.log(resultGroupArray);

                                let lengthSum = 0;
                                let tempResult = resultGroupArray.map(value=>{
                                    //console.log(value);
                                    let fabricInspectionResultJson = {
                                        //fabricInspection:null,
                                        valueType:null,
                                        valueTypeCount:null,
                                        valueTypeCountArray:null
                                    };
                                    //fabricInspectionResultJson.fabricInspection = value[0].fabricInspection;


                                    let fabricInspectionResultValueArray = value.map(value=>{
                                        return value.value;
                                    });

                                    let fabricInspectionResultValueAndScoreArray = value.map(value=>{
                                        let score = 1*value.score1Value + 2*value.score2Value + 3*value.score3Value + 4*value.score4Value;
                                        return {value:value.value,score:score};
                                    });
//                                    console.log('fabricInspectionResultValueAndScoreArray')
//                                    console.log(JSON.stringify(fabricInspectionResultValueAndScoreArray) )

                                    let fabricInspectionResultValueTypeArray = [...new Set(fabricInspectionResultValueArray)];
                                    fabricInspectionResultJson.valueType = [...new Set(fabricInspectionResultValueArray)];

                                    fabricInspectionResultJson.valueTypeCount = fabricInspectionResultJson.valueType.length;
/*
                                    let fabricInspectionResultValueTypeCountArray = fabricInspectionResultValueTypeArray.map(value => {
                                        let typeCount = fabricInspectionResultValueArray.reduce((a,b)=>{
                                            if(b === value){
                                                a++;
                                            }

                                            return a;
                                        },0);

                                        return {[value]:typeCount}
                                    });
*/
                                    let fabricInspectionResultValueTypeCountArray = fabricInspectionResultValueTypeArray.map(value => {
                                        let typeCount = fabricInspectionResultValueAndScoreArray.reduce((a,b)=>{
                                            if(b.value === value){
                                                a.count++;
                                                a.score += b.score;
                                            }

                                            return a;
                                        },{count:0,score:0});

                                        return {[value]:typeCount.count,score:typeCount.score}
                                    });

//                                    console.log('fabricInspectionResultValueTypeCountArray')
//                                    console.log(JSON.stringify(fabricInspectionResultValueTypeCountArray) )

                                    fabricInspectionResultJson.valueTypeCountArray = getKeyValueFromAJsonV2Array(fabricInspectionResultValueTypeCountArray);

                                    return fabricInspectionResultJson;
                                });
//                                console.log('tempResult6666666666');
//                                console.log(JSON.stringify(tempResult) );

                                let valueType = tempResult.reduce((a,b)=>{
                                    return a.concat(b.valueType);
                                },[]);
                                //console.log(valueType);

                                valueType = [...new Set(valueType)];
                                console.log(valueType)

                                let total = valueType.map(value => {
                                    let tempJson = {
                                        [value]:0,
                                        score:0
                                    };

                                    for(let x = 0; x < tempResult.length; x++){
                                        for (let y = 0; y < tempResult[x].valueTypeCountArray.length; y++){
                                            if (tempResult[x].valueTypeCountArray[y].key === value) {
                                                tempJson[value] += tempResult[x].valueTypeCountArray[y].value;
                                                tempJson.score += tempResult[x].valueTypeCountArray[y].score;
                                            }
                                        }
                                    }

                                    return tempJson;
                                });

                                total.sort(function (a,b) {
                                    if(Object.values(a)[0] > Object.values(b)[0])
                                        return false;
                                    else
                                        return true;
                                });

                                let totalFinal=  getKeyValueFromAJsonV2Array(total);
                                let rejectLengthSum = totalFinal.reduce((a,b)=>{
                                    return  a + b.value;
                                },0);

                                tempJson.fabricInspectionResult = {rejectLengthSum:rejectLengthSum,total: totalFinal,detail: tempResult};
                                //console.log(tempJson.fabricInspectionResult);

                                delete tempJson.id;
                                delete tempJson.fabricInspectedIDDate;
                                delete tempJson.fabricInspectionID;
                                delete tempJson.fabricInspectionData;
                                delete tempJson.materialReceivingData;
                                delete tempJson.fabricInspectedDate;
                                reportJson.materialArray.push(tempJson);
                            }else{

                                tempJson.reportName = `${tempJson.materialID}-大货报告-${tempJson.fabricInspectedStartDate}`;
                                delete tempJson.id;
                                delete tempJson.fabricInspectedIDDate;
                                delete tempJson.fabricInspectionID;
                                delete tempJson.fabricInspectionData;
                                delete tempJson.materialReceivingData;
                                delete tempJson.fabricInspectedDate;

                                reportJson.materialArray.push(tempJson);
                            }
                        }
                    }
                }
            }
            //console.log(reportJson);

            resp.records.push(reportJson);

            ctx.body = resp;
            ctx.status = 200;
            ctx.respond = true;
        }
    });
};
