"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const dbquery_1 = require("../database/dbquery");
const Factory_1 = require("../database/models/Factory");
const TeamMember_1 = require("../database/models/TeamMember");

const sequelize = require("sequelize");
const Op = sequelize.Op;

function pushElementToObject (d,o){
    if(typeof(o)=='object') for(var p in o) {d[p]=o[p]}
}

const findAndCountAll = async function (query,modelInstance,join,option){
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
    console.log(queryInstance);

    let tempArray = [];
    let docs = await modelInstance[modelInstanceKeys[0]].findAndCountAll(queryInstance);

    if (docs && docs.rows) {
        for (let item of docs.rows) {
            tempArray.push(item.toJSON());
        }
    }

    return  tempArray;
};

const findAndCount = async function (query,modelInstance,join,where){
    let queryInstance = {};
    let modelInstanceKeys = Object.keys(modelInstance);

    if(join && modelInstanceKeys.length === 2 ){
        queryInstance = dbquery_1.queryDBGeneratorEx(query, modelInstance[modelInstanceKeys[1]]);
    }else{
        queryInstance = dbquery_1.queryDBGeneratorEx(query);
    }

    if(where){
        pushElementToObject(queryInstance.where,where)
    }

    console.log(queryInstance);
    let tempArray = [];
    let docs = await modelInstance[modelInstanceKeys[0]].findAndCount(queryInstance);

    if (docs && docs.rows) {
        for (let item of docs.rows) {
            tempArray.push(item.toJSON());
        }
    }

    return  tempArray;
};

function getKeyValueFromAJsonArray(jsonArray){

    if(Array.isArray(jsonArray)){
        let keyValueArray =  jsonArray.map(value => {
            let tempJson = {
                key:null,
                value:null
            };

            for(let x in value){
                tempJson.key = x;
                tempJson.value = value[x];
            }

            return tempJson;
        });

        return keyValueArray;
    }else {
        return jsonArray;
    }
}

let categoryTypeFixArray = [
    "裁剪",
    "粘衬",
    "车缝",
    "锁钉",
    "整烫",
    "包装"
];

exports.registerFactoryComplexAPI = function (factoryComplexRouter) {

    factoryComplexRouter.post('/factoryComplex/search', async (ctx) => {

        try {
            let resp = dbquery_1.queryResponsePacket(ctx.request.body);
            let factoryQuery = {query: {}};
            let factoryArray = await findAndCount(factoryQuery,Factory_1,1);

            let factoryAndTeamArray =  factoryArray.map(value=>{

                let factoryJson = {
                    id:null,
                    factoryID:null,
                    name:null,
                    team:[],
                    memberCount:0,
                    category:[],
                    categoryFixType:[],
                    categoryFixValue:[],
                    categoryType:[],
                    categoryTypeCountArray:[],
                    categoryHasIDArray:[]
                };
                factoryJson.id = value.id;
                factoryJson.name = value.name;
                factoryJson.factoryID = value.factoryID;

                if(value.teamData.length > 0){

                 let teamArray = value.teamData.map(value=>{

                        let teamJson = {
                            id:null,
                            name:null,
                            category:null
                        };
                        teamJson.id = value.id;
                        teamJson.name = value.name;
                        teamJson.category = value.category;
                        factoryJson.category.push(value.category);
                        return teamJson;
                 });

                 factoryJson.team = teamArray;
                }

                return factoryJson;
            });

            factoryAndTeamArray.map(value =>{

                if(value.team.length > 0){

                    let categoryTypeArray = [...new Set(value.category)];
                    value.categoryType = categoryTypeArray;

                    let categoryHasIDArray = categoryTypeArray.map(value1 => {

                        let categoryHasIDJson = {
                            category:null,
                            id:[],
                            name:[]
                        };
                        let tempIDArray = [];
                        let tempNameArray = [];
                        value.team.forEach(value2 => {

                            if(value2.category === value1){
                                tempIDArray.push(value2.id);
                                tempNameArray.push(value2.name);
                            }
                        });

                        categoryHasIDJson.category = value1;
                        categoryHasIDJson.id = tempIDArray;
                        categoryHasIDJson.name =tempNameArray;

                        return categoryHasIDJson;
                    });

                    value.categoryHasIDArray = categoryHasIDArray;

                    let categoryTypeCountArray = categoryTypeArray.map(value1 => {

                        let typeCount = value.team.reduce((a,b)=>{

                            if(b.category === value1){
                                a++;
                            }

                            return a;
                        },0);

                        return {[value1]:typeCount}
                    });

                    value.categoryTypeCountArray = categoryTypeCountArray;

                    let categoryValue = categoryTypeFixArray.map(value => {
                        let flag = categoryTypeCountArray.some(value1 => {
                            if (Object.keys(value1)[0] === value)
                                return true;
                        });
//                        console.log(flag);

                        if(flag){
                            for(let x = 0; categoryTypeCountArray.length; x++){
                                if ( Object.keys(categoryTypeCountArray[x])[0] === value )
                                    return Object.values(categoryTypeCountArray[x])[0];
                            }
                        }else{
                            return 0;
                        }
                    });

                    value.categoryFixValue = categoryValue;
                    value.categoryFixType = categoryTypeFixArray;
                }
            });
 //           console.log('factoryAndTeamArray');
 //           console.log(JSON.stringify(factoryAndTeamArray) );

            for(let x = 0; x < factoryAndTeamArray.length; x++){
                if(factoryAndTeamArray[x].categoryHasIDArray.length > 0){
/*
                    for(let y = 0; y < factoryAndTeamArray[x].categoryHasIDArray.length; y++){
                        let teamMemberQuery = {query: {}};
                        let teamMemberArray = await findAndCount(teamMemberQuery,TeamMember_1,1,{team:{[Op.in]:factoryAndTeamArray[x].categoryHasIDArray[y].id}});
 //                       console.log('teamMemberArray')
 //                       console.log(teamMemberArray)

                        let xx = teamMemberArray.map(value=>{
                            console.log(value.member)
                            return value.member;
                        })
                        console.log(xx.sort())

                        factoryAndTeamArray[x].categoryHasIDArray[y].memberCount = teamMemberArray.length;
                        factoryAndTeamArray[x].categoryHasIDArray[y].teamCount = factoryAndTeamArray[x].categoryHasIDArray[y].id.length;
                        factoryAndTeamArray[x].memberCount += teamMemberArray.length;
                    }


*/
                    let teamIDArray = factoryAndTeamArray[x].categoryHasIDArray.reduce((a,b)=>{
                        a.push(b.id);
                        return a;
                    },[]);

                    let teamMemberQuery = {query: {}};
                    let teamMemberArray = await findAndCount(teamMemberQuery,TeamMember_1,1,{team:{[Op.in]:teamIDArray}});
                    //                       console.log('teamMemberArray')
                    //                       console.log(teamMemberArray)

                    teamMemberArray = [...new Set(teamMemberArray.map(value=>{
                        return value.member;
                    }))];
//                    console.log(teamMemberArray.length)
                    factoryAndTeamArray[x].memberCount += teamMemberArray.length;
                }


                delete  factoryAndTeamArray[x].category;
                delete  factoryAndTeamArray[x].categoryHasIDArray;
                delete  factoryAndTeamArray[x].team;
                delete factoryAndTeamArray[x].categoryType;
                delete factoryAndTeamArray[x].categoryTypeCountArray;
            }

            //console.log(factoryAndTeamArray);
            resp.records = factoryAndTeamArray;

            ctx.body = resp;
            ctx.status = 200;
            ctx.respond = true;
        }
        catch (e) {
            console.log(e);
            ctx.throw('db.invalidQuery:97', 400);
        }
    })
};