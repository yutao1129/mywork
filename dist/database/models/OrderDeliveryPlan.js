"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const Size_1 = require("./Size");
const ColorCode_1 = require("./ColorCode");
const Order_1 = require("./Order");
const Company_1 = require("./Company");
let OrderDeliveryPlan = class OrderDeliveryPlan extends sequelize_typescript_1.Model {
    constructor(values, options) {
        super(values, options);
    }
};
__decorate([
    sequelize_typescript_1.ForeignKey(() => Order_1.Order),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], OrderDeliveryPlan.prototype, "order", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => ColorCode_1.ColorCode),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], OrderDeliveryPlan.prototype, "colorCode", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Size_1.Size),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(40))
], OrderDeliveryPlan.prototype, "size", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(40))
], OrderDeliveryPlan.prototype, "deliveryRegion", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], OrderDeliveryPlan.prototype, "totalAmount", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], OrderDeliveryPlan.prototype, "outsourcingAmount", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], OrderDeliveryPlan.prototype, "completed", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Company_1.Company),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], OrderDeliveryPlan.prototype, "company", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Company_1.Company)
], OrderDeliveryPlan.prototype, "companyData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Order_1.Order)
], OrderDeliveryPlan.prototype, "orderData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => ColorCode_1.ColorCode)
], OrderDeliveryPlan.prototype, "colorCodeData", void 0);
OrderDeliveryPlan = __decorate([
    sequelize_typescript_1.Table
], OrderDeliveryPlan);
exports.OrderDeliveryPlan = OrderDeliveryPlan;
exports.orderDeliveryPlanJoin = new Array();
exports.orderDeliveryPlanJoin.push({ includeModel: () => { return { model: Order_1.Order }; }, foreignKey: 'order' });
exports.orderDeliveryPlanJoin.push({ includeModel: () => { return { model: ColorCode_1.ColorCode }; }, foreignKey: 'colorCode' });
