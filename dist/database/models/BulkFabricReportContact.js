"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const UserAccount_1 = require("./UserAccount");
const BulkFabricReport_1 = require("./BulkFabricReport");
const Company_1 = require("./Company");
let BulkFabricReportContact = class BulkFabricReportContact extends sequelize_typescript_1.Model {
    constructor(values, options) {
        super(values, options);
    }
};
__decorate([
    sequelize_typescript_1.ForeignKey(() => BulkFabricReport_1.BulkFabricReport),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], BulkFabricReportContact.prototype, "bulkFabricReport", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => UserAccount_1.UserAccount),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], BulkFabricReportContact.prototype, "contactor", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(125))
], BulkFabricReportContact.prototype, "inspection", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(125))
], BulkFabricReportContact.prototype, "response", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Company_1.Company),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], BulkFabricReportContact.prototype, "company", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Company_1.Company)
], BulkFabricReportContact.prototype, "companyData", void 0);

__decorate([
    sequelize_typescript_1.BelongsTo(() => BulkFabricReport_1.BulkFabricReport)
], BulkFabricReportContact.prototype, "bulkFabricReportData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => UserAccount_1.UserAccount)
], BulkFabricReportContact.prototype, "purchaserData", void 0);
BulkFabricReportContact = __decorate([
    sequelize_typescript_1.Table
], BulkFabricReportContact);
exports.BulkFabricReportContact = BulkFabricReportContact;
exports.bulkFabricReportContactJoin = new Array();
exports.bulkFabricReportContactJoin.push({ includeModel: () => { return { model: BulkFabricReport_1.BulkFabricReport }; }, foreignKey: 'bulkFabricReport' });
exports.bulkFabricReportContactJoin.push({ includeModel: () => { return { model: UserAccount_1.UserAccount }; }, foreignKey: 'purchaser' });
