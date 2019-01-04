"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const dbquery_1 = require("../database/dbquery");
const Sequelize_1 = require("sequelize");
const PurchasePlan_1 = require("../database/models/PurchasePlan");
const MaterialReceiving_1 = require("../database/models/MaterialReceiving");
const Material_1 = require("../database/models/Material");
const Process_1 = require("../database/models/Process");
const Style_1 = require("../database/models/Style");
const Order_1 = require("../database/models/Order");
const OrderDeliveryPlan_1 = require("../database/models/OrderDeliveryPlan");

const Team_1 = require("../database/models/Team");
const TeamMember_1 = require("../database/models/TeamMember");
const UserAccount_1 = require("../database/models/UserAccount");
const AccountRole_1 = require("../database/models/AccountRole");
const ProductionScheduling_1 = require("../database/models/ProductionScheduling");
const Equipment_1 = require("../database/models/Equipment");
const ProductionLine_1 = require("../database/models/ProductionLine");

function DebugOutput(title, content) {
   // console.log(title, content);
}
exports.registerAPI = function (APIRouter) {
    //Test Debug API
    APIRouter.post('/process/orderSearch', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:63', 400);
        }
        else {
            try {

                let query = {
                    attributes: [
                        'processID'
                    ],
                    // [Sequelize_1.fn('DATE', Sequelize_1.col('date')), 'dayDate'],
                    order: [Sequelize_1.fn('CONVERT', Sequelize_1.col('processID'), 'SIGNED')],
                    // order:[Sequelize_1.fn('CAST','processID' AS SIGNED)],
                    raw: true

                }
                let docs = await Process_1.Process.findAndCount(query);
                DebugOutput('docs', docs)
                let resp = {
                    recordsCount: docs.count,
                    records: []
                }
                if (docs && docs.count > 0) {
                    docs.rows.map((item) => {
                        resp.records.push(item.processID);
                    });
                }

                ctx.body = resp;
                ctx.status = 200;
                ctx.respond = true;
            }
            catch (e) {
                console.log(e.message);
                ctx.throw(e.message, 400);
            }
        }
    })
    //查询一个订单下物料，以及每个物料包含的幅宽
    APIRouter.post('/materialReceiving/materialSearch', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:63', 400);
        }
        else {
            try {
                let order = ctx.request.body.order;
                if (!order || order == undefined) {
                    ctx.throw('db.invalidParameters:B1', 400);
                }
                let query = {
                    attributes: [
                        [Sequelize_1.fn('DISTINCT', Sequelize_1.col('MaterialReceiving.material')), 'material']
                    ],
                    include: [
                        {
                            model: PurchasePlan_1.PurchasePlan,
                            attributes: [
                            ],
                            where: {
                                order: order
                            }
                        },
                        {
                            model: Material_1.Material
                        }
                    ],

                    raw: true

                }
                let materialDocs = await MaterialReceiving_1.MaterialReceiving.findAll(query);
                var resp = {
                    recordsCount: 0,
                    records: []
                }
                DebugOutput('materialDocs', materialDocs);
                var recors = [];
                if (materialDocs && materialDocs.length > 0) {
                    resp.recordsCount = materialDocs.length;

                    for (var i = 0; i < materialDocs.length; i++) {
                        var item = materialDocs[i];

                        var querywidth = {
                            attributes: [
                                [Sequelize_1.fn('DISTINCT', Sequelize_1.col('width')), 'width'],
                            ],
                            include: [
                                {
                                    model: PurchasePlan_1.PurchasePlan,
                                    attributes: [
                                    ],
                                    where: {
                                        order: order
                                    }
                                }
                            ],
                            where: {
                                material: item['material'],
                            },
                            raw: true
                        }
                        var record = item;
                        let widthDocs = await MaterialReceiving_1.MaterialReceiving.findAll(querywidth);
                        if (widthDocs && widthDocs.length > 0) {
                            record['widthList'] = [];
                            widthDocs.map((item) => {
                                record.widthList.push(item.width);
                            });
                        }
                        resp.records.push(record);
                    }
                }

                ctx.body = resp;
                ctx.status = 200;
                ctx.respond = true;
            }
            catch (e) {
                console.log(e.message);
                ctx.throw(e.message, 400);
            }
        }
    });
    //模糊搜索订单号
    APIRouter.post('/style/likeSearch', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:63', 400);
        }
        else {
            try {
                let styleIDLike = ctx.request.body.styleIDLike;
                if (!styleIDLike || styleIDLike == undefined) {
                    ctx.throw('db.invalidParameters:B1', 400);
                }
                let query = {
                    attributes: [
                        'styleID'
                    ],
                    where: {
                        styleID: { [Sequelize_1.Op.like]: styleIDLike }
                    },
                    raw: true

                }
                let stylesdocs = await Style_1.Style.findAndCount(query);
                DebugOutput('stylesdocs', stylesdocs)
                let resp = {
                    recordsCount: stylesdocs.count,
                    records: []
                }
                if (stylesdocs && stylesdocs.count > 0) {
                    stylesdocs.rows.map((item) => {
                        resp.records.push(item.styleID);
                    });
                }

                ctx.body = resp;
                ctx.status = 200;
                ctx.respond = true;
            }
            catch (e) {
                console.log(e.message);
                ctx.throw(e.message, 400);
            }
        }
    })
    //查询某款式的排产状态
    APIRouter.post('/style/scheduleStatus', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:63', 400);
        }
        else {
            try {
                let styleID = ctx.request.body.styleID;
                if (!styleID || styleID == undefined) {
                    ctx.throw('db.invalidParameters:B1', 400);
                }
                let resp = {
                    recordsCount: 0,
                    records: []
                }
                let queryODP = {
                    attributes: [
                        'id'
                    ],
                    include: [
                        {
                            model: Order_1.Order,
                            attributes: [
                                'orderID'
                                // 'style'
                            ],
                            where: {
                                style: styleID
                            }
                        }
                    ],
                    raw: true
                }
                let odp_docs = await OrderDeliveryPlan_1.OrderDeliveryPlan.findAll(queryODP);
                DebugOutput('odp_docs', odp_docs)
                let odp_list = [];
                if (odp_docs && odp_docs.length > 0) {
                    odp_docs.map((item) => {
                        odp_list.push(item.id);
                    });
                    let queryPS = {
                        attributes: [
                            'id',
                            'factory',
                            'amount'
                        ],
                        where: {
                            orderDeliveryPlan: odp_list
                        },
                        raw: true
                    }
                    let ps_docs = await ProductionScheduling_1.ProductionScheduling.findAll(queryPS);
                    DebugOutput('ps_docs', ps_docs);
                    if (ps_docs && ps_docs.length > 0) {
                        resp.recordsCount = ps_docs.length;
                        ps_docs.map((item) => {
                            resp.records.push(item);
                        });
                    }
                }




                ctx.body = resp;
                ctx.status = 200;
                ctx.respond = true;
            }
            catch (e) {
                console.log(e.message);
                ctx.throw(e.message, 400);
            }
        }
    })
    //根据订单交期，列出尺码
    APIRouter.post('/order/searchSize', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:63', 400);
        }
        else {
            try {
                let order = ctx.request.body.order;
                let deliveryDate = ctx.request.body.deliveryDate;
                if (!order || order == undefined) {
                    ctx.throw('db.invalidParameters:B1', 400);
                }
                if (!deliveryDate || deliveryDate == undefined) {
                    ctx.throw('db.invalidParameters:B2', 400);
                }
                let query = {
                    attributes: [
                        [Sequelize_1.fn('DISTINCT', Sequelize_1.col('size')), 'size'],
                    ],
                    include: [
                        {
                            model: Order_1.Order,
                            attributes: ["id"],
                            where: {
                                orderID: order,
                                deliveryDate: deliveryDate
                            }
                        }
                    ],

                    raw: true

                }
                let Odpdocs = await OrderDeliveryPlan_1.OrderDeliveryPlan.findAll(query);
                DebugOutput('Odpdocs', Odpdocs)
                let resp = {
                    sizeCount: 0,
                    sizeListStr: ""
                }
                if (Odpdocs && Odpdocs.length > 0) {
                    resp.sizeCount = Odpdocs.length;
                    Odpdocs.map((item) => {
                        // resp.sizeList.push(item.size);
                        resp.sizeListStr += item.size + ","
                    });
                    resp.sizeListStr = resp.sizeListStr.replace(/,$/gi, "")
                }

                ctx.body = resp;
                ctx.status = 200;
                ctx.respond = true;
            }
            catch (e) {
                console.log(e.message);
                ctx.throw(e.message, 400);
            }
        }
    })
    //查询个人基本信息
    APIRouter.post('/user/userAuthority', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:63', 400);
        }
        else {
            try {
                let userID = ctx.request.body.userID;
                let padMAC = ctx.request.body.padMAC;
                if (!userID || userID == undefined) {
                    ctx.throw('db.invalidParameters:B1', 400);
                }
                if (!padMAC || padMAC == undefined) {
                    ctx.throw('db.invalidParameters:B2', 400);
                }
                let queryUser = {
                    attributes: [

                        'username',
                        'cardNumber',
                        'employeeID',
                        'mobilePhone',
                        'admin',


                    ],
                    include: [
                        {
                            // model:Team_1.Team,
                            association: UserAccount_1.UserAccount.hasOne(Team_1.Team, { foreignKey: 'leader' }),
                            attributes: [
                                'name',
                                'category'
                            ]
                        },
                        {
                            //model:TeamMember_1.TeamMember,
                            association: UserAccount_1.UserAccount.hasOne(TeamMember_1.TeamMember, { foreignKey: 'member' }),
                            attributes: [
                                'team'
                            ],
                            include: [
                                {
                                    //model:Team_1.Team
                                    association: TeamMember_1.TeamMember.belongsTo(Team_1.Team, { foreignKey: 'team' }),
                                    attributes: [
                                        'name'
                                    ]
                                }
                            ]
                        }

                    ],
                    where: {
                        id: userID
                    },
                    raw: true
                }
                let docs = await UserAccount_1.UserAccount.findOne(queryUser);
                DebugOutput('user docs', docs)
                let resp = {
                    "userRecord": false,
                    "padRecord": false,
                    "isTeamLeader": false,
                     "isAdmin": false,
                    "isSewTeamLeader": false,
                    "isPadStation": false,
                    "padTeam": "",
                    "username": "",
                    "employeeID": "",
                    "cardNumber": "",
                    "mobilePhone": "",
                    "userTeam": "",
                    "role": ""
                }
                if (docs) {
                    resp.userRecord = true;
                    resp.username = docs.username;
                    // resp.isAdmin = (docs.admin == 1 ? true : false);
                    resp.isTeamLeader = (docs['Team.name'] != null ? true : false);
                    resp.isSewTeamLeader = (docs['Team.category'] == "车缝" ? true : false);
                    resp.employeeID = docs.employeeID;
                    resp.mobilePhone = docs.mobilePhone;
                    resp.cardNumber = docs['cardNumber'];
                    resp.userTeam = docs['TeamMember.Team.name'];
                }

                let queryEquipment = {
                    attributes: [
                        'macAddress',
                        'id'
                    ],
                    include: [
                        {
                            association: Equipment_1.Equipment.hasOne(ProductionLine_1.ProductionLine, { foreignKey: 'pad' }),
                            attributes: [
                                'id',
                                'station',
                                'team'
                            ],
                            include: [
                                {

                                    association: ProductionLine_1.ProductionLine.belongsTo(Team_1.Team, { foreignKey: 'team' }),
                                    attributes: [
                                        'name'
                                    ]
                                }
                            ]
                        }
                    ],
                    where: {
                        macAddress: padMAC
                    },
                    raw: true
                }
                var pad_docs = await Equipment_1.Equipment.findOne(queryEquipment);
                DebugOutput('pad_docs', pad_docs)
                if (pad_docs) {
                    resp.padRecord = true;
                    resp.padTeam = (pad_docs['ProductionLine.Team.name'] == null ? "" : pad_docs['ProductionLine.Team.name']);
                    resp.isPadStation = (pad_docs['ProductionLine.station'] == null ? false : true);
                }

                let queryRole = {
                    attributes: [
                        'role',
                        'account'
                    ],
                    where: {
                        account: userID
                    },
                    raw: true
                }
                var role_docs = await AccountRole_1.AccountRole.findAll(queryRole);
                DebugOutput('role_docs', role_docs)
                if (role_docs&&role_docs.length>0) {
                    var roleStr="";
                    role_docs.map((item) => {
                        roleStr+=item.role+',';
                    });
                    // resp.role=roleStr.substring(0,roleStr.length-1);
                    resp.role=roleStr.replace(/,$/,'');
                    resp.isAdmin=(roleStr.indexOf("管理员")>0)? true:false;
                }

                ctx.body = resp;
                ctx.status = 200;
                ctx.respond = true;
            }
            catch (e) {
                console.log(e.message);
                ctx.throw(e.message, 400);
            }
        }
    })

};
