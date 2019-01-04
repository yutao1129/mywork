const Order_1 = require("../database/models/Order");
const Style_1 = require("../database/models/Style");
const StyleOperation_1 = require("../database/models/StyleOperation");
const StyleProcess_1 = require("../database/models/StyleProcess");
const ProcessStation_1 = require("../database/models/ProcessStation");
const OrderDeliveryPlan_1 = require("../database/models/OrderDeliveryPlan");
const ProductionScheduling_1 = require("../database/models/ProductionScheduling");
const dbquery_1 = require("../database/dbquery");
const Sequelize_1 = require("sequelize")


const SewingTeamScheduling_1 = require("../database/models/SewingTeamScheduling");
const SewingTeamOutput_1 = require("../database/models/SewingTeamOutput");
const PrecedingTeamScheduling_1 = require("../database/models/PrecedingTeamScheduling");
const PrecedingTeamOutput_1 = require("../database/models/PrecedingTeamOutput");
const FollowingTeamScheduling_1 = require("../database/models/FollowingTeamScheduling");
const FollowingTeamOutput_1 = require("../database/models/FollowingTeamOutput");
//条件：一个订单交期+一个工厂条件+一种色号，输出：productionScheduleID List
//一个orderID(生产单号)+一个交期对应order一条记录（orderTableID)   
//一个orderTableID对应多个
async function GetProductionScheduleList(factory, orderTableID) {
    let queryschedule = {
        attributes: [
            ['id', "productionSchedulingID"],
            ['amount', "productionSchedulingAmount"],
        ],
        include: {
            model: OrderDeliveryPlan_1.OrderDeliveryPlan,
            attributes: [
                'id',
                'order'
            ],
            where: {
                order: orderTableID
            },
        },
        where: {
            factory: factory
        },
        order: ['id'],
        raw: true
    }
    let schedule_docs = await ProductionScheduling_1.ProductionScheduling.findAll(queryschedule);
    console.log('schedule_docs', schedule_docs)
    var result = schedule_docs;
    // if (schedule_docs && schedule_docs.length > 0) {
    //     for (let item of schedule_docs) {
    //         result.push(item);
    //     }
    // }
    //console.log('GetProductionScheduleList', result)
    return result;

}
exports.registerTeamScheduleAPI = function (teamScheduleAPIRouter) {

    teamScheduleAPIRouter.post('/teamSchedule/addPreceding', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:69', 400);
        }
        else {
            try {
                let factory = ctx.request.body.factory;
                if (!factory || factory == undefined) {
                    ctx.throw('db.invalidParameters:C0', 400);
                }
                let order = ctx.request.body.order;
                if (!order || order == undefined) {
                    ctx.throw('db.invalidParameters:C1', 400);
                }
     
                let cropTeam = ctx.request.body.cropTeam;
                if (!cropTeam || cropTeam == undefined) {
                    ctx.throw('db.invalidParameters:C5', 400);
                }
                let stickTeam = ctx.request.body.stickTeam;
                if (stickTeam == undefined) {
                    ctx.throw('db.invalidParameters:C6', 400);
                }
                let cropStartDate = ctx.request.body.cropStartDate;
                let cropEndDate = ctx.request.body.cropEndDate;
                let stickStartDate = ctx.request.body.stickStartDate;
                let stickEndDate = ctx.request.body.stickEndDate;
                if (!cropStartDate || cropStartDate == undefined || !cropEndDate || cropEndDate == undefined) {
                    ctx.throw('db.invalidParameters:C3', 400);
                }
                if (stickStartDate == undefined || stickEndDate == undefined) {
                    ctx.throw('db.invalidParameters:C4', 400);
                }
              
                let productionScheduleList = await GetProductionScheduleList(factory, order);


                let resp = {
                    records: []
                };
                console.log('productionScheduleList', productionScheduleList);
                if (productionScheduleList && productionScheduleList.length > 0) {
                    for (let item of productionScheduleList) {
                        let scheduleRecord = {
                            productionScheduling: item.productionSchedulingID,
                            cropTeam: cropTeam,
                            // stickTeam: stickTeam,
                            amount: item.productionSchedulingAmount,
                            cropStartDate: cropStartDate,
                            cropEndDate: cropEndDate,
                            cropEstimatedWorkingDay: dateDiff(cropStartDate, cropEndDate)
                            // stickStartDate: stickStartDate,
                            // stickEndDate: stickEndDate,
                            // stickEstimatedWorkingDay: dateDiff(stickStartDate, stickEndDate)
                        };
                        
                        let query = {
                            productionScheduling: item.productionSchedulingID,
                            cropTeam: cropTeam
                            // stickTeam: stickTeam
                        }

                        if(stickTeam){
                            scheduleRecord['stickTeam']=stickTeam;
                            scheduleRecord['stickStartDate']=stickStartDate;
                            scheduleRecord['stickEndDate']=stickEndDate;
                            scheduleRecord['stickEstimatedWorkingDay']=dateDiff(stickStartDate, stickEndDate);

                            query['stickTeam']=stickTeam;
                        }

                        let queryOrInsert = await PrecedingTeamScheduling_1.PrecedingTeamScheduling.findOrCreate({ where: query, defaults: scheduleRecord });
                        //console.log('queryOrInsert',queryOrInsert);
                        if (queryOrInsert && (queryOrInsert[1] == false)) {  //Find it
                            queryOrInsert[0].amount = scheduleRecord.amount;
                            queryOrInsert[0].cropStartDate = scheduleRecord.cropStartDate;
                            queryOrInsert[0].cropEndDate = scheduleRecord.cropEndDate;
                            queryOrInsert[0].cropEstimatedWorkingDay = scheduleRecord.cropEstimatedWorkingDay;
                            if(stickTeam){
                            queryOrInsert[0].stickStartDate = scheduleRecord.stickStartDate;
                            queryOrInsert[0].stickEndDate = scheduleRecord.stickEndDate;
                            queryOrInsert[0].stickEstimatedWorkingDay = scheduleRecord.stickEstimatedWorkingDay;
                            }

                            let update = await queryOrInsert[0].save();
                            if (update) {
                                scheduleRecord['add'] = "update";
                                scheduleRecord['id'] = update.id;
                            }
                            //
                        }
                        else if (queryOrInsert && (queryOrInsert[1] == true)) {
                            scheduleRecord['add'] = "insert"
                            scheduleRecord['id'] = queryOrInsert[0].id;
                        }
                        //console.log('scheduleRecord', scheduleRecord)
                        resp.records.push(scheduleRecord);
                    }
                    resp.success = true;
                }
                else {
                    resp.success = false;
                    resp.message = "No Schedule Data";
                }
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

    teamScheduleAPIRouter.post('/teamSchedule/addSewing', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:69', 400);
        }
        else {
            try {
                let factory = ctx.request.body.factory;
                if (!factory || factory == undefined) {
                    ctx.throw('db.invalidParameters:C0', 400);
                }
                let order = ctx.request.body.order;
                if (!order || order == undefined) {
                    ctx.throw('db.invalidParameters:C1', 400);
                }
                // let colorCode = ctx.request.body.colorCode;
                // if (!colorCode || colorCode == undefined) {
                //     ctx.throw('db.invalidParameters:C2', 400);
                // }
                let amountSum = ctx.request.body.amountSum;
                if (!amountSum || amountSum == undefined) {
                    ctx.throw('db.invalidParameters:CS', 400);
                }
                let teamSchData = ctx.request.body.scheduleData;

                let pSL = await GetProductionScheduleList(factory, order);


                let resp = {
                    records: []
                };
                console.log('productionScheduleList', pSL);

                if (pSL && pSL.length > 0) {
                    var pSLAmountSum=0;
                    for (var p = 0; p < pSL.length; p++) {
                        pSL[p]['remain'] = pSL[p]['productionSchedulingAmount'];
                        pSLAmountSum+=pSL[p]['productionSchedulingAmount'];
                    }
                    //整体分配，
                    if(pSLAmountSum!=amountSum){
                        ctx.throw('db.invalidParameters:amountSum', 400);
                    }
                    for (var q = 0; q < teamSchData.length; q++) {
                        teamSchData[q]['reqAmount'] = teamSchData[q]['amount'];
                        teamSchData[q]['schedule']=[];
                    }
              
                    for (var m = 0; m < pSL.length; m++) {
                        if (pSL[m]['remain'] == 0) {
                            continue;
                        }
                        for (var n = 0; n < teamSchData.length; n++) {
                            if (pSL[m]['remain'] == 0) {
                                break;
                            }
                            if (teamSchData[n]['reqAmount'] == 0) {
                                continue;
                            }
                            if (pSL[m]['remain'] == teamSchData[n]['reqAmount']) {
                               
                                teamSchData[n]['schedule'].push({ "productionSchedulingID": pSL[m].productionSchedulingID, "amount": pSL[m]['remain'] });
                                pSL[m]['remain'] = 0;
                                teamSchData[n]['reqAmount'] = 0;
                                continue;
                            }
                            else if (pSL[m]['remain'] > teamSchData[n]['reqAmount']) {
                              
                                teamSchData[n]['schedule'].push({ "productionSchedulingID": pSL[m].productionSchedulingID, "amount": teamSchData[n]['reqAmount'] })
                                pSL[m]['remain'] = pSL[m]['remain'] - teamSchData[n]['reqAmount'];
                                teamSchData[n]['reqAmount'] = 0;
                                continue;
                            }
                            else if (pSL[m]['remain'] < teamSchData[n]['reqAmount']) {
                                teamSchData[n]['schedule'].push({ "productionSchedulingID": pSL[m].productionSchedulingID, "amount": pSL[m]['remain'] })
                                teamSchData[n]['reqAmount'] = teamSchData[n]['reqAmount'] - pSL[m]['remain'];
                                pSL[m]['remain'] = 0;
                                break;
                            }
                        }
                    }
                    //console.log('teamSchData', teamSchData);
                    //console.log('pSL', pSL);
                    for (var i = 0; i < teamSchData.length; i++) {
              
                        for (let item of teamSchData[i]['schedule']) {
                            let scheduleRecord = {
                                productionScheduling: item.productionSchedulingID,
                                team: teamSchData[i].sewTeam,
                                amount: item.amount,
                                startDate: teamSchData[i].sewStartDate,
                                endDate: teamSchData[i].sewEndDate,
                                estimatedWorkingDay: dateDiff(teamSchData[i].sewStartDate,  teamSchData[i].sewEndDate)
                             
                            };
    
                            let query = {
                                productionScheduling: item.productionSchedulingID,
                                team: teamSchData[i].sewTeam,
                            }
                            let queryOrInsert = await SewingTeamScheduling_1.SewingTeamScheduling.findOrCreate({ where: query, defaults: scheduleRecord });
                            //console.log('queryOrInsert',queryOrInsert);
                            if (queryOrInsert && (queryOrInsert[1] == false)) {  //Find it
                                queryOrInsert[0].amount =  item.amount,
                                queryOrInsert[0].startDate = teamSchData[i].sewStartDate,
                                queryOrInsert[0].endDate = teamSchData[i].sewEndDate,
                                queryOrInsert[0].estimatedWorkingDay = scheduleRecord.estimatedWorkingDay;
                               
    
                                let update = await queryOrInsert[0].save();
                                if (update) {
                                    scheduleRecord['add'] = "update";
                                    scheduleRecord['id'] = update.id;
                                }
                                //
                            }
                            else if (queryOrInsert && (queryOrInsert[1] == true)) {
                                scheduleRecord['add'] = "insert"
                                scheduleRecord['id'] = queryOrInsert[0].id;
                            }
                            //console.log('scheduleRecord', scheduleRecord)
                            resp.records.push(scheduleRecord);
                        }
                    }

                    resp.success = true;
                }
                else {
                    resp.success = false;
                    resp.message = "No Schedule Data";
                }
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

    teamScheduleAPIRouter.post('/teamSchedule/addFollowing', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:69', 400);
        }
        else {
            try {
                let factory = ctx.request.body.factory;
                if (!factory || factory == undefined) {
                    ctx.throw('db.invalidParameters:C0', 400);
                }
                let order = ctx.request.body.order;
                if (!order || order == undefined) {
                    ctx.throw('db.invalidParameters:C1', 400);
                }
                // let colorCode = ctx.request.body.colorCode;
                // if (!colorCode || colorCode == undefined) {
                //     ctx.throw('db.invalidParameters:C2', 400);
                // }
         

                let lockTeam = ctx.request.body.lockTeam;
                if (lockTeam == undefined) {
                    ctx.throw('db.invalidParameters:C7', 400);
                }
                let ironTeam = ctx.request.body.ironTeam;
                if (ironTeam == undefined) {
                    ctx.throw('db.invalidParameters:C6', 400);
                }
                let packTeam = ctx.request.body.packTeam;
                if (!packTeam || packTeam == undefined) {
                    ctx.throw('db.invalidParameters:C8', 400);
                }

                let lockStartDate = ctx.request.body.lockStartDate;
                let lockEndDate = ctx.request.body.lockEndDate;
                let ironStartDate = ctx.request.body.ironStartDate;
                let ironEndDate = ctx.request.body.ironEndDate;
                let packStartDate = ctx.request.body.packStartDate;
                let packEndDate = ctx.request.body.packEndDate;

                if (lockStartDate == undefined || lockEndDate == undefined) {
                    ctx.throw('db.invalidParameters:C3', 400);
                }
                if (ironStartDate == undefined || ironEndDate == undefined) {
                    ctx.throw('db.invalidParameters:C4', 400);
                }
                if (!packStartDate || packStartDate == undefined || !packEndDate || packEndDate == undefined) {
                    ctx.throw('db.invalidParameters:C5', 400);
                }
                let productionScheduleList = await GetProductionScheduleList(factory, order);


                let resp = {
                    records: []
                };
                console.log('productionScheduleList', productionScheduleList);

                if (productionScheduleList && productionScheduleList.length > 0) {
                  
                    for (let item of productionScheduleList) {
                        let scheduleRecord = {
                            productionScheduling: item.productionSchedulingID,
                            // lockTeam: lockTeam,
                            // ironTeam: ironTeam,
                            packTeam: packTeam,
                            amount: item.productionSchedulingAmount,
                            // lockStartDate: lockStartDate,
                            // lockEndDate: lockEndDate,
                            // lockEstimatedWorkingDay: dateDiff(lockStartDate, lockEndDate),
                            // ironStartDate: ironStartDate,
                            // ironEndDate: ironEndDate,
                            // ironEstimatedWorkingDay: dateDiff(ironStartDate, ironEndDate),
                            packStartDate: packStartDate,
                            packEndDate: packEndDate,
                            packEstimatedWorkingDay: dateDiff(packStartDate, packEndDate)
                        };

                        let query = {
                            productionScheduling: item.productionSchedulingID,
                            // lockTeam: lockTeam,
                            // ironTeam: ironTeam,
                            packTeam: packTeam
                        }

                        if(lockTeam){
                            scheduleRecord['lockTeam']=lockTeam;
                            scheduleRecord['lockStartDate']=lockStartDate;
                            scheduleRecord['lockEndDate']=lockEndDate;
                            scheduleRecord['lockEstimatedWorkingDay']=dateDiff(lockStartDate, lockEndDate);

                            query['lockTeam']=lockTeam;
                        }

                        if(ironTeam){
                            scheduleRecord['ironTeam']=ironTeam;
                            scheduleRecord['ironStartDate']=ironStartDate;
                            scheduleRecord['ironEndDate']=ironEndDate;
                            scheduleRecord['ironEstimatedWorkingDay']=dateDiff(ironStartDate, ironEndDate);

                            query['ironTeam']=ironTeam;
                        }

                        
                        let queryOrInsert = await FollowingTeamScheduling_1.FollowingTeamScheduling.findOrCreate({ where: query, defaults: scheduleRecord });
                        //console.log('queryOrInsert',queryOrInsert);
                        if (queryOrInsert && (queryOrInsert[1] == false)) {  //Find it
                            queryOrInsert[0].amount = scheduleRecord.amount;
                            if(lockTeam){
                            queryOrInsert[0].lockStartDate = scheduleRecord.lockStartDate;
                            queryOrInsert[0].lockEndDate = scheduleRecord.lockEndDate;
                            queryOrInsert[0].lockEstimatedWorkingDay = scheduleRecord.lockEstimatedWorkingDay;
                            }
                            if(ironTeam){
                            queryOrInsert[0].ironStartDate = scheduleRecord.ironStartDate;
                            queryOrInsert[0].ironEndDate = scheduleRecord.ironEndDate;
                            queryOrInsert[0].ironEstimatedWorkingDay = scheduleRecord.ironEstimatedWorkingDay;
                            }
                            queryOrInsert[0].packStartDate = scheduleRecord.packStartDate;
                            queryOrInsert[0].packEndDate = scheduleRecord.packEndDate;
                            queryOrInsert[0].packEstimatedWorkingDay = scheduleRecord.packEstimatedWorkingDay;

                            let update = await queryOrInsert[0].save();
                            if (update) {
                                scheduleRecord['add'] = "update";
                                scheduleRecord['id'] = update.id;
                            }
                            //
                        }
                        else if (queryOrInsert && (queryOrInsert[1] == true)) {
                            scheduleRecord['add'] = "insert"
                            scheduleRecord['id'] = queryOrInsert[0].id;
                        }
                        //console.log('scheduleRecord', scheduleRecord)
                        resp.records.push(scheduleRecord);
                    }
                    resp.success = true;
                }
                else {
                    resp.success = false;
                    resp.message = "No Schedule Data";
                }
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

    teamScheduleAPIRouter.post('/teamSchedule/delPreceding', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:69', 400);
        }
        else {
            try {
                let factory = ctx.request.body.factory;
                if (!factory || factory == undefined) {
                    ctx.throw('db.invalidParameters:C0', 400);
                }
                let order = ctx.request.body.order;
                if (!order || order == undefined) {
                    ctx.throw('db.invalidParameters:C1', 400);
                }
                // let colorCode = ctx.request.body.colorCode;
                // if (!colorCode || colorCode == undefined) {
                //     ctx.throw('db.invalidParameters:C2', 400);
                // }
                let cropTeam = ctx.request.body.cropTeam;
                if (!cropTeam || cropTeam == undefined) {
                    ctx.throw('db.invalidParameters:C5', 400);
                }
                let stickTeam = ctx.request.body.stickTeam;
                if (stickTeam == undefined) {
                    ctx.throw('db.invalidParameters:C6', 400);
                }
             
                let productionScheduleList = await GetProductionScheduleList(factory, order);

                //console.log('productionScheduleList', productionScheduleList);
                let resp = {
                    "success": false,
                    "message":"No record to be delete",
                    "deleteCount":0,
                    "statusCode":200
                };
              

                if (productionScheduleList && productionScheduleList.length > 0) {
                    var productionScheduleIdList=[];
                    productionScheduleList.map((item) => {
                        productionScheduleIdList.push(item.productionSchedulingID)
                    });
                    var querySch={
                        attributes:[
                           'id'
                        ],
                        where:{
                            productionScheduling:productionScheduleIdList,
                            //stickTeam:stickTeam,
                            cropTeam:cropTeam

                        }
                    }
                    if(stickTeam){
                        querySch['where']['stickTeam']=stickTeam;
                    }
                    //查询Team排配的记录
                    var teamScheduleList=await PrecedingTeamScheduling_1.PrecedingTeamScheduling.findAll(querySch);
                    if(teamScheduleList&&teamScheduleList.length>0){
                        var teamScheduleIdList=[];
                        teamScheduleList.map((item) => {
                            teamScheduleIdList.push(item.id)
                        });
                        var queryOut={
                            attributes:[
                                'id'
                             ],
                             where:{
                                precedingTeamScheduling:teamScheduleIdList,
                             }
                        }
                        //查询是否有产出记录
                        var out_docs=await PrecedingTeamOutput_1.PrecedingTeamOutput.findAndCount(queryOut);
                        if(out_docs.count>0){
                            resp.deleteCount=0;
                            resp.success = false;
                            resp.message = "Already Output";
                        }
                        else{
                            //如果没有，删除team排产记录
                            var conditionDel= {
                                where:{
                                    // productionScheduling:productionScheduleIdList,
                                    // cropTeam:cropTeam,
                                    // stickTeam:stickTeam
                                    id:teamScheduleIdList
                                }
                            }
                            var delcount=await PrecedingTeamScheduling_1.PrecedingTeamScheduling.destroy(conditionDel);
                            if (null !== delcount && undefined !== delcount&&delcount>0) {
                                resp.deleteCount=delcount;
                                resp.success = true;
                                resp.message = "Delete OK";
                            }
                            else{
                                resp.deleteCount=0;
                                resp.success = false;
                                resp.message = "Delete Error";
                                resp.statusCode=400;
                            }
                        }
                    }
                    else{
                        resp.deleteCount=0;
                        resp.success = false;
                        resp.message = "No Record";
                        resp.statusCode=400;
                    }
                }
                ctx.body = resp;
                ctx.status = resp.statusCode;
                ctx.respond = true;
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalorderIDQuery:98,error:' + err.toString(), 400);
            }
        }
    });
    teamScheduleAPIRouter.post('/teamSchedule/delSewing', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:69', 400);
        }
        else {
            try {
                let factory = ctx.request.body.factory;
                if (!factory || factory == undefined) {
                    ctx.throw('db.invalidParameters:C0', 400);
                }
                let order = ctx.request.body.order;
                if (!order || order == undefined) {
                    ctx.throw('db.invalidParameters:C1', 400);
                }
                // let colorCode = ctx.request.body.colorCode;
                // if (!colorCode || colorCode == undefined) {
                //     ctx.throw('db.invalidParameters:C2', 400);
                // }
                let sewTeam = ctx.request.body.sewTeam;
                if (!sewTeam || sewTeam == undefined) {
                    ctx.throw('db.invalidParameters:C5', 400);
                }
            
             
                let productionScheduleList = await GetProductionScheduleList(factory, order);

                //console.log('productionScheduleList', productionScheduleList);
                let resp = {
                    "success": false,
                    "message":"No record to be delete",
                    "deleteCount":0,
                    "statusCode":200
                };
              

                if (productionScheduleList && productionScheduleList.length > 0) {
                    var productionScheduleIdList=[];
                    productionScheduleList.map((item) => {
                        productionScheduleIdList.push(item.productionSchedulingID)
                    });
                    var querySch={
                        attributes:[
                           'id'
                        ],
                        where:{
                            productionScheduling:productionScheduleIdList,
                            team:sewTeam
                        }
                    }
                    //查询Team排配的记录
                    var teamScheduleList=await SewingTeamScheduling_1.SewingTeamScheduling.findAll(querySch);
                    if(teamScheduleList&&teamScheduleList.length>0){
                        var teamScheduleIdList=[];
                        teamScheduleList.map((item) => {
                            teamScheduleIdList.push(item.id)
                        });
                        var queryOut={
                            attributes:[
                                'id'
                             ],
                             where:{
                                sewingTeamScheduling:teamScheduleIdList,
                             }
                        }
                        //查询是否有产出记录
                        var out_docs=await SewingTeamOutput_1.SewingTeamOutput.findAndCount(queryOut);
                        if(out_docs.count>0){
                            resp.deleteCount=0;
                            resp.success = false;
                            resp.message = "Already Output";
                        }
                        else{
                            //如果没有，删除team排产记录
                            var conditionDel= {
                                where:{
                                    // productionScheduling:productionScheduleIdList,
                                    // sewTeam:sewTeam
                                    id:teamScheduleIdList
                                }
                            }
                            var delcount=await SewingTeamScheduling_1.SewingTeamScheduling.destroy(conditionDel);
                            if (null !== delcount && undefined !== delcount&&delcount>0) {
                                resp.deleteCount=delcount;
                                resp.success = true;
                                resp.message = "Delete OK";
                            }
                            else{
                                resp.deleteCount=0;
                                resp.success = false;
                                resp.message = "Delete Error";
                                resp.statusCode=400;
                            }
                        }
                    }
                    else{
                        resp.deleteCount=0;
                        resp.success = false;
                        resp.message = "No Record";
                        resp.statusCode=400;
                    }
                }
                ctx.body = resp;
                ctx.status = resp.statusCode;
                ctx.respond = true;
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalorderIDQuery:98,error:' + err.toString(), 400);
            }
        }
    });
    teamScheduleAPIRouter.post('/teamSchedule/delFollowing', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:69', 400);
        }
        else {
            try {
                let factory = ctx.request.body.factory;
                if (!factory || factory == undefined) {
                    ctx.throw('db.invalidParameters:C0', 400);
                }
                let order = ctx.request.body.order;
                if (!order || order == undefined) {
                    ctx.throw('db.invalidParameters:C1', 400);
                }
                // let colorCode = ctx.request.body.colorCode;
                // if (!colorCode || colorCode == undefined) {
                //     ctx.throw('db.invalidParameters:C2', 400);
                // }
                let lockTeam = ctx.request.body.lockTeam;
                if (lockTeam == undefined) {
                    ctx.throw('db.invalidParameters:C7', 400);
                }
                let ironTeam = ctx.request.body.ironTeam;
                if (ironTeam == undefined) {
                    ctx.throw('db.invalidParameters:C6', 400);
                }
                let packTeam = ctx.request.body.packTeam;
                if (!packTeam || packTeam == undefined) {
                    ctx.throw('db.invalidParameters:C8', 400);
                }
            
                let productionScheduleList = await GetProductionScheduleList(factory, order);


                let resp = {
                    "success": false,
                    "message":"No record to be delete",
                    "deleteCount":0,
                    "statusCode":200
                };
              

                if (productionScheduleList && productionScheduleList.length > 0) {
                    var productionScheduleIdList=[];
                    productionScheduleList.map((item) => {
                        productionScheduleIdList.push(item.productionSchedulingID)
                    });
                    var querySch={
                        attributes:[
                           'id'
                        ],
                        where:{
                            productionScheduling:productionScheduleIdList,
                            lockTeam:lockTeam,
                            ironTeam:ironTeam,
                            packTeam:packTeam
                        }
                    }
                    if(lockTeam){
                        querySch['where']['lockTeam']=lockTeam;
                    }
                    if(ironTeam){
                        querySch['where']['ironTeam']=ironTeam;
                    }
                    //查询Team排配的记录
                    var teamScheduleList=await FollowingTeamScheduling_1.FollowingTeamScheduling.findAll(querySch);
                    if(teamScheduleList&&teamScheduleList.length>0){
                        var teamScheduleIdList=[];
                        teamScheduleList.map((item) => {
                            teamScheduleIdList.push(item.id)
                        });
                        var queryOut={
                            attributes:[
                                'id'
                             ],
                             where:{
                                followingTeamScheduling:teamScheduleIdList,
                             }
                        }
                        //查询是否有产出记录
                        var out_docs=await FollowingTeamOutput_1.FollowingTeamOutput.findAndCount(queryOut);
                        if(out_docs.count>0){
                            resp.deleteCount=0;
                            resp.success = false;
                            resp.message = "Already Output";
                        }
                        else{
                            //如果没有，删除team排产记录
                            var conditionDel= {
                                where:{
                                    // productionScheduling:productionScheduleIdList,
                                    // lockTeam:lockTeam,
                                    // ironTeam:ironTeam,
                                    // packTeam:packTeam
                                    id:teamScheduleIdList
                                }
                            }
                            var delcount=await FollowingTeamScheduling_1.FollowingTeamScheduling.destroy(conditionDel);
                            if (null !== delcount && undefined !== delcount&&delcount>0) {
                                resp.deleteCount=delcount;
                                resp.success = true;
                                resp.message = "Delete OK";
                            }
                            else{
                                resp.deleteCount=0;
                                resp.success = false;
                                resp.message = "Delete Error";
                                resp.statusCode=400;
                            }
                        }
                    }
                    else{
                        resp.deleteCount=0;
                        resp.success = false;
                        resp.message = "No Record";
                        resp.statusCode=400;
                    }
                }
                ctx.body = resp;
                ctx.status = resp.statusCode;
                ctx.respond = true;
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalorderIDQuery:98,error:' + err.toString(), 400);
            }
        }
    });
    teamScheduleAPIRouter.post('/teamSchedule/searchPreceding', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:69', 400);
        }
        else {
            try {
                let factory = ctx.request.body.factory;
                if (!factory || factory == undefined) {
                    ctx.throw('db.invalidParameters:C0', 400);
                }
                let order = ctx.request.body.order;
                if (!order || order == undefined) {
                    ctx.throw('db.invalidParameters:C1', 400);
                }
                // let colorCode = ctx.request.body.colorCode;
                // if (!colorCode || colorCode == undefined) {
                //     ctx.throw('db.invalidParameters:C2', 400);
                // }
                let cropTeam = ctx.request.body.cropTeam;
                if (!cropTeam || cropTeam == undefined) {
                    ctx.throw('db.invalidParameters:C5', 400);
                }
                let stickTeam = ctx.request.body.stickTeam;
                if (stickTeam == undefined) {
                    ctx.throw('db.invalidParameters:C6', 400);
                }
             
                let productionScheduleList = await GetProductionScheduleList(factory, order);


                let resp = {
                    "success": false,
                    "message":"No Record",
                    "recordsCount":0,
                    "records":[]
                };
                console.log('productionScheduleList', productionScheduleList);

                if (productionScheduleList && productionScheduleList.length > 0) {
                    var productionScheduleIdList=[];
                    productionScheduleList.map((item) => {
                        productionScheduleIdList.push(item.productionSchedulingID)
                    });
                 
                    var condition={
                        // include:[
                        //     {
                        //         model:PrecedingTeamOutput_1.PrecedingTeamOutput,
                        //         where:{
                        //             cropAmount:[null,0],
                        //             stickAmount:[null,0]
                        //         }
                        //     }
                        // ],
                        where:{
                            productionScheduling:productionScheduleIdList,
                            cropTeam:cropTeam
                          
                        },
                        raw:true

                    }
                    if(stickTeam){
                        condition['where']['stickTeam']=stickTeam;
                    }
                    let docs = await PrecedingTeamScheduling_1.PrecedingTeamScheduling.findAll(condition);
                    console.log('docs:',docs);
                    if (null !== docs && undefined !== docs) {
                        resp.recordsCount=docs.length;
                        resp.success = true;
                        resp.message = "Search OK";
                        resp.records = docs;
                    }
                }
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

    teamScheduleAPIRouter.post('/teamSchedule/searchSewing', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:69', 400);
        }
        else {
            try {
                let factory = ctx.request.body.factory;
                if (!factory || factory == undefined) {
                    ctx.throw('db.invalidParameters:C0', 400);
                }
                let order = ctx.request.body.order;
                if (!order || order == undefined) {
                    ctx.throw('db.invalidParameters:C1', 400);
                }
                // let colorCode = ctx.request.body.colorCode;
                // if (!colorCode || colorCode == undefined) {
                //     ctx.throw('db.invalidParameters:C2', 400);
                // }
                let sewTeam = ctx.request.body.sewTeam;
                if (!sewTeam || sewTeam == undefined) {
                    ctx.throw('db.invalidParameters:C5', 400);
                }
            
             
                let productionScheduleList = await GetProductionScheduleList(factory, order);

                console.log('productionScheduleList', productionScheduleList);
                let resp = {
                    "success": false,
                    "message":"No record to be delete",
                    "deleteCount":0
                };
              

                if (productionScheduleList && productionScheduleList.length > 0) {
                    var productionScheduleIdList=[];
                    productionScheduleList.map((item) => {
                        productionScheduleIdList.push(item.productionSchedulingID)
                    });
                    var querySch={
                        attributes:[
                        //    'id',
                        //    'amount'
                        [Sequelize_1.fn('SUM', Sequelize_1.col('amount')), 'amountSum'],
                        ],
                        where:{
                            productionScheduling:productionScheduleIdList,
                            team:sewTeam
                        }
                    }
                    //查询Team排配的记录
                    var teamSchedule=await SewingTeamScheduling_1.SewingTeamScheduling.findAll(querySch);
                    console.log(teamSchedule)
                }
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



    function dateDiff(startDate, endDate) {
        let sDate = new Date(startDate);
        let eDate = new Date(endDate);
        let days = Math.ceil((eDate - sDate) / (24 * 60 * 60 * 1000));
        return days;
    }


}