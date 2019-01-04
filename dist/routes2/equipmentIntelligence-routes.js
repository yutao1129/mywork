"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const UserAccount_1 = require("../database/models/UserAccount");
const EquipmentIntelligence_1 = require("../database/models/EquipmentIntelligence");
const StationEquipment_1 = require("../database/models/StationEquipment")
const Equipment_1 = require("../database/models/Equipment");
const Station_1 = require("../database/models/Station");

const Team_1 = require("../database/models/Team");
const ProductionLine_1 = require("../database/models/ProductionLine");

const dbquery_1 = require("../database/dbquery");
const sequelize = require("sequelize")
exports.registerEquipmentIntelligenceAPI = function (EquipmentIntelligenceRouter) {
    /**
     * @api {post} /equipmentIntelligence/search [設備情報]-查詢
     * @apiDescription 查詢符合條件的設備情報，並將結果分頁回傳
     * @apiGroup Knowledge Base
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number=0} [pageIndex] 頁碼
     * @apiParam {Number=100} [maxRows] 每一頁的最大筆數
     * @apiParam {Object} [sort] 將結果指定欄位排序。1是從小到大排序，-1是從大到小。可指定的欄位請參考: <a href="#equipmentIntelligence">設備情報欄位定義</a> <p> 例如根據<code>equipmentID</code>從小到大排序就是：<code>{"equipmentID":1}</code>
     * @apiParam {Object} [query] 查詢條件。可以指定欄位等於某個值，或是介於某個範圍。範圍用<code>[大於某值，小於某值]</code>來描述，範圍中的兩個值其中之一，可以設定為<code>null</code>，表示不指定，但不能兩者皆為<code>null</code><p> 例如想指定<code>equipmentID</code>大於1000的設備情報就是：<code>{"equipmentID": [1000, null]}</code>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/equipmentIntelligence/search
     * Body:
     * {
     *   "pageIndex": 0,
     *   "maxRows": 3,
     *   "sort": {
     *     "id": 1
     *   },
     *   "query": {
     *      "employeeID": "123456789"
     *   }
     * }
     * @apiSuccess (Success 200) {Number} pageIndex 目前的頁碼
     * @apiSuccess (Success 200) {Number} maxRows 每一頁的最大筆數
     * @apiSuccess (Success 200) {Number} totalPage 總頁數
     * @apiSuccess (Success 200) {Array} records 查詢的結果。各欄位定義請參考: <a href="#equipmentIntelligence">設備情報欄位定義</a>
     * @apiSuccessExample {json} Response Example
     * {
     *   "pageIndex": 1,
     *   "maxRows": 100,
     *   "totalPage": 2,
     *   "records": [{
     *     "mac": 123456789,
     *     "powerOnTime": "2018-11-11 11:11:11",
     *     ...
     *     },
     *     ...
     *   ]
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    EquipmentIntelligenceRouter.post('/equipmentIntelligence/searchByUserPad', async (ctx) => {

        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:59', 400);
        }
        else {
            try {
                let resp = {
                    "success": false,
                    "isLeader": false,
                    "records": []
                };
                let userID = ctx.request.body.userID;
                let padMAC = ctx.request.body.padMAC;
                if (!userID || userID == undefined) {
                    ctx.throw('db.invalidParameters:B1', 400);
                }
                if (!padMAC || padMAC == undefined) {
                    ctx.throw('db.invalidParameters:B2', 400);
                }
                let queryTeam = {
                    attributes: [
                        ['id', 'teamid'],
                        ['name', 'teamName'],
                    ],
                    where: {
                        leader: userID
                    },
                    raw: true
                }
                // let timeTodayStart = new Date(new Date(new Date().toLocaleDateString()).getTime());
                //console.log('timeTodayStart', timeTodayStart)
                let team_docs = await Team_1.Team.findAll(queryTeam);
                if (team_docs && team_docs.length > 0) {
                    resp.isLeader = true;
                    //Leader
                    for (var i = 0; i < team_docs.length; i++) {
                        // resp['records']['teamName']
                        var item = team_docs[i];
                        var teamRecord = {};
                        teamRecord['teamName'] = item['teamName'];
                        teamRecord['equipmentRecords'] = [];
                        //"updateTime": "",
                        //         "mac": "",
                        //         "powerOnTime": "",
                        //         "workingStartTime": "",
                        //         "workingTimeSpan": 0,
                        //         "powerOnTimeSpan": 0,
                        //         "utilizationRate": 0,
                        //         "revolutionSpeed": 0,

                        let SqlCmd = 'SELECT EQI.updateTime,' +
                            ' PL.*,' +
                            ' EQ.id as id, EQ.name as name, ST.stationID as stationID, ' +
                            ' EQI.mac as mac,EQI.powerOnTime as powerOnTime,EQI.workingStartTime as workingStartTime,EQI.workingTimeSpan as workingTimeSpan,' +
                            ' EQI.powerOnTimeSpan as powerOnTimeSpan,EQI.utilizationRate as utilizationRate,EQI.revolutionSpeed as revolutionSpeed,EQI.status as status ' +
                            ' FROM Equipment AS EQ ' +
                            ' LEFT JOIN (SELECT * FROM  EquipmentIntelligence WHERE DATE(updateTime)=DATE(NOW()) GROUP BY mac) as EQI ON EQI.mac=EQ.macAddress' +
                            ' LEFT JOIN ProductionLine as PL ON PL.equipment=EQ.id ' +
                            ' LEFT JOIN Station as ST ON ST.id=PL.station ' +
                            ' WHERE EQ.team=? AND PL.station IS NOT NULL AND (EQ.category IS NULL OR EQ.category!="PAD")'
                        ' GROUP BY EQ.id';
                        let args = [];
                        args.push(item['teamid']);
                        // args.push(timeSpan);
                        let eqi_docs = await Equipment_1.Equipment.sequelize.query({
                            query: SqlCmd,
                            values: args,
                            type: sequelize.QueryTypes.SELECT
                        });
                        //console.log('eqi_docs', eqi_docs)
                        if (eqi_docs && eqi_docs.length > 0) {
                            // teamRecord['equipmentRecords'] = eqi_docs[0];

                            for (var e = 0; e < eqi_docs[0].length; e++) {
                                var equip = eqi_docs[0][e];
                                var record_equip = {
                                    "equipment_id": -1,
                                    "name": "",
                                    "stationID": "",
                                    "updateTime": "",
                                    "mac": "",
                                    "powerOnTime": "",
                                    "workingStartTime": "",
                                    "workingTimeSpan": 0,
                                    "powerOnTimeSpan": 0,
                                    "utilizationRate": 0,
                                    "revolutionSpeed": 0,
                                    "status": -1,
                                    "chineseName": "",
                                    "employeeID": ""
                                };
                                if (equip.id != null) {
                                    record_equip['equipment_id'] = equip['id'];
                                    record_equip['name'] = equip['name'];
                                    record_equip['stationID'] = equip['stationID'];
                                    if (equip['mac'] != null) {
                                        record_equip['updateTime'] = equip['updateTime'];
                                        record_equip['mac'] = equip['mac'];
                                        record_equip['powerOnTime'] = equip['powerOnTime'];
                                        record_equip['workingStartTime'] = equip['workingStartTime'];
                                        record_equip['workingTimeSpan'] = equip['workingTimeSpan'];
                                        record_equip['powerOnTimeSpan'] = equip['powerOnTimeSpan'];
                                        record_equip['utilizationRate'] = equip['utilizationRate'];
                                        record_equip['revolutionSpeed'] = equip['revolutionSpeed'];
                                        record_equip['status'] = equip['status'];
                                    }
                                    teamRecord['equipmentRecords'].push(record_equip);

                                }
                            }
                        }
                        resp['records'].push(teamRecord);
                        //For 多组Debug
                        // resp['records'].push(teamRecord);
                        // resp['records'].push(teamRecord);
                    }
                    resp.success = true;
                }
                else {
                    resp.isLeader = false;
                    //Not leader
                    let SqlPL = 'SELECT ' +
                        'PL.station as stationid,TE.name as teamName,PL.equipment as equipment ' +
                        'FROM ProductionLine AS PL ' +
                        'LEFT JOIN Equipment as EQ ON EQ.id=PL.pad ' +
                        'LEFT JOIN Team as TE ON TE.id= PL.team ' +
                        'WHERE EQ.macAddress=? ';

                    let argsPL = [];
                    argsPL.push(padMAC);
                    //首先根据padMAC查询 设备id--equipment
                    let station_docs = await ProductionLine_1.ProductionLine.sequelize.query({
                        query: SqlPL,
                        values: argsPL,
                        type: sequelize.QueryTypes.SELECT
                    });
                    //console.log('station_docs', station_docs)
                    if (station_docs && station_docs.length > 0) {
                        if (station_docs[0].length > 0 && station_docs[0][0].equipment != undefined) {
                            var item = station_docs[0][0];

                            var teamRecord = {};
                            teamRecord['teamName'] = item['teamName'];
                            teamRecord['equipmentRecords'] = [];

                            let SqlCmd = 'SELECT EQ.id, EQI.updateTime as updateTime,' +
                                ' PL.*,' +
                                ' EQ.id as id, EQ.name as name, ST.stationID as stationID,' +
                                ' EQI.mac as mac,EQI.powerOnTime as powerOnTime,EQI.workingStartTime as workingStartTime,EQI.workingTimeSpan as workingTimeSpan,' +
                                ' EQI.powerOnTimeSpan as powerOnTimeSpan,EQI.utilizationRate as utilizationRate,EQI.revolutionSpeed as revolutionSpeed,EQI.status as status  ' +
                                ' FROM Equipment AS EQ ' +
                                ' LEFT JOIN (SELECT * FROM  EquipmentIntelligence WHERE DATE(updateTime)=DATE(NOW()) GROUP BY mac) as EQI ON EQI.mac=EQ.macAddress' +
                                ' LEFT JOIN ProductionLine as PL ON PL.equipment=EQ.id ' +
                                ' LEFT JOIN Station as ST ON ST.id=PL.station ' +
                                ' WHERE EQ.id=? AND PL.station IS NOT NULL AND (EQ.category IS NULL OR EQ.category!="PAD")';


                            let args = [];
                            args.push(item['equipment']);
                            // args.push(timeSpan);
                            let eqi_docs = await Equipment_1.Equipment.sequelize.query({
                                query: SqlCmd,
                                values: args,
                                type: sequelize.QueryTypes.SELECT
                            });
                            //console.log('eqi_docs', eqi_docs)
                            if (eqi_docs && eqi_docs.length > 0) {
                                // teamRecord['equipmentRecords'] = eqi_docs[0];

                                for (var e = 0; e < eqi_docs[0].length; e++) {
                                    var equip = eqi_docs[0][e];
                                    var record_equip = {
                                        "equipment_id": -1,
                                        "name": "",
                                        "stationID": "",
                                        "updateTime": "",
                                        "mac": "",
                                        "powerOnTime": "",
                                        "workingStartTime": "",
                                        "workingTimeSpan": 0,
                                        "powerOnTimeSpan": 0,
                                        "utilizationRate": 0,
                                        "revolutionSpeed": 0,
                                        "status": -1,
                                        "chineseName": "",
                                        "employeeID": ""
                                    };
                                    if (equip.id != null) {
                                        record_equip['equipment_id'] = equip['id'];
                                        record_equip['name'] = equip['name'];
                                        record_equip['stationID'] = equip['stationID'];
                                        if (equip['mac'] != null) {
                                            record_equip['updateTime'] = equip['updateTime'];
                                            record_equip['mac'] = equip['mac'];
                                            record_equip['powerOnTime'] = equip['powerOnTime'];
                                            record_equip['workingStartTime'] = equip['workingStartTime'];
                                            record_equip['workingTimeSpan'] = equip['workingTimeSpan'];
                                            record_equip['powerOnTimeSpan'] = equip['powerOnTimeSpan'];
                                            record_equip['utilizationRate'] = equip['utilizationRate'];
                                            record_equip['revolutionSpeed'] = equip['revolutionSpeed'];
                                            record_equip['status'] = equip['status'];
                                        }
                                        teamRecord['equipmentRecords'].push(record_equip);
                                    }
                                }
                                resp['records'].push(teamRecord);
                            }
                            resp.success = true;
                        }

                    }
                }

                ctx.body = JSON.stringify(resp);
                ctx.status = 200;
                ctx.respond = true;
                //console.log("ctx:", ctx)
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidQuery:89,error:' + err.toString(), 400);
            }
        }
    });

    EquipmentIntelligenceRouter.post('/equipmentIntelligence/searchByEquipment', async (ctx) => {

        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:59', 400);
        }
        else {
            try {
                let resp = {
                    "success": false,
                    "records": []
                };
                let equipmentMAC = ctx.request.body.equipmentMAC;
                if (!equipmentMAC || equipmentMAC == undefined) {
                    ctx.throw('db.invalidParameters:B2', 400);
                }
                let queryEquipment = {

                    where: {
                        mac: equipmentMAC,
                        updateTime: {
                            [sequelize.Op.and]:
                                [
                                    { [sequelize.Op.gte]: (new Date()).toISOString().slice(0, 11) + '00:00:00.000Z' },
                                    { [sequelize.Op.lte]: (new Date()).toISOString().slice(0, 11) + '23:59:59.000Z' }
                                ]
                        }
                    },
                    raw: true
                }

                let ei_docs = await EquipmentIntelligence_1.EquipmentIntelligence.findOne(queryEquipment);
                //console.log('ei_docs',ei_docs);
                if (ei_docs) {
                    resp.success = true;
                    resp.records.push(ei_docs);
                }

                ctx.body = JSON.stringify(resp);
                ctx.status = 200;
                ctx.respond = true;
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidQuery:89,error:' + err.toString(), 400);
            }
        }
    });
    EquipmentIntelligenceRouter.post('/equipmentIntelligence/search', async (ctx) => {

        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:59', 400);
        }
        else {
            let resp = dbquery_1.queryResponsePacket(ctx.request.body);
            // let countQuery = dbquery_1.queryTotalCount(ctx.request.body);
            let query = dbquery_1.queryDBGenerator(ctx.request.body);

            try {
                let user = await UserAccount_1.UserAccount.findOne(query);
                //console.log('user', user)
                if (!user) {
                    ctx.throw('api.notFoundEmploy:A0', 400);
                }
                var userList = [];
                var includeTeam = [{
                    model: Team_1.Team,
                    where: { leader: user.id },
                }];
                let teamMembers = await TeamMember_1.TeamMember.findAll({ include: includeTeam });
                //console.log('teamMembers', teamMembers)
                if (teamMembers.length > 0) {
                    for (let member of teamMembers) {
                        let teamuser = await UserAccount_1.UserAccount.findOne({ where: { id: member.member } });
                        userList.push(teamuser);
                    }
                }
                else { //普通员工
                    userList.push(user);
                }

                for (let userinfo of userList) {
                    //console.log('user', user)
                    var record =
                    {
                        // "id": 0,
                        "updateTime": "",
                        "mac": "",
                        "powerOnTime": "",
                        "workingStartTime": "",
                        "workingTimeSpan": 0,
                        "powerOnTimeSpan": 0,
                        "utilizationRate": 0,
                        "revolutionSpeed": 0,
                        "status": -1,
                        "chineseName": userinfo.chineseName,
                        "stationID": "",
                        "employeeID": userinfo.employeeID
                    };



                    var includeStation = [{
                        model: Station_1.Station,
                        where: { operator: userinfo.id },
                    }];
                    let stationEquipment = await StationEquipment_1.StationEquipment.findOne({ include: includeStation });
                    //console.log('stationEquipments', stationEquipment)
                    if (stationEquipment == null) {
                        resp.records.push(record);
                        continue;
                    }
                    else {
                        record.stationID = stationEquipment.stationData.stationID;
                    }
                    let equipment = await Equipment_1.Equipment.findOne({ where: { id: stationEquipment.equipment } });
                    //console.log('equipments', equipment)
                    if (equipment == null) {
                        resp.records.push(record);
                        continue;
                    }
                    record.mac = equipment.macAddress;
                    var queryEI = { mac: equipment.macAddress };
                    queryEI.updateTime = { [sequelize.Op.and]: [{ [sequelize.Op.gte]: (new Date()).toISOString().slice(0, 11) + '00:00:00.000Z' }, { [sequelize.Op.lte]: (new Date()).toISOString().slice(0, 11) + '23:59:59.000Z' }] };
                    let equipmentIntelligence = await EquipmentIntelligence_1.EquipmentIntelligence.findOne({ where: queryEI });
                    //console.log("equipmentIntelligence", equipmentIntelligence)
                    if (equipmentIntelligence == null) {
                        resp.records.push(record);
                        continue;
                    }
                    else {
                        // record.id=equipmentIntelligence.id;
                        record.updateTime = equipmentIntelligence.updateTime;
                        // record.mac=equipmentIntelligence.mac;
                        record.powerOnTime = equipmentIntelligence.powerOnTime;
                        record.workingStartTime = equipmentIntelligence.workingStartTime;
                        record.workingTimeSpan = equipmentIntelligence.workingTimeSpan;
                        record.powerOnTimeSpan = equipmentIntelligence.powerOnTimeSpan;
                        record.utilizationRate = equipmentIntelligence.utilizationRate;
                        record.revolutionSpeed = equipmentIntelligence.revolutionSpeed;
                        record.status = equipmentIntelligence.status;
                        resp.records.push(record);
                    }

                }

                let count = resp.records.length;
                if (0 === count) {
                    resp.totalPage = 0;
                }
                else if (resp.maxRows > 0) {
                    resp.totalPage = Math.ceil(count / resp.maxRows);
                }
                else {
                    resp.totalPage = 1;
                }

                ctx.body = JSON.stringify(resp);
                ctx.status = 200;
                ctx.respond = true;
                console.log("ctx:", ctx)
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidQuery:89', 400);
            }
        }
    });
    /**
     * @api {post} /equipmentIntelligence [設備情報]-新增
     * @apiDescription 新增設備情報
     * @apiGroup Knowledge Base
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {String} updateTime 設備情報更新时间
     * @apiParam {String} max 設備MAC Address
     * @apiParam {Mix} [others] 其他欄位，請參考: <a href="#equipmentIntelligence">設備情報欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/equipmentIntelligence
     * Body:
     * {
     *   "updateTime":"2018-09-29 01:01:01",
     *   "mac": "1234567890AB",
	 *   "powerOnTime":"2018-09-29 01:01:01",
     *   ...........
     * }
     * @apiSuccess (Success 200) {String} id 設備情報的資料庫唯一ID，可以拿來查詢或是修改使用
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "id": "5b6d0d03993dc24293de551c"
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    EquipmentIntelligenceRouter.post('/equipmentIntelligence', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:122', 400);
        }
        else {
            try {
                let equip = new EquipmentIntelligence_1.EquipmentIntelligence(ctx.request.body);
                let equipdata = await equip.save();
                if (equipdata && equipdata.id) {
                    let res = {
                        id: equipdata.id
                    };
                    ctx.body = JSON.stringify(res);
                    ctx.status = 200;
                    ctx.respond = true;
                }
                else {
                    ctx.throw('db.invalidParameters:137', 400);
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:141,error:' + err.toString(), 400);
            }
        }
    });
    /**
     * @api {post} /equipmentIntelligence/update [設備情報]-修改
     * @apiDescription 修改設備情報資料
     * @apiGroup Knowledge Base
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Object} condition 符合此條件的設備情報會被修改
     * @apiParam {String} condition.equipmentID 設備情報編號，目前只開放依照設備情報編號修改，將來若有需要批次修改的，再增加欄位
     * @apiParam {Object} update 欲修改的欄位
     * @apiParam {ooo} update.xxx 只需要填欲修改的欄位，沒有要修改的就不用填。欄位請參考: <a href="#equipmentIntelligence">設備情報欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/equipmentIntelligence/update
     * Body:
     * {
	 *   "deviceData":[
	 *   {
	 *	   "condition": {
     *	     "mac": "4CFB5AD36BA1"
	 *	   },
	 *	  "update": {
	 *	   "powerOnTime":"2018-10-09 01:01:01",
	 *	   "workingStartTime":"2018-09-29 02:01:01",
	 *	   "workingTimeSpan":"90",
	 *	   "powerOnTimeSpan":"120"
	 *	  }
	 *   },
	 *   {
	 *	   "condition": {
     *	     "mac": "4CFB5AD36BA1"
	 *	   },
	 *	  "update": {
	 *	   "powerOnTime":"2018-10-09 01:01:01",
	 *	   "workingStartTime":"2018-09-29 02:01:01",
	 *	   "workingTimeSpan":"90",
	 *	   "powerOnTimeSpan":"120"
	 *	  }
	 *   }
     *  ]
     * }
     * @apiSuccess (Success 200) {Number} updateCount 修改成功的設備情報筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "updateCount": 1
     *   "createCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse km_equipmentNotFound
     * @apiUse db_dbNotReady
     */
    EquipmentIntelligenceRouter.post('/EquipmentIntelligence/update', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:186', 400);
        }
        else {
            try {

                let deviceData = ctx.request.body.deviceData;
                // console.log(deviceData)

                let updateDevice = [];
                let createDevice = [];

                for (let i = 0; i < deviceData.length; i++) {

                    if (false === dbquery_1.checkRequestParamObject(deviceData[i].condition)) {
                        ctx.throw('db.invalidParameters:188', 400);
                    }
                    else if (false === dbquery_1.checkRequestParamObject(deviceData[i].update)) {
                        ctx.throw('db.invalidParameters:190', 400);
                    }
                    else {
                        let query = deviceData[i].condition;
                        let updateDoc = deviceData[i].update;
                        let wtspan = parseInt(updateDoc.workingTimeSpan);
                        let ptspan = parseInt(updateDoc.powerOnTimeSpan);
                        if (ptspan == 0 || wtspan > ptspan) {
                            ctx.throw('db.invalidParameters:191', 400);
                        }
                        updateDoc.utilizationRate = wtspan / ptspan;
                        updateDoc.updateTime = (new Date()).toLocaleString();
                        updateDoc.mac = query.mac;

                        // console.log(updateDoc)
                        // console.log(query)

                        query.updateTime = { [sequelize.Op.and]: [{ [sequelize.Op.gte]: (new Date()).toISOString().slice(0, 11) + '00:00:00.000Z' }, { [sequelize.Op.lte]: (new Date()).toISOString().slice(0, 11) + '23:59:59.000Z' }] };
                        let updateres = await EquipmentIntelligence_1.EquipmentIntelligence.findOrCreate({ where: query, defaults: updateDoc });
                        if (updateres && (updateres[1] === false)) {

                            //Find and then update
                            //console.log('EquipmentIntelligence/update -- update old');

                            updateres[0].workingStartTime = updateDoc.workingStartTime;
                            updateres[0].powerOnTime = updateDoc.powerOnTime;
                            updateres[0].powerOnTimeSpan = updateDoc.powerOnTimeSpan;
                            updateres[0].updateTime = updateDoc.updateTime;
                            updateres[0].utilizationRate = updateDoc.utilizationRate;
                            updateres[0].workingTimeSpan = updateDoc.workingTimeSpan
                            updateres[0].revolutionSpeed = updateDoc.revolutionSpeed;
                            updateres[0].status = updateDoc.status

                            //console.log(updateres[0].updateTime);
                            let updateres2 = await updateres[0].save();
                            //console.log(updateres2);
                            updateDevice.push({ mac: updateres[0].mac });

                        } else {
                            console.log('EquipmentIntelligence/update -- create new');
                            //console.log(updateres);
                            createDevice.push({ mac: updateres[0].mac });
                        }
                    }

                    if ((updateDevice && Array.isArray(updateDevice)) || (createDevice && Array.isArray(createDevice))) {
                        let res = {
                            updateCount: updateDevice.length,
                            createCount: createDevice.length,

                        };
                        ctx.body = JSON.stringify(res);
                        ctx.status = 200;
                        ctx.respond = true;
                    }
                    else {
                        ctx.throw('db.invalidParameters:207', 400);
                    }
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:211,error:' + err.toString(), 400);
            }
        }
    });
};