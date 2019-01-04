"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const FabricInspection_1 = require("./FabricInspection");
const FabricStandard_1 = require("./FabricStandard");
const Company_1 =require("./Company");
let FabricInspectionResult = class FabricInspectionResult extends sequelize_typescript_1.Model {
    constructor(values, options) {
        super(values, options);
    }
};
__decorate([
    sequelize_typescript_1.ForeignKey(() => FabricInspection_1.FabricInspection),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], FabricInspectionResult.prototype, "fabricInspection", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => FabricStandard_1.FabricStandard),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], FabricInspectionResult.prototype, "fabricStandard", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.DECIMAL(8, 3))
], FabricInspectionResult.prototype, "length", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(16))
], FabricInspectionResult.prototype, "value", void 0);
__decorate([
    sequelize_typescript_1.Default(0),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], FabricInspectionResult.prototype, "score1Value", void 0);
__decorate([
    sequelize_typescript_1.Default(0),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], FabricInspectionResult.prototype, "score2Value", void 0);
__decorate([
    sequelize_typescript_1.Default(0),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], FabricInspectionResult.prototype, "score3Value", void 0);
__decorate([
    sequelize_typescript_1.Default(0),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], FabricInspectionResult.prototype, "score4Value", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Company_1.Company),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], FabricInspectionResult.prototype, "company", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Company_1.Company)
], FabricInspectionResult.prototype, "companyData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => FabricInspection_1.FabricInspection)
], FabricInspectionResult.prototype, "fabricInspectionData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => FabricStandard_1.FabricStandard)
], FabricInspectionResult.prototype, "fabricStandardData", void 0);
FabricInspectionResult = __decorate([
    sequelize_typescript_1.Table
], FabricInspectionResult);
exports.FabricInspectionResult = FabricInspectionResult;
exports.fabricInspectionResultJoin = new Array();
exports.fabricInspectionResultJoin.push({ includeModel: () => { return { model: FabricInspection_1.FabricInspection }; }, foreignKey: 'fabricInspection' });
exports.fabricInspectionResultJoin.push({ includeModel: () => { return { model: FabricStandard_1.FabricStandard }; }, foreignKey: 'fabricStandard' });
