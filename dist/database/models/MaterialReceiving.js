"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const Material_1 = require("./Material");
const PurchasePlan_1 = require("./PurchasePlan");
const UserAccount_1 = require("./UserAccount");
const Files_1 = require("./Files");
const Supplier_1 = require("./Supplier");
const Company_1 = require("./Company");
let MaterialReceiving = class MaterialReceiving extends sequelize_typescript_1.Model {
    constructor(values, options) {
        super(values, options);
    }
};
__decorate([
    sequelize_typescript_1.ForeignKey(() => Material_1.Material),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], MaterialReceiving.prototype, "material", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => PurchasePlan_1.PurchasePlan),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], MaterialReceiving.prototype, "purchaseItem", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => UserAccount_1.UserAccount),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], MaterialReceiving.prototype, "inspector", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.DATE)
], MaterialReceiving.prototype, "receivingDate", void 0);
__decorate([
    sequelize_typescript_1.Default(0),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], MaterialReceiving.prototype, "volume", void 0);
__decorate([
    sequelize_typescript_1.Default(0),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.DOUBLE)
], MaterialReceiving.prototype, "length", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.DOUBLE)
], MaterialReceiving.prototype, "samplingRatio", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Supplier_1.Supplier),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], MaterialReceiving.prototype, "supplier", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.FLOAT(12, 2))
], MaterialReceiving.prototype, "width", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Company_1.Company),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], MaterialReceiving.prototype, "company", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Company_1.Company)
], MaterialReceiving.prototype, "companyData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Material_1.Material)
], MaterialReceiving.prototype, "materialData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => PurchasePlan_1.PurchasePlan)
], MaterialReceiving.prototype, "purchaseItemData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => UserAccount_1.UserAccount)
], MaterialReceiving.prototype, "inspectorData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Supplier_1.Supplier)
], MaterialReceiving.prototype, "supplierData", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Files_1.Files),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], MaterialReceiving.prototype, "photo", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Files_1.Files),
], MaterialReceiving.prototype, "fileData", void 0);

MaterialReceiving = __decorate([
    sequelize_typescript_1.Table
], MaterialReceiving);
exports.MaterialReceiving = MaterialReceiving;
exports.materialReceivingJoin = new Array();
exports.materialReceivingJoin.push({ includeModel: () => { return { model: Material_1.Material }; }, foreignKey: 'material' });
exports.materialReceivingJoin.push({ includeModel: () => { return { model: PurchasePlan_1.PurchasePlan }; }, foreignKey: 'purchaseItem' });
exports.materialReceivingJoin.push({ includeModel: () => { return { model: UserAccount_1.UserAccount }; }, foreignKey: 'inspector' });
exports.materialReceivingJoin.push({ includeModel: () => { return { model: Supplier_1.Supplier }; }, foreignKey: 'supplier' });
