"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Station_1 = require("../database/models/Station");
const ProcessStation_1 = require("../database/models/ProcessStation");
const Style_1 = require("../database/models/Style");
const dbquery_1 = require("../database/dbquery");
// export const accRouter = new KoaRouter();
exports.registerStationAPI = function (stationRouter) {
    /**
     * @api {post} /station/search [工位]-查詢
     * @apiDescription 查詢符合條件的工位，並將結果分頁回傳
     * @apiGroup Style
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number=0} [pageIndex] 頁碼
     * @apiParam {Number=100} [maxRows] 每一頁的最大筆數
     * @apiParam {Object} [sort] 將結果指定欄位排序。1是從小到大排序，-1是從大到小。可指定的欄位請參考: <a href="#station">工位欄位定義</a> <p> 例如根據<code>stationID</code>從小到大排序就是：<code>{"stationID":1}</code>
     * @apiParam {Object} [query] 查詢條件。可以指定欄位等於某個值，或是介於某個範圍。範圍用<code>[大於某值，小於某值]</code>來描述，範圍中的兩個值其中之一，可以設定為<code>null</code>，表示不指定，但不能兩者皆為<code>null</code><p> 例如想指定<code>trussID</code>大於0的工位就是：<code>{"trussID": [0, null]}</code>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/station/search
     * Body:
     * {
     *   "pageIndex": 0,
     *   "maxRows": 3,
     *   "sort": {
     *     "id": 1
     *   },
     *   "query": {
     *      "operator": "張三"
     *   }
     * }
     * @apiSuccess (Success 200) {Number} pageIndex 目前的頁碼
     * @apiSuccess (Success 200) {Number} maxRows 每一頁的最大筆數
     * @apiSuccess (Success 200) {Number} totalPage 總頁數
     * @apiSuccess (Success 200) {Array} records 查詢的結果。各欄位定義請參考: <a href="#station">工位欄位定義</a>
     * @apiSuccessExample {json} Response Example
     * {
     *   "pageIndex": 1,
     *   "maxRows": 100,
     *   "totalPage": 2,
     *   "records": [{
     *     "operator": "張三",
     *     ...
     *     },
     *     ...
     *   ]
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    stationRouter.post('/station/search', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:63', 400);
        }
        else {
            let resp = dbquery_1.queryResponsePacket(ctx.request.body);
            //let countQuery = queryTotalCount < Station > (ctx.request.body);
            //let query = queryDBGenerator < Station > (ctx.request.body);
            let query = dbquery_1.queryDBGeneratorEx(ctx.request.body, Station_1.stationJoin);
            try {
                let orderdocInfo = await Station_1.Station.findAndCount(query);
                let count = orderdocInfo.count;
                // let count = await Order.count(countQuery);
                if (0 === count) {
                    resp.totalPage = 0;
                }
                else if (resp.maxRows > 0) {
                    resp.totalPage = Math.ceil(count / resp.maxRows);
                }
                else {
                    resp.totalPage = 1;
                }
                if (orderdocInfo && orderdocInfo.rows) {
                    for (let item of orderdocInfo.rows) {
                        let i = item.toJSON();
                        await UpdatePrevStation(i);
                        await UpdateProcessStation(i);
                        resp.records.push(i);
                    }
                }
                /*try {
                    let count = await Station.count(countQuery);
                    if (0 === count) {
                        resp.totalPage = 0;
                    } else if (resp.maxRows > 0) {
                        resp.totalPage = Math.ceil(count / resp.maxRows);
                    } else {
                        resp.totalPage = 1;
                    }
    
                    if (undefined === query.offset || (query.offset && query.offset < count)) {
                        let stationdoclist = await Station.findAll(query);
                        if (stationdoclist && stationdoclist.length > 0) {
                            stationdoclist.map((item) => {
                                let itemFmt = item.toJSON();
                                resp.records.push(itemFmt);
                            });
                        }
                    }*/
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
     * @api {post} /station [工位]-新增
     * @apiDescription 新增工位
     * @apiGroup Style
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {String} stationID 工位號
     * @apiParam {Number} operator 操作人員
     * @apiParam {Number} nextStation 下一工位編號
     * @apiParam {Mix} [others] 其他欄位，請參考: <a href="#station">工位欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/station
     * Body:
     * {
     *   "stationID": "xxxx",
     *   "operator": "張三",
     *   "nextStation": 12354
     * }
     * @apiSuccess (Success 200) {String} id 工位的資料庫唯一ID，可以拿來查詢或是修改使用
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "id": "5b6d0d03993dc24293de551c"
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    stationRouter.post('/station', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:127', 400);
        }
        else {
            try {
                let station = new Station_1.Station(ctx.request.body);
                let stationData = await station.save();
                if (stationData && stationData.id) {
                    let res = {
                        id: stationData.id
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
     * @api {post} /station/update [工位]-修改
     * @apiDescription 修改工位資料
     * @apiGroup Style
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Object} condition 符合此條件的工位會被修改
     * @apiParam {Number} condition.id 工位編號，目前只開放依照工位編號修改，將來若有需要批次修改的，再增加欄位
     * @apiParam {Object} update 欲修改的欄位
     * @apiParam {ooo} update.xxx 只需要填欲修改的欄位，沒有要修改的就不用填。欄位請參考: <a href="#station">工位欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/station/update
     * Body:
     * {
     *   "condition": {
     *     "id": 123456,
     *   },
     *   "update": {
     *     "operator": "張三",
     *     ...........
     *   }
     * }
     * @apiSuccess (Success 200) {Number} updateCount 修改成功的工位筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "updateCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    stationRouter.post('/station/update', async (ctx) => {
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
                let updateres = await Station_1.Station.update(ctx.request.body.update, query);
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
     * @api {delete} /station [工位]-刪除
     * @apiDescription 刪除工位
     * @apiGroup Style
     * @apiVersion 0.0.1
     * @apiParam {Number} id 工位編號
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/station
     * Body:
     * {
     *   "id": 123456
     * }
     * @apiSuccess (Success 200) {Number} deleteCount 刪除成功的工位筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "deleteCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    stationRouter.delete('/station', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:239', 400);
        }
        else {
            try {
                let condition = {
                    where: ctx.request.body
                };
                let delcount = await Station_1.Station.destroy(condition);
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
function UpdatePrevStation(station) {
    return new Promise(async (resolve, reject) => {
        if (station && station.id) {
            let query = dbquery_1.queryDBGeneratorEx({
                query: { "nextStation": station.id }
            }, Station_1.stationJoin);
            let qs = await Station_1.Station.findAndCount(query);
            if (qs) {
                station.prevStationData = [];
                for (let item of qs.rows) {
                    station.prevStationData.push(item.toJSON());
                }
            }
        }
        return resolve(true);
    });
}
function UpdateProcessStation(station) {
    return new Promise(async (resolve, reject) => {
        if (station && station.processStationData) {
            let ps = [];
            station.processStationData.map((item) => {
                ps.push(item.id);
            });
            let query = dbquery_1.queryDBGeneratorEx({
                target: {
                    values: ps,
                    pkey: "id"
                }
            }, ProcessStation_1.processStationJoin);
            let qs = await ProcessStation_1.ProcessStation.findAndCount(query);
            if (qs) {
                station.processStationData = [];
                for (let item of qs.rows) {
                    station.processStationData.push(item.toJSON());
                }
            }
            if (station.processStationData && station.processStationData[0] && station.processStationData[0].styleProcessData && station.processStationData[0].styleProcessData.style) {
                let subJoin = dbquery_1.spliceJoinInfo(Style_1.styleJoin, ['Client'], undefined);
                let query2 = dbquery_1.queryDBGeneratorEx({
                    query: { "styleID": station.processStationData[0].styleProcessData.style }
                }, subJoin);
                let qs = await Style_1.Style.findOne(query2);
                if (qs) {
                    station.styleData = qs.toJSON();
                }
            }
        }
        return resolve(true);
    });
}
