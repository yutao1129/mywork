"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Station_1 = require("../database/models/Station");
const ProductionLine_1 = require("../database/models/ProductionLine");
const StationEquipment_1 = require("../database/models/StationEquipment");
const dbquery_1 = require("../database/dbquery");
exports.registerNewStationThenProductionLineComplexAPI = function (NewStationThenProductionLineComplexRouter) {

    NewStationThenProductionLineComplexRouter.post('/NewStationThenProductionLineComplex', async (ctx) => {

        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:127', 400);
        }else{
            try {
                let res = {
                    station_id:null,
                    productionLine_id:null
                };

                let query = ctx.request.body.query;

                let stationID = query.stationID;
                let operator = query.operator;
                let team = query.team;
                let equipment = query.equipment;
                let pad = query.pad;

                if (!stationID || stationID == undefined) {
                    ctx.throw('api.stationIDIsEmpty', 400);
                }

                if (!team || team == undefined) {
                    ctx.throw('api.teamIsEmpty', 400);
                }

                let stationNew =  operator? {stationID:stationID,operator:operator}:{stationID:stationID};

                let station = new Station_1.Station(stationNew);
                let stationData = await station.save();
                if (stationData && stationData.id) {
                    res.station_id = stationData.id;
                    let productionLineNew = {team:team,station:stationData.id};
                    if(equipment){
                        productionLineNew =  Object.assign(productionLineNew,{equipment:equipment});

                        let stationEquipment = new StationEquipment_1.StationEquipment({station:stationData.id,equipment:equipment});
                        let stationEquipmentData = await stationEquipment.save();
                        if (stationEquipmentData && stationEquipmentData.id) {
                            res.stationEquipment_id = stationEquipmentData.id
                        }
                        else {
                            ctx.throw('db.stationEquipmentCreateFail:142', 400);
                        }

                    }
                    if(pad){
                        productionLineNew =  Object.assign(productionLineNew,{pad:pad});
                    }
                    let prodOut = new ProductionLine_1.ProductionLine(productionLineNew);
                    let prodOutData = await prodOut.save();
                    if (prodOutData && prodOutData.id) {
                        res.productionLine_id = prodOutData.id;
                    }
                    else {
                        ctx.throw('db.productionLineCreateFail', 400);
                    }
                    
                }
                else {
                    ctx.throw('db.stationCreateFail', 400);
                }

                ctx.body = res;
                ctx.status = 200;
                ctx.respond = true;

            }
            catch (e) {
                console.log(e);
                ctx.throw(e.message, 400);
            }
        }

    })


}