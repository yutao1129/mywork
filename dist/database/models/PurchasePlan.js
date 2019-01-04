"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const UserAccount_1 = require("./UserAccount");
const Supplier_1 = require("./Supplier");
const Material_1 = require("./Material");
const Order_1 = require("./Order");
const PurchasePlanAttachment_1 = require("./PurchasePlanAttachment");
const MaterialReceiving_1 = require("./MaterialReceiving");
const FabricInspection_1 = require("./FabricInspection");
const Company_1 = require("./Company");
let PurchasePlan = class PurchasePlan extends sequelize_typescript_1.Model {
    constructor(values, options) {
        super(values, options);
    }
};
__decorate([
    sequelize_typescript_1.ForeignKey(() => Material_1.Material),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], PurchasePlan.prototype, "material", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Order_1.Order),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], PurchasePlan.prototype, "order", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => UserAccount_1.UserAccount),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], PurchasePlan.prototype, "purchaser", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Supplier_1.Supplier),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], PurchasePlan.prototype, "supplier", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.DECIMAL(12, 3))
], PurchasePlan.prototype, "unitUsageAmount", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], PurchasePlan.prototype, "orderUsageAmount", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], PurchasePlan.prototype, "purchaseAmount", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.DECIMAL(12, 3))
], PurchasePlan.prototype, "unitPrice", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(256))
], PurchasePlan.prototype, "description", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(16))
], PurchasePlan.prototype, "status", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.DATE)
], PurchasePlan.prototype, "createdTime", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.DATE)
], PurchasePlan.prototype, "updatedTime", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.DATE)
], PurchasePlan.prototype, "receiveTime", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.TINYINT(1))
], PurchasePlan.prototype, "inspection", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Company_1.Company),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], PurchasePlan.prototype, "company", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Company_1.Company)
], PurchasePlan.prototype, "companyData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Material_1.Material)
], PurchasePlan.prototype, "materialData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Order_1.Order)
], PurchasePlan.prototype, "orderData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => UserAccount_1.UserAccount)
], PurchasePlan.prototype, "purchaserData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Supplier_1.Supplier)
], PurchasePlan.prototype, "supplierData", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => PurchasePlanAttachment_1.PurchasePlanAttachment)
], PurchasePlan.prototype, "purchasePlanAttachmentData", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => MaterialReceiving_1.MaterialReceiving)
], PurchasePlan.prototype, "materialReceivingData", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => FabricInspection_1.FabricInspection)
], PurchasePlan.prototype, "fabricInspectionData", void 0);
PurchasePlan = __decorate([
    sequelize_typescript_1.Table
], PurchasePlan);
exports.PurchasePlan = PurchasePlan;
exports.purchasePlanJoin = new Array();
exports.purchasePlanJoin.push({ includeModel: () => { return { model: Material_1.Material }; }, foreignKey: 'material' });
exports.purchasePlanJoin.push({ includeModel: () => { return { model: Order_1.Order }; }, foreignKey: 'order' });
exports.purchasePlanJoin.push({ includeModel: () => { return { model: UserAccount_1.UserAccount }; }, foreignKey: 'purchaser' });
exports.purchasePlanJoin.push({ includeModel: () => { return { model: Supplier_1.Supplier }; }, foreignKey: 'supplier' });
exports.purchasePlanJoin.push({ includeModel: () => { return { model: PurchasePlanAttachment_1.PurchasePlanAttachment }; } });
exports.purchasePlanJoin.push({ includeModel: () => { return { model: MaterialReceiving_1.MaterialReceiving }; } });
exports.purchasePlanJoin.push({ includeModel: () => { return { model: FabricInspection_1.FabricInspection }; } });
