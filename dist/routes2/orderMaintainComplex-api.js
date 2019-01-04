"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const dbquery_1 = require("../database/dbquery");
const Order_1 = require("../database/models/Order");
const Material_1 = require("../database/models/Material");
const PurchasePlan_1 = require("../database/models/PurchasePlan");
const OrderDeliveryPlan_1 = require("../database/models/OrderDeliveryPlan");
const Sequelize = require("sequelize");

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


exports.registerOrderMaintainComplexAPI = function (orderMaintainComplexRouter) {

    orderMaintainComplexRouter.post('/orderMaintainComplex/order', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:127', 400);
        }else {
            try {

                if(!ctx.request.body.orderData ||ctx.request.body.orderData.length === 0 ) {
                    ctx.throw('db.invalidQuery:97', 400);
                }else{
                    let orderData = ctx.request.body.orderData;
                    let nowDate = new Date().toISOString();
                    let res = {
                        orderIDArray:[],
                        OrderCreateCount: 0,
                        purchasePlanCreateCount: 0,
                    };
                    //console.log(orderData);
                    let orderTreeArray = [];

                    if(orderData && orderData.length >0){
                        orderData.forEach(value=>{
                            value.status = 0;
                            value.createdTime = nowDate;

                        });
                        //console.log(orderTreeArray);
                        //console.log(orderData);

                        let orderCreateData = await Order_1.Order.bulkCreate(orderData);
                        //console.log('orderCreateData');
                        //console.log(orderCreateData);
                        if (orderCreateData) {
                            let orderCreateArray = orderCreateData.map((item) => {
                                let orderJson = {
                                    id: null,
                                    orderID:null,
                                    style:null
                                };

                                orderJson.id = item.id;
                                orderJson.orderID = item.orderID;
                                orderJson.style = item.style;
                                return orderJson;
                            });
                            res.OrderCreateCount  = orderCreateArray.length;

                            let orderIDArray = orderCreateArray.map(value=>{
                                return value.id;
                            });

                            res.orderIDArray = orderIDArray;
                            //console.log(orderIDArray);

                            let purchasePlanArray = [];
                            for (let x = 0 ; x < orderCreateArray.length; x++){
                                let materialQuery = {query:{style:orderCreateArray[x].style}};
                                let  materialArray = await findAndCount(materialQuery,Material_1,0,{attributes:['id','usageAmount']});
                                console.log('materialArray');
                                console.log(materialArray);

                                if(materialArray.length > 0){

                                    purchasePlanArray =  materialArray.map(value =>{
                                        let purchasePlan = {
                                            material:null,order:null,purchaser:null,supplier:null,
                                            unitUsageAmount:null,orderUsageAmount:null,purchaseAmount:null,
                                            unitPrice:null,description:null,status:null,createdTime:null,
                                            updatedTime:null,receiveTime:null,inspection:null
                                        };
                                        purchasePlan.material = value.id;
                                        purchasePlan.order = orderCreateArray[x].id;
                                        purchasePlan.unitUsageAmount = value.usageAmount;
                                        purchasePlan.createdTime = nowDate;

                                        return purchasePlan;
                                    });
                                }
                            }
                            console.log('purchasePlanArray');
                            console.log(purchasePlanArray);
                            if(purchasePlanArray.length > 0){
                                let purchasePlanCreateData = await PurchasePlan_1.PurchasePlan.bulkCreate(purchasePlanArray);
                                let purchasePlanCreateArray = purchasePlanCreateData.map((item) => {
                                    return item.id;
                                });

                                res.purchasePlanCreateCount  = purchasePlanCreateArray.length;
                            }
                        }
                        else {
                            ctx.throw('db.invalidParameters:142', 400);
                        }
                    }

                    ctx.body = res;
                    ctx.status = 200;
                    ctx.respond = true;
                }
            }
            catch (e) {
                console.log(e);
                ctx.throw(e.message, 400);
            }
        }
    });

    orderMaintainComplexRouter.post('/orderMaintainComplex/orderDeliveryPlan', async (ctx) => {

        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:127', 400);
        }else {
            try {
                if(!ctx.request.body.orderDeliveryPlanData ||ctx.request.body.orderDeliveryPlanData.length === 0 ){
                    ctx.throw('db.invalidQuery:97', 400);
                }else{
                    let orderDeliveryPlanData = ctx.request.body.orderDeliveryPlanData;
                    let nowDate = new Date().toISOString();
                    let res = {
                        purchasePlanCreateCount: 0,
                        purchasePlanCreateID :[],
                        purchasePlanUpdateCount: 0,
                        purchasePlanUpdateID:[],
                        orderDeliveryPlanCreateCount:0,
                        orderDeliveryPlanCreateID:[]

                    };
                    console.log('orderDeliveryPlanData');
                    console.log(orderDeliveryPlanData);

                    let orderDeliveryPlanCreateData = await OrderDeliveryPlan_1.OrderDeliveryPlan.bulkCreate(orderDeliveryPlanData);
                    let orderDeliveryPlanCreateDataArray  = orderDeliveryPlanCreateData.map((item) => {
                        return item.id;
                    });

                    if(orderDeliveryPlanCreateDataArray.length >0){
                        res.orderDeliveryPlanCreateCount  = orderDeliveryPlanCreateDataArray.length;
                        res.orderDeliveryPlanCreateID  = orderDeliveryPlanCreateDataArray;
                    }
                    console.log('orderDeliveryPlanCreateDataArray');
                    console.log(orderDeliveryPlanCreateDataArray);

                    for(let x = 0; x < orderDeliveryPlanData.length; x++){

                        let orderDeliveryPlanQuery = {query:{order:orderDeliveryPlanData[x].order}};
                        let option = {
                            attributes:[
                                'order',
                                [Sequelize.fn('SUM', Sequelize.col('totalAmount')), 'totalAmountSum'],
                            ] ,
                            group: ['order']
                        };
                        let totalAmountSumArrayByOrder =  await findAndCount(orderDeliveryPlanQuery,OrderDeliveryPlan_1,0,option);
                        console.log('totalAmountSumArrayByOrder');
                        console.log(totalAmountSumArrayByOrder);

                        let orderQuery = {query:{id:orderDeliveryPlanData[x].order}};
                        option = {
                            attributes:[
                                'id',
                                'style'
                            ] ,
                            group: ['style']
                        };
                        let styleByOrderArray =  await findAndCount(orderQuery,Order_1,0,option);
                        console.log('styleByOrderArray');
                        console.log(styleByOrderArray);


                        for(let m = 0; m < styleByOrderArray.length; m++){

                            let materialQuery = {query:{style:styleByOrderArray[m].style}};
                            let  materialArray = await findAndCount(materialQuery,Material_1,0,{attributes:['id','usageAmount']});
                            console.log('materialArray');
                            console.log(materialArray);

                            if(materialArray.length > 0){

//                                for (let n = 0; n < materialArray.length; n++){

//                                    let  update = {
//                                        "orderUsageAmount": parseFloat(totalAmountSumArrayByOrder[0].totalAmountSum) * parseFloat( materialArray[n].usageAmount || 0) ,
//                                        "purchaseAmount": parseFloat(totalAmountSumArrayByOrder[0].totalAmountSum) * parseFloat( materialArray[n].usageAmount || 0),
//                                        "updatedTime": nowDate
//                                    };

//                                    let query = {
//                                        where: {order:orderDeliveryPlanData[x].order,material:materialArray[n].id},
//                                    };

//                                    let updateres = await PurchasePlan_1.PurchasePlan.update(update,query);

//                                    if (updateres && Array.isArray(updateres)) {
//                                        res. purchasePlanUpdateCount += updateres[0];
//                                    }
//                               }

                                    let purchasePlanArray =  materialArray.map(value =>{
                                        let purchasePlan = {
                                            material:null,order:null,purchaser:null,supplier:null,
                                            unitUsageAmount:null,orderUsageAmount:null,purchaseAmount:null,
                                            unitPrice:null,description:null,status:null,createdTime:null,
                                            updatedTime:null,receiveTime:null,inspection:null
                                        };
                                        purchasePlan.material = value.id;
                                        purchasePlan.order = orderDeliveryPlanData[x].order;
                                        purchasePlan.unitUsageAmount = value.usageAmount;
                                        purchasePlan.createdTime = nowDate;
                                        purchasePlan.updatedTime = nowDate;

                                        purchasePlan.orderUsageAmount = parseFloat(totalAmountSumArrayByOrder[0].totalAmountSum) * parseFloat( value.usageAmount || 0) ;
                                        purchasePlan.purchaseAmount = parseFloat(totalAmountSumArrayByOrder[0].totalAmountSum) * parseFloat( value.usageAmount || 0);

                                        return purchasePlan;
                                    });

                                    console.log('purchasePlanArray');
                                    console.log(purchasePlanArray);


                                if(purchasePlanArray.length > 0){

                                    for(let item of purchasePlanArray ){
                                        console.log('item9999999999')
                                        console.log(item)
                                        let option = {
                                            where:{material:item.material,order:item.order},
                                            defaults:item
                                        }
                                        let purchasePlanCreateArray = await PurchasePlan_1.PurchasePlan.findOrCreate(option);

                                        if(purchasePlanCreateArray.length > 0){
                                            if (purchasePlanCreateArray[1] === true){
                                                res.purchasePlanCreateCount  += 1;
                                                res.purchasePlanCreateID.push(purchasePlanCreateArray[0].toJSON().id);
                                            }else{
                                                let update = {};
                                                update.unitUsageAmount = item.unitUsageAmount;
                                                update.orderUsageAmount = item.orderUsageAmount;
                                                update.purchaseAmount = item.purchaseAmount;
                                                update.updatedTime = item.updatedTime;
                                                let query = {
                                                    where: {id:purchasePlanCreateArray[0].toJSON().id},
                                                };

                                                let updateres = await PurchasePlan_1.PurchasePlan.update(update,query);
                                                if (updateres && Array.isArray(updateres)) {
                                                    res.purchasePlanUpdateCount += updateres[0];
                                                    res.purchasePlanUpdateID.push(purchasePlanCreateArray[0].toJSON().id) ;
                                                }
                                            }
                                        }


                                    }

                                }
                                /*
                                    if(purchasePlanArray.length > 0){
                                        let purchasePlanCreateData = await PurchasePlan_1.PurchasePlan.bulkCreate(purchasePlanArray);
                                        let purchasePlanCreateArray = purchasePlanCreateData.map(item => {
                                            return item.id;
                                        });

                                        res.purchasePlanCreateCount  += purchasePlanCreateArray.length;
                                        res.purchasePlanCreateID  =  res.purchasePlanCreateID.concat(purchasePlanCreateArray);
                                    }
                                */
                            }
                        }
                    }

                    ctx.body = res;
                    ctx.status = 200;
                    ctx.respond = true;
                }
            }
            catch (e) {
                console.log(e);
                ctx.throw(e.message, 400);
            }
        }
    });

    orderMaintainComplexRouter.post('/orderMaintainComplex/orderDeliveryPlan/update', async (ctx) => {

        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:127', 400);
        }else {
            try {
                if(!ctx.request.body.orderDeliveryPlanData ||ctx.request.body.orderDeliveryPlanData.length === 0 ){
                    ctx.throw('db.invalidQuery:97', 400);
                }else{

                    let orderDeliveryPlanData = ctx.request.body.orderDeliveryPlanData;
                    let nowDate = new Date().toISOString();
                    let res = {
                        orderDeliveryPlanUpdateCount: 0,
                        purchasePlanUpdateCount: 0
                    };
                    //console.log(orderDeliveryPlanData);

                    for(let x = 0; x < orderDeliveryPlanData.length; x++){

                        let update = {};
                        let query = {
                            where: {id:orderDeliveryPlanData[x].id},
                        };

                        pushElementToObject (update,orderDeliveryPlanData[x]);
                        delete update.id;

                        let updateres = await OrderDeliveryPlan_1.OrderDeliveryPlan.update(update,query);

                        if (updateres && Array.isArray(updateres)) {
                            res. orderDeliveryPlanUpdateCount += updateres[0];

                            let orderDeliveryPlanQuery = {query:{id:orderDeliveryPlanData[x].id}};
                            let option = {
                                attributes:[
                                    'id',
                                    'order',
                                ] ,
                                group: ['id'],
                                raw:true
                            };
                            let orderDeliveryPlan =  await findOne(orderDeliveryPlanQuery,OrderDeliveryPlan_1,0,option);

                            //console.log('orderDeliveryPlan');
                            //console.log(orderDeliveryPlan);

                            if(orderDeliveryPlan){

                                let orderDeliveryPlanQuery = {query:{order:orderDeliveryPlan.order}};
                                option = {
                                    attributes:[
                                        'order',
                                        [Sequelize.fn('SUM', Sequelize.col('totalAmount')), 'totalAmountSum'],
                                    ] ,
                                    group: ['order']
                                };
                                let totalAmountSumArrayByOrder =  await findAndCount(orderDeliveryPlanQuery,OrderDeliveryPlan_1,0,option);
                                //console.log('totalAmountSumArrayByOrder');
                                //console.log(totalAmountSumArrayByOrder);

                                let orderQuery = {query:{id:orderDeliveryPlan.order}};
                                option = {
                                    attributes:[
                                        'id',
                                        'style'
                                    ] ,
                                    group: ['style']
                                };
                                let styleByOrderArray =  await findAndCount(orderQuery,Order_1,0,option);
                                //console.log('styleByOrderArray');
                                //console.log(styleByOrderArray);

                                for(let m = 0; m < styleByOrderArray.length; m++){

                                    let materialQuery = {query:{style:styleByOrderArray[m].style}};
                                    let  materialArray = await findAndCount(materialQuery,Material_1,0,{attributes:['id','usageAmount']});
                                    //console.log('materialArray');
                                    //console.log(materialArray);

                                    if(materialArray.length > 0){

                                        for (let n = 0; n < materialArray.length; n++){

                                            let  update = {
                                                "orderUsageAmount": parseFloat(totalAmountSumArrayByOrder[0].totalAmountSum) * parseFloat( materialArray[n].usageAmount || 0) ,
                                                "purchaseAmount": parseFloat(totalAmountSumArrayByOrder[0].totalAmountSum) * parseFloat( materialArray[n].usageAmount || 0),
                                                "updatedTime": nowDate
                                            };

                                            let query = {
                                                where: {order:orderDeliveryPlan.order,material:materialArray[n].id},
                                            };

                                            let updateres = await PurchasePlan_1.PurchasePlan.update(update,query);

                                            if (updateres && Array.isArray(updateres)) {
                                                res. purchasePlanUpdateCount += updateres[0];
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                    ctx.body = res;
                    ctx.status = 200;
                    ctx.respond = true;
                }
            }
            catch (e) {
                console.log(e);
                ctx.throw('db.invalidQuery:97', 400);
            }
        }
    });


    orderMaintainComplexRouter.post('/orderMaintainComplex/orderDeliveryPlan/delete', async (ctx) => {

        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:127', 400);
        }else {

            if (false === dbquery_1.checkRequestParamObject(ctx.request.body.query)) {
                ctx.throw('api.queryIsEmpty:70', 400);
            }

            try {

                let res ={
                    orderDeliveryPlanDeleteCount:0,
                    purchasePlanUpdateCount:0
                };
                let query = ctx.request.body.query;

                if (!query.order || query.order == undefined) {
                    ctx.throw('db.invalidParameters:order', 400);
                }


                if (!query.orderDeliveryPlanData || query.orderDeliveryPlanData == undefined || query.orderDeliveryPlanData.length ===0) {
                    ctx.throw('db.invalidParameters:orderDeliveryPlanData', 400);
                }

                let nowDate = new Date().toISOString();
                let orderDeliveryPlanData = query.orderDeliveryPlanData;

                let OrderDeliveryPlanIdArray = orderDeliveryPlanData.map(value=>{
                    return value.id;
                });

                let totalAmountSum = orderDeliveryPlanData.reduce((a,b)=>{
                     a = a+ parseFloat(b.totalAmount) ;
                    return a;
                },0)

//                console.log('totalAmountSum')
//                console.log(totalAmountSum)

                let condition = {
                    where: {id:{[Sequelize.Op.in]:OrderDeliveryPlanIdArray}}
                };
                let delcount = await OrderDeliveryPlan_1.OrderDeliveryPlan.destroy(condition);
                if (null !== delcount && undefined !== delcount) {
                    res.orderDeliveryPlanDeleteCount = delcount;
                    if(delcount >0){
                        let purchasePlanQuery = {query:{order:query.order}};
                        let options = {
                            attributes:[
                                'id',
                                'purchaseAmount'
                            ]
                        }
                        let purchasePlanArray =  await findAndCount(purchasePlanQuery,PurchasePlan_1,0,options);
                        if(purchasePlanArray.length > 0){

                            let purchasePlanUpdateArray =  purchasePlanArray.map(value=>{
                                console.log(value)
                                let sub  = value.purchaseAmount - totalAmountSum;
                                value.purchaseAmount =  (sub>=0)?sub:0;
                                return value;
                            });

//                            console.log('purchasePlanUpdateArray')
//                            console.log(purchasePlanUpdateArray)

                            for(let item of purchasePlanUpdateArray){

                                let query = {
                                    where: {id:item.id},
                                };

                                let  update = {
                                    purchaseAmount: item.purchaseAmount,
                                    updatedTime: nowDate
                                };

                                let updateres = await PurchasePlan_1.PurchasePlan.update(update,query);

                                if (updateres && Array.isArray(updateres)) {
                                    res. purchasePlanUpdateCount += updateres[0];
                                }

                            }


                        }

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
    });
};
