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
const PartCard_1 = require("./PartCard");
const Company_1 = require("./Company");
let StylePartCard = class StylePartCard extends sequelize_typescript_1.Model {
    constructor(values, options) {
        super(values, options);
    }
};
__decorate([
    sequelize_typescript_1.ForeignKey(() => Style_1.Style),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(40))
], StylePartCard.prototype, "style", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => PartCard_1.PartCard),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], StylePartCard.prototype, "partCard", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Company_1.Company),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], StylePartCard.prototype, "company", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Company_1.Company)
], StylePartCard.prototype, "companyData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Style_1.Style)
], StylePartCard.prototype, "styleData", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => PartCard_1.PartCard)
], StylePartCard.prototype, "partCardData", void 0);

StylePartCard = __decorate([
    sequelize_typescript_1.Table
], StylePartCard);
exports.StylePartCard = StylePartCard;
exports.stylePartCardJoin = new Array();
exports.stylePartCardJoin.push({ includeModel: () => { return { model: Style_1.Style }; }, foreignKey: 'style' });
exports.stylePartCardJoin.push({ includeModel: () => { return { model: PartCard_1.PartCard }; }, foreignKey: 'partCard' });
