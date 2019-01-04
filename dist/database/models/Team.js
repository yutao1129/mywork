"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const Factory_1 = require("./Factory");
const TeamMember_1 = require("./TeamMember");
const UserAccount_1 = require("./UserAccount");
const Company_1 = require("./Company");
let Team = class Team extends sequelize_typescript_1.Model {
    constructor(values, options) {
        super(values, options);
    }
};
__decorate([
    sequelize_typescript_1.Unique,
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(40))
], Team.prototype, "teamID", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(32))
], Team.prototype, "name", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Factory_1.Factory),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], Team.prototype, "factory", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(40))
], Team.prototype, "category", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], Team.prototype, "stationAmount", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => UserAccount_1.UserAccount),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], Team.prototype, "leader", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(32))
], Team.prototype, "leaderPhoneNumber", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Company_1.Company),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], Team.prototype, "company", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Company_1.Company)
], Team.prototype, "companyData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Factory_1.Factory)
], Team.prototype, "factoryData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => UserAccount_1.UserAccount)
], Team.prototype, "leaderData", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => TeamMember_1.TeamMember)
], Team.prototype, "teamMemberData", void 0);
Team = __decorate([
    sequelize_typescript_1.Table
], Team);
exports.Team = Team;
exports.teamJoin = new Array();
exports.teamJoin.push({ includeModel: () => { return { model: Factory_1.Factory }; }, foreignKey: 'factory' });
exports.teamJoin.push({ includeModel: () => { return { model: UserAccount_1.UserAccount }; }, foreignKey: 'leader' });
exports.teamJoin.push({ includeModel: () => { return { model: TeamMember_1.TeamMember }; } });
