"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const Style_1 = require("./Style");
const QualityStandard_1 = require("./QualityStandard");
const Company_1 = require("./Company");
let StyleQualityStandard = class StyleQualityStandard extends sequelize_typescript_1.Model {
    constructor(values, options) {
        super(values, options);
    }
};
__decorate([
    sequelize_typescript_1.ForeignKey(() => Style_1.Style),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(40))
], StyleQualityStandard.prototype, "style", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => QualityStandard_1.QualityStandard),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], StyleQualityStandard.prototype, "qualityStandard", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Company_1.Company),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], StyleQualityStandard.prototype, "company", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Company_1.Company)
], StyleQualityStandard.prototype, "companyData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Style_1.Style)
], StyleQualityStandard.prototype, "styleData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => QualityStandard_1.QualityStandard)
], StyleQualityStandard.prototype, "qualityStandardData", void 0);
StyleQualityStandard = __decorate([
    sequelize_typescript_1.Table
], StyleQualityStandard);
exports.StyleQualityStandard = StyleQualityStandard;
exports.styleQualityStandardJoin = new Array();
exports.styleQualityStandardJoin.push({ includeModel: () => { return { model: Style_1.Style }; }, foreignKey: 'style' });
exports.styleQualityStandardJoin.push({ includeModel: () => { return { model: QualityStandard_1.QualityStandard }; }, foreignKey: 'qualityStandard' });
