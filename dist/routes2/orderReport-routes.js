"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const Team_1 = require("../database/models/Team");
const Order_1 = require("../database/models/Order");
const Style_1 = require("../database/models/Style");
const Client_1 = require("../database/models/Client");
const dbquery_1 = require("../database/dbquery");
// const ProductionScheduling_1 = require("../database/models/ProductionScheduling");


exports.registerOrderReportAPI = function (orderReportAPIRouter) {
    // function dateDiff(beginDate) {
    //     let sArr =beginDate.split("-");
    //     let sDate =new Date(sArr[0],(sArr[1]-1),sArr[2]);
    //     let eDate =new Date();
    //     let days=Math.ceil((eDate-sDate)/(24*60*60*1000));
    //     return days;
    // }
    // function dateDiff(beginDate) {
    //     let sDate =new Date(beginDate+ " 23:59:59.999");
    //     let eDate =new Date();
    //     let days=Math.ceil((eDate-sDate)/(24*60*60*1000));
    //     return days;
    // }
    //每个订单一条记录，包含多个交期
    orderReportAPIRouter.post('/orderReport/search', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:63', 400);
        }
        else {
            let resp = dbquery_1.queryResponsePacket(ctx.request.body);
            // let orderJoin = new Array();
            // orderJoin.push({ includeModel: () => { return { model: Style_1.Style,include:[{model: Client_1.Client}]}; }, foreignKey: 'style' });
            // // orderJoin.push({ includeModel: () => { return { model: Client_1.Client }; } , foreignKey: 'client' });

            // let query = dbquery_1.queryDBGeneratorEx(ctx.request.body, orderJoin);
            // query['raw'] = true;
            let query=ctx.request.body.query;
            let orderQuery={};
            let styleQuery={};
            let clientQuery={};
            if(query!=undefined){
                if(query.orderID!=undefined){
                    orderQuery['orderID']=query.orderID;
                }
                if(query.style!=undefined){
                    orderQuery['style']=query.style;
                }
                if(query.deliveryDate!=undefined){
                    orderQuery['deliveryDate']=query.deliveryDate;
                }

                if(query.productName!=undefined){
                   styleQuery['productName']=query.productName;
                }
                if(query.productCategory!=undefined){
                    styleQuery['productCategory']=query.productCategory;
                }

                if(query.clientName!=undefined){
                    clientQuery['name']=query.clientName;
                }
            }
           
            let order_report_query={
                include:[
                    {
                        model: Style_1.Style,
                        include:[
                            {
                                model: Client_1.Client,
                                where:clientQuery
                            }
                        ],
                        where:styleQuery
                    }
                ],
                order:[['createdTime',"DESC"]],
                where:orderQuery,
                raw:true,
            }
            try {
                //console.log('orderReport query', query);
                let orderdocInfo = await Order_1.Order.findAndCount(order_report_query);
                let count = orderdocInfo.count;
                // let count = await Order.count(countQuery);
                if (0 === count) {
                    resp.totalPage = 0;
                }
                else if (resp.maxRows > 0) {
                    resp.totalPage = Math.ceil(count / resp.maxRows);
                }
                else {
                    resp.totalPage = 1;
                }
                //console.log('orderdocInfo', orderdocInfo)
                if (orderdocInfo && orderdocInfo.rows) {
                    let records = {};
                    let index=0;
                    for (let item of orderdocInfo.rows) {
                        var orderID = item['orderID'];
                        if (records[orderID] == undefined) {
                            index++;
                            var record = {
                                'index':index,
                                "orderID": item['orderID'],
                                "style": item['style'],
                                "productName": item['styleData.productName'],
                                "productCategory": item['styleData.productCategory'],
                                "clientName": item['styleData.cleintData.name'],
                                "deliveryCountSum": 0,
                                "cancelDeliveryCount": 0,
                                "ongoingDeliveryCount": 0,
                                "timeoutDeliveryCount": 0,
                                "completeDeliveryCount":0,
                                "statusList":[]
                            }
                            records[orderID] = record;
                        }
                        records[orderID].statusList.push({
                            "createdTime": item['createdTime'],
                            "deliveryDate":item['deliveryDate'],
                            "status":item['status']
                        })
                        records[orderID].deliveryCountSum++;   
                        if (item['status'] == 0) {     //0 Normal, 1 Cancel, 2 Complete
                            records[orderID].ongoingDeliveryCount++;
                            if (new Date(item['deliveryDate']+ " 23:59:59.999")<new Date()) {
                                records[orderID].timeoutDeliveryCount++;
                            }
                        }
                        else if (item['status'] == 1) {
                            records[orderID].cancelDeliveryCount++;
                        }
                        else if (item['status'] == 2) {
                            records[orderID].completeDeliveryCount++;
                        }
                    }
                    //console.log('records',records)
                    var sortRecords={}
                    for(var order in records){
                        // resp.records.push(records[record]);
                        sortRecords[records[order].index]=records[order];
                    }
                    //console.log('sortRecords',sortRecords)
                    for(var i in sortRecords){
                        resp.records.push(sortRecords[i]);
                    }
                    // resp.records = records;
                    //
                }
                ctx.body = resp;
                ctx.status = 200;
                ctx.respond = true;
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalorderIDQuery:93,error:'+err.toString(), 400);
            }
        }
    });



}
