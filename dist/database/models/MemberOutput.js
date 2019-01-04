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
const Station_1 = require("./Station");
const UserAccount_1 = require("./UserAccount");
const ProductionScheduling_1 = require("./ProductionScheduling");
const Step_1 = require("./Step");
const Company_1 = require("./Company");
let MemberOutput = class MemberOutput extends sequelize_typescript_1.Model {
    constructor(values, options) {
        super(values, options);
    }
};
__decorate([
    sequelize_typescript_1.ForeignKey(() => ProductionScheduling_1.ProductionScheduling),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], MemberOutput.prototype, "productionScheduling", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => UserAccount_1.UserAccount),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], MemberOutput.prototype, "worker", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Team_1.Team),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], MemberOutput.prototype, "team", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Station_1.Station),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], MemberOutput.prototype, "station", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Step_1.Step),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(40))
], MemberOutput.prototype, "step", void 0);
__decorate([
    sequelize_typescript_1.Default(0),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], MemberOutput.prototype, "amount", void 0);
__decorate([
    sequelize_typescript_1.Default(0),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], MemberOutput.prototype, "processAmount", void 0);
__decorate([
    sequelize_typescript_1.Default(0),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.DECIMAL(10, 2))
], MemberOutput.prototype, "pay", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.DATE)
], MemberOutput.prototype, "date", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(128))
], MemberOutput.prototype, "bundleNumber", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Company_1.Company),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], MemberOutput.prototype, "company", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Company_1.Company)
], MemberOutput.prototype, "companyData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => UserAccount_1.UserAccount)
], MemberOutput.prototype, "workerData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Team_1.Team)
], MemberOutput.prototype, "teamData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() =>Station_1.Station)
], MemberOutput.prototype, "stationData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => ProductionScheduling_1.ProductionScheduling)
], MemberOutput.prototype, "productionSchedulingData", void 0);
MemberOutput = __decorate([
    sequelize_typescript_1.Table
], MemberOutput);
exports.MemberOutput = MemberOutput;
exports.memberOutputJoin = new Array();
exports.memberOutputJoin.push({ foreignKey: "worker", includeModel: () => { return { model: UserAccount_1.UserAccount }; } });
exports.memberOutputJoin.push({ foreignKey: "team", includeModel: () => { return { model: Team_1.Team }; } });
exports.memberOutputJoin.push({ foreignKey: "station", includeModel: () => { return { model:  Station_1.Station }; } });
exports.memberOutputJoin.push({ foreignKey: "productionScheduling",
    includeModel: () => { return { model: ProductionScheduling_1.ProductionScheduling }; } });
