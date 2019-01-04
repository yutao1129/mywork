"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FabricInspectionResult_1 = require("../database/models/FabricInspectionResult");
const dbquery_1 = require("../database/dbquery");
// export const accRouter = new KoaRouter();
exports.registerFabricInspectResAPI = function (fabricInspResRouter) {
    /**
     * @api {post} /fabricInspectionResult/search [驗布項目檢驗記錄]-查詢
     * @apiDescription 查詢符合條件的驗布項目檢驗記錄，並將結果分頁回傳
     * @apiGroup Warehouse
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number=0} [pageIndex] 頁碼
     * @apiParam {Number=100} [maxRows] 每一頁的最大筆數
     * @apiParam {Object} [sort] 將結果指定欄位排序。1是從小到大排序，-1是從大到小。可指定的欄位請參考: <a href="#fabricInspectionResult">驗布項目檢驗記錄欄位定義</a> <p> 例如根據<code>length</code>從小到大排序就是：<code>{"length":1}</code>
     * @apiParam {Object} [query] 查詢條件。可以指定欄位等於某個值，或是介於某個範圍。範圍用<code>[大於某值，小於某值]</code>來描述，範圍中的兩個值其中之一，可以設定為<code>null</code>，表示不指定，但不能兩者皆為<code>null</code><p> 例如想指定<code>length</code>大於0的驗布項目檢驗記錄就是：<code>{"length": [0, null]}</code>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/fabricInspectionResult/search
     * Body:
     * {
     *   "pageIndex": 0,
     *   "maxRows": 3,
     *   "sort": {
     *     "id": 1
     *   },
     *   "query": {
     *      "length": 12
     *   }
     * }
     * @apiSuccess (Success 200) {Number} pageIndex 目前的頁碼
     * @apiSuccess (Success 200) {Number} maxRows 每一頁的最大筆數
     * @apiSuccess (Success 200) {Number} totalPage 總頁數
     * @apiSuccess (Success 200) {Array} records 查詢的結果。各欄位定義請參考: <a href="#fabricInspectionResult">驗布項目檢驗記錄欄位定義</a>
     * @apiSuccessExample {json} Response Example
     * {
     *   "pageIndex": 1,
     *   "maxRows": 100,
     *   "totalPage": 2,
     *   "records": [{
     *     "length": 12,
     *     "fabricInspection": 11112,
     *     "fabricStandard": 12222,
     *     "value": 5.5,
     *     "area": 0,
     *     ...
     *     },
     *     ...
     *   ]
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    fabricInspResRouter.post('/fabricInspectionResult/search', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:63', 400);
        }
        else {
            let resp = dbquery_1.queryResponsePacket(ctx.request.body);
            //let countQuery = queryTotalCount < FabricInspectionResult > (ctx.request.body);
            //let query = queryDBGenerator < FabricInspectionResult > (ctx.request.body);
            let query = dbquery_1.queryDBGeneratorEx(ctx.request.body, FabricInspectionResult_1.fabricInspectionResultJoin);
            try {
                let orderdocInfo = await FabricInspectionResult_1.FabricInspectionResult.findAndCount(query);
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
                    let count = await FabricInspectionResult.count(countQuery);
                    if (0 === count) {
                        resp.totalPage = 0;
                    } else if (resp.maxRows > 0) {
                        resp.totalPage = Math.ceil(count / resp.maxRows);
                    } else {
                        resp.totalPage = 1;
                    }
    
                    if (undefined === query.offset || (query.offset && query.offset < count)) {
                        let fabrdoclist = await FabricInspectionResult.findAll(query);
                        if (fabrdoclist && fabrdoclist.length > 0) {
                            for (let item of fabrdoclist) {
                                let itemFmt = item.toJSON();
                                if (itemFmt.fabricInspection) {
                                    let fab = await FabricInspection.findById(itemFmt.fabricInspection);
                                    if (fab) {
                                        itemFmt.fabricInspection = fab.toJSON();
                                    }
                                }
                                if (itemFmt.fabricStandard) {
                                    let std = await FabricStandard.findById(item.fabricStandard);
                                    if (std) {
                                        itemFmt.fabricStandard = std.toJSON();
                                    }
                                }
    
                                resp.records.push(itemFmt);
                            }
                        }
                    }*/
                ctx.body = resp;
                ctx.status = 200;
                ctx.respond = true;
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidQuery:97', 400);
            }
        }
    });
    /**
     * @api {post} /fabricInspectionResult [驗布項目檢驗記錄]-新增
     * @apiDescription 新增驗布項目檢驗記錄
     * @apiGroup Warehouse
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number} fabricInspection 驗布記錄編號
     * @apiParam {Number} fabricStandard 驗布標準編號
     * @apiParam {Number} length 當前米長, 位置應由1開始. 當前米長 0 時 不計入不合格長度.
     * - 當檢驗項目為整卷布的數值時, 當前米長應設為0, 例如 {色差, value: "1/3"}, {鬆緊, value:"嚴重"} 為單卷檢驗總項時,不計入不合長度時,應將當前米長設為 0.
     * @apiParam {Number} value 檢驗項目值
     * @apiParam {Number} area 檢驗區域(0 or 1~4)
     * @apiParam {Mix} [others] 其他欄位，請參考: <a href="#fabricInspectionResult">驗布項目檢驗記錄欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/fabricInspectionResult
     * Body:
     * {
     *   "fabricInspection": 11112,
     *   "fabricStandard": 12222,
     *   "length": 12,
     *   "value": 5.5,
     *   "area": 0,
     *   ...........
     * }
     * @apiSuccess (Success 200) {String} id 驗布項目檢驗記錄的資料庫唯一ID，可以拿來查詢或是修改使用
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "id": "5b6d0d03993dc24293de551c"
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    fabricInspResRouter.post('/fabricInspectionResult', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:129', 400);
        }
        else {
            try {
                let prod = new FabricInspectionResult_1.FabricInspectionResult(ctx.request.body);
                let proddoc = await prod.save();
                if (proddoc && proddoc.id) {
                    let res = {
                        id: proddoc.id
                    };
                    ctx.body = res;
                    ctx.status = 200;
                    ctx.respond = true;
                }
                else {
                    ctx.throw('db.invalidParameters:144', 400);
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:157', 400);
            }
        }
    });
    /**
     * @api {post} /fabricInspectionResult/update [驗布項目檢驗記錄]-修改
     * @apiDescription 修改驗布項目檢驗記錄資料
     * @apiGroup Warehouse
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Object} condition 符合此條件的驗布項目檢驗記錄會被修改
     * @apiParam {Number} condition.id 驗布項目檢驗記錄編號，目前只開放依照驗布項目檢驗記錄編號修改，將來若有需要批次修改的，再增加欄位
     * @apiParam {Object} update 欲修改的欄位
     * @apiParam {ooo} update.xxx 只需要填欲修改的欄位，沒有要修改的就不用填。欄位請參考: <a href="#fabricInspectionResult">驗布項目檢驗記錄欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/fabricInspectionResult/update
     * Body:
     * {
     *   "condition": {
     *     id: 123456,
     *   },
     *   "update": {
     *     "length": 12,
     *     ...........
     *   }
     * }
     * @apiSuccess (Success 200) {Number} updateCount 修改成功的驗布項目檢驗記錄筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "updateCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    fabricInspResRouter.post('/fabricInspectionResult/update', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:186', 400);
        }
        else if (false === dbquery_1.checkRequestParamObject(ctx.request.body.condition)) {
            ctx.throw('db.invalidParameters:188', 400);
        }
        else if (false === dbquery_1.checkRequestParamObject(ctx.request.body.update)) {
            ctx.throw('db.invalidParameters:190', 400);
        }
        else {
            try {
                let query = {
                    where: ctx.request.body.condition,
                };
                let updateres = await FabricInspectionResult_1.FabricInspectionResult.update(ctx.request.body.update, query);
                if (updateres && Array.isArray(updateres)) {
                    let res = {
                        updateCount: updateres[0]
                    };
                    ctx.body = res;
                    ctx.status = 200;
                    ctx.respond = true;
                }
                else {
                    ctx.throw('db.invalidParameters:207', 400);
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:211', 400);
            }
        }
    });
    /**
     * @api {delete} /fabricInspectionResult [驗布項目檢驗記錄]-刪除
     * @apiDescription 刪除驗布項目檢驗記錄
     * @apiGroup Warehouse
     * @apiVersion 0.0.1
     * @apiParam {Number} id 驗布項目檢驗記錄編號
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/fabricInspectionResult
     * Body:
     * {
     *   "id": 123456
     * }
     * @apiSuccess (Success 200) {Number} deleteCount 刪除成功的驗布項目檢驗記錄筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "deleteCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    fabricInspResRouter.delete('/fabricInspectionResult', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:238', 400);
        }
        else {
            try {
                let condition = {
                    where: ctx.request.body
                };
                let delcount = await FabricInspectionResult_1.FabricInspectionResult.destroy(condition);
                if (null !== delcount && undefined !== delcount) {
                    let res = {
                        deleteCount: delcount
                    };
                    ctx.body = res;
                    ctx.status = 200;
                    ctx.respond = true;
                }
                else {
                    ctx.throw('db.invalidParameters:255', 400);
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:259', 400);
            }
        }
    });
    /**
     * @api {post} /fabricInspectionResult/report [驗布項目檢驗統計]-查詢
     * @apiDescription 查詢驗布項目記錄統計
     * @apiGroup Warehouse
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number} fabricInspection 驗布記錄 id
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/fabricInspectionResult/search
     * Body:
     * {
     *   "fabricInspection": 1
     * }
     * @apiSuccess (Success 200) {Array} records 查詢的結果
     * @apiSuccess (Success 200) {Object} records.data 統計資料物件
     * @apiSuccess (Success 200) {number} records.data.chekName   檢驗名稱
     * @apiSuccess (Success 200) {string} records.data.checkValue 檢驗值, null 為統計類別
     * @apiSuccess (Success 200) {number} records.data.score1Value 1分位 加總值.
     * @apiSuccess (Success 200) {number} records.data.score2Value 2分位 加總值.
     * @apiSuccess (Success 200) {number} records.data.score3Value 3分位 加總值.
     * @apiSuccess (Success 200) {number} records.data.score4Value 4分位 加總值.
     * @apiSuccessExample {json} Response Example
     * {
     *   "records": [
     *  {
     *      "chekName": "疵點",
     *      "checkValue": null,
     *      "score1Value": 2,
     *      "score2Value": 4,
     *      "score3Value": 6,
     *      "score4Value": 9
     *  },
     *  {
     *      "chekName": "破洞",
     *      "checkValue": null,
     *      "score1Value": 30,
     *      "score2Value": 60,
     *      "score3Value": 60,
     *      "score4Value": 90
     *  },
     *  {
     *      "chekName": "鬆緊",
     *      "checkValue": "嚴重",
     *      "score1Value": 0,
     *      "score2Value": 0,
     *      "score3Value": 0,
     *      "score4Value": 0
     *  },
     *     ...
     *   ]
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    fabricInspResRouter.post('/fabricInspectionResult/report', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:238', 400);
        }
        else {
            try {
                let params = ctx.request.body;
                let args = [];
                let sqlwheres = [];
                let sqlcmd = 'SELECT FStd.checkName as chekName, ' +
                    'FIR.value as checkValue,' +
                    'SUM(FIR.score1Value) as score1Value, SUM(FIR.score2Value) as score2Value, ' +
                    'SUM(FIR.score3Value) as score3Value, SUM(FIR.score4Value) as score4Value ' +
                    'FROM FabricInspectionResult as FIR ' +
                    'LEFT JOIN FabricStandard as FStd ON FIR.fabricStandard=FStd.id ';
                if (params.fabricInspection) {
                    sqlwheres.push('WHERE FIR.fabricInspection=? ');
                    args.push(params.fabricInspection);
                }
                sqlcmd += sqlwheres;
                sqlcmd += 'GROUP BY checkName, value;';
                let queryRes = await FabricInspectionResult_1.FabricInspectionResult.sequelize.query({ query: sqlcmd, values: args });
                if (queryRes && Array.isArray(queryRes) && Array.isArray(queryRes[0])) {
                    let reports = [];
                    for (let report of queryRes[0]) {
                        if ('string' === typeof report.score1Value) {
                            report.score1Value = Number.parseInt(report.score1Value);
                        }
                        if ('string' === typeof report.score2Value) {
                            report.score2Value = Number.parseInt(report.score2Value);
                        }
                        if ('string' === typeof report.score3Value) {
                            report.score3Value = Number.parseInt(report.score3Value);
                        }
                        if ('string' === typeof report.score4Value) {
                            report.score4Value = Number.parseInt(report.score4Value);
                        }
                        reports.push(report);
                    }
                    ctx.body = { records: reports };
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
    /**
     * @api {post} /fabricInspectionResult/bulk [驗布項目檢驗記錄]-新增多筆
     * @apiDescription 新增多筆驗布項目檢驗記錄
     * @apiGroup Warehouse
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number} crop 裁剪編號
     * @apiParam {String} size 尺寸
     * @apiParam {Number} packageNumber 包號
     * @apiParam {Number} layerAmount 層數
     * @apiParam {Mix} [others] 其他欄位，請參考: <a href="#fabricInspectionResult">驗布項目檢驗記錄欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/fabricInspectionResult/bulk
     * Body:
     * [
     *   {
     *     "fabricInspection": 11112,
     *     "fabricStandard": 12222,
     *     "length": 12,
     *     "value": 5.5,
     *     "area": 0,
     *     ...........
     *   },
     *   ......
     * ]
     * @apiSuccess (Success 200) {Array} id 驗布項目檢驗記錄的資料庫唯一ID，可以拿來查詢或是修改使用
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "id": [1,2,3]
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    fabricInspResRouter.post('/fabricInspectionResult/bulk', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:127', 400);
        }
        else {
            try {
                let orderdelidata = await FabricInspectionResult_1.FabricInspectionResult.bulkCreate(ctx.request.body);
                if (orderdelidata) {
                    let res = {
                        id: Array()
                    };
                    orderdelidata.map((item) => {
                        res.id.push(item.id);
                    });
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
};
