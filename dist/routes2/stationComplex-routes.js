"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Station_1 = require("../database/models/Station");
const dbquery_1 = require("../database/dbquery");
const PrecedingTeamScheduling_1 = require("../database/models/PrecedingTeamScheduling");
const FollowingTeamScheduling_1 = require("../database/models/FollowingTeamScheduling");
const StyleProcess_1 = require("../database/models/StyleProcess");
const QualityInspectionResult_1 = require("../database/models/QualityInspectionResult");
const SewingTeamScheduling_1 = require("../database/models/SewingTeamScheduling");
const CropCard_1 = require("../database/models/CropCard");
const Crop_1 = require("../database/models/Crop");
const Order_1 = require("../database/models/Order");
const MemberOutput_1 = require("../database/models/MemberOutput");
const QualityInspection_1 = require("../database/models/QualityInspection");
const PrecedingTeamOutput_1 = require("../database/models/PrecedingTeamOutput");
const FollowingTeamOutput_1 = require("../database/models/FollowingTeamOutput");
const SewingTeamOutput_1 = require("../database/models/SewingTeamOutput");
const RFID_1 = require("../database/models/RFID");
const ProductionScheduling_1 = require("../database/models/ProductionScheduling");
const ProcessStation_1 = require("../database/models/ProcessStation");
const OrderDeliveryPlan_1 = require("../database/models/OrderDeliveryPlan");
const Equipment_1 = require("../database/models/Equipment");
const PartCard_1 = require("../database/models/PartCard");
const ProcessPartCard_1 = require("../database/models/ProcessPartCard");
const ProductionLine_1 = require("../database/models/ProductionLine");
const Process_1 = require("../database/models/Process");
const Team_1 = require("../database/models/Team");
const UserAccount_1 = require("../database/models/UserAccount");
const MemberOutputProcess_1 = require("../database/models/MemberOutputProcess");
const Style_1 = require("../database/models/Style");
const StylePartCard_1 = require("../database/models/StylePartCard");

const sequelize = require("sequelize");
const Op = sequelize.Op;
// export const accRouter = new KoaRouter();

function pushElementToObject (d,o){
    if(typeof(o)=='object') for(var p in o) {d[p]=o[p]}
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

function getArrDifference(arr1, arr2) {

    return arr1.concat(arr2).filter(function (v, i, arr) {
        return arr.indexOf(v) === arr.lastIndexOf(v);
    });
}

function calculateProcess(process){
    let tempArray = [];
    let resultArray = [];
    let processJson ={
        process:[]
    };

    process.forEach(value => {
        //         //console.log(value1.styleProcess.processData)
        tempArray=  tempArray.concat(value.styleProcess.processData)
    });
    processJson.process = tempArray;
    resultArray.push(processJson);

    let sumArray =resultArray.map((value,index) => {
        let sum = value.process.reduce((a,b)=>{
            return parseFloat(a) + parseFloat(b.workingPrice);
        },0);

        return {sum:sum,processCount:value.process.length};
    });

    return sumArray;
}

function findAllProcessesFormTree(listArray) {

    let totalProcessesArray = [];
    for(let item of listArray){
        //console.log(item.list);
        let oneListProcessesArray = item.list.reduce((a,b) => {
            a.push(b.process);
            return a;
        },[]);
        totalProcessesArray = totalProcessesArray.concat(oneListProcessesArray)
    }
    totalProcessesArray = [...new Set(totalProcessesArray)];

    return totalProcessesArray;
}

let precessIsLastedOne = async function(listArray,bundleNumber){

    let IsLasted = false;
    let processList = findAllProcessesFormTree(listArray);
    let memberOutputProcessQuery = {query:{bundleNumber:bundleNumber}};
    let memberOutputProcessArray = await findAndCount(memberOutputProcessQuery,MemberOutputProcess_1,0,{},{process:{[Op.in]:processList}});

    if(processList.length !== memberOutputProcessArray.length){
        IsLasted = false;
    }else{
        IsLasted = true;
    }

    return IsLasted;
};

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

function findOneProcessByID(processID,listArray) {

    let findone = false;

    for(let item of listArray){
        findone = item.list.find(value1 => {
            if (value1.process === processID) {
                return true;
            }
        });
        if(findone){
            break;
        }
    }

    return findone;
}

function sortProcessByPartLength(processArray,listArray) {
    let ProcessPartLengthArray = processArray.map(value => {
        let oneProcess = findOneProcessByID(value,listArray);
        return {process:oneProcess.process,length:oneProcess.length};
    });

    return ProcessPartLengthArray.sort((a,b)=>{
        return a.length - b.length;
    }).map(value=>{
        return value.process;
    });
}

function findProcessListByID(processID,listArray) {

    let findone = false;
    let processList = [];
    let position = [];

    for(let item of listArray){
        findone = item.list.findIndex(value1 => {
            if (value1.process === processID) {
                return true;
            }
        });
        if(findone !== -1){
            position = item.list.slice(0,findone+1);
            break;
        }
    }
    if(findone){
        processList = position.map(value => {
            return value.process
        });

        //console.log('processList');
        //console.log(processList)
    }

    return processList;
}

function findTheRootByID(processID,listArray) {

    let findOneIndex = -1;
    let findOneElement = null;
    let root = [];
    let position = [];

    for(let item of listArray){
        findOneIndex = item.list.findIndex(value1 => {
            if (value1.process === processID) {
                return true;
            }
        });
        if(findOneIndex !== -1){
            findOneElement = item.list[findOneIndex];
            position = item.list.slice(0,findOneIndex+1);
            break;
        }
    }
    if(findOneIndex !== -1){
        root = position.filter(value => {
            if(value.length === findOneElement.length && value.preProcess.length > 1){
                return true;
            }
        });
    }

    return root[0];
}

function findProcessListForSpecificPartByID(processID,listArray) {

    let findOneIndex = -1;
    let findOneElement = null;
    let processList = [];
    let position = [];

    for(let item of listArray){
        findOneIndex = item.list.findIndex(value1 => {
            if (value1.process === processID) {
                return true;
            }
        });
        if(findOneIndex !== -1){
            findOneElement = item.list[findOneIndex];
            position = item.list.slice(0,findOneIndex+1);
            break;
        }
    }
    if(findOneIndex !== -1){
        processList = position.filter(value => {
            if (value.length === findOneElement.length) {
                return true;
            }
        });

        processList =  processList.map(value=>{
            return value.process;
        })
//        //console.log('processList');
//        //console.log(processList)
    }

    return processList;
}


let findStationInfo = async function (order,station){

    let stationIDArray = [];
    let nextStation = null;
    let curStation = station;
    let stationQuery;
    let stationOne;
    let processStationQuery;
    let processStationArray;

    let stationQuery1 = {query:{id:station}};
    let stationOne1 = await findOne(stationQuery1,Station_1,1,{raw:true});

    let stationRecordsToAPI ={
        id:null,
        currentStation:'null',
        preStation:'null',
        nextStation:'null'
    };

    if(stationOne1){
        let temp = {
            id:stationOne1.id,
            stationID:stationOne1.stationID
        };
        stationIDArray.push(temp);

        stationRecordsToAPI.id = stationOne1.id;
        stationRecordsToAPI.currentStation = stationOne1.stationID;
        if(stationOne1['nextStationData.id']){
            nextStation = stationOne1['nextStationData.id'];
        }else{
            //nextStation = null
        }
    }

    while(1){

        stationQuery = {query:{id:nextStation}};
        stationOne = await findOne(stationQuery,Station_1,1,{raw:true});
        if(stationOne){

            processStationQuery = {query:{order:order,station:nextStation}};
            processStationArray = await findAndCount(processStationQuery,ProcessStation_1,0);
            if(processStationArray.length > 0){
                let stationJson1 = {
                    id:null,
                    stationID:null
                };
                stationJson1.id = stationOne.id;
                stationJson1.stationID = stationOne.stationID;
                stationRecordsToAPI.nextStation = stationOne.stationID;
                stationIDArray.push(stationJson1);
                break;
            }else{
                if(stationOne['nextStationData.id']){
                    nextStation = stationOne['nextStationData.id'];
                }

            }

        }else{
            break;
        }



    }
    //console.log('stationIDArray');
    //console.log(stationIDArray);

    while(1){
        stationQuery = {query:{nextStation:curStation}};
        stationOne = await findOne(stationQuery,Station_1,0,{raw:true});
        if(stationOne){

            processStationQuery = {query:{order:order,station:stationOne.id}};
            processStationArray = await findAndCount(processStationQuery,ProcessStation_1,0);
            if(processStationArray.length > 0){
                let stationJson1 = {
                    id:null,
                    stationID:null
                };
                stationJson1.id = stationOne.id;
                stationJson1.stationID = stationOne.stationID;
                stationRecordsToAPI.preStation = stationOne.stationID;
                stationIDArray.unshift(stationJson1);
                break;
            }else{
                curStation = stationOne.id;
            }

        }else{
            break;
        }
    }

    return stationRecordsToAPI;

};

let pieceRateValidate = async function (listArray,processID,bundleNumber,part){

    let result = false;
    let findoneElement = false;

    for(let item of listArray){
        findoneElement = item.list.find(value1 => {
            if (value1.process === processID) {
                return true;
            }
        });
        if(findoneElement){
            break;
        }
    }

    if(findoneElement){
        if(!findoneElement.part.includes(part)){
            //         return false;
            result = false;
        }else{

            if(findoneElement.length === 1){
                result = true
                //    return true;
            }else{
                let root = findTheRootByID(findoneElement.process,listArray);
                //console.log(root);
                let multiplePreprocessResult = [true];
                for(let m of root.preProcess){
                    //console.log('=============>>>>');
                    //console.log(m);
                    let list = findProcessListForSpecificPartByID(m,listArray);
                    //                  //console.log(list)
                    let memberOutputProcessQuery = {query:{bundleNumber:bundleNumber}};
                    let memberOutputProcessArray = await findAndCount(memberOutputProcessQuery,MemberOutputProcess_1,0,{},{process:{[Op.in]:list}});

                    if(list.length !== memberOutputProcessArray.length){
                        multiplePreprocessResult.push(false);
                    }else{
                        multiplePreprocessResult.push(true);
                    }
                }

                result =  multiplePreprocessResult.reduce((a,b)=>{
                    return (a && b)
                });
            }
        }
    }

    return result;
};

let pieceRateValidateNoPart = async function (listArray,processID,bundleNumber){

    let result = false;
    let findoneElement = false;

    for(let item of listArray){
        findoneElement = item.list.find(value1 => {
            if (value1.process === processID) {
                return true;
            }
        });
        if(findoneElement){
            break;
        }
    }

    if(findoneElement){

        if(findoneElement.length === 1){
            result = true
            //    return true;
        }else{

            let root = findTheRootByID(findoneElement.process,listArray);
            //console.log(root);
            let multiplePreprocessResult = [true];
            for(let m of root.preProcess){
                //console.log('=============>>>>');
                //console.log(m);
                let list = findProcessListForSpecificPartByID(m,listArray);
                //                  //console.log(list)
                let memberOutputProcessQuery = {query:{bundleNumber:bundleNumber}};
                let memberOutputProcessArray = await findAndCount(memberOutputProcessQuery,MemberOutputProcess_1,0,{},{process:{[Op.in]:list}});

                if(list.length !== memberOutputProcessArray.length){
                    multiplePreprocessResult.push(false);
                }else{
                    multiplePreprocessResult.push(true);
                }
            }

            result =  multiplePreprocessResult.reduce((a,b)=>{
                return (a && b)
            });
        }
    }

    return result;
};

function findOneByLevel (finalResult,level){
    let findOneLevel = finalResult.rawTree.find(value => {

        if (value.level === level){
            return true;
        }
    });

    return findOneLevel;
}

let generateProcessTree = async function (styleID){
    let res = [];
    let styleQuery = {query:{styleID:styleID}};
    let styleArray =  await findAndCount(styleQuery,Style_1,0);

    //console.log(styleArray);

    if(styleArray.length >0){
        let styleProcessQuery = {query:{style:styleArray[0].styleID}};
        let styleProcessArray =  await findAndCount(styleProcessQuery,StyleProcess_1,0);
        //console.log('styleProcessArray');
        //console.log(styleProcessArray);

        if(styleProcessArray.length > 0){
            let processIDArray = styleProcessArray.map(value=>{
                return value.process
            });
//                //console.log('processIDArray');
//                //console.log(processIDArray);

            let processQuery = {query:{type:"车缝"}};
            let processArray =  await findAndCount(processQuery,Process_1,0,{order:['id'],group: ['id']},{id:{[Op.in]:processIDArray}});
//                    //console.log('processArray');
//                    //console.log(processArray);
//                  let processCollection= [];
//                  let partCollection = [];
//                  let lengthCollection = [];
            if(processArray.length > 0){

                let sewingProcessIDArray = processArray.map(value=>{
                    return value.id
                });
                let processPartCardQuery = {query:{}};
                let processPartCardArray =  await findAndCount(processPartCardQuery,ProcessPartCard_1,1,{order:['process']},{process:{[Op.in]:sewingProcessIDArray}});
//                        //console.log('processPartCardArray');
//                        //console.log(processPartCardArray);

                if(processPartCardArray.length > 0){

                    let processCollection =  processPartCardArray.map(value=>{

                        value.processID = value.ProcessData.processID;
                        value.type = value.ProcessData.type;
                        value.name = value.ProcessData.name;

                        if(value.partCardData){
                            if(value.partCardData.part === null){
                                throw new Error(`partCard id: ${value.partCard} part 为空`);
                            }
                            value.part = [];
                            value.partID = [];
                            value.part.push(value.partCardData.part);
                            value.partID.push(value.partCardData.id);
                            delete value.partCardData;
                        }else{
                            throw new Error(`ProcessPartCard id：${value.id} 没有相关联的partCard id: ${value.partCard}`);
                        }
                        delete value.id;
                        delete value.partCard;
                        delete value.ProcessData;
                        return value;
                    });

//                            //console.log('processCollection');
//                            //console.log(processCollection);
                    //Step1  相同process, 合并 part,partID

                    let processRepeatTypeArray = processCollection.map(value=>{
                        return value.process;

                    });

                    let processTypeArray = [...new Set(processRepeatTypeArray)].sort();
//                            //console.log('processTypeArray');
//                            //console.log(processTypeArray);

                    let processPartMergeArray = processTypeArray.map(value => {

                        let sameProcessArray = processCollection.filter(value1=>{
                            if(value1.process === value){
                                return true;
                            }
                        });

                        if(sameProcessArray.length === 1){
                            sameProcessArray[0].length = sameProcessArray[0].part.length;
                            return sameProcessArray[0];
                        }else{
                            let sameProcess =  sameProcessArray.reduce((a,b)=>{
                                a.part = a.part.concat(b.part);
                                a.partID = a.partID.concat(b.partID);
                                return a;
                            });

                            let partDuplicateRemoval =  [...new Set(sameProcess.part)];
                            sameProcess.part = partDuplicateRemoval.sort((a,b)=>{
                                return a > b;
                            });

                            let partIDDuplicateRemoval =  [...new Set(sameProcess.partID)];
                            sameProcess.partID = partIDDuplicateRemoval.sort((a,b)=>{
                                return a-b;
                            });

                            sameProcess.length = sameProcess.part.length;
                            return sameProcess;
                        }
                    });
//                            //console.log('processPartMergeArray');
//                            //console.log(processPartMergeArray);

                    let levelRepeatTypeArray = processPartMergeArray.map(value => {

                        return value.length
                    });

                    let levelTypeArray = [...new Set(levelRepeatTypeArray)].sort();
//                            //console.log('levelTypeArray');
//                            //console.log(levelTypeArray);

                    if(!levelTypeArray.includes(1)){
                        throw new Error(`没有单部件的工序！`);
                    }

                    let partRepeatTypeArray = processCollection.map(value=>{
                        return value.part[0];
                    });

                    let partTypeArray = [...new Set(partRepeatTypeArray)];
//                            //console.log('partTypeArray');
//                            //console.log(partTypeArray);
//                            let partIDRepeatTypeArray = processCollection.map(value=>{
//                                return value.partID[0];
//                            });
//                            let partIDTypeArray = [...new Set(partIDRepeatTypeArray)];
//                            //console.log('partIDTypeArray');
//                            //console.log(partIDTypeArray);

                    let classifyProcessByLevel = levelTypeArray.map(value => {
                        let oneLevelArray = processPartMergeArray.filter(value1 => {
                            if(value1.length === value){
                                return true;
                            }
                        }) ;

                        let branchJson = {part:[],node:[]};
//                                //console.log('oneLevelArray');
//                                //console.log(oneLevelArray);

                        let oneLevelRepeatPartIDArray = oneLevelArray.reduce((a,b)=>{
                            a.push(b.partID);
                            return a;
                        },[]);

                        //数组元素是数组的转化成sting,元素进行大小比较
                        let oneLevelRepeatPartIDStringArray = oneLevelRepeatPartIDArray.map(value=>{
                            return value.toString()
                        });

                        let oneLevelPartIDArray = [...new Set(oneLevelRepeatPartIDStringArray)];
//                                //console.log('oneLevelPartIDArray');
//                                //console.log(oneLevelPartIDArray);

                        let node = oneLevelPartIDArray.map(value1 => {

                            let oneLevelBySamePart = oneLevelArray.filter(value2 => {
                                if(value2.partID.toString() === value1){
                                    return true;
                                }
                            });
                            oneLevelBySamePart.sort((a,b)=>{
//                                return a.processID - b.processID;
                                return parseInt(a.processID)  - parseInt(b.processID) ;
                            });

                            return oneLevelBySamePart
                        });
//                                //console.log('node');
//                                //console.log(node);

                        //恢复数组
                        let PartIDStringArray = oneLevelPartIDArray.map(value1 => {
                            return value1.split(',')
                        });
//                                //console.log('PartIDStringArray');
//                                //console.log(PartIDStringArray);

                        let PartIDNumberArray = PartIDStringArray.map(value1 => {
                            let result = [];
                            value1.forEach(value2=>{
                                result.push(parseInt(value2));
                            });
                            return result
                        });
//                                //console.log('PartIDNumberArray');
//                                //console.log(PartIDNumberArray);

                        let oneLevelRepeatPartArray = oneLevelArray.reduce((a,b)=>{
                            a.push(b.part);
                            return a;
                        },[]);
//                                //console.log('oneLevelRepeatPartArray');
//                                //console.log(oneLevelRepeatPartArray);

                        //数组元素是数组的转化成sting,元素进行大小比较
                        let oneLevelRepeatPartStringArray = oneLevelRepeatPartArray.map(value=>{
                            return value.toString()
                        });

                        let oneLevelPartArray = [...new Set(oneLevelRepeatPartStringArray)];

                        //恢复数组
                        let PartStringArray = oneLevelPartArray.map(value1 => {
                            return value1.split(',')
                        });

                        let PartNumberArray = PartStringArray.map(value1 => {
                            return value1;
                        });

                        return {level:value , branch:{part:PartNumberArray, partID:PartIDNumberArray, node:node}};
                    });
//                            //console.log('classifyProcessByLevel');
//                            //console.log(classifyProcessByLevel);
                    let levelCollection = classifyProcessByLevel.map(value => {
                        return value.level
                    });

                    levelCollection.sort((a,b)=>{
                        return a-b;
                    });
//                            //console.log('levelCollection');
//                            //console.log(levelCollection);

                    let finalResult =  {level:levelCollection, rawTree:classifyProcessByLevel};
                    let levelArray = finalResult.level;

                    for(let x of levelArray){

                        let findOne = findOneByLevel (finalResult,x);
//                                //console.log('findOne===============');

                        for(let item of findOne.branch.node) {
                            item.reduce((a, b) => {
                                a.nextProcess = [];
                                a.preProcess = [];
                                b.nextProcess = [];
                                b.preProcess = [];
                                return b;
                            });
                        }

                        for(let item of findOne.branch.node) {
                            item.reduce((a, b) => {
                                a.nextProcess.push(b.process);
                                b.preProcess.push(a.process);
                                return b;
                            });

                            item[item.length - item.length].preProcess = [];
                            item[item.length - 1].nextProcess = [];
                        }
                    }

                    let findOne = findOneByLevel (finalResult,1);
                    let listArray = [];

                    for(let item of findOne.branch.node) {

                        let partType = item[item.length - item.length].part;
                        let partID = item[item.length - item.length].partID;
//                                //console.log('partType');
//                                //console.log(partType);

                        let partList = {
                            part:partType,
                            list : item
                        };

                        let levelCropArray =levelArray.slice(1);

                        if(levelCropArray.length < 1){
                            listArray.push(partList);
                            continue
                        }
//                                //console.log('levelCropArray');
//                                //console.log(levelCropArray);
//                                //console.log('levelCropArray');
//                                //console.log(levelCropArray);

                        let totalArray =  levelCropArray.map((value,index) => {
                            let findSecondOne = findOneByLevel (finalResult,value);

                            if(findSecondOne){

                                let secondPart = findSecondOne.branch.part;
                                let secondPartID = findSecondOne.branch.partID;
                                let secondNode = findSecondOne.branch.node;
                                for(let z = 0; z < secondPart.length; z++){
                                    let flag =secondPartID[z].includes(partID[0]);
                                    if(flag){
                                        let secondArray = secondNode[z];
                                        let exit = partList.list[partList.list.length-1].nextProcess.includes(secondArray[secondArray.length - secondArray.length].process);

                                        if(!exit){
                                            partList.list[partList.list.length-1].nextProcess.push(secondArray[secondArray.length - secondArray.length].process);
                                        }

                                        exit = secondArray[secondArray.length - secondArray.length].preProcess.includes(partList.list[partList.list.length-1].process);
                                        if(!exit){
                                            secondArray[secondArray.length - secondArray.length].preProcess.push(partList.list[partList.list.length-1].process);
                                        }
                                        partList.list = partList.list.concat(secondArray);

                                        break;
                                    }
                                }
                                if(index === levelCropArray.length-1){
                                    return partList;
                                }else{
                                    return {};
                                }
                            }
                        });
//                                //console.log('totalArray');
//                                //console.log(totalArray);

                        listArray.push(totalArray[totalArray.length-1])
                    }

                    listArray.sort((a,b)=>{
                        return b.list.length - a.list.length;
                    });

                    res = listArray;
                }
            }
            else{
                throw new Error( `${styleID} 对应的process无数据`);
            }
        }else{
            throw new Error( `StyleProcess无数据`);
        }
    }
    else{
        throw new Error( `不存在style ${styleID}`);
    }
//    //console.log(JSON.stringify(res));
    return res;
};

exports.registerStationComplexAPI = function (stationComplexRouter) {
    /**
     * @api {post} /stationComplex/search [工位]-查詢
     * @apiDescription 查詢符合條件的工位信息，並將結果分頁回傳
     * @apiGroup Complex
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number=0} [pageIndex] 頁碼
     * @apiParam {Number=100} [maxRows] 每一頁的最大筆數
     * @apiParam {Object} [query] 查詢條件。可以指定欄位等於某個值。
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/stationComplex/search
     * Body:
     * {
     *   "query": {
     *      "operator": 6,
     *      "macAddress":"0092FA11C6F8",
     *      "rfid":"1956435652"
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
     *           {
     *       "rfidFlag": true,
     *       "operator": 6,
     *       "username": "韩立珍",
     *       "employeeID": "",
     *       "status": 0,
     *       "returnCard": 0,
     *       "category": "车缝",
     *       "stationID": "CF0501",
     *       "station": {
     *           "id": 9,
     *           "currentStation": "CF0501",
     *           "preStation": "null",
     *           "nextStation": "null"
     *       },
     *       "factory": 2,
     *       "team": 1,
     *       "problem": [],
     *       "process": [],
     *       "amount": {},
     *       "productionSchedulingID": null,
     *       "productionScheduling": [],
     *       "colorCode": null,
     *       "orderID": null,
     *       "style": null,
     *       "deliveryDate": null,
     *       "productName": null,
     *       "productCategory": null,
     *       "pay": null,
     *       "rfidAmount": null
     *   }
     *   ]
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    stationComplexRouter.post('/stationComplex/search', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:63', 400);
        }
        else {

            let recordJson = {
                rfidFlag:false,
                operator:null,
                username:null,
                employeeID:null,
                status:0,
                returnCard:0,
                category:null,
                stationID:null,
                station:{},
                factory:null,
                team:null,
                problem:[],
                process:[],
                amount:{},
                productionSchedulingID:null,
                productionScheduling:[],
//                productionScheduling:{},
                colorCode:null,
                orderID:null,
                style:null,
                deliveryDate:null,
                productName:null,
                productCategory:null,
                pay:0,
                rfidAmount:0,
                processAmount:0
            };
            let resp = dbquery_1.queryResponsePacket(ctx.request.body);
            let query = ctx.request.body.query;

            try {
                let currentData = (new Date()).toISOString().slice(0,10);
                let nowDate = new Date(new Date().getTime() + 28800000).toISOString();
                let userQuery = {query:{id:query.operator}};
                let operatorOne = await findOne(userQuery,UserAccount_1,0,{raw:true});
                //console.log('operatorOne');
                //console.log(operatorOne);

                if(operatorOne){
                    recordJson.operator = operatorOne.id;
                    recordJson.username = operatorOne.chineseName;
                    recordJson.employeeID = operatorOne.employeeID;
                }

                let inspectedTime = { [sequelize.Op.and]: [{ [sequelize.Op.gte]: (new Date()).toISOString().slice(0, 11) + '00:00:00.000Z' }, { [sequelize.Op.lte]: (new Date()).toISOString().slice(0, 11) + '23:59:59.000Z' }] };
                let qualityInspectionQuery = {query:{worker:query.operator,inspectedTime:inspectedTime}};
                let qualityInspectionArray =  await findAndCount(qualityInspectionQuery,QualityInspection_1,0);
                //console.log('qualityInspectionArray');
                //console.log(qualityInspectionArray);

                let qualityInspectionIDArray = qualityInspectionArray.map(value=>{
                    return value.id;
                });
                //console.log(qualityInspectionIDArray);

                let qualityInspectionResultQuery = {query:{}};
                let qualityInspectionResultArray =  await findAndCount(qualityInspectionResultQuery,QualityInspectionResult_1,0,{},{qualityInspection:{[sequelize.Op.in]:qualityInspectionIDArray},result:{[sequelize.Op.eq]:0}});
                //console.log('qualityInspectionResultArray');
                //console.log(qualityInspectionResultArray);

                let qualityInspectionResultArrayAPI = qualityInspectionResultArray.map(value=>{
                    let tempJson = {
                        category:null,
                        problem:null
                    };
                    tempJson.category = value.category;
                    tempJson.problem = value.problem;

                    return tempJson;
                });

                recordJson.problem = qualityInspectionResultArrayAPI;
                //console.log('qualityInspectionResultArrayAPI');
                //console.log(qualityInspectionResultArrayAPI);

                let equipmentQuery = {query:{macAddress:query.macAddress}};
                let equipmentOne = await findOne(equipmentQuery,Equipment_1,0,{raw:true});
                //console.log('equipmentOne');
                //console.log(equipmentOne);

                if(equipmentOne){

                    let productionLineQuery = {query:{pad:equipmentOne.id}};
                    let productionLineOne = await findOne(productionLineQuery,ProductionLine_1,1,{raw:true});
                    //console.log('productionLineOne');
                    //console.log(productionLineOne);
                    if(productionLineOne){
                        //console.log('recordJson1111111111111111111111111111')
                        //console.log(recordJson)

                        let stationRecordsToAPI ={
                            id:null,
                            currentStation:'null',
                            preStation:'null',
                            nextStation:'null'
                        };
                        recordJson.team = productionLineOne.team;

                        let teamQuery = {query:{id:recordJson.team}};
                        let teamOne = await findOne(teamQuery,Team_1,0,{raw:true});

                        if(teamOne){
                            recordJson.factory = teamOne.factory;
                            recordJson.category = teamOne.category;
                        }
                        //console.log('recordJson');
                        //console.log(recordJson);

                        let stationQuery = {query:{id:productionLineOne.station}};
                        let stationOne = await findOne(stationQuery,Station_1,0,{raw:true});
                        //console.log('stationOne');
                        //console.log(stationOne);

                        if(stationOne){
                            stationRecordsToAPI.currentStation = stationOne.stationID;
                            stationRecordsToAPI.id = stationOne.id;

                            recordJson.stationID = stationOne.stationID;
                            recordJson.station = stationRecordsToAPI;
                        }

                        let rfid = ctx.request.body.query.rfid || undefined;
                        if(rfid) {
                            //console.log('recordJson');
                            //console.log(recordJson);
                            recordJson.rfidFlag = true;

                            let rfidQuery = {query:{cardNumber: rfid}};
                            let rfidOne = await findOne(rfidQuery, RFID_1, 0, {raw: true});
                            //console.log('rfidOne');
                            //console.log(rfidOne);

                            if (rfidOne) {
                                rfid = rfidOne.id;
                            } else {
                                //console.log("RFID not found");
                            }

                            let cropCardQuery = {query: {rfid: rfid}};
                            let cropCardArray = await findAndCount(cropCardQuery, CropCard_1, 1, {order: [['createTime', 'DESC']]});
                            //console.log('cropCardArray');
                            //console.log(cropCardArray[0]);

                            if (cropCardArray.length > 0) {

                                if(cropCardArray[0].valid === 1){
                                    recordJson.productionSchedulingID = cropCardArray[0].productionScheduling;
                                    recordJson.colorCode = cropCardArray[0].colorCode;

                                    let cropID = cropCardArray[0]['cropPackageData']['crop'];
                                    //recordJson.productionScheduling = cropCardArray[0]['productionSchedulingData'];

                                    let cropCardJson = {
                                        worker: null,
                                        bundleNumber: null,
                                        rfid:null,
                                        part:null,
                                        amount: null,
                                        return: null
                                    };
                                    cropCardJson.worker = cropCardArray[0].worker;
                                    cropCardJson.bundleNumber = cropCardArray[0].bundleNumber;
                                    cropCardJson.rfid = cropCardArray[0].rfid;
                                    cropCardJson.part = cropCardArray[0].part;
                                    cropCardJson.amount = parseFloat(cropCardArray[0].amount);
                                    cropCardJson.return = cropCardArray[0].return;

                                    if ((cropCardArray[0].worker === recordJson.operator) && (cropCardArray[0].return === 1)) {
                                        cropCardJson.amount = 0;
                                    }
                                    //console.log('cropID');
                                    //console.log(cropID);

                                    let cropQuery = {query: {id: cropID}};
                                    let cropArray = await findAndCount(cropQuery, Crop_1, 1);
                                    //console.log('cropArray');
                                    //console.log(cropArray);

                                    let orderID = null;
                                    if (cropArray.length > 0) {
                                        orderID = cropArray[0]['order'];

                                        let stationRecordsToAPI_1 = await findStationInfo(orderID,productionLineOne.station);

                                        //recordJson.stationID = stationRecordsToAPI_1.currentStation;
                                        recordJson.station = stationRecordsToAPI_1;

                                        //console.log('recordJson');
                                        //console.log(recordJson);

                                        let orderQuery = {query: {id: orderID}};
                                        let orderArray = await findAndCount(orderQuery, Order_1, 1);
                                        //console.log('orderArray');
                                        //console.log(orderArray);

                                        if (orderArray.length > 0) {
                                            recordJson.orderID = orderArray[0].orderID;
                                            recordJson.style = orderArray[0].style;
                                            recordJson.deliveryDate = orderArray[0].deliveryDate;
                                            if (orderArray[0].styleData) {
                                                recordJson.productName = orderArray[0].styleData.productName;
                                                recordJson.productCategory = orderArray[0].styleData.productCategory;
                                            }
                                        }

                                        let orderDeliveryPlanQuery = {query:{order:orderID}};
                                        let orderDeliveryPlanArray = await findAndCount(orderDeliveryPlanQuery,OrderDeliveryPlan_1,0);

                                        if(orderDeliveryPlanArray.length > 0){
                                            let orderDeliveryPlanIDArray = orderDeliveryPlanArray.map(value=>{
                                                return value.id;
                                            });
                                            let pdSchedulingQuery = {query:{}};
                                            let pdSchedulingArray = await findAndCount(pdSchedulingQuery,ProductionScheduling_1,0,{},{orderDeliveryPlan:{[sequelize.Op.in]:orderDeliveryPlanIDArray}});
                                            if(pdSchedulingArray.length > 0){
                                                let pdSchedulingIDArray = pdSchedulingArray.map(value=>{
                                                    return value.id;
                                                });
                                                recordJson.productionScheduling = pdSchedulingIDArray;

                                                //console.log('pdSchedulingIDArray');
                                                //console.log(pdSchedulingIDArray);
                                                //查询该订单下计划产量
                                                let amountArrayAPI = [];

                                                if ((recordJson.category === 'crop') || (recordJson.category === '裁剪') ){
                                                    //console.log('-------------------裁剪-------------------');
                                                    let precedingTeamSchedulingQuery = {query: {cropTeam:recordJson.team, cropStartDate: {[sequelize.Op.lte]:currentData},cropEndDate: {[sequelize.Op.gte]:currentData}}};
                                                    let precedingTeamSchedulingArray =  await findAndCount(precedingTeamSchedulingQuery,PrecedingTeamScheduling_1,0,{},{productionScheduling:{[Op.in]:pdSchedulingIDArray}});
                                                    //console.log('precedingTeamSchedulingArray');
                                                    //console.log(precedingTeamSchedulingArray);

                                                    if(precedingTeamSchedulingArray.length > 0){
                                                        let precedingTeamSchedulingArrayAPI = precedingTeamSchedulingArray.map(function (value) {
                                                            let resultJson = {};
                                                            resultJson.category = recordJson.category;
                                                            resultJson.amount = value.amount/calculateDayCount(value.cropStartDate,value.cropEndDate);
                                                            //console.log('resultJson.amount');
                                                            //console.log(resultJson.amount);
                                                            // resultJson.productionScheduling = value.productionScheduling;
                                                            return resultJson;
                                                        });

                                                        amountArrayAPI = precedingTeamSchedulingArrayAPI;
                                                    } else {
                                                        amountArrayAPI = [{
                                                            category:recordJson.category,
                                                            amount:0
                                                        }]
                                                    }
                                                    //console.log(precedingTeamSchedulingArrayAPI);
                                                }
                                                else if((recordJson.category === '粘衬') || (recordJson.category === 'stick')){
                                                    //console.log('-------------------粘衬-------------------');
                                                    let precedingTeamSchedulingQuery = {query: {stickTeam:recordJson.team, stickStartDate: {[sequelize.Op.lte]:currentData},stickEndDate: {[sequelize.Op.gte]:currentData}}};
                                                    let precedingTeamSchedulingArray =  await findAndCount(precedingTeamSchedulingQuery,PrecedingTeamScheduling_1,0,{},{productionScheduling:{[Op.in]:pdSchedulingIDArray}});
                                                    //console.log(precedingTeamSchedulingArray);

                                                    if(precedingTeamSchedulingArray.length > 0){
                                                        let precedingTeamSchedulingArrayAPI = precedingTeamSchedulingArray.map(function (value) {
                                                            let resultJson = {};
                                                            resultJson.category = recordJson.category;
                                                            resultJson.amount = value.amount/calculateDayCount(value.stickStartDate,value.stickEndDate);
                                                            //resultJson.productionScheduling = value.productionScheduling;
                                                            return resultJson;
                                                        });
                                                        //console.log(precedingTeamSchedulingArrayAPI);

                                                        amountArrayAPI = precedingTeamSchedulingArrayAPI;
                                                    } else {
                                                        amountArrayAPI = [{
                                                            category:recordJson.category,
                                                            amount:0
                                                        }]
                                                    }
                                                }
                                                else if((recordJson.category === 'lock') || (recordJson.category === '锁钉')){
                                                    let precedingTeamSchedulingQuery = {query: {lockTeam:recordJson.team, lockStartDate: {[sequelize.Op.lte]:currentData},lockEndDate: {[sequelize.Op.gte]:currentData}}};
                                                    let FollowingTeamSchedulingArray =  await findAndCount(precedingTeamSchedulingQuery,FollowingTeamScheduling_1,0,{},{productionScheduling:{[Op.in]:pdSchedulingIDArray}});
                                                    //console.log(FollowingTeamSchedulingArray);

                                                    if(FollowingTeamSchedulingArray.length > 0){
                                                        let FollowingTeamSchedulingArrayAPI = FollowingTeamSchedulingArray.map(function (value) {
                                                            let resultJson = {};
                                                            resultJson.category = recordJson.category;
                                                            resultJson.amount = value.amount/calculateDayCount(value.lockStartDate,value.lockEndDate);
                                                            //resultJson.productionScheduling = value.productionScheduling;

                                                            return resultJson;
                                                        });
                                                        //console.log(FollowingTeamSchedulingArrayAPI);

                                                        amountArrayAPI = FollowingTeamSchedulingArrayAPI;
                                                    } else {
                                                        amountArrayAPI = [{
                                                            category:recordJson.category,
                                                            amount:0
                                                        }]
                                                    }
                                                }
                                                else if((recordJson.category === 'iron') || (recordJson.category === '整烫')){
                                                    //console.log('-------------------整烫-------------------');
                                                    let precedingTeamSchedulingQuery = {query: {ironTeam:recordJson.team,ironStartDate: {[sequelize.Op.lte]:currentData},ironEndDate: {[sequelize.Op.gte]:currentData}}};
                                                    let FollowingTeamSchedulingArray =  await findAndCount(precedingTeamSchedulingQuery,FollowingTeamScheduling_1,0,{},{productionScheduling:{[Op.in]:pdSchedulingIDArray}});
                                                    //console.log(FollowingTeamSchedulingArray)

                                                    if(FollowingTeamSchedulingArray.length > 0){
                                                        let FollowingTeamSchedulingArrayAPI = FollowingTeamSchedulingArray.map(function (value) {
                                                            let resultJson = {};
                                                            resultJson.category = recordJson.category;
                                                            resultJson.amount = value.amount/calculateDayCount(value.ironStartDate,value.ironEndDate);
                                                            //resultJson.productionScheduling = value.productionScheduling;

                                                            return resultJson;
                                                        });

                                                        amountArrayAPI = FollowingTeamSchedulingArrayAPI;
                                                    } else {
                                                        amountArrayAPI = [{
                                                            category:recordJson.category,
                                                            amount:0
                                                        }]
                                                    }
                                                }
                                                else if((recordJson.category === 'pack') || (recordJson.category === '包装')){
                                                    //console.log('-------------------包装-------------------');
                                                    let precedingTeamSchedulingQuery = {query: {packTeam:recordJson.team, packStartDate: {[sequelize.Op.lte]:currentData},packEndDate: {[sequelize.Op.gte]:currentData}}};
                                                    let FollowingTeamSchedulingArray =  await findAndCount(precedingTeamSchedulingQuery,FollowingTeamScheduling_1,0,{},{productionScheduling:{[Op.in]:pdSchedulingIDArray}});
                                                    //console.log('FollowingTeamSchedulingArray');
                                                    //console.log(FollowingTeamSchedulingArray);
                                                    if(FollowingTeamSchedulingArray.length > 0){
                                                        let FollowingTeamSchedulingArrayAPI = FollowingTeamSchedulingArray.map(function (value) {
                                                            let resultJson = {};
                                                            resultJson.category = recordJson.category;
                                                            resultJson.amount = value.amount/calculateDayCount(value.packStartDate,value.packEndDate);
                                                            //resultJson.productionScheduling = value.productionScheduling;

                                                            return resultJson;
                                                        });
                                                        //console.log('FollowingTeamSchedulingArrayAPI');
                                                        //console.log(FollowingTeamSchedulingArrayAPI);

                                                        amountArrayAPI = FollowingTeamSchedulingArrayAPI;
                                                    } else {
                                                        amountArrayAPI = [{
                                                            category:recordJson.category,
                                                            amount:0
                                                        }]
                                                    }
                                                }
                                                else if((recordJson.category === 'sewing') || (recordJson.category === '车缝')){
                                                    //console.log('-------------------车缝-------------------');
                                                    let precedingTeamSchedulingQuery = {query: {team:recordJson.team, startDate: {[sequelize.Op.lte]:currentData},endDate: {[sequelize.Op.gte]:currentData}}};
                                                    let FollowingTeamSchedulingArray = await findAndCount(precedingTeamSchedulingQuery,SewingTeamScheduling_1,0,{},{productionScheduling:{[Op.in]:pdSchedulingIDArray}});
                                                    //console.log(FollowingTeamSchedulingArray);

                                                    if(FollowingTeamSchedulingArray.length > 0){
                                                        let FollowingTeamSchedulingArrayAPI = FollowingTeamSchedulingArray.map(function (value) {
                                                            let resultJson = {};
                                                            resultJson.category = recordJson.category;
                                                            resultJson.amount = value.amount/calculateDayCount(value.startDate,value.endDate);
                                                            //resultJson.productionScheduling = value.productionScheduling;

                                                            return resultJson;
                                                        });
                                                        //console.log(FollowingTeamSchedulingArrayAPI);

                                                        amountArrayAPI = FollowingTeamSchedulingArrayAPI;
                                                    } else {
                                                        amountArrayAPI = [{
                                                            category:recordJson.category,
                                                            amount:0
                                                        }]
                                                    }
                                                }
                                                //console.log(amountArrayAPI);

                                                let amountSum =  amountArrayAPI.reduce((a,b)=>{
                                                    let sum =  parseFloat(a)  + parseFloat(b.amount) ;
                                                    return sum;
                                                },0);
                                                let amountAPI = {
                                                    category:amountArrayAPI[0].category,
                                                    amount:parseInt(amountSum)
                                                };
                                                recordJson.amount = amountAPI;
                                            }
                                        }
                                        //console.log('orderDeliveryPlanArray');
                                        //console.log(orderDeliveryPlanArray);
                                    }
                                    //console.log(recordJson);
                                    let processStationQuery = {query: {station: recordJson.station.id,order: cropArray[0]['order']}};
                                    let processIDArray = [];
                                    let processStationArray = await findAndCount(processStationQuery, ProcessStation_1, 0);
                                    if (processStationArray && (processStationArray.length > 0)) {
                                        //console.log('processStationArray');
                                        //console.log(processStationArray);

                                        let processStation_styleProcessArray = [];
                                        let styleProcessIDArray = processStationArray.map(value => {
                                            processStation_styleProcessArray.push({styleProcess:value.styleProcess});
                                            return value.styleProcess;
                                        });
                                        //console.log('styleProcessIDArray');
                                        //console.log(styleProcessIDArray);

                                        let styleProcessQuery = {query: {id: {[sequelize.Op.in]: styleProcessIDArray}}};
                                        let styleProcessArray = await findAndCount(styleProcessQuery, StyleProcess_1, 0);
                                        //console.log('styleProcessArray');
                                        //console.log(styleProcessArray);

                                        if (styleProcessArray.length > 0) {

                                            processIDArray = styleProcessArray.map(value=>{
                                                return value.process;
                                            });
                                            //console.log('processIDArray');
                                            //console.log(processIDArray);

                                            let processQuery = {query:{id:{[sequelize.Op.in]:processIDArray}}};
                                            let processArray = await findAndCount(processQuery,Process_1,0);

                                            if(processArray.length > 0){

                                                processArray.forEach(value=>{
                                                    delete value.type;
                                                    delete value.step;
                                                    delete value.mold;
                                                    delete value.workingHours;
                                                    delete value.partCard;
                                                    delete value.equipmentCategory;
                                                });
                                                //console.log('processArray');
                                                //console.log(processArray);

                                                recordJson.process = processArray;
                                            }
                                        }
                                    }

                                    //console.log('cropCardJson');
                                    //console.log(cropCardJson);
                                    //console.log(cropCardJson.bundleNumber);
                                    //console.log(recordJson.style);
                                    //console.log(cropCardJson.part);

                                    //车缝生成工序树
                                    let sewingProcessTree = [];
                                    if(recordJson.category === "sewing" || recordJson.category === "车缝"){
                                        sewingProcessTree = await generateProcessTree(recordJson.style);
                                    }
                                    let memberOutputProcessQuery = {};
                                    if((recordJson.category === "stick") || (recordJson.category === "粘衬")){
                                        memberOutputProcessQuery = {query:{bundleNumber:cropCardJson.bundleNumber,part:cropCardJson.part}};
                                    }else{
                                        memberOutputProcessQuery = {query:{bundleNumber:cropCardJson.bundleNumber}};
                                    }

                                    let memberOutputProcessArray = await findAndCount(memberOutputProcessQuery,MemberOutputProcess_1,0,{},{process:{[sequelize.Op.in]:processIDArray}});
                                    //console.log("memberOutputProcessArray");
                                    //console.log(memberOutputProcessArray);

                                    let memberOutputProcessIDArray = [];
                                    if(memberOutputProcessArray.length > 0){
                                        memberOutputProcessIDArray = memberOutputProcessArray.map(value=>{
                                            return value.process;
                                        });
                                    }
                                    //console.log('memberOutputProcessIDArray')
                                    //console.log(memberOutputProcessIDArray)
                                    //console.log(processIDArray);
                                    //processIDArray, memberOutputProcessIDArray比对，筛选

                                    let processIDArrayPre = getArrDifference(processIDArray,memberOutputProcessIDArray);
                                    //console.log('processIDArrayNew11111111111111');
                                    //console.log(processIDArrayPre);

                                    let processIDArrayNew = sortProcessByPartLength(processIDArrayPre,sewingProcessTree);

                                    let countProcessArray = recordJson.process.filter(value1=>{
                                        for(let x of processIDArrayNew){
                                            if(x === value1.id){
                                                return true;
                                            }
                                        }
                                    });
                                    let workingPriceSum = countProcessArray.reduce((a,b)=>{
                                        return parseFloat(a)+parseFloat(b.workingPrice);
                                    },0);

                                    //console.log(workingPriceSum);
                                    if(processIDArrayNew.length > 0){

                                        //未完成工序，计件
                                        //console.log("No records for this bundleNumber & process");
                                        //console.log("000000000000000000000000001");

                                        //Check返工卡是否存在检验记录，及检验结果
                                        let returnCardCountFlag = false;
                                        if((cropCardJson.return === 1) || (cropCardJson.return === 2)){
                                            let qualityInspectionQueryR = {query:{bundleNumber:cropCardJson.bundleNumber,type:cropCardJson.return}};
                                            let qualityInspectionArrayR = await findAndCount(qualityInspectionQueryR,QualityInspection_1,1);
                                            //console.log('qualityInspectionArrayR');
                                            //console.log(qualityInspectionArrayR);
                                            //console.log(qualityInspectionArrayR[0].qualityInspectionResultData);

                                            if(qualityInspectionArrayR.length > 0){
                                                if(qualityInspectionArrayR[0].qualityInspectionResultData.length > 0){

                                                    if(qualityInspectionArrayR[0].qualityInspectionResultData[0].result === 1){
                                                        //返工卡质检result = 1
                                                        //提示返工次品卡， recordJson更新状态
                                                        recordJson.returnCard = 1;
                                                    }else{
                                                        //返工卡result = 0
                                                        //理论上不存在
                                                    }
                                                }else{
                                                    //无qualityInspectionResultData数据，返工卡复检合格，
                                                    //flage = true
                                                    returnCardCountFlag = true;
                                                }
                                            }else{
                                                //本扎未检 recordJson提示返工卡未复检，不计件
                                                recordJson.returnCard = 2;
                                            }
                                        }

                                        let memberOutputQuery = {query:{step:recordJson.category,bundleNumber:cropCardJson.bundleNumber}};
                                        let memberOutputArray = await findAndCount(memberOutputQuery,MemberOutput_1,0);
                                        //console.log('memberOutputArray');
                                        //console.log(memberOutputArray);

                                        if(memberOutputArray.length > 0){
                                            //console.log("000000000000000000000000002");
                                            //let memberOutputQuery1 = {query:{worker:recordJson.operator,team:recordJson.team,bundleNumber:cropCardJson.bundleNumber}}

                                            let findOneL =  memberOutputArray.find(value=>{
                                                if(value.worker  === recordJson.operator){
                                                    return true;
                                                }
                                            });

                                            if(findOneL){

                                                //当前工人在memberOutput存在本扎，本step记录
                                                //console.log("000000000000000000000000003");
                                                if((cropCardJson.amount === 1) && (!cropCardJson.part) && (cropCardJson.return === 0)){
                                                    //件卡

                                                    if((recordJson.category === "车缝") || (recordJson.category === "sewing")){

                                                        for(let x= 0;  x < processIDArrayNew.length; x++){

                                                            let flag = await pieceRateValidateNoPart(sewingProcessTree,processIDArrayNew[x],cropCardJson.bundleNumber);

                                                            if(flag){
                                                                //写记件here!!!

                                                                let processPrice = 0;
                                                                for(let item of recordJson.process){
                                                                    if(processIDArrayNew[x] === item.id){
                                                                        processPrice = item.workingPrice;
                                                                        break;
                                                                    }
                                                                }

                                                                let memberOutputOne = await findOne({query:{id:findOneL.id}},MemberOutput_1,0,{raw:true});
                                                                //let updatePay = memberOutputOne.pay;
                                                                //let pay123 = parseFloat(findOneL.pay) + (parseFloat(processPrice) * parseFloat(cropCardJson.amount));
                                                                //console.log('QQQQQQQQQQQQQQ4QQQQ3QQQQQQQQQQQQQQQQQQQ');
                                                                //console.log(processPrice)

                                                                let update = {
                                                                    processAmount:memberOutputOne.processAmount + cropCardJson.amount,
                                                                    pay:parseFloat(memberOutputOne.pay) + (parseFloat(processPrice) * parseFloat(cropCardJson.amount)),
                                                                    date:nowDate
                                                                };
                                                                let memberOutputUpdate = await MemberOutput_1.MemberOutput.update(update,{where:{id:findOneL.id}});
                                                                if(memberOutputUpdate){
                                                                    //console.log('Update memberOutput processAmount & pay');
                                                                }

                                                                let memberOutputProcessUpdate = {
                                                                    memberOutput:memberOutputOne.id,
                                                                    bundleNumber:cropCardJson.bundleNumber,
                                                                    process:processIDArrayNew[x],
                                                                    pay:(parseFloat(processPrice) * parseFloat(cropCardJson.amount)),
                                                                    date:nowDate,
                                                                    rfid:cropCardJson.rfid
                                                                };
                                                                let memberOutputProcessRes = new MemberOutputProcess_1.MemberOutputProcess(memberOutputProcessUpdate);
                                                                let res = await memberOutputProcessRes.save();
                                                                if(res && res.id && memberOutputUpdate){
                                                                    recordJson.status = 1;
                                                                }
                                                            }else{
                                                                //console.log("000000000000000100000000066");
                                                            }
                                                        }
                                                    } else {
                                                        //console.log("000000000000000000000000004");
                                                        let update = {
                                                            processAmount:findOneL.processAmount + (processIDArrayNew.length * cropCardJson.amount),
                                                            pay:parseFloat(findOneL.pay) + (parseFloat(workingPriceSum) * parseFloat(cropCardJson.amount)),
                                                            date:nowDate
                                                        };
                                                        let memberOutputUpdate = await MemberOutput_1.MemberOutput.update(update,{where:{id:findOneL.id}});
                                                        if(memberOutputUpdate){
                                                            //console.log('Update memberOutput processAmount & pay');
                                                        }

                                                        let memberOutputProcessUpdate = {};
                                                        for(let x = 0; x < processIDArrayNew.length; x++){
                                                            let processPrice = 0;
                                                            for(let item of recordJson.process){
                                                                if(processIDArrayNew[x] === item.id){
                                                                    processPrice = item.workingPrice;
                                                                    break;
                                                                }
                                                            }
                                                            memberOutputProcessUpdate = {
                                                                memberOutput:findOneL.id,
                                                                bundleNumber:cropCardJson.bundleNumber,
                                                                process:processIDArrayNew[x],
                                                                date:nowDate,
                                                                pay:parseFloat(processPrice) * parseFloat(cropCardJson.amount),
                                                                rfid:cropCardJson.rfid
                                                            };
                                                            let memberOutputProcessRes = new MemberOutputProcess_1.MemberOutputProcess(memberOutputProcessUpdate);
                                                            let res = await memberOutputProcessRes.save();
                                                            if(res && res.id && memberOutputUpdate){
                                                                recordJson.status = 1;
                                                            }
                                                        }
                                                    }
                                                }else{

                                                    if((recordJson.category === "车缝") || (recordJson.category === "sewing")){
                                                        if((cropCardJson.return === 1) || (cropCardJson.return === 2)){
                                                            //console.log("000000000000000000000000005");
                                                            //返工卡，不计件
                                                        }else{
                                                            //需判断previous process是否完成

                                                            for(let x= 0;  x < processIDArrayNew.length; x++){

                                                                let flag = await pieceRateValidate(sewingProcessTree,processIDArrayNew[x],cropCardJson.bundleNumber,cropCardJson.part);

                                                                if(flag){
                                                                    //写记件here!!!

                                                                    let processPrice = 0;
                                                                    for(let item of recordJson.process){
                                                                        if(processIDArrayNew[x] === item.id){
                                                                            processPrice = item.workingPrice;
                                                                            break;
                                                                        }
                                                                    }

                                                                    let memberOutputOne = await findOne({query:{id:findOneL.id}},MemberOutput_1,0,{raw:true});

                                                                    let update = {
                                                                        processAmount:memberOutputOne.processAmount + cropCardJson.amount,
                                                                        pay:parseFloat(memberOutputOne.pay) + (parseFloat(processPrice) * parseFloat(cropCardJson.amount)),
                                                                        date:nowDate
                                                                    };
                                                                    let memberOutputUpdate = await MemberOutput_1.MemberOutput.update(update,{where:{id:findOneL.id}});
                                                                    if(memberOutputUpdate){
                                                                        //console.log('Update memberOutput processAmount & pay');
                                                                    }

                                                                    let memberOutputProcessUpdate = {
                                                                        memberOutput:memberOutputOne.id,
                                                                        bundleNumber:cropCardJson.bundleNumber,
                                                                        process:processIDArrayNew[x],
                                                                        pay:(parseFloat(processPrice) * parseFloat(cropCardJson.amount)),
                                                                        date:nowDate,
                                                                        rfid:cropCardJson.rfid
                                                                    };
                                                                    let memberOutputProcessRes = new MemberOutputProcess_1.MemberOutputProcess(memberOutputProcessUpdate);
                                                                    let res = await memberOutputProcessRes.save();
                                                                    if(res && res.id && memberOutputUpdate){
                                                                        recordJson.status = 1;
                                                                    }

                                                                    let rfidFlag = await precessIsLastedOne(sewingProcessTree,cropCardJson.bundleNumber);
                                                                    if(rfidFlag){
                                                                        //last process
                                                                        let cropCardQuery = {query:{bundleNumber:cropCardJson.bundleNumber}};
                                                                        let cropCardArray = await findAndCount(cropCardQuery,CropCard_1,0);
                                                                        if(cropCardArray.length > 0){
                                                                            let updateNeededArray = cropCardArray.filter(value=>{
                                                                                if(value.rfid !== cropCardJson.rfid){
                                                                                    return true;
                                                                                }
                                                                            });
                                                                            let cropCardIDList = updateNeededArray.map(value=>{
                                                                                return value.id;
                                                                            });
                                                                            let updateres = await CropCard_1.CropCard.update({valid:0},{where:{id:{[sequelize.Op.in]:cropCardIDList}}});
                                                                            if(updateres && Array.isArray(updateres)){
                                                                                //console.log("000000000000000000000300006");
                                                                                //console.log(updateres[0]);
                                                                            }
                                                                        }
                                                                    }
                                                                }else{
                                                                    //console.log("000000000000000000000000066");
                                                                }
                                                            }
                                                        }
                                                    }else{
                                                        if(((recordJson.category === "lock") || (recordJson.category === "iron")|| (recordJson.category === "锁钉")|| (recordJson.category === "整烫")) && (cropCardJson.return === 2)){
                                                            //总检返工，lock,iron不计件
                                                            //console.log("000000000000000000000000007");
                                                        }else{
                                                            if((recordJson.category === "stick") || (recordJson.category === "粘衬")){
                                                                //console.log("000000000000000000000000008");
                                                                let stylePartCardQuery = {query:{style:recordJson.style}};
                                                                let stylePartCardArray = await findAndCount(stylePartCardQuery,StylePartCard_1,1);

                                                                if(stylePartCardArray.length > 0){
                                                                    let stylePartCardIDArray = stylePartCardArray.map(value=>{
                                                                        return value.partCard;
                                                                    });
                                                                    let partCardQuery = {query:{id:{[sequelize.Op.in]:stylePartCardIDArray},part:cropCardJson.part,stick:1}};
                                                                    let partCardOne = await findOne(partCardQuery,PartCard_1,0,{raw:true});

                                                                    if(partCardOne){
                                                                        //console.log("000000000000000000000000047");
                                                                        //count
                                                                        let update = {
                                                                            processAmount:findOneL.processAmount + (processIDArrayNew.length * cropCardJson.amount),
                                                                            pay:parseFloat(findOneL.pay) + (parseFloat(workingPriceSum) * parseFloat(cropCardJson.amount)),
                                                                            date:nowDate
                                                                        };
                                                                        let memberOutputUpdate = await MemberOutput_1.MemberOutput.update(update,{where:{id:findOneL.id}});
                                                                        if(memberOutputUpdate){
                                                                            //console.log('Update memberOutput processAmount & pay');
                                                                        }

                                                                        let memberOutputProcessUpdate = {};
                                                                        for(let x = 0; x < processIDArrayNew.length; x++){
                                                                            let processPrice = 0;
                                                                            for(let item of recordJson.process){
                                                                                if(processIDArrayNew[x] === item.id){
                                                                                    processPrice = item.workingPrice;
                                                                                    break;
                                                                                }
                                                                            }
                                                                            memberOutputProcessUpdate = {
                                                                                memberOutput:findOneL.id,
                                                                                bundleNumber:cropCardJson.bundleNumber,
                                                                                process:processIDArrayNew[x],
                                                                                part:cropCardJson.part,
                                                                                pay:parseFloat(processPrice) * parseFloat(cropCardJson.amount),
                                                                                date:nowDate,
                                                                                rfid:cropCardJson.rfid
                                                                            };
                                                                            let memberOutputProcessRes = new MemberOutputProcess_1.MemberOutputProcess(memberOutputProcessUpdate);
                                                                            let res = await memberOutputProcessRes.save();
                                                                            if(res && res.id && memberOutputUpdate){
                                                                                recordJson.status = 1;
                                                                            }
                                                                        }
                                                                    }
                                                                    else{
                                                                        //非粘衬部件，不计件！！！！！！
                                                                        //console.log("000000000000000000000000048");
                                                                    }
                                                                }
                                                            } else{

                                                                if((((recordJson.category === "lock") || (recordJson.category === "iron")|| (recordJson.category === "pack")|| (recordJson.category === "包装")||(recordJson.category === "锁钉")|| (recordJson.category === "整烫")) && returnCardCountFlag ) || (cropCardJson.return === 0)){
                                                                    //console.log("000000000000000000000000009");
                                                                    let update = {
                                                                        processAmount:findOneL.processAmount + (processIDArrayNew.length * cropCardJson.amount),
                                                                        pay:parseFloat(findOneL.pay) + (parseFloat(workingPriceSum) * parseFloat(cropCardJson.amount)),
                                                                        date:nowDate
                                                                    };
                                                                    let memberOutputUpdate = await MemberOutput_1.MemberOutput.update(update,{where:{id:findOneL.id}});
                                                                    if(memberOutputUpdate){
                                                                        //console.log('Update memberOutput processAmount & pay');
                                                                    }

                                                                    let memberOutputProcessUpdate = {};
                                                                    for(let x = 0; x < processIDArrayNew.length; x++){
                                                                        let processPrice = 0;
                                                                        for(let item of recordJson.process){
                                                                            if(processIDArrayNew[x] === item.id){
                                                                                processPrice = item.workingPrice;
                                                                                break;
                                                                            }
                                                                        }
                                                                        memberOutputProcessUpdate = {
                                                                            memberOutput:findOneL.id,
                                                                            bundleNumber:cropCardJson.bundleNumber,
                                                                            process:processIDArrayNew[x],
                                                                            pay:parseFloat(processPrice) * parseFloat(cropCardJson.amount),
                                                                            date:nowDate,
                                                                            rfid:cropCardJson.rfid
                                                                        };
                                                                        let memberOutputProcessRes = new MemberOutputProcess_1.MemberOutputProcess(memberOutputProcessUpdate);
                                                                        let res = await memberOutputProcessRes.save();
                                                                        if(res && res.id && memberOutputUpdate){
                                                                            recordJson.status = 1;
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                            else{
                                                //当前工人在memberOutput中不存在本扎，本step记录，但本扎本step有其他memberOutput记录
                                                if((cropCardJson.amount === 1) && (cropCardJson.part === null) && (cropCardJson.return === 0)){
                                                    //console.log("000000000000000000000000010");
                                                    //件卡，

                                                    if((recordJson.category === 'sewing') || (recordJson.category === '车缝')){

                                                        for(let x= 0;  x < processIDArrayNew.length; x++){
                                                            let flag = await pieceRateValidateNoPart(sewingProcessTree,processIDArrayNew[x],cropCardJson.bundleNumber);

                                                            if(flag){
                                                                //console.log("000000000000000000000000049");
                                                                //写记件 vincent here!!!
                                                                let processPrice = 0;
                                                                for(let y = 0; y < recordJson.process.length; y++){
                                                                    if(processIDArrayNew[x] === recordJson.process[y].id){
                                                                        processPrice = recordJson.process[y].workingPrice;
                                                                        break;
                                                                    }
                                                                }

                                                                let memberOutputQuery = {query:{worker:recordJson.operator,productionScheduling:recordJson.productionSchedulingID,bundleNumber:cropCardJson.bundleNumber, step:recordJson.category}};
                                                                let memberOutputOne = await findOne(memberOutputQuery,MemberOutput_1,0,{raw:true});
                                                                if(memberOutputOne){
                                                                    let updatedoc = {
                                                                        processAmount:memberOutputOne.processAmount + cropCardJson.amount,
                                                                        pay:parseFloat(memberOutputOne.pay) + (parseFloat(processPrice) * parseFloat(cropCardJson.amount)),
                                                                        date:nowDate
                                                                    };
                                                                    let updateres = await MemberOutput_1.MemberOutput.update(updatedoc,{where:{id:memberOutputOne.id}});
                                                                    if(updateres && Array.isArray(updateres)){
                                                                        let updatedoc1 = {
                                                                            memberOutput: memberOutputOne.id,
                                                                            bundleNumber: cropCardJson.bundleNumber,
                                                                            process: processIDArrayNew[x],
                                                                            pay:parseFloat(processPrice) * parseFloat(cropCardJson.amount),
                                                                            date:nowDate,
                                                                            rfid:cropCardJson.rfid
                                                                        };
                                                                        let memberOutputProcessRes = new MemberOutputProcess_1.MemberOutputProcess(updatedoc1);
                                                                        let res = await memberOutputProcessRes.save();
                                                                        if (res && res.id) {
                                                                            recordJson.status = 1;
                                                                        }
                                                                    }
                                                                }else{
                                                                    let updateDoc = {
                                                                        productionScheduling:recordJson.productionSchedulingID,
                                                                        worker:recordJson.operator,
                                                                        bundleNumber:cropCardJson.bundleNumber,
                                                                        team:recordJson.team,
                                                                        station:recordJson.station.id,
                                                                        step:recordJson.category,
                                                                        amount:cropCardJson.amount,
                                                                        processAmount:cropCardJson.amount,
                                                                        pay: cropCardJson.amount * parseFloat(processPrice) ,
                                                                        date: nowDate
                                                                    };

                                                                    let prod = new MemberOutput_1.MemberOutput(updateDoc);
                                                                    let proddoc = await prod.save();
                                                                    if(proddoc && proddoc.id){
                                                                        let updatedoc1 = {
                                                                            memberOutput: proddoc.id,
                                                                            bundleNumber: cropCardJson.bundleNumber,
                                                                            process: processIDArrayNew[x],
                                                                            pay:parseFloat(processPrice) * parseFloat(cropCardJson.amount),
                                                                            date:nowDate,
                                                                            rfid:cropCardJson.rfid
                                                                        };
                                                                        let memberOutputProcessRes = new MemberOutputProcess_1.MemberOutputProcess(updatedoc1);
                                                                        let res = await memberOutputProcessRes.save();
                                                                        if (res && res.id) {
                                                                            recordJson.status = 1;
                                                                        }
                                                                    }
                                                                }
                                                            }else{
                                                                //console.log("000000000000000000000000050");
                                                            }
                                                        }
                                                    }
                                                    else{
                                                        let memberOutputNew = {
                                                            productionScheduling: recordJson.productionSchedulingID,
                                                            worker: recordJson.operator,
                                                            bundleNumber: cropCardJson.bundleNumber,
                                                            team: recordJson.team,
                                                            station:recordJson.station.id,
                                                            step: recordJson.category,
                                                            amount: cropCardJson.amount,
                                                            processAmount: processIDArrayNew.length * cropCardJson.amount,
                                                            pay: cropCardJson.amount * parseFloat(workingPriceSum),
                                                            date: nowDate
                                                        };
                                                        let prod = new MemberOutput_1.MemberOutput(memberOutputNew);
                                                        let proddoc = await prod.save();

                                                        if (proddoc && proddoc.id) {
                                                            for (let y = 0; y < processIDArrayNew.length; y++) {
                                                                let processPrice = 0;
                                                                for(let z = 0; z < recordJson.process.length; z++){
                                                                    if(processIDArrayNew[y] === recordJson.process[z].id){
                                                                        processPrice = recordJson.process[z].workingPrice;
                                                                        break;
                                                                    }
                                                                }
                                                                let updatedoc = {
                                                                    memberOutput: proddoc.id,
                                                                    bundleNumber: cropCardJson.bundleNumber,
                                                                    process: processIDArrayNew[y],
                                                                    pay:parseFloat(processPrice) * parseFloat(cropCardJson.amount),
                                                                    date:nowDate,
                                                                    rfid:cropCardJson.rfid
                                                                };
                                                                let memberOutputProcessRes = new MemberOutputProcess_1.MemberOutputProcess(updatedoc);
                                                                let res = await memberOutputProcessRes.save();
                                                                if (res && res.id) {
                                                                    recordJson.status = 1;
                                                                }
                                                            }
                                                        }
                                                    }
                                                }else{
                                                    //非件卡
                                                    if((recordJson.category === 'sewing') || (recordJson.category === '车缝')){
                                                        if((cropCardJson.return === 1) || (cropCardJson.return === 2)){
                                                            //返工卡，不计件
                                                            //console.log("000000000000000000000000011");
                                                        }else{
                                                            //console.log("000000000000000000000000012");
                                                            //需判断previous process是否完成

                                                            for(let x= 0;  x < processIDArrayNew.length; x++){
                                                                let flag = await pieceRateValidate(sewingProcessTree,processIDArrayNew[x],cropCardJson.bundleNumber,cropCardJson.part);

                                                                if(flag){
                                                                    //console.log("000000000000000000000000049");

                                                                    //写记件 vincent here!!!
                                                                    let processPrice = 0;
                                                                    for(let y = 0; y < recordJson.process.length; y++){
                                                                        if(processIDArrayNew[x] === recordJson.process[y].id){
                                                                            processPrice = recordJson.process[y].workingPrice;
                                                                            break;
                                                                        }
                                                                    }

                                                                    let memberOutputQuery = {query:{worker:recordJson.operator,productionScheduling:recordJson.productionSchedulingID, bundleNumber:cropCardJson.bundleNumber, step:recordJson.category}};
                                                                    let memberOutputOne = await findOne(memberOutputQuery,MemberOutput_1,0,{raw:true});
                                                                    if(memberOutputOne){
                                                                        let updatedoc = {
                                                                            processAmount:memberOutputOne.processAmount + cropCardJson.amount,
                                                                            pay:parseFloat(memberOutputOne.pay) + (parseFloat(processPrice) * parseFloat(cropCardJson.amount)),
                                                                            date:nowDate
                                                                        };
                                                                        let updateres = await MemberOutput_1.MemberOutput.update(updatedoc,{where:{id:memberOutputOne.id}});
                                                                        if(updateres && Array.isArray(updateres)){
                                                                            let updatedoc1 = {
                                                                                memberOutput: memberOutputOne.id,
                                                                                bundleNumber: cropCardJson.bundleNumber,
                                                                                process: processIDArrayNew[x],
                                                                                pay:parseFloat(processPrice) * parseFloat(cropCardJson.amount),
                                                                                date:nowDate,
                                                                                rfid:cropCardJson.rfid
                                                                            };
                                                                            let memberOutputProcessRes = new MemberOutputProcess_1.MemberOutputProcess(updatedoc1);
                                                                            let res = await memberOutputProcessRes.save();
                                                                            if (res && res.id) {
                                                                                recordJson.status = 1;
                                                                            }
                                                                        }
                                                                    }else{
                                                                        let updateDoc = {
                                                                            productionScheduling:recordJson.productionSchedulingID,
                                                                            worker:recordJson.operator,
                                                                            bundleNumber:cropCardJson.bundleNumber,
                                                                            team:recordJson.team,
                                                                            station:recordJson.station.id,
                                                                            step:recordJson.category,
                                                                            amount:cropCardJson.amount,
                                                                            processAmount:cropCardJson.amount,
                                                                            pay: cropCardJson.amount * parseFloat(processPrice) ,
                                                                            date: nowDate
                                                                        };

                                                                        let prod = new MemberOutput_1.MemberOutput(updateDoc);
                                                                        let proddoc = await prod.save();
                                                                        if(proddoc && proddoc.id){
                                                                            let updatedoc1 = {
                                                                                memberOutput: proddoc.id,
                                                                                bundleNumber: cropCardJson.bundleNumber,
                                                                                process: processIDArrayNew[x],
                                                                                pay:parseFloat(processPrice) * parseFloat(cropCardJson.amount),
                                                                                date:nowDate,
                                                                                rfid:cropCardJson.rfid
                                                                            };
                                                                            let memberOutputProcessRes = new MemberOutputProcess_1.MemberOutputProcess(updatedoc1);
                                                                            let res = await memberOutputProcessRes.save();
                                                                            if (res && res.id) {
                                                                                recordJson.status = 1;
                                                                            }
                                                                        }
                                                                    }

                                                                    let rfidFlag = await precessIsLastedOne(sewingProcessTree,cropCardJson.bundleNumber);
                                                                    if(rfidFlag){
                                                                        //last process
                                                                        let cropCardQuery = {query:{bundleNumber:cropCardJson.bundleNumber}};
                                                                        let cropCardArray = await findAndCount(cropCardQuery,CropCard_1,0);
                                                                        if(cropCardArray.length > 0){
                                                                            let updateNeededArray = cropCardArray.filter(value=>{
                                                                                if(value.rfid !== cropCardJson.rfid){
                                                                                    return true;
                                                                                }
                                                                            });
                                                                            let cropCardIDList = updateNeededArray.map(value=>{
                                                                                return value.id;
                                                                            });
                                                                            let updateres = await CropCard_1.CropCard.update({valid:0},{where:{id:{[sequelize.Op.in]:cropCardIDList}}});
                                                                            if(updateres && Array.isArray(updateres)){
                                                                                //console.log("000000000000000000000300006");
                                                                                //console.log(updateres[0]);
                                                                            }
                                                                        }
                                                                    }
                                                                }else{
                                                                    //console.log("000000000000000000000000050");
                                                                }
                                                            }
                                                        }
                                                    }else{
                                                        if(((recordJson.category === "lock") || (recordJson.category === "iron")|| (recordJson.category === "锁钉")|| (recordJson.category === "整烫")) && (cropCardJson.return === 2)){
                                                            //总检返工，lock,iron不计件
                                                            //console.log("000000000000000000000000013");
                                                        }else {
                                                            //console.log("000000000000000000000000014");
                                                            if((recordJson.category === "stick") || (recordJson.category === "粘衬")){
                                                                //console.log("000000000000000000000000015");
                                                                let stylePartCardQuery = {query:{style:recordJson.style}};
                                                                let stylePartCardArray = await findAndCount(stylePartCardQuery,StylePartCard_1,1);

                                                                if(stylePartCardArray.length > 0){
                                                                    let stylePartCardIDArray = stylePartCardArray.map(value=>{
                                                                        return value.partCard;
                                                                    });
                                                                    let partCardQuery = {query:{id:{[sequelize.Op.in]:stylePartCardIDArray},part:cropCardJson.part,stick:1}};
                                                                    let partCardOne = await findOne(partCardQuery,PartCard_1,0,{raw:true});

                                                                    if(partCardOne){
                                                                        //count
                                                                        //console.log("000000000000000000000000053");
                                                                        let memberOutputNew = {
                                                                            productionScheduling: recordJson.productionSchedulingID,
                                                                            worker: recordJson.operator,
                                                                            bundleNumber: cropCardJson.bundleNumber,
                                                                            team: recordJson.team,
                                                                            station:recordJson.station.id,
                                                                            step: recordJson.category,
                                                                            amount: cropCardJson.amount,
                                                                            processAmount: processIDArrayNew.length * cropCardJson.amount,
                                                                            pay: cropCardJson.amount * parseFloat(workingPriceSum),
                                                                            date: nowDate
                                                                        };
                                                                        let prod = new MemberOutput_1.MemberOutput(memberOutputNew);
                                                                        let proddoc = await prod.save();

                                                                        if (proddoc && proddoc.id) {
                                                                            for (let y = 0; y < processIDArrayNew.length; y++) {
                                                                                let processPrice = 0;
                                                                                for(let z = 0; z < recordJson.process.length; z++){
                                                                                    if(processIDArrayNew[y] === recordJson.process[z].id){
                                                                                        processPrice = recordJson.process[z].workingPrice;
                                                                                        break;
                                                                                    }
                                                                                }
                                                                                let updatedoc = {
                                                                                    memberOutput: proddoc.id,
                                                                                    bundleNumber: cropCardJson.bundleNumber,
                                                                                    process: processIDArrayNew[y],
                                                                                    part:cropCardJson.part,
                                                                                    pay:parseFloat(processPrice) * parseFloat(cropCardJson.amount),
                                                                                    date:nowDate,
                                                                                    rfid:cropCardJson.rfid
                                                                                };
                                                                                let memberOutputProcessRes = new MemberOutputProcess_1.MemberOutputProcess(updatedoc);
                                                                                let res = await memberOutputProcessRes.save();
                                                                                if (res && res.id) {
                                                                                    recordJson.status = 1;
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                    else{
                                                                        //非粘衬部件，不计件！！！！！！
                                                                        //console.log("000000000000000000000000147");
                                                                    }
                                                                }
                                                            }else{

                                                                if((((recordJson.category === "lock") || (recordJson.category === "iron")|| (recordJson.category === "pack")|| (recordJson.category === "包装")||(recordJson.category === "锁钉")|| (recordJson.category === "整烫")) && returnCardCountFlag ) || (cropCardJson.return === 0)){
                                                                    //console.log("000000000000000000000000016");
                                                                    //iron,lock,pack新增
                                                                    let memberOutputNew = {
                                                                        productionScheduling: recordJson.productionSchedulingID,
                                                                        worker: recordJson.operator,
                                                                        bundleNumber: cropCardJson.bundleNumber,
                                                                        team: recordJson.team,
                                                                        station:recordJson.station.id,
                                                                        step: recordJson.category,
                                                                        amount: cropCardJson.amount,
                                                                        processAmount: processIDArrayNew.length * cropCardJson.amount,
                                                                        pay: cropCardJson.amount * parseFloat(workingPriceSum),
                                                                        date: nowDate
                                                                    };
                                                                    let prod = new MemberOutput_1.MemberOutput(memberOutputNew);
                                                                    let proddoc = await prod.save();

                                                                    if (proddoc && proddoc.id) {
                                                                        for (let y = 0; y < processIDArrayNew.length; y++) {
                                                                            let processPrice = 0;
                                                                            for(let z = 0; z < recordJson.process.length; z++){
                                                                                if(processIDArrayNew[y] === recordJson.process[z].id){
                                                                                    processPrice = recordJson.process[z].workingPrice;
                                                                                    break;
                                                                                }
                                                                            }
                                                                            let updatedoc = {
                                                                                memberOutput: proddoc.id,
                                                                                bundleNumber: cropCardJson.bundleNumber,
                                                                                process: processIDArrayNew[y],
                                                                                pay:parseFloat(processPrice) * parseFloat(cropCardJson.amount),
                                                                                date:nowDate,
                                                                                rfid:cropCardJson.rfid
                                                                            };
                                                                            let memberOutputProcessRes = new MemberOutputProcess_1.MemberOutputProcess(updatedoc);
                                                                            let res = await memberOutputProcessRes.save();
                                                                            if (res && res.id) {
                                                                                recordJson.status = 1;
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }else{
                                            //memberOutput中无本扎本step任何记录

                                            //update ProductionScheduling/PrecedingTeamOutput/FollowingTeamOutput/SewingTeamOutput/orderDeliveryPlan
                                            let productionSchedulingQuery = {query:{id:recordJson.productionSchedulingID}};
                                            let productionSchedulingOne = await findOne(productionSchedulingQuery,ProductionScheduling_1,0,{raw:true});

                                            if((recordJson.category === 'stick') || (recordJson.category === '粘衬')){

                                                let stickPieceCard = false;
                                                let stickPartCard = false;
                                                if((cropCardJson.amount === 1) && (cropCardJson.part === null) && (cropCardJson.return === 0)){
                                                    //件卡
                                                    stickPieceCard = true;
                                                }
                                                else{
                                                    //非件卡
                                                    let stylePartCardQuery = {query:{style:recordJson.style}};
                                                    let stylePartCardArray = await findAndCount(stylePartCardQuery,StylePartCard_1,1);

                                                    if(stylePartCardArray.length > 0){
                                                        let stylePartCardIDArray = stylePartCardArray.map(value=>{
                                                            return value.partCard;
                                                        });
                                                        let partCardQuery = {query:{id:{[sequelize.Op.in]:stylePartCardIDArray},part:cropCardJson.part,stick:1}};
                                                        let partCardOne = await findOne(partCardQuery,PartCard_1,0,{raw:true});

                                                        if(partCardOne) {
                                                            stickPartCard = true;
                                                        }
                                                    }
                                                }

                                                if(stickPieceCard || stickPartCard){
                                                    if(productionSchedulingOne){
                                                        let update = {
                                                            stickCompleteAmount:productionSchedulingOne.stickCompleteAmount + cropCardJson.amount,
                                                            date:nowDate
                                                        };
                                                        let updateres = await ProductionScheduling_1.ProductionScheduling.update(update,{where:{id:recordJson.productionSchedulingID}});
                                                        if(updateres){
                                                            //console.log("Update stickCompleteAmount in productionScheduling");
                                                        }else{
                                                            //console.log("Faile to pdate stickCompleteAmount in productionScheduling");
                                                        }
                                                    }

                                                    let precedingTeamSchedulingQuery = {query:{productionScheduling:recordJson.productionSchedulingID,stickTeam:recordJson.team/*, stickStartDate: {[sequelize.Op.lte]:currentData},stickEndDate: {[sequelize.Op.gte]:currentData}*/}};
                                                    let precedingTeamSchedulingArray = await findAndCount(precedingTeamSchedulingQuery,PrecedingTeamScheduling_1,1,{order:['stickEndDate']});
                                                    //console.log('precedingTeamSchedulingArray1');
                                                    //console.log(precedingTeamSchedulingArray);
                                                    if(precedingTeamSchedulingArray.length > 0){
                                                        //console.log("000000000000000000000000747");
                                                        for(let x = 0; x < precedingTeamSchedulingArray.length; x++){

                                                            let precedingTeamOutputQuery = {query:{precedingTeamScheduling:precedingTeamSchedulingArray[x].id}};
                                                            let precedingTeamOutputOne = await findOne(precedingTeamOutputQuery,PrecedingTeamOutput_1,0,{raw:true});

                                                            if(precedingTeamOutputOne){
                                                                if(precedingTeamOutputOne.stickAmount >= precedingTeamSchedulingArray[x].amount){

                                                                }else{
                                                                    let updateOne = {
                                                                        stickAmount:parseInt(precedingTeamOutputOne.stickAmount) + parseInt(cropCardJson.amount),
                                                                        date:nowDate
                                                                    };
                                                                    let query = {where:{id:precedingTeamOutputOne.id}};
                                                                    let updateres = await PrecedingTeamOutput_1.PrecedingTeamOutput.update(updateOne, query);

                                                                    if(updateres){
                                                                        break;
                                                                    }
                                                                }
                                                            }
                                                            else {
                                                                let updatedoc = {
                                                                    precedingTeamScheduling:precedingTeamSchedulingArray[x].id,
                                                                    date:nowDate,
                                                                    cropAmount:0,
                                                                    stickAmount:cropCardJson.amount
                                                                };

                                                                let prod = new PrecedingTeamOutput_1.PrecedingTeamOutput(updatedoc);
                                                                let proddoc = await prod.save();

                                                                if(proddoc && proddoc.id){
                                                                    break;
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                            else
                                            if((recordJson.category === 'lock') || (recordJson.category === '锁钉')){
                                                if(cropCardJson.return === 2){
                                                    //console.log("000000000000000000000000026");
                                                    //总检返工，锁钉不计件
                                                }else{
                                                    if(returnCardCountFlag || (cropCardJson.return === 0)){
                                                        //console.log("000000000000000000000000027");

                                                        if(productionSchedulingOne){
                                                            let update = {
                                                                lockCompleteAmount:productionSchedulingOne.lockCompleteAmount + cropCardJson.amount,
                                                                date:nowDate
                                                            };
                                                            let updateres = await ProductionScheduling_1.ProductionScheduling.update(update,{where:{id:recordJson.productionSchedulingID}});
                                                            if(updateres){
                                                                //console.log("Update lockCompleteAmount in productionScheduling");
                                                            }else{
                                                                //console.log("Faile to update lockCompleteAmount in productionScheduling");
                                                            }
                                                        }

                                                        let followingTeamSchedulingQuery = {query:{productionScheduling:recordJson.productionSchedulingID,lockTeam:recordJson.team/*, lockStartDate: {[sequelize.Op.lte]:currentData},lockEndDate: {[sequelize.Op.gte]:currentData}*/}};
                                                        let followingTeamSchedulingArray = await findAndCount(followingTeamSchedulingQuery,FollowingTeamScheduling_1,1,{order:['lockEndDate']});
                                                        //console.log('followingTeamSchedulingArray');
                                                        //console.log(followingTeamSchedulingArray);
                                                        if(followingTeamSchedulingArray.length > 0){
                                                            //console.log("000000000000000000000000847");
                                                            for(let x = 0; x < followingTeamSchedulingArray.length; x++){

                                                                let followingTeamOutputQuery = {query:{followingTeamScheduling:followingTeamSchedulingArray[x].id}};
                                                                let followingTeamOutputOne = await findOne(followingTeamOutputQuery,FollowingTeamOutput_1,0,{raw:true});

                                                                if(followingTeamOutputOne){
                                                                    if(followingTeamOutputOne.lockAmount >= followingTeamSchedulingArray[x].amount){
                                                                        //console.log("11111111111111111111111111lock111111111111111111111");
                                                                    }else{
                                                                        let updateOne = {
                                                                            lockAmount:parseInt(followingTeamOutputOne.lockAmount) + parseInt(cropCardJson.amount),
                                                                            date:nowDate
                                                                        };
                                                                        let query = {where:{id:followingTeamOutputOne.id}};
                                                                        let updateres = await FollowingTeamOutput_1.FollowingTeamOutput.update(updateOne, query);

                                                                        if(updateres){
                                                                            break;
                                                                        }
                                                                    }
                                                                }
                                                                else {
                                                                    let updatedoc = {
                                                                        followingTeamScheduling:followingTeamSchedulingArray[x].id,
                                                                        date:nowDate,
                                                                        lockAmount:cropCardJson.amount,
                                                                        ironAmount:0,
                                                                        packAmount:0
                                                                    };

                                                                    let prod = new FollowingTeamOutput_1.FollowingTeamOutput(updatedoc);
                                                                    let proddoc = await prod.save();

                                                                    if(proddoc && proddoc.id){
                                                                        break;
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                            else
                                            if((recordJson.category === 'iron') || (recordJson.category === '整烫')){
                                                if(cropCardJson.return === 2){
                                                    //总检返工，iron不计件
                                                    //console.log("000000000000000000000000028");
                                                }else{
                                                    if(returnCardCountFlag || (cropCardJson.return === 0)){
                                                        if(productionSchedulingOne){
                                                            //console.log("000000000000000000000000029");
                                                            let update = {
                                                                ironCompleteAmount:productionSchedulingOne.ironCompleteAmount + cropCardJson.amount,
                                                                date:nowDate
                                                            };
                                                            let updateres = await ProductionScheduling_1.ProductionScheduling.update(update,{where:{id:recordJson.productionSchedulingID}});
                                                            if(updateres){
                                                                //console.log("Update ironCompleteAmount in productionScheduling");
                                                            }else{
                                                                //console.log("Fail to update ironCompleteAmount in productionScheduling");
                                                            }
                                                        }

                                                        let followingTeamSchedulingQuery = {query:{productionScheduling:recordJson.productionSchedulingID,ironTeam:recordJson.team/*, ironStartDate: {[sequelize.Op.lte]:currentData},ironEndDate: {[sequelize.Op.gte]:currentData}*/}};
                                                        let followingTeamSchedulingArray = await findAndCount(followingTeamSchedulingQuery,FollowingTeamScheduling_1,1,{order:['ironEndDate']});
                                                        //console.log('followingTeamSchedulingArray');
                                                        //console.log(followingTeamSchedulingArray);
                                                        if(followingTeamSchedulingArray.length > 0){
                                                            //console.log("000000000000000000000001047");
                                                            for(let x = 0; x < followingTeamSchedulingArray.length; x++){

                                                                let followingTeamOutputQuery = {query:{followingTeamScheduling:followingTeamSchedulingArray[x].id}};
                                                                let followingTeamOutputOne = await findOne(followingTeamOutputQuery,FollowingTeamOutput_1,0,{raw:true});

                                                                if(followingTeamOutputOne){
                                                                    if(followingTeamOutputOne.ironAmount >= followingTeamSchedulingArray[x].amount){
                                                                        //console.log("1111111111111111111111111iron1111111111111111111111");
                                                                    }else{
                                                                        let updateOne = {
                                                                            ironAmount:parseInt(followingTeamOutputOne.ironAmount) + parseInt(cropCardJson.amount),
                                                                            date:nowDate
                                                                        };
                                                                        let query = {where:{id:followingTeamOutputOne.id}};
                                                                        let updateres = await FollowingTeamOutput_1.FollowingTeamOutput.update(updateOne, query);

                                                                        if(updateres){
                                                                            break;
                                                                        }
                                                                    }
                                                                }
                                                                else {
                                                                    let updatedoc = {
                                                                        followingTeamScheduling:followingTeamSchedulingArray[x].id,
                                                                        date:nowDate,
                                                                        lockAmount:0,
                                                                        ironAmount:cropCardJson.amount,
                                                                        packAmount:0
                                                                    };

                                                                    let prod = new FollowingTeamOutput_1.FollowingTeamOutput(updatedoc);
                                                                    let proddoc = await prod.save();

                                                                    if(proddoc && proddoc.id){
                                                                        break;
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                            else
                                            if((recordJson.category === 'pack') || (recordJson.category === '包装')){
                                                //console.log("000000000000000000000000030");
                                                //console.log(returnCardCountFlag);
                                                //console.log(recordJson.return)
                                                if(returnCardCountFlag || (cropCardJson.return === 0)){
                                                    //console.log("00000000000000000000444444");
                                                    //console.log(productionSchedulingOne);
                                                    if(productionSchedulingOne){
                                                        //console.log("23222222222222222222222222233333333");
                                                        let update = {
                                                            packCompleteAmount:productionSchedulingOne.packCompleteAmount + cropCardJson.amount,
                                                            date:nowDate
                                                        };
                                                        let updateres = await ProductionScheduling_1.ProductionScheduling.update(update,{where:{id:recordJson.productionSchedulingID}});
                                                        if(updateres){
                                                            //console.log("Update packCompleteAmount in productionScheduling");
                                                        }else{
                                                            //console.log("Fail to update packCompleteAmount in productionScheduling");
                                                        }
                                                        //Update orderDeliveryPlan Amount
                                                        let productionSchedulingQuery1 = {query:{id:recordJson.productionSchedulingID}};
                                                        let productionSchedulingOne1 = await findOne(productionSchedulingQuery1,ProductionScheduling_1,1);

                                                        if(productionSchedulingOne1){
                                                            //console.log("000000000000000000000001147");
                                                            if(productionSchedulingOne1.orderDeliveryPlanData.completed < productionSchedulingOne1.orderDeliveryPlanData.totalAmount){
                                                                let update = {
                                                                    completed:productionSchedulingOne1.orderDeliveryPlanData.completed + cropCardJson.amount,
                                                                };
                                                                let updateres = await OrderDeliveryPlan_1.OrderDeliveryPlan.update(update,{where:{id:productionSchedulingOne1.orderDeliveryPlanData.id}});
                                                                if(updateres){
                                                                    //console.log("Update completed in orderDeliveryPlan");
                                                                }else{
                                                                    //console.log("Fail to update completed in orderDeliveryPlan");
                                                                }
                                                            }
                                                            else{
                                                                //console.log("Already finished, do not update")
                                                            }
                                                        }
                                                    }

                                                    let followingTeamSchedulingQuery = {query:{productionScheduling:recordJson.productionSchedulingID,packTeam:recordJson.team/*, packStartDate: {[sequelize.Op.lte]:currentData},packEndDate: {[sequelize.Op.gte]:currentData}*/}};
                                                    let followingTeamSchedulingArray = await findAndCount(followingTeamSchedulingQuery,FollowingTeamScheduling_1,1,{order:['packEndDate']});
                                                    //console.log('followingTeamSchedulingArray');
                                                    //console.log(followingTeamSchedulingArray);
                                                    if(followingTeamSchedulingArray.length > 0){
                                                        //console.log("000000000000000000000001247");
                                                        for(let x = 0; x < followingTeamSchedulingArray.length; x++){

                                                            let followingTeamOutputQuery = {query:{followingTeamScheduling:followingTeamSchedulingArray[x].id}};
                                                            let followingTeamOutputOne = await findOne(followingTeamOutputQuery,FollowingTeamOutput_1,0,{raw:true});

                                                            if(followingTeamOutputOne){
                                                                if(followingTeamOutputOne.packAmount >= followingTeamSchedulingArray[x].amount){
                                                                    //console.log("111111111111111111111111pack11111111111111111111111");
                                                                }else{
                                                                    let updateOne = {
                                                                        packAmount:parseInt(followingTeamOutputOne.packAmount) + parseInt(cropCardJson.amount),
                                                                        date:nowDate
                                                                    };
                                                                    let query = {where:{id:followingTeamOutputOne.id}};
                                                                    let updateres = await FollowingTeamOutput_1.FollowingTeamOutput.update(updateOne, query);

                                                                    if(updateres){
                                                                        break;
                                                                    }
                                                                }
                                                            }
                                                            else {
                                                                let updatedoc = {
                                                                    followingTeamScheduling:followingTeamSchedulingArray[x].id,
                                                                    date:nowDate,
                                                                    lockAmount:0,
                                                                    ironAmount:0,
                                                                    packAmount:cropCardJson.amount
                                                                };

                                                                let prod = new FollowingTeamOutput_1.FollowingTeamOutput(updatedoc);
                                                                let proddoc = await prod.save();

                                                                if(proddoc && proddoc.id){
                                                                    break;
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                            else
                                            if((recordJson.category === 'sewing') || (recordJson.category === '车缝')){
                                                if((cropCardJson.return === 1) || (cropCardJson.return === 2)) {
                                                    //console.log("000000000000000000000000031");
                                                    //console.log("sewing return, DO NOT update sewingTeamOutput/ProductionScheduling")
                                                }
                                                else {
                                                    //console.log("000000000000000000000000032");
                                                    //console.log("check sewing previous process finished or not");
                                                    let prodFlag = false;
                                                    let outputFlag = false;

                                                    for(let x= 0;  x < processIDArray.length; x++){
                                                        if(prodFlag && outputFlag){
                                                            break;
                                                        }

                                                        let flag = false;
                                                        if(cropCardJson.amount === 1 && cropCardJson.part === null && cropCardJson.return === 0){
                                                            //件卡
                                                            flag = await pieceRateValidateNoPart(sewingProcessTree,processIDArray[x],cropCardJson.bundleNumber);
                                                        }else{
                                                            //非件卡
                                                            flag = await pieceRateValidate(sewingProcessTree,processIDArray[x],cropCardJson.bundleNumber,cropCardJson.part);
                                                        }

                                                        if(flag){
                                                            //console.log("previous process finished, need update productionScheduling/sewingTeamOutput");
                                                            //console.log("000000000000000000000000035");

                                                            if(productionSchedulingOne){
                                                                let update = {
                                                                    sewingCompleteAmount:productionSchedulingOne.sewingCompleteAmount + cropCardJson.amount,
                                                                    date:nowDate
                                                                };
                                                                let updateres = await ProductionScheduling_1.ProductionScheduling.update(update,{where:{id:recordJson.productionSchedulingID}});
                                                                if(updateres && Array.isArray(updateres)){
                                                                    prodFlag = true;
                                                                    //console.log("Update sewingCompleteAmount in productionScheduling");
                                                                }else{
                                                                    //console.log("Fail to update sewingCompleteAmount in productionScheduling");
                                                                }
                                                            }

                                                            let sewingTeamSchedulingQuery = {query:{productionScheduling:recordJson.productionSchedulingID,team:recordJson.team/*, startDate: {[sequelize.Op.lte]:currentData},endDate: {[sequelize.Op.gte]:currentData}*/}};
                                                            let sewingTeamSchedulingArray = await findAndCount(sewingTeamSchedulingQuery,SewingTeamScheduling_1,1,{order:['endDate']});
                                                            //console.log('sewingTeamSchedulingArray');
                                                            //console.log(sewingTeamSchedulingArray);
                                                            if(sewingTeamSchedulingArray.length > 0){
                                                                //console.log("000000000000000000000400033");
                                                                for(let x = 0; x < sewingTeamSchedulingArray.length; x++){

                                                                    let sewingTeamOutputQuery = {query:{sewingTeamScheduling:sewingTeamSchedulingArray[x].id}};
                                                                    let sewingTeamOutputOne = await findOne(sewingTeamOutputQuery,SewingTeamOutput_1,0,{raw:true});

                                                                    if(sewingTeamOutputOne){
                                                                        if(sewingTeamOutputOne.amount >= sewingTeamSchedulingArray[x].amount){

                                                                        }else{
                                                                            let updateOne = {
                                                                                amount:parseInt(sewingTeamOutputOne.amount) + parseInt(cropCardJson.amount),
                                                                                date:nowDate
                                                                            };
                                                                            let query = {where:{id:sewingTeamOutputOne.id}};
                                                                            let updateres = await SewingTeamOutput_1.SewingTeamOutput.update(updateOne,query);

                                                                            if(updateres && Array.isArray(updateres)){
                                                                                outputFlag = true;
                                                                            }
                                                                        }
                                                                    }
                                                                    else {
                                                                        let updatedoc = {
                                                                            sewingTeamScheduling:sewingTeamSchedulingArray[x].id,
                                                                            productCategory:recordJson.category,
                                                                            date:nowDate,
                                                                            amount:cropCardJson.amount,
                                                                            capacity:0,
                                                                            efficiency:null
                                                                        };

                                                                        let prod = new SewingTeamOutput_1.SewingTeamOutput(updatedoc);
                                                                        let proddoc = await prod.save();

                                                                        if(proddoc && proddoc.id){
                                                                            outputFlag = true;
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }

                                            //无本扎memberOutput记录，insert memberOutput新纪录
                                            if((recordJson.category === 'sewing') || (recordJson.category === '车缝')){
                                                if((cropCardJson.return === 1) || (cropCardJson.return === 2)){
                                                    //console.log("车缝返工，不计件");
                                                    //console.log("000000000000000000000000018");
                                                    //返工卡，不计件
                                                }else{
                                                    //console.log('check previous process finished or not');
                                                    //console.log("000000000000000000000000019");
                                                    //需判断previous process是否完成

                                                    for(let x= 0;  x < processIDArrayNew.length; x++){

                                                        let flag = false;
                                                        if(cropCardJson.amount === 1 && cropCardJson.part === null && cropCardJson.return === 0){
                                                            flag = await pieceRateValidateNoPart(sewingProcessTree,processIDArrayNew[x],cropCardJson.bundleNumber);
                                                        }else{
                                                            flag = await pieceRateValidate(sewingProcessTree,processIDArrayNew[x],cropCardJson.bundleNumber,cropCardJson.part);
                                                        }

                                                        if(flag){
                                                            //console.log("000000000000000000000000347");
                                                            //console.log("previous process finished, start count");

                                                            let processPrice = 0;
                                                            for(let z = 0; z < recordJson.process.length; z++){
                                                                if(processIDArrayNew[x] === recordJson.process[z].id){
                                                                    processPrice = recordJson.process[z].workingPrice;
                                                                    break;
                                                                }
                                                            }

                                                            let memberOutputQuery = {query:{worker:recordJson.operator, productionScheduling:recordJson.productionSchedulingID, bundleNumber:cropCardJson.bundleNumber, step:recordJson.category}};
                                                            let memberOutputOne = await findOne(memberOutputQuery,MemberOutput_1,0);
                                                            if(memberOutputOne){
                                                                let updatedoc = {
                                                                    processAmount:memberOutputOne.processAmount + cropCardJson.amount,
                                                                    pay:parseFloat(memberOutputOne.pay) + (parseFloat(processPrice) * parseFloat(cropCardJson.amount)),
                                                                    date:nowDate
                                                                };
                                                                let updateres = await MemberOutput_1.MemberOutput.update(updatedoc,{where:{id:memberOutputOne.id}});

                                                                if(updateres && Array.isArray(updateres)){
                                                                    let updatedoc1 = {
                                                                        memberOutput: memberOutputOne.id,
                                                                        bundleNumber: cropCardJson.bundleNumber,
                                                                        process: processIDArrayNew[x],
                                                                        pay:parseFloat(processPrice) * parseFloat(cropCardJson.amount),
                                                                        date:nowDate,
                                                                        rfid:cropCardJson.rfid
                                                                    };
                                                                    let memberOutputProcessRes = new MemberOutputProcess_1.MemberOutputProcess(updatedoc1);
                                                                    let res = await memberOutputProcessRes.save();

                                                                    if (res && res.id) {
                                                                        recordJson.status = 1;
                                                                    }
                                                                }
                                                            }else{
                                                                let updateDoc = {
                                                                    productionScheduling:recordJson.productionSchedulingID,
                                                                    worker:recordJson.operator,
                                                                    bundleNumber:cropCardJson.bundleNumber,
                                                                    team:recordJson.team,
                                                                    station:recordJson.station.id,
                                                                    step:recordJson.category,
                                                                    amount:cropCardJson.amount,
                                                                    processAmount:cropCardJson.amount,
                                                                    pay: cropCardJson.amount * parseFloat(processPrice) ,
                                                                    date: nowDate
                                                                };
                                                                //console.log('updateDoc');
                                                                //console.log(processPrice);
                                                                let prod = new MemberOutput_1.MemberOutput(updateDoc);
                                                                let proddoc = await prod.save();

                                                                if(proddoc && proddoc.id){
                                                                    let updatedoc1 = {
                                                                        memberOutput: proddoc.id,
                                                                        bundleNumber: cropCardJson.bundleNumber,
                                                                        process: processIDArrayNew[x],
                                                                        pay:parseFloat(processPrice) * parseFloat(cropCardJson.amount),
                                                                        date:nowDate,
                                                                        rfid:cropCardJson.rfid
                                                                    };
                                                                    let memberOutputProcessRes = new MemberOutputProcess_1.MemberOutputProcess(updatedoc1);
                                                                    let res = await memberOutputProcessRes.save();

                                                                    if (res && res.id) {
                                                                        recordJson.status = 1;
                                                                    }
                                                                }
                                                            }

                                                            let rfidFlag = await precessIsLastedOne(sewingProcessTree,cropCardJson.bundleNumber);
                                                            if(rfidFlag){
                                                                //last process
                                                                let cropCardQuery = {query:{bundleNumber:cropCardJson.bundleNumber}};
                                                                let cropCardArray = await findAndCount(cropCardQuery,CropCard_1,0);
                                                                if(cropCardArray.length > 0){
                                                                    let updateNeededArray = cropCardArray.filter(value=>{
                                                                        if(value.rfid !== cropCardJson.rfid){
                                                                            return true;
                                                                        }
                                                                    });
                                                                    let cropCardIDList = updateNeededArray.map(value=>{
                                                                        return value.id;
                                                                    });
                                                                    let updateres = await CropCard_1.CropCard.update({valid:0},{where:{id:{[sequelize.Op.in]:cropCardIDList}}});

                                                                    if(updateres && Array.isArray(updateres)){
                                                                        //console.log("000000000000000000000300043");
                                                                        //console.log(updateres[0]);
                                                                    }
                                                                }
                                                            }
                                                        }else{
                                                            //console.log("000000000000000000000000447");
                                                        }
                                                    }
                                                }
                                            }else{
                                                if(((recordJson.category === "lock") || (recordJson.category === "iron")|| (recordJson.category === "锁钉")|| (recordJson.category === "整烫")) && (cropCardJson.return === 2)){
                                                    //总检返工，lock,iron不计件
                                                    //console.log("000000000000000000000000020");
                                                }else {
                                                    //console.log("000000000000000000000000021");
                                                    //判断当前部件是否需要粘衬
                                                    if((recordJson.category === "stick") || (recordJson.category === "粘衬")){
                                                        //console.log("000000000000000000000000022");

                                                        let stickPieceCardFlag = false;
                                                        let stickPartCardFlag = false;

                                                        if(cropCardJson.amount === 1 && cropCardJson.part === null && cropCardJson.return === 0){
                                                            //件卡
                                                            stickPieceCardFlag = true;
                                                        }else{
                                                            //not 件卡
                                                            let stylePartCardQuery = {query:{style:recordJson.style}};
                                                            let stylePartCardArray = await findAndCount(stylePartCardQuery,StylePartCard_1,1);

                                                            if(stylePartCardArray.length > 0) {
                                                                let stylePartCardIDArray = stylePartCardArray.map(value => {
                                                                    return value.partCard;
                                                                });
                                                                let partCardQuery = {query: {id: {[sequelize.Op.in]: stylePartCardIDArray},part: cropCardJson.part, stick: 1}};
                                                                let partCardOne = await findOne(partCardQuery, PartCard_1, 0, {raw: true});

                                                                if (partCardOne) {
                                                                    stickPartCardFlag = true;
                                                                }
                                                            }
                                                        }

                                                        if(stickPieceCardFlag || stickPartCardFlag){
                                                            let memberOutputNew = {
                                                                productionScheduling: recordJson.productionSchedulingID,
                                                                worker: recordJson.operator,
                                                                bundleNumber: cropCardJson.bundleNumber,
                                                                team: recordJson.team,
                                                                station:recordJson.station.id,
                                                                step: recordJson.category,
                                                                amount: cropCardJson.amount,
                                                                processAmount: processIDArrayNew.length * cropCardJson.amount,
                                                                pay: cropCardJson.amount * parseFloat(workingPriceSum),
                                                                date: nowDate
                                                            };
                                                            let prod = new MemberOutput_1.MemberOutput(memberOutputNew);
                                                            let proddoc = await prod.save();

                                                            if (proddoc && proddoc.id) {
                                                                for (let y = 0; y < processIDArrayNew.length; y++) {
                                                                    let processPrice = 0;
                                                                    for(let z = 0; z < recordJson.process.length; z++){
                                                                        if(processIDArrayNew[y] === recordJson.process[z].id){
                                                                            processPrice = recordJson.process[z].workingPrice;
                                                                            break;
                                                                        }
                                                                    }
                                                                    let updatedoc = {
                                                                        memberOutput: proddoc.id,
                                                                        bundleNumber: cropCardJson.bundleNumber,
                                                                        process: processIDArrayNew[y],
                                                                        part:cropCardJson.part,
                                                                        pay:parseFloat(processPrice) * parseFloat(cropCardJson.amount),
                                                                        date:nowDate,
                                                                        rfid:cropCardJson.rfid
                                                                    };
                                                                    let memberOutputProcessRes = new MemberOutputProcess_1.MemberOutputProcess(updatedoc);
                                                                    let res = await memberOutputProcessRes.save();
                                                                    if (res && res.id) {
                                                                        recordJson.status = 1;
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    } else {
                                                        if((((recordJson.category === "lock") || (recordJson.category === "iron")|| (recordJson.category === "pack")|| (recordJson.category === "包装")||(recordJson.category === "锁钉")|| (recordJson.category === "整烫")) && returnCardCountFlag ) || (cropCardJson.return === 0)) {
                                                            //console.log("000000000000000000000000023");
                                                            //iron,lock,pack
                                                            let memberOutputNew = {
                                                                productionScheduling: recordJson.productionSchedulingID,
                                                                worker: recordJson.operator,
                                                                bundleNumber: cropCardJson.bundleNumber,
                                                                team: recordJson.team,
                                                                station:recordJson.station.id,
                                                                step: recordJson.category,
                                                                amount: cropCardJson.amount,
                                                                processAmount: processIDArrayNew.length * cropCardJson.amount,
                                                                pay: cropCardJson.amount * parseFloat(workingPriceSum),
                                                                date: nowDate
                                                            };
                                                            let prod = new MemberOutput_1.MemberOutput(memberOutputNew);
                                                            let proddoc = await prod.save();

                                                            if (proddoc && proddoc.id) {
                                                                for (let y = 0; y < processIDArrayNew.length; y++) {
                                                                    let processPrice = 0;
                                                                    for(let z = 0; z < recordJson.process.length; z++){
                                                                        if(processIDArrayNew[y] === recordJson.process[z].id){
                                                                            processPrice = recordJson.process[z].workingPrice;
                                                                            break;
                                                                        }
                                                                    }
                                                                    let updatedoc = {
                                                                        memberOutput: proddoc.id,
                                                                        bundleNumber: cropCardJson.bundleNumber,
                                                                        process: processIDArrayNew[y],
                                                                        pay:parseFloat(processPrice) * parseFloat(cropCardJson.amount),
                                                                        date:nowDate,
                                                                        rfid:cropCardJson.rfid
                                                                    };
                                                                    let memberOutputProcessRes = new MemberOutputProcess_1.MemberOutputProcess(updatedoc);
                                                                    let res = await memberOutputProcessRes.save();
                                                                    if (res && res.id) {
                                                                        recordJson.status = 1;
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }else{
                                        //所有工序已完成，不计件，不更新完成数量
                                        //console.log("000000000000000000000000034");
                                    }
                                    //console.log('memberOutputProcessQuery');
                                    //console.log(memberOutputProcessQuery);

                                    let queryToday = { [sequelize.Op.and]: [{ [sequelize.Op.gte]: (new Date()).toISOString().slice(0, 11) + '00:00:00.000Z' }, { [sequelize.Op.lte]: (new Date()).toISOString().slice(0, 11) + '23:59:59.000Z' }] };
                                    let memberOutputSumQuery = {query:{worker:recordJson.operator, date:queryToday}};

                                    let memberOutputArray = await findAndCount(memberOutputSumQuery,MemberOutput_1,0,{},{productionScheduling:{[sequelize.Op.in]:recordJson.productionScheduling}});

                                    if(memberOutputArray.length > 0){
                                        let memberOutputIDArray = memberOutputArray.map(value=>{
                                            return value.id;
                                        });
                                        let memberOutputProcessQuery = {query:{date:queryToday}};
                                        let memberOutputProcessArray = await findAndCount(memberOutputProcessQuery,MemberOutputProcess_1,1,{},{memberOutput:{[sequelize.Op.in]:memberOutputIDArray}});

                                        if(memberOutputProcessArray.length > 0){

                                            let bundleNumberArray = memberOutputProcessArray.map(value=>{
                                                return value.bundleNumber;
                                            });
                                            bundleNumberArray = [...new Set(bundleNumberArray)];

                                            let temp = bundleNumberArray.map(value=>{

                                                let oneBundleArray = memberOutputProcessArray.filter(value1 => {
                                                    if(value1.bundleNumber === value){
                                                        return true;
                                                    }
                                                });
                                                //console.log('oneBundleArray');
                                                //console.log(oneBundleArray);

                                                let paySum = oneBundleArray.reduce((a,b)=>{
                                                    let pay = parseFloat(a) + parseFloat(b.pay || 0);
                                                    return pay;
                                                },0);

                                                let processAmountSum = oneBundleArray[0].memberOutputData.amount * oneBundleArray.length;

                                                let tempJson = {
                                                    pay:paySum,
                                                    amount:oneBundleArray[0].memberOutputData.amount,
                                                    processAmount:processAmountSum
                                                };

                                                return tempJson;
                                            });

                                            //console.log('temp');
                                            //console.log(temp);

                                            let result = temp.reduce((a,b)=>{
                                                return {pay:parseFloat(a.pay)+parseFloat(b.pay),processAmount:parseInt(a.processAmount) + parseInt(b.processAmount),amount:parseInt(a.amount) + parseInt(b.amount)};
                                            },{pay:0,processAmount:0,amount:0});
                                            //console.log('result3333333333333333333333333');
                                            //console.log(result);

                                            recordJson.pay = result.pay;
                                            recordJson.rfidAmount = result.amount;
                                            recordJson.processAmount = result.processAmount;
                                        }
                                    }

                                    delete recordJson.productionScheduling;
                                }else{
                                    //无效卡
                                    recordJson.status = 0;
                                }
                            }
                        }
                    }
                }
                //console.log('recordJson.process');
                //console.log(recordJson.process);
                resp.records.push(recordJson);

                ctx.body = resp;
                ctx.status = 200;
                ctx.respond = true;
            }
            catch (err) {
                //console.log(err);
                ctx.throw(err.message, 400);
            }
        }
    });
};
