"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Style_1 = require("../database/models/Style");
const Material_1 = require("../database/models/Material");
const StyleOperation_1 = require("../database/models/StyleOperation");
const StyleProcess_1 = require("../database/models/StyleProcess");
const StyleQualityStandard_1 = require("../database/models/StyleQualityStandard");
const Client_1 = require("../database/models/Client");
const Order_1 = require("../database/models/Order");
const dbquery_1 = require("../database/dbquery");
const Sequelize_1 = require("sequelize");
// export const accRouter = new KoaRouter();
exports.registerStyleAPI = function (styleRouter) {
    /**
     * @api {post} /style/search [款式]-查詢
     * @apiDescription 查詢符合條件的款式，並將結果分頁回傳
     * @apiGroup Style
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number=0} [pageIndex] 頁碼
     * @apiParam {Number=100} [maxRows] 每一頁的最大筆數
     * @apiParam {Object} [sort] 將結果指定欄位排序。1是從小到大排序，-1是從大到小。可指定的欄位請參考: <a href="#style">款式欄位定義</a> <p> 例如根據<code>styleID</code>從小到大排序就是：<code>{"styleID":1}</code>
     * @apiParam {Object} [query] 查詢條件。可以指定欄位等於某個值，或是介於某個範圍。範圍用<code>[大於某值，小於某值]</code>來描述，範圍中的兩個值其中之一，可以設定為<code>null</code>，表示不指定，但不能兩者皆為<code>null</code><p> 例如想指定<code>styleID</code>大於0的款式就是：<code>{"styleID": [0, null]}</code>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/style/search
     * Body:
     * {
     *   "pageIndex": 0,
     *   "maxRows": 3,
     *   "sort": {
     *     "styleID": 1
     *   },
     *   "query": {
     *      "status": 0
     *   }
     * }
     * @apiSuccess (Success 200) {Number} pageIndex 目前的頁碼
     * @apiSuccess (Success 200) {Number} maxRows 每一頁的最大筆數
     * @apiSuccess (Success 200) {Number} totalPage 總頁數
     * @apiSuccess (Success 200) {Array} records 查詢的結果。各欄位定義請參考: <a href="#style">款式欄位定義</a>
     * @apiSuccessExample {json} Response Example
     * {
     *   "pageIndex": 1,
     *   "maxRows": 100,
     *   "totalPage": 2,
     *   "records": [{
     *     "styleID": "xxxx",
     *     "status": 0,
     *     ...
     *     },
     *     ...
     *   ]
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    styleRouter.post('/style/search', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:63', 400);
        }
        else {
            let resp = dbquery_1.queryResponsePacket(ctx.request.body);
            let query = dbquery_1.queryDBGeneratorEx(ctx.request.body, Style_1.styleJoin);
            try {
                let stylesResp = await Style_1.Style.findAndCount(query);
                let count = stylesResp.count;
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
                    if (stylesResp.rows && stylesResp.rows.length > 0) {
                        for (let item of stylesResp.rows) {
                            let itemFmt = item.toJSON();
                            /*
                            itemFmt.BOM = [];
                            itemFmt.operation = [];
                            itemFmt.process = [];
                            itemFmt.qualityStandard = [];
                            itemFmt.order = [];

                            let res = await UpdateBoms(itemFmt);
                            res = await UpdateOperation(itemFmt);
                            res = await UpdateProcess(itemFmt);
                            res = await UpdateQualityStandard(itemFmt);
                            res = await UpdateClient(itemFmt);
                            res = await UpdateOrder(itemFmt);
                            */
                            resp.records.push(itemFmt);
                        }
                    }
                }
                ctx.body = resp;
                ctx.status = 200;
                ctx.respond = true;
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidQuery:94', 400);
            }
        }
    });
    styleRouter.post('/style/searchlike', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:63', 400);
        }
        else {
            let resp = dbquery_1.queryResponsePacket(ctx.request.body);
            let query = dbquery_1.queryDBGeneratorEx(ctx.request.body, Style_1.styleJoin);
            try {
                let query={
                    where:{
                        styleID:{[Sequelize_1.Op.like]:"%10%"}
                    }
                }
                let stylesResp = await Style_1.Style.findAndCount(query);
                let count = stylesResp.count;
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
                    if (stylesResp.rows && stylesResp.rows.length > 0) {
                        for (let item of stylesResp.rows) {
                            let itemFmt = item.toJSON();
                            /*
                            itemFmt.BOM = [];
                            itemFmt.operation = [];
                            itemFmt.process = [];
                            itemFmt.qualityStandard = [];
                            itemFmt.order = [];

                            let res = await UpdateBoms(itemFmt);
                            res = await UpdateOperation(itemFmt);
                            res = await UpdateProcess(itemFmt);
                            res = await UpdateQualityStandard(itemFmt);
                            res = await UpdateClient(itemFmt);
                            res = await UpdateOrder(itemFmt);
                            */
                            resp.records.push(itemFmt);
                        }
                    }
                }
                ctx.body = resp;
                ctx.status = 200;
                ctx.respond = true;
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidQuery:94', 400);
            }
        }
    });
    /**
     * @api {post} /style [款式]-新增
     * @apiDescription 新增款式
     * @apiGroup Style
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {String} styleID 帳號
     * @apiParam {String} productName 品名
     * @apiParam {Mix} [others] 其他欄位，請參考: <a href="#style">款式欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/style
     * Body:
     * {
     *   "styleID": "xxxx",
     *   "productName": "oooo",
     *   ...........
     * }
     * @apiSuccess (Success 200) {String} styleID 款式的資料庫唯一ID，可以拿來查詢或是修改使用
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "styleID": "5b6d0d03993dc24293de551c"
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    styleRouter.post('/style', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:127', 400);
        }
        else {
            try {
                let style = new Style_1.Style(ctx.request.body);
                style['createdTime']=new Date();
                let styleData = await style.save();
                if (styleData && styleData.styleID) {
                    let res = {
                        styleID: styleData.styleID
                    };
                    ctx.body = res;
                    ctx.status = 200;
                    ctx.respond = true;
                }
                else {
                    ctx.throw('db.invalidParameters:142', 400);
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:146', 400);
            }
        }
    });
    /**
     * @api {post} /style/update [款式]-修改
     * @apiDescription 修改款式資料
     * @apiGroup Style
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Object} condition 符合此條件的款式會被修改
     * @apiParam {String} condition.styleID 款號，目前只開放依照款號修改，將來若有需要批次修改的，再增加欄位
     * @apiParam {Object} update 欲修改的欄位
     * @apiParam {ooo} update.xxx 只需要填欲修改的欄位，沒有要修改的就不用填。欄位請參考: <a href="#style">款式欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/style/update
     * Body:
     * {
     *   "condition": {
     *     "styleID": "xxxx",
     *   },
     *   "update": {
     *     "status": 1,
     *     ...........
     *   }
     * }
     * @apiSuccess (Success 200) {Number} updateCount 修改成功的款式筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "updateCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse pd_styleNotFound
     * @apiUse db_dbNotReady
     */
    styleRouter.post('/style/update', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:185', 400);
        }
        else if (false === dbquery_1.checkRequestParamObject(ctx.request.body.condition)) {
            ctx.throw('db.invalidParameters:187', 400);
        }
        else if (false === dbquery_1.checkRequestParamObject(ctx.request.body.update)) {
            ctx.throw('db.invalidParameters:189', 400);
        }
        else {
            try {
                let query = {
                    where: ctx.request.body.condition,
                };
                let updateres = await Style_1.Style.update(ctx.request.body.update, query);
                if (updateres && Array.isArray(updateres)) {
                    let res = {
                        updateCount: updateres[0]
                    };
                    ctx.body = res;
                    ctx.status = 200;
                    ctx.respond = true;
                }
                else {
                    ctx.throw('db.invalidParameters:206', 400);
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:210', 400);
            }
        }
    });
    /**
     * @api {delete} /style [款式]-刪除
     * @apiDescription 刪除款式
     * @apiGroup Style
     * @apiVersion 0.0.1
     * @apiParam {String} styleID 款號
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/style
     * Body:
     * {
     *   "styleID": "xxxx"
     * }
     * @apiSuccess (Success 200) {Number} deleteCount 刪除成功的款式筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "deleteCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse pd_styleNotFound
     * @apiUse db_dbNotReady
     */
    styleRouter.delete('/style', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:239', 400);
        }
        else {
            try {
                let condition = {
                    where: ctx.request.body
                };
                let delcount = await Style_1.Style.destroy(condition);
                if (null !== delcount && undefined !== delcount) {
                    let res = {
                        deleteCount: delcount
                    };
                    ctx.body = res;
                    ctx.status = 200;
                    ctx.respond = true;
                }
                else {
                    ctx.throw('db.invalidParameters:256', 400);
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:260', 400);
            }
        }
    });
};
function UpdateBoms(style) {
    return new Promise(async (resolve, reject) => {
        let boms = await Material_1.Material.findAll({
            where: {
                style: style.styleID
            }
        });
        if (boms && Array.isArray(boms)) {
            for (let bom of boms) {
                style.BOM.push(bom.toJSON());
            }
            resolve(true);
        }
        else {
            resolve(false);
        }
    });
}
function UpdateOperation(style) {
    return new Promise(async (resolve, reject) => {
        let opers = await StyleOperation_1.StyleOperation.findAll({
            where: {
                style: style.styleID
            }
        });
        if (opers && Array.isArray(opers)) {
            for (let oper of opers) {
                style.operation.push(oper.toJSON());
            }
            resolve(true);
        }
        else {
            resolve(false);
        }
    });
}
function UpdateProcess(style) {
    return new Promise(async (resolve, reject) => {
        let processes = await StyleProcess_1.StyleProcess.findAll({
            where: {
                style: style.styleID
            }
        });
        if (processes && Array.isArray(processes)) {
            for (let proc of processes) {
                style.process.push(proc.toJSON());
            }
            resolve(true);
        }
        else {
            resolve(false);
        }
    });
}
function UpdateQualityStandard(style) {
    return new Promise(async (resolve, reject) => {
        let qss = await StyleQualityStandard_1.StyleQualityStandard.findAll({
            where: {
                style: style.styleID
            }
        });
        if (qss && Array.isArray(qss)) {
            for (let qs of qss) {
                style.qualityStandard.push(qs.toJSON());
            }
            resolve(true);
        }
        else {
            resolve(false);
        }
    });
}
function UpdateClient(style) {
    return new Promise(async (resolve, reject) => {
        let qs = await Client_1.Client.findById(style.client);
        if (qs) {
            style.client = qs.toJSON();
            resolve(true);
        }
        else {
            resolve(false);
        }
    });
}
function UpdateOrder(style) {
    return new Promise(async (resolve, reject) => {
        let qss = await Order_1.Order.findAll({
            where: {
                style: style.styleID
            }
        });
        if (qss && Array.isArray(qss)) {
            for (let qs of qss) {
                style.order.push(qs.toJSON());
            }
            resolve(true);
        }
        else {
            resolve(false);
        }
    });
}
