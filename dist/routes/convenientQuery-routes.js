"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const dbquery_1 = require("../database/dbquery");
const Sequelize_1 = require("sequelize");
const PurchasePlan_1 = require("../database/models/PurchasePlan");
const MaterialReceiving_1 = require("../database/models/MaterialReceiving");
const Material_1 = require("../database/models/Material");

const Style_1 = require("../database/models/Style");
function DebugOutput(title,content){
    //console.log(title,content);
}
exports.registerAPI = function (APIRouter) {

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
                    include:[
                        {
                            model: PurchasePlan_1.PurchasePlan,
                            attributes: [
                            ],
                            where:{
                                order:order
                            }
                        },
                        {
                            model: Material_1.Material
                        }
                    ],

                   raw: true

                }
                let materialDocs = await MaterialReceiving_1.MaterialReceiving.findAll(query);
                var resp={
                    recordsCount:0,
                    records:[]
                }
                DebugOutput('materialDocs',materialDocs);
                var recors=[];
                if (materialDocs && materialDocs.length > 0) {
                    resp.recordsCount=materialDocs.length;
                    
                    for(var i=0;i<materialDocs.length;i++){
                        var item=materialDocs[i];

                        var querywidth={
                            attributes:[
                                [Sequelize_1.fn('DISTINCT', Sequelize_1.col('width')), 'width'],
                            ],
                            include:[
                                {
                                    model: PurchasePlan_1.PurchasePlan,
                                    attributes: [
                                    ],
                                    where:{
                                        order:order
                                    }
                                }
                            ],
                            where:{
                                material:item['material'],
                            },
                            raw: true
                        }
                        var record=item;
                        let widthDocs = await MaterialReceiving_1.MaterialReceiving.findAll(querywidth);
                        if (widthDocs && widthDocs.length > 0) {
                            record['widthList']=[];
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
};
