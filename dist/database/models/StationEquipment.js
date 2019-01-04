"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const Station_1 = require("./Station");
const Equipment_1 = require("./Equipment");
const Company_1 = require("./Company");
let StationEquipment = class StationEquipment extends sequelize_typescript_1.Model {
    constructor(values, options) {
        super(values, options);
    }
};
__decorate([
    sequelize_typescript_1.ForeignKey(() => Station_1.Station),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], StationEquipment.prototype, "station", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Equipment_1.Equipment),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], StationEquipment.prototype, "equipment", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Station_1.Station)
], StationEquipment.prototype, "stationData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Equipment_1.Equipment)
], StationEquipment.prototype, "equipmentData", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Company_1.Company),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], StationEquipment.prototype, "company", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Company_1.Company)
], StationEquipment.prototype, "companyData", void 0);
StationEquipment = __decorate([
    sequelize_typescript_1.Table
], StationEquipment);
exports.StationEquipment = StationEquipment;
exports.stationEquipmentJoin = new Array();
exports.stationEquipmentJoin.push({ includeModel: () => { return { model: Station_1.Station }; }, foreignKey: 'station' });
exports.stationEquipmentJoin.push({ includeModel: () => { return { model: Equipment_1.Equipment }; }, foreignKey: 'equipment' });
