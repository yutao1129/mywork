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

exports.registerGetProcStatisticsByOrderIDAPI = function (getProcStatisticsByOrderIDAPIRouter) {
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
    getProcStatisticsByOrderIDAPIRouter.get('/Statistics/getProcStatisticsByOrderID', async (ctx) => {

        if(!ctx.query || !ctx.query.orderID || ctx.query.orderID == undefined
            || !ctx.query.factoryID || ctx.query.factoryID ==undefined){
            ctx.throw('api.invalidParameters:162', 400);
        }
        else{
            try {

                let orderID =ctx.query.orderID;
                let factoryID=ctx.query.factoryID;
                let maxRows =(ctx.query.maxRows)?ctx.query.maxRows:0;
                let statisticsList=[];
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

                statisticsList.push({"裁剪":crop});
                statisticsList.push({"粘衬":stick});
                statisticsList.push({"车缝":sewing[0]});
                statisticsList.push({"锁钉":lock});
                statisticsList.push({"整烫":iron});
                statisticsList.push({"包装":pack});


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
        let queryCropTeamPlan="SELECT * FROM PrecedingTeamScheduling INNER JOIN Team ON PrecedingTeamScheduling.cropTeam=Team.id  WHERE PrecedingTeamScheduling.productionScheduling IN \n" +
            "(SELECT ProductionScheduling.id FROM ProductionScheduling INNER JOIN OrderDeliveryPlan ON ProductionScheduling.orderDeliveryPlan=OrderDeliveryPlan.id\n" +
            "WHERE ProductionScheduling.factory ="+factory+" AND ProductionScheduling.orderDeliveryPlan IN " +
            "(SELECT id FROM OrderDeliveryPlan WHERE OrderDeliveryPlan.order ="+orderID+") " +
            ")";
        let cropResult =await getPrecedingResult(queryCropTeamPlan);
        let PrecedingPlanList=[];
        for(let i=0;i<cropResult.length;i++){
            PrecedingPlanList.push(cropResult[i].productionScheduling);
        }
        let precedingTeamOutput =await getPrecedingTeamOutput({
            precedingTeamScheduling: {
                [Sequelize_1.Op.in]: PrecedingPlanList
            }
        });
        for(let i=0;i<cropResult.length;i++){
            cropResult[i].realQuantity=findRealQuantity(cropResult[i].productionScheduling,precedingTeamOutput,"precedingTeamScheduling","cropAmount");
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
            cropResult[i].startDate =cropResult[i].cropStartDate;
            cropResult[i].endDate =cropResult[i].cropEndDate;

        }
        return cropResult;
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
        let queryFusibleInterLiningPlan="SELECT * FROM PrecedingTeamScheduling INNER JOIN Team ON PrecedingTeamScheduling.stickTeam=Team.id  WHERE PrecedingTeamScheduling.productionScheduling IN \n" +
            "(SELECT ProductionScheduling.id FROM ProductionScheduling INNER JOIN OrderDeliveryPlan ON ProductionScheduling.orderDeliveryPlan=OrderDeliveryPlan.id\n" +
            "WHERE ProductionScheduling.factory ="+factory+" AND ProductionScheduling.orderDeliveryPlan IN " +
            "(SELECT id FROM OrderDeliveryPlan WHERE OrderDeliveryPlan.order ="+orderID+") " +
            ")";
        let fusibleResult =await getPrecedingResult(queryFusibleInterLiningPlan);
        let PrecedingPlanList=[];
        for(let i=0;i<fusibleResult.length;i++){
            PrecedingPlanList.push(fusibleResult[i].productionScheduling);
        }
        let precedingTeamOutput =await getPrecedingTeamOutput({
            precedingTeamScheduling: {
                [Sequelize_1.Op.in]: PrecedingPlanList
            }
        });
        for(let i=0;i<fusibleResult.length;i++){
            fusibleResult[i].realQuantity=findRealQuantity(fusibleResult[i].productionScheduling,precedingTeamOutput,"precedingTeamScheduling","stickAmount");
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
            fusibleResult[i].startDate=fusibleResult[i].stickStartDate;
            fusibleResult[i].endDate=fusibleResult[i].stickEndDate;

        }
        return fusibleResult;
    }
    //获得 车缝组的信息
    async function getSewingPlanResult(orderID,factory) {
        let querySewingTeamPlan="SELECT * FROM SewingTeamScheduling INNER JOIN Team ON SewingTeamScheduling.team=Team.id  WHERE SewingTeamScheduling.productionScheduling IN \n" +
            "(SELECT ProductionScheduling.id FROM ProductionScheduling INNER JOIN OrderDeliveryPlan ON ProductionScheduling.orderDeliveryPlan=OrderDeliveryPlan.id\n" +
            "WHERE ProductionScheduling.factory ="+factory+" AND ProductionScheduling.orderDeliveryPlan IN " +
            "(SELECT id FROM OrderDeliveryPlan WHERE OrderDeliveryPlan.order ="+orderID+") " +
            ")";
        let sewing=[];
        let sewingTeamPlan =(await SewingTeamScheduling_1.SewingTeamScheduling.sequelize.query(querySewingTeamPlan))[0];
        let sewingTeamSchedulingList=[];
        for(let i=0;i<sewingTeamPlan.length;i++){
            sewingTeamSchedulingList.push(sewingTeamPlan[i].productionScheduling);
        }
        let sewingTeamOutputResult=await SewingTeamOutput_1.SewingTeamOutput.findAll({
            where: {
                sewingTeamScheduling: {
                    [Sequelize_1.Op.in]: sewingTeamSchedulingList
                }
            },
            raw: true
        });
        console.log("sewingTeamPlan.length ==> "+sewingTeamPlan.length);
        for(let i=0;i<sewingTeamPlan.length;i++){
            sewingTeamPlan[i].realQuantity=findRealQuantity(sewingTeamPlan[i].productionScheduling,sewingTeamOutputResult,"sewingTeamScheduling","amount");
            if(sewingTeamPlan[i].amount && sewingTeamPlan[i].amount>0){
                sewingTeamPlan[i].realProcess =sewingTeamPlan[i].realQuantity*100/sewingTeamPlan[i].amount;
            }else {
                sewingTeamPlan[i].realProcess="incalculable";
            }

            if(sewingTeamPlan[i].estimatedWorkingDay && sewingTeamPlan[i].estimatedWorkingDay>0){
                let planProcess=dateDiff(sewingTeamPlan[i].startDate)*100/sewingTeamPlan[i].estimatedWorkingDay;
                planProcess =(planProcess>0)?100:planProcess;
                planProcess =(planProcess <0 )?0:planProcess;
                sewingTeamPlan[i].curPlanProcess=planProcess;
                sewingTeamPlan[i].curPlanAmount=Math.ceil(sewingTeamPlan[i].curPlanProcess*sewingTeamPlan[i].amount/100);
            }else {
                sewingTeamPlan[i].curPlanProcess="incalculable";
                sewingTeamPlan[i].curPlanAmount="incalculable";
            }
        }
        sewing.push(sewingTeamPlan);
        return sewing;
    }
    //获取 锁钉组的信息
    async function getLockResult(orderID,factory) {
        let queryLockTeamPlan="SELECT * FROM FollowingTeamScheduling INNER JOIN Team ON FollowingTeamScheduling.lockTeam=Team.id  WHERE FollowingTeamScheduling.productionScheduling IN " +
            "(SELECT ProductionScheduling.id FROM ProductionScheduling INNER JOIN OrderDeliveryPlan ON ProductionScheduling.orderDeliveryPlan=OrderDeliveryPlan.id " +
            "WHERE ProductionScheduling.factory ="+factory+" AND ProductionScheduling.orderDeliveryPlan IN " +
            "(SELECT id FROM OrderDeliveryPlan WHERE OrderDeliveryPlan.order ="+orderID+") " +
            ")";
        let lockResult =await getFollowingTeamSchedulingResult(queryLockTeamPlan);
        let lockPlanList=[];

        for(let i=0;i<lockResult.length;i++){
            lockPlanList.push(lockResult[i].productionScheduling);
        }

        let lockTeamOutput =await getFollowingTeamOutput({
            followingTeamScheduling: {
                [Sequelize_1.Op.in]: lockPlanList
            }
        });
        for(let i=0;i<lockResult.length;i++){
            lockResult[i].realQuantity=findRealQuantity(lockResult[i].productionScheduling,lockTeamOutput,"followingTeamScheduling","lockAmount");
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
            lockResult[i].startDate =lockResult[i].lockStartDate;
            lockResult[i].endDate =lockResult[i].lockEndDate;
        }
        return lockResult;
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
        let queryIronTeamPlan="SELECT * FROM FollowingTeamScheduling INNER JOIN Team ON FollowingTeamScheduling.ironTeam=Team.id  WHERE FollowingTeamScheduling.productionScheduling IN \n" +
            "(SELECT ProductionScheduling.id FROM ProductionScheduling INNER JOIN OrderDeliveryPlan ON ProductionScheduling.orderDeliveryPlan=OrderDeliveryPlan.id\n" +
            "WHERE ProductionScheduling.factory ="+factory+" AND ProductionScheduling.orderDeliveryPlan IN " +
            "(SELECT id FROM OrderDeliveryPlan WHERE OrderDeliveryPlan.order ="+orderID+") " +
            ")";
        let ironResult =await getFollowingTeamSchedulingResult(queryIronTeamPlan);

        let ironPlanList=[];

        for(let i=0;i<ironResult.length;i++){
            ironPlanList.push(ironResult[i].productionScheduling);
        }

        let ironTeamOutput =await getFollowingTeamOutput({
            followingTeamScheduling: {
                [Sequelize_1.Op.in]: ironPlanList
            }
        });
        for(let i=0;i<ironResult.length;i++){
            ironResult[i].realQuantity=findRealQuantity(ironResult[i].productionScheduling,ironTeamOutput,"followingTeamScheduling","ironAmount");
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
            ironResult[i].startDate = ironResult[i].ironStartDate;
            ironResult[i].endDate = ironResult[i].ironEndDate;
        }
        return ironResult;
    }
    //获取 包装组的信息
    async function getPackResult(orderID,factory) {
        let queryPackTeamPlan="SELECT * FROM FollowingTeamScheduling INNER JOIN Team ON FollowingTeamScheduling.packTeam=Team.id  WHERE FollowingTeamScheduling.productionScheduling IN \n" +
            "(SELECT ProductionScheduling.id FROM ProductionScheduling INNER JOIN OrderDeliveryPlan ON ProductionScheduling.orderDeliveryPlan=OrderDeliveryPlan.id\n" +
            "WHERE ProductionScheduling.factory ="+factory+" AND ProductionScheduling.orderDeliveryPlan IN " +
            "(SELECT id FROM OrderDeliveryPlan WHERE OrderDeliveryPlan.order ="+orderID+") " +
            ")";
        let packResult =await getFollowingTeamSchedulingResult(queryPackTeamPlan);

        let packPlanList=[];

        for(let i=0;i<packResult.length;i++){
            packPlanList.push(packResult[i].productionScheduling);
        }

        let packTeamOutput =await getFollowingTeamOutput({
            followingTeamScheduling: {
                [Sequelize_1.Op.in]: packPlanList
            }
        });
        for(let i=0;i<packResult.length;i++){
            packResult[i].realQuantity=findRealQuantity(packResult[i].productionScheduling,packTeamOutput,"followingTeamScheduling","packAmount");
            if(packResult[i].amount && packResult[i].amount >0){
                packResult[i].realProcess = packResult[i].realQuantity *100/packResult[i].amount;
            } else {
                packResult[i].realProcess="incalculable";
            }
            if(packResult[i].packEstimatedWorkingDay && packResult[i].packEstimatedWorkingDay>0){
                let planProcess=dateDiff(packResult[i].packStartDate)*100/packResult[i].packEstimatedWorkingDay;
                planProcess =(planProcess>0)?100:planProcess;
                planProcess =(planProcess <0 )?0:planProcess;
                packResult[i].curPlanProcess=planProcess;
                packResult[i].curPlanAmount=Math.ceil(packResult[i].curPlanProcess*packResult[i].amount/100);
            }else {
                packResult[i].curPlanProcess="incalculable";
                packResult[i].curPlanAmount="incalculable";
            }
            packResult[i].startDate =packResult[i].packStartDate;
            packResult[i].endDate =packResult[i].packEndDate;

        }
        return packResult;
    }

    //获取 日期差异
    function dateDiff(beginDate) {
        let sArr =beginDate.split("-");
        let sDate =new Date(sArr[0],(sArr[1]-1),sArr[2]);
        let eDate =new Date();
        let days=Math.ceil((eDate-sDate)/(24*60*60*1000));
        return days;
    }
}
