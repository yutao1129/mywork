"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const dbquery_1 = require("../database/dbquery");
const Style_1 = require("../database/models/Style");
const Sequelize_1 = require("sequelize");
const Op = Sequelize_1.Op;
const Process_1 = require("../database/models/Process");
const ProcessPartCard_1 = require("../database/models/ProcessPartCard");
const StyleProcess_1 = require("../database/models/StyleProcess");


const findAndCount = async function (query,modelInstance,join,option,){
    let queryInstance = {};
    let modelInstanceKeys = Object.keys(modelInstance);
    if(join && modelInstanceKeys.length === 2 ){
        queryInstance = dbquery_1.queryDBGeneratorEx(query, modelInstance[modelInstanceKeys[1]]);
    }else{
        queryInstance = dbquery_1.queryDBGeneratorEx(query);
    }
    if(option){
        queryInstance = Object.assign(queryInstance,option)
    }
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
}

function findOneByLevel (finalResult,level){
    let findOneLevel = finalResult.rawTree.find(value => {

        if (value.level === level){
            return true;
        }
    });

    return findOneLevel;
}

exports.registerProcessOrderComplexAPI = function (processOrderComplexRouter) {

    processOrderComplexRouter.post('/processOrderComplex/search', async (ctx) => {
        try {
            let res = [];
            let query = ctx.request.body.query;
            let styleID = query.styleID

            let styleQuery = {query:{styleID:styleID}};
            let styleArray =  await findAndCount(styleQuery,Style_1,0);

//            console.log(styleArray)

            if(styleArray.length >0){
                let styleProcessQuery = {query:{style:styleArray[0].styleID}};
                let styleProcessArray =  await findAndCount(styleProcessQuery,StyleProcess_1,0);

                console.log(styleProcessArray)

                if(styleProcessArray.length > 0){
                    let processIDArray = styleProcessArray.map(value=>{

                        return value.process

                    });

//                console.log('processIDArray')
//                console.log(processIDArray)

                    let processQuery = {query:{type:"车缝"}};
                    let processArray =  await findAndCount(processQuery,Process_1,0,{},{id:{[Op.in]:processIDArray}});

//                console.log('processArray')
//                console.log(processArray)

                    let processCollection= [];
                    let partCollection = [];
                    let lengthCollection = [];

                    if(processArray.length > 0){

                        for(let item of processArray){
                            let processPartCardQuery = {query:{process:item.id}};
                            let option ={
                                order:['id']
                            }
                            let processPartCardArray =  await findAndCount(processPartCardQuery,ProcessPartCard_1,1,option);
//                    console.log('processPartCardArray')
//                    console.log(processPartCardArray)

                            let OneProcess = processPartCardArray.reduce((a,b)=>{
                                a.part.push(b.partCardData.part);
                                a.partID.push(b.partCardData.id);

                                return a;

                            },{process:item.id, processID:item.processID, type:item.type, name:item.name,part:[],partID:[]})

                            OneProcess.part = OneProcess.part.sort();

                            if(OneProcess.part.length !==0){

                                console.log('OneProcess.part')
                                console.log(OneProcess.part)
                                OneProcess.partID = OneProcess.partID.sort();
                                OneProcess.length = OneProcess.part.length;
                                partCollection = partCollection.concat(OneProcess.part);
                                lengthCollection = lengthCollection.concat(OneProcess.length)
                                processCollection.push(OneProcess)
                            }

                        }

                        partCollection = [...new Set(partCollection)];
                        lengthCollection = [...new Set(lengthCollection)].sort();
                        processCollection.sort((a,b)=>{
                            return a.length - b.length;
                        });

                        let classifyProcessByPart =  partCollection.map(value => {

                            let onePartArray = processCollection.filter(value1 => {
                                let result = value1.part.find(value2=>{
                                    return (value2 === value);
                                });

                                if(result){
                                    return true;
                                }

                            });

                            onePartArray.sort((a,b)=>{
                                return (a.processID - b.processID);
                            })
                            return {part:value,collection:onePartArray};

                        });

                        let tempResult = classifyProcessByPart.map(value1 => {

                            let temp = lengthCollection.map(value => {
                                let sameLengthArray =  value1.collection.filter(value2 => {
                                    if(value2.length  === value){
                                        return true;
                                    }
                                });

                                sameLengthArray.sort((a,b)=>{
                                    return (a.processID - b.processID);
                                })
                                return sameLengthArray;
                            });

                            temp = temp.reduce((a,b)=>{
                                a = a.concat(b);
                                return a;
                            },[]);

                            return {part:value1.part,collectionLength:temp.length, collection:temp};
                        });
//                console.log('tempResult')
//                console.log(JSON.stringify(tempResult))

                        tempResult.sort((a,b)=>{
                            return b.collectionLength - a.collectionLength;
                        })

//                console.log('lengthCollection')
//                console.log(lengthCollection)


                        let lengthKeyCollection = [];
                        let finalResultArray = lengthCollection.map(value => {
                            let treeJosn ={};
                            let oneLevelArray =tempResult.map(value1 => {

                                let tempArray = value1.collection.filter(value2 =>{
                                    if(value2.length === value){
                                        return true;
                                    }
                                })


                                return {part:value1.part,node:tempArray}
                            })

                            //           treeJosn[`Level${value}`] = oneLevelArray


                            if(value > 1){

                                oneLevelArray =oneLevelArray.reduce((a,b)=>{
                                    a.node = a.node.concat(b.node);
                                    return a;
                                },{node:[]});

                            }


                            if(value > 1){
                                //                       console.log('oneLevelArray')
                                //                       console.log(oneLevelArray)

                                treeJosn.part =  oneLevelArray.node.reduce((a,b)=>{

                                    let flag = isContained(a[a.length -1],b.part);
                                    if(!flag){
                                        a.push(b.part)
                                    }

                                    return a;


                                },[]);

                                oneLevelArray.node = treeJosn.part.map(value1 => {

                                    let sameOne = oneLevelArray.node.filter(value2 => {

                                        let flag = isContained(value2.part,value1);
                                        if(flag){
                                            return true;
                                        }

                                    })

                                    console.log('sameOne')
                                    console.log(sameOne)

                                    let processArray = sameOne.map(value2=>{
                                        return value2.process;
                                    })

                                    let processTypeArray = [...new Set(processArray)];
                                    console.log('processTypeArray')
                                    console.log(processTypeArray)

                                    let tempArrray = [];
                                    for(let item of processTypeArray){

                                        let findOne = sameOne.find(value1=>{
                                            if(value1.process === item){
                                                return true;
                                            }
                                        })

                                        if(findOne){
                                            tempArrray.push(findOne)
                                        }
                                    }

                                    sameOne = tempArrray;

                                    return sameOne;


                                });

                                oneLevelArray.part = treeJosn.part;
                                delete treeJosn.part;

                            }


                            treeJosn.level = value;
                            treeJosn.branch = oneLevelArray;


                            lengthKeyCollection.push(value);
                            return treeJosn;

                        })

                        lengthKeyCollection.sort((a,b)=>{
                            return b-a;
                        });


                        let modifyElement = [];
                        modifyElement.push(finalResultArray[0])

                        //               console.log('modifyElement')
                        //               console.log(modifyElement)

                        let tempJson= {
                            part:[],
                            node:[]
                        };

                        tempJson.part = modifyElement[0].branch.map(value => {
                            return value.part;
                        });

                        tempJson.part = tempJson.part.sort();

                        tempJson.node = tempJson.part.map(value =>{

                            let findOne = modifyElement[0].branch.find(value1=>{
                                if(value1.part === value){
                                    return true;
                                }
                            })
                            return findOne.node;
                        });

//                console.log(tempJson)
                        finalResultArray[0] = {level: 1,branch:tempJson}

                        let finalResult =  {level:lengthKeyCollection, rawTree:finalResultArray}

//                console.log('lengthKeyCollection')
//                console.log(JSON.stringify(lengthKeyCollection))

//                console.log('finalResultArray')
//                console.log(JSON.stringify(finalResultArray))

                        let levelArray = finalResult.level.sort()
//                console.log('levelArray')
//                console.log(levelArray)

                        for(let x of levelArray){

                            let findOne = findOneByLevel (finalResult,x)
                            console.log('findOne===============')

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

                            if(item.length === 0){
                                continue;
                            }
                            let partType = item[item.length - item.length].part;


                            let levelCropArray =levelArray.slice(1);

                            let partList = {
                                part:partType,
                                list : item
                            }
//                    console.log('levelCropArray')
//                    console.log(levelCropArray)

                            let totalArray =  levelCropArray.map((value,index) => {

                                let findSecondOne = findOneByLevel (finalResult,value);

                                if(findSecondOne){

                                    let secondPart = findSecondOne.branch.part;
                                    let secondNode = findSecondOne.branch.node;
                                    for(let z = 0; z < secondPart.length; z++){
//                    console.log('+++++++++++++++++>>>')
//                    console.log(secondPart)
//                    console.log(value)
//                    console.log('+++++++++++++++++<<<<')
                                        let flag =isContained(secondPart[z],partType);
                                        if(flag){
                                            //   item[item.length - 1].nextProcess = secondNode[y]
                                            //                       console.log('====================')
//                        console.log(secondNode[y])
                                            let secondArray = secondNode[z];
                                            //                                   console.log(secondArray)
//                                item[item.length-1].nextProcess = secondArray[secondArray.length - secondArray.length].process;
                                            partList.list[partList.list.length-1].nextProcess = secondArray[secondArray.length - secondArray.length].process;
                                            partList.list = partList.list.concat(secondArray);
                                            break;
                                        }
                                    }
                                    //          console.log(JSON.stringify(partList))
                                    if(index === levelCropArray.length-1){
                                        return partList
                                    }else{
                                        return {};
                                    }

//            return value;
                                }
                            })
//                console.log('totalArray')
//                console.log(JSON.stringify(totalArray))

                            listArray.push(totalArray[totalArray.length-1])
                        }

                        listArray.sort((a,b)=>{
                            return b.list.length - a.list.length;
                        });
                        res = listArray;

                    }

                }

            }


            ctx.body = res;
            ctx.status = 200;
            ctx.respond = true;

        }
        catch (e) {
            console.log(e);
            ctx.throw('db.invalidQuery:97', 400);
        }
    })


}