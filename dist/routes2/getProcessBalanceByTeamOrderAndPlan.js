// Author LiuYutao     20181020

// 参数 1 teamID 班组ID， OrderID
// step 1 根据Order 获取 所有交期ID 然后获取所欲排产ID productionSchedulingID
// step 2 根据 班组ID 获取 班组成员ID
// step 3 根据成员ID 获取工位id
// step 4 根据工位id 获取 工序 id
// step 5 整理 求和 每个工序 所对应的员工的产出，
// step 6 根据SewingTeamScheduling 中的班组以及productionScheduling 和>=startDate,<=endDate 以及当前日期
//        过滤出当前日期下仍在排产的信息
// step 7 当天的计划，为SewingTeamScheduling.amount/SewingTeamScheduling.estimatedWorkingDay ,然后求和
// step 8 累计的计划，首先计算计划开始天数timeSpan=(now - SewingTeamScheduling.startDate),
//        (timeSpan*SewingTeamScheduling.amount/SewingTeamScheduling.estimatedWorkingDay),然后求和

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Sequelize_1 = require("sequelize")
const TeamMember_1 = require("../database/models/TeamMember");
const Station_1 = require("../database/models/Station");
const ProcessStation_1 =require("../database/models/ProcessStation");
const MemberOutput_1 = require("../database/models/MemberOutput");
const OrderDeliveryPlan_1 = require("../database/models/OrderDeliveryPlan");
const ProductionScheduling_1 =require("../database/models/ProductionScheduling");
const SewingTeamScheduling_1 =require("../database/models/SewingTeamScheduling");

exports.registerGetProcessBalanceByTeamOrderAndPlanAPI = function (getProcessBalanceByTeamOrderAndPlanAPIRouter) {
    /**
     * @api {get} /process/processBalanceBalance [工序平衡]-统计查詢
     * @apiDescription 根據班組和訂單id獲取該班組所操作的工序平衡圖
     * @apiGroup Process
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number} [teamID] 車縫班組ID
     * @apiParam {Number} [orderID] 訂單ID
     * @apiParam {Boolean} [isToday] 是否今天的計劃，可以不提供，默認為累計，如果提供請提供true
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/process/processBalanceBalance?teamID=2&orderID=1
     * Body:
     * {
     * "PlanAmount": 746,
     * "isToday": false,
     * "progressData": [
     *         {
     *          "id": 1,
     *          "order": 1,
     *          "styleProcess": 1,
     *          "station": 1,
     *          "amount": 88
     *         },
     *         {
     *          "id": 2,
     *          "order": 1,
     *          "styleProcess": 2,
     *          "station": 1,
     *          "amount": 88
     *         }
     *     ]
     *}
     * @apiSuccess (Success 200) {Object} total 查詢時間段內數據匯總
     * @apiSuccess (Success 200) {Number} recordsCount 按日期匯總數據筆數
     * @apiSuccess (Success 200) {Array} records 按日期匯總數據
     * @apiSuccessExample {json} Response Example
     * {
     *     "total": {
     *         "paySum": "360",
     *         "amountSum": "38"
     *     },
     *     "recordsCount": 3,
     *     "records": [
     *         {
     *             "date": "2018-10-10",
     *             "payDateSum": "166",
     *             "amountDateSum": "13"
     *         },
     *          .
     *          .
     *     ],
     *     "userID": 7
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    getProcessBalanceByTeamOrderAndPlanAPIRouter.get('/process/processBalanceBalance', async (ctx) => {
        if(!ctx.query || !ctx.query.teamID || ctx.query.teamID == undefined
            || !ctx.query.orderID || ctx.query.orderID ==undefined
            || !ctx.query.factoryID || ctx.query.factoryID ==undefined){
            ctx.throw('api.invalidParameters:162', 400);
        }
        try {
            let team_id =ctx.query.teamID;
            let order_id =ctx.query.orderID;
            let factory_id =ctx.query.factoryID;
            let isToday =false;
            if(ctx.query.isToday){
                isToday=true;
            }
            let PSID =await getPSIDByOrderID(order_id,factory_id);
            if(PSID.length <1){
                ctx.throw('db.invalidProductionScheduling:97', 400);
            }


            let memberList =await getTeamListByTeamID(team_id);
            let stationList =await getStationListByMemberList(memberList);
            rebuildMemberList(memberList,stationList);
            //console.log("member list after rebuild==> ");
            //console.log(memberList);

            let processesList =await getProcessesByStationList(stationList,order_id);
            //console.log("processesList list ==> ");
            //console.log(processesList);
            //console.log("after rerebuild list ==> ");
            //console.log(memberList);
            let output =await getMemberOutput(memberList,PSID,isToday);
            //console.log("output");
            //console.log(output);
            //console.log("after last ==>");
            findAmountByProList(memberList,output,processesList);
            //console.log(processesList);
            let PlanAmount =await getTodayProductionPlanAmount(PSID,team_id,isToday);

            let data={
                "PlanAmount":PlanAmount,
                "isToday":isToday,
                "progressData":processesList
            };


            ctx.body = data;
            ctx.status = 200;
            ctx.respond = true;

        }catch (e) {
            console.log(e);
            ctx.throw('db.invalidQuery:97', 400);
        }

    });
    async function getPSIDByOrderID(orderID,factoryID) {
        let orderDeliveryPlanIDdata = await OrderDeliveryPlan_1.OrderDeliveryPlan.findAll({
            attributes:['id'],
            where:{
                order:orderID
            },
            raw:true
        });
        let orderDeliveryPlanIDs=[];
        for(let i=0;i<orderDeliveryPlanIDdata.length;i++){
            orderDeliveryPlanIDs.push(orderDeliveryPlanIDdata[i].id)
        }
        let productionScheduleData =await ProductionScheduling_1.ProductionScheduling.findAll({
            attributes:['id'],
            where:{
                orderDeliveryPlan: {
                    [Sequelize_1.Op.in]: orderDeliveryPlanIDs
                },
                factory:factoryID
            },
            raw:true
        });
        let productionScheduleIds =[];
        for(let i=0;i<productionScheduleData.length;i++){
            productionScheduleIds.push(productionScheduleData[i].id)
        }
        return productionScheduleIds;
    }
    async function getTeamListByTeamID(teamID) {
        let memberList=await TeamMember_1.TeamMember.findAll({
            where:{
                team:teamID
            },
            raw:true
        });

        return memberList;
    }
    async function getStationListByMemberList(memberList) {
        let operatorList=[];
        for (let member of memberList) {
            operatorList.push(member.member);
        }
        let stationList =await Station_1.Station.findAll({
            where:{
                operator: {
                    [Sequelize_1.Op.in]: operatorList
                }
            },
            raw:true
        });
        return stationList;
    }
    async function getProcessesByStationList(stationList,order) {
        let stationIDs =[];
        for(let s of stationList){
            stationIDs.push(s.id)
        }
        let processesList =await ProcessStation_1.ProcessStation.findAll({
            where:{
                station: {
                    [Sequelize_1.Op.in]: stationIDs
                },
                order:order
            },
            raw:true
        });
        return processesList;
    }
    async function getMemberOutput(memberList,PSID,isToday=false) {
        let memberIds=[];
        for(let i=0;i<memberList.length;i++){
            memberIds.push(memberList[i].member);
        }
        let output=[];
        if(isToday){
            //当天的
            output =await MemberOutput_1.MemberOutput.findAll({
                where: {
                    [Sequelize_1.Op.and]:[
                        Sequelize_1.where(Sequelize_1.col("productionScheduling"),"in",[PSID]),
                        Sequelize_1.where(Sequelize_1.col("worker"),"IN",[memberIds]),
                        Sequelize_1.where(Sequelize_1.fn('DATE', Sequelize_1.col('date')),'=',Sequelize_1.fn('CURDATE'))
                    ]},
                raw:true
            });
        } else {
            output =await MemberOutput_1.MemberOutput.findAll({
                where:{
                    worker: {
                        [Sequelize_1.Op.in]: memberIds
                    },
                    productionScheduling:{
                        [Sequelize_1.Op.in]: PSID
                    }
                },
                raw:true
            });
        }


        return output;
    }
    async function getTodayProductionPlanAmount(PSID,teamID,isToday=false) {
        let sewingTeamScheduleData = await SewingTeamScheduling_1.SewingTeamScheduling.findAll({
            where: {
                [Sequelize_1.Op.and]:[
                    Sequelize_1.where(Sequelize_1.col("productionScheduling"),"in",[PSID]),
                    Sequelize_1.where(Sequelize_1.col("team"),"=",teamID),
                    Sequelize_1.where(Sequelize_1.fn('DATE', Sequelize_1.col('startDate')),'<=',Sequelize_1.fn('CURDATE')),
                    Sequelize_1.where(Sequelize_1.fn('DATE', Sequelize_1.col('endDate')),'>=',Sequelize_1.fn('CURDATE'))
                ]},
            raw:true
        });
        //console.log("sewingTeamScheduleData ==> ");
        //console.log(sewingTeamScheduleData);
        let planAmount=0;
        if(isToday){
            for(let i=0;i<sewingTeamScheduleData.length;i++){
                planAmount +=Math.ceil(sewingTeamScheduleData[i].amount/sewingTeamScheduleData[i].estimatedWorkingDay);
            }
        } else {
            for(let i=0;i<sewingTeamScheduleData.length;i++){
                planAmount +=Math.ceil((sewingTeamScheduleData[i].amount*dateDiff(sewingTeamScheduleData[i].startDate))/sewingTeamScheduleData[i].estimatedWorkingDay);
            }
        }

        return planAmount;
    }

    function rebuildMemberList(memberList,stationList) {
        for(let i=0;i<memberList.length;i++){
            memberList[i].stationID = findStationIdFromStationListByOperator(memberList[i].member,stationList);
        }
    }
    function findStationIdFromStationListByOperator(operator,stationList) {
        for(let i=0;i<stationList.length;i++){
            if(operator == stationList[i].operator){
                return stationList[i].id;
            }
        }
        return null;
    }


    function findAmountByProList(memberList,output,processList) {
        //console.log("findAmoutByProList");
        //console.log(processList);
        for(let i=0;i<processList.length;i++){
            processList[i].amount =findOutputByMember(findMemberByStationID(processList[i].station,memberList),output)
        }
    }
    function findMemberByStationID(stationID,memberList) {
        //console.log("findMemberByStationID ==> "+stationID);
        for(let i=0;i<memberList.length;i++){
            if(stationID ==memberList[i].stationID){
                return memberList[i].member;
            }
        }
        return null;
    }
    function findOutputByMember(member,output) {
        //console.log("findOutputByMember => "+member);
        let amount =0;
        for(let i=0;i<output.length;i++){
            if(member == output[i].worker){
                amount += output[i].amount;
            }
        }
        return amount;
    }
    function dateDiff(beginDate) {
        let sArr =beginDate.split("-");
        let sDate =new Date(sArr[0],(sArr[1]-1),sArr[2]);
        let eDate =new Date();
        let days=Math.ceil((eDate-sDate)/(24*60*60*1000));
        return days;
    }

};


