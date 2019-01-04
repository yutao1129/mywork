"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const OrderDeliveryPlan_1 = require("./OrderDeliveryPlan");
const Factory_1 = require("./Factory");
const SewingTeamScheduling_1 = require("./SewingTeamScheduling");
const PrecedingTeamScheduling_1 = require("./PrecedingTeamScheduling");
const FollowingTeamScheduling_1 = require("./FollowingTeamScheduling");
const MemberOutput_1 = require("./MemberOutput");
const Company_1 = require("./Company");
let ProductionScheduling = class ProductionScheduling extends sequelize_typescript_1.Model {
    constructor(values, options) {
        super(values, options);
    }
};
__decorate([
    sequelize_typescript_1.ForeignKey(() => OrderDeliveryPlan_1.OrderDeliveryPlan),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], ProductionScheduling.prototype, "orderDeliveryPlan", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Factory_1.Factory),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], ProductionScheduling.prototype, "factory", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], ProductionScheduling.prototype, "amount", void 0);
__decorate([
    sequelize_typescript_1.Default(0),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], ProductionScheduling.prototype, "cropCompleteAmount", void 0);
__decorate([
    sequelize_typescript_1.Default(0),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], ProductionScheduling.prototype, "stickCompleteAmount", void 0);
__decorate([
    sequelize_typescript_1.Default(0),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], ProductionScheduling.prototype, "sewingCompleteAmount", void 0);
__decorate([
    sequelize_typescript_1.Default(0),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], ProductionScheduling.prototype, "lockCompleteAmount", void 0);
__decorate([
    sequelize_typescript_1.Default(0),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], ProductionScheduling.prototype, "ironCompleteAmount", void 0);
__decorate([
    sequelize_typescript_1.Default(0),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], ProductionScheduling.prototype, "packCompleteAmount", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Company_1.Company),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], ProductionScheduling.prototype, "company", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Company_1.Company)
], ProductionScheduling.prototype, "companyData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => OrderDeliveryPlan_1.OrderDeliveryPlan)
], ProductionScheduling.prototype, "orderDeliveryPlanData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Factory_1.Factory)
], ProductionScheduling.prototype, "factoryData", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => SewingTeamScheduling_1.SewingTeamScheduling)
], ProductionScheduling.prototype, "sewingTeamSchedulingData", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => PrecedingTeamScheduling_1.PrecedingTeamScheduling)
], ProductionScheduling.prototype, "precedingTeamSchedulingData", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => FollowingTeamScheduling_1.FollowingTeamScheduling)
], ProductionScheduling.prototype, "followingTeamSchedulingData", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => MemberOutput_1.MemberOutput)
], ProductionScheduling.prototype, "memberOutputData", void 0);
ProductionScheduling = __decorate([
    sequelize_typescript_1.Table
], ProductionScheduling);
exports.ProductionScheduling = ProductionScheduling;
exports.productionSchedulingJoin = new Array();
exports.productionSchedulingJoin.push({ foreignKey: "factory", includeModel: () => { return { model: Factory_1.Factory }; } });
exports.productionSchedulingJoin.push({ foreignKey: "orderDeliveryPlan", includeModel: () => { return { model: OrderDeliveryPlan_1.OrderDeliveryPlan }; } });
exports.productionSchedulingJoin.push({ includeModel: () => { return { model: SewingTeamScheduling_1.SewingTeamScheduling }; } });
exports.productionSchedulingJoin.push({ includeModel: () => { return { model: PrecedingTeamScheduling_1.PrecedingTeamScheduling }; } });
exports.productionSchedulingJoin.push({ includeModel: () => { return { model: FollowingTeamScheduling_1.FollowingTeamScheduling }; } });
exports.productionSchedulingJoin.push({ includeModel: () => { return { model: MemberOutput_1.MemberOutput }; } });
