"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const Style_1 = require("./Style");
const Operation_1 = require("./Operation");
const Company_1 = require("./Company");
let StyleOperation = class StyleOperation extends sequelize_typescript_1.Model {
    constructor(values, options) {
        super(values, options);
    }
};
__decorate([
    sequelize_typescript_1.ForeignKey(() => Style_1.Style),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(40))
], StyleOperation.prototype, "style", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Operation_1.Operation),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], StyleOperation.prototype, "operation", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Style_1.Style)
], StyleOperation.prototype, "styleData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Operation_1.Operation)
], StyleOperation.prototype, "operationData", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Company_1.Company),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], StyleOperation.prototype, "company", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Company_1.Company)
], StyleOperation.prototype, "companyData", void 0);
StyleOperation = __decorate([
    sequelize_typescript_1.Table
], StyleOperation);
exports.StyleOperation = StyleOperation;
exports.styleOperationJoin = new Array();
exports.styleOperationJoin.push({ includeModel: () => { return { model: Style_1.Style }; }, foreignKey: 'style' });
exports.styleOperationJoin.push({ includeModel: () => { return { model: Operation_1.Operation }; }, foreignKey: 'operation' });
