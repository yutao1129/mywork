//modify:Yutao.liu
//20181120 设置orderID 和deliveryDate 为 联合唯一 索引
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
const Style_1 = require("./Style");
const OrderDeliveryPlan_1 = require("./OrderDeliveryPlan");
const Company_1 = require("./Company");
let Order = class Order extends sequelize_typescript_1.Model {
    constructor(values, options) {
        super(values, options);
    }
};
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column({
        type:sequelize_typescript_1.DataType.STRING(40),
        unique:"orderIDDeliveryDateUnique"
    })
], Order.prototype, "orderID", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Style_1.Style),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(40))
], Order.prototype, "style", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => UserAccount_1.UserAccount),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], Order.prototype, "creator", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.DATE)
], Order.prototype, "createdTime", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.TINYINT(1))
], Order.prototype, "status", void 0);
__decorate([
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(
        {
            type:sequelize_typescript_1.DataType.DATEONLY,
            unique:"orderIDDeliveryDateUnique"
        }
    )
], Order.prototype, "deliveryDate", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Company_1.Company),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], Order.prototype, "company", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Company_1.Company)
], Order.prototype, "companyData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Style_1.Style)
], Order.prototype, "styleData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => UserAccount_1.UserAccount)
], Order.prototype, "creatorData", void 0);
__decorate([
    sequelize_typescript_1.HasMany(() => OrderDeliveryPlan_1.OrderDeliveryPlan)
], Order.prototype, "orderDeliveryPlanData", void 0);
Order = __decorate([
    sequelize_typescript_1.Table
], Order);
exports.Order = Order;
exports.orderJoin = new Array();
exports.orderJoin.push({ includeModel: () => { return { model: Style_1.Style }; }, foreignKey: 'style' });
exports.orderJoin.push({ includeModel: () => { return { model: UserAccount_1.UserAccount }; }, foreignKey: 'creator' });
exports.orderJoin.push({ includeModel: () => { return { model: OrderDeliveryPlan_1.OrderDeliveryPlan }; } });
