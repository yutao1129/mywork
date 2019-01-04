// Author LiuYutao     20181013
// 增加异常 侦测  20181120
// 已知问题：查询出的结果存在 两组相同的记录
// Modify Yutao  20181124
// 根据CropCard的返回结果中的return值 判断 1 为组检返工卡，2 为总检返工卡
// 如果是 1或者2  截取bundleNumber 最后一个-之前的部分作为bundleNumber
// 组合 checkType 和return 的情况 返回相应的信息
// checkType ==1  return ==1  返回车缝
// checkType ==1  return ==2  返回车缝
// checkType ==2  return ==1  返回车缝
// checkType ==2  return ==2  返回车缝，锁钉，整烫

//step 1 select CropCard.*,RFID.id from CropCard,RFID where CropCard.rfid = RFID.id and RFID.cardNumber='A00002';
//1.	组检针对车缝组；
//2.	总检针对车缝、锁钉、整烫三个组;
//3.	中检针对裁剪到包装所有班组。
//step 2 select UserAccount.* from UserAccount,MemberOutput where UserAccount.id=MemberOutput.worker and MemberOutput.bunderNumber In <step 1> and MemberOutput.team In <[车缝],[车缝，锁定，整烫],[All]>
// SELECT * from UserAccount,MemberOutput WHERE UserAccount.id =MemberOutput.worker
// AND MemberOutput.bundleNumber =12
// AND MemberOutput.team IN
// ( SELECT id FROM team WHERE team.category IN ('车缝','锁钉','整烫'))


"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const RFID_1 = require("../database/models/RFID");
const CropCard_1 =require("../database/models/CropCard");
const MemberOutput_1 =require("../database/models/MemberOutput");
const UserAccount_1 =require("../database/models/UserAccount");
const TeamMember_1 =require("../database/models/TeamMember");
const Team_1 =require("../database/models/Team");

const dbquery_1 = require("../database/dbquery");
const Sequelize_1 = require("sequelize");

exports.registerGetUserListByRFIDAPI = function (getUserListByRFIDAPIRouter) {
    /**
     * @api {get} /getUserListByRFID [根據RFID卡號以及檢查類型查詢用戶列表]-查詢
     * @apiDescription 查詢符合條件的用戶列表
     * @apiGroup Knowledge Base
     * @apiVersion 0.0.1
     * @apiUse Yutao Liu
     * @apiParam {int} [checkType=1,2,3] 组检 =1，总检=2，中査=3
     * @apiParam {String} [cartNumber] RFID卡號
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/RFID/getUserListByRFID?checkType=2&cartNumber=A00002

     * @apiSuccess (Success 200) {Number} pageIndex 目前的頁碼
     * @apiSuccess (Success 200) {Number} maxRows 每一頁的最大筆數
     * @apiSuccess (Success 200) {Number} totalPage 總頁數
     * @apiSuccess (Success 200) {Array} records 查詢的結果。
     * @apiSuccessExample {json} Response Example
     *   [
     *       {
     *           "id": 7,
     *           "username": "ZZ01",
     *           "password": "5f4dcc3b5aa765d61d8327deb882cf99",
     *           "chineseName": "王菲菲",
     *           "englishName": null,
     *           "mobilePhone": "13406436871",
     *           "employeeID": "HB100004",
     *           "birthday": "1998-10-21",
     *           "joinedDate": "2016-09-20",
     *           "title": null,
     *           "emailAddress": "admintestcj@qq.com",
     *           "postalCode": null,
     *           "physicalAddress": "江苏省南京市",
     *           "autobiography": null,
     *           "photo": null,
     *           "comment": null,
     *           "skill": null,
     *           "status": "0",
     *           "sex": 0,
     *           "admin": 1
     *       },
     *   ]
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    getUserListByRFIDAPIRouter.get('/RFID/getUserListByRFID', async (ctx) => {

        
        if (!(ctx.query && ctx.query.checkType &&ctx.query.cartNumber)) {
            ctx.throw('api.invalidParameters:162', 400);
        }
        else{
            try {
                //检查类型：组检 =1，总检=2，中査=3
                //cartNumber:卡号


                let checkType =parseInt(ctx.query.checkType);
                let cartNumber =ctx.query.cartNumber;

                let data =await RFID_1.RFID.findOne({
                    where: {
                        cardNumber: cartNumber
                    }
                });
                if (null === data) {
                    ctx.throw('api.cartNumberNotFound:149', 404);
                }
                let rfid_id =data.id;
                data =await CropCard_1.CropCard.findOne({
                    where: {
                    rfid: rfid_id
                    },
                    order: [
                        ['createTime', 'DESC']
                    ]
                });
                if (null === data) {
                    ctx.throw('api.rfidNotFound:149', 404);
                }
                let reValue =data.return;
                //data.return =1 组检返工卡
                //data.return =2 总检返工卡
                let bundleNumber =data.bundleNumber;

                if(reValue ==1 || reValue ==2){
                    //console.log("data.bundleNumber",data.bundleNumber);
                    bundleNumber = (data.bundleNumber.match(/.*\d{8}(-\d)*/))[0];
                    //console.log("bundleNumber",bundleNumber);
                }
                let queryString="";
                if(checkType !=1 && checkType !=2){
                    ctx.throw('api.invalidCheckType:150', 404);
                }
                // checkType ==1  return ==1  返回车缝
                // checkType ==1  return ==2  返回车缝
                // checkType ==2  return ==1  返回车缝
                // checkType ==2  return ==2  返回车缝，锁钉，整烫
                let queryStrPre ="";
                if(checkType ==1){
                    queryString="select * from UserAccount WHERE UserAccount.id in " +
                        "(select MemberOutput.worker from MemberOutput  " +
                        "WHERE MemberOutput.bundleNumber='"+bundleNumber+ "' AND " +
                        "MemberOutput.team in (select id from Team where category ='车缝'))";
                }
                if(checkType ==2){
                    //console.log("reValue ==> ",reValue);
                    if(reValue ==1){
                        queryStrPre ="select * from UserAccount WHERE UserAccount.id in " +
                            "(select MemberOutput.worker from MemberOutput  " +
                            "WHERE MemberOutput.bundleNumber='"+data.bundleNumber+ "' AND " +
                            "MemberOutput.team in (select id from Team where category in ('车缝','锁钉','整烫')))";

                        queryString="select * from UserAccount WHERE UserAccount.id in " +
                            "(select MemberOutput.worker from MemberOutput  " +
                            "WHERE MemberOutput.bundleNumber='"+bundleNumber+ "' AND " +
                            "MemberOutput.team in (select id from Team where category ='车缝'))";
                    } else{
                        queryString="select * from UserAccount WHERE UserAccount.id in " +
                            "(select MemberOutput.worker from MemberOutput  " +
                            "WHERE MemberOutput.bundleNumber='"+bundleNumber+ "' AND " +
                            "MemberOutput.team in (select id from Team where category in ('车缝','锁钉','整烫')))";
                    }
                }
                /*
                switch(checkType){
                    case "1":
                        queryString="select * from UserAccount WHERE UserAccount.id in " +
                            "(select MemberOutput.worker from MemberOutput  " +
                            "WHERE MemberOutput.bundleNumber='"+bundleNumber+ "' AND " +
                            "MemberOutput.team in (select id from Team where category ='车缝'))";
                        break;
                    case "2":
                        queryString="select * from UserAccount WHERE UserAccount.id in " +
                            "(select MemberOutput.worker from MemberOutput  " +
                            "WHERE MemberOutput.bundleNumber='"+bundleNumber+ "' AND " +
                            "MemberOutput.team in (select id from Team where category in ('车缝','锁钉','整烫')))";
                        break;
                    case "3":
                        queryString="select * from UserAccount " +
                            "WHERE UserAccount.id in " +
                            "(select MemberOutput.worker from MemberOutput  " +
                            "WHERE MemberOutput.bundleNumber='"+bundleNumber+ "' AND " +
                            "MemberOutput.team in (select id from Team))";
                        break;
                    default:
                        ctx.throw('api.invalidCheckType:150', 404);
                        break;
                }
                */

                let preUserList=[];
                if(queryStrPre.length>0){
                    preUserList = (await UserAccount_1.UserAccount.sequelize.query(queryStrPre))[0];
                    //console.log("preUserList ==> ",preUserList);
                }
                let users =(await UserAccount_1.UserAccount.sequelize.query(queryString))[0];
                if(users.length <1){
                    ctx.throw('db.none valid record with queryString:'+queryString, 400);
                }
                //console.log("userList ==>",users);
                let userList=users.concat(preUserList);
                //console.log("after concat => ",userList);
                let teamInfos =await getTeamListByUserList(userList);
                if (teamInfos) {
                    ctx.body = userList;
                    ctx.status = 200;
                    ctx.respond = true;
                }
                else {
                    ctx.throw('db.noneDataInTeamMember', 400);
                }
            }
            catch (err) {
                //console.log(err);
                ctx.throw(err, 400);
            }
        }
    });
    async function getTeamListByUserList(userList) {
        let uids=[];
        userList.forEach(function (item) {
            uids.push(item.id);
        });
        let query = dbquery_1.queryDBGeneratorEx(
            {
                "query": {
                    "member": {[Sequelize_1.Op.in]: uids}
                    }
            }, TeamMember_1.teamMemberJoin);
        let teamInfos = await TeamMember_1.TeamMember.findAndCount(query);
        let teamCount =teamInfos.count;
        userList.forEach(function (item) {
            if(teamCount ==0){
                item.teamCategory ="noneDataInTeamMember";
            } else
            {
                for (let it of teamInfos.rows) {
                    if (item.id == it.member){
                        item.teamCategory =it.teamData.category;
                    }
                }
            }
        });
        return userList;
    }
}
