"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const ProductionScheduling_1 = require("./ProductionScheduling");
const SewingTeamOutput_1 = require("./SewingTeamOutput");
const Team_1 = require("./Team");
const Company_1 = require("./Company");
let SewingTeamScheduling = class SewingTeamScheduling extends sequelize_typescript_1.Model {
    constructor(values, options) {
        super(values, options);
    }
};
__decorate([
    sequelize_typescript_1.ForeignKey(() => ProductionScheduling_1.ProductionScheduling),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], SewingTeamScheduling.prototype, "productionScheduling", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Team_1.Team),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], SewingTeamScheduling.prototype, "team", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], SewingTeamScheduling.prototype, "amount", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], SewingTeamScheduling.prototype, "estimatedWorkingDay", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.DATEONLY)
], SewingTeamScheduling.prototype, "startDate", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.DATEONLY)
], SewingTeamScheduling.prototype, "endDate", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Company_1.Company),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], SewingTeamScheduling.prototype, "company", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Company_1.Company)
], SewingTeamScheduling.prototype, "companyData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Team_1.Team)
], SewingTeamScheduling.prototype, "teamData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => ProductionScheduling_1.ProductionScheduling)
], SewingTeamScheduling.prototype, "productionSchedulingData", void 0);


__decorate([
    sequelize_typescript_1.HasMany(() => SewingTeamOutput_1.SewingTeamOutput)
], SewingTeamScheduling.prototype, "sewingTeamOutputData", void 0);


SewingTeamScheduling = __decorate([
    sequelize_typescript_1.Table
], SewingTeamScheduling);
exports.SewingTeamScheduling = SewingTeamScheduling;
exports.sewingTeamSchedulingJoin = new Array();
exports.sewingTeamSchedulingJoin.push({ foreignKey: "team", includeModel: () => { return { model: Team_1.Team }; } });
exports.sewingTeamSchedulingJoin.push({ foreignKey: "productionScheduling", includeModel: () => { return { model: ProductionScheduling_1.ProductionScheduling }; } });

exports.sewingTeamSchedulingJoin.push({ includeModel: () => { return { model: SewingTeamOutput_1.SewingTeamOutput }; } });
