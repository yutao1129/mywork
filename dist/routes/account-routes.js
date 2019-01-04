"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const UserAccount_1 = require("../database/models/UserAccount");
const dbquery_1 = require("../database/dbquery");
const AccountRole_1 = require("../database/models/AccountRole");
exports.registerAccountAPI = function (accRouter) {
    /**
     * @api {post} /account/search [個人帳號]-查詢
     * @apiDescription 查詢符合條件的帳號，並將結果分頁回傳
     * @apiGroup Account
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Number=0} [pageIndex] 頁碼
     * @apiParam {Number=100} [maxRows] 每一頁的最大筆數
     * @apiParam {Object} [sort] 將結果指定欄位排序。1是從小到大排序，-1是從大到小。可指定的欄位請參考: <a href="#account">帳號欄位定義</a> <p> 例如根據<code>id</code>從小到大排序就是：<code>{"id":1}</code>
     * @apiParam {Object} [query] 查詢條件。可以指定欄位等於某個值，或是介於某個範圍。範圍用<code>[大於某值，小於某值]</code>來描述，範圍中的兩個值其中之一，可以設定為<code>null</code>，表示不指定，但不能兩者皆為<code>null</code><p> 例如想指定2000年之後才進入公司的人員就是：<code>{"createdTime": ["2000-01-01T00:00:00+08:00", null]}</code>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/account/search
     * Body:
     * {
     *   "pageIndex": 0,
     *   "maxRows": 3,
     *   "sort": {
     *     "id": 1
     *   },
     *   "query": {
     *      "createdTime": ["2017-11-10T00:00:00+08:00", "2017-11-20T24:00:00+08:00"],
     *      "role": "廠長"
     *   }
     * }
     * @apiSuccess (Success 200) {Number} pageIndex 目前的頁碼
     * @apiSuccess (Success 200) {Number} maxRows 每一頁的最大筆數
     * @apiSuccess (Success 200) {Number} totalPage 總頁數
     * @apiSuccess (Success 200) {Array} records 查詢的結果。各欄位定義請參考: <a href="#account">帳號欄位定義</a>
     * @apiSuccessExample {json} Response Example
     * {
     *   "pageIndex": 1,
     *   "maxRows": 100,
     *   "totalPage": 2,
     *   "records": [{
     *     "name": "XXX",
     *     "birthday": "2017-11-10T00:00:00+08:00",
     *     ...
     *     },
     *     ...
     *   ]
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    accRouter.post('/account/search', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:61', 400);
        }
        else {
            let resp = dbquery_1.queryResponsePacket(ctx.request.body);
            //let countQuery = queryTotalCount < UserAccount > (ctx.request.body);
            //let query = queryDBGeneratorEx < UserAccount > (ctx.request.body);
            //let query = queryDBGeneratorEx < UserAccount > (ctx.request.body, userAccountJoin);
            let itemList = [];
            if (ctx.request.body.query && ctx.request.body.query.role) {
                let sqlcmd = 'SELECT account FROM AccountRole WHERE role = "' + ctx.request.body.query.role + '"';
                let queryRes = await AccountRole_1.AccountRole.sequelize.query(sqlcmd);
                if (queryRes && Array.isArray(queryRes) && Array.isArray(queryRes[0])) {
                    queryRes[0].forEach((i) => {
                        itemList.push(Number.parseInt(i.account));
                    });
                }
                delete ctx.request.body.query.role;
            }
            let query = null;
            if (itemList.length > 0) {
                let advFilter = {
                    id: {
                        [Op.in]: itemList
                    }
                };
                query = dbquery_1.queryDBGeneratorEx(ctx.request.body, UserAccount_1.userAccountJoin, advFilter);
            }
            else {
                query = dbquery_1.queryDBGeneratorEx(ctx.request.body, UserAccount_1.userAccountJoin);
            }
            try {
                let orderdocInfo = await UserAccount_1.UserAccount.findAndCount(query);
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
                        resp.records.push(item.toJSON());
                    }
                    for (let acc of resp.records) {
                        let rolesdoc = await AccountRole_1.AccountRole.findAll({ where: { account: acc.id } });
                        if (rolesdoc) {
                            acc.role = [];
                            rolesdoc.map((roleitem) => {
                                acc.role.push(roleitem.role);
                            });
                        }
                    }
                }
                /*try {
                  let count = await UserAccount.count(countQuery);
                  if (0 === count) {
                    resp.totalPage = 0;
                  } else if (resp.maxRows > 0) {
                    resp.totalPage = Math.ceil(count / resp.maxRows);
                  } else {
                    resp.totalPage = 1;
                  }
          
                  if (undefined === query.offset || (query.offset && query.offset < count)) {
                    let accdoclist = await UserAccount.findAll(query);
                    if (accdoclist && accdoclist.length > 0) {
                      accdoclist.map((item) => {
                        let acc: any = item.toJSON();
                        acc.role = [];
                        resp.records.push(acc);
                      });
          
                      for(let acc of resp.records) {
                        let rolesdoc = await AccountRole.findAll({ where : { account: acc.id }});
                        if (rolesdoc) {
                          rolesdoc.map((roleitem) => {
                            acc.role.push(roleitem.role);
                          });
                        }
                      }
                    }
          
                  }*/
                ctx.body = resp;
                ctx.status = 200;
                ctx.respond = true;
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidQuery:91', 400);
            }
        }
    });
    /**
     * @api {post} /account [個人帳號]-新增
     * @apiDescription 新增個人帳號
     * @apiGroup Account
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {String} username 帳號
     * @apiParam {String} password 密碼
     * @apiParam {Mix} [others] 其他欄位，請參考: <a href="#account">帳號欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/account
     * Body:
     * {
     *   "username": "abcedf",
     *   "password": "oxoxox",
     *   "mobilePhone": "0123456789"
     *   "birthday": "2000/1/1"
     *   ...........
     * }
     * @apiSuccess (Success 204) {Number} - No Content
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    accRouter.post('/account', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:122', 400);
        }
        else {
            try {
                let roles = [];
                if (ctx.request.body.role) {
                    if (Array.isArray(ctx.request.body.role)) {
                        for (let role of ctx.request.body.role) {
                            if ('string' === typeof role) {
                                roles.push(role);
                            }
                        }
                    }
                    delete ctx.request.body.role;
                }
                let acc = new UserAccount_1.UserAccount(ctx.request.body);
                let accdata = await acc.save();
                if (roles.length > 0) {
                    let roleitems = [];
                    for (let role of roles) {
                        let roleJoin = new AccountRole_1.AccountRole({
                            account: acc.id,
                            role: role
                        });
                        roleitems.push(roleJoin.save());
                    }
                    let rolesJoins = await Promise.all(roleitems);
                    rolesJoins.map((jitem) => {
                        console.log(jitem.toJSON());
                    });
                }
                if (accdata && accdata.id) {
                    let res = {
                        id: accdata.id
                    };
                    ctx.body = res;
                    ctx.status = 200;
                    ctx.respond = true;
                }
                else {
                    ctx.throw('db.invalidParameters:137', 400);
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:141', 400);
            }
        }
    });
    /**
     * @api {post} /account/update [個人帳號]-修改
     * @apiDescription 修改個人帳號資料
     * @apiGroup Account
     * @apiVersion 0.0.1
     * @apiUse jsonHeader
     * @apiParam {Object} condition 符合此條件的帳號會被修改
     * @apiParam {String} condition.username 帳號，目前只開放依照帳號修改，將來若有需要批次修改的，再增加欄位
     * @apiParam {Object} update 欲修改的欄位
     * @apiParam {ooo} update.xxx 只需要填欲修改的欄位，沒有要修改的就不用填。欄位請參考: <a href="#account">帳號欄位定義</a>
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/account/update
     * Body:
     * {
     *   "condition": {
     *     "username": "abcedf",
     *   },
     *   "update": {
     *     "mobilePhone": "0123456789"
     *     "birthday": "2000/1/1"
     *     ...........
     *   }
     * }
     * @apiSuccess (Success 200) {String} id 個人帳號的資料庫唯一ID，可以拿來查詢或是修改使用
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "id": "5b6d0d03993dc24293de551c"
     * }
     * @apiUse api_permissionDenied
     * @apiUse ac_accountNotFound
     * @apiUse db_dbNotReady
     */
    accRouter.post('/account/update', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:177', 400);
        }
        else if (false === dbquery_1.checkRequestParamObject(ctx.request.body.condition)) {
            ctx.throw('db.invalidParameters:179', 400);
        }
        else if (false === dbquery_1.checkRequestParamObject(ctx.request.body.update)) {
            ctx.throw('db.invalidParameters:181', 400);
        }
        else {
            try {
                let query = {
                    where: ctx.request.body.condition,
                };
                let accupdate = false;
                let roleupdate = false;
                let accupdatefield = {};
                let updateRoles = [];
                let updatekeys = Object.keys(ctx.request.body.update);
                for (let key of updatekeys) {
                    console.log('upate key', key);
                    if ('role' === key) {
                        updateRoles = ctx.request.body.update[key];
                        roleupdate = true;
                    }
                    else {
                        accupdatefield[key] = ctx.request.body.update[key];
                        accupdate = true;
                    }
                }
                let updateres = null;
                if (accupdate) {
                    updateres = await UserAccount_1.UserAccount.update(ctx.request.body.update, query);
                    if (updateres && Array.isArray(updateres)) {
                        let res = {
                            updateCount: updateres[0]
                        };
                        ctx.body = res;
                        ctx.status = 200;
                        ctx.respond = true;
                    }
                    else {
                        ctx.throw('db.invalidParameters:198', 400);
                    }
                }
                if (roleupdate) {
                    let users = await UserAccount_1.UserAccount.findAll(query);
                    let roleitems = [];
                    if (users && users.length > 0) {
                        let accids = [];
                        for (let acc of users) {
                            accids.push(acc.id);
                            let delres = await AccountRole_1.AccountRole.destroy({ where: { account: acc.id } });
                            for (let role of updateRoles) {
                                let roleJoin = new AccountRole_1.AccountRole({
                                    account: acc.id,
                                    role: role
                                });
                                roleitems.push(roleJoin.save());
                            }
                        }
                        let rolesJoins = await Promise.all(roleitems);
                        if (true !== ctx.respond) {
                            let res = {
                                updateCount: users.length
                            };
                            ctx.body = res;
                            ctx.status = 200;
                            ctx.respond = true;
                        }
                    }
                    else if (true !== ctx.respond) {
                        let res = {
                            updateCount: 0
                        };
                        ctx.body = res;
                        ctx.status = 200;
                        ctx.respond = true;
                    }
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:202', 400);
            }
        }
    });
    /**
     * @api {delete} /account [個人帳號]-刪除
     * @apiDescription 刪除個人帳號
     * @apiGroup Account
     * @apiVersion 0.0.1
     * @apiParam {String} username 帳號
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/account
     * Body:
     * {
     *   "username": "abcedf",
     * }
     * @apiSuccess (Success 200) {Number} updateCount 修改成功的供應商筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "updateCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse ac_accountNotFound
     * @apiUse db_dbNotReady
     */
    accRouter.delete('/account', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:227', 400);
        }
        else {
            try {
                let condition = {
                    where: ctx.request.body
                };
                let delcount = await UserAccount_1.UserAccount.destroy(condition);
                if (null !== delcount && undefined !== delcount) {
                    let res = {
                        deleteCount: delcount
                    };
                    ctx.body = JSON.stringify(res);
                    ctx.status = 200;
                    ctx.respond = true;
                }
                else {
                    ctx.throw('db.invalidParameters:244', 400);
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:248', 400);
            }
        }
    });
};
