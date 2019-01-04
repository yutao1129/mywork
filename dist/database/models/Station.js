"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Station_1;
"use strict";
const sequelize_typescript_1 = require("sequelize-typescript");
const UserAccount_1 = require("./UserAccount");
const StationEquipment_1 = require("./StationEquipment");
const ProcessStation_1 = require("./ProcessStation");
const Company_1 = require("./Company");
let Station = Station_1 = class Station extends sequelize_typescript_1.Model {
    constructor(values, options) {
        super(values, options);
    }
};
__decorate([
    sequelize_typescript_1.Unique,
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(40))
], Station.prototype, "stationID", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => UserAccount_1.UserAccount),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], Station.prototype, "operator", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Station_1),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], Station.prototype, "nextStation", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Company_1.Company),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], Station.prototype, "company", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Company_1.Company)
], Station.prototype, "companyData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Station_1)
], Station.prototype, "nextStationData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => UserAccount_1.UserAccount)
], Station.prototype, "operatorData", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => StationEquipment_1.StationEquipment)
], Station.prototype, "stationEquipmentData", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => ProcessStation_1.ProcessStation)
], Station.prototype, "processStationData", void 0);
Station = Station_1 = __decorate([
    sequelize_typescript_1.Table
], Station);
exports.Station = Station;
exports.stationJoin = new Array();
exports.stationJoin.push({ includeModel: () => { return { model: Station }; }, foreignKey: 'nextStation' });
exports.stationJoin.push({ includeModel: () => { return { model: UserAccount_1.UserAccount }; }, foreignKey: 'operator' });
exports.stationJoin.push({ includeModel: () => { return { model: StationEquipment_1.StationEquipment }; } });
exports.stationJoin.push({ includeModel: () => { return { model: ProcessStation_1.ProcessStation }; } });
