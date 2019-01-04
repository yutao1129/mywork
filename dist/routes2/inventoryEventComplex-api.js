"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const dbquery_1 = require("../database/dbquery");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const InventoryEvent_1 = require("../database/models/InventoryEvent");
const PurchasePlan_1 = require("../database/models/PurchasePlan");
const MaterialReceiving_1 = require("../database/models/MaterialReceiving");

const Team_1 = require("../database/models/Team");
const OrderDeliveryPlan_1 = require("../database/models/OrderDeliveryPlan");
const ProductionScheduling_1 = require("../database/models/ProductionScheduling");
const PrecedingTeamScheduling_1 = require("../database/models/PrecedingTeamScheduling");

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

const insertOrUpdate = async function (data,query,modelInstance,join,option){
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

    let tempArray = [];
    let docs = await modelInstance[modelInstanceKeys[0]].insertOrUpdate(data,queryInstance);
    if (docs && docs.rows) {
        for (let item of docs.rows) {
            tempArray.push(item.toJSON());
        }
    }
    return  tempArray;
};

/*
{"order":"34","orderID":"10001","action":"new","eventType":"领料","executor":"2","team":"1",
"alldata":[
{"num":1,"id":"","material":"2","materialID":"002","type":"面料","width":145,"shipVolume":"1","shipLength":"0","widthList":[140]},
{"num":2,"id":"","material":"3","materialID":"003","type":"面料","width":145,"shipVolume":"1","shipLength":"0","widthList":[140]}
]
}
 */

exports.registerInventoryEventComplexAPI = function (inventoryEventComplexRouter) {

    inventoryEventComplexRouter.post('/inventoryEventComplex', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:63', 400);
        }
        else {
            try {
                let nowDate = new Date().toISOString();

                let res = {
                    updateCount: 0,
                    createCount: 0
                };

                //console.log(ctx.request.body.orderid);
                if(!ctx.request.body.order || !ctx.request.body.action || !ctx.request.body.executor ||  !ctx.request.body.team || !ctx.request.body.alldata){
                    ctx.throw('db.invalidQuery:97', 400);
                }else {

                    let teamid = ctx.request.body.team;
                    let orderid = ctx.request.body.order;
                    let orderID = ctx.request.body.orderID;

                    let alldata = ctx.request.body.alldata;

   //                 console.log('alldata')
   //                 console.log(alldata)

                    if(alldata.length > 0){

                        alldata.forEach(value=>{

                            if(value.num){
                                delete value.num;
                            }
                            if(value.materialData){
                                delete  value.materialData;
                            }

                            if(value.widthList){
                                delete  value.widthList;
                            }

                            for (let key in value ) {
                                if((typeof value[key] === 'string') && (value[key] === '')){
                                    value[key] = null;
                                }
                            }

                            value.order = ctx.request.body.order;
                            value.executor = ctx.request.body.executor;
                            value.receiver = ctx.request.body.executor;
                            value.team = ctx.request.body.team;


                            if(ctx.request.body.action === 'new'){
                                value.eventTime = nowDate;
                                delete value.id;
                            }else{
                                delete value.eventTime;
                            }

                            value.eventType = ctx.request.body.eventType;
                        });


                        if(ctx.request.body.eventType === '领料'){
                /*

                            let materialIDArray =  alldata.map(value=>{
                                return value.material;
                            });


                            let materialIDTypeArray = [...new Set(materialIDArray)];
                */

                            let materialAndWidthArray = alldata.map(value => {
                                return `${value.material}\+${value.width}`
                            });
//                    console.log('materialAndWidthArray')
//                    console.log(materialAndWidthArray)

                            let materialAndWidthTypeArray = [...new Set(materialAndWidthArray)];

                            if(materialAndWidthTypeArray.length !== materialAndWidthArray.length){
                                ctx.throw('重复的物料编号！', 400);
                            }else{

                                let totalArray = [];
                                let rejectString = "领取物料超出库存数量，";
                                let rejectCount = 0;
                                for(let item of alldata){

                                    let itemArray =[];

                                    let purchasePlanQuery = {query:{order:item.order,material:item.material}};
                                    let purchasePlanArray =  await findAndCount(purchasePlanQuery,PurchasePlan_1,0);
//                                    console.log('purchasePlanArray')
//                                    console.log(purchasePlanArray)

                                    if(purchasePlanArray.length === 0){
                                        ctx.throw('不存在生产采购计划！', 400);
                                    }else{

                                        let materialReceivingQuery = {query:{purchaseItem:purchasePlanArray[0].id,material:purchasePlanArray[0].material,width:item.width}};
                                        let materialReceivingArray =  await findAndCount(materialReceivingQuery,MaterialReceiving_1,0);

//                                        console.log('materialReceivingArray')
//                                        console.log(materialReceivingArray)

                                       let materialReceiving = materialReceivingArray.reduce((a,b)=>{

                                            return {order:item.order,material:item.material,materialID:item.materialID,length:parseFloat(a.length) + parseFloat(b.length)}

                                        },{order:item.order,material:item.material,materialID:item.materialID,length:0});

//                                        console.log('materialReceiving');
//                                        console.log(materialReceiving)

                                        itemArray.push(materialReceiving);

                                        let OneIdshipLength = 0;
                                        let inventoryEventQuery = {};
                                        if(ctx.request.body.action === 'edit'){
                                            inventoryEventQuery = {query:{order:item.order,material:item.material,width:item.width,id:{[Sequelize.Op.ne]:item.id}}};
                                        }else{
                                            inventoryEventQuery = {query:{order:item.order,material:item.material,width:item.width}};
                                        }

//                                        console.log('OneIdshipLength')
//                                        console.log(OneIdshipLength)

                                        let inventoryEventArray =  await findAndCount(inventoryEventQuery,InventoryEvent_1,0);

//                                      console.log('inventoryEventArray');
//                                      console.log(inventoryEventArray)

                                        let inventory = inventoryEventArray.reduce((a,b)=>{

                                            let result = {
                                                order:item.order,
                                                material:item.material,
                                                materialID:item.materialID,
                                                length: parseFloat(a.length) + parseFloat(b.shipLength),
                                                perLength:parseFloat(item.shipLength)
                                            }

                                            return result;

                                        },{order:item.order,material:item.material,materialID:item.materialID,length:0,perLength:parseFloat(item.shipLength)});

//                                      console.log('inventory');
//                                      console.log(inventory)

                                        itemArray.push(inventory)
//                                        console.log('itemArray');
//                                        console.log(itemArray)


                                        if(ctx.request.body.action === 'edit'){
                                            inventoryEventQuery = {query:{id:item.id}};
                                            let inventoryEventOne =  await findOne(inventoryEventQuery,InventoryEvent_1,0,{raw:true});
                                            if(inventoryEventOne){
                                                OneIdshipLength = parseFloat(inventoryEventOne.shipLength) ;
                                            }
                                        }


                                        if(itemArray[0].length < (itemArray[1].length + itemArray[1].perLength)){
                                            rejectCount++;
                                            let errorString = '';
                                            if(ctx.request.body.action === 'edit'){
                                                let total = itemArray[1].length+ OneIdshipLength;
                                                errorString = `${itemArray[0].materialID}库存数量为 ${itemArray[0].length},已领取${total},本次预领取${itemArray[1].perLength}; `;
                                            }else{
                                                errorString = `${itemArray[0].materialID}库存数量为 ${itemArray[0].length},已领取${itemArray[1].length},本次预领取${itemArray[1].perLength}; `;
                                            }
                                            rejectString += errorString + "";
                                        }



                                    }

  //                                  totalArray.push(itemArray)

                                }
/*
                                console.log('totalArray')
                               console.log(JSON.stringify(totalArray) )
*/
/*
                                totalArray.forEach(value => {
                                    if(value[0].length < (value[1].length + value[1].perLength)){
                                        rejectCount++;
                                        let errorString = '';
                                        if(ctx.request.body.action === 'edit'){
                                            let total = value[1].length+ OneIdshipLength;
                                            errorString = `${value[0].materialID}库存数量为 ${value[0].length},已领取${total},本次预领取${value[1].perLength}; `;
                                        }else{
                                            errorString = `${value[0].materialID}库存数量为 ${value[0].length},已领取${value[1].length},本次预领取${value[1].perLength}; `;
                                        }
                                        rejectString += errorString + "";
                                    }

                                });
*/
                                if(rejectCount > 0){
                                    ctx.throw(rejectString, 400);
                                }


                            }


                        }

                        alldata.forEach(value=>{
                            delete  value.materialID
                        });

                        console.log('alldata');
                        console.log(alldata);

                        if(ctx.request.body.action === 'new'){

                            let errMessage = '';
                            let validateResult = false;

                            let fabricArray =  alldata.filter(value=>{
                                if(value.type === '面料'){
                                    return true;
                                }

                            });

                            if(fabricArray.length > 0){

                                let teamQuery = {query:{id:teamid}};
                                let teamOne =  await findOne(teamQuery,Team_1,1,{raw: true});
                                if(teamOne){
//                                    console.log('teamOne')
//                                    console.log(teamOne)

                                    let factoryid = teamOne.factory;
                                    let factoryName = teamOne['factoryData.name'];

                                    let orderDeliveryPlanQuery = {query:{order:orderid}};
                                    let orderDeliveryPlanArray =  await findAndCount(orderDeliveryPlanQuery,OrderDeliveryPlan_1,0);

 //                                   console.log('orderDeliveryPlanArray')
//                                    console.log(orderDeliveryPlanArray)

                                    if(orderDeliveryPlanArray.length > 0){

                                        let orderDeliveryPlanIDArray = orderDeliveryPlanArray.map(value=>{
                                            return value.id
                                        });

                                        let productionSchedulingQuery = {query:{factory:factoryid}};
                                        let condition = {orderDeliveryPlan:{[Op.in]:orderDeliveryPlanIDArray}};
                                        let productionSchedulingArray =  await findAndCount(productionSchedulingQuery,ProductionScheduling_1,0,{},condition);

//                                        console.log('productionSchedulingArray')
//                                        console.log(productionSchedulingArray)

                                        if(productionSchedulingArray.length >0){

                                            let productionSchedulingIDArray = productionSchedulingArray.map(value=>{
                                                return value.id
                                            });

//                                            console.log('productionSchedulingIDArray')
//                                            console.log(productionSchedulingIDArray)
                                            let precedingTeamSchedulingQuery = {query:{cropTeam:teamid}};
                                            let condition = {productionScheduling:{[Op.in]:productionSchedulingIDArray}};
                                            let precedingTeamSchedulingArray =  await findAndCount(precedingTeamSchedulingQuery,PrecedingTeamScheduling_1,0,{},condition);

//                                            console.log('precedingTeamSchedulingArray')
//                                            console.log(precedingTeamSchedulingArray)

                                            if(precedingTeamSchedulingArray.length > 0){
                                                validateResult = true;
                                            }else{
                                                errMessage = `订单(${orderID})AND工厂(${factoryName})没有相关联的前道排产计划！`;
                                                ctx.throw(errMessage, 400);
                                            }


                                        }else{
                                            errMessage = `订单(${orderID})AND工厂(${factoryName})没有相关联的排产计划！`;
                                            ctx.throw(errMessage, 400);

                                        }

                                    }else{
                                        errMessage = `订单(${orderID})没有相关联的订单交付计划！`;
                                        ctx.throw(errMessage, 400);
                                    }


                                }else{
                                    errMessage = `班组(${teamid})数据库里不存在！`;
                                    ctx.throw(errMessage, 400);

                                }


                            }else {
                                validateResult = true;
                            }


//                            console.log('validateResult')
//                            console.log(validateResult)

                            if(validateResult){

                                let InventoryEventdata = await InventoryEvent_1.InventoryEvent.bulkCreate(alldata);

                                if (InventoryEventdata) {
                                    let createArray = InventoryEventdata.map((item) => {
                                        return item.id;
                                    });
                                    res.createCount  = createArray.length;

                                }
                                else {
                                    ctx.throw('InventoryEvent create fail!', 400);
                                }

                            }

                        }else if (ctx.request.body.action === 'edit'){

                            for(let x = 0; x < alldata.length; x++){

                                let query = {
                                    where: {id:alldata[x].id},
                                };
                                delete alldata[x].id;

                                let updateres = await InventoryEvent_1.InventoryEvent.update(alldata[x],query);

                                if (updateres && Array.isArray(updateres)) {
                                    res.updateCount += updateres[0];
                                }

                            }
                        }


                    }else{
                        ctx.throw('db.invalidQuery:97', 400);
                    }
                }

                ctx.body = res;
                ctx.status = 200;
                ctx.respond = true;
            }
            catch (e) {
                ctx.throw(e.message, 400);
            }
        }
    });

    inventoryEventComplexRouter.post('/inventoryEventComplex/search', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:63', 400);
        }
        else {
            try {
                let resp = dbquery_1.queryResponsePacket(ctx.request.body);
                //console.log(ctx.request.body);
                let inventoryEventQuery = {query:{order:ctx.request.body.query.order,executor:ctx.request.body.query.executor,eventTime:ctx.request.body.query.eventTime}};
                let option = {
                    attributes:[
                        'id',
                        'order',
                        'team',
                        'executor',
                        'eventType',
                        'eventTime',
                        [Sequelize.fn('SUM', Sequelize.col('purchaseLength')), 'purchaseLengthSum'],
                        [Sequelize.fn('SUM', Sequelize.col('shipLength')), 'shipLengthSum']
                    ] ,
                    group: ['eventType']
                };
                let inventoryEventArray =  await findAndCount(inventoryEventQuery,InventoryEvent_1,0,option);
                if(inventoryEventArray.length > 0){
                    //console.log('inventoryEventArray');
                    //console.log(inventoryEventArray);

                    inventoryEventArray.forEach(value =>{

                        if(value.eventType === '领料'){
                            delete value.purchaseLengthSum;
                            delete value.id;
                        }else{

                            delete value.shipLengthSum;
                        }
                    });
                    //console.log('inventoryEventArray');
                    //console.log(inventoryEventArray);
                    resp.records = inventoryEventArray;

                }

                ctx.body = resp.records;
                ctx.status = 200;
                ctx.respond = true;
            }
            catch (e) {
                console.log(e);
                ctx.throw('db.invalidQuery:97', 400);
            }
        }


    })


}