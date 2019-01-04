"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const dbquery_1 = require("../database/dbquery");
const sequelize = require("sequelize");
const Op = sequelize.Op;
const TeamMember_1 = require("../database/models/TeamMember");
const UserAccount_1 = require("../database/models/UserAccount");
const AccountRole_1 = require("../database/models/AccountRole");

function pushElementToObject (d,o){
    if(typeof(o)=='object') for(var p in o) {d[p]=o[p]}
}

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
        queryInstance = Object.assign(queryInstance,option);
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
        queryInstance = Object.assign(queryInstance,option);
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

exports.registerMemberTeamSelectedAPI = function (memberTeamSelectedRouter) {

    memberTeamSelectedRouter.post('/memberTeamSelected/search', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:63', 400);
        }
        else {
            try {
                let resp = dbquery_1.queryResponsePacket(ctx.request.body);
                let teamMemberQuery = {query:{}};
                let teamMemberArray = await findAndCount(teamMemberQuery,TeamMember_1,0);

                if(teamMemberArray && (teamMemberArray.length > 0)){
                    let teamMemberIDArray = teamMemberArray.map(value => {
                        return value.member;
                    });
                    let userAccountQuery = {query: {id:{[Op.notIn]:teamMemberIDArray}}};
                    let userAccountArray = await findAndCount(userAccountQuery,UserAccount_1,0);


                    for(let item of userAccountArray){
                        item.role = [];
                        let accountRoleQuery = {query: {account:item.id}};
                        let accountRoleArray = await findAndCount(accountRoleQuery,AccountRole_1,0);

 //                       console.log('accountRoleArray')
//                        console.log(accountRoleArray)

                        item.role = accountRoleArray.reduce((a,b)=>{
                            a = a.concat(b.role);
                            return a;
                        },[])
                    }

                    let userAccountStep2Query = {query: {}};
                    let userAccountStep2Array = await findAndCount(userAccountStep2Query,UserAccount_1,0);
//                    console.log('userAccountStep2Array')
//                    console.log(userAccountStep2Array)

                    for(let item of userAccountStep2Array){
                        item.role = [];
                        let accountRoleQuery = {query: {account:item.id}};
                        let accountRoleArray = await findAndCount(accountRoleQuery,AccountRole_1,0);

//                        console.log('accountRoleArray')
//                        console.log(accountRoleArray)

                        item.role = accountRoleArray.reduce((a,b)=>{
                           a = a.concat(b.role);
                           return a;
                        },[])
                    }

                    let managerArray = userAccountStep2Array.filter(value=>{
                       if( (value.role.includes('管理员') === true) || (value.role.includes('厂长') === true) || (value.role.includes('组长') === true))
                           return true;
                    });

                    let  NoTaskUserId = userAccountArray.map(value=>{
                        return value.id;
                    });

//                    console.log('managerArray')
//                    console.log(managerArray)
                    for(let item of managerArray){

                        if(NoTaskUserId.includes(item.id) === false){
                            console.log('999999999999')
                            userAccountArray.push(item);
                        }
                    }

                    userAccountArray.sort((a,b)=>{
                        return a.id - b.id;
                    });

                    resp.records = userAccountArray;

                } else {

                    let userAccountQuery = {query: {}};
                    let userAccountArray = await findAndCount(userAccountQuery,UserAccount_1,0);



                    for(let item of userAccountArray){
                        item.role = [];
                        let accountRoleQuery = {query: {account:item.id}};
                        let accountRoleArray = await findAndCount(accountRoleQuery,AccountRole_1,0);

//                        console.log('accountRoleArray')
//                        console.log(accountRoleArray)

                        item.role = accountRoleArray.reduce((a,b)=>{
                            a = a.concat(b.role);
                            return a;
                        },[])
                    }
 //                   console.log('userAccountArray')
 //                   console.log(userAccountArray)

                    resp.records = userAccountArray;
                }

                ctx.body = resp;
                ctx.status = 200;
                ctx.respond = true;
            }
            catch (e) {
                console.log(e);
                ctx.throw('db.invalidQuery:97', 400);
            }
        }
    });

};