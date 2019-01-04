//modify 1121 simon 添加列 part 可以为空
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var MemberOutputProcess_1;
"use strict";
const sequelize_typescript_1 = require("sequelize-typescript");
const MemberOutput_1 = require("./MemberOutput");
const Process_1 = require("./Process");
const Company_1 = require("./Company");
let MemberOutputProcess = MemberOutputProcess_1 = class MemberOutputProcess extends sequelize_typescript_1.Model {
    constructor(values, options) {
        super(values, options);
    }
};
__decorate([
    sequelize_typescript_1.ForeignKey(() => MemberOutput_1.MemberOutput),
    sequelize_typescript_1.Column({type:sequelize_typescript_1.DataType.INTEGER, allowNull: false}),
   
], MemberOutputProcess.prototype, "memberOutput", void 0);
__decorate([
    sequelize_typescript_1.Column({type:sequelize_typescript_1.DataType.STRING(255), allowNull: false}),
], MemberOutputProcess.prototype, "bundleNumber", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Process_1.Process),
    sequelize_typescript_1.Column({type:sequelize_typescript_1.DataType.INTEGER, allowNull: false}),
], MemberOutputProcess.prototype, "process", void 0);
__decorate([
    sequelize_typescript_1.Column({type:sequelize_typescript_1.DataType.STRING(255), allowNull: true}),
], MemberOutputProcess.prototype, "part", void 0);
__decorate([
    sequelize_typescript_1.Column({type:sequelize_typescript_1.DataType.DATE, allowNull: true}),
], MemberOutputProcess.prototype, "date", void 0);
__decorate([
    sequelize_typescript_1.Column({type:sequelize_typescript_1.DataType.INTEGER, allowNull: false}),
], MemberOutputProcess.prototype, "rfid", void 0);
__decorate([
sequelize_typescript_1.Column(sequelize_typescript_1.DataType.DECIMAL(10, 3)),
], MemberOutputProcess.prototype, "pay", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Company_1.Company),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], MemberOutputProcess.prototype, "company", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Company_1.Company)
], MemberOutputProcess.prototype, "companyData", void 0);

__decorate([
    sequelize_typescript_1.BelongsTo(() => MemberOutput_1.MemberOutput)
], MemberOutputProcess.prototype, "memberOutputData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Process_1.Process)
], MemberOutputProcess.prototype, "processData", void 0);
MemberOutputProcess = MemberOutputProcess_1 = __decorate([
    sequelize_typescript_1.Table
], MemberOutputProcess);
exports.MemberOutputProcess = MemberOutputProcess;
exports.memberOutputProcessJoin = new Array();
exports.memberOutputProcessJoin.push({ includeModel: () => { return { model: MemberOutput_1.MemberOutput }; }, foreignKey: 'memberOutput' });
exports.memberOutputProcessJoin.push({ includeModel: () => { return { model: Process_1.Process }; }, foreignKey: 'process' });
