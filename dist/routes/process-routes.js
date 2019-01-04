"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Process_1 = require("../database/models/Process");
const dbquery_1 = require("../database/dbquery");
//export const accRouter = new KoaRouter();
exports.registerProcessAPI = function (processRouter) {
    /**
     * @api {post} /process/search [工序]-查詢
     * @apiDescription 查詢符合條件的工序，並將結果分頁回傳
     * @apiGroup Knowledge Base
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number=0} [pageIndex] 頁碼
     * @apiParam {Number=100} [maxRows] 每一頁的最大筆數
     * @apiParam {Object} [sort] 將結果指定欄位排序。1是從小到大排序，-1是從大到小。可指定的欄位請參考: <a href="#process">工序欄位定義</a> <p> 例如根據<code>processID</code>從小到大排序就是：<code>{"processID":1}</code>
     * @apiParam {Object} [query] 查詢條件。可以指定欄位等於某個值。
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/process/search
     * Body:
     * {
     *   "pageIndex": 0,
     *   "maxRows": 3,
     *   "sort": {
     *     "id": 1
     *   },
     *   "query": {
     *      "processID": 123456
     *   }
     * }
     * @apiSuccess (Success 200) {Number} pageIndex 目前的頁碼
     * @apiSuccess (Success 200) {Number} maxRows 每一頁的最大筆數
     * @apiSuccess (Success 200) {Number} totalPage 總頁數
     * @apiSuccess (Success 200) {Array} records 查詢的結果。各欄位定義請參考: <a href="#process">工序欄位定義</a>
     * @apiSuccessExample {json} Response Example
     * {
     *   "pageIndex": 1,
     *   "maxRows": 100,
     *   "totalPage": 2,
     *   "records": [{
     *     "processID": 123456
     *     ...
     *     },
     *     ...
     *   ]
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    processRouter.post('/process/search', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:62', 400);
        }
        else {
            let resp = dbquery_1.queryResponsePacket(ctx.request.body);
            //let countQuery = queryTotalCount < Process > (ctx.request.body);
            //let query = queryDBGenerator < Process > (ctx.request.body);
            let query = dbquery_1.queryDBGeneratorEx(ctx.request.body, Process_1.processJoin);
            try {
                let orderdocInfo = await Process_1.Process.findAndCount(query);
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
                        resp.records.push(item.toJSON());
                    }
                }
                /*try {
                    let count = await Process.count(countQuery);
                    if (0 === count) {
                        resp.totalPage = 0;
                    } else if (resp.maxRows > 0) {
                        resp.totalPage = Math.ceil(count / resp.maxRows);
                    } else {
                        resp.totalPage = 1;
                    }
    
                    if (undefined === query.offset || (query.offset && query.offset < count)) {
                        let processdoclist = await Process.findAll(query);
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
                ctx.throw('db.invalidQuery:93', 400);
            }
        }
    });
    /**
     * @api {post} /process [工序]-新增
     * @apiDescription 新增工序
     * @apiGroup Knowledge Base
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {String} processID 工序號
     * @apiParam {String} type 工序類型(車縫/前道/後道)
     * @apiParam {String} name 工序名稱
     * @apiParam {String} part 部件
     * @apiParam {Number} workingHours 標準工時
     * @apiParam {Number} workingPrice 工價
     * @apiParam {String} operationalRequirement 操作要求
     * @apiParam {Mix} [others] 其他欄位，請參考: <a href="#process">工序欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/process
     * Body:
     * {
     *   "processID": 123456,
     *   "type": "車縫",
     *   "name": "工序01"
     *   ...........
     * }
     * @apiSuccess (Success 200) {String} id 工序編號，此為工序的資料庫唯一ID，可以拿來查詢或是修改使用
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "id": 123456
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    processRouter.post('/process', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:125', 400);
        }
        else {
            try {
                let proc = new Process_1.Process(ctx.request.body);
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
                    ctx.throw('db.invalidParameters:140', 400);
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:144', 400);
            }
        }
    });
    /**
     * @api {post} /process/update [工序]-修改
     * @apiDescription 修改工序資料
     * @apiGroup Knowledge Base
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Object} condition 符合此條件的工序會被修改
     * @apiParam {String} condition.id 工序編號，目前只開放依照工序號修改，將來若有需要批次修改的，再增加欄位
     * @apiParam {Object} update 欲修改的欄位
     * @apiParam {ooo} update.xxx 只需要填欲修改的欄位，沒有要修改的就不用填。欄位請參考: <a href="#process">工序欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/process/update
     * Body:
     * {
     *   "condition": {
     *     id: 123456
     *   },
     *   "update": {
     *     ...........
     *   }
     * }
     * @apiSuccess (Success 200) {Number} updateCount 修改成功的工序筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "updateCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    processRouter.post('/process/update', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:182', 400);
        }
        else if (false === dbquery_1.checkRequestParamObject(ctx.request.body.condition)) {
            ctx.throw('db.invalidParameters:184', 400);
        }
        else if (false === dbquery_1.checkRequestParamObject(ctx.request.body.update)) {
            ctx.throw('db.invalidParameters:186', 400);
        }
        else {
            try {
                let query = {
                    where: ctx.request.body.condition,
                };
                let updateres = await Process_1.Process.update(ctx.request.body.update, query);
                if (updateres && Array.isArray(updateres)) {
                    let res = {
                        updateCount: updateres[0]
                    };
                    ctx.body = res;
                    ctx.status = 200;
                    ctx.respond = true;
                }
                else {
                    ctx.throw('db.invalidParameters:203', 400);
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:207', 400);
            }
        }
    });
    /**
     * @api {delete} /process [工序]-刪除
     * @apiDescription 刪除工序
     * @apiGroup Knowledge Base
     * @apiVersion 0.0.1
     * @apiParam {String} id 工序編號
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/process
     * Body:
     * {
     *   "id": 123456
     * }
     * @apiSuccess (Success 200) {Number} deleteCount 刪除成功的工序筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "deleteCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    processRouter.delete('/process', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:235', 400);
        }
        else {
            try {
                let condition = {
                    where: ctx.request.body
                };
                let delcount = await Process_1.Process.destroy(condition);
                if (null !== delcount && undefined !== delcount) {
                    let res = {
                        deleteCount: delcount
                    };
                    ctx.body = res;
                    ctx.status = 200;
                    ctx.respond = true;
                }
                else {
                    ctx.throw('db.invalidParameters:252', 400);
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:256', 400);
            }
        }
    });
};
