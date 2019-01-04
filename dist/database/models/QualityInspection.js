"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const QualityStandard_1 = require("./QualityStandard");
const Order_1 = require("./Order");
const QualityInspectionResult_1 = require("./QualityInspectionResult");
const UserAccount_1 = require("./UserAccount");
const Company_1 = require("./Company");
let QualityInspection = class QualityInspection extends sequelize_typescript_1.Model {
    constructor(values, options) {
        super(values, options);
    }
};
__decorate([
    sequelize_typescript_1.ForeignKey(() => QualityStandard_1.QualityStandard),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], QualityInspection.prototype, "qualityStandard", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Order_1.Order),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], QualityInspection.prototype, "order", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(40))
], QualityInspection.prototype, "type", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(128))
], QualityInspection.prototype, "bundleNumber", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => UserAccount_1.UserAccount),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], QualityInspection.prototype, "worker", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.DATE)
], QualityInspection.prototype, "inspectedTime", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], QualityInspection.prototype, "amount", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Company_1.Company),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], QualityInspection.prototype, "company", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Company_1.Company)
], QualityInspection.prototype, "companyData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => QualityStandard_1.QualityStandard)
], QualityInspection.prototype, "qualityStandardData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Order_1.Order)
], QualityInspection.prototype, "orderData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => UserAccount_1.UserAccount)
], QualityInspection.prototype, "workerData", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => QualityInspectionResult_1.QualityInspectionResult)
], QualityInspection.prototype, "qualityInspectionResultData", void 0);
QualityInspection = __decorate([
    sequelize_typescript_1.Table
], QualityInspection);
exports.QualityInspection = QualityInspection;
exports.qualityInspectionJoin = new Array();
exports.qualityInspectionJoin.push({ includeModel: () => { return { model: QualityStandard_1.QualityStandard }; }, foreignKey: 'aualityStandard' });
exports.qualityInspectionJoin.push({ includeModel: () => { return { model: Order_1.Order }; }, foreignKey: 'order' });
exports.qualityInspectionJoin.push({ includeModel: () => { return { model: QualityInspectionResult_1.QualityInspectionResult }; } });
exports.qualityInspectionJoin.push({ includeModel: () => { return { model: UserAccount_1.UserAccount }; }, foreignKey: 'worker' });
