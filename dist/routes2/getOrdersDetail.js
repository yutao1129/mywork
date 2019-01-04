// Author LiuYutao     20181017
// Yutao.liu 增加order的status字段，增加倒序显示
// step 1 在Order表中獲取 生產單號，訂單交期 以及訂單ids
// step 2 根據 訂單ids 在OrderDeliveryPlan中 統計totalAmount 即為總數量
//        同時在該表中獲取OrderDeliveryPlan id
// step 3 根據step 2 中獲取的orderDeliveryPlan 在ProductionScheduling中獲取每個工廠的amount

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const Order_1 =require("../database/models/Order");
const OrderDeliveryPlan_1 =require("../database/models/OrderDeliveryPlan");
const ProductionScheduling_1 =require("../database/models/ProductionScheduling");
const Factory_1 =require("../database/models/Factory");
const Sequelize_1 = require("sequelize");
const dbquery_1 = require("../database/dbquery");
const Style_1 = require("../database/models/Style");

exports.registerGetOrdersDetailAPI = function (getOrdersDetailAPIRouter) {
    /**
     * @api {get} /Order/getOrdersDetail [查詢訂單明細]-查詢
     * @apiDescription 查詢所有訂單的詳細分配信息
     * @apiGroup Knowledge Base
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number=100} [maxRows] 最大筆數
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/Order/getOrdersDetail?maxRows=2
     * @apiSuccess (Success 200) {Array} records 查詢的結果。
     * @apiSuccessExample {json} Response Example
     *
     * [
     *  {
     *   "id": 1,
     *   "orderNo": "order001",
     *   "deliveryDate": "2018-10-25",
     *   "totalAmount": 7200,
     *   "allocatedAmount": 535,
     *   "factorys": {
     *       "A001": 535
     *       "A002": 1400
     *    }
     *  }
     * ]
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    getOrdersDetailAPIRouter.get('/Order/getOrdersDetail', async (ctx) => {
        try {
            let maxRows =(ctx.query.maxRows)?parseInt(ctx.query.maxRows):0;

            let orderIds =[];
            let orders =[];
            let styleIds =[];
            let orderDeliveryPlanIds =[];
            let orderData =await getOrders(orderIds,orders,styleIds,maxRows);
            let styles =await getStyles(styleIds);
            findStyleByOrders(orders,styles);

            let orderDeliveryPlanData =await getTotalAmount(orderIds,orders);
            let scheduleData =await getScheduleData();
            let factorys =await getFactorys();
            getAllocatedAmount(orders,scheduleData);

            getAllocatedAmountByFactory(orders,scheduleData,factorys);

            for(let i=0;i<orders.length;i++){
                delete orders[i].deliveryPlanIds;
            }


            ctx.body = orders;
            ctx.status = 200;
            ctx.respond = true;
        }
        catch (err) {
            console.log(err);
            ctx.throw('db.invalorderIDQuery:98', 400);
        }
    });

    //獲取 工廠信息
    async function getFactorys() {
        return await Factory_1.Factory.findAll({raw:true});
    }
    function findFactoryID(factoryId,factorys) {
        for(let i=0;i<factorys.length;i++){
            if(factoryId == factorys[i].id){
                return factorys[i].factoryID;
            }
        }
    }
    //獲取 order的信息
    async function getOrders(orderIds,orders,styleIds,maxRows) {
        let orderData =null;

        if(0 < maxRows){
            orderData =await Order_1.Order.findAll({
                raw:true,
                limit:maxRows,
                order: [
                    ['createdTime', 'DESC']
                ]
            });
        } else {
            orderData =await Order_1.Order.findAll({
                raw:true,
                order: [
                    ['createdTime', 'DESC']
                ]
            });
        }
        for(let i=0;i<orderData.length;i++){
            orderIds.push(orderData[i].id);
            styleIds.push(orderData[i].style);
            orders.push({
                "id":orderData[i].id,
                "orderNo":orderData[i].orderID,
                "deliveryDate":orderData[i].deliveryDate,
                "style":orderData[i].style,
                "status":orderData[i].status
            });

        }
        return orderData
    }
    //获取 style的信息
    async function getStyles(styleIds) {
        return await Style_1.Style.findAll({
            where:{
                styleID: {
                    [Sequelize_1.Op.in]: styleIds
                },
            },
            raw:true
        });
    }
    //关联 order和style
    function findStyleByOrders(orders,styles) {
        for(let i=0;i<orders.length;i++){
            for(let j=0;j<styles.length;j++){
                if(orders[i].style == styles[j].styleID){
                    orders[i].productName = styles[j].productName;
                    orders[i].productCategory =styles[j].productCategory;
                    break;
                }
            }
        }
    }
    //獲取 OrderDeliveryPlan 中的totalAmount
    async function getTotalAmount(orderIds,orders) {
        let orderDeliveryPlanData =await OrderDeliveryPlan_1.OrderDeliveryPlan.findAll({
            where:{
                order: {
                    [Sequelize_1.Op.in]: orderIds
                },
            },
            raw:true
        });

        for(let i=0;i<orders.length;i++){
            let deliveryPlanIds=[];
            orders[i].totalAmount =sumTotalAmount(orders[i].id,orderDeliveryPlanData,deliveryPlanIds);
            orders[i].deliveryPlanIds =deliveryPlanIds;
        }
        //console.log(orders);
        return orderDeliveryPlanData;
        
    }
    //計算 totalAmount
    function sumTotalAmount(order,orderDeliveryPlan,deliveryPlanIds) {
        let totalAmount =0;
        for(let i=0;i<orderDeliveryPlan.length;i++){
            if(order == orderDeliveryPlan[i].order){
                totalAmount += orderDeliveryPlan[i].totalAmount;
                deliveryPlanIds.push(orderDeliveryPlan[i].id);
            }
        }
        return totalAmount;
    }
    //獲取 陪產計劃
    async function getScheduleData() {
        return await ProductionScheduling_1.ProductionScheduling.findAll({
            raw:true
        });
    }
    //獲取 已分配數量
    function getAllocatedAmount(orders,scheduleData) {
        for(let i=0;i<orders.length;i++){
            let allocatedAmount =0;
            for(let j=0;j<orders[i].deliveryPlanIds.length;j++){
                allocatedAmount +=findAllocatedAmount(orders[i].deliveryPlanIds[j],scheduleData);
            }
            orders[i].allocatedAmount =allocatedAmount;
            orders[i].factorys={};
        }
    }
    function findAllocatedAmount(orderDeliveryPlan,scheduleData) {
        let amount =0;
        for(let i=0;i<scheduleData.length;i++){
            if(orderDeliveryPlan == scheduleData[i].orderDeliveryPlan){
                amount +=scheduleData[i].amount;
            }
        }
        return amount;
    }
    //向orders中裝配 工廠信息
    function getAllocatedAmountByFactory(orders,scheduleData,factorys) {
        //console.log(scheduleData);
        for(let i=0;i<scheduleData.length;i++){
            for(let j=0;j<orders.length;j++){
                if(-1<orders[j].deliveryPlanIds.indexOf(scheduleData[i].orderDeliveryPlan)){
                    let factoryID =findFactoryID(scheduleData[i].factory,factorys);
                    if(orders[j].factorys[factoryID] !=undefined){
                        orders[j].factorys[factoryID ] += scheduleData[i].amount;
                    } else {
                        orders[j].factorys[factoryID] = scheduleData[i].amount;
                    }
                    break;
                }
            }
        }
    }


}
