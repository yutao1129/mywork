"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const Company_1 = require("./Company");
let EquipmentIntelligence = class EquipmentIntelligence extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.Column({
        primaryKey: true,
        autoIncrement: true,
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: false
    })
], EquipmentIntelligence.prototype, "id", void 0);
__decorate([
    sequelize_typescript_1.Column({
        type: sequelize_typescript_1.DataType.DATE,
        allowNull: false,
        comment: "update time"
    })
], EquipmentIntelligence.prototype, "updateTime", void 0);
__decorate([
    sequelize_typescript_1.Column({
        type: sequelize_typescript_1.DataType.CHAR(12),
        allowNull: false,
        comment: "mac address"
    })
], EquipmentIntelligence.prototype, "mac", void 0);
__decorate([
    sequelize_typescript_1.Column({
        type: sequelize_typescript_1.DataType.DATE,
        comment: "power on time"
    })
], EquipmentIntelligence.prototype, "powerOnTime", void 0);
__decorate([
    sequelize_typescript_1.Column({
        type: sequelize_typescript_1.DataType.DATE,
        comment: "working start time"
    })
], EquipmentIntelligence.prototype, "workingStartTime", void 0);
__decorate([
    sequelize_typescript_1.Column({
        type: sequelize_typescript_1.DataType.INTEGER,
        defaultValue: 0,
        comment: "working Time Span"
    })
], EquipmentIntelligence.prototype, "workingTimeSpan", void 0);
__decorate([
    sequelize_typescript_1.Column({
        type: sequelize_typescript_1.DataType.INTEGER,
        defaultValue: 0,
        comment: "power On Time Span"
    })
], EquipmentIntelligence.prototype, "powerOnTimeSpan", void 0);
__decorate([
    sequelize_typescript_1.Column({
        type: sequelize_typescript_1.DataType.FLOAT(4, 3),
        defaultValue: 0,
        comment: "utilizationRate"
    })
], EquipmentIntelligence.prototype, "utilizationRate", void 0);
__decorate([
    sequelize_typescript_1.Column({
        type: sequelize_typescript_1.DataType.INTEGER,
        defaultValue: 0,
        comment: "revolution speed"
    })
], EquipmentIntelligence.prototype, "revolutionSpeed", void 0);
__decorate([
    sequelize_typescript_1.Column({
        type: sequelize_typescript_1.DataType.INTEGER,
        defaultValue: 0,
        comment: "status"
    })
], EquipmentIntelligence.prototype, "status", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Company_1.Company),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], EquipmentIntelligence.prototype, "company", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Company_1.Company)
], EquipmentIntelligence.prototype, "companyData", void 0);
EquipmentIntelligence = __decorate([
    sequelize_typescript_1.Table
], EquipmentIntelligence);
exports.EquipmentIntelligence = EquipmentIntelligence;
//# sourceMappingURL=EquipmentIntelligence.js.map