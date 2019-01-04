"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const KoaRouter = require("koa-router");
const KoaBody = require("koa-bodyparser");

const equipmentIntelligence_routes_1 = require("./equipmentIntelligence-routes");
const achievement_routes_1 = require("./achievement-routes");
const stationComplex_routes_1 = require("./stationComplex-routes");
const cropRecordCard_routes_1 = require("./cropRecordCard-routes");
const getUserListByRFID_routes_1 =require("./getUserListByRFID-routes");
const foremanKanban_routes_1 =require("./foremanKanban-routes");
const getSequProcessByStyleID_1 =require("./getSequentialProcessByStyleID");
const daHuo_report_routes_1 = require("./daHuo-report-routes");
const factoryComplex_api_1 =require("./factoryComplex-api");
const inventoryEventComplex_api_1 =require("./inventoryEventComplex-api");
const materialReceivingComplex_api_1 =require("./materialReceivingComplex-api");
const memberTeamSelected_api_1 = require("./memberTeamSelected-api");
const orderMaintainComplex_api_1 =require("./orderMaintainComplex-api");
const materialComplex_api_1 =require("./materialComplex-api");
const styleProcessComplex_api_1 =require("./styleProcessComplex-api");
const distributionDetailsComplex_api_1 =require("./distributionDetailsComplex-api");
const orderDeliveryPlanComplex_api_1 =require("./orderDeliveryPlanComplex-api");
//1019 by simon
const getProcStatisticsByOrderID_1=require("./getProgressStatisticsByOrderID");
//1020 by simon
const getProcessBalanceByTeamOrderAndPlan_1 =require("./getProcessBalanceByTeamOrderAndPlan");
//1024 by simon
const productionSchedule_1 =require("./productionSchedule");
const getOrdersDetail_1 =require("./getOrdersDetail");

const scheduleReport_routes_1 =require("./scheduleReport-routes");

//1025 by simon
const ota_routes_1=require("./ota-routes"); 
const styleComplex_api_1 =require("./styleComplex-api");

const  orderReport_routes_1=require("./orderReport-routes");
//1030 by simon
const getProcStatisticsByOrderID2_1=require("./getProgressStatistics2ByOrderID");
//1031 by simon
const teamSchedule_routers_1=require("./teamSchedule-routes");
const repairReport_routes_1=require("./repairReport-routes");
const processOrderComplex_api_1 =require("./processOrderComplex-api");
const convenientQuery_routes_1 =require("./convenientQuery-routes");
const qualityCard_routes_1 =require("./qualityCard-routes");
const foremanKanbanNew_api_1 =require("./foremanKanbanNew-api");
const cropRecord_routes_1=require("./cropRecord-routes");
//1120 by simon  add getStyleIDs
const getStyleIDs_1 =require("./getStyleIDs");
//1122 by simon add qualityReturnCount-routes
const qualityReturnCount_1=require("./qualityReturnCount-routes");

//1213 by nicolas
const newStationThenProductionLineComplex_api_1=require("./newStationThenProductionLineComplex-api");

/**
 * @apiDefine jsonHeader
 * @apiHeaderExample {json} Header-Example:
 * {
 *   "Content-Type": "application/json"
 * }
 */

function registerRoutes(app) {
    app.use(KoaBody());
    const router = new KoaRouter();
    router.get('/', async (ctx) => {
        const welcomeText = 'Welcome to Koa!';
        ctx.body = `<!DOCTYPE html>
<html>
<head>
    <title>${welcomeText}</title>
</head>
<body>
    <h1>${welcomeText}</h1>
</body>
</html>`;
    });
 
    equipmentIntelligence_routes_1.registerEquipmentIntelligenceAPI(router);
    achievement_routes_1.registerAchievementAPI(router);
    stationComplex_routes_1.registerStationComplexAPI(router);
    cropRecordCard_routes_1.registerCropRecordCardAPI(router);
    getUserListByRFID_routes_1.registerGetUserListByRFIDAPI(router);
    foremanKanban_routes_1.registerForemanKanbanAPI(router);
    getSequProcessByStyleID_1.registerGetSequentialProcessByStyleIDAPI(router);
    factoryComplex_api_1.registerFactoryComplexAPI(router);
    daHuo_report_routes_1.registerDaHuoReportAPI(router);
    inventoryEventComplex_api_1.registerInventoryEventComplexAPI(router);
    materialReceivingComplex_api_1.registerMaterialReceivingComplexAPI(router);
    orderMaintainComplex_api_1.registerOrderMaintainComplexAPI(router);
    memberTeamSelected_api_1.registerMemberTeamSelectedAPI(router);
    materialComplex_api_1.registerMaterialComplexAPI(router);
    styleProcessComplex_api_1.registerStyleProcessComplexAPI(router);
	distributionDetailsComplex_api_1.registerDistributionDetailsComplexAPI(router);
	orderDeliveryPlanComplex_api_1.registerOrderDeliveryPlanComplexAPI(router);
	//1019 by simon
    getProcStatisticsByOrderID_1.registerGetProcStatisticsByOrderIDAPI(router);
    //1020 by simon
    getProcessBalanceByTeamOrderAndPlan_1.registerGetProcessBalanceByTeamOrderAndPlanAPI(router);
	//1024 by simon
	productionSchedule_1.registerProductionScheduleAPI(router);
    getOrdersDetail_1.registerGetOrdersDetailAPI(router);
	
	scheduleReport_routes_1.registerScheduleReportAPI(router);
	//1025 by simon
	ota_routes_1.registerOTAAPI(router);
    styleComplex_api_1.registerStyleComplexAPI(router);
    orderReport_routes_1.registerOrderReportAPI(router);
    //1030 by simon
    getProcStatisticsByOrderID2_1.registerGetProcStatisticsByOrderID2API(router);
    //1031 by simon
    teamSchedule_routers_1.registerTeamScheduleAPI(router);
    repairReport_routes_1.registerRepairReportAPI(router);
    processOrderComplex_api_1.registerProcessOrderComplexAPI(router);
    convenientQuery_routes_1.registerAPI(router);
    qualityCard_routes_1.registerAPI(router);
    foremanKanbanNew_api_1.registerForemanKanbanNewAPI(router);
    cropRecord_routes_1.registerAPI(router);
	
	//1120 by simon add getStyleIDs
	getStyleIDs_1.registerStyleAPI(router);
	//1122 by simon add qualityReturnCount_1
	qualityReturnCount_1.registerQualityReturnCountAPI(router);
	//1213 by nicolas
	newStationThenProductionLineComplex_api_1.registerNewStationThenProductionLineComplexAPI(router);
    
    app.use(router.routes()).use(router.allowedMethods());
}
exports.registerRoutes = registerRoutes;
