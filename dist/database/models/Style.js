"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const ProductCategory_1 = require("./ProductCategory");
const Client_1 = require("./Client");
const Files_1 = require("./Files");
const Order_1 = require("./Order");
const Material_1 = require("./Material");
const StyleProcess_1 = require("./StyleProcess");
const StyleOperation_1 = require("./StyleOperation");
const StyleQualityStandard_1 = require("./StyleQualityStandard");
const StylePartCard_1 = require("./StylePartCard");
const Company_1 = require("./Company");
let Style = class Style extends sequelize_typescript_1.Model {
    constructor(values, options) {
        super(values, options);
    }
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.Unique,
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(40))
], Style.prototype, "styleID", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(40))
], Style.prototype, "designStyleID", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(255))
], Style.prototype, "productName", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => ProductCategory_1.ProductCategory),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(40))
], Style.prototype, "productCategory", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Client_1.Client),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], Style.prototype, "client", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(255))
], Style.prototype, "description", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Files_1.Files),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], Style.prototype, "frontPhoto", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Files_1.Files),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], Style.prototype, "backPhoto", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.TINYINT(1))
], Style.prototype, "status", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.DATE)
], Style.prototype, "createdTime", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Company_1.Company),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], Style.prototype, "company", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Company_1.Company)
], Style.prototype, "companyData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Client_1.Client)
], Style.prototype, "cleintData", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => Order_1.Order)
], Style.prototype, "orderData", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => Material_1.Material)
], Style.prototype, "materialData", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => StyleOperation_1.StyleOperation)
], Style.prototype, "styleOperationData", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => StyleProcess_1.StyleProcess)
], Style.prototype, "styleProcessData", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => StyleQualityStandard_1.StyleQualityStandard)
], Style.prototype, "styleQualityStandardData", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => StylePartCard_1.StylePartCard)
], Style.prototype, "stylePartCardData", void 0);
Style = __decorate([
    sequelize_typescript_1.Table
], Style);
exports.Style = Style;
exports.styleJoin = new Array();
exports.styleJoin.push({ includeModel: () => { return { model: Client_1.Client }; }, foreignKey: 'client' });
exports.styleJoin.push({ includeModel: () => { return { model: Order_1.Order }; } });
exports.styleJoin.push({ includeModel: () => { return { model: Material_1.Material }; } });
exports.styleJoin.push({ includeModel: () => { return { model: StyleOperation_1.StyleOperation }; } });
exports.styleJoin.push({ includeModel: () => { return { model: StyleProcess_1.StyleProcess }; } });
exports.styleJoin.push({ includeModel: () => { return { model: StyleQualityStandard_1.StyleQualityStandard }; } });
exports.styleJoin.push({ includeModel: () => { return { model: StylePartCard_1.StylePartCard }; } });
