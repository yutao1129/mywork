"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const Team_1 = require("./Team");
const UserAccount_1 = require("./UserAccount");
const Company_1 = require("./Company");
let TeamMember = class TeamMember extends sequelize_typescript_1.Model {
    constructor(values, options) {
        super(values, options);
    }
};
__decorate([
    sequelize_typescript_1.ForeignKey(() => Team_1.Team),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], TeamMember.prototype, "team", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => UserAccount_1.UserAccount),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], TeamMember.prototype, "member", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(32))
], TeamMember.prototype, "title", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(20))
], TeamMember.prototype, "phoneNumber", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Company_1.Company),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], TeamMember.prototype, "company", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Company_1.Company)
], TeamMember.prototype, "companyData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => UserAccount_1.UserAccount)
], TeamMember.prototype, "memberData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Team_1.Team)
], TeamMember.prototype, "teamData", void 0);
TeamMember = __decorate([
    sequelize_typescript_1.Table
], TeamMember);
exports.TeamMember = TeamMember;
exports.teamMemberJoin = new Array();
exports.teamMemberJoin.push({ includeModel: () => { return { model: Team_1.Team }; }, foreignKey: 'team' });
exports.teamMemberJoin.push({ includeModel: () => { return { model: UserAccount_1.UserAccount }; }, foreignKey: 'member' });
