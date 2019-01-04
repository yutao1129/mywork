"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const dbquery_1 = require("../database/dbquery");
const Sequelize = require("sequelize");
const PurchasePlan_1 = require("../database/models/PurchasePlan");
const MaterialReceiving_1 = require("../database/models/MaterialReceiving");

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

exports.registerMaterialReceivingComplexAPI = function (materialReceivingComplexRouter) {

    materialReceivingComplexRouter.post('/materialReceivingComplex', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:63', 400);
        }
        else {
            try {

                let res = {
                    MaterialReceivingUpdateCount: 0,
                    MaterialReceivingCreateCount: 0,
                    purchasePlanUpdateCount:0
                };
                let orderid =  ctx.request.body.orderid;
                let supplier = ctx.request.body.supplier;
                let photo = null;
                if (!ctx.request.body.photo || ctx.request.body.photo == undefined) {
                    photo = null;
                }else{
                    photo = ctx.request.body.photo;
                }
                let alldata = ctx.request.body.alldata;
                let nowDate = new Date().toISOString();

                //console.log('alldata')
                //console.log(alldata);

                if(!alldata ||alldata.length ===0){
                    res.alldataIsEmpty = 1;
                    ctx.throw('db.invalidQuery:M0', 400);
                }else{
                    res.alldataIsEmpty = 0;
                    let materialArray = alldata.map(value => {

                        if(value.num){
                            delete value.num;
                        }

                        if(value.receivingDate2){
                            delete value.receivingDate2;
                        }

                        if(value.materialData){
                            delete value.materialData;
                        }


                        for (let key in value){
                            if((typeof value[key] === 'string') && (value[key] === '')){
                                value[key] = null;
                            }
                        }

                        value.photo = photo;
                        return value.material
                    });

//                    console.log('alldata');
//                    console.log(alldata);

                    let materialAndWidthArray = alldata.map(value => {
                        return `${value.material}\+${value.width}`
                    });
//                    console.log('materialAndWidthArray')
//                    console.log(materialAndWidthArray)

                    let materialAndWidthTypeArray = [...new Set(materialAndWidthArray)];

//                    console.log('materialArray');
//                    console.log(materialArray);

//                    let materialTypeArray = [...new Set(materialArray)];
                    //console.log(materialTypeArray);

                    if(materialAndWidthTypeArray.length !== materialAndWidthArray.length){
                        res.alldatamaterial = 1;
                        ctx.throw('db.invalidQuery:M1', 400);
                        console.log('material id mismatch')
                    }else{
                        res.alldatamaterial = 0;
                        if(!alldata[0].id){
                            console.log('MaterialReceiving create');

                            let orderAndMaterialArray = [];

                            for(let x = 0; x < materialArray.length; x++){
                                let orderAndMaterialJson = {
                                    order:null,
                                    material:null
                                };
                                orderAndMaterialJson.order = orderid;
                                orderAndMaterialJson.material = materialArray[x];
                                orderAndMaterialArray.push(orderAndMaterialJson);
                            }
                            //console.log('orderAndMaterialArray');
                            //console.log(orderAndMaterialArray);

                            for(let y = 0; y < orderAndMaterialArray.length; y++){
                                let purchasePlanQuery =  {query:orderAndMaterialArray[y]};
                                let purchasePlan = await findOne(purchasePlanQuery,PurchasePlan_1,0,{raw:true});
                                //console.log(purchasePlan);
                                if(purchasePlan){

                                    alldata[y].purchaseItem = purchasePlan.id;

                                    let  update = {
                                        "receiveTime": nowDate,
                                        "supplier":supplier
                                    };

                                    let query = {
                                        where: {id:purchasePlan.id},
                                    };

                                    let updateres = await PurchasePlan_1.PurchasePlan.update(update,query);
                                    if (updateres && Array.isArray(updateres)) {
                                        res. purchasePlanUpdateCount += updateres[0];
                                    }

                                }else{
                                    ctx.throw('db.invalidQuery:M2', 400);
                                    alldata[y].purchaseItem = null;
                                }

                                alldata[y].supplier = supplier;
                                alldata[y].receivingDate = nowDate;
                            }

                            //console.log('alldata');
                            //console.log(alldata);

                            let orderdelidata = await MaterialReceiving_1.MaterialReceiving.bulkCreate(alldata);

                            //console.log('orderdelidata');
                            //console.log(orderdelidata);
                            if (orderdelidata) {
                                let createArray = orderdelidata.map((item) => {
                                    return item.id;
                                });

                                res.MaterialReceivingCreateCount  = createArray.length;
                            }
                            else {
                                ctx.throw('db.invalidParameters:142', 400);
                            }

                        }else{

                            console.log('MaterialReceiving update');
                            for (let z = 0; z < alldata.length; z++){

                                let query = {
                                    where: {id:alldata[z].id},
                                };
                                //console.log('alldata[z]');
                                //console.log(alldata[z]);
                                let updateres = await MaterialReceiving_1.MaterialReceiving.update(alldata[z], query);
                                if (updateres && Array.isArray(updateres)) {
                                        res.MaterialReceivingUpdateCount =  (res.updateCount||0) + updateres[0];
                                }

                                let  update = {
//                                   "receiveTime": nowDate,
                                    "supplier":alldata[z].supplier
                                };

                                 query = {
                                    where: {id:alldata[z].purchaseItem},
                                };

                                updateres = await PurchasePlan_1.PurchasePlan.update(update,query);
                                if (updateres && Array.isArray(updateres)) {
                                    res. purchasePlanUpdateCount += updateres[0];
                                }
                                else {
                                    ctx.throw('db.invalidParameters:205', 400);
                                }

                            }

                        }

                    }
                }

                //console.log(alldata);
                ctx.body = res;
                ctx.status = 200;
                ctx.respond = true;
            }
            catch (e) {
                console.log(e.message);
                ctx.throw(e.message, 400);
            }
        }
    })
};
