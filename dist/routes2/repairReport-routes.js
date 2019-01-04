"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const UserAccount_1 = require("../database/models/UserAccount");
const Factory_1 = require("../database/models/Factory");
const Team_1 = require("../database/models/Team");
const TeamMember_1 = require("../database/models/TeamMember");
const Repair_1 = require("../database/models/Repair");
const Station_1 = require("../database/models/Station");
const Equipment_1 = require("../database/models/Equipment");
const StationEquipment_1 = require("../database/models/StationEquipment");
const dbquery_1 = require("../database/dbquery");
const Sequelize_1 = require("sequelize");

exports.registerRepairReportAPI = function (repairReportAPIRouter) {

    repairReportAPIRouter.post('/repairReport/search', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:63', 400);
        }
        else {
            let resp = dbquery_1.queryResponsePacket(ctx.request.body);
            try {
                let query = dbquery_1.queryDBGenerator(ctx.request.body);
              
                let queryRepairInclude=[
                        {
                            model: Equipment_1.Equipment, as: "equipmentData",
                            attributes:
                                [
                                    'equipmentID',
                                    'name'
                                ]
                                ,
                            include:[
                                {
                                //model: StationEquipment_1.StationEquipment,
                                association:Equipment_1.Equipment.hasOne(StationEquipment_1.StationEquipment,{foreignKey:'equipment'}),
                                attributes:
                                    [
                                        'equipment',
                                        'station'
                                    ]
                                    ,
                                    include: [
                                        {
                                            model:Station_1.Station, as:"stationData",
                                            attributes:[
                                                'stationID'
          
                                            ]
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            model: Factory_1.Factory, as: "factoryData",
                            attributes:
                                [
                                    'name',
                                    'factoryID',
                                ]
                        },
                        {
                            model: Team_1.Team, as: "teamData",
                            attributes:
                                [
                                    'name',
                                    'teamID',
                                ]
                        },
                        {
                            model: UserAccount_1.UserAccount, as: "repoterData",
                            foreignKey:"repoter",
                            attributes: 
                            [
                                'chineseName',
                                'employeeID'
                            ],
                        },
                        {
                            model: UserAccount_1.UserAccount, as: "receiverData",
                            foreignKey:"receiver",
                            attributes: 
                            [
                                'chineseName',
                                'employeeID'
                            ],
                        }
                    ]
                
                query['include']=queryRepairInclude;
                query['raw'] = true;
                let repairInfo = await Repair_1.Repair.findAndCount(query);
                //console.log('repairInfo', repairInfo)
                let count = repairInfo.count;
                if (0 === count) {
                    resp.totalPage = 0;
                }
                else if (resp.maxRows > 0) {
                    resp.totalPage = Math.ceil(count / resp.maxRows);
                }
                else {
                    resp.totalPage = 1;
                }
                if (repairInfo && repairInfo.rows) {
                    for (let item of repairInfo.rows) {
                        var record = {
                            "id": item['id'],
                            "factoryName": item['factoryData.name'],
                            "teamName": item['teamData.name'],
                            "stationID": item['equipmentData.StationEquipment.stationData.stationID'],
                            "status": item['status'],
                            "receiverName": item['receiverData.chineseName'],
                            "date": item['date'],
                            "equipmentName": item['equipmentData.name'],
                            "type": item['type'],
                            "reporterName": item['repoterData.chineseName']
                        }
                        resp.records.push(record);

                    }
                }

                ctx.body = resp;
                ctx.status = 200;
                ctx.respond = true;
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalrepairIDQuery:93,error:' + err.toString(), 400);
            }
        }
    });

    repairReportAPIRouter.post('/repairReport/findOrCreate', async (ctx) => {
        

        try {
            let updateData=ctx.request.body;
            let stationEquipment=await StationEquipment_1.StationEquipment.findOne({where:{station:updateData.station}})
            console.log('stationEquipment',stationEquipment)
            if(stationEquipment==null){
                ctx.throw('db.notFoundStationEquipment:FE', 400);
            }
            let query={
                "type":updateData.type,
                "repoter":updateData.repoter,
                "equipment":stationEquipment.equipment,
                "team":updateData.team,
                "factory":updateData.factory,
                "status":0
            }

            updateData['date']=new Date();
            updateData['status']=0;

            let repairDoc = await Repair_1.Repair.findOrCreate({ where: query, defaults: updateData });
            console.log('repairDoc',repairDoc)
            let resp = {};

            if (repairDoc && (repairDoc[1] === false)) {
                //find
                resp["result"]="exist";
                resp["record"]=repairDoc[0].dataValues;
            }
            else  if (repairDoc && (repairDoc[1] === true)) {
                resp["result"]="created"
                resp["record"]=repairDoc[0].dataValues;
            }
           
            ctx.body = resp;
            ctx.status = 200;
            ctx.respond = true;
           
        }
        catch (err) {
            console.log(err);
            ctx.throw('db.invalidParameters:157,error:'+err.toString(), 400);
        }

    });

}
