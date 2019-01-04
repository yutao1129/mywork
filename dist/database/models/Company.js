"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");

let Company = class Company extends sequelize_typescript_1.Model {
    constructor(values, options) {
        super(values, options);
    }
};

__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(255))
], Company.prototype, "companyName", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(255))
], Company.prototype, "companyAddress", void 0);
Company = __decorate([
    sequelize_typescript_1.Table
], Company);
exports.Company = Company;

exports.companyJoin = new Array();

exports.initCompanyInfo = async function () {
    let count = await Company.count({});
    console.log('Company count', count);
    console.log('Insert one company info');
    if (count === 0) {
        let res = await Company.create({ companyName: '第一个公司',companyAddress:'第一个公司的地址'});
    }
};
