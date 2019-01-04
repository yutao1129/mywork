"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const dbquery_1 = require("../database/dbquery");
const OrderDeliveryPlan_1 = require("../database/models/OrderDeliveryPlan");
const ProductionScheduling_1 = require("../database/models/ProductionScheduling");
const PrecedingTeamScheduling_1 = require("../database/models/PrecedingTeamScheduling");
const PrecedingTeamOutput_1 = require("../database/models/PrecedingTeamOutput");
const SewingTeamScheduling_1 = require("../database/models/SewingTeamScheduling");
const SewingTeamOutput_1 = require("../database/models/SewingTeamOutput");
const FollowingTeamScheduling_1 = require("../database/models/FollowingTeamScheduling");
const FollowingTeamOutput_1 = require("../database/models/FollowingTeamOutput");
const Factory_1 = require("../database/models/Factory");
const Order_1 = require("../database/models/Order");
const commonAPI_1 = require("./commonAPI.js");
const Sequelize_1 = require("sequelize");
const Op = Sequelize_1.Op;


const Role_1 = require("../database/models/Role");
const Module_1 = require("../database/models/Module");


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
        queryInstance.where = Object.assign(queryInstance.where,condition);
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

exports.registerDistributionDetailsComplexAPI = function (distributionDetailsComplexRouter) {

    distributionDetailsComplexRouter.post('/distributionDetailsComplex/search', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:69', 400);
        }else{

            if (false === dbquery_1.checkRequestParamObject(ctx.request.body.query)) {
                ctx.throw('api.queryIsEmpty:70', 400);
            }else{

                let query = ctx.request.body.query;
                let order = query.order;

                if (!order || order == undefined) {
                    ctx.throw('db.invalidParameters:style', 400);
                }

                let res = [];
                let currentData = (new Date()).toISOString().slice(0,10);
                try {

                    let orderDeliveryPlanQuery = {query:{order:order}};
                    let orderDeliveryPlanArray = await findAndCount(orderDeliveryPlanQuery,OrderDeliveryPlan_1,1);

                    console.log('orderDeliveryPlanArray')
                    console.log(orderDeliveryPlanArray)


                    if(orderDeliveryPlanArray.length > 0){
                        let orderDeliveryPlanID = orderDeliveryPlanArray.map(value=>{
                            return value.id;
                        })

                        let productionSchedulingQuery = {query:{}};
                        let option = {
                            attributes:[
                                'factory',
                                [Sequelize_1.fn('SUM', Sequelize_1.col('amount')), 'amountSum'],
                                [Sequelize_1.fn('GROUP_CONCAT', Sequelize_1.col('`ProductionScheduling`.`id`')), 'idArray'],
                                [Sequelize_1.fn('ABS', order), 'order'],
                                [Sequelize_1.fn('CONCAT', Sequelize_1.col('`factoryData`.`name`')), 'name'],
                            ],
                            include:[
                                {
                                    model: Factory_1.Factory,
                                    attributes:[]
                                },

                            ],
                            group:['factory'],
                            order:['factory']

                        }

                        let condition = {orderDeliveryPlan:{[Op.in]:orderDeliveryPlanID}}
                        let productionSchedulingArray = await findAndCount(productionSchedulingQuery,ProductionScheduling_1,0,option,condition);
                        console.log('productionSchedulingArray')
                        console.log(productionSchedulingArray)

                        if(productionSchedulingArray.length > 0){

                            for(let x of productionSchedulingArray){

                                let productionSchedulingIDArray = x.idArray.split(',').map(value => {
                                    return parseInt(value)
                                });
                                delete x.idArray;

                                let precedingTeamSchedulingQuery = {query: {/*, cropStartDate: {[Op.lte]:currentData},cropEndDate: {[Op.gte]:currentData}*/}};

                                let condition = {productionScheduling:{[Op.in]:productionSchedulingIDArray}}
                                let precedingTeamSchedulingArray = await findAndCount(precedingTeamSchedulingQuery,PrecedingTeamScheduling_1,0,{},condition);

                                console.log('precedingTeamSchedulingArray')
                                console.log(precedingTeamSchedulingArray)
                                if(precedingTeamSchedulingArray.length > 0){
                                    let totalDays = calculateDayCount(precedingTeamSchedulingArray[0].cropStartDate,precedingTeamSchedulingArray[0].cropEndDate);
                                    console.log('totalDays');
                                    console.log(totalDays);
                                    let useDays = calculateDayCount(precedingTeamSchedulingArray[0].cropStartDate,currentData);
                                    console.log('useDays');
                                    console.log(useDays);

                                    let precedingTeamSchedulingIDArray = precedingTeamSchedulingArray.map(value =>{
                                        return value.id;
                                    });

                                    let amountSum = precedingTeamSchedulingArray.reduce((a,b)=>{
                                        return parseFloat(a) + parseFloat(b.amount);
                                    },0);

                                    console.log('precedingTeamSchedulingIDArray');
                                    console.log(precedingTeamSchedulingIDArray)
                                    let precedingTeamOutputQuery = {query:{}};
                                    let condition = {precedingTeamScheduling:{[Op.in]:precedingTeamSchedulingIDArray}};
                                    let precedingTeamOutputArray = await findAndCount(precedingTeamOutputQuery,PrecedingTeamOutput_1,0,{},condition);

                                    console.log('precedingTeamOutputArray')
                                    console.log(precedingTeamOutputArray)

                                    let completeAmount = precedingTeamOutputArray.reduce((a,b)=>{
                                        return parseFloat(a) + parseFloat(b.cropAmount);
                                    },0);

                                    let currentProgress = completeAmount/(amountSum || 1);
                                    let planProgress = useDays/totalDays;

                                    console.log(' crop-------------------->')
                                    console.log('amountSum')
                                    console.log(amountSum)
                                    console.log('crop -------------------->')
                                    console.log('completeAmount')
                                    console.log(completeAmount)

                                            x.crop = {currentProgress:currentProgress,planProgress:planProgress};
  //                                  x.crop = {amountSum:amountSum,completeAmount:completeAmount,useDays:useDays,totalDays:totalDays};
                                }else{
  //                                  x.crop = {amountSum:0,completeAmount:0,useDays:0,totalDays:0};
                                    x.crop = {currentProgress:0,planProgress:0};
                                }



                                let sewingTeamSchedulingQuery = {query: {}};
                                condition = {productionScheduling:{[Op.in]:productionSchedulingIDArray}}
                                let sewingTeamSchedulingArray = await findAndCount(sewingTeamSchedulingQuery,SewingTeamScheduling_1,0,{},condition);
                                console.log('sewingTeamSchedulingArray')
                                console.log(sewingTeamSchedulingArray)
                                if(sewingTeamSchedulingArray.length > 0){
                                    let totalDays = calculateDayCount(sewingTeamSchedulingArray[0].startDate,sewingTeamSchedulingArray[0].endDate);
                                    console.log('totalDays');
                                    console.log(totalDays);
                                    let useDays = calculateDayCount(sewingTeamSchedulingArray[0].startDate,currentData);
                                    console.log('useDays');
                                    console.log(useDays);

                                    let sewingTeamSchedulingIDArray = sewingTeamSchedulingArray.map(value =>{
                                        return value.id;
                                    });

                                    let amountSum = sewingTeamSchedulingArray.reduce((a,b)=>{
                                        return parseFloat(a) + parseFloat(b.amount);
                                    },0);

                                    console.log('sewingTeamSchedulingIDArray');
                                    console.log(sewingTeamSchedulingIDArray)
                                    let sewingTeamOutputQuery = {query:{}};
                                    let condition = {sewingTeamScheduling:{[Op.in]:sewingTeamSchedulingIDArray}}
                                    let sewingTeamOutputArray = await findAndCount(sewingTeamOutputQuery,SewingTeamOutput_1,0,{},condition);

                                    console.log('sewingTeamOutputArray')
                                    console.log(sewingTeamOutputArray)
/*
                                    let completeAmount = sewingTeamOutputArray.reduce((a,b)=>{
                                        return parseFloat(a) + parseFloat(b.amount);
                                    },0);
*/
                                    let completeAmount = await commonAPI_1.getAmountSumFromQualityInspectionForSwing(x.order,x.factory);

                                            let currentProgress = completeAmount/(amountSum || 1)

                                            let planProgress = useDays/totalDays;

                                            x.swing = {currentProgress:currentProgress,planProgress:planProgress};
 //                                   x.swing = {amountSum:amountSum,completeAmount:completeAmount,useDays:useDays,totalDays:totalDays};
                                }else{
//                                    x.swing = {amountSum:0,completeAmount:0,useDays:0,totalDays:0};
                                    x.swing = {currentProgress:0,planProgress:0};
                                }




                                let followingTeamSchedulingQuery = {query: {/*, packStartDate: {[Op.lte]:currentData},packEndDate: {[Op.gte]:currentData}*/}};
                                condition = {productionScheduling:{[Op.in]:productionSchedulingIDArray}};
                                let followingTeamSchedulingArray = await findAndCount(followingTeamSchedulingQuery,FollowingTeamScheduling_1,0,{},condition);

//                                console.log('followingTeamSchedulingArray')
//                                console.log(followingTeamSchedulingArray)
                                if(followingTeamSchedulingArray.length > 0){
                                    let totalDays = calculateDayCount(followingTeamSchedulingArray[0].packStartDate,followingTeamSchedulingArray[0].packEndDate);
                                    console.log('totalDays');
                                    console.log(totalDays);
                                    let useDays = calculateDayCount(followingTeamSchedulingArray[0].packStartDate,currentData);
                                    console.log('useDays');
                                    console.log(useDays);

                                    let followingTeamSchedulingIDArray = followingTeamSchedulingArray.map(value =>{
                                        return value.id;
                                    });

                                    let amountSum = followingTeamSchedulingArray.reduce((a,b)=>{
                                        return parseFloat(a) + parseFloat(b.amount);
                                    },0);

                                    console.log('followingTeamSchedulingIDArray');
                                    console.log(followingTeamSchedulingIDArray)
                                    let followingTeamOutputQuery = {query:{}};
                                    let condition = {followingTeamScheduling:{[Op.in]:followingTeamSchedulingIDArray}};
                                    let followingTeamOutputArray = await findAndCount(followingTeamOutputQuery,FollowingTeamOutput_1,0,{},condition);

                                    console.log('followingTeamOutputArray')
                                    console.log(followingTeamOutputArray)

                                    let completeAmount = followingTeamOutputArray.reduce((a,b)=>{
                                        return parseFloat(a) + parseFloat(b.packAmount);
                                    },0);

                                    let currentProgress = completeAmount/(amountSum || 1)

                                    let planProgress = useDays/totalDays;

                                            x.pack = {currentProgress:currentProgress,planProgress:planProgress};
//                                    x.pack = {amountSum:amountSum,completeAmount:completeAmount,useDays:useDays,totalDays:totalDays};
                                }else{
//                                    x.pack = {amountSum:0,completeAmount:0,useDays:0,totalDays:0};
                                    x.pack = {currentProgress:0,planProgress:0};
                                }

                            }

                        }

                        console.log('productionSchedulingArray1')
                        console.log(productionSchedulingArray)
                        res = productionSchedulingArray;
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


    });

/*
{"query":{"orderID":"O20181106"}}
 */

    distributionDetailsComplexRouter.post('/distributionDetailsComplex/orderID/search', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:69', 400);
        }else{

            if (false === dbquery_1.checkRequestParamObject(ctx.request.body.query)) {
                ctx.throw('api.queryIsEmpty:70', 400);
            }else{

                let query = ctx.request.body.query;
                let orderID = query.orderID;

                if (!orderID || orderID == undefined) {
                    ctx.throw('db.invalidParameters:style', 400);
                }

                let res = [];
                try {

                    let orderQuery = {query:{orderID:orderID}};
                    let orderArray = await findAndCount(orderQuery,Order_1,0);

//                    console.log('orderArray')
//                    console.log(orderArray)

                    let errMessage = '';
                    if(orderArray.length > 0){

                        let orderidArray = orderArray.map(value =>{
                            return {id: value.id, status:value.status, deliveryDate:value.deliveryDate};
                        });


                        let result = [];
                        for(let item of orderidArray){

                            let defaultValue = {cropCompleteAmount:0,sewingCompleteAmount:0,packCompleteAmount:0,totalAmountp:0};
                            let orderDeliveryPlanQuery = {query:{order:item.id}};
                            let orderDeliveryPlanArray = await findAndCount(orderDeliveryPlanQuery,OrderDeliveryPlan_1,0);
//                            console.log('orderDeliveryPlanArray');
//                            console.log(orderDeliveryPlanArray);

                            if(orderDeliveryPlanArray.length > 0){

                                let orderDeliveryPlanIDArray = orderDeliveryPlanArray.map(value=>{
                                    return value.id
                                });

                                let totalAmount = orderDeliveryPlanArray.reduce((a,b)=>{
                                    let sum  = a + parseFloat(b.totalAmount);
                                    return sum;
                                },0);

                                item.totalAmount = totalAmount;

                                let productionSchedulingQuery = {query:{}};

                                let option = {
                                    attributes: [
                                        [Sequelize_1.fn('SUM', Sequelize_1.col('amount')), 'totalAmountp'],
                                        [Sequelize_1.fn('SUM', Sequelize_1.col('cropCompleteAmount')), 'cropCompleteAmount'],
                                        [Sequelize_1.fn('SUM', Sequelize_1.col('sewingCompleteAmount')), 'sewingCompleteAmount'],
                                        [Sequelize_1.fn('SUM', Sequelize_1.col('packCompleteAmount')), 'packCompleteAmount']
                                    ]

                                }

                                let condition = {orderDeliveryPlan:{[Op.in]:orderDeliveryPlanIDArray}};
                                let productionSchedulingArray =  await findAndCount(productionSchedulingQuery,ProductionScheduling_1,0,option,condition);

//                                console.log('productionSchedulingArray');
//                                console.log(JSON.stringify(productionSchedulingArray) );

                                if(productionSchedulingArray.length >0){

                                    result.push( Object.assign(item,productionSchedulingArray[0]) )

                                }else{
//                                    errMessage = `订单(${orderID})没有相关联的排产计划！`;
//                                    ctx.throw(errMessage, 400);
//                                    console.log('item')
//                                    console.log(item)
                                    result.push(Object.assign(item,defaultValue));
                                }

                            }else{
                                item.totalAmount = 0;
                                result.push(Object.assign(item,defaultValue));
//                                errMessage = `订单(${orderID})没有相关联的订单交付计划！`;
//                                ctx.throw(errMessage, 400);
                            }

                        }


//                        console.log('result')
//                        console.log(result)

                        result.map(value => {
                            value.cropAcountProcess =  parseFloat(value.cropCompleteAmount) /(parseFloat(value.totalAmountp) || 1);
                            value.sewingAcountProcess = parseFloat(value.sewingCompleteAmount)/(parseFloat(value.totalAmountp) || 1);
                            value.packAmountProcess = parseFloat(value.packCompleteAmount)/(parseFloat(value.totalAmountp) || 1);
                            delete value.cropCompleteAmount;
                            delete value.sewingCompleteAmount;
                            delete value.packCompleteAmount;
                            delete value.totalAmountp;
                        });

//                        console.log('result')
//                        console.log(result)

                        res = result;

                    }else{
                        errMessage = `订单(${orderID})数据库里不存在！`;
                        ctx.throw(errMessage, 400);
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


    });


    distributionDetailsComplexRouter.post('/roleComplex/search', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:69', 400);
        }else{

            if (false === dbquery_1.checkRequestParamObject(ctx.request.body.query)) {
                ctx.throw('api.queryIsEmpty:70', 400);
            }else{

                let query = ctx.request.body.query;
                let roleData = query.roleData;

                if (!roleData || roleData == undefined || !Array.isArray(roleData)) {
                    ctx.throw('db.invalidParameters:roleData', 400);
                }

                let res = [];
                try {

                    let roleQuery = {query:{role:{[Op.in]:roleData}}};
                    let roleArray = await findAndCount(roleQuery,Role_1,0);

                    console.log('roleArray')
                    console.log(roleArray)

                    if(roleArray.length > 0){
                        let idArray = roleArray.reduce((a,b) =>{

                            let tempJson = JSON.parse(b.permission);
                            let tempidArray = tempJson.id.split(',')
                            tempidArray = tempidArray.filter(value => {
                                value = parseInt(value)
                                console.log(value);
                                if(Number.isNaN(value) === false)
                                    return true;
                            });

                            tempidArray =  tempidArray.map(value => {
                                return parseInt(value)
                            });

                             a = a.concat(tempidArray);
                            return a;
                        },[]);



                        idArray =  [...new Set(idArray)];

                        console.log('idArray')
                        console.log(idArray)

                        let moduleQuery = {query:{}};
                        let option = {
                            attributes:[
                                'id',
                                'modulename'
                            ]
                        };
                        let condition = {id:{[Op.in]:idArray}}
                        let moduleArray = await findAndCount(moduleQuery,Module_1,0,option,condition);

                        console.log('moduleArray');
                        console.log(moduleArray);


                        res = moduleArray;
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


    });
}