"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var StyleProcess_1;
"use strict";
const sequelize_typescript_1 = require("sequelize-typescript");
const Style_1 = require("./Style");
const Process_1 = require("./Process");
const ProcessPartCard_1 = require("./ProcessPartCard");
const PartCard_1 = require("./PartCard");
const Company_1 = require("./Company");
let StyleProcess = StyleProcess_1 = class StyleProcess extends sequelize_typescript_1.Model {
    constructor(values, options) {
        super(values, options);
    }
};
__decorate([
    sequelize_typescript_1.ForeignKey(() => Style_1.Style),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(40))
], StyleProcess.prototype, "style", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Process_1.Process),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], StyleProcess.prototype, "process", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => StyleProcess_1),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], StyleProcess.prototype, "nextProcess", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Company_1.Company),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], StyleProcess.prototype, "company", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Company_1.Company)
], StyleProcess.prototype, "companyData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Style_1.Style)
], StyleProcess.prototype, "styleData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Process_1.Process)
], StyleProcess.prototype, "processData", void 0);
StyleProcess = StyleProcess_1 = __decorate([
    sequelize_typescript_1.Table
], StyleProcess);
exports.StyleProcess = StyleProcess;
exports.styleProcessJoin = new Array();
exports.styleProcessJoin.push({ includeModel: () => { return { model: Style_1.Style }; }, foreignKey: 'style' });
exports.styleProcessJoin.push({ includeModel: () => { return { model: Process_1.Process,include:[{ model: ProcessPartCard_1.ProcessPartCard,include:[{model: PartCard_1.PartCard}] }] }; }, foreignKey: 'process' });
