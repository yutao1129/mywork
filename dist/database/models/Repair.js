//modify Yutao.liu 添加两个外键 字段 factory team 分别属于factory ,team 的id
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
const Equipment_1 = require("./Equipment");
const Team_1 = require("./Team");
const Factory_1 =require("./Factory");
const Company_1 = require("./Company");
let Repair = class Repair extends sequelize_typescript_1.Model {
    constructor(values, options) {
        super(values, options);
    }
};
__decorate([
    sequelize_typescript_1.ForeignKey(() => Equipment_1.Equipment),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], Repair.prototype, "equipment", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => UserAccount_1.UserAccount),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], Repair.prototype, "repoter", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => UserAccount_1.UserAccount),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], Repair.prototype, "receiver", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(40))
], Repair.prototype, "type", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(32))
], Repair.prototype, "status", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.DATE)
], Repair.prototype, "date", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Factory_1.Factory),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], Repair.prototype, "factory", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Team_1.Team),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], Repair.prototype, "team", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Company_1.Company),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], Repair.prototype, "company", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Company_1.Company)
], Repair.prototype, "companyData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Equipment_1.Equipment)
], Repair.prototype, "equipmentData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => UserAccount_1.UserAccount, 'repoter')
], Repair.prototype, "repoterData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => UserAccount_1.UserAccount, 'receiver')
], Repair.prototype, "receiverData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Factory_1.Factory, 'factory')
], Repair.prototype, "factoryData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Team_1.Team, 'team')
], Repair.prototype, "teamData", void 0);
Repair = __decorate([
    sequelize_typescript_1.Table
], Repair);
exports.Repair = Repair;
exports.repairJoin = new Array();
exports.repairJoin.push({ foreignKey: "equipment", includeModel: () => { return { model: Equipment_1.Equipment }; } });
exports.repairJoin.push({ foreignKey: "repoter", includeModel: () => { return { model: UserAccount_1.UserAccount, as: "repoterData" }; } });
exports.repairJoin.push({ foreignKey: "receiver", includeModel: () => { return { model: UserAccount_1.UserAccount, as: "receiverData" }; } });
exports.repairJoin.push({ foreignKey: "factory", includeModel: () => { return { model: Factory_1.Factory, as: "factoryData" }; } });
exports.repairJoin.push({ foreignKey: "team", includeModel: () => { return { model: Team_1.Team, as: "teamData" }; } });
