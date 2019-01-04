"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const Order_1 = require("./Order");
const Company_1 = require("./Company");
let HeadCloth = class HeadCloth extends sequelize_typescript_1.Model {
    constructor(values, options) {
        super(values, options);
    }
};
__decorate([
    sequelize_typescript_1.ForeignKey(() => Order_1.Order),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], HeadCloth.prototype, "order", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], HeadCloth.prototype, "length", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], HeadCloth.prototype, "changeLength", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Order_1.Order)
], HeadCloth.prototype, "orderData", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Company_1.Company),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], HeadCloth.prototype, "company", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Company_1.Company)
], HeadCloth.prototype, "companyData", void 0);
HeadCloth = __decorate([
    sequelize_typescript_1.Table
], HeadCloth);
exports.HeadCloth = HeadCloth;
exports.headClothJoin = new Array();
exports.headClothJoin.push({ includeModel: () => { return { model: Order_1.Order }; }, foreignKey: 'order' });
