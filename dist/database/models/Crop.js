"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const Part_1 = require("./Part");
const TrussPlan_1 = require("./TrussPlan");
const Order_1 = require("./Order");
const Team_1 = require("./Team");
const CropRecord_1 = require("./CropRecord");
const CropPackage_1 = require("./CropPackage");
const Company_1 = require("./Company");
let Crop = class Crop extends sequelize_typescript_1.Model {
    constructor(values, options) {
        super(values, options);
    }
};
__decorate([
    sequelize_typescript_1.ForeignKey(() => Team_1.Team),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], Crop.prototype, "team", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Part_1.Part),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(40))
], Crop.prototype, "part", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => TrussPlan_1.TrussPlan),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], Crop.prototype, "trussPlan", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Order_1.Order),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], Crop.prototype, "order", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], Crop.prototype, "perBundleAmount", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], Crop.prototype, "planCard", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], Crop.prototype, "bedNumber", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], Crop.prototype, "packageNumber", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(40))
], Crop.prototype, "cardType", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(256))
], Crop.prototype, "truss", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.DATE)
], Crop.prototype, "cropTime", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Company_1.Company),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], Crop.prototype, "company", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Company_1.Company)
], Crop.prototype, "companyData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => TrussPlan_1.TrussPlan)
], Crop.prototype, "trussPlanData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Order_1.Order)
], Crop.prototype, "orderData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Team_1.Team)
], Crop.prototype, "teamData", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => CropRecord_1.CropRecord)
], Crop.prototype, "cropRecordData", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => CropPackage_1.CropPackage)
], Crop.prototype, "cropPackageData", void 0);
Crop = __decorate([
    sequelize_typescript_1.Table
], Crop);
exports.Crop = Crop;
exports.cropJoin = new Array();
exports.cropJoin.push({ foreignKey: "trussPlan", includeModel: () => { return { model: TrussPlan_1.TrussPlan }; } });
exports.cropJoin.push({ foreignKey: "order", includeModel: () => { return { model: Order_1.Order }; } });
exports.cropJoin.push({ foreignKey: "team", includeModel: () => { return { model: Team_1.Team }; } });
exports.cropJoin.push({ includeModel: () => { return { model: CropRecord_1.CropRecord }; } });
exports.cropJoin.push({ includeModel: () => { return { model: CropPackage_1.CropPackage }; } });
