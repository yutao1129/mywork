"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Process_1 = require("../database/models/Process");
const ProcessStation_1 = require("../database/models/ProcessStation");
const dbquery_1 = require("../database/dbquery");
// export const accRouter = new KoaRouter();
exports.registerProcStationAPI = function (procStationRouter) {
    /**
     * @api {post} /processStation/search [工序工位]-查詢
     * @apiDescription 查詢符合條件的工序工位，並將結果分頁回傳
     * @apiGroup Order
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number=0} [pageIndex] 頁碼
     * @apiParam {Number=100} [maxRows] 每一頁的最大筆數
     * @apiParam {Object} [sort] 將結果指定欄位排序。1是從小到大排序，-1是從大到小。可指定的欄位請參考: <a href="#processStation">工序工位欄位定義</a> <p> 例如根據<code>id</code>從小到大排序就是：<code>{"id":1}</code>
     * @apiParam {Object} [query] 查詢條件。可以指定欄位等於某個值。
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/processStation/search
     * Body:
     * {
     *   "pageIndex": 0,
     *   "maxRows": 3,
     *   "sort": {
     *     "id": 1
     *   },
     *   "query": {
     *      "id": 123456
     *   }
     * }
     * @apiSuccess (Success 200) {Number} pageIndex 目前的頁碼
     * @apiSuccess (Success 200) {Number} maxRows 每一頁的最大筆數
     * @apiSuccess (Success 200) {Number} totalPage 總頁數
     * @apiSuccess (Success 200) {Array} records 查詢的結果。各欄位定義請參考: <a href="#processStation">工序工位欄位定義</a>
     * @apiSuccessExample {json} Response Example
     * {
     *   "pageIndex": 1,
     *   "maxRows": 100,
     *   "totalPage": 2,
     *   "records": [{
     *     "id": 123456
     *     "styleProcess": 1232,
     *     "station": 1111
     *     },
     *     ...
     *   ]
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    procStationRouter.post('/processStation/search', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:62', 400);
        }
        else {
            let resp = dbquery_1.queryResponsePacket(ctx.request.body);
            //let countQuery = queryTotalCount < ProcessStation > (ctx.request.body);
            //let query = queryDBGenerator < ProcessStation > (ctx.request.body);
            let query = dbquery_1.queryDBGeneratorEx(ctx.request.body, ProcessStation_1.processStationJoin);
            try {
                let orderdocInfo = await ProcessStation_1.ProcessStation.findAndCount(query);
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
                        await UpdateProcess(i);
                        resp.records.push(i);
                    }
                }
                /*try {
                    let count = await ProcessStation.count(countQuery);
                    if (0 === count) {
                        resp.totalPage = 0;
                    } else if (resp.maxRows > 0) {
                        resp.totalPage = Math.ceil(count / resp.maxRows);
                    } else {
                        resp.totalPage = 1;
                    }
    
                    if (undefined === query.offset || (query.offset && query.offset < count)) {
                        let processdoclist = await ProcessStation.findAll(query);
                        if (processdoclist && processdoclist.length > 0) {
                            processdoclist.map((item) => {
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
                ctx.throw('db.invalidQuery:96', 400);
            }
        }
    });
    /**
     * @api {post} /processStation [工序工位]-新增
     * @apiDescription 新增工序工位
     * @apiGroup Order
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number} orderDeliveryPlan 訂單交付計畫編號
     * @apiParam {Number} styleProcess 款式工序編號
     * @apiParam {Number} station 工位編號
     * @apiParam {Mix} [others] 其他欄位，請參考: <a href="#processStation">工序工位欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/processStation
     * Body:
     * {
     *   "orderDeliveryPlan": 123456,
     *   "styleProcess": 1232,
     *   "station": 1111,
     *   ...........
     * }
     * @apiSuccess (Success 200) {Number} id 工序工位編號，此為工序工位的資料庫唯一ID，可以拿來查詢或是修改使用
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "id": 123456
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    procStationRouter.post('/processStation', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:128', 400);
        }
        else {
            try {
                let proc = new ProcessStation_1.ProcessStation(ctx.request.body);
                let procdoc = await proc.save();
                if (procdoc && procdoc.id) {
                    let res = {
                        id: procdoc.id
                    };
                    ctx.body = res;
                    ctx.status = 200;
                    ctx.respond = true;
                }
                else {
                    ctx.throw('db.invalidParameters:143', 400);
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:147', 400);
            }
        }
    });
    /**
     * @api {post} /processStation/update [工序工位]-修改
     * @apiDescription 修改工序工位資料
     * @apiGroup Order
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Object} condition 符合此條件的工序工位會被修改
     * @apiParam {Number} condition.id 工序工位編號，目前只開放依照工序工位號修改，將來若有需要批次修改的，再增加欄位
     * @apiParam {Object} update 欲修改的欄位
     * @apiParam {ooo} update.xxx 只需要填欲修改的欄位，沒有要修改的就不用填。欄位請參考: <a href="#processStation">工序工位欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/processStation/update
     * Body:
     * {
     *   "condition": {
     *     "id": 123456
     *   },
     *   "update": {
     *     "orderDeliveryPlan": 123456,
     *     "styleProcess": 1232,
     *     "station": 1111
     *   }
     * }
     * @apiSuccess (Success 200) {Number} updateCount 修改成功的工序工位筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "updateCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    procStationRouter.post('/processStation/update', async (ctx) => {
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
                let updateres = await ProcessStation_1.ProcessStation.update(ctx.request.body.update, query);
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
     * @api {delete} /processStation [工序工位]-刪除
     * @apiDescription 刪除工序工位
     * @apiGroup Order
     * @apiVersion 0.0.1
     * @apiParam {Number} id 工序工位編號
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/processStation
     * Body:
     * {
     *   "id": 123456
     * }
     * @apiSuccess (Success 200) {Number} deleteCount 刪除成功的工序工位筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "deleteCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    procStationRouter.delete('/processStation', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:239', 400);
        }
        else {
            try {
                let condition = {
                    where: ctx.request.body
                };
                let delcount = await ProcessStation_1.ProcessStation.destroy(condition);
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
function UpdateProcess(processStation) {
    return new Promise(async (resolve, reject) => {
        if (processStation.styleProcessData) {
            let pid = [];
            let query3 = dbquery_1.queryDBGeneratorEx({
                query: {
                    id: processStation.styleProcessData.process
                }
            }, Process_1.processJoin);
            let qs3 = await Process_1.Process.findOne(query3);
            if (qs3) {
                processStation.styleProcessData.process = qs3.toJSON();
            }
        }
        return resolve(true);
    });
}
