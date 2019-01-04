"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const CropCard_1 = require("../database/models/CropCard");
const CropRecord_1 = require("../database/models/CropRecord");
const CropPackage_1 = require("../database/models/CropPackage");
const TeamMember_1 = require("../database/models/TeamMember");
const OrderDeliveryPlan_1 = require("../database/models/OrderDeliveryPlan");

const dbquery_1 = require("../database/dbquery");
const Sequelize_1 = require("sequelize");
const Op = Sequelize_1.Op;
const ProductionScheduling_1 = require("../database/models/ProductionScheduling");
const MemberOutput_1 = require("../database/models/MemberOutput");
const PrecedingTeamScheduling_1 = require("../database/models/PrecedingTeamScheduling");
const RFID_1 = require("../database/models/RFID");
const PrecedingTeamOutput_1 = require("../database/models/PrecedingTeamOutput");

function pushElementToObject (d,o){
    if(typeof(o)=='object') for(var p in o) {d[p]=o[p]}
}

const findOne = async function (query,modelInstance,join,option,condition){
    let queryInstance = {};
    let modelInstanceKeys = Object.keys(modelInstance);
    if(join && modelInstanceKeys.length === 2 ){
        queryInstance = dbquery_1.queryDBGeneratorEx(query, modelInstance[modelInstanceKeys[1]]);
    }else{
        queryInstance = dbquery_1.queryDBGeneratorEx(query);
    }

    if(option){
        pushElementToObject(queryInstance,option)
    }
    if(condition){
        //console.log('condition')
        //console.log(condition)
        queryInstance.where = Object.assign(queryInstance.where,condition)
    }
    //console.log('queryInstance')
    //console.log(queryInstance)

    let oneDoc = await modelInstance[modelInstanceKeys[0]].findOne(queryInstance);
    return  oneDoc;
};

const findAndCount = async function (query,modelInstance,join,option,condition){
    let queryInstance = {};
    let modelInstanceKeys = Object.keys(modelInstance);
    if(join && modelInstanceKeys.length === 2 ){
        queryInstance = dbquery_1.queryDBGeneratorEx(query, modelInstance[modelInstanceKeys[1]]);
    }else{
        queryInstance = dbquery_1.queryDBGeneratorEx(query);
    }
    if(option){
        pushElementToObject(queryInstance,option)
    }

    if(condition){
        queryInstance.where = Object.assign(queryInstance.where,condition)
    }
    //console.log('queryInstance');
    //console.log(queryInstance);

    let tempArray = [];
    let docs = await modelInstance[modelInstanceKeys[0]].findAndCount(queryInstance);
    if (docs && docs.rows) {
        for (let item of docs.rows) {
            tempArray.push(item.toJSON());
        }
    }

    return  tempArray;
};

exports.registerCropRecordCardAPI = function (cropRecordCardAPIRouter) {
    /**
     * @api {post} /cropRecordCard/new [新增裁剪制卡]
     * @apiDescription 查詢符合條件的工位信息，並將結果分頁回傳
     * @apiGroup Complex
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number=0} [pageIndex] 頁碼
     * @apiParam {Number=100} [maxRows] 每一頁的最大筆數
     * @apiParam {Object} [query] 查詢條件。可以指定欄位等於某個值。
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/cropRecordCard/new
     * Body:
     * {
     *   "query": {
     *       "member":"6",
     *       "order":"2",
     *       "size":"XL",
     *       "colorCode":"2",
     *       "amount":"300",
     *       "cropPackage":"5",
     *       "bundleNumber":"10005",
     *       "cardNumber":"1272227429",
     *       "part":"后片"
     *   }
     * }
     * @apiSuccess (Success 200) {Number} pageIndex 目前的頁碼
     * @apiSuccess (Success 200) {Number} maxRows 每一頁的最大筆數
     * @apiSuccess (Success 200) {Number} totalPage 總頁數
     * @apiSuccess (Success 200) {Array} records 查詢的結果。
     * @apiSuccessExample {json} Response Example
     * {
     *   "pageIndex": 1,
     *   "maxRows": 100,
     *   "totalPage": 2,
     *   "records": [{
     *         precedingTeamSchedulingUpdateCount:0,
     *         productionSchedulingUpdateCount:0,
     *         cropRecordUpdateCount:0,
     *         precedingTeamOutputUpdateCount:0,
     *         memberOutputUpdateCount:0,
     *         cropCardCreateID:[],
     *         memberOutputCreateID:[],
     *         cropCardUpdateCount:0
     *   ]
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    cropRecordCardAPIRouter.post('/cropRecordCard/new', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:69', 400);
        }
        else {
            let resp = dbquery_1.queryResponsePacket(ctx.request.body);
            // let query = dbquery_1.queryDBGeneratorEx(ctx.request.body, MemberOutput_1.memberOutputJoin);
            try {

                let nowDate = new Date(new Date().getTime() + 28800000).toISOString();
                let updateTime = (new Date()).toLocaleDateString();
                let res = {
                    precedingTeamSchedulingUpdateCount:0,
                    productionSchedulingUpdateCount:0,
                    cropRecordUpdateCount:0,
                    precedingTeamOutputUpdateCount:0,
                    memberOutputUpdateCount:0,
                    cropCardCreateID:[],
                    memberOutputCreateID:[],
                    cropCardUpdateCount:0,
                    createTime:null
                };
                if (false === dbquery_1.checkRequestParamObject(ctx.request.body.query)) {
                    ctx.throw('api.queryIsEmpty:70', 400);
                }
                else {
                    let query = ctx.request.body.query;

                    if (!query.member || query.member == undefined) {
                        ctx.throw('db.invalidParameters:C1', 400);
                    }

                    if (!query.order || query.order == undefined) {
                        ctx.throw('db.invalidParameters:C2', 400);
                    }

                    if (!query.size || query.size == undefined) {
                        ctx.throw('db.invalidParameters:C3', 400);
                    }

                    if (!query.colorCode || query.colorCode == undefined) {
                        ctx.throw('db.invalidParameters:C4', 400);
                    }
                    if (!query.amount || query.amount == undefined) {
                        ctx.throw('db.invalidParameters:C5', 400);
                    }

                    if (!query.cropPackage || query.cropPackage == undefined) {
                        ctx.throw('db.invalidParameters:C6', 400);
                    }

                    if (!query.bundleNumber || query.bundleNumber == undefined) {
                        ctx.throw('db.invalidParameters:C7', 400);
                    }

                    if (!query.cardNumber || query.cardNumber == undefined) {
                        ctx.throw('db.invalidParameters:C8', 400);
                    }

                    if (!query.part || query.part == undefined) {
                        ctx.throw('db.invalidParameters:C8', 400);
                    }

                    let rfidJson = {
                        id:null
                    };
                    let RFIDQuery = {query:{cardNumber:query.cardNumber}};
                    let RFIDOne = await findOne(RFIDQuery,RFID_1,0,{raw:true});
                    console.log(RFIDOne)
                    if(RFIDOne){
                        rfidJson.id = RFIDOne.id
                    }else{
                        let rfid ={cardNumber:query.cardNumber};
                        let prod = new RFID_1.RFID(rfid);
                        let proddoc = await prod.save();
                        if (proddoc && proddoc.id) {
                            rfidJson.id = proddoc.id
                        }
                    }

                    res.createTime = nowDate;
                    let cropCardOneQuery = {query:{bundleNumber:query.bundleNumber}};
                    let cropCardOne = await findOne(cropCardOneQuery,CropCard_1,0,{raw:true});

                    if(cropCardOne){
                        cropCardOneQuery = {query:{bundleNumber:query.bundleNumber,part:query.part/*,rfid:rfidJson.id*/}};
                        let cropCardOne1 = await findOne(cropCardOneQuery,CropCard_1,0,{raw:true});
                        if(cropCardOne1){
                            //console.log('11111111111111111111111111111111111')
                        //if(cropCardOne.part === query.part && cropCardOne.rfid === rfidJson.id){
                            let cropCardquery = {
                                where: {id:cropCardOne1.id},
                            };
                            let updateres = await CropCard_1.CropCard.update({amount:query.amount,rfid:rfidJson.id,createTime:nowDate,valid:1,return:0}, cropCardquery);
                            if (updateres && Array.isArray(updateres)) {
                                res.cropCardUpdateCount = updateres[0];
                            }
                        }else {
                            //console.log('2222222222222222222222222222222222222')
                            let cropCard = {
                                cropPackage:query.cropPackage,
                                rfid:rfidJson.id,
                                colorCode:query.colorCode,
                                bundleNumber:query.bundleNumber,
                                amount:query.amount,
                                createTime: nowDate,
                                part:query.part,
                                worker:null,
                                return:0,
                                productionScheduling:cropCardOne.productionScheduling
                            };

                            let prod = new CropCard_1.CropCard(cropCard);
                            let proddoc = await prod.save();
                            if (proddoc && proddoc.id) {
                                res.cropCardCreateID.push(proddoc.id)
                            }
                        }
                    }else{
                        let teamMemberQuery = {query:{member:query.member}};
                        let teamMember = await findOne(teamMemberQuery,TeamMember_1,1,{raw:true});
                        console.log('teamMember');
                        console.log(teamMember);

                        if(teamMember) {
                            let orderDeliveryPlanQuery = {query:{order: query.order, size: query.size, colorCode: query.colorCode}};
                            let orderDeliveryPlanArray = await findAndCount(orderDeliveryPlanQuery, OrderDeliveryPlan_1, 0);
                            //console.log('orderDeliveryPlanArray');
                            //console.log(orderDeliveryPlanArray);

                            let productionSchedulingTotalArray = [];
                            if (orderDeliveryPlanArray.length > 0) {
                                for (let x = 0; x < orderDeliveryPlanArray.length; x++) {
                                    let productionSchedulingQuery = {query:{orderDeliveryPlan: orderDeliveryPlanArray[x].id}};
                                    let option = {
                                        attributes: [
                                            'id',
                                            'amount',
                                            'cropCompleteAmount',
                                        ],
                                        group: ['id']
                                    };
                                    let productionSchedulingArray = await findAndCount(productionSchedulingQuery, ProductionScheduling_1, 0, option);
                                    console.log('productionSchedulingArray');
                                    console.log(productionSchedulingArray);

                                    productionSchedulingTotalArray = productionSchedulingTotalArray.concat(productionSchedulingArray);
                                }

                                if (productionSchedulingTotalArray.length > 0) {
                                    let productionSchedulingUpdate = [];
                                    let productionSchedulingIDArray = productionSchedulingTotalArray.map(value => {
                                        return value.id;
                                    });
                                    //console.log('productionSchedulingIDArray');
                                    //console.log(productionSchedulingIDArray);

                                    let precedingTeamSchedulingQuery = {query: {cropTeam: teamMember.team/*cropCompleteAmount:{[Op.lt]:query.amount},cropStartDate: {[Op.lte]: updateTime},cropEndDate: {[Op.gte]: updateTime}*/}};
                                    let precedingTeamSchedulingArray = await findAndCount(precedingTeamSchedulingQuery, PrecedingTeamScheduling_1, 0, {order: ['cropEndDate']},{productionScheduling: {[Op.in]: productionSchedulingIDArray}});
                                    //console.log('precedingTeamSchedulingArray');
                                    //console.log(precedingTeamSchedulingArray);

                                    if (precedingTeamSchedulingArray.length > 0) {

                                        let precedingTeamSchedulingCropArray = precedingTeamSchedulingArray.filter(value => {
                                            if (value.cropCompleteAmount < value.amount)
                                                return true;
                                        });

                                        if(precedingTeamSchedulingCropArray.length === 0){
                                            //console.log('333333333333333333333333333333333');
                                            precedingTeamSchedulingCropArray[0] = precedingTeamSchedulingArray[precedingTeamSchedulingArray.length-1];
                                            //console.log(precedingTeamSchedulingCropArray);
                                        }

                                        if (precedingTeamSchedulingCropArray.length > 0) {
                                            let update = {cropCompleteAmount: parseFloat(precedingTeamSchedulingCropArray[0].cropCompleteAmount) + parseFloat(query.amount)};

                                            let precedingTeamSchedulingQuery = {
                                                where: {id: precedingTeamSchedulingCropArray[0].id}
                                            };
                                            let updateres = await PrecedingTeamScheduling_1.PrecedingTeamScheduling.update(update, precedingTeamSchedulingQuery);
                                            if (updateres && Array.isArray(updateres)) {
                                                res.precedingTeamSchedulingUpdateCount += updateres[0];
                                            }

                                            let productionSchedulingQuery = {
                                                where: {id: precedingTeamSchedulingCropArray[0].productionScheduling}
                                            };
                                            updateres = await ProductionScheduling_1.ProductionScheduling.update(update, productionSchedulingQuery);
                                            if (updateres && Array.isArray(updateres)) {
                                                res.productionSchedulingUpdateCount += updateres[0];
                                                productionSchedulingUpdate.push(precedingTeamSchedulingCropArray[0].productionScheduling);
                                            }

                                            let precedingTeamOutputQuery = {query:{precedingTeamScheduling:precedingTeamSchedulingCropArray[0].id}};
                                            let precedingTeamOutputOne = await findOne(precedingTeamOutputQuery,PrecedingTeamOutput_1,0,{raw:true});
                                            console.log('precedingTeamOutputOne');
                                            console.log(precedingTeamOutputOne);
                                            if(precedingTeamOutputOne){
                                                let precedingTeamOutputUpdate = {
                                                    date:nowDate,
                                                    cropAmount:parseInt(precedingTeamOutputOne.cropAmount) + parseInt(query.amount)
                                                };

                                                let updateres = await PrecedingTeamOutput_1.PrecedingTeamOutput.update(precedingTeamOutputUpdate,{where:{id:precedingTeamOutputOne.id}});
                                                if (updateres && Array.isArray(updateres)) {
                                                    res.precedingTeamOutputUpdateCount += updateres[0];
                                                }else{
                                                    console.log("PrecedingTeamOutput update Fail");
                                                }
                                            }else{
                                                let updatedoc = {
                                                    precedingTeamScheduling:precedingTeamSchedulingCropArray[0].id,
                                                    date:nowDate,
                                                    cropAmount:query.amount,
                                                    stickAmount:0
                                                };

                                                let prod = new PrecedingTeamOutput_1.PrecedingTeamOutput(updatedoc);
                                                let proddoc = await prod.save();
                                            }
                                        }
                                    }
                                    //console.log('productionSchedulingUpdate');
                                    //console.log(productionSchedulingUpdate);

                                    for (let y = 0; y < productionSchedulingUpdate.length; y++) {
                                        //let nowDate = new Date(new Date().getTime() + 28800000).toISOString();
                                        let cropCard = {
                                            cropPackage: query.cropPackage,
                                            rfid: rfidJson.id,
                                            colorCode: query.colorCode,
                                            bundleNumber: query.bundleNumber,
                                            amount: query.amount,
                                            //createTime:new Date().toISOString(),
                                            createTime: nowDate,
                                            part: query.part,
                                            worker: null,
                                            return: 0,
                                            productionScheduling: productionSchedulingUpdate[y]
                                        };

                                        let prod = new CropCard_1.CropCard(cropCard);
                                        let proddoc = await prod.save();
                                        if (proddoc && proddoc.id) {
                                            res.cropCardCreateID.push(proddoc.id);
                                        }

                                        let memberOutputQuery = {query:{bundleNumber:query.bundleNumber,productionScheduling:productionSchedulingUpdate[y],step:"裁剪"}};

                                        let memberOutputOne = await findOne(memberOutputQuery,MemberOutput_1,0,{raw:true});
                                        if(memberOutputOne){
                                            let memberOutputUpdatedoc = {
                                                amount:query.amount
                                            };
                                            let updateres = await MemberOutput_1.MemberOutput.update(memberOutputUpdatedoc,{where:{id:memberOutputOne.id}});
                                            if (updateres && Array.isArray(updateres)) {
                                                res.memberOutputUpdateCount += updateres[0];
                                            }else{
                                                console.log("memberOutput update Fail");
                                            }

                                        }else{
                                            let memberOutput = {
                                                productionScheduling: productionSchedulingUpdate[y],
                                                worker: query.member,
                                                team: teamMember.team,
                                                step: "裁剪",
                                                amount: query.amount,
                                                processAmount: query.amount,
                                                pay: null,
                                                date: nowDate,
                                                bundleNumber: query.bundleNumber
                                            };

                                            prod = new MemberOutput_1.MemberOutput(memberOutput);
                                            proddoc = await prod.save();
                                            if (proddoc && proddoc.id) {
                                                res.memberOutputCreateID.push(proddoc.id);
                                            }
                                        }
                                    }
                                }
                                else
                                {
                                    ctx.throw('db.invalidParameters:C9', 400);
                                }
                            }
                            console.log('productionSchedulingTotalArray');
                            console.log(productionSchedulingTotalArray);
                        }
                    }

                    /* Update colorCode to cropRecord */
                    let cropPackageQuery = {query:{id:query.cropPackage}};
                    let cropPackageOne = await findOne(cropPackageQuery,CropPackage_1,0,{raw:true});

                    if(cropPackageOne){
                        let cropRecordQuery = {
                            where:{
                                crop: cropPackageOne.crop,
                                material: cropPackageOne.material
                            }
                        };
                        let update = {colorCode:query.colorCode};
                        let updateres = await CropRecord_1.CropRecord.update(update,cropRecordQuery);
                        if (updateres && Array.isArray(updateres)) {
                            res.cropRecordUpdateCount += updateres[0];
                        }
                    }else {
                        ctx.throw('db.invalidParameters:CA', 400);
                    }
                }

                ctx.body = res;
                ctx.status = 200;
                ctx.respond = true;
            }
            catch (err) {
                console.log(err);
                ctx.throw(err.message, 400);
            }
        }
    });
    /**
     * @api {post} /cropRecordCard/returnNew [新增裁剪返工卡]
     * @apiDescription 查詢符合條件的工位信息，並將結果分頁回傳
     * @apiGroup Complex
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number=0} [pageIndex] 頁碼
     * @apiParam {Number=100} [maxRows] 每一頁的最大筆數
     * @apiParam {Object} [query] 查詢條件。可以指定欄位等於某個值。
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/cropRecordCard/returnNew
     * Body:
     * {
     *   "query": {
     *      "bundleNumber":"",
     *      "preBundleNumber":"",
     *      "return":"",
     *      "cardNumber":""
     *   }
     * }
     * @apiSuccess (Success 200) {Number} pageIndex 目前的頁碼
     * @apiSuccess (Success 200) {Number} maxRows 每一頁的最大筆數
     * @apiSuccess (Success 200) {Number} totalPage 總頁數
     * @apiSuccess (Success 200) {Array} records 查詢的結果。
     * @apiSuccessExample {json} Response Example
     * {
     *   "pageIndex": 1,
     *   "maxRows": 100,
     *   "totalPage": 2,
     *   "records": [{
     *       RFIDCreateID:[],
     *       cropCardCreateID:[]
     *   ]
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    cropRecordCardAPIRouter.post('/cropRecordCard/returnNew', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:69', 400);
        }
        else {
            let resp = dbquery_1.queryResponsePacket(ctx.request.body);
            // let query = dbquery_1.queryDBGeneratorEx(ctx.request.body, MemberOutput_1.memberOutputJoin);
            try {

                let updateTime = (new Date()).toLocaleDateString();
                let res = {
                    RFIDCreateID:[],
                    cropCardCreateID:[]
                };
                if (false === dbquery_1.checkRequestParamObject(ctx.request.body.query)) {
                    ctx.throw('api.queryIsEmpty:70', 400);
                }
                else {
                    let query = ctx.request.body.query;

                    if(!query.allData || query.allData == undefined){
                        ctx.throw('db.invalidParameters:C5', 400);
                    }

                    let updateArray = query.allData;
                    let nowDate = new Date(new Date().getTime() + 28800000).toISOString();

                    for(let x = 0; x < updateArray.length; x++){
                        if (!updateArray[x].preBundleNumber || updateArray[x].preBundleNumber == undefined) {
                            ctx.throw('db.invalidParameters:C6', 400);
                        }

                        if (!updateArray[x].bundleNumber || updateArray[x].bundleNumber == undefined) {
                            ctx.throw('db.invalidParameters:C7', 400);
                        }

                        if (!updateArray[x].cardNumber || updateArray[x].cardNumber == undefined) {
                            ctx.throw('db.invalidParameters:C8', 400);
                        }

                        let rfidJson = {
                            id:null
                        };
                        let RFIDQuery = {query:{cardNumber:updateArray[x].cardNumber}};
                        let RFIDOne = await findOne(RFIDQuery,RFID_1,0,{raw:true});
                        //console.log(RFIDOne)
                        if(RFIDOne){
                            rfidJson.id = RFIDOne.id
                        }else{
                            let rfid ={cardNumber:updateArray[x].cardNumber};
                            let prod = new RFID_1.RFID(rfid);
                            let proddoc = await prod.save();
                            if (proddoc && proddoc.id) {
                                rfidJson.id = proddoc.id;
                                res.RFIDCreateID.push(proddoc.id);
                            }
                        }

                        let cropCardOneQuery = {query:{bundleNumber:updateArray[x].preBundleNumber}};
                        let cropCardOne = await findOne(cropCardOneQuery,CropCard_1,0,{raw:true});

                        if(cropCardOne){

                            let cropCardUpdate = {
                                cropPackage:cropCardOne.cropPackage,
                                rfid:rfidJson.id,
                                colorCode:cropCardOne.colorCode,
                                bundleNumber:updateArray[x].bundleNumber,
                                amount:1,
                                createTime:nowDate,
                                part:null,
                                worker:null,
                                return:updateArray[x].return,
                                valid:1,
                                returnPieceIndex:updateArray[x].returnPieceIndex,
                                productionScheduling:cropCardOne.productionScheduling
                            };
                            let prod = new CropCard_1.CropCard(cropCardUpdate);
                            let proddoc = await prod.save();
                            if (proddoc && proddoc.id) {
                                res.cropCardCreateID.push(proddoc.id);
                            }
                        }
                    }
                }

                ctx.body = res;
                ctx.status = 200;
                ctx.respond = true;
            }
            catch (err) {
                console.log(err);
                ctx.throw(err.message, 400);
            }
        }
    });

    /**
     * @api {post} /cropRecordCard/newNoPart [新增裁剪返工卡(无部件)]
     * @apiDescription 查詢符合條件的工位信息，並將結果分頁回傳
     * @apiGroup Complex
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number=0} [pageIndex] 頁碼
     * @apiParam {Number=100} [maxRows] 每一頁的最大筆數
     * @apiParam {Object} [query] 查詢條件。可以指定欄位等於某個值。
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/cropRecordCard/newNoPart
     * Body:
     * {
     *   "query": {
     *       "member":"6",
     *       "order":"2",
     *       "size":"XL",
     *       "colorCode":"2",
     *       "amount":"300",
     *       "cropPackage":"5",
     *       "bundleNumber":"10005",
     *       "cardNumber":"1272227429",
     *   }
     * }
     * @apiSuccess (Success 200) {Number} pageIndex 目前的頁碼
     * @apiSuccess (Success 200) {Number} maxRows 每一頁的最大筆數
     * @apiSuccess (Success 200) {Number} totalPage 總頁數
     * @apiSuccess (Success 200) {Array} records 查詢的結果。
     * @apiSuccessExample {json} Response Example
     * {
     *   "pageIndex": 1,
     *   "maxRows": 100,
     *   "totalPage": 2,
     *   "records": [{
     *        precedingTeamSchedulingUpdateCount:0,
     *        productionSchedulingUpdateCount:0,
     *        cropRecordUpdateCount:0,
     *        precedingTeamOutputUpdateCount:0,
     *        memberOutputUpdateCount:0,
     *        cropCardCreateID:[],
     *        memberOutputCreateID:[],
     *        cropCardUpdateCount:0
     *   ]
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */

    cropRecordCardAPIRouter.post('/cropRecordCard/newNoPart', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:69', 400);
        }
        else {
            let resp = dbquery_1.queryResponsePacket(ctx.request.body);
            // let query = dbquery_1.queryDBGeneratorEx(ctx.request.body, MemberOutput_1.memberOutputJoin);
            try {

                let nowDate = new Date(new Date().getTime() + 28800000).toISOString();
                let updateTime = (new Date()).toLocaleDateString();
                let res = {
                    precedingTeamSchedulingUpdateCount:0,
                    productionSchedulingUpdateCount:0,
                    cropRecordUpdateCount:0,
                    precedingTeamOutputUpdateCount:0,
                    memberOutputUpdateCount:0,
                    cropCardCreateID:[],
                    memberOutputCreateID:[],
                    cropCardUpdateCount:0
                };
                if (false === dbquery_1.checkRequestParamObject(ctx.request.body.query)) {
                    ctx.throw('api.queryIsEmpty:70', 400);
                }
                else {
                    let query = ctx.request.body.query;

                    if (!query.member || query.member == undefined) {
                        ctx.throw('db.invalidParameters:C1', 400);
                    }

                    if (!query.order || query.order == undefined) {
                        ctx.throw('db.invalidParameters:C2', 400);
                    }

                    if (!query.size || query.size == undefined) {
                        ctx.throw('db.invalidParameters:C3', 400);
                    }

                    if (!query.colorCode || query.colorCode == undefined) {
                        ctx.throw('db.invalidParameters:C4', 400);
                    }
                    if (!query.amount || query.amount == undefined) {
                        ctx.throw('db.invalidParameters:C5', 400);
                    }

                    if (!query.cropPackage || query.cropPackage == undefined) {
                        ctx.throw('db.invalidParameters:C6', 400);
                    }

                    if (!query.bundleNumber || query.bundleNumber == undefined) {
                        ctx.throw('db.invalidParameters:C7', 400);
                    }

                    if (!query.cardNumber || query.cardNumber == undefined) {
                        ctx.throw('db.invalidParameters:C8', 400);
                    }


                    let rfidJson = {
                        id:null
                    };
                    let RFIDQuery = {query:{cardNumber:query.cardNumber}};
                    let RFIDOne = await findOne(RFIDQuery,RFID_1,0,{raw:true});
                    //console.log(RFIDOne)
                    if(RFIDOne){
                        rfidJson.id = RFIDOne.id
                    }else{
                        let rfid ={cardNumber:query.cardNumber};
                        let prod = new RFID_1.RFID(rfid);
                        let proddoc = await prod.save();
                        if (proddoc && proddoc.id) {
                            rfidJson.id = proddoc.id
                        }
                    }

                    let cropCardOneQuery = {query:{bundleNumber:query.bundleNumber,rfid:rfidJson.id}};
                    let cropCardOne = await findOne(cropCardOneQuery,CropCard_1,0,{raw:true});

                    if(cropCardOne){

                    }else{
                        let teamMemberQuery = {query:{member:query.member}};
                        let teamMember = await findOne(teamMemberQuery,TeamMember_1,1,{raw:true});
                        //console.log('teamMember');
                        //.log(teamMember);

                        if(teamMember) {
                            let orderDeliveryPlanQuery = {query:{order: query.order, size: query.size, colorCode: query.colorCode}};
                            let orderDeliveryPlanArray = await findAndCount(orderDeliveryPlanQuery, OrderDeliveryPlan_1, 0);
                            //console.log('orderDeliveryPlanArray');
                            //console.log(orderDeliveryPlanArray);

                            let productionSchedulingTotalArray = [];
                            if (orderDeliveryPlanArray.length > 0) {
                                for (let x = 0; x < orderDeliveryPlanArray.length; x++) {
                                    let productionSchedulingQuery = {query: {orderDeliveryPlan: orderDeliveryPlanArray[x].id}};
                                    let option = {
                                        attributes: [
                                            'id',
                                            'amount',
                                            'cropCompleteAmount',
                                        ],
                                        group: ['id']
                                    };
                                    let productionSchedulingArray = await findAndCount(productionSchedulingQuery, ProductionScheduling_1, 0, option);
                                    //console.log('productionSchedulingArray');
                                    //console.log(productionSchedulingArray);

                                    productionSchedulingTotalArray = productionSchedulingTotalArray.concat(productionSchedulingArray);
                                }

                                if (productionSchedulingTotalArray.length > 0) {
                                    let productionSchedulingUpdate = [];
                                    let productionSchedulingIDArray = productionSchedulingTotalArray.map(value => {
                                        return value.id;
                                    });
                                    console.log('productionSchedulingIDArray');
                                    console.log(productionSchedulingIDArray);

                                    let precedingTeamSchedulingQuery = {query: {cropTeam: teamMember.team/*cropCompleteAmount:{[Op.lt]:query.amount},cropStartDate: {[Op.lte]: updateTime},cropEndDate: {[Op.gte]: updateTime}*/}};
                                    let precedingTeamSchedulingArray = await findAndCount(precedingTeamSchedulingQuery, PrecedingTeamScheduling_1, 0, {order: ['cropEndDate']},{productionScheduling: {[Op.in]: productionSchedulingIDArray}});
                                    console.log('precedingTeamSchedulingArray');
                                    console.log(precedingTeamSchedulingArray);

                                    if (precedingTeamSchedulingArray.length > 0) {

                                        let precedingTeamSchedulingCropArray = precedingTeamSchedulingArray.filter(value => {
                                            if (value.cropCompleteAmount < value.amount)
                                                return true;
                                        });

                                        if(precedingTeamSchedulingCropArray.length === 0){
                                            precedingTeamSchedulingCropArray = precedingTeamSchedulingArray[precedingTeamSchedulingArray.length-1];
                                        }

                                        if (precedingTeamSchedulingCropArray.length > 0) {
                                            let update = {cropCompleteAmount: parseFloat(precedingTeamSchedulingCropArray[0].cropCompleteAmount) + parseFloat(query.amount)};

                                            let precedingTeamSchedulingQuery = {
                                                where: {id: precedingTeamSchedulingCropArray[0].id}
                                            };
                                            let updateres = await PrecedingTeamScheduling_1.PrecedingTeamScheduling.update(update, precedingTeamSchedulingQuery);
                                            if (updateres && Array.isArray(updateres)) {
                                                res.precedingTeamSchedulingUpdateCount += updateres[0];
                                            }

                                            let productionSchedulingQuery = {
                                                where: {id: precedingTeamSchedulingCropArray[0].productionScheduling}
                                            };
                                            updateres = await ProductionScheduling_1.ProductionScheduling.update(update, productionSchedulingQuery);
                                            if (updateres && Array.isArray(updateres)) {
                                                res.productionSchedulingUpdateCount += updateres[0];
                                                productionSchedulingUpdate.push(precedingTeamSchedulingCropArray[0].productionScheduling);
                                            }

                                            let precedingTeamOutputQuery = {query:{precedingTeamScheduling:precedingTeamSchedulingCropArray[0].id}};
                                            let precedingTeamOutputOne = await findOne(precedingTeamOutputQuery,PrecedingTeamOutput_1,0,{raw:true});
                                            //console.log('precedingTeamOutputOne');
                                            //console.log(precedingTeamOutputOne);
                                            if(precedingTeamOutputOne){
                                                let precedingTeamOutputUpdate = {
                                                    date:nowDate,
                                                    cropAmount:parseInt(precedingTeamOutputOne.cropAmount) + parseInt(query.amount)
                                                };

                                                let updateres = await PrecedingTeamOutput_1.PrecedingTeamOutput.update(precedingTeamOutputUpdate,{where:{id:precedingTeamOutputOne.id}});
                                                if (updateres && Array.isArray(updateres)) {
                                                    res.precedingTeamOutputUpdateCount += updateres[0];
                                                }else{
                                                    console.log("PrecedingTeamOutput update Fail");
                                                }
                                            }else{
                                                let updatedoc = {
                                                    precedingTeamScheduling:precedingTeamSchedulingCropArray[0].id,
                                                    date:nowDate,
                                                    cropAmount:query.amount,
                                                    stickAmount:0
                                                };

                                                let prod = new PrecedingTeamOutput_1.PrecedingTeamOutput(updatedoc);
                                                let proddoc = await prod.save();
                                            }
                                        }
                                    }
                                    console.log('productionSchedulingUpdate');
                                    console.log(productionSchedulingUpdate);

                                    for (let y = 0; y < productionSchedulingUpdate.length; y++) {

                                        let cropCard = {
                                            cropPackage: query.cropPackage,
                                            rfid: rfidJson.id,
                                            colorCode: query.colorCode,
                                            bundleNumber: query.bundleNumber,
                                            amount: query.amount,
                                            //createTime:new Date().toISOString(),
                                            createTime: nowDate,
                                            part: null,
                                            worker: null,
                                            return: 0,
                                            productionScheduling: productionSchedulingUpdate[y]
                                        };

                                        let prod = new CropCard_1.CropCard(cropCard);
                                        let proddoc = await prod.save();
                                        if (proddoc && proddoc.id) {
                                            res.cropCardCreateID.push(proddoc.id);
                                        }

                                        let memberOutputQuery = {query:{bundleNumber:query.bundleNumber,productionScheduling:productionSchedulingUpdate[y],step:"裁剪"}};

                                        let memberOutputOne = await findOne(memberOutputQuery,MemberOutput_1,0,{raw:true});
                                        if(memberOutputOne){
                                            let memberOutputUpdatedoc = {
                                                amount:query.amount
                                            };
                                            let updateres = await MemberOutput_1.MemberOutput.update(memberOutputUpdatedoc,{where:{id:memberOutputOne.id}});
                                            if (updateres && Array.isArray(updateres)) {
                                                res.memberOutputUpdateCount += updateres[0];
                                            }else{
                                                console.log("memberOutput update Fail");
                                            }

                                        }else{
                                            let memberOutput = {
                                                productionScheduling: productionSchedulingUpdate[y],
                                                worker: query.member,
                                                team: teamMember.team,
                                                step: "裁剪",
                                                amount: query.amount,
                                                processAmount: query.amount,
                                                pay: null,
                                                date: nowDate,
                                                bundleNumber: query.bundleNumber
                                            };

                                            prod = new MemberOutput_1.MemberOutput(memberOutput);
                                            proddoc = await prod.save();
                                            if (proddoc && proddoc.id) {
                                                res.memberOutputCreateID.push(proddoc.id);
                                            }
                                        }
                                    }
                                }
                                else
                                {
                                    ctx.throw('db.invalidParameters:C9', 400);
                                }
                            }
                            console.log('productionSchedulingTotalArray');
                            console.log(productionSchedulingTotalArray);
                        }
                    }

                    /* Update colorCode to cropRecord */
                    let cropPackageQuery = {query:{id:query.cropPackage}};
                    let cropPackageOne = await findOne(cropPackageQuery,CropPackage_1,0,{raw:true});

                    if(cropPackageOne){
                        let cropRecordQuery = {
                            where:{
                                crop: cropPackageOne.crop,
                                material: cropPackageOne.material
                            }
                        };
                        let update = {colorCode:query.colorCode};
                        let updateres = await CropRecord_1.CropRecord.update(update,cropRecordQuery);
                        if (updateres && Array.isArray(updateres)) {
                            res.cropRecordUpdateCount += updateres[0];
                        }
                    }else {
                        ctx.throw('db.invalidParameters:CA', 400);
                    }
                }

                ctx.body = res;
                ctx.status = 200;
                ctx.respond = true;
            }
            catch (err) {
                console.log(err);
                ctx.throw(err.message, 400);
            }
        }
    });
};
