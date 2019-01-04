"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const StyleProcess_1 = require("./StyleProcess");
const Order_1 = require("./Order");
const Station_1 = require("./Station");
const Company_1 = require("./Company");
let ProcessStation = class ProcessStation extends sequelize_typescript_1.Model {
    constructor(values, options) {
        super(values, options);
    }
};
__decorate([
    sequelize_typescript_1.ForeignKey(() => Order_1.Order),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], ProcessStation.prototype, "order", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => StyleProcess_1.StyleProcess),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], ProcessStation.prototype, "styleProcess", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Station_1.Station),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], ProcessStation.prototype, "station", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Company_1.Company),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], ProcessStation.prototype, "company", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Company_1.Company)
], ProcessStation.prototype, "companyData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Order_1.Order)
], ProcessStation.prototype, "orderData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => StyleProcess_1.StyleProcess)
], ProcessStation.prototype, "styleProcessData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Station_1.Station)
], ProcessStation.prototype, "stationData", void 0);
ProcessStation = __decorate([
    sequelize_typescript_1.Table
], ProcessStation);
exports.ProcessStation = ProcessStation;
exports.processStationJoin = new Array();
exports.processStationJoin.push({ includeModel: () => { return { model: Order_1.Order }; }, foreignKey: 'order' });
exports.processStationJoin.push({ includeModel: () => { return { model: StyleProcess_1.StyleProcess }; }, foreignKey: 'styleProcess' });
exports.processStationJoin.push({ includeModel: () => { return { model: Station_1.Station }; }, foreignKey: 'station' });
