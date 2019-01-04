"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
;
;
;
function checkRequestParamObject(param) {
    let ret = true;
    if (undefined === param || null === param || 'object' !== typeof param) {
        ret = false;
    }
    return ret;
}
exports.checkRequestParamObject = checkRequestParamObject;
function queryResponsePacket(query_params) {
    let packet = {
        pageIndex: 0,
        maxRows: 0,
        totalPage: 0,
        records: []
    };
    if (query_params.maxRows) {
        packet.maxRows = query_params.maxRows;
    }
    if (query_params.pageIndex) {
        packet.pageIndex = query_params.pageIndex;
    }
    return packet;
}
exports.queryResponsePacket = queryResponsePacket;
function queryTotalCount(query_params) {
    let countQuery = {
        where: {}
    };
    if (query_params.query || query_params.target) {
        countQuery.where = trasnFormQuery(query_params.query, query_params.target);
    }
    /*
    if (query_params.query) {
      let condit : any = {};
  
      for(let qkey of Object.keys(query_params.query)) {
        // range query.
        if (Array.isArray(query_params.query[qkey])){
          let begin : any | null = null;
          let end : any | null = null;
          if (query_params.query[qkey].length === 0){
            continue;
          }
  
          if (query_params.query[qkey].length >= 2) {
            begin = query_params.query[qkey][0];
            end = query_params.query[qkey][1];
          } else {
            begin = query_params.query[qkey][0];
          }
          if (null !== begin && null !== end) {
            condit[qkey] = { $between : [begin, end] };
          } else if (null !== begin) {
            condit[qkey] = { $gte : begin };
          } else if (null !== end) {
            condit[qkey] = { $lte : end };
          }
        } else {  // equal query.
          condit[qkey] = query_params.query[qkey];
        }
      }
      countQuery.where = condit;
    }
    */
    return countQuery;
}
exports.queryTotalCount = queryTotalCount;
function trasnFormQuery(conditon, target, exclude, advFilter) {
    let ret = {};
    let condit = {};
    if (advFilter) {
        condit = advFilter;
    }
    if (conditon) {
        for (let qkey of Object.keys(conditon)) {
            // range query.
            if (undefined === exclude || false === exclude.has(qkey)) {
                if (Array.isArray(conditon[qkey])) {
                    let begin = null;
                    let end = null;
                    if (conditon[qkey].length === 0) {
                        continue;
                    }
                    if (conditon[qkey].length >= 2) {
                        begin = conditon[qkey][0];
                        end = conditon[qkey][1];
                    }
                    else {
                        begin = conditon[qkey][0];
                    }
                    if (null !== begin && null !== end) {
                        condit[qkey] = { [Op.between]: [begin, end] };
                    }
                    else if (null !== begin) {
                        condit[qkey] = { [Op.gte]: begin };
                    }
                    else if (null !== end) {
                        condit[qkey] = { [Op.lte]: end };
                    }
                }
                else { // equal query.
                    condit[qkey] = conditon[qkey];
                }
            }
        }
        ret = condit;
    }
    if (target) {
        if (Array.isArray(target.values)) {
            let pkey = 'id';
            if (target.pkey) {
                pkey = target.pkey;
            }
            condit[pkey] = target.values;
        }
        ret = condit;
    }
    console.log(conditon, ret);
    return ret;
}
function queryDBGeneratorEx(query_params, joinMap, advFilter) {
    let query = {};
    let includes = [];
    if (undefined === query_params || null === query_params) {
        return query;
    }
    let includeKeys = new Set();
    if (joinMap) {
        for (let joinItem of joinMap) {
            let incData = joinItem.includeModel();
            if (joinItem.foreignKey) {
                if (query_params.query && query_params.query[joinItem.foreignKey]) {
                    if ('object' === typeof query_params.query[joinItem.foreignKey]) {
                        incData.where = trasnFormQuery(query_params.query[joinItem.foreignKey]);
                        includeKeys.add(joinItem.foreignKey);
                    }
                }
            }
            includes.push(incData);
        }
    }
    // handle pages
    if (query_params.maxRows) {
        query.limit = query_params.maxRows;
        if (query_params.pageIndex) {
            query.offset = query_params.maxRows * query_params.pageIndex;
        }
    }
    if (query_params.sort) {
        query.order = new Array();
        for (let orderkey of Object.keys(query_params.sort)) {
            if (query_params.sort[orderkey] < 0) {
                query.order.push([orderkey, 'DESC']);
            }
            else {
                query.order.push([orderkey, 'ASC']);
            }
        }
    }
    if (query_params.query || query_params.target) {
        query.where = {};
        query.where = trasnFormQuery(query_params.query, query_params.target, includeKeys, advFilter);
    }
    if (includes.length > 0) {
        query.include = includes;
    }
    return query;
}
exports.queryDBGeneratorEx = queryDBGeneratorEx;
function queryDBGenerator(query_params) {
    let query = {};
    if (undefined === query_params || null === query_params) {
        return query;
    }
    // handle pages
    if (query_params.maxRows) {
        query.limit = query_params.maxRows;
        if (query_params.pageIndex) {
            query.offset = query_params.maxRows * query_params.pageIndex;
        }
    }
    if (query_params.sort) {
        query.order = new Array();
        for (let orderkey of Object.keys(query_params.sort)) {
            if (query_params.sort[orderkey] < 0) {
                query.order.push([orderkey, 'DESC']);
            }
            else {
                query.order.push([orderkey, 'ASC']);
            }
        }
    }
    if (query_params.query || query_params.target) {
        if (undefined === query.where) {
            query.where = {};
        }
        query.where = trasnFormQuery(query_params.query, query_params.target);
    }
    /*
    let condit : any = {};
    if (query_params.query) {
      query.where = {};
  
      for(let qkey of Object.keys(query_params.query)) {
        // range query.
        if (Array.isArray(query_params.query[qkey])){
          let begin : any | null = null;
          let end : any | null = null;
          if (query_params.query[qkey].length === 0){
            continue;
          }
  
          if (query_params.query[qkey].length >= 2) {
            begin = query_params.query[qkey][0];
            end = query_params.query[qkey][1];
          } else {
            begin = query_params.query[qkey][0];
          }
          if (null !== begin && null !== end) {
            condit[qkey] = { $between : [begin, end] };
          } else if (null !== begin) {
            condit[qkey] = { $gte : begin };
          } else if (null !== end) {
            condit[qkey] = { $lte : end };
          }
        } else {  // equal query.
          condit[qkey] = query_params.query[qkey];
        }
      }
      query.where = condit;
    }*/
    return query;
}
exports.queryDBGenerator = queryDBGenerator;
