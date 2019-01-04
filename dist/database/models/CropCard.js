"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const RFID_1 = require("./RFID");
const ColorCode_1 = require("./ColorCode");
const CropPackage_1 = require("./CropPackage");
const Part_1 = require("./Part");
const UserAccount_1 = require("./UserAccount");
const ProductionScheduling_1 = require("./ProductionScheduling");
const Company_1 = require("./Company");
let CropCard = class CropCard extends sequelize_typescript_1.Model {
    constructor(values, options) {
        super(values, options);
    }
};
__decorate([
    sequelize_typescript_1.ForeignKey(() => CropPackage_1.CropPackage),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], CropCard.prototype, "cropPackage", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => RFID_1.RFID),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], CropCard.prototype, "rfid", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => ColorCode_1.ColorCode),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], CropCard.prototype, "colorCode", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(128))
], CropCard.prototype, "bundleNumber", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], CropCard.prototype, "amount", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.DATE)
], CropCard.prototype, "createTime", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Part_1.Part),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(40))
], CropCard.prototype, "part", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => UserAccount_1.UserAccount),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], CropCard.prototype, "worker", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.TINYINT(1))
], CropCard.prototype, "return", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => ProductionScheduling_1.ProductionScheduling),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], CropCard.prototype, "productionScheduling", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(
        {
            type:sequelize_typescript_1.DataType.TINYINT(1),
            defaultValue:1
        })
], CropCard.prototype, "valid", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], CropCard.prototype, "returnPieceIndex", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Company_1.Company),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], CropCard.prototype, "company", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Company_1.Company)
], CropCard.prototype, "companyData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => CropPackage_1.CropPackage)
], CropCard.prototype, "cropPackageData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => RFID_1.RFID)
], CropCard.prototype, "rfidData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => ColorCode_1.ColorCode)
], CropCard.prototype, "colorCodeData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => UserAccount_1.UserAccount)
], CropCard.prototype, "workerData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => ProductionScheduling_1.ProductionScheduling)
], CropCard.prototype, "productionSchedulingData", void 0);
CropCard = __decorate([
    sequelize_typescript_1.Table
], CropCard);
exports.CropCard = CropCard;
exports.cropCardJoin = new Array();
exports.cropCardJoin.push({ foreignKey: "cropPackage", includeModel: () => { return { model: CropPackage_1.CropPackage }; } });
exports.cropCardJoin.push({ foreignKey: "rfid", includeModel: () => { return { model: RFID_1.RFID }; } });
exports.cropCardJoin.push({ foreignKey: "colorCode", includeModel: () => { return { model: ColorCode_1.ColorCode }; } });
exports.cropCardJoin.push({ foreignKey: "worker", includeModel: () => { return { model: UserAccount_1.UserAccount }; } });
exports.cropCardJoin.push({ foreignKey: "productionScheduling", includeModel: () => { return { model: ProductionScheduling_1.ProductionScheduling }; } });
