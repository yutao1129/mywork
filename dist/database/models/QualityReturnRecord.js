//author 20181122 Yutao.liu
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
let QualityReturnRecord= class QualityReturnRecord extends sequelize_typescript_1.Model {
    constructor(values, options) {
        super(values, options);
    }
};
__decorate([
    sequelize_typescript_1.Column({
        type:sequelize_typescript_1.DataType.STRING(255),
        allowNull: false
    })
], QualityReturnRecord.prototype, "bundleNumber", void 0);
__decorate([
    sequelize_typescript_1.Column({
        type:sequelize_typescript_1.DataType.INTEGER,
        defaultValue:0}),
], QualityReturnRecord.prototype, "count", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Company_1.Company),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], QualityReturnRecord.prototype, "company", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Company_1.Company)
], QualityReturnRecord.prototype, "companyData", void 0);
QualityReturnRecord = __decorate([
    sequelize_typescript_1.Table
], QualityReturnRecord);
exports.QualityReturnRecord = QualityReturnRecord;