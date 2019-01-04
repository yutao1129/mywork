"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const dbquery_1 = require("../database/dbquery");
const StyleProcess_1 = require("../database/models/StyleProcess");
const Process_1 = require("../database/models/Process");
const Sequelize_1 = require("sequelize");
const Op = Sequelize_1.Op;

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
        console.log('condition')
        console.log(condition)
        queryInstance.where = Object.assign(queryInstance.where,condition)
    }

    console.log('queryInstance');
    console.log(queryInstance);

    let oneDoc = await modelInstance[modelInstanceKeys[0]].findOne(queryInstance);
    return  oneDoc;
}

const findAndCount = async function (query,modelInstance,join,option){
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
}

exports.registerStyleProcessComplexAPI = function (styleProcessComplexRouter) {

    styleProcessComplexRouter.post('/styleProcessComplex/search', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:69', 400);
        }else{

            if (false === dbquery_1.checkRequestParamObject(ctx.request.body.query)) {
                ctx.throw('api.queryIsEmpty:70', 400);
            }else{

                let query = ctx.request.body.query;

                let style = query.style;
                let type = query.type;

                if (!style || style == undefined) {
                    ctx.throw('db.invalidParameters:style', 400);
                }

                if (!type || type == undefined) {
                    ctx.throw('db.invalidParameters:type', 400);
                }

                let res = [];

                try {

                    let styleProcessQuery = {query:{style:style}};
                    let styleProcessArray = await findAndCount(styleProcessQuery,StyleProcess_1,0);

                    console.log('styleProcessArray')
                    console.log(styleProcessArray)

                    if(styleProcessArray.length > 0){

                        let processIDArray = styleProcessArray.map(value =>{
                            return value.process;
                        });


                        let processQuery = {query:{id:{[Op.in]:processIDArray},type:type}};
                        let option = {
//                            group:['id'],
                            order:['partCard']

                        }
                        let processArray = await findAndCount(processQuery,Process_1,1,option);
                        console.log('processArray')
                        console.log(processArray);

                        if(processArray.length > 0){

                            let partCardArray =  processArray.map(value=>{
                                return value.partCard;
                            });

                            let partCardTypeArray = [...new Set(partCardArray)];

                            let resultArray = partCardTypeArray.map(value => {

                                let partCardTemp = [];
                                for(let item of processArray){
                                    if(item.partCard === value) {
                                        partCardTemp.push(item);
                                    }
                                }

                                partCardTemp.sort((a,b)=>{
                                    return a.id - b.id;
                                })

                                return {partCard: value, process:partCardTemp}

                            });

                            console.log(resultArray)

                            res = resultArray;

                        }


                    }

                    ctx.body = res;
                    ctx.status = 200;
                    ctx.respond = true;

                }
                catch (e) {
                    console.log(e);
                    ctx.throw(e.message, 400);
                }

            }

        }


    })


}