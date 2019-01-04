"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize = require("sequelize");
const QualityInspection_1 = require("../database/models/QualityInspection");
let getAmountSumFromQualityInspectionForSwing = async function(order,factory,team) {
    let purchItemArgs = [];
    let purchItemWhere = [];
    if (order) {
        purchItemWhere.push(' `order`=? ');
        purchItemArgs.push(order);
    }
    if (factory) {
        purchItemWhere.push(' factory=? ');
        purchItemArgs.push(factory);
    }
    if (team) {
        purchItemWhere.push(' team=? ');
        purchItemArgs.push(team);
    }

    let query = {query:'SELECT SUM(amount) AS amountSum FROM (' +
            'SELECT DISTINCT QI.bundleNumber,QI.amount AS amount,QI.type AS QIType,`order`,`return`,bb.team AS team,bb.step as step, Team.factory as factory FROM QualityInspection AS QI' +
            ' LEFT JOIN CropCard AS CC ON CC.bundleNumber=QI.bundleNumber LEFT JOIN (SELECT DISTINCT bundleNumber, team,step  FROM MemberOutput) as bb ON QI.bundleNumber=bb.bundleNumber' +
            ' LEFT JOIN Team AS Team ON Team.id = bb.team) aa' +
            ' WHERE `return`=0 AND QIType=1 AND step=\'车缝\' AND ' + purchItemWhere.join(' AND ') ,
        values:purchItemArgs
    }
    let result = await QualityInspection_1.QualityInspection.sequelize.query(query,{ type: sequelize.QueryTypes.SELECT});

    if(result.length > 0){
        return result[0].amountSum;
    }else{
        return 0;
    }

}

exports.getAmountSumFromQualityInspectionForSwing = getAmountSumFromQualityInspectionForSwing;
