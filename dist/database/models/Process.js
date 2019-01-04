"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const ProcessPartCard_1 = require("./ProcessPartCard");
const PartCard_1 = require("./PartCard");
const Step_1 = require("./Step");
const EquipmentCategory_1 = require("./EquipmentCategory");
const Company_1 =require("./Company");
let Process = class Process extends sequelize_typescript_1.Model {
    constructor(values, options) {
        super(values, options);
    }
};
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(40))
], Process.prototype, "processID", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(40))
], Process.prototype, "type", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(40))
], Process.prototype, "name", void 0);
__decorate([
    // sequelize_typescript_1.ForeignKey(() => PartCard_1.PartCard),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], Process.prototype, "partCard", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Step_1.Step),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(40))
], Process.prototype, "step", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => EquipmentCategory_1.EquipmentCategory),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], Process.prototype, "equipmentCategory", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.DECIMAL(10, 2))
], Process.prototype, "workingHours", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.DECIMAL(10, 3))
], Process.prototype, "workingPrice", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(255))
], Process.prototype, "operationalRequirement", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.TINYINT(1))
], Process.prototype, "mold", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Company_1.Company),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], Process.prototype, "company", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Company_1.Company)
], Process.prototype, "companyData", void 0);
// __decorate([
//     sequelize_typescript_1.BelongsTo(() => PartCard_1.PartCard)
// ], Process.prototype, "partCardData", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => ProcessPartCard_1.ProcessPartCard)
], Process.prototype, "processPartCardData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => EquipmentCategory_1.EquipmentCategory)
], Process.prototype, "equipmentCategoryData", void 0);
Process = __decorate([
    sequelize_typescript_1.Table
], Process);
exports.Process = Process;
exports.processJoin = new Array();
// exports.processJoin.push({ includeModel: () => { return { model: PartCard_1.PartCard }; }, foreignKey: 'partCard' });
exports.processJoin.push({ includeModel: () => { return { model: ProcessPartCard_1.ProcessPartCard,include:[{model: PartCard_1.PartCard}] }; } });
exports.processJoin.push({ includeModel: () => { return { model: EquipmentCategory_1.EquipmentCategory }; }, foreignKey: 'equipmentCategory' });
