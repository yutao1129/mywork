"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const dbquery_1 = require("../database/dbquery");
const Style_1 = require("../database/models/Style");
const Sequelize_1 = require("sequelize");
const Op = Sequelize_1.Op;
const Process_1 = require("../database/models/Process");
const ProcessPartCard_1 = require("../database/models/ProcessPartCard");
const StyleProcess_1 = require("../database/models/StyleProcess");


const findOne = async function (query,modelInstance,join,option,condition){
    let queryInstance = {};
    let modelInstanceKeys = Object.keys(modelInstance);
    if(join && modelInstanceKeys.length === 2 ){
        queryInstance = dbquery_1.queryDBGeneratorEx(query, modelInstance[modelInstanceKeys[1]]);
    }else{
        queryInstance = dbquery_1.queryDBGeneratorEx(query);
    }

    if(option){
        queryInstance = Object.assign(queryInstance,option);
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
        queryInstance = Object.assign(queryInstance,option);
    }

    if(condition){
        queryInstance.where = Object.assign(queryInstance.where,condition)
    }
    console.log('queryInstance');
    console.log(queryInstance);

    let tempArray = [];
    let docs = await modelInstance[modelInstanceKeys[0]].findAndCount(queryInstance);
    if (docs && docs.rows) {
        for (let item of docs.rows) {
            tempArray.push(item.toJSON());
        }
    }

    return  tempArray;
};

function isContained(aa,bb){
    if(!(aa instanceof Array)||!(bb instanceof Array)||((aa.length < bb.length))){
        return false;
    }
    let aaStr = aa.toString();

    console.log(aaStr)
    for (let i = 0 ;i < bb.length;i++) {
        if(aaStr.indexOf(bb[i]) < 0) return false;
    }
    return true;
};

function findOneByLevel (finalResult,level){
    let findOneLevel = finalResult.rawTree.find(value => {

        if (value.level === level){
            return true;
        }
    });

    return findOneLevel;
};


exports.registerProcessOrderComplexAPI = function (processOrderComplexRouter) {

    processOrderComplexRouter.post('/processOrderComplex/search', async (ctx) => {
        try {
            let res = [];
            let query = ctx.request.body.query;

            let styleID = query.styleID;

            let styleQuery = {query:{styleID:styleID}};
            let styleArray =  await findAndCount(styleQuery,Style_1,0);


//            console.log('styleArray')
//            console.log(styleArray)

            if(styleArray.length >0){
                let styleProcessQuery = {query:{style:styleArray[0].styleID}};
                let styleProcessArray =  await findAndCount(styleProcessQuery,StyleProcess_1,0);

//                console.log('styleProcessArray')
//                console.log(styleProcessArray)

                if(styleProcessArray.length > 0){
                    let processIDArray = styleProcessArray.map(value=>{
                        return value.process

                    });

//                console.log('processIDArray')
//                console.log(processIDArray)

                    let processQuery = {query:{type:"车缝"}};
                    let processArray =  await findAndCount(processQuery,Process_1,0,{order:['id'],group: ['id']},{id:{[Op.in]:processIDArray}});


//                    console.log('processArray')
//                    console.log(processArray)

//                  let processCollection= [];
//                  let partCollection = [];
//                  let lengthCollection = [];
                    if(processArray.length > 0){

                        let sewingProcessIDArray = processArray.map(value=>{
                            return value.id
                        });
                        let processPartCardQuery = {query:{}};
                        let processPartCardArray =  await findAndCount(processPartCardQuery,ProcessPartCard_1,1,{order:['process']},{process:{[Op.in]:sewingProcessIDArray}});
//                        console.log('processPartCardArray');
//                        console.log(processPartCardArray);

                        if(processPartCardArray.length > 0){

                            let processCollection =  processPartCardArray.map(value=>{

                                value.processID = value.ProcessData.processID;
                                value.type = value.ProcessData.type;
                                value.name = value.ProcessData.name;

                                if(value.partCardData){
                                    if(value.partCardData.part === null){
                                        ctx.throw(`partCard id: ${value.partCard} part 为空`, 400);
                                    }
                                    value.part = [];
                                    value.partID = [];
                                    value.part.push(value.partCardData.part);
                                    value.partID.push(value.partCardData.id);
                                    delete value.partCardData;
                                }else{
                                    ctx.throw(`ProcessPartCard id：${value.id} 没有相关联的partCard id: ${value.partCard}`, 400);
                                }
                                delete value.id;
                                delete value.partCard;
                                delete value.ProcessData;
                                return value;
                            });

//                            console.log('processCollection');
//                            console.log(processCollection);
                            //Step1  相同process, 合并 part,partID

                            let processRepeatTypeArray = processCollection.map(value=>{
                                return value.process;

                            });

                            let processTypeArray = [...new Set(processRepeatTypeArray)].sort();

//                            console.log('processTypeArray')
//                            console.log(processTypeArray)

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


//                            console.log('processPartMergeArray');
//                            console.log(processPartMergeArray)

                            let levelRepeatTypeArray = processPartMergeArray.map(value => {

                                return value.length
                            });

                            let levelTypeArray = [...new Set(levelRepeatTypeArray)].sort();
//                            console.log('levelTypeArray')
//                            console.log(levelTypeArray);

                            if(!levelTypeArray.includes(1)){
                                ctx.throw(`没有单部件的工序！`, 400);
                            }

                            let partRepeatTypeArray = processCollection.map(value=>{
                                return value.part[0];
                            });

                            let partTypeArray = [...new Set(partRepeatTypeArray)];
//                            console.log('partTypeArray')
//                            console.log(partTypeArray)

//                            let partIDRepeatTypeArray = processCollection.map(value=>{
//                                return value.partID[0];
//                            });

//                            let partIDTypeArray = [...new Set(partIDRepeatTypeArray)];

//                            console.log('partIDTypeArray')
//                            console.log(partIDTypeArray)

                            let classifyProcessByLevel = levelTypeArray.map(value => {
                                let oneLevelArray = processPartMergeArray.filter(value1 => {
                                    if(value1.length === value){
                                        return true;
                                    }
                                }) ;

                                let branchJson = {part:[],node:[]};

//                                console.log('oneLevelArray');
//                                console.log(oneLevelArray)

                                let oneLevelRepeatPartIDArray = oneLevelArray.reduce((a,b)=>{
                                    a.push(b.partID);
                                    return a;
                                },[])

                                //数组元素是数组的转化成sting,元素进行大小比较
                                let oneLevelRepeatPartIDStringArray = oneLevelRepeatPartIDArray.map(value=>{
                                    return value.toString()
                                })

                                let oneLevelPartIDArray = [...new Set(oneLevelRepeatPartIDStringArray)];

//                                console.log('oneLevelPartIDArray')
//                                console.log(oneLevelPartIDArray)

                                let node = oneLevelPartIDArray.map(value1 => {

                                    let oneLevelBySamePart = oneLevelArray.filter(value2 => {
                                        if(value2.partID.toString() === value1){
                                            return true;
                                        }
                                    });
                                    oneLevelBySamePart.sort((a,b)=>{
//                                        return a.processID - b.processID
                                        return parseInt(a.processID) - parseInt(b.processID);
                                    })

                                    return oneLevelBySamePart
                                });

//                                console.log('node');
//                                console.log(node);

                                //恢复数组
                                let PartIDStringArray = oneLevelPartIDArray.map(value1 => {
                                    return value1.split(',')
                                });

//                                console.log('PartIDStringArray')
//                                console.log(PartIDStringArray)

                                let PartIDNumberArray = PartIDStringArray.map(value1 => {
                                    let result = [];
                                    value1.forEach(value2=>{
                                        result.push(parseInt(value2));
                                    })
                                    return result
                                });

//                                console.log('PartIDNumberArray')
//                                console.log(PartIDNumberArray)

                                let oneLevelRepeatPartArray = oneLevelArray.reduce((a,b)=>{
                                    a.push(b.part);
                                    return a;
                                },[])

//                                console.log('oneLevelRepeatPartArray')
//                                console.log(oneLevelRepeatPartArray)

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

//                            console.log('classifyProcessByLevel')
//                            console.log(classifyProcessByLevel);
                            let levelCollection = classifyProcessByLevel.map(value => {
                                return value.level
                            });

                            levelCollection.sort((a,b)=>{
                                return a-b;
                            })
//                            console.log('levelCollection')
//                            console.log(levelCollection)

                            let finalResult =  {level:levelCollection, rawTree:classifyProcessByLevel}


                            let levelArray = finalResult.level

                            for(let x of levelArray){

                                let findOne = findOneByLevel (finalResult,x)
//                                console.log('findOne===============')

                                for(let item of findOne.branch.node) {
                                    if(item.length ===0){
                                        continue
                                    }
                                    item.reduce((a, b) => {
                                        a.nextProcess = b.process ;
                                        return b;
                                    });

                                    item[item.length - 1].nextProcess = null;

                                }

                            }

                            let findOne = findOneByLevel (finalResult,1)

                            let listArray = []
                            for(let item of findOne.branch.node) {

                                let partType = item[item.length - item.length].part;
                                let partID = item[item.length - item.length].partID;

                                console.log('partType')
                                console.log(partType)

                                let partList = {
                                    part:partType,
                                    list : item
                                }

                                let levelCropArray =levelArray.slice(1);

                                if(levelCropArray.length < 1){
                                    listArray.push(partList)
                                    continue
                                }
//                                console.log('levelCropArray')
//                                console.log(levelCropArray)


//                                console.log('levelCropArray')
//                                console.log(levelCropArray)

                                let totalArray =  levelCropArray.map((value,index) => {

                                    let findSecondOne = findOneByLevel (finalResult,value);

                                    if(findSecondOne){

                                        let secondPart = findSecondOne.branch.part;
                                        let secondPartID = findSecondOne.branch.partID
                                        let secondNode = findSecondOne.branch.node;
                                        for(let z = 0; z < secondPart.length; z++){
                                            let flag =secondPartID[z].includes(partID[0]);
                                            if(flag){
                                                let secondArray = secondNode[z];

                                                partList.list[partList.list.length-1].nextProcess = secondArray[secondArray.length - secondArray.length].process;
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

//                                console.log('totalArray')
//                                console.log(totalArray)

                                listArray.push(totalArray[totalArray.length-1])
                            }

                            listArray.sort((a,b)=>{
                                return b.list.length - a.list.length;
                            });
                            res = listArray;

                        }


                    }
                    else{
                        ctx.throw( `${query.styleID} 对应的process无数据`, 400);

                    }


                }else{
                    ctx.throw( `StyleProcess无数据`, 400);
                }

            }
            else{
                ctx.throw( `不存在style ${query.styleID}`, 400);
            }


            ctx.body = res;
            ctx.status = 200;
            ctx.respond = true;

        }
        catch (e) {
            console.log(e);
            ctx.throw(e.message, 400);
        }
    })


}