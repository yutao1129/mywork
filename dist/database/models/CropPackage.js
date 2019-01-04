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
const Crop_1 = require("./Crop");
const CropCard_1 = require("./CropCard");
const Company_1 = require("./Company");
let CropPackage = class CropPackage extends sequelize_typescript_1.Model {
    constructor(values, options) {
        super(values, options);
    }
};
__decorate([
    sequelize_typescript_1.ForeignKey(() => Crop_1.Crop),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], CropPackage.prototype, "crop", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Material_1.Material),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], CropPackage.prototype, "material", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(32))
], CropPackage.prototype, "size", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], CropPackage.prototype, "packageNumber", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], CropPackage.prototype, "layerAmount", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], CropPackage.prototype, "planCard", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Company_1.Company),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], CropPackage.prototype, "company", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Company_1.Company)
], CropPackage.prototype, "companyData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Crop_1.Crop)
], CropPackage.prototype, "cropData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Material_1.Material)
], CropPackage.prototype, "materialData", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => CropCard_1.CropCard)
], CropPackage.prototype, "cropCardData", void 0);

CropPackage = __decorate([
    sequelize_typescript_1.Table
], CropPackage);
exports.CropPackage = CropPackage;
exports.cropPackageJoin = new Array();
exports.cropPackageJoin.push({ foreignKey: "material", includeModel: () => { return { model: Material_1.Material }; } });
exports.cropPackageJoin.push({ foreignKey: "crop", includeModel: () => { return { model: Crop_1.Crop }; } });
exports.cropPackageJoin.push({ includeModel: () => { return { model: CropCard_1.CropCard }; } });
