"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const Files_1 = require("./Files");
const Company_1 = require("./Company");
let UserAccount = class UserAccount extends sequelize_typescript_1.Model {
    constructor(values, options) {
        super(values, options);
    }
};
__decorate([
    sequelize_typescript_1.Unique,
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(128))
], UserAccount.prototype, "username", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(255))
], UserAccount.prototype, "password", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(40))
], UserAccount.prototype, "chineseName", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(40))
], UserAccount.prototype, "englishName", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(30))
], UserAccount.prototype, "mobilePhone", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(255))
], UserAccount.prototype, "employeeID", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.DATEONLY)
], UserAccount.prototype, "birthday", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.DATEONLY)
], UserAccount.prototype, "joinedDate", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(30))
], UserAccount.prototype, "title", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(255))
], UserAccount.prototype, "emailAddress", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(20))
], UserAccount.prototype, "postalCode", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(255))
], UserAccount.prototype, "physicalAddress", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.TEXT)
], UserAccount.prototype, "autobiography", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Files_1.Files),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], UserAccount.prototype, "photo", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(255))
], UserAccount.prototype, "comment", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(255))
], UserAccount.prototype, "skill", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(20))
], UserAccount.prototype, "status", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.TINYINT(1))
], UserAccount.prototype, "sex", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.TINYINT(1))
], UserAccount.prototype, "admin", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(128))
], UserAccount.prototype, "cardNumber", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Company_1.Company),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], UserAccount.prototype, "company", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Company_1.Company)
], UserAccount.prototype, "companyData", void 0);
UserAccount = __decorate([
    sequelize_typescript_1.Table
], UserAccount);
exports.UserAccount = UserAccount;
;
exports.userAccountJoin = new Array();