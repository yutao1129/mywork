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
const Material_1 = require("./Material");
const UserAccount_1 = require("./UserAccount");
const FabricInspectionResult_1 = require("./FabricInspectionResult");
const Company_1 = require("./Company");
let FabricInspection = class FabricInspection extends sequelize_typescript_1.Model {
    constructor(values, options) {
        super(values, options);
    }
};
__decorate([
    sequelize_typescript_1.ForeignKey(() => PurchasePlan_1.PurchasePlan),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], FabricInspection.prototype, "purchaseItem", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Material_1.Material),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], FabricInspection.prototype, "material", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => UserAccount_1.UserAccount),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], FabricInspection.prototype, "inspector", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(16))
], FabricInspection.prototype, "volumeNumber", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.DATEONLY)
], FabricInspection.prototype, "inspectedDate", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.DECIMAL(10, 3))
], FabricInspection.prototype, "width", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.DECIMAL(10, 3))
], FabricInspection.prototype, "length", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(512))
], FabricInspection.prototype, "comment", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(4))
], FabricInspection.prototype, "summary", void 0);
__decorate([
    sequelize_typescript_1.Default(0),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], FabricInspection.prototype, "totalScore", void 0);
__decorate([
    sequelize_typescript_1.Default(0),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], FabricInspection.prototype, "averageScore", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Company_1.Company),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], FabricInspection.prototype, "company", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Company_1.Company)
], FabricInspection.prototype, "companyData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Material_1.Material)
], FabricInspection.prototype, "materialData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => PurchasePlan_1.PurchasePlan)
], FabricInspection.prototype, "purchaseItemData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => UserAccount_1.UserAccount)
], FabricInspection.prototype, "inspectorData", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => FabricInspectionResult_1.FabricInspectionResult)
], FabricInspection.prototype, "fabricInspectionResultData", void 0);
FabricInspection = __decorate([
    sequelize_typescript_1.Table
], FabricInspection);
exports.FabricInspection = FabricInspection;
exports.fabricInspectionJoin = new Array();
exports.fabricInspectionJoin.push({ includeModel: () => { return { model: Material_1.Material }; }, foreignKey: 'material' });
exports.fabricInspectionJoin.push({ includeModel: () => { return { model: PurchasePlan_1.PurchasePlan }; }, foreignKey: 'purchaseItem' });
exports.fabricInspectionJoin.push({ includeModel: () => { return { model: UserAccount_1.UserAccount }; }, foreignKey: 'inspector' });
exports.fabricInspectionJoin.push({ includeModel: () => { return { model: FabricInspectionResult_1.FabricInspectionResult }; } });
