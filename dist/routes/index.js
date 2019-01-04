"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const KoaRouter = require("koa-router");
const KoaBody = require("koa-bodyparser");
const account_routes_1 = require("./account-routes");
const role_routes_1 = require("./role-routes");
const supplier_routes_1 = require("./supplier-routes");
const client_routes_1 = require("./client-routes");
const equipment_routes_1 = require("./equipment-routes");
const login_routes_1 = require("./login-routes");
const platformAccount_routes_1 = require("./platformAccount-routes");
const file_routes_1 = require("./file-routes");
const qualityStandard_1 = require("./qualityStandard");
const fabricStandard_1 = require("./fabricStandard");
const material_routes_1 = require("./material-routes");
const part_routes_1 = require("./part-routes");
const productCategory_1 = require("./productCategory");
const equipmentCategory_1 = require("./equipmentCategory");
const process_routes_1 = require("./process-routes");
const operation_routes_1 = require("./operation-routes");
const operationStep_routes_1 = require("./operationStep-routes");
const style_routes_1 = require("./style-routes");
const styleQualityStandard_routes_1 = require("./styleQualityStandard-routes");
const styleBOM_routes_1 = require("./styleBOM-routes");
const styleProcess_routes_1 = require("./styleProcess-routes");
const styleOperation_routes_1 = require("./styleOperation-routes");
const size_routes_1 = require("./size-routes");
const colorCode_routes_1 = require("./colorCode-routes");
const order_routes_1 = require("./order-routes");
const orderDeliveryPlan_routes_1 = require("./orderDeliveryPlan-routes");
const trussPlan_routes_1 = require("./trussPlan-routes");
const station_routes_1 = require("./station-routes");
const stationEquipment_routes_1 = require("./stationEquipment-routes");
const processStation_routes_1 = require("./processStation-routes");
const purchasePlan_routes_1 = require("./purchasePlan-routes");
const inventoryEvent_1 = require("./inventoryEvent");
const rfid_routes_1 = require("./rfid-routes");
const factory_routes_1 = require("./factory-routes");
const team_routes_1 = require("./team-routes");
const teamMember_routes_1 = require("./teamMember-routes");
const crop_routes_1 = require("./crop-routes");
const cropPackage_routes_1 = require("./cropPackage-routes");
const cropRecord_routes_1 = require("./cropRecord-routes");
const cropCard_routes_1 = require("./cropCard-routes");
const headCloth_routes_1 = require("./headCloth-routes");
const qualityInspection_routes_1 = require("./qualityInspection-routes");
const qualityInspectionResult_routes_1 = require("./qualityInspectionResult-routes");
const materialReceiving_routes_1 = require("./materialReceiving-routes");
const fabricInspection_routes_1 = require("./fabricInspection-routes");
const fabricInspectionResult_routes_1 = require("./fabricInspectionResult-routes");
const bulkFabricReport_routes_1 = require("./bulkFabricReport-routes");
const bulkFabricReportContact_routes_1 = require("./bulkFabricReportContact-routes");
const productionScheduling_routes_1 = require("./productionScheduling-routes");
const sewingTeamScheduling_routes_1 = require("./sewingTeamScheduling-routes");
const sewingTeamOutput_routes_1 = require("./sewingTeamOutput-routes");
const precedingTeamScheduling_routes_1 = require("./precedingTeamScheduling-routes");
const precedingTeamOutput_routes_1 = require("./precedingTeamOutput-routes");
const followingTeamScheduling_routes_1 = require("./followingTeamScheduling-routes");
const followingTeamOutput_routes_1 = require("./followingTeamOutput-routes");
const repair_routes_1 = require("./repair-routes");
const notification_routes_1 = require("./notification-routes");
const appeal_routes_1 = require("./appeal-routes");
const partCard_routes_1 = require("./partCard-routes");
const purchasePlanAttachment_routes_1 = require("./purchasePlanAttachment-routes");
const memberOutput_routes_1 = require("./memberOutput-routes");
const productionLine_routes_1 = require("./productionLine-routes");
const step_routes_1 = require("./step-routes");
const template_routes_1 = require("./template-routes");
const stylePartCard_routes_1 = require("./stylePartCard-routes");
const processPartCard_routes_1 = require("./processPartCard-routes");
//simon 20181119
const module_routes_1 = require("./module-routes");
//simon 20181122
const qualityReturnRecord_1 =require("./qualityReturnRecord-routes");
/**
 * @apiDefine jsonHeader
 * @apiHeaderExample {json} Header-Example:
 * {
 *   "Content-Type": "application/json"
 * }
 */
exports.registerFileUploader = function (app) {
    const uploaderRouter = new KoaRouter();
    file_routes_1.registerFileUploadAPI(uploaderRouter);
    app.use(uploaderRouter.routes()).use(uploaderRouter.allowedMethods());
};
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
    account_routes_1.registerAccountAPI(router);
    client_routes_1.registerClientAPI(router);
    equipment_routes_1.registerEquipmentAPI(router);
    role_routes_1.registerRoleAPI(router);
    supplier_routes_1.registerSupplierAPI(router);
    login_routes_1.registerLoginTokenAPI(router);
    platformAccount_routes_1.registerPlatformAccountAPI(router);
    file_routes_1.registerFilesAPI(router);
    qualityStandard_1.registerQualityStandardAPI(router);
    fabricStandard_1.registerFabricStdAPI(router);
    material_routes_1.registerMaterialAPI(router);
    part_routes_1.registerPartAPI(router);
    productCategory_1.registerProdCategoryAPI(router);
    equipmentCategory_1.registerEquipCategoryAPI(router);
    process_routes_1.registerProcessAPI(router);
    operation_routes_1.registerOperationAPI(router);
    operationStep_routes_1.registerOperationStepAPI(router);
    style_routes_1.registerStyleAPI(router);
    styleQualityStandard_routes_1.registerStyleQualityAPI(router);
    styleBOM_routes_1.registerStyleBOMAPI(router);
    styleProcess_routes_1.registerStyleProcessAPI(router);
    styleOperation_routes_1.registerStyleOperAPI(router);
    size_routes_1.registerSizeAPI(router);
    colorCode_routes_1.registerColorCodeAPI(router);
    order_routes_1.registerOrderAPI(router);
    orderDeliveryPlan_routes_1.registerOrderDelivPlanAPI(router);
    trussPlan_routes_1.registerTrussPlanAPI(router);
    station_routes_1.registerStationAPI(router);
    stationEquipment_routes_1.registerStationEquipAPI(router);
    processStation_routes_1.registerProcStationAPI(router);
    purchasePlan_routes_1.registerPurchPlanAPI(router);
    // registerOrderMaterialAPI(router);
    inventoryEvent_1.registerInventoryEventAPI(router);
    rfid_routes_1.registerRFIDAPI(router);
    factory_routes_1.registerFactoryAPI(router);
    team_routes_1.registerTeamAPI(router);
    teamMember_routes_1.registerTeamMemberAPI(router);
    crop_routes_1.registerCropAPI(router);
    cropCard_routes_1.registerCropCardAPI(router);
    cropPackage_routes_1.registerCropPackageAPI(router);
    cropRecord_routes_1.registerCropRecordAPI(router);
    headCloth_routes_1.regiterHeadClothAPI(router);
    qualityInspection_routes_1.registerQualityInspectAPI(router);
    qualityInspectionResult_routes_1.registerQualityInspResAPI(router);
    materialReceiving_routes_1.registerMaterialReceivingAPI(router);
    fabricInspection_routes_1.registerFabricInspectAPI(router);
    fabricInspectionResult_routes_1.registerFabricInspectResAPI(router);
    bulkFabricReport_routes_1.registerBulkFabricReportAPI(router);
    bulkFabricReportContact_routes_1.registerBulkFabricReportContactAPI(router);
    productionScheduling_routes_1.registerProdScheduleAPI(router);
    sewingTeamScheduling_routes_1.registerSewingTeamSchAPI(router);
    sewingTeamOutput_routes_1.registerSewingTeamOutAPI(router);
    precedingTeamScheduling_routes_1.registerPrecedTeamSchAPI(router);
    precedingTeamOutput_routes_1.registerPrecedTeamOutAPI(router);
    followingTeamScheduling_routes_1.registerFollowTeamSchAPI(router);
    followingTeamOutput_routes_1.registerFollowTeamOutAPI(router);
    repair_routes_1.registerRepairAPI(router);
    notification_routes_1.registerNotificationAPI(router);
    appeal_routes_1.registerAppealAPI(router);
    partCard_routes_1.registerPartCardAPI(router);
    purchasePlanAttachment_routes_1.registerPurchasePlanAttachAPI(router);
    memberOutput_routes_1.registerMemberOutputAPI(router);
    productionLine_routes_1.registerProductionLineAPI(router);
    step_routes_1.registerStepAPI(router);
    template_routes_1.registerTemplateAPI(router);
    stylePartCard_routes_1.registerStylePartCardAPI(router);
    processPartCard_routes_1.registerProcessPartCardAPI(router);
    //by simon 20181119
    module_routes_1.registerModuleAPI(router);
	//by simon 20181122
	 qualityReturnRecord_1.registerQualityReturnRecordAPI(router);
	 
    app.use(router.routes()).use(router.allowedMethods());
}
exports.registerRoutes = registerRoutes;
