"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const Process_1 = require("./Process");
const PartCard_1 = require("./PartCard");
const Company_1 = require("./Company");
let ProcessPartCard = class ProcessPartCard extends sequelize_typescript_1.Model {
    constructor(values, options) {
        super(values, options);
    }
};
__decorate([
    sequelize_typescript_1.ForeignKey(() => Process_1.Process),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], ProcessPartCard.prototype, "process", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => PartCard_1.PartCard),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], ProcessPartCard.prototype, "partCard", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Company_1.Company),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], ProcessPartCard.prototype, "company", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Company_1.Company)
], ProcessPartCard.prototype, "companyData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Process_1.Process)
], ProcessPartCard.prototype, "ProcessData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => PartCard_1.PartCard)
], ProcessPartCard.prototype, "partCardData", void 0);
ProcessPartCard = __decorate([
    sequelize_typescript_1.Table
], ProcessPartCard);
exports.ProcessPartCard = ProcessPartCard;
exports.ProcessPartCardJoin = new Array();
exports.ProcessPartCardJoin.push({ includeModel: () => { return { model: Process_1.Process }; }, foreignKey: 'process' });
exports.ProcessPartCardJoin.push({ includeModel: () => { return { model: PartCard_1.PartCard }; }, foreignKey: 'partCard' });
