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
const PrecedingTeamOutput_1 = require("./PrecedingTeamOutput");
const Team_1 = require("./Team");
const Company_1 =require("./Company");
let PrecedingTeamScheduling = class PrecedingTeamScheduling extends sequelize_typescript_1.Model {
    constructor(values, options) {
        super(values, options);
    }
};
__decorate([
    sequelize_typescript_1.ForeignKey(() => ProductionScheduling_1.ProductionScheduling),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], PrecedingTeamScheduling.prototype, "productionScheduling", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Team_1.Team),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], PrecedingTeamScheduling.prototype, "cropTeam", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Team_1.Team),
    // sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], PrecedingTeamScheduling.prototype, "stickTeam", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], PrecedingTeamScheduling.prototype, "amount", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], PrecedingTeamScheduling.prototype, "cropEstimatedWorkingDay", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.DATEONLY)
], PrecedingTeamScheduling.prototype, "cropStartDate", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.DATEONLY)
], PrecedingTeamScheduling.prototype, "cropEndDate", void 0);
__decorate([
    // sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], PrecedingTeamScheduling.prototype, "stickEstimatedWorkingDay", void 0);
__decorate([
    // sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.DATEONLY)
], PrecedingTeamScheduling.prototype, "stickStartDate", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.DATEONLY)
], PrecedingTeamScheduling.prototype, "stickEndDate", void 0);
__decorate([
    sequelize_typescript_1.Default(0),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], PrecedingTeamScheduling.prototype, "cropCompleteAmount", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Company_1.Company),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], PrecedingTeamScheduling.prototype, "company", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Company_1.Company)
], PrecedingTeamScheduling.prototype, "companyData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Team_1.Team, 'cropTeam')
], PrecedingTeamScheduling.prototype, "cropTeamData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Team_1.Team, 'stickTeam')
], PrecedingTeamScheduling.prototype, "stickTeamData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => ProductionScheduling_1.ProductionScheduling)
], PrecedingTeamScheduling.prototype, "productionSchedulingData", void 0);



__decorate([
    sequelize_typescript_1.HasMany(() => PrecedingTeamOutput_1.PrecedingTeamOutput)
], PrecedingTeamScheduling.prototype, "precedingTeamOutputData", void 0);


PrecedingTeamScheduling = __decorate([
    sequelize_typescript_1.Table
], PrecedingTeamScheduling);
exports.PrecedingTeamScheduling = PrecedingTeamScheduling;
exports.precedingTeamSchedulingJoin = new Array();
exports.precedingTeamSchedulingJoin.push({ foreignKey: "productionScheduling", includeModel: () => { return { model: ProductionScheduling_1.ProductionScheduling }; } });
exports.precedingTeamSchedulingJoin.push({ foreignKey: "cropTeam", includeModel: () => { return { model: Team_1.Team, as: "cropTeamData" }; } });
exports.precedingTeamSchedulingJoin.push({ foreignKey: "stickTeam", includeModel: () => { return { model: Team_1.Team, as: "stickTeamData" }; } });
exports.precedingTeamSchedulingJoin.push({ includeModel: () => { return { model: PrecedingTeamOutput_1.PrecedingTeamOutput }; } });
