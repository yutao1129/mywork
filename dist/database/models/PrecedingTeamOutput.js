"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const PrecedingTeamScheduling_1 = require("./PrecedingTeamScheduling");
const Company_1 =require("./Company");
let PrecedingTeamOutput = class PrecedingTeamOutput extends sequelize_typescript_1.Model {
    constructor(values, options) {
        super(values, options);
    }
};
__decorate([
    sequelize_typescript_1.ForeignKey(() => PrecedingTeamScheduling_1.PrecedingTeamScheduling),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], PrecedingTeamOutput.prototype, "precedingTeamScheduling", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.DATE)
], PrecedingTeamOutput.prototype, "date", void 0);
__decorate([
    sequelize_typescript_1.Default(0),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], PrecedingTeamOutput.prototype, "cropAmount", void 0);
__decorate([
    sequelize_typescript_1.Default(0),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], PrecedingTeamOutput.prototype, "stickAmount", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() =>  PrecedingTeamScheduling_1.PrecedingTeamScheduling)
], PrecedingTeamOutput.prototype, "precedingTeamOutputData", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Company_1.Company),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], PrecedingTeamOutput.prototype, "company", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Company_1.Company)
], PrecedingTeamOutput.prototype, "companyData", void 0);
PrecedingTeamOutput = __decorate([
    sequelize_typescript_1.Table
], PrecedingTeamOutput);
exports.PrecedingTeamOutput = PrecedingTeamOutput;
exports.PrecedingTeamOutputJoin = new Array();
exports.PrecedingTeamOutputJoin.push({ foreignKey: "precedingTeamScheduling", includeModel: () => { return { model: PrecedingTeamScheduling_1.PrecedingTeamScheduling }; } });
