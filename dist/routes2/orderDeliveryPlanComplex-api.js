"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const dbquery_1 = require("../database/dbquery");
const OrderDeliveryPlan_1 = require("../database/models/OrderDeliveryPlan");
const ColorCode_1 = require("../database/models/ColorCode");

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

exports.registerOrderDeliveryPlanComplexAPI = function (orderDeliveryPlanComplexRouter) {

    orderDeliveryPlanComplexRouter.post('/orderDeliveryPlanComplex/search', async (ctx) => {

        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:69', 400);
        }else{
            if (false === dbquery_1.checkRequestParamObject(ctx.request.body.query)) {
                ctx.throw('api.queryIsEmpty:70', 400);
            }else{
                let query = ctx.request.body.query;

                let order = query.order;

                if (!order || order == undefined) {
                    ctx.throw('db.invalidParameters:order', 400);
                }
                try {
                    let orderDeliveryPlanQuery = {query:{order:order}};
                    let option = {
                        include:[
                            {
                                model: ColorCode_1.ColorCode,
                            }
                        ]
                    };
                    let orderDeliveryPlanArray = await findAndCount(orderDeliveryPlanQuery,OrderDeliveryPlan_1,0,option);

                    let colorCodeArray = [];
                    orderDeliveryPlanArray.forEach(value =>{

                        if(value.colorCodeData){
                            value.code = value.colorCodeData.code;
                            value.color = value.colorCodeData.color;
                            delete value.colorCodeData;
                        }else{
                            value.code = null;
                            value.color = null;
                        }

                        colorCodeArray.push(value.colorCode);

                    });

//                    console.log('orderDeliveryPlanArray');
//                    console.log(orderDeliveryPlanArray);

//                    console.log('colorCodeArray')
//                    console.log(colorCodeArray)

                    let colorCodeTypeArray = [...new Set(colorCodeArray)];

//                    console.log('colorCodeTypeArray');
//                    console.log(colorCodeTypeArray);

                    let orderDeliveryPlanResultArray = colorCodeTypeArray.map(value => {
                        let resultArray = []
                        let color = null;
                        for(let item of orderDeliveryPlanArray){
                            if(item.colorCode === value){
                                resultArray.push(item);
                                color = item.color
                            }

                        }

                        return {colorCode:value, color: color,orderDeliveryPlan:resultArray};
                    });

//                    console.log('orderDeliveryPlanResultArray');
//                    console.log(orderDeliveryPlanResultArray);

                    for(let item of orderDeliveryPlanResultArray) {

                        let sizeArray =  item.orderDeliveryPlan.map(value => {

                            return value.size;
                        });

//                        let sizeTypeArray = [...new Set(sizeArray)].sort();
                        let sizeTypeArray = [...new Set(sizeArray)];

                        item.sizeTypeArray = sizeTypeArray;


                        let deliveryRegionArray =  item.orderDeliveryPlan.map(value => {

                            return value.deliveryRegion;
                        });

//                        let deliveryRegionTypeArray = [...new Set(deliveryRegionArray)].sort();
                        let deliveryRegionTypeArray = [...new Set(deliveryRegionArray)];

                        item.deliveryRegionTypeArray = deliveryRegionTypeArray;

                        item.sizeThenRegion = sizeTypeArray.map(value => {

                            let sizeSameArray = [];
                            for(let x of item.orderDeliveryPlan){
                                if(x.size === value){
                                    sizeSameArray.push(x);
                                }
                            }

                            let regionArray = deliveryRegionTypeArray.map(value1 => {
                                let regionSameArray = [];
                                for(let y of sizeSameArray){
                                    if(y.deliveryRegion === value1){
                                        regionSameArray.push(y);
                                        break;
                                    }
                                }
                                let result;
                                if(regionSameArray.length >0){
                                    result = {deliveryRegion:value1,
                                        exist: regionSameArray.length,
                                        id:regionSameArray[0].id,
                                        totalAmount:regionSameArray[0].totalAmount,
                                        colorCode:regionSameArray[0].colorCode,
                                        color:regionSameArray[0].color,
                                        size:value
                                    }
                                }else{
                                    result = {deliveryRegion:value1, exist: regionSameArray.length}
                                }


                                return result

                            });

                            return {size:value, region:regionArray}

                        });


                        delete item.orderDeliveryPlan;
                    }

                    let res = orderDeliveryPlanResultArray;

                    ctx.body = res;
                    ctx.status = 200;
                    ctx.respond = true;
                }
                catch (e) {
                    console.log(e);
                    ctx.throw('db.invalidQuery:97', 400);
                }
            }



        }



    })


}