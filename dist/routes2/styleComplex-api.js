"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const dbquery_1 = require("../database/dbquery");
const Style_1 = require("../database/models/Style");
const Client_1 = require("../database/models/Client");

const findAndCount = async function (query,modelInstance,join,option,){
    let queryInstance = {};
    let modelInstanceKeys = Object.keys(modelInstance);
    if(join && modelInstanceKeys.length === 2 ){
        queryInstance = dbquery_1.queryDBGeneratorEx(query, modelInstance[modelInstanceKeys[1]]);
    }else{
        queryInstance = dbquery_1.queryDBGeneratorEx(query);
    }
    if(option){
        queryInstance = Object.assign(queryInstance,option)
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

exports.registerStyleComplexAPI = function (styleComplexRouter) {

    styleComplexRouter.post('/styleComplex/search', async (ctx) => {
        try {
            let resp = dbquery_1.queryResponsePacket(ctx.request.body);
            let query = ctx.request.body.query||{};
            let options = {attributes:[
                    'styleID',
                    'designStyleID',
                    'productName',
                    'productCategory',
                    'client',
                    'description',
                    'frontPhoto',
                    'backPhoto',
                    'status',
                    'createdTime'
                ],

                include: [
                    {
                        model: Client_1.Client,
                        attributes: [
                            'name',
                        ]
                    }
                ],

                order:[['createdTime','DESC']]
            }


            let styleQuery = {query:query};
            let styleArray = await findAndCount(styleQuery,Style_1,1,options);

            let count = styleArray.length;
            if (0 === count) {
                resp.totalPage = 0;
            }
            else if (resp.maxRows > 0) {
                resp.totalPage = Math.ceil(count / resp.maxRows);
            }
            else {
                resp.totalPage = 1;
            }
            if (undefined === query.offset || (query.offset && query.offset < count)) {


                let resultArray = Object.assign([],styleArray)

                resultArray.forEach(value=>{
                    if(value.cleintData){
                        value.clientName = value.cleintData.name;
                        delete value.cleintData;
                    }else {
                        value.clientName = null;
                    }


                })

                console.log(resultArray);



                let createTime = resultArray.filter(value=>{
                    if(value.createdTime){
                        return true;
                    }
                });
/*
                createTime.sort((a,b)=>{
//                    return b.createdTime > a.createdTime;

                    return b.createdTime.toLocaleString().localeCompare(a.createdTime.toLocaleString());
                });
*/
                let createTimeIsEmpty = resultArray.filter(value=>{
                    if(!value.createdTime){
                        return true;
                    }
                });

                resultArray = createTime.concat(createTimeIsEmpty)

                resp.records = resultArray;
            }
            ctx.body = resp;
            ctx.status = 200;
            ctx.respond = true;

        }
        catch (e) {
            console.log(e);
            ctx.throw('db.invalidQuery:97', 400);
        }
    })


}