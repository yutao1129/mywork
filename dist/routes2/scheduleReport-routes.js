"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// const Crop_1 = require("../database/models/Crop");
// const CropCard_1 = require("../database/models/CropCard");
// const CropRecord_1 = require("../database/models/CropRecord");
// const CropPackage_1 = require("../database/models/CropPackage");
const Team_1 = require("../database/models/Team");
// const TrussPlan_1 = require("../database/models/TrussPlan");
const Order_1 = require("../database/models/Order");
const Style_1 = require("../database/models/Style");
const StyleOperation_1 = require("../database/models/StyleOperation");
const StyleProcess_1 = require("../database/models/StyleProcess");
const ProcessStation_1 = require("../database/models/ProcessStation");
const OrderDeliveryPlan_1 = require("../database/models/OrderDeliveryPlan");
const ProductionScheduling_1 = require("../database/models/ProductionScheduling");
const PurchasePlan_1 = require("../database/models/PurchasePlan");
const MaterialReceiving_1 = require("../database/models/MaterialReceiving");
const FabricInspection_1 = require("../database/models/FabricInspection");
// const ColorCode_1 = require("../database/models/ColorCode");
// const Material_1 = require("../database/models/Material");
const dbquery_1 = require("../database/dbquery");
const Sequelize_1 = require("sequelize")


const SewingTeamScheduling_1 = require("../database/models/SewingTeamScheduling");
const SewingTeamOutput_1 = require("../database/models/SewingTeamOutput");
const PrecedingTeamScheduling_1 = require("../database/models/PrecedingTeamScheduling");
const PrecedingTeamOutput_1 = require("../database/models/PrecedingTeamOutput");
const FollowingTeamScheduling_1 = require("../database/models/FollowingTeamScheduling");
const FollowingTeamOutput_1 = require("../database/models/FollowingTeamOutput");

//const findAndCountAll = async function (query,modelInstance,join,option){
// async function GetCompletedProgressAndTotalAmount() {
//     let querycompleted = {
//         attributes: [
//             'order',
//             [Sequelize_1.fn('SUM', Sequelize_1.col('totalAmount')), 'totalAmountSum'],
//             [Sequelize_1.fn('SUM', Sequelize_1.col('completed')), 'completedSum']
//         ],
//         group: 'order',
//         raw: true
//     };
//     let docs = await OrderDeliveryPlan_1.OrderDeliveryPlan.findAll(querycompleted);
//     //console.log('querycompleted docs', docs);
//     var result = {};
//     if (docs && docs.length > 0) {
//         for (let item of docs) {
//             var orderResult = {
//                 completedProgress: 0.0000,
//                 totalAmountSum: 0,
//             };
//             orderResult.totalAmountSum = item.totalAmountSum;
//             if (item.totalAmountSum > 0) {
//                 orderResult.completedProgress = (item.completedSum / item.totalAmountSum).toFixed(4);
//             }
//             result[item.order] = orderResult;
//         }
//     }
//     //console.log('GetCompletedProgressAndTotalAmount result', result)
//     return result;
// }

async function GetCompletedProgressAndAmountByFactory(orderList,factory) {
    let querycompleted = {
        attributes: [
            [Sequelize_1.fn('SUM', Sequelize_1.col('amount')), 'totalAmountSum'],
            [Sequelize_1.fn('SUM', Sequelize_1.col('packcompleteAmount')), 'completedSum']
        ],
        include: [
            {
                model: OrderDeliveryPlan_1.OrderDeliveryPlan,
                attributes: [
                    'order',
                ],
                where:{
                    order:orderList
                }
            }
        ],
        group: 'order',
        where: { factory: factory },
        raw: true
    };
    let docs = await ProductionScheduling_1.ProductionScheduling.findAll(querycompleted);
    //console.log('querycompleted docs', docs);
    var result = {};
    if (docs && docs.length > 0) {
        for (let item of docs) {

            var orderResult = {
                completedProgress: 0.0000,
                totalAmountSum: 0,
            };
            orderResult.totalAmountSum = item.totalAmountSum;
            if (item.totalAmountSum > 0) {
                orderResult.completedProgress = (item.completedSum / item.totalAmountSum).toFixed(4);
            }
            result[item['orderDeliveryPlanData.order']] = orderResult;
        }
    }
    //console.log('GetCompletedProgressAndTotalAmount result', result)
    return result;
}
async function GetMaterialReceivingOutDate(orderList,MRProgress) {
    let queryMRDate = {
        attributes: [
            'receivingDate'

        ],
        include: [
            {
                model: PurchasePlan_1.PurchasePlan,
                attributes: [
                    'order',
                    'receiveTime'

                ],
                where:{
                    order:orderList
                }
            }
        ],
        raw: true
    };
    let docs_mrDate = await MaterialReceiving_1.MaterialReceiving.findAll(queryMRDate);
    // console.log('GetMaterialReceivingOutDate docs_mrDate', docs_mrDate);

    var result = {};
    if (docs_mrDate && docs_mrDate.length > 0) {
        for (let item of docs_mrDate) {
            var order = item['purchaseItemData.order'];
            if (result[order] == undefined) {
                var orderResult = {
                    materialOutDate: 1,  //默认正常
                };
                result[order] = orderResult;
            }
            if (result[order].materialOutDate == 0)  //订单已包含超期，不继续判断其它
            {
                continue;
            }
            else {
                if (item['purchaseItemData.receiveTime'] == null) {
                    result[order].materialOutDate = 1;    //无日期，正常
                    continue;
                }
                if (item.receivingDate == null) {

                    if (new Date(item['purchaseItemData.receiveTime']) < new Date() && MRProgress[order].materialProgress < 1) {
                        result[order].materialOutDate = 0;    //无收料日期，未完成，当前已经超期
                    }
                }
                else if (item.receivingDate > item['purchaseItemData.receiveTime']) {
                    // console.log('item.receivingDate',item.receivingDate)
                    // console.log('purchaseItemData.receiveTime', item['purchaseItemData.receiveTime'])
                    result[order].materialOutDate = 0;    //超期
                }
            }
        }
    }

    // console.log('GetMaterialReceivingOutDate result', result)
    return result;

}
async function GetMaterialReceivingProgress(orderList) {
    let query = {
        attributes: [
            'order',
            [Sequelize_1.fn('SUM', Sequelize_1.col('purchaseAmount')), 'purchaseAmountSum']
        ],
        where:{
            order:orderList
        },
        group: 'order',
        raw: true
    };
    let docs_pp = await PurchasePlan_1.PurchasePlan.findAll(query);
    // console.log('PurchasePlan docs_pp', docs_pp);

    let queryMR = {
        attributes: [
            [Sequelize_1.fn('SUM', Sequelize_1.col('length')), 'lengthSum'],
        ],
        include: [
            {
                model: PurchasePlan_1.PurchasePlan,
                attributes: [
                    'order'
                ],
                where:{
                    order:orderList
                }
            }
        ],

        group: 'order',
        raw: true
    };
    let docs_mr = await MaterialReceiving_1.MaterialReceiving.findAll(queryMR);
    // console.log('MaterialReceiving docs_mr', docs_mr);

    var result = {
    }
    var result = {};
    var mrlength_result = {};
    for (let item of docs_mr) {
        mrlength_result[item['purchaseItemData.order']] = item.lengthSum;
    }
    // console.log('mrlength_result', mrlength_result)
    if (docs_pp && docs_pp.length > 0) {
        for (let item of docs_pp) {
            var order = item.order;
            var orderResult = {
                materialProgress: 0.0000,

            };
            if (item.purchaseAmountSum > 0) {
                var mrlength = mrlength_result[order] == undefined ? 0 : mrlength_result[order];
                //console.log('mrlength', mrlength)
                orderResult.materialProgress = (mrlength / item.purchaseAmountSum).toFixed(4);
            }
            result[order] = orderResult;
        }
    }
    //console.log('GetMaterialReceivingProgress result', result)
    return result;
}


async function GetFabricInspectionProgress(orderList) {
    let query_fi = {
        attributes: [
            [Sequelize_1.fn('SUM', Sequelize_1.col('length')), 'fabricInspectionLengthSum'],
        ],
        include: [
            {
                model: PurchasePlan_1.PurchasePlan,
                attributes: [
                    'order'
                ],
                where:{
                    order:orderList
                }
            }
        ],
        group: 'order',
        raw: true
    };
    let docs_fi = await FabricInspection_1.FabricInspection.findAll(query_fi);
    //console.log('GetFabricInspectionProgress docs_fi', docs_fi);

    let queryMR = {
        attributes: [
            [Sequelize_1.fn('SUM', Sequelize_1.col('length')), 'lengthSum'],
        ],
        include: [
            {
                model: PurchasePlan_1.PurchasePlan,
                attributes: [
                    'order'
                ],
                where:{
                    order:orderList
                }
            }
        ],
        group: 'order',
        raw: true
    };
    let docs_mr = await MaterialReceiving_1.MaterialReceiving.findAll(queryMR);
    //console.log('GetFabricInspectionProgress docs_mr', docs_mr);

    var result = {
    }
    var result = {};
    var mrlength_result = {};
    for (let item of docs_mr) {
        mrlength_result[item['purchaseItemData.order']] = item.lengthSum;
    }
    //console.log('mrlength_result', mrlength_result)
    if (docs_fi && docs_fi.length > 0) {
        for (let item of docs_fi) {
            var order = item['purchaseItemData.order'];
            var orderResult = {
                fabricInspectionProgress: 0.0000,

            };
            var mrlength = mrlength_result[order] == undefined ? 0 : mrlength_result[order];
            if (mrlength > 0) {
                orderResult.fabricInspectionProgress = (item.fabricInspectionLengthSum / mrlength).toFixed(4);
            }
            result[order] = orderResult;
        }
    }
    //console.log('GetFabricInspectionProgress result', result)
    return result;
}
//查询每个订单对应的款式所需的所有工序是否已经分配到工位
async function GetProcessStationStatus(orderList) {

    let queryStyleProcess = {
        attributes:[
            'orderID',
            'id'
        ],
        include:[
            {
                model:Style_1.Style,
                attributes:[
                    'styleID'
                ],
                include:[
                    {
                        model:StyleProcess_1.StyleProcess,
                        attributes:[
                            'process'
                        ]
                      
                    }
                ],
            }
        ],
        where:{
            id:orderList
        }
        // raw:true
    };
    let styleProcess_docs = await Order_1.Order.findAll(queryStyleProcess);
    // console.log('styleProcess_docs docs', styleProcess_docs);
    var styleProcessListJson={};
    for(var i=0;i<styleProcess_docs.length;i++){
        var item=styleProcess_docs[i];
        var processList=[];
        item.styleData.styleProcessData.map((process_item)=>{
            processList.push(process_item.process);
        })
        styleProcessListJson[item.id]=processList;
    }

    let query = {
        attributes: [
            [Sequelize_1.fn('COUNT', Sequelize_1.fn('DISTINCT',Sequelize_1.col('styleProcess'))),'processCount'],
            'order'
        ],
        where:{
            order:orderList
        },
        group: ['order'],
        raw: true
    };
    let docs = await ProcessStation_1.ProcessStation.findAll(query);
    // console.log('GetProcessStationStatus docs', docs);
    var result = {};
    if (docs && docs.length > 0) {
        for (let item of docs) {
            var orderResult = {
                processStationStatus: 0
            };
            // console.log("order:"+item.order+'recodes VS counts', styleProcessListJson[item.order].length+":"+item.processCount);
            if(styleProcessListJson[item.order].length==item.processCount)
            {
                orderResult.processStationStatus=1;
            }     
            result[item.order] = orderResult;
        }
    }
    console.log('GetProcessStationStatus result', result)
    return result;
}

async function GetOrderDeliveryPlanByFactory(factory) {
    let query = {
        attributes: [
            [Sequelize_1.fn('DISTINCT', Sequelize_1.col('orderDeliveryPlan')), 'orderDeliveryPlan'],
        ],
        where: {
            factory: factory
        },
        raw: true
    };
    let docs_oderDP = await ProductionScheduling_1.ProductionScheduling.findAll(query);
    //console.log('GetOrderDeliveryPlanByFactory docs', docs_oderDP);
    var result = [];

    if (docs_oderDP && docs_oderDP.length > 0) {
        for (let item of docs_oderDP) {
            result.push(item.orderDeliveryPlan)
        }
    }
    //console.log('GetMaterialReceivingProgress result', result)

    return result;
}

async function GetScheduleStatusByFactory(orderList,factory) {
    let queryschedule = {
        attributes: [
            //    'factory',
            [Sequelize_1.fn('SUM', Sequelize_1.col('amount')), 'amountSum'],
            [Sequelize_1.fn('SUM', Sequelize_1.col('cropCompleteAmount')), 'cropCompleteAmountSum'],
            [Sequelize_1.fn('SUM', Sequelize_1.col('stickCompleteAmount')), 'stickCompleteAmountSum'],
            [Sequelize_1.fn('SUM', Sequelize_1.col('sewingCompleteAmount')), 'sewingCompleteAmountSum'],
            [Sequelize_1.fn('SUM', Sequelize_1.col('lockCompleteAmount')), 'lockCompleteAmountSum'],
            [Sequelize_1.fn('SUM', Sequelize_1.col('ironCompleteAmount')), 'ironCompleteAmountSum'],
            [Sequelize_1.fn('SUM', Sequelize_1.col('packCompleteAmount')), 'packCompleteAmountSum']
        ],
        include: {
            model: OrderDeliveryPlan_1.OrderDeliveryPlan,
            attributes: [
                'order'
            ],
            where:{
                order:orderList
            }

        },
        group: 'order',
        where: {
            factory: factory
        },
        raw: true
    }
    let schedule_docs = await ProductionScheduling_1.ProductionScheduling.findAll(queryschedule);
    //console.log('schedule_docs', schedule_docs)
    var result = {};
    if (schedule_docs && schedule_docs.length > 0) {
        for (let item of schedule_docs) {
            result[item['orderDeliveryPlanData.order']] = item;
        }
    }
    //console.log('GetScheduleStatusByFactory', result)
    return result;

}

async function GetStepStatus(orderList,factory) {
    let queryPreceding = {
        attributes: [
            'amount',
            'cropEndDate',
            'stickEndDate'
        ],
        include: [
            {
                model:PrecedingTeamOutput_1.PrecedingTeamOutput,
                //association: PrecedingTeamOutput_1.PrecedingTeamOutput.hasOne(PrecedingTeamScheduling_1.PrecedingTeamScheduling, { foreignKey: 'precedingTeamScheduling', as: 'precedingTeamOutputData' }),
                attributes: [
                    'cropAmount',
                    'stickAmount'
                ]
            },
            {
                model: ProductionScheduling_1.ProductionScheduling,
                attributes: [
                    'orderDeliveryPlan'
                ],
                where: {
                    factory: factory
                },
                include: [
                    {
                        model: OrderDeliveryPlan_1.OrderDeliveryPlan,
                        attributes: [
                            'order'
                        ],
                        where:{
                            order:orderList
                        }
                    }
                ]
            }
        ],
        raw: true
    }

    let docs_preced = await PrecedingTeamScheduling_1.PrecedingTeamScheduling.findAll(queryPreceding)
    //console.log('docs_preced', docs_preced)

    var result = {};


    if (docs_preced && docs_preced.length > 0) {
        for (let item of docs_preced) {
            var order = item['productionSchedulingData.orderDeliveryPlanData.order'];
            if (result[order] == undefined) {
                var orderResult = {
                    cropSchedule: 1,  //默认正常
                    stickSchedule: 1,
                    sewingSchedule: 1,
                    lockSchedule: 1,
                    ironSchedule: 1,
                    packSchedule: 1,
                };
                result[order] = orderResult;
            }
            if (new Date(item['cropEndDate']+" 23:59:59.999") < new Date() && item['amount'] > item['precedingTeamOutputData.cropAmount']) {
                result[order].cropSchedule = 0;    //
            }

            if (new Date(item['stickEndDate']+" 23:59:59.999") < new Date() && item['amount'] > item['precedingTeamOutputData.stickAmount']) {
                result[order].stickSchedule = 0;    //
            }
        }
    }
    //console.log('result_preced', result)
     let querySewing = {
        attributes: [
            'amount',
            'EndDate'
   
        ],
        include: [
            {
                 model:SewingTeamOutput_1.SewingTeamOutput,
                //association: SewingTeamOutput_1.SewingTeamOutput.hasOne(SewingTeamScheduling_1.SewingTeamScheduling, { foreignKey: 'sewingTeamScheduling', as: 'sewingTeamOutputData' }),
                attributes: [
                    'amount',
                ]
            },
            {
                model: ProductionScheduling_1.ProductionScheduling,
                attributes: [
                    'orderDeliveryPlan'
                ],
                where: {
                    factory: factory
                },
                include: [
                    {
                        model: OrderDeliveryPlan_1.OrderDeliveryPlan,
                        attributes: [
                            'order'
                        ],
                        where:{
                            order:orderList
                        }
                    }
                ]
            }
        ],
        raw: true
    }

    let docs_sewing = await SewingTeamScheduling_1.SewingTeamScheduling.findAll(querySewing)

    //console.log('docs_sewing', docs_sewing)

    if (docs_sewing && docs_sewing.length > 0) {
        for (let item of docs_sewing) {
            var order = item['productionSchedulingData.orderDeliveryPlanData.order'];
            if (result[order] == undefined) {
                var orderResult = {
                    cropSchedule: 1,  //默认正常
                    stickSchedule: 1,
                    sewingSchedule: 1,
                    lockSchedule: 1,
                    ironSchedule: 1,
                    packSchedule: 1,
                };
                result[order] = orderResult;
            }

            if (new Date(item['sewingEndDate']+" 23:59:59.999") < new Date() && item['amount'] > item['followingTeamOutputData.sewingAmount']) {
                result[order].sewingSchedule = 0;    //
            }
        }
    }
    //console.log('result_sew', result)
    ///////////////////////////
    let queryFollow = {
        attributes: [
            'amount',
            'lockEndDate',
            'ironEndDate',
            'packEndDate',
        ],
        include: [
            {
                model:FollowingTeamOutput_1.FollowingTeamOutput,
                //association: FollowingTeamOutput_1.FollowingTeamOutput.hasOne(FollowingTeamScheduling_1.FollowingTeamScheduling, { foreignKey: 'followingTeamScheduling', as: 'followingTeamOutputData' }),
                attributes: [
                    'lockAmount',
                    'ironAmount',
                    'packAmount'
                ]
            },
            {
                model: ProductionScheduling_1.ProductionScheduling,
                attributes: [
                    'orderDeliveryPlan'
                ],
                where: {
                    factory: factory
                },
                include: [
                    {
                        model: OrderDeliveryPlan_1.OrderDeliveryPlan,
                        attributes: [
                            'order'
                        ],
                        where:{
                            order:orderList
                        }
                    }
                ]
            }
        ],
        raw: true
    }

    let docs_follow = await FollowingTeamScheduling_1.FollowingTeamScheduling.findAll(queryFollow)

    //console.log('docs_follow', docs_follow)

    if (docs_follow && docs_follow.length > 0) {
        for (let item of docs_follow) {
            var order = item['productionSchedulingData.orderDeliveryPlanData.order'];
            if (result[order] == undefined) {
                var orderResult = {
                    cropSchedule: 1,  //默认正常
                    stickSchedule: 1,
                    sewingSchedule: 1,
                    lockSchedule: 1,
                    ironSchedule: 1,
                    packSchedule: 1,
                };
                result[order] = orderResult;
            }

            if (new Date(item['packEndDate']+" 23:59:59.999") < new Date() && item['amount'] > item['followingTeamOutputData.packAmount']) {
                result[order].sewingSchedule = 0;    //
            }

            if (new Date(item['lockEndDate']+" 23:59:59.999") < new Date() && item['amount'] > item['followingTeamOutputData.lockAmount']) {
                result[order].lockSchedule = 0;    //
            }
            if (new Date(item['ironEndDate']+" 23:59:59.999") < new Date() && item['amount'] > item['followingTeamOutputData.ironAmount']) {
                result[order].ironSchedule = 0;    //
            }
        }
    }
    //console.log('GetStepStatus result', result)
    return result;
  
}

async function GetOrderExceprionStatus(orderStatusData) {
    let orderStatus = {
        "exceptionCode": 0xFFFFFFFF,
        "material": {
            "status": 1,
            "message": "异常"
        },
        "operation": {
            "status": 1,
            "message": "异常"
        },
        "crop": {
            "status": 1,
            "message": "异常"
        },
        "stick": {
            "status": 1,
            "message": "异常"
        },
        "sewing": {
            "status": 1,
            "message": "异常"
        },
        "lock": {
            "status": 1,
            "message": "异常"
        },
        "iron": {
            "status": 1,
            "message": "异常"
        },
        "pack": {
            "status": 1,
            "message": "异常"
        }
    };

    // "materialOutDate": ordersMaterialOutDate[order],
    // "materialProgress": ordersMaterialProgress[order],
    //收料
    if (orderStatusData.materialProgress != undefined) {
        if (orderStatusData.materialProgress.materialProgress >= 1) {
            orderStatus.material.status = 0;
            orderStatus.material.message = "已完成"
        }
        else {
            var materialOutDate = orderStatusData.materialOutDate == undefined || orderStatusData.materialOutDate.materialOutDate == 1 ? false : true;
            if (!materialOutDate) {
                orderStatus.material.status = 0;
                orderStatus.material.message = "未到期"
            }
            else {
                orderStatus.material.status = 1;
                orderStatus.material.message = "未完成，已超期"
            }
        }
    }
    else {
        orderStatus.material.status = 1;
        orderStatus.material.message = "无记录"
    }

    //工艺
    if (orderStatusData.operationStatus == 1) {
        orderStatus.operation.status = 0;
        orderStatus.operation.message = "完成"
    }
    //console.log('orderStatusData',orderStatusData)
    let ordersScheduleStatus = orderStatusData.stepStatus;
    //console.log('ordersScheduleStatus',ordersScheduleStatus)
    //裁剪
    if (ordersScheduleStatus.cropSchedule==1) {
        orderStatus.crop.status = 0;
        orderStatus.crop.message = "完成"
    }


    //粘衬
    if (ordersScheduleStatus.stickSchedule==1) {
        orderStatus.stick.status = 0;
        orderStatus.stick.message = "完成"
    }
    //车缝
    if (ordersScheduleStatus.sewingSchedule==1) {
        orderStatus.sewing.status = 0;
        orderStatus.sewing.message = "完成"
    }
    //锁钉
    if (ordersScheduleStatus.lockSchedule==1) {
        orderStatus.lock.status = 0;
        orderStatus.lock.message = "完成"
    }

    //整烫
    if (ordersScheduleStatus.ironSchedule==1) {
        orderStatus.iron.status = 0;
        orderStatus.iron.message = "完成"
    }
    //包装
    if (ordersScheduleStatus.packSchedule==1) {
        orderStatus.pack.status = 0;
        orderStatus.pack.message = "完成"
    }

    orderStatus.exceptionCode = orderStatus.material.status << 7 | orderStatus.operation.status << 6 | orderStatus.crop.status << 5 |
        orderStatus.stick.status << 4 | orderStatus.sewing.status << 3 | orderStatus.lock.status << 2 | orderStatus.iron.status << 1 | orderStatus.pack.status;

    //console.log('orderStatus', orderStatus)
    return orderStatus;

}


exports.registerScheduleReportAPI = function (scheduleReportAPIRouter) {
    /**
     * @api {post} /scheduleReport/searchByFactory [进度报表]-统计查詢
    */
    scheduleReportAPIRouter.post('/scheduleReport/searchByFactory', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:69', 400);
        }
        else {
            let resp = dbquery_1.queryResponsePacket(ctx.request.body);
            // let query = dbquery_1.queryDBGeneratorEx(ctx.request.body, MemberOutput_1.memberOutputJoin);
            try {
                let factory = ctx.request.body.factory;
                if (!factory || factory == undefined) {
                    ctx.throw('db.invalidParameters:C0', 400);
                }


                let orderDeliveryPlanList = await GetOrderDeliveryPlanByFactory(factory);
                //console.log('orderDeliveryPlanList', orderDeliveryPlanList);

              

                let status=[3];   //0:待生产，1:废弃,2:完成，3：生产中
                if (ctx.request.body.status){
                    status=ctx.request.body.status;
                } 
              
                let queryreport = {
                    attributes: [
                        'id',
                        'orderID',
                        'style',
                        'deliveryDate',
                        'status'
                    ],
                    include: [
                        {
                            model: Style_1.Style,
                            attributes: [
                                'productName'
                            ]
                            ,
                            include: [
                                {
                                    model: StyleOperation_1.StyleOperation,
                                    attributes: [
                                        'operation'
                                        // [Sequelize_1.fn('COUNT', Sequelize_1.col('operation')), 'operationCount'],
                                    ]
                                },
                                {
                                    model: StyleProcess_1.StyleProcess,
                                    attributes: [
                                        'process'
                                        // [Sequelize_1.fn('COUNT', Sequelize_1.col('process')), 'processCount'],
                                    ]
                                }
                            ]
                            // ,
                            // include: [  
                            //     {
                            //         model: StyleProcess_1.StyleProcess,
                            //         attributes: [
                            //              'process'
                            //             // [Sequelize_1.fn('COUNT', Sequelize_1.col('process')), 'processCount'],
                            //         ]
                            //     }
                            // ]
                        },
                        {
                            model: OrderDeliveryPlan_1.OrderDeliveryPlan,
                            where: {
                                id: orderDeliveryPlanList
                            }
                            // include:
                            //     {
                            //         model: ProductionScheduling_1.ProductionScheduling
                            //     }
                        }

                    ],
                    where:{
                        status:status     
                    },
                    order:[['deliveryDate','DESC']]
                    // raw: true
                }
                let startdate = ctx.request.body.startDate;
                let enddate = ctx.request.body.endDate;
                if (startdate !=undefined&&enddate!=undefined) {
                    queryreport['where']['deliveryDate']={[Sequelize_1.Op.between]: [startdate, enddate] };
                }
                
                //console.log('queryreport', queryreport);
                let docs = await Order_1.Order.findAll(queryreport);
                //console.log('docs', docs);
                let resp = {
                    recordsCount: 0,
                    records: []
                };
                if (docs && docs.length > 0) {
                    resp.recordsCount = docs.length;
                    var orderList=[]
                    for (let item of docs) {
                        orderList.push(item.id);
                    }

                    let ordersProcessStationStatus = await GetProcessStationStatus(orderList);
                    //console.log('ordersProcessStationStatus', ordersProcessStationStatus);
    
                    let ordersProcessAmount = await GetCompletedProgressAndAmountByFactory(orderList,factory);
                    //console.log('orderProcessAmount', ordersProcessAmount);
    
                    let ordersMaterialProgress = await GetMaterialReceivingProgress(orderList);
                    //console.log('ordersMaterialProgress', ordersMaterialProgress);
    
                    let ordersMaterialOutDate = await GetMaterialReceivingOutDate(orderList);
                    //console.log('ordersMaterialOutDate', ordersMaterialOutDate);
    
                    let ordersFabricInspection = await GetFabricInspectionProgress(orderList);
                    //console.log('ordersFabricInspection', ordersFabricInspection);

                    for (let item of docs) {
                        var order = item.id;
                        
                    
                        var materialOutDate =  (ordersMaterialOutDate[order] == undefined || ordersMaterialOutDate[order].materialOutDate == 1)? "" : "且超期"; //无收料记录时undefined
                        var materialProgress = ordersMaterialProgress[order] == undefined ? 0.0000 : (ordersMaterialProgress[order].materialProgress * 100).toFixed(2);
         

                            var materialStatus = materialProgress >= 100 ? "100.00(完成" + materialOutDate + ")" : materialProgress + '(未完成' + materialOutDate + ")";
                            var record = {
                                "order": order,
                                "orderID": item.orderID,
                                "style": item.style,
                                "productName": item.styleData.productName,
                                "orderDeliveryDate": item.deliveryDate,
                                "totalAmontSum": (ordersProcessAmount[order] == undefined) ? 0 : ordersProcessAmount[order].totalAmountSum,
                                "completedProgress": (ordersProcessAmount[order] == undefined) ? 0 : ordersProcessAmount[order].completedProgress,
                                "materialStatus": materialStatus,
                                "fabricInspection": (ordersFabricInspection[order] == undefined) ? 0 : ordersFabricInspection[order].fabricInspectionProgress,
                                "operationStatus": item.styleData.styleOperationData.length > 0 ? 1 : 0,
                                "processStatus": item.styleData.styleProcessData.length > 0 ? 1 : 0,
                                "processStationStatus": ordersProcessStationStatus[order] == undefined ? 0 : ordersProcessStationStatus[order].processStationStatus,
                            
                                // demo data
                                "scheduleProgress": (ordersProcessAmount[order] == undefined) ? 0 : ordersProcessAmount[order].completedProgress,
                                "preShrinkageRate": 0.9999,
                                "trussStatus": 1,
                                "entryStoreStatus": 1,
                                //"orderStatus":item.status


                                // // "bedNumber": item.bedNumber,
                                // // "truss": item['trussPlanData.budget'],
                                // "truss": item.truss,
                                // "part": item.part,
                                // // "date":item.daysDate,
                                // "layerSum": item['cropRecordData.layerSum'],
                                // "cropDate": item.cropDate,
                                // "cardYesNo": (item.perCardSum > 0) ? "Yes" : "No"

                            }
                            // console.log('record',record);
                            // console.log('resp.records',resp.records);
                            resp.records.push(record);
                        
                    }

                }

                //console.log('resp', resp);
                ctx.body = resp;
                ctx.status = 200;
                ctx.respond = true;
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalorderIDQuery:98,error:' + err.toString(), 400);
            }
        }
    });

    scheduleReportAPIRouter.post('/scheduleReport/exceptionReport', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:69', 400);
        }
        else {
            let resp = dbquery_1.queryResponsePacket(ctx.request.body);
            // let query = dbquery_1.queryDBGeneratorEx(ctx.request.body, MemberOutput_1.memberOutputJoin);
            try {
                let factory = ctx.request.body.factory;
                if (!factory || factory == undefined) {
                    ctx.throw('db.invalidParameters:C0', 400);
                }

                let orderDeliveryPlanList = await GetOrderDeliveryPlanByFactory(factory);
                //console.log('orderDeliveryPlanList', orderDeliveryPlanList)

             

                let status=[0,3];
                if (ctx.request.body.status){
                    status=ctx.request.body.status;
                } 

                let queryreport = {
                    attributes: [
                        'id',
                        'orderID',
                        'style',
                        'deliveryDate',
                        'status'
                    ],
                    include: [
                        {
                            model: Style_1.Style,
                            attributes: [
                                'productName',
                                'productCategory',
                                'client',
                                'frontPhoto',
                                'backPhoto',
                                'status'
                            ]
                            ,
                            include: [
                                {
                                    model: StyleOperation_1.StyleOperation,
                                    attributes: [
                                        'operation'
                                        // [Sequelize_1.fn('COUNT', Sequelize_1.col('operation')), 'operationCount'],
                                    ]
                                },
                                {
                                    model: StyleProcess_1.StyleProcess,
                                    attributes: [
                                        'process'
                                        // [Sequelize_1.fn('COUNT', Sequelize_1.col('process')), 'processCount'],
                                    ]
                                }
                            ]
                            // ,
                            // include: [  
                            //     {
                            //         model: StyleProcess_1.StyleProcess,
                            //         attributes: [
                            //              'process'
                            //             // [Sequelize_1.fn('COUNT', Sequelize_1.col('process')), 'processCount'],
                            //         ]
                            //     }
                            // ]
                        },
                        {
                            model: OrderDeliveryPlan_1.OrderDeliveryPlan,
                            where: {
                                id: orderDeliveryPlanList
                            }
                            // include:
                            //     {
                            //         model: ProductionScheduling_1.ProductionScheduling
                            //     }
                        }

                    ],
                    where:{
                        status:status
                    },
                    order:[['deliveryDate','DESC']]
                    // raw: true
                }
                let startdate = ctx.request.body.startDate;
                let enddate = ctx.request.body.endDate;
                if (startdate !=undefined&&enddate!=undefined) {
                    queryreport['where']['deliveryDate']={[Sequelize_1.Op.between]: [startdate, enddate]}
                }
                ////console.log('queryreport', queryreport);
                let docs = await Order_1.Order.findAll(queryreport);
                //console.log('docs', docs);
                let resp = {
                    recordsCount: 0,
                    records: []
                };

                if (docs && docs.length > 0) {
                    resp.recordsCount = docs.length;

                    var orderList=[]
                    for (let item of docs) {
                        orderList.push(item.id);
                    }

                    let ordersProcessStationStatus = await GetProcessStationStatus(orderList);
                    //console.log('ordersProcessStationStatus', ordersProcessStationStatus);
    
                    let ordersProcessAmount = await GetCompletedProgressAndAmountByFactory(orderList,factory);
                    //console.log('orderProcessAmount', ordersProcessAmount);
    
                    let ordersMaterialProgress = await GetMaterialReceivingProgress(orderList);
                    //console.log('ordersMaterialProgress', ordersMaterialProgress);
    
                    let ordersMaterialOutDate = await GetMaterialReceivingOutDate(orderList);
                    //console.log('ordersMaterialOutDate', ordersMaterialOutDate);
    
                    let ordersFabricInspection = await GetFabricInspectionProgress(orderList);
                    //console.log('ordersFabricInspection', ordersFabricInspection);

                    let ordersScheduleStatus = await GetScheduleStatusByFactory(factory);
                    //console.log('ordersScheduleStatus', ordersScheduleStatus);
    
                    let ordersStepStatus = await GetStepStatus(factory);
                    //console.log('ordersStepStatus', ordersStepStatus);

                    for (let item of docs) {
                        var order = item.id;
                        var materialOutDate = ordersMaterialOutDate[order] == undefined || ordersMaterialOutDate[order] == 1 ? "" : "且超期";
                        var materialProgress = ordersMaterialProgress[order] == undefined ? 0.0000 : (ordersMaterialProgress[order].materialProgress * 100).toFixed(2);
                        var materialStatus = materialProgress >= 100 ? "100(完成" + materialOutDate + ")" : materialProgress + '(未完成' + materialOutDate + ")";
                        //console.log('item', item);
                        var record = {
                            "order": order,
                            "orderID": item.orderID,
                            "style": item.style,
                            "productName": item.styleData.productName,
                            'productCategory': item.styleData.productCategory,
                            'client': item.styleData.client,
                            'frontPhoto': item.styleData.frontPhoto,
                            'backPhoto': item.styleData.backPhoto,
                            'styleStatus': item.styleData.status,
                            "orderDeliveryDate": item.deliveryDate,
                            "totalAmontSum": (ordersProcessAmount[order] == undefined) ? 0 : ordersProcessAmount[order].totalAmountSum,
                            "completedProgress": (ordersProcessAmount[order] == undefined) ? 0 : ordersProcessAmount[order].completedProgress,
                            "materialStatus": materialStatus,
                            "fabricInspection": (ordersFabricInspection[order] == undefined) ? 0 : ordersFabricInspection[order].fabricInspectionProgress,
                            "operationStatus": item.styleData.styleOperationData.length > 0 ? 1 : 0,
                            "processStatus": item.styleData.styleProcessData.length > 0 ? 1 : 0,
                            "processStationStatus": ordersProcessStationStatus[order] == undefined ? 0 : ordersProcessStationStatus[order].processStationStatus,
                            // demo data
                            "scheduleProgress": (ordersProcessAmount[order] == undefined) ? 0 : ordersProcessAmount[order].completedProgress,
                            "preShrinkageRate": 0.9999,
                            "trussStatus": 1,
                            "entryStoreStatus": 1,

                            "materialOutDate": ordersMaterialOutDate[order],
                            "materialProgress": ordersMaterialProgress[order],
                            // "scheduleStatus": ordersScheduleStatus[order],
                            "stepStatus":ordersStepStatus[order]==undefined? {cropSchedule:0,stickSchedule:0,sewingSchedule:0,lockSchedule:0,cropSchedule:0,packSchedule:0}:ordersStepStatus[order],
                            
                            "cropProgress": (ordersScheduleStatus[order] == undefined||ordersScheduleStatus[order].amountSum==0) ? 0.0000 : (ordersScheduleStatus[order].cropCompleteAmountSum / ordersScheduleStatus[order].amountSum).toFixed(4),
                            "stickProgress": (ordersScheduleStatus[order] == undefined||ordersScheduleStatus[order].amountSum==0) ? 0.0000 : (ordersScheduleStatus[order].stickCompleteAmountSum / ordersScheduleStatus[order].amountSum).toFixed(4),
                            "sewingProgress":(ordersScheduleStatus[order] == undefined||ordersScheduleStatus[order].amountSum==0) ? 0.0000 : (ordersScheduleStatus[order].sewingCompleteAmountSum / ordersScheduleStatus[order].amountSum).toFixed(4),
                            "lockProgress": (ordersScheduleStatus[order] == undefined||ordersScheduleStatus[order].amountSum==0) ? 0.0000 : (ordersScheduleStatus[order].lockCompleteAmountSum / ordersScheduleStatus[order].amountSum).toFixed(4),
                            "ironProgress": (ordersScheduleStatus[order] == undefined||ordersScheduleStatus[order].amountSum==0) ? 0.0000 : (ordersScheduleStatus[order].ironCompleteAmountSum / ordersScheduleStatus[order].amountSum).toFixed(4),
                            "packProgress": (ordersScheduleStatus[order] == undefined||ordersScheduleStatus[order].amountSum==0) ? 0.0000 : (ordersScheduleStatus[order].packCompleteAmountSum / ordersScheduleStatus[order].amountSum).toFixed(4)
                        }

                        let exceptionStatus = await GetOrderExceprionStatus(record);
                        record['exceptionStatus'] = exceptionStatus;
                        if (exceptionStatus.exceptionCode != 0x0000) {
                            resp.records.push(record);
                        }

                    }
                    resp.recordsCount = resp.records.length;

                }

                //console.log('resp', resp);
                ctx.body = resp;
                ctx.status = 200;
                ctx.respond = true;
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalorderIDQuery:98,error:' + err.toString(), 400);
            }
        }
    });



}
