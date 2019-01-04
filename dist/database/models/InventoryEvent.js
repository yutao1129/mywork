"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const Material_1 = require("./Material");
const UserAccount_1 = require("./UserAccount");
const Order_1 = require("./Order");
const Team_1 = require("./Team");
const Company_1 = require("./Company");
let InventoryEvent = class InventoryEvent extends sequelize_typescript_1.Model {
    constructor(values, options) {
        super(values, options);
    }
};
__decorate([
    sequelize_typescript_1.ForeignKey(() => Material_1.Material),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], InventoryEvent.prototype, "material", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Order_1.Order),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], InventoryEvent.prototype, "order", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Team_1.Team),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], InventoryEvent.prototype, "team", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => UserAccount_1.UserAccount),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], InventoryEvent.prototype, "executor", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => UserAccount_1.UserAccount),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], InventoryEvent.prototype, "receiver", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.FLOAT(12, 2))
], InventoryEvent.prototype, "width", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.DATE)
], InventoryEvent.prototype, "eventTime", void 0);
__decorate([
    sequelize_typescript_1.Default(0),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], InventoryEvent.prototype, "purchaseVolume", void 0);
__decorate([
    sequelize_typescript_1.Default(0),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.DOUBLE)
], InventoryEvent.prototype, "purchaseLength", void 0);
__decorate([
    sequelize_typescript_1.Default(0),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], InventoryEvent.prototype, "shipVolume", void 0);
__decorate([
    sequelize_typescript_1.Default(0),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.DOUBLE)
], InventoryEvent.prototype, "shipLength", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(256))
], InventoryEvent.prototype, "comment", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(32))
], InventoryEvent.prototype, "eventType", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Company_1.Company),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], InventoryEvent.prototype, "company", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Company_1.Company)
], InventoryEvent.prototype, "companyData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Material_1.Material)
], InventoryEvent.prototype, "materialData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Order_1.Order)
], InventoryEvent.prototype, "orderData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => UserAccount_1.UserAccount, 'executor')
], InventoryEvent.prototype, "executorData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => UserAccount_1.UserAccount, 'receiver')
], InventoryEvent.prototype, "receiverData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Team_1.Team)
], InventoryEvent.prototype, "teamData", void 0);
InventoryEvent = __decorate([
    sequelize_typescript_1.Table
], InventoryEvent);
exports.InventoryEvent = InventoryEvent;
exports.inventoryEventJoin = new Array();
exports.inventoryEventJoin.push({ includeModel: () => { return { model: Material_1.Material }; }, foreignKey: 'material' });
exports.inventoryEventJoin.push({ includeModel: () => { return { model: Order_1.Order }; }, foreignKey: 'order' });
exports.inventoryEventJoin.push({ includeModel: () => { return { model: Team_1.Team }; }, foreignKey: 'team' });
exports.inventoryEventJoin.push({ includeModel: () => { return { model: UserAccount_1.UserAccount, as: 'executorData' }; }, foreignKey: 'executor' });
exports.inventoryEventJoin.push({ includeModel: () => { return { model: UserAccount_1.UserAccount, as: 'receiverData' }; }, foreignKey: 'receiver' });
