// Author LiuYutao     20181017
// 根据styleID获取获取班组名称以及每个班组对应的实际进度，计划进度，以及实际累计和计划累计


"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const dbquery_1 = require("../database/dbquery");
const Sequelize_1 = require("sequelize")

const SewingTeamScheduling_1 =require("../database/models/SewingTeamScheduling");
const OrderDeliveryPlan_1 =require("../database/models/OrderDeliveryPlan");
const ProductionScheduling_1 =require("../database/models/ProductionScheduling");


exports.registerProductionScheduleAPI = function (productionScheduleAPIRouter) {
    /**
     * @api {get} /productionSchedule/:orderID [依據訂單號 也可增加工廠id，色號，查詢未分配數量以及剩餘數量]-查詢
     * @apiDescription 依據訂單號 也可增加工廠id，色號，查詢未分配數量以及剩餘數量
     * @apiGroup Order
     * @apiVersion 0.0.1
     * @apiUse Yutao Liu
     * @apiParam {Int} [orderID] 訂單號
     * @apiParam {Int} [factoryID] 可選 工廠ID
     * @apiParam {Int} [colorCode] 可選 色號
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/productionSchedule/:orderID?factoryID=1&colorCode=1
     * @apiSuccess (Success 200) {Array} records 查詢的結果。
     * @apiSuccessExample {json} Response Example
     * {
         *   "shengchanC_total_weifenpei_db": {
         *           "意大利": {
         *                       "XS": 0,
         *                       "S": 200,
         *                       "L": 0,
         *                       "XL": 1000,
         *                       "XXL": 0,
         *                       "XXXL": 0,
         *                       "XXXXL": 0
         *                   },
         *    },
         *    "shengchanC_total_factory_db": {
         *           "意大利": {
         *                       "XS": 0,
         *                       "S": 300,
         *                       "L": 0,
         *                       "XL": 600,
         *                       "XXL": 0,
         *                       "XXXL": 0,
         *                       "XXXXL": 0
         *                     }
         *     }
         * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    productionScheduleAPIRouter.get('/productionSchedule/', async (ctx) => {
        if(!ctx.query || !ctx.query.orderID || ctx.query.orderID == undefined){
            ctx.throw('api.invalidParameters:162', 400);
        }
        else{
            try {

                let orderID =ctx.query.orderID;
                let factoryID =null;
                let colorCode =null;
                if(ctx.query.factoryID && ctx.query.factoryID !=undefined && ctx.query.factoryID !=null){
                    factoryID =ctx.query.factoryID;
                }
                if(ctx.query.colorCode && ctx.query.colorCode !=undefined && ctx.query.colorCode !=null){
                    colorCode =ctx.query.colorCode;
                }

                //1 获取所有的数据
                let totalData = await getTotalDataByOrderID(orderID);

                if(colorCode !=null){
                    filterColor(colorCode,totalData);
                }
                let sizeList =getSizeList(totalData);

                //2 获取到已分配的数量
                let orderDeliveryPlanIds =getOrderDeliveryPlanIds(totalData);
                let productionScheduleData =await getScheduleData(orderDeliveryPlanIds);
                //console.log("productionScheduleData");
                //console.log(productionScheduleData);
                let remainderAmount =getRemainderAmount(totalData,productionScheduleData);

                /*
                if(factoryID){
                    filterFactory(factoryID,totalData);
                }
                */
                //获取 相同的生产单号的总数量
                //step 1 根据 order id 获取 orderID，
                //step 2 根据 orderID获取 order id
                //step 3 根据order id 统计orderDeliveryPlan中的数量
                //let totalAmount =await getTotalAmount(orderID);

                let data ={
                    shengchanC_total_weifenpei_db:remainderAmount,
                    shengchanC_total_factory_db :getAllocatedAmount(factoryID,totalData,productionScheduleData)

                };



                ctx.body = data;
                ctx.status = 200;
                ctx.respond = true;
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalorderIDQuery:98', 400);
            }
        }
    });
    //获取 所有orderDeliveryPlanIds
    function getOrderDeliveryPlanIds(totalData) {
        let ids =[];
        for(let i=0;i<totalData.length;i++){
            ids.push(totalData[i].id)
        }
        console.log(ids);
        return ids;
    }
    //获取productionScheduling的数据
    async function getScheduleData(orderDeliveryPlans){
        let scheduleData=await ProductionScheduling_1.ProductionScheduling.findAll({
            where:{
                orderDeliveryPlan: {
                    [Sequelize_1.Op.in]: orderDeliveryPlans
                },
            },
            raw:true
        });
        return scheduleData;
    }
    //动态获取 尺码 列表
    function getSizeList(totalData) {
        let tempSizeList =[];
        //console.log((totalData[0].size).toUpperCase());

        for(let i=0;i<totalData.length;i++){
            let sizeStr =(totalData[i].size).toUpperCase();
            if(tempSizeList.indexOf(sizeStr) <0 ){
                tempSizeList.push(sizeStr);
            }
        }
        return tempSizeList;
    }
    //根据 post的数据获取 尺码的最大集
    function getSizeListFromData(allData) {
        let tempSizeList =[];
        for(let i=0;i<allData.length;i++){
            let keys =Object.keys(allData[i]);
            for(let j=0;j<keys.length;j++){
                let sizeStr =keys[j];
                if(tempSizeList.indexOf(sizeStr) <0 ){
                    tempSizeList.push(sizeStr);
                }
            }
        }
        tempSizeList.splice(tempSizeList.indexOf("COUNTRY"),1);
        return tempSizeList;
    }

    // 获取 该订单的数据 未过滤 工厂，色号等信息
    async function getTotalDataByOrderID(orderID) {
        /*
        let hasAllocated =true;
        let queryString ="SELECT OrderDeliveryPlan.*,ProductionScheduling.* FROM OrderDeliveryPlan,ProductionScheduling" +
            " WHERE OrderDeliveryPlan.id=ProductionScheduling.orderDeliveryPlan" +
            " AND OrderDeliveryPlan.`order` ="+orderID;
        let totalData =(await OrderDeliveryPlan_1.OrderDeliveryPlan.sequelize.query(queryString))[0];
        if(totalData.length <1 ){
            //一条排产也没有
            queryString ="SELECT OrderDeliveryPlan.* FROM OrderDeliveryPlan" +
                " WHERE OrderDeliveryPlan.`order` ="+orderID;
            totalData =(await OrderDeliveryPlan_1.OrderDeliveryPlan.sequelize.query(queryString))[0];
            hasAllocated=false;
        }
        */
        let queryString ="SELECT OrderDeliveryPlan.* FROM OrderDeliveryPlan" +
            " WHERE OrderDeliveryPlan.`order` ="+orderID;
        let totalData =(await OrderDeliveryPlan_1.OrderDeliveryPlan.sequelize.query(queryString))[0];

        //获取 所有的 数据

        return totalData;
    }

    // 过滤 颜色
    function filterColor(colorCode,totalData) {
        for(let i=0;i<totalData.length;i++){
            if(colorCode != totalData[i].colorCode){
                totalData.splice(i,1);
                i--;
            }
        }
    }
    // 过滤 工厂
    function filterFactory(factoryID,totalData) {
        for(let i=0;i<totalData.length;i++){
            if(factoryID != totalData[i].factory){
                totalData.splice(i,1);
                i--;
            }
        }
    }
    // 获取 已分配的数量
    /*
    function getAllocatedAmount(totalData,sizes){
        let regions =getDeliveryRegionList(totalData);
        let allocated={};
        for(let i=0;i<regions.length;i++){
            let re={};
            for(let j=0;j<sizes.length;j++){
                re[sizes[j]]=findAllocatedByRS(regions[i],sizes[j],totalData);
            }
            allocated[regions[i]]=re;

        }
        return allocated;
    }
    */
    function getAllocatedAmount(factoryID,totalData,productionScheduleData) {
        let allocated={};
        for(let i=0;i<productionScheduleData.length;i++){
            if(factoryID ==productionScheduleData[i].factory){
                let id =productionScheduleData[i].orderDeliveryPlan;
                //console.log("id ==>");
                //console.log(id);
                //console.log(totalData.length);
                for(let j=0;j<totalData.length;j++){
                    if(totalData[j].id == id){
                        if(allocated[totalData[j].deliveryRegion] ==undefined){
                            allocated[totalData[j].deliveryRegion]={};
                        }
                        if(allocated[totalData[j].deliveryRegion][totalData[j].size] ==undefined){
                            allocated[totalData[j].deliveryRegion][totalData[j].size]=productionScheduleData[i].amount;
                        }
                        break;
                    }
                }
            }
        }
        return allocated;
    }

    // 获取 未分配数量
    /*
    function getRemainderAmount(totalData,sizes) {
        let regions =getDeliveryRegionList(totalData);
        let remainder={};
        for(let i=0;i<regions.length;i++){
            let re={};
            for(let j=0;j<sizes.length;j++){
                re[sizes[j]]=findRemainderByRS(regions[i],sizes[j],totalData);
            }
            remainder[regions[i]]=re;

        }

        return remainder;
    }
    */
    function getRemainderAmount(data,scheduleData) {
        let remainder ={};
        let totalData =data.slice();
        //先去除外协的数量
        totalData.forEach(function (item) {
            /*
            item.amount =item.totalAmount -item.outsourcingAmount;
            item.remainderAmount =item.totalAmount;
            */
            item.amount =item.totalAmount -item.outsourcingAmount;
            item.remainderAmount =item.amount;
        });
        scheduleData.forEach(function (item) {
            let id =item.orderDeliveryPlan;
            for(let i=0;i<totalData.length;i++){
                if(id == totalData[i].id){
                    //console.log("totalData[i].amount ==>");
                    //console.log(totalData[i].amount);
                    //console.log(item.amount);
                    //totalData[i].remainderAmount =totalData[i].amount -item.amount;
                    totalData[i].remainderAmount =totalData[i].remainderAmount -item.amount;
                }
            }
        });

        totalData.forEach(function (item){
            //console.log("remainder[item.deliveryRegion] ");
            //console.log(remainder[item.deliveryRegion]);
            if(remainder[item.deliveryRegion] ==undefined){
                remainder[item.deliveryRegion]={};
            }
            if(remainder[item.deliveryRegion][item.size] ==undefined){
                remainder[item.deliveryRegion][item.size]=item.remainderAmount;
            }
        });

        return remainder;

    }


    // 获取 交地列表
    function getDeliveryRegionList(totalData) {
        let regions =[];
        for(let i=0;i<totalData.length;i++){
            if(!isInRegion(totalData[i].deliveryRegion,regions)){
                regions.push(totalData[i].deliveryRegion);
            }
        }
        return regions;
    }

    // 根据 交地 尺码 查找 计算 未分配数量
    function findRemainderByRS(region,size,totalData) {
        let remainder =0;
        let count =0;
        let isFirst =false;
        let outAmount =0;
        /*
        console.log("region ==> ");
        console.log(region);
        console.log("size ==> ");
        console.log(size);
        console.log("totalData ==> ");
        console.log(totalData);
        */

        for(let i=0;i<totalData.length;i++){
            if(region ==totalData[i].deliveryRegion && size ==totalData[i].size){
                remainder += totalData.hasAllocated?(totalData[i].totalAmount -totalData[i].amount):totalData[i].totalAmount;

                if(isFirst == true){
                    count +=totalData[i].totalAmount;
                    outAmount=(totalData[i].outsourcingAmount ==null)?0:totalData[i].outsourcingAmount;
                }
                if(isFirst == false){
                    isFirst =true;
                }
            }
        }
        return remainder-count-outAmount;
    }
    // 根据 交地 尺码 查找 已分配数量
    function findAllocatedByRS(region,size,totalData) {
        let allocated =0;
        for(let i=0;i<totalData.length;i++){
            if(region ==totalData[i].deliveryRegion && size ==totalData[i].size){
                allocated += totalData[i].amount;
            }
        }
        return allocated;
    }
    //判断 该交地 是否已经存在于列表中
    function isInRegion(re,regions) {
        for(let i=0;i<regions.length;i++){
            if(re == regions[i]){
                return true;
            }
        }
        return false;
    }

    //获取 总数量
    /*
    async function getTotalAmount(order) {
        let queryString ="SELECT SUM(OrderDeliveryPlan.totalAmount) as tAmount FROM OrderDeliveryPlan " +
            "WHERE OrderDeliveryPlan.`order` IN ( " +
            "SELECT `Order`.id FROM `Order` WHERE `Order`.orderID =(" +
            "SELECT `Order`.orderID FROM `Order` WHERE `Order`.id=" +order+
            ")" +
            ")";
        let allAmount = (await OrderDeliveryPlan_1.OrderDeliveryPlan.sequelize.query(queryString))[0];
        //console.log(allAmount[0].tAmount);
        return allAmount[0].tAmount;
    }

    */
    // ===================================================
    //根据order，color，size，deliveryRegion 获取id
    async function getOrderDeliveryPlans(orderId,colorCode) {

        let orderDeliveryPlanData =await OrderDeliveryPlan_1.OrderDeliveryPlan.findAll({
            where:{
                order:orderId,
                colorCode:colorCode,
            },
            raw:true
        });
        return orderDeliveryPlanData;
    }
    function getOrderDeliveryPlanIDBySizeCountry(plans,size,country) {
        let orderDeliveryPlanId=-1;
        for(let i=0;i<plans.length;i++){
            if(size == plans[i].size && country ==plans[i].deliveryRegion){
                orderDeliveryPlanId=plans[i].id;
                break;
            }
        }
        return orderDeliveryPlanId;
    }
    async function getSchedulesByFactory(factory) {
        let schedules =await ProductionScheduling_1.ProductionScheduling.findAll({
            where:{
                factory:factory
            },
            raw:true
        });
        return schedules;
    }
    function getScheduleIDByOrderDeliveryPlan(schedules,OrderDeliveryPlan) {
        let orderDeliveryPlanId=-1;
        for(let i=0;i<schedules.length;i++){
            if(OrderDeliveryPlan == schedules[i].orderDeliveryPlan){
                orderDeliveryPlanId = schedules[i].id;
                break;
            }
        }
        return orderDeliveryPlanId;
    }
    
    async function addOrUpdateData(sizeList,allData,plans,schedules,factory,ctx) {
        for(let i=0;i<allData.length;i++){
            for(let j=0;j<sizeList.length;j++){
                if(-1 < allData[i][sizeList[j]]){
                    //找到 orderDeliveryPlan 的id 即productionScheduling中的orderDeliverPlan
                    //根据 orderDeliverPlan 和factory 在ProductionScheduling中查询，有则更新，没有则添加
                    let orderDeliveryPlan=getOrderDeliveryPlanIDBySizeCountry(plans,sizeList[j],allData[i].country);
                    if(0 > orderDeliveryPlan){
                        ctx.throw('api.none Record in [OrderDeliveryPlan] with size:'+sizeList[j]+' country:'+allData[i].country+' :162', 400);
                    } else {
                        let scheduleId =getScheduleIDByOrderDeliveryPlan(schedules,orderDeliveryPlan);
                        let count =0;
                        if(0 > scheduleId){
                            //插入数据
                            count=await ProductionScheduling_1.ProductionScheduling.create({
                                    orderDeliveryPlan:orderDeliveryPlan,
                                    factory:factory,
                                    amount:allData[i][sizeList[j]]
                            });
                        } else {
                            count=await ProductionScheduling_1.ProductionScheduling.update(
                                {
                                    orderDeliveryPlan:orderDeliveryPlan,
                                    factory:factory,
                                    amount:allData[i][sizeList[j]]
                                },
                                {
                                    where:{
                                        id:scheduleId
                                    }

                                }
                            );
                        }
                        //console.log(count);
                    }

                }
            }
        }
        return {"result":true};
    }

    /**
     * @api {post} /productionSchedule/update [修改或新增排產計劃]-查詢
     * @apiDescription 修改或新增排產計劃
     * @apiGroup Order
     * @apiVersion 0.0.1
     * @apiUse Yutao Liu
     * @apiParam {Json} [Json] 修改/新增的數據
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/productionSchedule/:orderID?factoryID=1&colorCode=1
     * @apiParamExample {multipart/form-data} Request Example:
     *  {"orderid":"2","color":"1","factory":"105",
     *   "alldata":[
     *       {"country":"中国","XS":"0","S":"200","M":0,"L":"0","XL":"400","XXL":"0","XXXL":"0","XXXXL":"0"},
     *       {"country":"美国","XS":"0","S":"0","M":0,"L":"0","XL":"400","XXL":"0","XXXL":"0","XXXXL":"0"},
     *       {"country":"意大利","XS":"0","S":"0","M":0,"L":"0","XL":"400","XXL":"0","XXXL":"0","XXXXL":"0"}
     *       ]
     *  }
     * @apiSuccess (Success 200) {Boolean} records 執行結果。
     * @apiSuccessExample {Boolean} Response Example
     * {
     *     "result": true
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    productionScheduleAPIRouter.post('/productionSchedule/update', async (ctx) => {
        /*
        {"orderid":"1","color":"1","factory":"1",
        "alldata":[
            {"country":"中国","XS":"100","S":"200","M":0,"L":"300","XL":"400","XXL":"500","XXXL":"100","XXXXL":"50"},
            {"country":"美国","XS":"100","S":"200","M":0,"L":"300","XL":"400","XXL":"500","XXXL":"100","XXXXL":"50"},
            {"country":"英国","XS":0,"S":0,"M":0,"L":0,"XL":0,"XXL":0,"XXXL":0,"XXXXL":0}
            ]
        }
         */
        if(!ctx.request.body ){
            ctx.throw('api.invalidParameters:162', 400);
        }
        else{
            try {
                let orderId = (ctx.request.body.orderID)?ctx.request.body.orderID:null;
                let colorCode =(ctx.request.body.color)?ctx.request.body.color:null;
                let factoryId =(ctx.request.body.factory)?ctx.request.body.factory:null;
                let allData =(ctx.request.body.alldata)?ctx.request.body.alldata:null;

                if(orderId ==null || colorCode ==null || factoryId == null || allData==null){
                    ctx.throw('api.invalidParameters:162', 400);
                }
                //step1 根据orderid colorCode，size和deliveryRegion 在orderDeliveryPlan查询是否有数据
                //step2 如果step1 有数据 则获取step1 中的id，即productionScheduling中的orderDeliveryPlan，
                //      和factory一起查询ProductionScheduling是否有数据，有则更新amount，没有则添加
                //step3 如果step2 没有数据有抛出异常
                let plans =await getOrderDeliveryPlans(orderId,colorCode);
                if(1> plans.length){
                    ctx.throw('api.noneRecordIn[orderDeliveryPlan] with parameters [ orderID:'
                        +orderId+',colorCode:'
                        +colorCode+']:162', 400);
                }
                let schedules =await getSchedulesByFactory(factoryId);
                //在提交的数据中获取尺码列表的最大集合
                let sizeList =getSizeListFromData(allData);

                ctx.body =await addOrUpdateData(sizeList,allData,plans,schedules,factoryId,ctx);
                ctx.status = 200;
                ctx.respond = true;
            }
            catch (err) {
                console.log(err);
                ctx.throw(err, 400);
            }
        }
    });





}
