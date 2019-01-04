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
let Step = class Step extends sequelize_typescript_1.Model {
    constructor(values, options) {
        super(values, options);
    }
    static onInit() {
        console.log('Step Inited');
        return Promise.resolve();
    }
};
__decorate([
    sequelize_typescript_1.Unique,
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.STRING(40))
], Step.prototype, "stepName", void 0);
__decorate([
    sequelize_typescript_1.ForeignKey(() => Company_1.Company),
    sequelize_typescript_1.AllowNull(false),
    sequelize_typescript_1.Column(sequelize_typescript_1.DataType.INTEGER)
], Step.prototype, "company", void 0);
__decorate([
    sequelize_typescript_1.BelongsTo(() => Company_1.Company)
], Step.prototype, "companyData", void 0);
Step = __decorate([
    sequelize_typescript_1.Table
], Step);
exports.Step = Step;
exports.initSteps = async function () {
    let count = await Step.count({});
    console.log('Step count', count);
    if (count === 0) {
        let res = await Step.bulkCreate([
            { stepName: '裁剪',company:1 },
            { stepName: '粘衬',company:1 },
            { stepName: '车缝' ,company:1},
            { stepName: '锁钉' ,company:1},
            { stepName: '整烫' ,company:1},
            { stepName: '包装' ,company:1}
        ]);
        if (res) {
            res.map((item) => {
                console.log(item.toJSON());
            });
        }
    }
};
/*
Step.afterDefine('step_afterDefine', (model) => {
  console.log("Step after Define");
});
Step.afterInit('step_afterinit', (seq) =>{
  console.log("Step after Init");
});
*/
