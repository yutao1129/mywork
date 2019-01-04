"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const UserAccount_1 = require("./UserAccount");
let LoginToken = class LoginToken extends sequelize_typescript_1.Model {
    constructor(values, options) {
        super(values, options);
    }
};
__decorate([
    sequelize_typescript_1.Unique,
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(128))
], LoginToken.prototype, "token", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => UserAccount_1.UserAccount),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], LoginToken.prototype, "account", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.DATE)
], LoginToken.prototype, "issueDate", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.DATE)
], LoginToken.prototype, "expiredDate", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.SMALLINT)
], LoginToken.prototype, "status", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => UserAccount_1.UserAccount)
], LoginToken.prototype, "accountData", void 0);
LoginToken = __decorate([
    sequelize_typescript_1.Table
], LoginToken);
exports.LoginToken = LoginToken;
exports.loginTokenJoin = new Array();
exports.loginTokenJoin.push({ includeModel: () => { return { model: UserAccount_1.UserAccount }; }, foreignKey: 'account' });
