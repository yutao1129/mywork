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
const ColorCode_1 = require("./ColorCode");
const Company_1 = require("./Company");
let CropRecord = class CropRecord extends sequelize_typescript_1.Model {
    constructor(values, options) {
        super(values, options);
    }
};
__decorate([
    sequelize_typescript_1.ForeignKey(() => Crop_1.Crop),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], CropRecord.prototype, "crop", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Material_1.Material),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], CropRecord.prototype, "material", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.DECIMAL(10, 2))
], CropRecord.prototype, "length", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], CropRecord.prototype, "layer", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => ColorCode_1.ColorCode),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], CropRecord.prototype, "colorCode", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.DECIMAL(10, 2))
], CropRecord.prototype, "shortage", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Company_1.Company),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], CropRecord.prototype, "company", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Company_1.Company)
], CropRecord.prototype, "companyData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Crop_1.Crop)
], CropRecord.prototype, "cropData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Material_1.Material)
], CropRecord.prototype, "materialData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => ColorCode_1.ColorCode)
], CropRecord.prototype, "colorCodeData", void 0);
CropRecord = __decorate([
    sequelize_typescript_1.Table
], CropRecord);
exports.CropRecord = CropRecord;
exports.cropRecordJoin = new Array();
exports.cropRecordJoin.push({ foreignKey: "material", includeModel: () => { return { model: Material_1.Material }; } });
exports.cropRecordJoin.push({ foreignKey: "crop", includeModel: () => { return { model: Crop_1.Crop }; } });
exports.cropRecordJoin.push({ foreignKey: "colorCode", includeModel: () => { return { model: ColorCode_1.ColorCode }; } });
