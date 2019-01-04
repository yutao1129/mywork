"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Crop_1 = require("../database/models/Crop");
const CropPackage_1 = require("../database/models/CropPackage");
const CropRecord_1 = require("../database/models/CropRecord");
const Order_1 = require("../database/models/Order");
const ColorCode_1 = require("../database/models/ColorCode");
const RFID_1 = require("../database/models/RFID");
const dbquery_1 = require("../database/dbquery");
// export const accRouter = new KoaRouter();
exports.registerCropAPI = function (cropRouter) {
    /**
     * @api {post} /crop/search [裁剪]-查詢
     * @apiDescription 查詢符合條件的裁剪，並將結果分頁回傳
     * @apiGroup Crop
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number=0} [pageIndex] 頁碼
     * @apiParam {Number=100} [maxRows] 每一頁的最大筆數
     * @apiParam {Object} [sort] 將結果指定欄位排序。1是從小到大排序，-1是從大到小。可指定的欄位請參考: <a href="#crop">裁剪欄位定義</a> <p> 例如根據<code>bedNumber</code>從小到大排序就是：<code>{"bedNumber":1}</code>
     * @apiParam {Object} [query] 查詢條件。可以指定欄位等於某個值，或是介於某個範圍。範圍用<code>[大於某值，小於某值]</code>來描述，範圍中的兩個值其中之一，可以設定為<code>null</code>，表示不指定，但不能兩者皆為<code>null</code><p> 例如想指定<code>bedNumber</code>大於0的裁剪就是：<code>{"bedNumber": [0, null]}</code>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/crop/search
     * Body:
     * {
     *   "pageIndex": 0,
     *   "maxRows": 3,
     *   "sort": {
     *     "id": 1
     *   },
     *   "query": {
     *      "bedNumber": 12
     *   }
     * }
     * @apiSuccess (Success 200) {Number} pageIndex 目前的頁碼
     * @apiSuccess (Success 200) {Number} maxRows 每一頁的最大筆數
     * @apiSuccess (Success 200) {Number} totalPage 總頁數
     * @apiSuccess (Success 200) {Array} records 查詢的結果。各欄位定義請參考: <a href="#crop">裁剪欄位定義</a>
     * @apiSuccessExample {json} Response Example
     * {
     *   "pageIndex": 1,
     *   "maxRows": 100,
     *   "totalPage": 2,
     *   "records": [{
     *     "bedNumber": 12,
     *     "part": "前片",
     *     "trussPlan": 1111,
     *     "orderDeliveryPlan": 2222,
     *     ...
     *     },
     *     ...
     *   ]
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    cropRouter.post('/crop/search', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:59', 400);
        }
        else {
            let resp = dbquery_1.queryResponsePacket(ctx.request.body);
            //let countQuery = queryTotalCount < Crop > (ctx.request.body);
            //let query = queryDBGenerator < Crop > (ctx.request.body);
            let query = dbquery_1.queryDBGeneratorEx(ctx.request.body, Crop_1.cropJoin);
            try {
                let orderdocInfo = await Crop_1.Crop.findAndCount(query);
                let count = orderdocInfo.count;
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
                        let itemFmt = item.toJSON();
                        if (itemFmt && itemFmt.truss && 'string' === typeof itemFmt.truss) {
                            itemFmt.truss = JSON.parse(itemFmt.truss);
                        }
                        await getTotal(itemFmt);
                        await updateCropPackage(itemFmt);
                        resp.records.push(itemFmt);
                        //resp.records.push(item.toJSON());
                    }
                    await updateCropCard(resp.records);
                }
                /*try {
                    let count = await Crop.count(countQuery);
                    if (0 === count) {
                        resp.totalPage = 0;
                    } else if (resp.maxRows > 0) {
                        resp.totalPage = Math.ceil(count / resp.maxRows);
                    } else {
                        resp.totalPage = 1;
                    }
    
                    if (undefined === query.offset || (query.offset && query.offset < count)) {
                        let cropdoclist = await Crop.findAll(query);
                        if (cropdoclist && cropdoclist.length > 0) {
                            cropdoclist.map((item) => {
                                resp.records.push(item.toJSON());
                            });
                        }
                    }*/
                ctx.body = resp;
                ctx.status = 200;
                ctx.respond = true;
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidQuery:89', 400);
            }
        }
    });
    /**
     * @api {post} /crop [裁剪]-新增
     * @apiDescription 新增裁剪
     * @apiGroup Crop
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {String} part 部件
     * @apiParam {Number} trussPlan 嘜架計畫編號
     * @apiParam {Number} orderDeliveryPlan 訂單交付計畫編號
     * @apiParam {Mix} [others] 其他欄位，請參考: <a href="#crop">裁剪欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/crop
     * Body:
     * {
     *   "part": "前片",
     *   "trussPlan": 1111,
     *   "orderDeliveryPlan": 2222,
     *   ...........
     * }
     * @apiSuccess (Success 200) {String} id 裁剪的資料庫唯一ID，可以拿來查詢或是修改使用
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "id": "5b6d0d03993dc24293de551c"
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    cropRouter.post('/crop', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:124', 400);
        }
        else {
            try {
                if (ctx.request.body.truss) {
                    ctx.request.body.truss = JSON.stringify(ctx.request.body.truss);
                }
                let code = new Crop_1.Crop(ctx.request.body);
                let codedata = await code.save();
                if (codedata && codedata.id) {
                    let res = {
                        id: codedata.id
                    };
                    ctx.body = res;
                    ctx.status = 200;
                    ctx.respond = true;
                }
                else {
                    ctx.throw('db.invalidParameters:139', 400);
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:143', 400);
            }
        }
    });
    /**
     * @api {post} /crop/update [裁剪]-修改
     * @apiDescription 修改裁剪資料
     * @apiGroup Crop
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Object} condition 符合此條件的裁剪會被修改
     * @apiParam {Number} condition.id 裁剪編號，目前只開放依照裁剪編號修改，將來若有需要批次修改的，再增加欄位
     * @apiParam {Object} update 欲修改的欄位
     * @apiParam {ooo} update.xxx 只需要填欲修改的欄位，沒有要修改的就不用填。欄位請參考: <a href="#crop">裁剪欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/crop/update
     * Body:
     * {
     *   "condition": {
     *     id: 123456,
     *   },
     *   "update": {
     *     "bedNumber": 12,
     *     ...........
     *   }
     * }
     * @apiSuccess (Success 200) {Number} updateCount 修改成功的裁剪筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "updateCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    cropRouter.post('/crop/update', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:184', 400);
        }
        else if (false === dbquery_1.checkRequestParamObject(ctx.request.body.condition)) {
            ctx.throw('db.invalidParameters:187', 400);
        }
        else if (false === dbquery_1.checkRequestParamObject(ctx.request.body.update)) {
            ctx.throw('db.invalidParameters:188', 400);
        }
        else {
            try {
                let query = {
                    where: ctx.request.body.condition,
                };
                if (ctx.request.body.update.truss) {
                    ctx.request.body.update.truss = JSON.stringify(ctx.request.body.update.truss);
                }
                let updateres = await Crop_1.Crop.update(ctx.request.body.update, query);
                if (updateres && Array.isArray(updateres)) {
                    let res = {
                        updateCount: updateres[0]
                    };
                    ctx.body = res;
                    ctx.status = 200;
                    ctx.respond = true;
                }
                else {
                    ctx.throw('db.invalidParameters:205', 400);
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:209', 400);
            }
        }
    });
    /**
     * @api {delete} /crop [裁剪]-刪除
     * @apiDescription 刪除裁剪
     * @apiGroup Crop
     * @apiVersion 0.0.1
     * @apiParam {Number} id 裁剪編號
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/crop
     * Body:
     * {
     *   "id": 123456
     * }
     * @apiSuccess (Success 200) {Number} deleteCount 刪除成功的裁剪筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "deleteCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    cropRouter.delete('/crop', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:235', 400);
        }
        else {
            try {
                let condition = {
                    where: ctx.request.body
                };
                let delcount = await Crop_1.Crop.destroy(condition);
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
    /**
     * @api {post} /crop/nextBedNumber [裁剪]-下一個床號
     * @apiDescription 得到同一訂單交期的下一個床號
     * @apiGroup Crop
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {String} orderID 訂單號
     * @apiParam {String} deliveryDate 訂單交期
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/crop/nextBedNumber
     * Body:
     * {
     *   "orderID": "xxxx",
     *   "deliveryDate": "2018-10-10"
     * }
     * @apiSuccess (Success 200) {Number} bedNumber 床號
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "bedNumber": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    cropRouter.post('/crop/nextBedNumber', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:124', 400);
        }
        else {
            try {
                let orderID = ctx.request.body.orderID;
                let deliveryDate = ctx.request.body.deliveryDate;
                if (!orderID || !deliveryDate) {
                    return ctx.throw('db.invalidParameters:328', 400);
                }
                let bn = await getNextBedNumber(orderID, deliveryDate);
                if (bn >= 1) {
                    /*let sqlcmd: string = 'SELECT MAX(C.bedNumber) as bn FROM vegadb.Crop as C, vegadb.Order as O WHERE C.order = O.id and O.orderID = "' + orderID + '" and O.deliveryDate = "' + deliveryDate + '"';
                    let queryRes = await Crop.sequelize.query(sqlcmd);
    
                    if (queryRes && Array.isArray(queryRes) && Array.isArray(queryRes[0])) {
                        let bn = Number.parseInt(queryRes[0][0].bn) || 0;*/
                    let res = {
                        bedNumber: bn
                    };
                    ctx.body = res;
                    ctx.status = 200;
                    ctx.respond = true;
                }
                else {
                    ctx.throw('db.invalidParameters:139', 400);
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:143', 400);
            }
        }
    });
    /**
     * @api {post} /crop/all [裁剪]-新增一床所有紀錄
     * @apiDescription 新增一床的所有裁剪與分包紀錄，床號與剪裁編號免填
     * @apiGroup Crop
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Object} crop 裁剪資料，一次一床，欄位請參考: <a href="#api-Crop-PostCrop">裁剪欄位定義</a>
     * @apiParam {Array} cropRecord 裁剪紀錄，一次多筆，欄位請參考: <a href="#api-Crop-PostCroprecordBulk">裁剪紀錄欄位定義</a>
     * @apiParam {Array} cropPackage 裁剪分包，一次多筆，欄位請參考: <a href="#api-Crop-PostCroppackageBulk">裁剪分包欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/crop/all
     * Body:
     * {
     *   "crop": {},
     *   "cropRecord": [{},{}],
     *   "cropPackage": [{},{}]
     * }
     * @apiSuccess (Success 200) {Array} id 裁剪的資料庫唯一ID，可以拿來查詢或是修改使用
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "crop": 1,
     *   "cropRecord": [1,2],
     *   "cropPackage": [1,2],
     *   "bedNumber": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    cropRouter.post('/crop/all', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:127', 400);
        }
        else {
            try {
                let res = {};
                if (ctx.request.body.crop) {
                    let query = dbquery_1.queryDBGeneratorEx({
                        query: { "id": ctx.request.body.crop.order }
                    }, Order_1.orderJoin);
                    let qs = await Order_1.Order.findOne(query);
                    let orderID = null;
                    let deliveryDate = null;
                    if (qs) {
                        let qsData = qs.toJSON();
                        orderID = qsData.orderID;
                        deliveryDate = qsData.deliveryDate;
                    }
                    if (!orderID || !deliveryDate) {
                        return ctx.throw('db.invalidParameters:408', 400);
                    }
                    let bn = await getNextBedNumber(orderID, deliveryDate);
                    if (bn < 0) {
                        return ctx.throw('db.invalidParameters:413', 400);
                    }
                    ctx.request.body.crop.bedNumber = bn;
                    if (ctx.request.body.crop.truss) {
                        ctx.request.body.crop.truss = JSON.stringify(ctx.request.body.crop.truss);
                    }
                    let code = new Crop_1.Crop(ctx.request.body.crop);
                    let codedata = await code.save();
                    if (codedata && codedata.id) {
                        res.crop = codedata.id;
                        res.bedNumber = bn;
                    }
                }
                if (ctx.request.body.cropRecord && Array.isArray(ctx.request.body.cropRecord) && ctx.request.body.cropRecord.length > 0) {
                    ctx.request.body.cropRecord.map((item) => {
                        item.crop = res.crop;
                    });
                    let recordData = await CropRecord_1.CropRecord.bulkCreate(ctx.request.body.cropRecord);
                    if (recordData) {
                        res.cropRecord = [];
                        recordData.map((item) => {
                            res.cropRecord.push(item.id);
                        });
                    }
                }
                if (ctx.request.body.cropPackage && Array.isArray(ctx.request.body.cropPackage) && ctx.request.body.cropPackage.length > 0) {
                    ctx.request.body.cropPackage.map((item) => {
                        item.crop = res.crop;
                    });
                    let packageData = await CropPackage_1.CropPackage.bulkCreate(ctx.request.body.cropPackage);
                    if (packageData) {
                        res.cropPackage = [];
                        packageData.map((item) => {
                            res.cropPackage.push(item.id);
                        });
                    }
                }
                ctx.body = res;
                ctx.status = 200;
                ctx.respond = true;
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:146', 400);
            }
        }
    });
};
function getNextBedNumber(orderID, deliveryDate) {
    return new Promise(async (resolve, reject) => {
        let sqlcmd = 'SELECT MAX(C.bedNumber) as bn FROM Crop as C, `Order` as O WHERE C.order = O.id and O.orderID = "' + orderID + '" and O.deliveryDate = "' + deliveryDate + '"';
        let queryRes = await Crop_1.Crop.sequelize.query(sqlcmd);
        if (queryRes && Array.isArray(queryRes) && Array.isArray(queryRes[0])) {
            let bn = Number.parseInt(queryRes[0][0].bn) || 0;
            return resolve(bn + 1);
        }
        return resolve(-1);
    });
}
function getTotal(crop) {
    return new Promise(async (resolve, reject) => {
        if (crop && crop.order && crop.bedNumber) {
            //let sqlcmd: string = "SELECT SUM(R.length) as totalLength, SUM(R.layer) as totalLayer, COUNT(R.id) as totalVolume, C.order as 'order', C.bedNumber as bedNumber FROM vegadb.Crop as C, vegadb.CropRecord as R WHERE C.id = R.crop GROUP BY C.order, C.bedNumber";
            let sqlcmd = 'SELECT SUM(R.length) as totalLength, SUM(R.layer) as totalLayer, COUNT(R.id) as totalVolume FROM Crop as C, CropRecord as R WHERE C.id = R.crop and C.order = ' + crop.order + ' and C.bedNumber = ' + crop.bedNumber;
            let queryRes = await Crop_1.Crop.sequelize.query(sqlcmd);
            if (queryRes && Array.isArray(queryRes) && Array.isArray(queryRes[0])) {
                //let bn = Number.parseInt(queryRes[0][0].bn) || 0;
                crop.totalLength = Number.parseInt(queryRes[0][0].totalLength) || null;
                crop.totalLayer = Number.parseInt(queryRes[0][0].totalLayer) || null;
                crop.totalVolume = Number.parseInt(queryRes[0][0].totalVolume) || null;
            }
        }
        return resolve(true);
    });
}
function updateCropPackage(crop) {
    return new Promise(async (resolve, reject) => {
        if (crop && crop.cropPackageData) {
            let ps = [];
            crop.cropPackageData.map((item) => {
                ps.push(item.id);
            });
            let query = dbquery_1.queryDBGeneratorEx({
                target: {
                    values: ps,
                    pkey: "id"
                }
            }, CropPackage_1.cropPackageJoin);
            let totalCard = 0;
            let qs = await CropPackage_1.CropPackage.findAndCount(query);
            if (qs) {
                crop.cropPackageData = [];
                for (let item of qs.rows) {
                    let i = item.toJSON();
                    totalCard += (i.cropCardData ? i.cropCardData.length : 0);
                    crop.cropPackageData.push(i);
                }
            }
            crop.totalCard = totalCard;
        }
        return resolve(true);
    });
}
function updateCropCard(crop) {
    return new Promise(async (resolve, reject) => {
        if (crop && crop.length > 0) {
            let colorSet = new Set();
            crop.map((c) => {
                if (c.cropPackageData && c.cropPackageData.length > 0) {
                    c.cropPackageData.map((cp) => {
                        if (cp.cropCardData && cp.cropCardData.length > 0) {
                            cp.cropCardData.map((cc) => {
                                if (cc.colorCode) {
                                    colorSet.add(cc.colorCode);
                                }
                            });
                        }
                    });
                }
            });
            let colorList = Array.from(colorSet);
            if (colorList.length === 0) {
                return resolve(true);
            }
            let query = dbquery_1.queryDBGeneratorEx({
                target: {
                    values: colorSet,
                    pkey: "id"
                }
            });
            let qs = await ColorCode_1.ColorCode.findAndCount(query);
            if (qs) {
                for (let item of qs.rows) {
                    let i = item.toJSON();
                    crop.map((c) => {
                        if (c.cropPackageData && c.cropPackageData.length > 0) {
                            c.cropPackageData.map((cp) => {
                                if (cp.cropCardData && cp.cropCardData.length > 0) {
                                    cp.cropCardData.map((cc) => {
                                        if (cc.colorCode === i.id) {
                                            cc.colorCode = i;
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            }

            //RFID
            let rfidSet = new Set();
            crop.map((c) => {
                if (c.cropPackageData && c.cropPackageData.length > 0) {
                    c.cropPackageData.map((cp) => {
                        if (cp.cropCardData && cp.cropCardData.length > 0) {
                            cp.cropCardData.map((cc) => {
                                if (cc.rfid) {
                                    rfidSet.add(cc.rfid);
                                }
                            });
                        }
                    });
                }
            });
            let rfidList = Array.from(rfidSet);
            if (rfidList.length === 0) {
                return resolve(true);
            }
            let queryRfid = dbquery_1.queryDBGeneratorEx({
                target: {
                    values: rfidSet,
                    pkey: "id"
                }
            });
            qs = await RFID_1.RFID.findAndCount(queryRfid);
            if (qs) {
                for (let item of qs.rows) {
                    let i = item.toJSON();
                    crop.map((c) => {
                        if (c.cropPackageData && c.cropPackageData.length > 0) {
                            c.cropPackageData.map((cp) => {
                                if (cp.cropCardData && cp.cropCardData.length > 0) {
                                    cp.cropCardData.map((cc) => {
                                        if (cc.rfid === i.id) {
                                            cc['rfidData']=i;
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            }
        }
        return resolve(true);
    });
}
