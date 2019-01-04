// Author LiuYutao     20181017
// 根据styleID获取获取班组名称以及每个班组对应的实际进度，计划进度，以及实际累计和计划累计


"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const dbquery_1 = require("../database/dbquery");
const Sequelize_1 = require("sequelize")

const SewingTeamScheduling_1 =require("../database/models/SewingTeamScheduling");
const SewingTeamOutput_1  =require("../database/models/SewingTeamOutput");
const PrecedingTeamScheduling_1=require("../database/models/PrecedingTeamScheduling");
const PrecedingTeamOutput_1 =require("../database/models/PrecedingTeamOutput");
const FollowingTeamScheduling_1=require("../database/models/FollowingTeamScheduling");
const FollowingTeamOutput_1 =require("../database/models/FollowingTeamOutput");
const commonAPI_1 = require("./commonAPI.js");

exports.registerGetProcStatisticsByOrderID2API = function (getProcStatisticsByOrderID2APIRouter) {
    /**
     * @api {get} /Statistics/getProcStatisticsByOrderID [依據工單號 查詢裁剪，粘襯，車縫，鎖釘，整燙，包裝 各個生產步驟中的班組產量統計]-查詢
     * @apiDescription 依據工單號 查詢裁剪，粘襯，車縫，鎖釘，整燙，包裝 各個生產步驟中的班組產量統計
     * @apiGroup Order
     * @apiVersion 0.0.1
     * @apiUse Yutao Liu
     * @apiParam {Int} [orderID] 款式ID
     * @apiParam {Int} [factoryID] 工廠ID
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/Statistics/getProcStatisticsByOrderID?orderID=2&factoryID=1
     * @apiSuccess (Success 200) {Array} records 查詢的結果。
     * @apiSuccessExample {json} Response Example
     * [
     *  {
     *     "裁剪": [
     *        {
     *            "id": 1,
     *            "productionScheduling": 3,
     *            "cropTeam": 1,
     *            "stickTeam": 3,
     *            "amount": 500,
     *            "cropEstimatedWorkingDay": 2,
     *            "cropStartDate": "2018-10-08",
     *            "cropEndDate": "2018-10-10",
     *            "stickEstimatedWorkingDay": 2,
     *            "stickStartDate": "2018-10-11",
     *            "stickEndDate": "2018-10-13",
     *            "teamID": "T01",
     *            "name": "CRT01",
     *            "factory": 1,
     *            "category": "裁剪",
     *            "stationAmount": 10,
     *            "leader": 2,
     *            "leaderPhoneNumber": "19999999999",
     *            "realQuantity": 100,
     *            "realProcess": 20,
     *            "curPlanProcess": 100,
     *            "curPlanAmount": 500
     *        }
     *    ]
     *},
     *{
     *    "粘衬": [
     *        {
     *            "id": 3,
     *            "productionScheduling": 3,
     *            "cropTeam": 1,
     *            "stickTeam": 3,
     *            "amount": 500,
     *            "cropEstimatedWorkingDay": 2,
     *            "cropStartDate": "2018-10-08",
     *            "cropEndDate": "2018-10-10",
     *            "stickEstimatedWorkingDay": 2,
     *            "stickStartDate": "2018-10-11",
     *            "stickEndDate": "2018-10-13",
     *            "teamID": "NC01",
     *            "name": "粘衬1组",
     *            "factory": 1,
     *            "category": "粘衬",
     *            "stationAmount": 2,
     *            "leader": null,
     *            "leaderPhoneNumber": null,
     *            "realQuantity": 99,
     *            "realProcess": 19.8,
     *            "curPlanProcess": 100,
     *            "curPlanAmount": 500
     *        }
     *    ]
     *},
     *{
     *    "车缝": {
     *        "id": 4,
     *        "productionScheduling": 3,
     *        "team": 4,
     *        "amount": 500,
     *        "estimatedWorkingDay": 13,
     *        "startDate": "2018-10-15",
     *        "endDate": "2018-10-28",
     *        "teamID": "CF01",
     *        "name": "车缝1组",
     *        "factory": 1,
     *        "category": "车缝",
     *        "stationAmount": 6,
     *        "leader": 7,
     *        "leaderPhoneNumber": null,
     *        "realQuantity": 200,
     *        "realProcess": 40,
     *        "curPlanProcess": 100,
     *        "curPlanAmount": 500
     *    }
     *},
     *{
     *    "锁钉": [
     *        {
     *            "id": 1,
     *            "productionScheduling": 3,
     *            "lockTeam": 1,
     *            "ironTeam": 6,
     *            "packTeam": 7,
     *            "amount": 500,
     *            "lockEstimatedWorkingDay": 2,
     *            "lockStartDate": "2018-10-12",
     *            "lockEndDate": "2018-10-14",
     *            "ironEstimatedWorkingDay": 10,
     *            "ironStartDate": "2018-10-15",
     *            "ironEndDate": "2018-10-24",
     *            "packEstimatedWorkingDay": 2,
     *            "packStartDate": "2018-10-18",
     *            "packEndDate": "2018-10-19",
     *            "teamID": "T01",
     *            "name": "CRT01",
     *            "factory": 1,
     *            "category": "裁剪",
     *            "stationAmount": 10,
     *            "leader": 2,
     *            "leaderPhoneNumber": "19999999999",
     *            "realQuantity": 400,
     *            "realProcess": 80,
     *            "curPlanProcess": 100,
     *            "curPlanAmount": 500
     *        }
     *    ]
     *},
     *{
     *    "整烫": [
     *        {
     *            "id": 6,
     *            "productionScheduling": 3,
     *            "lockTeam": 1,
     *            "ironTeam": 6,
     *            "packTeam": 7,
     *            "amount": 500,
     *            "lockEstimatedWorkingDay": 2,
     *            "lockStartDate": "2018-10-12",
     *            "lockEndDate": "2018-10-14",
     *            "ironEstimatedWorkingDay": 10,
     *            "ironStartDate": "2018-10-15",
     *            "ironEndDate": "2018-10-24",
     *            "packEstimatedWorkingDay": 2,
     *            "packStartDate": "2018-10-18",
     *            "packEndDate": "2018-10-19",
     *            "teamID": "ZT01",
     *            "name": "整烫1组",
     *            "factory": 1,
     *            "category": "整烫",
     *            "stationAmount": 2,
     *            "leader": null,
     *            "leaderPhoneNumber": null,
     *            "realQuantity": 400,
     *            "realProcess": 80,
     *            "curPlanProcess": 100,
     *            "curPlanAmount": 500
     *        }
     *    ]
     *},
     *{
     *    "包装": [
     *        {
     *            "id": 7,
     *            "productionScheduling": 3,
     *            "lockTeam": 1,
     *            "ironTeam": 6,
     *            "packTeam": 7,
     *            "amount": 500,
     *            "lockEstimatedWorkingDay": 2,
     *            "lockStartDate": "2018-10-12",
     *            "lockEndDate": "2018-10-14",
     *            "ironEstimatedWorkingDay": 10,
     *            "ironStartDate": "2018-10-15",
     *            "ironEndDate": "2018-10-24",
     *            "packEstimatedWorkingDay": 2,
     *            "packStartDate": "2018-10-18",
     *            "packEndDate": "2018-10-19",
     *            "teamID": "BZ01",
     *            "name": "包装1组",
     *            "factory": 1,
     *            "category": "包装",
     *            "stationAmount": 1,
     *            "leader": null,
     *            "leaderPhoneNumber": null,
     *            "realQuantity": 301,
     *            "realProcess": 60.2,
     *            "curPlanProcess": 100,
     *            "curPlanAmount": 500
     *        }
     *    ]
     *}
     *]
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    getProcStatisticsByOrderID2APIRouter.get('/Statistics/getProcStatisticsByOrderID2', async (ctx) => {

        if(!ctx.query || !ctx.query.orderID || ctx.query.orderID == undefined
            || !ctx.query.factoryID || ctx.query.factoryID ==undefined){
            ctx.throw('api.invalidParameters:162', 400);
        }
        else{
            try {

                let orderID =ctx.query.orderID;
                let factoryID=ctx.query.factoryID;
                let maxRows =(ctx.query.maxRows)?ctx.query.maxRows:0;
                let statisticsList={};
                //获取裁剪组的信息
                let crop =await getCropPlanResult(orderID,factoryID);
                //获取粘衬组的信息
                let stick=await getFusibleInterliningResult(orderID,factoryID);
                //获得 车缝组的信息
                let sewing =await getSewingPlanResult(orderID,factoryID);
                //获得 锁定组的信息
                let lock=await getLockResult(orderID,factoryID);
                //获取 整烫组的信息
                let iron=await getIronResult(orderID,factoryID);
                //获取 包装组的信息
                let pack=await getPackResult(orderID,factoryID);

                /*
                statisticsList.push({"裁剪":crop});
                statisticsList.push({"粘衬":stick});
                statisticsList.push({"车缝":sewing[0]});
                statisticsList.push({"锁钉":lock});
                statisticsList.push({"整烫":iron});
                statisticsList.push({"包装":pack});
                */
                statisticsList.preceding=[{"crop":crop},{"stick":stick}];
                statisticsList.sewing= [{sewing}] ;//{"sewing":[{sewing}]};
                statisticsList.following=[{"lock":lock},{"iron":iron},{"pack":pack}];

                console.log(statisticsList);


                ctx.body = statisticsList;
                ctx.status = 200;
                ctx.respond = true;
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalorderIDQuery:98', 400);
            }
        }
    });
    function findRealQuantity(findId,list,field,returnField) {
        let sumReturnField=0;
        for(let i=0;i<list.length;i++){
            if(findId == list[i][field]){
                sumReturnField +=list[i][returnField];
            }
        }
        return sumReturnField;
    }

    //获得 裁剪组的信息
    async function getCropPlanResult(orderID,factory) {
        let queryCropTeamPlan="SELECT *,PrecedingTeamScheduling.id as pid FROM PrecedingTeamScheduling INNER JOIN Team ON PrecedingTeamScheduling.cropTeam=Team.id  WHERE PrecedingTeamScheduling.productionScheduling IN \n" +
            "(SELECT ProductionScheduling.id FROM ProductionScheduling INNER JOIN OrderDeliveryPlan ON ProductionScheduling.orderDeliveryPlan=OrderDeliveryPlan.id\n" +
            "WHERE ProductionScheduling.factory ="+factory+" AND ProductionScheduling.orderDeliveryPlan IN " +
            "(SELECT id FROM OrderDeliveryPlan WHERE OrderDeliveryPlan.order ="+orderID+") " +
            ")";
        let cropResult =await getPrecedingResult(queryCropTeamPlan);
        let PrecedingPlanList=[];
        for(let i=0;i<cropResult.length;i++){
            PrecedingPlanList.push(cropResult[i].pid);
        }
        let precedingTeamOutput =await getPrecedingTeamOutput({
            precedingTeamScheduling: {
                [Sequelize_1.Op.in]: PrecedingPlanList
            }
        });

        let cropArray=[];
        for(let i=0;i<cropResult.length;i++){
            console.log("---------->");
            console.log(cropResult[i].productionScheduling);
            console.log(precedingTeamOutput);

            cropResult[i].realQuantity=findRealQuantity(cropResult[i].pid,precedingTeamOutput,"precedingTeamScheduling","cropAmount");
            console.log(cropResult[i].realQuantity);
            /*
            if(cropResult[i].amount && cropResult[i].amount>0){
                cropResult[i].realProcess =cropResult[i].realQuantity*100/cropResult[i].amount;
            } else{
                cropResult[i].realProcess="incalculable";
            }
            if(cropResult[i].cropEstimatedWorkingDay && cropResult[i].cropEstimatedWorkingDay>0){
                let planProcess=dateDiff(cropResult[i].cropStartDate)*100/cropResult[i].cropEstimatedWorkingDay;
                planProcess =(planProcess>0)?100:planProcess;
                planProcess =(planProcess <0 )?0:planProcess;
                cropResult[i].curPlanProcess=planProcess;
                cropResult[i].curPlanAmount=Math.ceil(cropResult[i].curPlanProcess*cropResult[i].amount/100);
            }else {
                cropResult[i].curPlanProcess="incalculable";
                cropResult[i].curPlanAmount="incalculable";
            }
            */
            cropResult[i].startDate =cropResult[i].cropStartDate;
            cropResult[i].endDate =cropResult[i].cropEndDate;

            //检查 cropArray中是否存在该班组，如果有 则添加，如果无则新增

            if(cropArray.length<1){
                cropArray.push(cropResult[i]);
            } else{
                let teamIDIndex =isExitWithTeamId(cropArray,cropResult[i].teamID);
                if(teamIDIndex <0 ){
                    //Add new
                    cropArray.push(cropResult[i]);
                } else {
                    //update
                    //累计数量
                    cropArray[teamIDIndex].amount +=cropResult[i].amount;
                    //查找最小日期
                    cropArray[teamIDIndex].startDate =
                        isFirstBiger(cropArray[teamIDIndex].startDate,cropResult[i].cropStartDate)
                            ?cropResult[i].cropStartDate:cropArray[teamIDIndex].startDate;
                    //查找最大日期
                    cropArray[teamIDIndex].endDate =
                        isFirstBiger(cropArray[teamIDIndex].endDate,cropResult[i].cropEndDate)
                            ?cropArray[teamIDIndex].endDate:cropResult[i].cropEndDate;
                    cropArray[teamIDIndex].realQuantity +=cropResult[i].realQuantity;
                }

            }

        }
        for(let i=0;i<cropArray.length;i++){
            //计算计划进度
            let totalDays =dateDiff(cropArray[i].startDate,cropArray[i].endDate)+1;
            let planProcess=0;
            if(totalDays ==0){
                cropArray[i].curPlanProcess ="incalculable";
            }else
            {
                planProcess=dateDiff(cropArray[i].startDate)*100/totalDays;
                planProcess =(planProcess>100)?100:planProcess;
                planProcess =(planProcess <0 )?0:planProcess;
                cropArray[i].curPlanProcess =planProcess;
            }
            cropArray[i].curPlanAmount=Math.ceil(cropArray[i].curPlanProcess*cropArray[i].amount/100);
            //计算实际进度
            cropArray[i].realProcess =cropArray[i].realQuantity*100/cropArray[i].amount;
        }


        return cropArray;
    }
    function isExitWithTeamId(tempArray,teamId) {
        for(let i=0;i<tempArray.length;i++){
            if(teamId == tempArray[i].teamID){
                return i;
            }
        }
        return -1;
    }
    async function getPrecedingResult(queryString) {
        let precedingTeamSchedulingResult =await PrecedingTeamScheduling_1.PrecedingTeamScheduling.sequelize.query(queryString);
        return precedingTeamSchedulingResult[0];
    }
    async function getPrecedingTeamOutput(queryWhere) {
        let precedingTeamOutput=await PrecedingTeamOutput_1.PrecedingTeamOutput.findAll({
            where:queryWhere,
            raw:true
        });
        return precedingTeamOutput;
    }
    //获取 粘衬组的信息
    async function getFusibleInterliningResult(orderID,factory) {
        let queryFusibleInterLiningPlan="SELECT *,PrecedingTeamScheduling.id as pid FROM PrecedingTeamScheduling INNER JOIN Team ON PrecedingTeamScheduling.stickTeam=Team.id  WHERE PrecedingTeamScheduling.productionScheduling IN \n" +
            "(SELECT ProductionScheduling.id FROM ProductionScheduling INNER JOIN OrderDeliveryPlan ON ProductionScheduling.orderDeliveryPlan=OrderDeliveryPlan.id\n" +
            "WHERE ProductionScheduling.factory ="+factory+" AND ProductionScheduling.orderDeliveryPlan IN " +
            "(SELECT id FROM OrderDeliveryPlan WHERE OrderDeliveryPlan.order ="+orderID+") " +
            ")";
        let fusibleResult =await getPrecedingResult(queryFusibleInterLiningPlan);
        let PrecedingPlanList=[];
        for(let i=0;i<fusibleResult.length;i++){
            PrecedingPlanList.push(fusibleResult[i].pid);
        }
        let precedingTeamOutput =await getPrecedingTeamOutput({
            precedingTeamScheduling: {
                [Sequelize_1.Op.in]: PrecedingPlanList
            }
        });
        let fusibleArray=[];
        for(let i=0;i<fusibleResult.length;i++){
            fusibleResult[i].realQuantity=findRealQuantity(fusibleResult[i].pid,precedingTeamOutput,"precedingTeamScheduling","stickAmount");
            /*
            if(fusibleResult[i].amount && fusibleResult[i].amount >0){
                fusibleResult[i].realProcess=fusibleResult[i].realQuantity*100/fusibleResult[i].amount;
            }else
            {
                fusibleResult[i].realProcess="incalculable";
            }
            if(fusibleResult[i].stickEstimatedWorkingDay && fusibleResult[i].stickEstimatedWorkingDay>0){
                let planProcess=dateDiff(fusibleResult[i].stickStartDate)*100/fusibleResult[i].stickEstimatedWorkingDay;
                planProcess =(planProcess>0)?100:planProcess;
                planProcess =(planProcess <0 )?0:planProcess;
                fusibleResult[i].curPlanProcess=planProcess;
                fusibleResult[i].curPlanAmount=Math.ceil(fusibleResult[i].curPlanProcess*fusibleResult[i].amount/100);
            }else {
                fusibleResult[i].curPlanProcess="incalculable";
                fusibleResult[i].curPlanAmount="incalculable";
            }
            */
            fusibleResult[i].startDate=fusibleResult[i].stickStartDate;
            fusibleResult[i].endDate=fusibleResult[i].stickEndDate;

            //检查 cropArray中是否存在该班组，如果有 则添加，如果无则新增

            if(fusibleArray.length<1){
                fusibleArray.push(fusibleResult[i]);
            } else{
                let teamIDIndex =isExitWithTeamId(fusibleArray,fusibleResult[i].teamID);
                if(teamIDIndex <0 ){
                    //Add new
                    fusibleArray.push(fusibleResult[i]);
                } else {
                    //update
                    //累计数量
                    fusibleArray[teamIDIndex].amount +=fusibleResult[i].amount;
                    //查找最小日期
                    fusibleArray[teamIDIndex].startDate =
                        isFirstBiger(fusibleArray[teamIDIndex].startDate,fusibleResult[i].stickStartDate)
                            ?fusibleResult[i].stickStartDate:fusibleArray[teamIDIndex].startDate;
                    //查找最大日期
                    fusibleArray[teamIDIndex].endDate =
                        isFirstBiger(fusibleArray[teamIDIndex].endDate,fusibleResult[i].stickEndDate)
                            ?fusibleArray[teamIDIndex].endDate:fusibleResult[i].stickEndDate;
                    fusibleArray[teamIDIndex].realQuantity +=fusibleResult[i].realQuantity;
                }

            }
        }
        for(let i=0;i<fusibleArray.length;i++){
            //计算计划进度
            let totalDays =dateDiff(fusibleArray[i].startDate,fusibleArray[i].endDate)+1;
            let planProcess=0;
            if(totalDays ==0){
                fusibleArray[i].curPlanProcess ="incalculable";
            }else
            {
                planProcess=dateDiff(fusibleArray[i].startDate)*100/totalDays;
                planProcess =(planProcess>100)?100:planProcess;
                planProcess =(planProcess <0 )?0:planProcess;
                fusibleArray[i].curPlanProcess =planProcess;
            }
            fusibleArray[i].curPlanAmount=Math.ceil(fusibleArray[i].curPlanProcess*fusibleArray[i].amount/100);
            //计算实际进度
            fusibleArray[i].realProcess =fusibleArray[i].realQuantity*100/fusibleArray[i].amount;
        }
        return fusibleArray;
    }
    //获得 车缝组的信息
    async function getSewingPlanResult(orderID,factory) {
        let querySewingTeamPlan="SELECT *,SewingTeamScheduling.id as sid FROM SewingTeamScheduling INNER JOIN Team ON SewingTeamScheduling.team=Team.id  WHERE SewingTeamScheduling.productionScheduling IN \n" +
            "(SELECT ProductionScheduling.id FROM ProductionScheduling INNER JOIN OrderDeliveryPlan ON ProductionScheduling.orderDeliveryPlan=OrderDeliveryPlan.id\n" +
            "WHERE ProductionScheduling.factory ="+factory+" AND ProductionScheduling.orderDeliveryPlan IN " +
            "(SELECT id FROM OrderDeliveryPlan WHERE OrderDeliveryPlan.order ="+orderID+") " +
            ")";
        //let sewing=[];
        let sewingTeamPlan =(await SewingTeamScheduling_1.SewingTeamScheduling.sequelize.query(querySewingTeamPlan))[0];
        let sewingTeamSchedulingList=[];
        for(let i=0;i<sewingTeamPlan.length;i++){
            sewingTeamSchedulingList.push(sewingTeamPlan[i].sid);
        }
        let sewingTeamOutputResult=await SewingTeamOutput_1.SewingTeamOutput.findAll({
            where: {
                sewingTeamScheduling: {
                    [Sequelize_1.Op.in]: sewingTeamSchedulingList
                }
            },
            raw: true
        });
        //console.log("sewingTeamPlan.length ==> "+sewingTeamPlan.length);
        let sewingArray=[];
        for(let i=0;i<sewingTeamPlan.length;i++){
            sewingTeamPlan[i].realQuantity=findRealQuantity(sewingTeamPlan[i].sid,sewingTeamOutputResult,"sewingTeamScheduling","amount");
             if(sewingArray.length<1){
                sewingArray.push(sewingTeamPlan[i]);
            } else{
                let teamIDIndex =isExitWithTeamId(sewingArray,sewingTeamPlan[i].teamID);
                if(teamIDIndex <0 ){
                    //Add new
                    sewingArray.push(sewingTeamPlan[i]);
                } else {
                    //update
                    //累计数量
                    sewingArray[teamIDIndex].amount +=sewingTeamPlan[i].amount;
                    //查找最小日期
                    sewingArray[teamIDIndex].startDate =
                        isFirstBiger(sewingArray[teamIDIndex].startDate,sewingTeamPlan[i].startDate)
                            ?sewingTeamPlan[i].startDate:sewingArray[teamIDIndex].startDate;
                    //查找最大日期
                    sewingArray[teamIDIndex].endDate =
                        isFirstBiger(sewingArray[teamIDIndex].endDate,sewingTeamPlan[i].endDate)
                            ?sewingArray[teamIDIndex].endDate:sewingTeamPlan[i].endDate;
                    sewingArray[teamIDIndex].realQuantity +=sewingTeamPlan[i].realQuantity;
                }

            }
        }
        for(let i=0;i<sewingArray.length;i++){
            //计算计划进度
            let totalDays =dateDiff(sewingArray[i].startDate,sewingArray[i].endDate)+1;
            let planProcess=0;
            if(totalDays ==0){
                sewingArray[i].curPlanProcess ="incalculable";
            }else
            {
                planProcess=dateDiff(sewingArray[i].startDate)*100/totalDays;
                planProcess =(planProcess>100)?100:planProcess;
                planProcess =(planProcess <0 )?0:planProcess;
                sewingArray[i].curPlanProcess =planProcess;
            }
            sewingArray[i].curPlanAmount=Math.ceil(sewingArray[i].curPlanProcess*sewingArray[i].amount/100);
            //计算实际进度

            let completeAmount = await commonAPI_1.getAmountSumFromQualityInspectionForSwing(orderID,factory);

            let currentProgress = completeAmount*100/(sewingArray[i].amount || 1);
            sewingArray[i].realProcess =currentProgress;


            //sewingArray[i].realProcess =sewingArray[i].realQuantity*100/sewingArray[i].amount;
        }

        //sewing.push(sewingTeamPlan);
        return sewingArray;
    }
    //获取 锁钉组的信息
    async function getLockResult(orderID,factory) {
        let queryLockTeamPlan="SELECT *,FollowingTeamScheduling.id as fid FROM FollowingTeamScheduling INNER JOIN Team ON FollowingTeamScheduling.lockTeam=Team.id  WHERE FollowingTeamScheduling.productionScheduling IN " +
            "(SELECT ProductionScheduling.id FROM ProductionScheduling INNER JOIN OrderDeliveryPlan ON ProductionScheduling.orderDeliveryPlan=OrderDeliveryPlan.id " +
            "WHERE ProductionScheduling.factory ="+factory+" AND ProductionScheduling.orderDeliveryPlan IN " +
            "(SELECT id FROM OrderDeliveryPlan WHERE OrderDeliveryPlan.order ="+orderID+") " +
            ")";
        let lockResult =await getFollowingTeamSchedulingResult(queryLockTeamPlan);
        let lockPlanList=[];

        for(let i=0;i<lockResult.length;i++){
            lockPlanList.push(lockResult[i].fid);
        }

        let lockTeamOutput =await getFollowingTeamOutput({
            followingTeamScheduling: {
                [Sequelize_1.Op.in]: lockPlanList
            }
        });
        let lockArray=[];
        for(let i=0;i<lockResult.length;i++){
            lockResult[i].realQuantity=findRealQuantity(lockResult[i].fid,lockTeamOutput,"followingTeamScheduling","lockAmount");
            /*
            if(lockResult[i].amount && lockResult[i].amount>0){
                lockResult[i].realProcess = lockResult[i].realQuantity*100/lockResult[i].amount;
            } else {
                lockResult[i].realProcess="incalculable";
            }
            if(lockResult[i].lockEstimatedWorkingDay && lockResult[i].lockEstimatedWorkingDay>0){
                let planProcess=dateDiff(lockResult[i].lockStartDate)*100/lockResult[i].lockEstimatedWorkingDay;
                planProcess =(planProcess>0)?100:planProcess;
                planProcess =(planProcess <0 )?0:planProcess;
                lockResult[i].curPlanProcess=planProcess;
                lockResult[i].curPlanAmount=Math.ceil(lockResult[i].curPlanProcess*lockResult[i].amount/100);
            }else {
                lockResult[i].curPlanProcess="incalculable";
                lockResult[i].curPlanAmount="incalculable";
            }
            */
            lockResult[i].startDate =lockResult[i].lockStartDate;
            lockResult[i].endDate =lockResult[i].lockEndDate;

            if(lockArray.length<1){
                lockArray.push(lockResult[i]);
            } else{
                let teamIDIndex =isExitWithTeamId(lockArray,lockResult[i].teamID);
                if(teamIDIndex <0 ){
                    //Add new
                    lockArray.push(lockResult[i]);
                } else {
                    //update
                    //累计数量
                    lockArray[teamIDIndex].amount +=lockResult[i].amount;
                    //查找最小日期
                    lockArray[teamIDIndex].startDate =
                        isFirstBiger(lockArray[teamIDIndex].startDate,lockResult[i].lockStartDate)
                            ?lockResult[i].lockStartDate:lockArray[teamIDIndex].startDate;
                    //查找最大日期
                    lockArray[teamIDIndex].endDate =
                        isFirstBiger(lockArray[teamIDIndex].endDate,lockResult[i].lockEndDate)
                            ?lockArray[teamIDIndex].endDate:lockResult[i].lockEndDate;
                    lockArray[teamIDIndex].realQuantity +=lockResult[i].realQuantity;
                }

            }
        }
        for(let i=0;i<lockArray.length;i++){
            //计算计划进度
            let totalDays =dateDiff(lockArray[i].startDate,lockArray[i].endDate)+1;
            let planProcess=0;
            if(totalDays ==0){
                lockArray[i].curPlanProcess ="incalculable";
            }else
            {
                planProcess=dateDiff(lockArray[i].startDate)*100/totalDays;
                planProcess =(planProcess>100)?100:planProcess;
                planProcess =(planProcess <0 )?0:planProcess;
                lockArray[i].curPlanProcess =planProcess;
            }
            lockArray[i].curPlanAmount=Math.ceil(lockArray[i].curPlanProcess*lockArray[i].amount/100);
            //计算实际进度
            lockArray[i].realProcess =lockArray[i].realQuantity*100/lockArray[i].amount;
        }

        return lockArray;
    }
    async function getFollowingTeamSchedulingResult(queryString) {
        let followingTeamSchedulingResult =await FollowingTeamScheduling_1.FollowingTeamScheduling.sequelize.query(queryString);
        return followingTeamSchedulingResult[0];
    }
    async function getFollowingTeamOutput(queryWhere) {
        let followingTeamOutput=await FollowingTeamOutput_1.FollowingTeamOutput.findAll({
            where:queryWhere,
            raw:true
        });
        return followingTeamOutput;
    }
    //获取 整烫组的信息
    async function getIronResult(orderID,factory) {
        let queryIronTeamPlan="SELECT *,FollowingTeamScheduling.id as fid FROM FollowingTeamScheduling INNER JOIN Team ON FollowingTeamScheduling.ironTeam=Team.id  WHERE FollowingTeamScheduling.productionScheduling IN \n" +
            "(SELECT ProductionScheduling.id FROM ProductionScheduling INNER JOIN OrderDeliveryPlan ON ProductionScheduling.orderDeliveryPlan=OrderDeliveryPlan.id\n" +
            "WHERE ProductionScheduling.factory ="+factory+" AND ProductionScheduling.orderDeliveryPlan IN " +
            "(SELECT id FROM OrderDeliveryPlan WHERE OrderDeliveryPlan.order ="+orderID+") " +
            ")";
        let ironResult =await getFollowingTeamSchedulingResult(queryIronTeamPlan);

        let ironPlanList=[];

        for(let i=0;i<ironResult.length;i++){
            ironPlanList.push(ironResult[i].fid);
        }

        let ironTeamOutput =await getFollowingTeamOutput({
            followingTeamScheduling: {
                [Sequelize_1.Op.in]: ironPlanList
            }
        });
        let ironArray=[];
        for(let i=0;i<ironResult.length;i++){
            ironResult[i].realQuantity=findRealQuantity(ironResult[i].fid,ironTeamOutput,"followingTeamScheduling","ironAmount");
            /*
            if(ironResult[i].amount && ironResult[i].amount>0){
                ironResult[i].realProcess =ironResult[i].realQuantity *100/ironResult[i].amount;
            } else {
                ironResult[i].realProcess="incalculable";
            }
            if(ironResult[i].ironEstimatedWorkingDay && ironResult[i].ironEstimatedWorkingDay>0){
                let planProcess=dateDiff(ironResult[i].ironStartDate)*100/ironResult[i].ironEstimatedWorkingDay;
                planProcess =(planProcess>0)?100:planProcess;
                planProcess =(planProcess <0 )?0:planProcess;
                ironResult[i].curPlanProcess=planProcess;
                ironResult[i].curPlanAmount=Math.ceil(ironResult[i].curPlanProcess*ironResult[i].amount/100);
            }else {
                ironResult[i].curPlanProcess="incalculable";
                ironResult[i].curPlanAmount="incalculable";
            }
            */
            ironResult[i].startDate = ironResult[i].ironStartDate;
            ironResult[i].endDate = ironResult[i].ironEndDate;

            if(ironArray.length<1){
                ironArray.push(ironResult[i]);
            } else{
                let teamIDIndex =isExitWithTeamId(ironArray,ironResult[i].teamID);
                if(teamIDIndex <0 ){
                    //Add new
                    ironArray.push(ironResult[i]);
                } else {
                    //update
                    //累计数量
                    ironArray[teamIDIndex].amount +=ironResult[i].amount;
                    //查找最小日期
                    ironArray[teamIDIndex].startDate =
                        isFirstBiger(ironArray[teamIDIndex].startDate,ironResult[i].ironStartDate)
                            ?ironResult[i].ironStartDate:ironArray[teamIDIndex].startDate;
                    //查找最大日期
                    ironArray[teamIDIndex].endDate =
                        isFirstBiger(ironArray[teamIDIndex].endDate,ironResult[i].ironEndDate)
                            ?ironArray[teamIDIndex].endDate:ironResult[i].ironEndDate;
                    ironArray[teamIDIndex].realQuantity +=ironResult[i].realQuantity;
                }

            }
        }
        for(let i=0;i<ironArray.length;i++){
            //计算计划进度
            let totalDays =dateDiff(ironArray[i].startDate,ironArray[i].endDate)+1;
            let planProcess=0;
            if(totalDays ==0){
                ironArray[i].curPlanProcess ="incalculable";
            }else
            {
                planProcess=dateDiff(ironArray[i].startDate)*100/totalDays;
                planProcess =(planProcess>100)?100:planProcess;
                planProcess =(planProcess <0 )?0:planProcess;
                ironArray[i].curPlanProcess =planProcess;
            }
            ironArray[i].curPlanAmount=Math.ceil(ironArray[i].curPlanProcess*ironArray[i].amount/100);
            //计算实际进度
            ironArray[i].realProcess =ironArray[i].realQuantity*100/ironArray[i].amount;
        }
        return ironArray;
    }
    //获取 包装组的信息
    async function getPackResult(orderID,factory) {
        let queryPackTeamPlan="SELECT *,FollowingTeamScheduling.id as fid FROM FollowingTeamScheduling INNER JOIN Team ON FollowingTeamScheduling.packTeam=Team.id  WHERE FollowingTeamScheduling.productionScheduling IN \n" +
            "(SELECT ProductionScheduling.id FROM ProductionScheduling INNER JOIN OrderDeliveryPlan ON ProductionScheduling.orderDeliveryPlan=OrderDeliveryPlan.id\n" +
            "WHERE ProductionScheduling.factory ="+factory+" AND ProductionScheduling.orderDeliveryPlan IN " +
            "(SELECT id FROM OrderDeliveryPlan WHERE OrderDeliveryPlan.order ="+orderID+") " +
            ")";
        let packResult =await getFollowingTeamSchedulingResult(queryPackTeamPlan);

        let packPlanList=[];

        for(let i=0;i<packResult.length;i++){
            packPlanList.push(packResult[i].fid);
        }

        let packTeamOutput =await getFollowingTeamOutput({
            followingTeamScheduling: {
                [Sequelize_1.Op.in]: packPlanList
            }
        });
        let packArray=[];
        for(let i=0;i<packResult.length;i++){
            packResult[i].realQuantity=findRealQuantity(packResult[i].fid,packTeamOutput,"followingTeamScheduling","packAmount");
            /*
            if(packResult[i].amount && packResult[i].amount >0){
                packResult[i].realProcess = packResult[i].realQuantity *100/packResult[i].amount;
            } else {
                packResult[i].realProcess="incalculable";
            }
            if(packResult[i].packEstimatedWorkingDay && packResult[i].packEstimatedWorkingDay>0){
                let planProcess=dateDiff(packResult[i].packStartDate)*100/packResult[i].packEstimatedWorkingDay;
                planProcess =(planProcess>100)?100:planProcess;
                planProcess =(planProcess <0 )?0:planProcess;
                packResult[i].curPlanProcess=planProcess;
                packResult[i].curPlanAmount=Math.ceil(packResult[i].curPlanProcess*packResult[i].amount/100);
            }else {
                packResult[i].curPlanProcess="incalculable";
                packResult[i].curPlanAmount="incalculable";
            }
            */
            packResult[i].startDate =packResult[i].packStartDate;
            packResult[i].endDate =packResult[i].packEndDate;

            if(packArray.length<1){
                packArray.push(packResult[i]);
            } else{
                let teamIDIndex =isExitWithTeamId(packArray,packResult[i].teamID);
                if(teamIDIndex <0 ){
                    //Add new
                    packArray.push(packResult[i]);
                } else {
                    //update
                    //累计数量
                    packArray[teamIDIndex].amount +=packResult[i].amount;
                    //查找最小日期
                    packArray[teamIDIndex].startDate =
                        isFirstBiger(packArray[teamIDIndex].startDate,packResult[i].packStartDate)
                            ?packResult[i].packStartDate:packArray[teamIDIndex].startDate;
                    //查找最大日期
                    packArray[teamIDIndex].endDate =
                        isFirstBiger(packArray[teamIDIndex].endDate,packResult[i].packEndDate)
                            ?packArray[teamIDIndex].endDate:packResult[i].packEndDate;
                    packArray[teamIDIndex].realQuantity +=packResult[i].realQuantity;
                }

            }

        }
        for(let i=0;i<packArray.length;i++){
            //计算计划进度
            let totalDays =dateDiff(packArray[i].startDate,packArray[i].endDate)+1;
            let planProcess=0;
            if(totalDays ==0){
                packArray[i].curPlanProcess ="incalculable";
            }else
            {
                planProcess=dateDiff(packArray[i].startDate)*100/totalDays;
                planProcess =(planProcess>100)?100:planProcess;
                planProcess =(planProcess <0 )?0:planProcess;
                packArray[i].curPlanProcess =planProcess;
            }
            packArray[i].curPlanAmount=Math.ceil(packArray[i].curPlanProcess*packArray[i].amount/100);
            //计算实际进度
            packArray[i].realProcess =packArray[i].realQuantity*100/packArray[i].amount;
        }
        return packArray;
    }

    //获取 日期差异
    function dateDiff(beginDate,endDate=null) {
        let sArr =beginDate.split("-");
        let sDate =new Date(sArr[0],(sArr[1]-1),sArr[2]);
        let eDate=null;
        if(endDate ==null){
            eDate =new Date();
        }else {
            let eArr =endDate.split("-");
            eDate =new Date(eArr[0],(eArr[1]-1),eArr[2]);
        }

        let days=Math.ceil((eDate-sDate)/(24*60*60*1000));
        return days;
    }
    function isFirstBiger(firstDate,secondDate) {
        let fArr =firstDate.split("-");
        let fDate =new Date(fArr[0],(fArr[1]),fArr[2]);
        let sArr =secondDate.split("-");
        let sDate =new Date(sArr[0],(sArr[1]),sArr[2]);
        return (fDate >sDate)?true:false;
    }
}
