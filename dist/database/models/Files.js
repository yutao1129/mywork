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
let Files = class Files extends sequelize_typescript_1.Model {
    constructor(values, options) {
        super(values, options);
    }
};
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(128))
], Files.prototype, "filename", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(128))
], Files.prototype, "mimetype", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.DATE)
], Files.prototype, "createdTime", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.BLOB('long'))
], Files.prototype, "content", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Company_1.Company),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], Files.prototype, "company", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Company_1.Company)
], Files.prototype, "companyData", void 0);
Files = __decorate([
    sequelize_typescript_1.Table
], Files);
exports.Files = Files;
