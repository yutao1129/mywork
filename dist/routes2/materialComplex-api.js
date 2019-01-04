"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const dbquery_1 = require("../database/dbquery");
const Order_1 = require("../database/models/Order");
const Material_1 = require("../database/models/Material");
const PurchasePlan_1 = require("../database/models/PurchasePlan");
const OrderDeliveryPlan_1 = require("../database/models/OrderDeliveryPlan");
const MaterialReceiving_1 = require("../database/models/MaterialReceiving");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

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


let getTotalAmountByStyle = async function(style){

    let result = [];
    let orderQuery = {query:{style:style}};
    let orderArray =  await findAndCount(orderQuery,Order_1,0);
//    console.log('orderArray');
//    console.log(orderArray);

    if(orderArray.length > 0){

        let orderIDRepeatTypeArray = orderArray.map(valve =>{
            return valve.id
        });

        let orderIDTypeArray = [...new Set(orderIDRepeatTypeArray)].sort((a, b) => {
            return a - b
        });
//        console.log('orderIDTypeArray');
//        console.log(orderIDTypeArray);

        let orderDeliveryQuery = {query:{}};
        let orderDeliveryArray =  await findAndCount(orderDeliveryQuery,OrderDeliveryPlan_1,0,{},{order:{[Op.in]:orderIDTypeArray}});
//        console.log('orderDeliveryArray');
//        console.log(orderDeliveryArray);

        if(orderDeliveryArray.length > 0){

            let resultArray = orderIDTypeArray.map(value => {

                let subArray = orderDeliveryArray.filter(value1=>{
                    let flag = value1.totalAmount - ((value1.outsourcingAmount||0) +(value1.completed||0));

//                    console.log('flag')
//                    console.log(flag)
                    if((value1.order === value) && (flag > 0)){
                        value1.sub = flag;
                        return true;
                    }
                });

                let sum = subArray.reduce((a,b)=>{

                    return a + b.sub;

                },0);

                return {order:value,sum:sum}
            });








            result = resultArray .filter(value => {
                if(value.sum > 0){
                    return true;
                }
            });

        }
    }

    return result;
};

exports.registerMaterialComplexAPI = function (materialComplexRouter) {

    materialComplexRouter.post('/materialComplex/search', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:69', 400);
        }else {

            if (false === dbquery_1.checkRequestParamObject(ctx.request.body.query)) {
                ctx.throw('api.queryIsEmpty:70', 400);
            }else{

                let query = ctx.request.body.query;


                if (!query.order || query.order == undefined) {
                    ctx.throw('db.invalidParameters:C1', 400);
                }

                let  order = query.order;
                let  type = query.type;

//                console.log('type')
//                console.log(type)

                try {
                    let res = [];
                    let orderQuery = {query:{id:order}};
                    let orderOne = await findOne(orderQuery,Order_1,0,{attributes:["id",'style'], sort:['id'],raw:true});
 //                   console.log('orderOne');
 //                   console.log(orderOne);

                    if(orderOne){
                        let materialQuery ={}
                        if(!type || type == undefined){
                            materialQuery = {query:{style:orderOne.style}};
                        }else{
                            materialQuery = {query:{style:orderOne.style,type:type}};
                        }

                        let materialArray = await findAndCount(materialQuery,Material_1,0);
                        //console.log('materialArray');
                        //console.log(materialArray);

                        res.push({materialData:materialArray});
                    }else{
                        ctx.throw(`数据库Order表里没有order：${order}的记录`, 400);
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
    {
        "query":{
        "action":"delete",
            "style":"KTest20181107",
            "id":"33",
            "materialID":"a002",
            "name":"沙发",
            "category":"麻",
            "type":"面料",
            "color":"黑色",
            "spec":"a12",
            "width":128,
            "photo":6666,
            "unit":"米",
            "usageAmount":12.2,
            "consumption":0.2
    }

    }
*/
    materialComplexRouter.post('/materialComplex/update', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:69', 400);
        }else {
            if(!ctx.request.body.query){
                ctx.throw('api.queryIsEmpty', 400);
            }

            let query = ctx.request.body.query;
            let nowDate = new Date(new Date().getTime() + 28800000).toISOString();

            if (!query.action || query.action == undefined) {
                ctx.throw('api.invalidParameters:action', 400);
            }

            if (!query.style || query.style == undefined) {
                ctx.throw('api.invalidParameters:style', 400);
            }

            if (!query.id || query.id == undefined) {
                ctx.throw('api.invalidParameters:id', 400);
            }

            if (!query.usageAmount || query.usageAmount == undefined) {
                ctx.throw('api.invalidParameters:usageAmount', 400);
            }

            let action  = query.action;
            let id = query.id;
            let usageAmount = query.usageAmount;

            console.log(query)

            try {

                let orderResultArray = await getTotalAmountByStyle(query.style);
                console.log('orderResultArray')
               console.log(orderResultArray)
                let result = {action:action,status:0};
                if(action === "new"){
                    if(orderResultArray.length > 0){
                        let purchasePlanArray = orderResultArray.map(value=>{
                            let purchasePlan = {
                                material: id,
                                order:null,
                                orderUsageAmount:0,
                                purchaseAmount:0,
                                unitUsageAmount:0,
                                createdTime:null,
                                updatedTime:null
                            }

                            purchasePlan.order = value.order;
                            purchasePlan.orderUsageAmount = parseFloat(usageAmount) * parseFloat(value.sum);
                            purchasePlan.purchaseAmount = parseFloat(usageAmount) * parseFloat(value.sum);
                            purchasePlan.unitUsageAmount = parseFloat(usageAmount);
                            purchasePlan.createdTime = nowDate;
                            purchasePlan.updatedTime = nowDate;
                            return purchasePlan;
                        });
//                        console.log('purchasePlanArray')
//                        console.log(purchasePlanArray)

                        let purchasePlanCreateArray = await PurchasePlan_1.PurchasePlan.bulkCreate(purchasePlanArray);
                        let purchasePlanCreateIDArray = purchasePlanCreateArray.map(value => {
                            return value.id;
                        });

                        result.status = 1;
                        result.purchasePlanCreateIDArray =  purchasePlanCreateIDArray;
                    }else{
                        result.status = 0;
                        result.purchasePlanCreateIDArray =  [];
                    }

                }else if((action === "delete") || (action === "edit")){

                    if(orderResultArray.length > 0){

                        let purchasePlanID = [];
                        let materialReceivingID = [];
                        for(let item of orderResultArray){
                            let purchasePlanQuery = {query:{order:item.order,material:id}};
                            let purchasePlanOne = await findOne(purchasePlanQuery,PurchasePlan_1,0,{raw:true});
                            if(purchasePlanOne){

                                purchasePlanID.push(purchasePlanOne.id);

                                let materialReceivingQuery = {query:{purchaseItem:purchasePlanOne.id}};
                                let option = {
                                    attributes: [
                                        'id',
                                        'purchaseItem'
//                                        [sequelize.fn('SUM', sequelize.col('length')), 'lengthSum']
                                    ]
                                };
                                let materialReceivingArray = await findAndCount(materialReceivingQuery,MaterialReceiving_1,0,option);
                                let materialReceivingIDArray = materialReceivingArray.map(value=>{
                                    return value.id
                                });

                                materialReceivingID = materialReceivingID.concat(materialReceivingIDArray);

                            }
                        }

                        if (purchasePlanID.length > 0){
                            result.status = 0;
                            result.purchasePlanID = purchasePlanID;
                            result.materialReceivingID = materialReceivingID;
                        }else{
                            result.status = 1;
                            result.purchasePlanID = purchasePlanID;
                            result.materialReceivingID = materialReceivingID;
                        }

                    }else{
                        result.status = 1;
                    }

                }


                ctx.body = result;
                ctx.status = 200;
                ctx.respond = true;

/*

                let action = query.action;
                let resultJsonArray = await getTotalAmountByStyle(query.style);
                let resJson = {
                    purchasePlanCreateCount:null,
                    delRelatedOrderDeliveryPlan:null,
                    editRelatedOrderDeliveryPlan:null
                };

                if ((action === "new")&&(resultJsonArray.length > 0)) {

                    console.log(resultJsonArray);
                    let purchasePlanQuery = {query:{order:resultJsonArray[0].order}};
                    let purchasePlanArray = await findAndCount(purchasePlanQuery,PurchasePlan_1,0);
                    if(purchasePlanArray.length > 0){
                        let updateArray = resultJsonArray.map(value=>{
                            let purchasePlan = {
                                material: null,
                                order: null,
                                purchaser: null,
                                supplier: null,
                                unitUsageAmount: null,
                                orderUsageAmount: null,
                                purchaseAmount: null,
                                unitPrice: null,
                                description: null,
                                status: null,
                                createdTime: null,
                                updatedTime: null,
                                receiveTime: null,
                                inspection: null
                            };
                            purchasePlan.material = query.material;
                            purchasePlan.order = value.order;
                            purchasePlan.purchaser = purchasePlanArray[0].purchaser;
                            //purchasePlan.supplier = purchasePlanArray[0].supplier;
                            purchasePlan.unitUsageAmount = query.usageAmount || 0;
                            purchasePlan.orderUsageAmount = (parseInt(query.usageAmount) || 0) * parseInt(value.sum);
                            purchasePlan.purchaseAmount = (parseInt(query.usageAmount) || 0)  * parseInt(value.sum);
                            purchasePlan.createdTime = nowDate;
                            purchasePlan.updatedTime = nowDate;

                            return purchasePlan;
                        });
                        if (updateArray.length > 0) {
                            let purchasePlanCreateData = await PurchasePlan_1.PurchasePlan.bulkCreate(updateArray);
                            let purchasePlanCreateArray = purchasePlanCreateData.map((item) => {
                                return item.id;
                            });

                            res.purchasePlanCreateCount = purchasePlanCreateArray.length;
                        }
                    }
                }
                else if((action === "delete")||(action === "edit")){

                    if(resultJsonArray.length > 0){

                        for(let x = 0; x < resultJsonArray.length; x++){

                            let purchasePlanQuery = {query:{order:resultJsonArray[x].order,material:query.id}};
                            let purchasePlanOne = await findOne(purchasePlanQuery,PurchasePlan_1,0,{raw:true});

                            if(purchasePlanOne){
                                //存在采购计划
                                let materialReceivingQuery = {query:{purchaseItem:purchasePlanOne.id}};
                                let option = {
                                    attributes: [
                                        'id',
                                        'purchaseItem',
                                        [sequelize.fn('SUM', sequelize.col('length')), 'lengthSum']
                                    ]
                                };
                                let materialReceivingArray = await findAndCount(materialReceivingQuery,MaterialReceiving_1,0,option);
                                if(materialReceivingArray.length > 0){
                                    if(materialReceivingArray[0].lengthSum >= purchasePlanOne.purchaseAmount){
                                        //料已全部收完，可以删除
                                    }else{
                                        //存在未完成的采购计划以及收料计划
                                        resJson.purchasePlanExist = 1;
                                        resJson.materialReceivingExist = 1;
                                    }
                                }
                            }
                        }
                        resJson.delRelatedOrderDeliveryPlan
                    }
                }
                else if(action === "edit"){
                    if(resultJsonArray.length > 0){

                    }

                }
*/


            }
            catch (e) {
                console.log(e);
                ctx.throw(e.message, 400);
            }
        }
    })

};
