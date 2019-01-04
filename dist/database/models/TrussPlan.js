"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const ColorCode_1 = require("./ColorCode");
const Material_1 = require("./Material");
const Order_1 = require("./Order");
const Company_1 = require("./Company");
let TrussPlan = class TrussPlan extends sequelize_typescript_1.Model {
    constructor(values, options) {
        super(values, options);
    }
};
__decorate([
    sequelize_typescript_1.Unique,
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(40))
], TrussPlan.prototype, "trussID", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => ColorCode_1.ColorCode),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], TrussPlan.prototype, "colorCode", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Material_1.Material),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], TrussPlan.prototype, "material", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Order_1.Order),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], TrussPlan.prototype, "order", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.TEXT)
], TrussPlan.prototype, "budget", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], TrussPlan.prototype, "usageAmount", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], TrussPlan.prototype, "consumption", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], TrussPlan.prototype, "fabricChoice", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], TrussPlan.prototype, "fabricType", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], TrussPlan.prototype, "layer", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Company_1.Company),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], TrussPlan.prototype, "company", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Company_1.Company)
], TrussPlan.prototype, "companyData", void 0);
TrussPlan = __decorate([
    sequelize_typescript_1.Table
], TrussPlan);
exports.TrussPlan = TrussPlan;
