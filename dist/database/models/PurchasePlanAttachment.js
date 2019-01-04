"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const PurchasePlan_1 = require("./PurchasePlan");
const Files_1 = require("./Files");
const Company_1 = require("./Company");
let PurchasePlanAttachment = class PurchasePlanAttachment extends sequelize_typescript_1.Model {
    constructor(values, options) {
        super(values, options);
    }
};
__decorate([
    sequelize_typescript_1.ForeignKey(() => PurchasePlan_1.PurchasePlan),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], PurchasePlanAttachment.prototype, "purchaseItem", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Files_1.Files),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], PurchasePlanAttachment.prototype, "attachment", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => PurchasePlan_1.PurchasePlan)
], PurchasePlanAttachment.prototype, "purchaseItemData", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Company_1.Company),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], PurchasePlanAttachment.prototype, "company", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Company_1.Company)
], PurchasePlanAttachment.prototype, "companyData", void 0);
PurchasePlanAttachment = __decorate([
    sequelize_typescript_1.Table
], PurchasePlanAttachment);
exports.PurchasePlanAttachment = PurchasePlanAttachment;
exports.purchasePlanAttachmentJoin = new Array();
exports.purchasePlanAttachmentJoin.push({ foreignKey: "purchaseItem", includeModel: () => { return { model: PurchasePlan_1.PurchasePlan }; } });
