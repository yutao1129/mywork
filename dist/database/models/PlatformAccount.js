"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
let PlatformAccount = class PlatformAccount extends sequelize_typescript_1.Model {
    constructor(values, options) {
        super(values, options);
    }
};
__decorate([
    sequelize_typescript_1.Unique,
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(128))
], PlatformAccount.prototype, "username", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(255))
], PlatformAccount.prototype, "password", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(255))
], PlatformAccount.prototype, "emailAddress", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(20))
], PlatformAccount.prototype, "status", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.TINYINT(1))
], PlatformAccount.prototype, "admin", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(30))
], PlatformAccount.prototype, "mobilePhone", void 0);
PlatformAccount = __decorate([
    sequelize_typescript_1.Table
], PlatformAccount);
exports.PlatformAccount = PlatformAccount;
;
