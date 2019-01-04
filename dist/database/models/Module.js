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
let Module = class Module extends sequelize_typescript_1.Model {
    constructor(values, options) {
        super(values, options);
    }
    static onInit() {
        console.log('Step Inited');
        return Promise.resolve();
    }
};
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(128))
], Module.prototype, "modulename", void 0);
__decorate([
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(128))
], Module.prototype, "url", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Company_1.Company),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], Module.prototype, "company", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Company_1.Company)
], Module.prototype, "companyData", void 0);
Module = __decorate([
    sequelize_typescript_1.Table
], Module);
exports.Module = Module;
exports.initModules = async function () {
    let count = await Module.count({});
    console.log('Module count', count);
    if (count === 0) {
        let res = await Module.bulkCreate([
            { modulename: '首页看板',url: '',company:1},
            { modulename: '款式订单',url: '',company:1},
            { modulename: '仓库管理',url: '',company:1},
            { modulename: '生产管理',url: '',company:1},
            { modulename: '资源管理',url: '',company:1},
            { modulename: '知识库',url: '',company:1},
            { modulename: '工单管理',url: '',company:1},
            { modulename: '员工管理',url: '',company:1},
            { modulename: '升级管理',url: '',company:1},
            { modulename: '普通员工',url: '',company:1},
            { modulename: '维修员',url: '',company:1}
        ]);
        if (res) {
            res.map((item) => {
                console.log(item.toJSON());
            });
        }
    }
};