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
const Company_1 = require("./Company");
let Material = class Material extends sequelize_typescript_1.Model {
    constructor(values, options) {
        super(values, options);
    }
};
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(255))
], Material.prototype, "materialID", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(40))
], Material.prototype, "name", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(32))
], Material.prototype, "category", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(32))
], Material.prototype, "type", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(32))
], Material.prototype, "color", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(128))
], Material.prototype, "spec", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.FLOAT(12, 2))
], Material.prototype, "width", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], Material.prototype, "photo", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Style_1.Style),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(40))
], Material.prototype, "style", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(128))
], Material.prototype, "unit", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.FLOAT(12, 2))
], Material.prototype, "usageAmount", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.FLOAT(12, 2))
], Material.prototype, "consumption", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Company_1.Company),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], Material.prototype, "company", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Company_1.Company)
], Material.prototype, "companyData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Style_1.Style)
], Material.prototype, "styleData", void 0);
Material = __decorate([
    sequelize_typescript_1.Table
], Material);
exports.Material = Material;
exports.materialJoin = new Array();
exports.materialJoin.push({ includeModel: () => { return { model: Style_1.Style }; }, foreignKey: 'style' });
