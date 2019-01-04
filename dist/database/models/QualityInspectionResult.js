//modify 20181122 Yutao.liu 添加 returnPass 列 默认值1
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const QualityInspection_1 = require("./QualityInspection");
const Company_1 = require("./Company");
let QualityInspectionResult = class QualityInspectionResult extends sequelize_typescript_1.Model {
    constructor(values, options) {
        super(values, options);
    }
};
__decorate([
    sequelize_typescript_1.ForeignKey(() => QualityInspection_1.QualityInspection),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], QualityInspectionResult.prototype, "qualityInspection", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(255))
], QualityInspectionResult.prototype, "category", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(255))
], QualityInspectionResult.prototype, "problem", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.TINYINT(1))
], QualityInspectionResult.prototype, "result", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(40))
], QualityInspectionResult.prototype, "part", void 0);
__decorate([
    sequelize_typescript_1.Column({
        type:sequelize_typescript_1.DataType.INTEGER,
        defaultValue:-1,
        allowNull: false}),
], QualityInspectionResult.prototype, "pieceIndex", void 0);
__decorate([
    sequelize_typescript_1.Column({
        type:sequelize_typescript_1.DataType.TINYINT(1),
        defaultValue:0}),
], QualityInspectionResult.prototype, "returnPass", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Company_1.Company),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], QualityInspectionResult.prototype, "company", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Company_1.Company)
], QualityInspectionResult.prototype, "companyData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => QualityInspection_1.QualityInspection)
], QualityInspectionResult.prototype, "qualityInspectionData", void 0);
QualityInspectionResult = __decorate([
    sequelize_typescript_1.Table
], QualityInspectionResult);
exports.QualityInspectionResult = QualityInspectionResult;
exports.qualityInspectionResultJoin = new Array();
exports.qualityInspectionResultJoin.push({ includeModel: () => { return { model: QualityInspection_1.QualityInspection }; }, foreignKey: 'qualityInspection' });
