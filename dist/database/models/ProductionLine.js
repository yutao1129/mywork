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
const Equipment_1 = require("./Equipment");
const Company_1 = require("./Company");
let ProductionLine = class ProductionLine extends sequelize_typescript_1.Model {
    constructor(values, options) {
        super(values, options);
    }
};
__decorate([
    sequelize_typescript_1.ForeignKey(() => Team_1.Team),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], ProductionLine.prototype, "team", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Station_1.Station),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], ProductionLine.prototype, "station", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Equipment_1.Equipment),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], ProductionLine.prototype, "equipment", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Equipment_1.Equipment),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], ProductionLine.prototype, "pad", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Company_1.Company),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], ProductionLine.prototype, "company", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Company_1.Company)
], ProductionLine.prototype, "companyData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Team_1.Team)
], ProductionLine.prototype, "teamData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Station_1.Station)
], ProductionLine.prototype, "stationData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Equipment_1.Equipment, 'equipment')
], ProductionLine.prototype, "equipmentData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Equipment_1.Equipment, 'pad')
], ProductionLine.prototype, "padData", void 0);
ProductionLine = __decorate([
    sequelize_typescript_1.Table
], ProductionLine);
exports.ProductionLine = ProductionLine;
exports.productionLineJoin = new Array();
exports.productionLineJoin.push({ foreignKey: "team", includeModel: () => { return { model: Team_1.Team }; } });
exports.productionLineJoin.push({ foreignKey: "station", includeModel: () => { return { model: Station_1.Station }; } });
exports.productionLineJoin.push({ foreignKey: "equipment", includeModel: () => { return { model: Equipment_1.Equipment, as: "equipmentData" }; } });
exports.productionLineJoin.push({ foreignKey: "pad", includeModel: () => { return { model: Equipment_1.Equipment, as: "padData" }; } });
