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
const FollowingTeamOutput_1 = require("./FollowingTeamOutput");
const Team_1 = require("./Team");
const Company_1 = require("./Company");
let FollowingTeamScheduling = class FollowingTeamScheduling extends sequelize_typescript_1.Model {
    constructor(values, options) {
        super(values, options);
    }
};
__decorate([
    sequelize_typescript_1.ForeignKey(() => ProductionScheduling_1.ProductionScheduling),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], FollowingTeamScheduling.prototype, "productionScheduling", void 0);

__decorate([
    sequelize_typescript_1.ForeignKey(() => Team_1.Team),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], FollowingTeamScheduling.prototype, "lockTeam", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Team_1.Team),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], FollowingTeamScheduling.prototype, "ironTeam", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Team_1.Team),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], FollowingTeamScheduling.prototype, "packTeam", void 0);

__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], FollowingTeamScheduling.prototype, "amount", void 0);

__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], FollowingTeamScheduling.prototype, "lockEstimatedWorkingDay", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.DATEONLY)
], FollowingTeamScheduling.prototype, "lockStartDate", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.DATEONLY)
], FollowingTeamScheduling.prototype, "lockEndDate", void 0);

__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], FollowingTeamScheduling.prototype, "ironEstimatedWorkingDay", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.DATEONLY)
], FollowingTeamScheduling.prototype, "ironStartDate", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.DATEONLY)
], FollowingTeamScheduling.prototype, "ironEndDate", void 0);

__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], FollowingTeamScheduling.prototype, "packEstimatedWorkingDay", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.DATEONLY)
], FollowingTeamScheduling.prototype, "packStartDate", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.DATEONLY)
], FollowingTeamScheduling.prototype, "packEndDate", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Company_1.Company),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], FollowingTeamScheduling.prototype, "company", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Company_1.Company)
], FollowingTeamScheduling.prototype, "companyData", void 0);

__decorate([
    sequelize_typescript_1.BelongsTo(() => Team_1.Team, 'lockTeam')
], FollowingTeamScheduling.prototype, "lockTeamData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Team_1.Team, 'ironTeam')
], FollowingTeamScheduling.prototype, "ironTeamData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Team_1.Team, 'packTeam')
], FollowingTeamScheduling.prototype, "packTeamData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => ProductionScheduling_1.ProductionScheduling)
], FollowingTeamScheduling.prototype, "productionSchedulingData", void 0);

__decorate([
    sequelize_typescript_1.HasMany(() => FollowingTeamOutput_1.FollowingTeamOutput)
], FollowingTeamScheduling.prototype, "followingTeamOutputData", void 0);

FollowingTeamScheduling = __decorate([
    sequelize_typescript_1.Table
], FollowingTeamScheduling);
exports.FollowingTeamScheduling = FollowingTeamScheduling;
exports.followingTeamSchedulingJoin = new Array();
exports.followingTeamSchedulingJoin.push({ foreignKey: "productionScheduling", includeModel: () => { return { model: ProductionScheduling_1.ProductionScheduling }; } });
exports.followingTeamSchedulingJoin.push({ foreignKey: "lockTeam", includeModel: () => { return { model: Team_1.Team, as: "lockTeamData" }; } });
exports.followingTeamSchedulingJoin.push({ foreignKey: "ironTeam", includeModel: () => { return { model: Team_1.Team, as: "ironTeamData" }; } });
exports.followingTeamSchedulingJoin.push({ foreignKey: "packTeam", includeModel: () => { return { model: Team_1.Team, as: "packTeamData" }; } });
exports.followingTeamSchedulingJoin.push({ includeModel: () => { return { model:FollowingTeamOutput_1.FollowingTeamOutput }; } });