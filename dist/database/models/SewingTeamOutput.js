"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const SewingTeamScheduling_1 = require("./SewingTeamScheduling");
const ProductCategory_1 = require("./ProductCategory");
const Company_1 = require("./Company");
let SewingTeamOutput = class SewingTeamOutput extends sequelize_typescript_1.Model {
    constructor(values, options) {
        super(values, options);
    }
};
__decorate([
    sequelize_typescript_1.ForeignKey(() => SewingTeamScheduling_1.SewingTeamScheduling),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], SewingTeamOutput.prototype, "sewingTeamScheduling", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => ProductCategory_1.ProductCategory),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(40))
], SewingTeamOutput.prototype, "productCategory", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.DATE)
], SewingTeamOutput.prototype, "date", void 0);
__decorate([
    sequelize_typescript_1.Default(0),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], SewingTeamOutput.prototype, "amount", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.DOUBLE)
], SewingTeamOutput.prototype, "capacity", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.DOUBLE)
], SewingTeamOutput.prototype, "efficiency", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Company_1.Company),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], SewingTeamOutput.prototype, "company", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Company_1.Company)
], SewingTeamOutput.prototype, "companyData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() =>  SewingTeamScheduling_1.SewingTeamScheduling)
], SewingTeamOutput.prototype, "sewingTeamOutputData", void 0);

SewingTeamOutput = __decorate([
    sequelize_typescript_1.Table
], SewingTeamOutput);
exports.SewingTeamOutput = SewingTeamOutput;
exports.SewingTeamOutputJoin = new Array();
exports.SewingTeamOutputJoin.push({ foreignKey: "sewingTeamScheduling", includeModel: () => { return { model: SewingTeamScheduling_1.SewingTeamScheduling }; } });
