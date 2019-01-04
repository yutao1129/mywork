"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Crop_1 = require("../database/models/Crop");
const CropCard_1 = require("../database/models/CropCard");
const CropRecord_1 = require("../database/models/CropRecord");
const CropPackage_1 = require("../database/models/CropPackage");
const TeamMember_1 = require("../database/models/TeamMember");
const Order_1 = require("../database/models/Order");
const Style_1 = require("../database/models/Style");
const StylePartCard_1 = require("../database/models/StylePartCard");
const PartCard_1 = require("../database/models/PartCard");
const OrderDeliveryPlan_1 = require("../database/models/OrderDeliveryPlan");
const ColorCode_1 = require("../database/models/ColorCode");
const Material_1 = require("../database/models/Material");
const dbquery_1 = require("../database/dbquery");
const Sequelize_1 = require("sequelize");


exports.registerAPI = function (APIRouter) {
    /**
     * @api {post} /cropRecord/cropRecordBed [裁剪記錄]-统计查詢
     * @apiDescription 查詢符合條件的個人生產紀錄，並將結果分頁回傳
     * @apiGroup Production
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number=7} [userID] 用戶ID
     * @apiParam {String="2018-10-10"} [startDate] 查詢起始日期
     * @apiParam {String="2018-10-12"} [startDate] 查詢結束日期
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/memberOutput/searchSum
     * Body:
     * {
     *	"userID":7,
     *	"startDate":"2018-10-10",
     *	"endDate":"2018-10-12"
     * }
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
    //每个订单交期每床某个Team一条记录
    APIRouter.post('/cropRecordCard/cropRecordBed', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:69', 400);
        }
        else {
            let resp = dbquery_1.queryResponsePacket(ctx.request.body);
            // let query = dbquery_1.queryDBGeneratorEx(ctx.request.body, MemberOutput_1.memberOutputJoin);
            try {

                let userid = ctx.request.body.userID;
                // let orderDeliveryPlan = ctx.request.body.orderDeliveryPlan;
                // let order = ctx.request.body.order;
                if (!userid || userid == undefined) {
                    ctx.throw('db.invalidParameters:B0', 400);
                }
                // if (!order || order == undefined) {
                //     ctx.throw('db.invalidParameters:B2', 400);
                // }
                // if(!orderDeliveryPlan||orderDeliveryPlan==undefined){

                let resp = {
                        message:"UNKNOWN",
                        recordsCount: 0,
                        records: []
                };

                let teamMember = await TeamMember_1.TeamMember.findOne({ attributes: ['team', 'member'], where: { member: userid } });
               

                if (!teamMember || teamMember == undefined) {
                    // ctx.throw('db.invalidParameters:B1', 400);
                    resp.message="NO_TEAM_FOUND"
                }
                else{
                    let team = teamMember.team;
                    let querybed = {
                        attributes: [
                            'id',
                            'part',
                            'bedNumber',
                            'order',
                            [Sequelize_1.fn('DATE', Sequelize_1.col('cropTime')), 'cropDate'],
                            'truss'
    
                        ],
                        order: ['order', 'bedNumber'],
                        include: [
                            {
                                //每一crop对应croprecord的layer加总
                                model: CropRecord_1.CropRecord,
                                attributes: [
                                    [Sequelize_1.fn('SUM', Sequelize_1.col('layer')), 'layerSum'],
                                ]
                               
                            },
                            {
                                model: Order_1.Order,
                                attributes: [
                                    'orderID',
                                    'deliveryDate',
                                    'style'
                                ],
                                include: {
                                    model: Style_1.Style,
                                    attributes: [
                                        'productName'
                                    ],
                                }
                            }
                        ],
                        group: ['order', 'bedNumber'],
    
                        where: {
                            team: team
                        },
                        raw: true
                    }
    
                    let docs = await Crop_1.Crop.findAll(querybed);
                    //console.log('docs', docs);
                 
                    resp.userID = userid;
                    resp.recordsCount = docs.length;
                    if (docs && docs.length > 0) {
                        for (let item of docs) {
                            //统计已制卡数量
                            var queryCard = {
                                attributes: [
                                    [Sequelize_1.fn('COUNT', Sequelize_1.col('rfid')), 'cardCount'],
                                    'amount',
                                    'colorCode'
                                ],
                                include: [
                                    {
                                        model: CropPackage_1.CropPackage,
                                        where: {
                                            crop: item.id
                                        },
                                    },
                                    {
                                        model: ColorCode_1.ColorCode,
                                        attributes: [
                                            'color'
                                        ]
                                    }
                                ],
                               
                                raw: true
                            }
                            var doc_card = await CropCard_1.CropCard.findOne(queryCard);
                            console.log('doc_card', doc_card);
                            var record = {
                                "cropID": item.id,
                                "order": item.order,
                                "orderID": item['orderData.orderID'],
                                "style": item['orderData.style'],
                                "productName": item['orderData.styleData.productName'],
                                "orderDeliveryDate": item['orderData.deliveryDate'],
                                "bedNumber": item.bedNumber,
                                // "truss": item['trussPlanData.budget'],
                                "truss": item.truss,
                                "part": item.part,
                                // "date":item.daysDate,
                                "layerSum": item['cropRecordData.layerSum'],
                                "cropDate": item.cropDate,
                                "cardYesNo": (doc_card['cardCount'] > 0) ? "Yes" : "No",
                                "cardCount": doc_card['cardCount'],
                                "amountPerBundle": doc_card['amount'],
                                "usedColorCode": doc_card['colorCode'],
                                "usedColor": doc_card['colorCodeData.color']
                            }
                            resp.records.push(record);
                        }
    
                    }
                    resp.message="SUCCESS"
                }
                ctx.body = resp;
                ctx.status = 200;
                ctx.respond = true;
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalorderIDQuery:98', 400);
            }
        }
    });

    /**
         * @api {post} /cropRecordCard/cropRecordBed [裁剪記錄]-统计詳情查詢
         * @apiDescription 查詢符合條件的個人生產紀錄，並將結果分頁回傳
         * @apiGroup Production
         * @apiVersion 0.0.1
         * @apiUse jsonHeader
         * @apiParam {Number=7} [userID] 用戶ID
         * @apiParam {String="2018-10-10"} [startDate] 查詢起始日期
         * @apiParam {String="2018-10-12"} [startDate] 查詢結束日期
         * @apiParamExample {json} Request Example
         * URL:
         *   http://{host}/memberOutput/searchSum
         * Body:
         * {
         *	"userID":7,
         *	"startDate":"2018-10-10",
         *	"endDate":"2018-10-12"
         * }
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
    APIRouter.post('/cropRecordCard/cropRecordBedDetail', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:69', 400);
        }
        else {
            let resp = dbquery_1.queryResponsePacket(ctx.request.body);
            // let query = dbquery_1.queryDBGeneratorEx(ctx.request.body, MemberOutput_1.memberOutputJoin);
            try {

                // let userid = ctx.request.body.userID;
                let order = ctx.request.body.order;
                let bedNumber = ctx.request.body.bedNumber;

                if (!bedNumber || bedNumber == undefined) {
                    ctx.throw('db.invalidParameters:B1', 400);
                }
                if (!order || order == undefined) {
                    ctx.throw('db.invalidParameters:B2', 400);
                }



                let querydetail = {
                    attributes: [
                        [Sequelize_1.fn('SUM', Sequelize_1.col('CropRecord.layer')), 'layerSum'],
                        [Sequelize_1.fn('COUNT', Sequelize_1.col('CropRecord.crop')), 'volumeSum'],
                        [Sequelize_1.fn('SUM', Sequelize_1.col('length')), 'lengthSum']
                    ],
                    order: ['material'],
                    include: [
                        {
                            model: Material_1.Material,
                            attributes: [
                                'id',
                                'materialID',
                                'category',
                                'color'
                            ],
                        },
                        {
                            model: ColorCode_1.ColorCode,
                            attributes: [
                                'color'
                            ]
                            // association:CropRecord_1.CropRecord.hasOne(ColorCode_1.ColorCode,{foreignKey:'colorCode',as:'id'}),
                            // attributes: [
                            //     'color'
                            // ]
                        },
                        {
                            model: Crop_1.Crop,
                            attributes: [
                                'id',
                                'bedNumber',
                                'cardType'
                                // 'planCard',
                                // 'perBundleAmount'
                            ],
                            where: {
                                bedNumber: bedNumber,
                                order: order
                            },
                            // include: [
                            //     {
                            //         model: CropPackage_1.CropPackage,

                            //         include: [
                            //             {
                            //                 model: CropCard_1.CropCard,
                            //                 attributes: [
                            //                     [Sequelize_1.fn('MAX', Sequelize_1.col('amount')), 'layerSum'],
                            //                             ]
                            //                 // group:'cropPackage',
                            //                 // include: [
                            //                 //     {
                            //                 //         model: ColorCode_1.ColorCode,
                            //                 //         attributes: [
                            //                 //             'color'
                            //                 //         ]
                            //                 //     }
                            //                 // ]
                            //             }
                            //         ]
                            //     }
                            // ]
                        }
                    ],
                    group: ['material'],

                    raw: true
                }
                let docs = await CropRecord_1.CropRecord.findAll(querydetail);
                console.log('docs', docs);
                let resp = {
                    recordsCount: 0,
                    records: [],
                    colorCode: [],
                    partList: []
                };
                resp.recordsCount = docs.length;
                if (docs && docs.length > 0) {
                    for (let item of docs) {
                        let docs_cropPackage = await CropPackage_1.CropPackage.findAll({ where: { crop: item['cropData.id'], material: item['materialData.id'] } });
                        // console.log('docs_cropPackage', docs_cropPackage);
                        let cropPackageList = [];
                        for (let cpitem of docs_cropPackage) {
                            cropPackageList.push(cpitem.id);
                        }
                        // console.log('cropPackageList', cropPackageList);
                        let docs_preCard = await CropCard_1.CropCard.findOne(
                            {
                                attributes: [
                                    [Sequelize_1.fn('COUNT', Sequelize_1.col('id')), 'preCardSum']
                                ],
                                where: {
                                    cropPackage: cropPackageList,
                                    return:0
                                },
                                raw: true
                            });
                        //console.log('docs_preCard', docs_preCard);

                        var preCardSum = docs_preCard.preCardSum;

                        let docs_planCard = await CropPackage_1.CropPackage.findOne(
                            {
                                attributes: [
                                    [Sequelize_1.fn('SUM', Sequelize_1.col('planCard')), 'planCardSum']
                                ],
                                where: {
                                    crop: item['cropData.id'],
                                    material: item['materialData.id']
                                },
                                raw: true
                            });
                        //console.log('docs_planCard', docs_planCard);
                        var planCardSum = docs_planCard.planCardSum;


                        var record = {
                            "crop": item['cropData.id'],
                            "material": item['materialData.id'],
                            "materialID": item['materialData.materialID'],
                            "matertialCategory": item['materialData.category'],
                            "matertialColor": item['materialData.color'],
                            "layerSum": parseInt(item.layerSum),
                            "volumeSum": parseInt(item.volumeSum),
                            "lengthSum": parseInt(item.lengthSum),
                            "cardType": item['cropData.cardType'],
                            // "color": item['cropData.cropPackageData.cropCardData.colorCodeData.color'],
                            "color": item['colorCodeData.color'],
                            "cropPackage": docs_cropPackage,
                            'planCard': planCardSum,
                            'preCard': preCardSum
                        }
                        //console.log('record',record)
                        resp.records.push(record);
                    }
                }
                let queryTruss = {
                    attributes: [
                        'truss'
                    ],

                    where: {
                        order: order,
                        bedNumber: bedNumber
                    },
                    raw: true
                }
                let docs_truss = await Crop_1.Crop.findOne(queryTruss);
             //   console.log('docs_truss', docs_truss)
                if (docs_truss) {


                    var trussSizeList = [];
                    var trussJson = JSON.parse(docs_truss.truss)
                    for (var key in trussJson) {
                        trussSizeList.push(key)
                    }
                    let queryColor = {
                        attributes: [
                            [Sequelize_1.fn('DISTINCT', Sequelize_1.col('colorCode')), 'colorCode']
                        ],
                        include: {
                            model: ColorCode_1.ColorCode,
                            attributes: [
                                'code',
                                'color'
                            ]
                        },
                        where: {
                            order: order,
                            size: trussSizeList
                        },
                        raw: true
                    }
                    let docs_color = await OrderDeliveryPlan_1.OrderDeliveryPlan.findAll(queryColor);
                   // console.log('docs_color', docs_color)
                    if (docs_color && docs_color.length > 0) {
                        for (let item of docs_color) {

                            let querySize = {
                                attributes: [
                                    [Sequelize_1.fn('DISTINCT', Sequelize_1.col('size')), 'size']
                                ],
                                where: {
                                    order: order,
                                    colorCode: item['colorCode']
                                },
                                raw: true
                            }
                            //找到此颜色的所有尺码
                            let docs_size = await OrderDeliveryPlan_1.OrderDeliveryPlan.findAll(querySize);
                           // console.log('docs_size', docs_size)
                            var sizeJson = {};
                            if (docs_size && docs_size.length > 0) {
                                docs_size.map((item) => {
                                    sizeJson[item.size] = true;
                                });
                            }
                            var s = 0;
                            for (s = 0; s < trussSizeList.length; s++) {
                                if (sizeJson[trussSizeList[s]] != true) {
                                    break;
                                }
                            }
                            if (s >= trussSizeList.length)  //循环未提前退出，唛架中所有Size都包含此颜色
                            {
                                resp.colorCode.push(
                                    {
                                        colorCode: item['colorCode'],
                                        code: item['colorCodeData.code'],
                                        color: item['colorCodeData.color']
                                    }
                                )
                            }

                        }
                    }
                }

                let queryPart = {
                    attributes: [
                        // [Sequelize_1.fn('DISTINCT', Sequelize_1.col('colorCode')), 'colorCode']
                        'id'
                    ],
                    include: {
                        model: Style_1.Style,
                        attributes: [
                            'styleID'
                        ],
                        include: {
                            model: StylePartCard_1.StylePartCard,
                            attributes: [
                                'partCard'
                            ],
                            include: {
                                model: PartCard_1.PartCard,
                                attributes: [
                                    'id',
                                    'part'
                                    // [Sequelize_1.fn('DISTINCT', Sequelize_1.col('part')), 'part']
                                ]
                            }
                        }
                    },
                    where: {
                        id: order
                    },
                    group: 'part',
                    raw: true
                }

                let docs_part = await Order_1.Order.findAll(queryPart);
               // console.log('docs_part', docs_part)
                if (docs_part && docs_part.length > 0) {
                    for (let item of docs_part) {
                        if (item['styleData.stylePartCardData.partCardData.id'] != null) {
                            resp.partList.push(
                                {
                                    id: item['styleData.stylePartCardData.partCardData.id'],
                                    part: item['styleData.stylePartCardData.partCardData.part']
                                }
                            )
                        }

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


    APIRouter.post('/cropRecordCard/cropRecordCard', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:69', 400);
        }
        else {
            let resp = dbquery_1.queryResponsePacket(ctx.request.body);
            // let query = dbquery_1.queryDBGeneratorEx(ctx.request.body, MemberOutput_1.memberOutputJoin);
            try {

                // let userid = ctx.request.body.userID;
                let order = ctx.request.body.order;
                let bedNumber = ctx.request.body.bedNumber;
                let material = ctx.request.body.material
                // if (!userid || userid == undefined) {
                //     ctx.throw('db.invalidParameters:B0', 400);
                // }
                if (!bedNumber || bedNumber == undefined) {
                    ctx.throw('db.invalidParameters:B1', 400);
                }
                if (!order || order == undefined) {
                    ctx.throw('db.invalidParameters:B2', 400);
                }
                if (!material || material == undefined) {
                    ctx.throw('db.invalidParameters:B3', 400);
                }
                let queryorder = {
                    attributes: [
                        'orderID',
                        'style',
                        'deliveryDate'
                    ],
                    include: [
                        {
                            model: Style_1.Style,
                            attributes: [
                                'productName'
                            ]
                        }
                    ],
                    raw: true
                }
                let docs_order = await Order_1.Order.findOne(queryorder);
                console.log('docs_order', docs_order);

                let querycards = {
                    attributes: [
                        'rfid',
                        'part',
                        'bundleNumber'
                    ],
                    include: [
                        {
                            model: CropPackage_1.CropPackage,
                            attributes: [
                                'size',
                                'packageNumber'
                            ],
                            include: [
                                {
                                    model: Crop_1.Crop,
                                    attributes: [
                                        'bedNumber'
                                    ],
                                }
                            ]
                        },
                        {
                            model: ColorCode_1.ColorCode,
                            attributes: [
                                'color'
                            ]
                        },
                    ],
                    // group: ['cropPackage'],
                    where: {
                        //   rfid:null

                    },
                    raw: true
                }
                let docs = await CropCard_1.CropCard.findAll(querycards);
                console.log('docs', docs);
                let resp = {
                    productInfo: [],
                    recordsCount: 0,
                    records: []
                };
                resp.recordsCount = docs.length;
                if (docs && docs.length > 0) {
                    for (let item of docs) {
                        var record = {
                            "bedNumber": item['cropPackageData.cropData.bedNumber'],
                            "packageNumber": item['cropPackageData.packageNumber'],
                            "bundleNumber": item['bundleNumber'],
                            "color": item['colorCodeData.color'],
                            "size": item['cropPackageData.size'],
                            "part": item.part,
                            "rfid": item.rfid,

                        }
                        resp.records.push(record);
                    }

                }

                // console.log('resp', resp);
                ctx.body = resp;
                ctx.status = 200;
                ctx.respond = true;
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalorderIDQuery:98', 400);
            }
        }
    });

    APIRouter.post('/cropRecordCard/deleteCrop', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:69', 400);
        }
        else {
            let resp = dbquery_1.queryResponsePacket(ctx.request.body);
            // let query = dbquery_1.queryDBGeneratorEx(ctx.request.body, MemberOutput_1.memberOutputJoin);
            try {

                let cropID = ctx.request.body.cropID;
                if (!cropID || cropID == undefined) {
                    ctx.throw('db.invalidParameters:B0', 400);
                }
                let resp = {
                    success: false,
                    message: "Unknown"
                };
                var queryCrop = {
                    where: {
                        id: cropID
                    }
                }
                var crop_docs = await Crop_1.Crop.findAndCount(queryCrop);
                if (crop_docs.count == 0) {
                    resp.success = false,
                        resp.message = "No Crop Data"
                }
                else {
                    var queryCard = {
                        attributes: [
                            [Sequelize_1.fn('COUNT', Sequelize_1.col('rfid')), 'cardCount'],
                        ],
                        include: [
                            {
                                model: CropPackage_1.CropPackage,
                                where: {
                                    crop: cropID
                                },
                            }
                        ],
                        raw: true
                    }
                    var doc_card = await CropCard_1.CropCard.findOne(queryCard);
                    if (doc_card.cardCount > 0) {
                        resp.success = false;
                        resp.message = "Card Already Exist"
                    }
                    else {
                        var delCropPackage = {
                            where: {
                                crop: cropID
                            }
                        }
                        var delCropPackageCount = await CropPackage_1.CropPackage.destroy(delCropPackage);
                        var delCropRecord = {
                            where: {
                                crop: cropID
                            }
                        }
                        var delCropRecordCount = await CropRecord_1.CropRecord.destroy(delCropRecord);
                        var delCrop = {
                            where: {
                                id: cropID
                            }
                        }
                        var delCropCount = await Crop_1.Crop.destroy(delCrop);

                        if (delCropPackageCount >= 0 && delCropRecordCount >= 0 && delCropCount > 0) {
                            resp.success = true;
                            resp.message = "OK"
                        }
                        else {
                            resp.success = false;
                            resp.message = "Delete Error"
                        }
                    }
                }
                //console.log('resp', resp);
                ctx.body = resp;
                ctx.status = 200;
                ctx.respond = true;
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalorderIDQuery:98', 400);
            }
        }
    });

};
