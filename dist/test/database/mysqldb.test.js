"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
//import { describe, it, before, after } from 'mocha';
const testDB = 'unittestdb';
const testDBHost = 'localhost';
const testDBAccount = 'tester';
const testDBPasswd = 'test1234';
process.env.DB_DATABASE = testDB;
process.env.DB_HOST = testDBHost;
process.env.DB_ACCOUNT = testDBAccount;
process.env.DB_PASSWD = testDBPasswd;
const config_1 = require("../../config");
const koa = require("koa");
const UserAccount_1 = require("../../database/models/UserAccount");
const mysqldb_1 = require("../../database/mysqldb");
const dbquery_1 = require("../../database/dbquery");
describe('Database config', () => {
    it('switch to unit test db config', () => {
        chai_1.expect(config_1.config.dbname).to.equal(testDB);
        chai_1.expect(config_1.config.dbhost).to.equal(testDBHost);
        chai_1.expect(config_1.config.dbaccount).to.equal(testDBAccount);
        chai_1.expect(config_1.config.dbpasswd).to.equal(testDBPasswd);
    });
});
let userAcc1 = {
    'username': 'Alpha',
    'englishName': 'Apple',
    'chineseName': '蘋果',
    'password': 'iphone X',
    'mobilePhone': '012345678',
    'title': 'CEO',
    'employeeID': '00000001',
    'sex': 1,
    'birthday': new Date('1990/01/01'),
    'joinedDate': new Date('2010/01/01'),
    'emailAddress': 'apple@icould.com',
    'physicalAddress': 'USA. ',
    'autobiography': 'Hello my name is Apple',
    'admin': 1,
    'photo': 1,
    'status': 1
};
let userAcc2 = {
    'username': 'Beta',
    'englishName': 'Winnie',
    'chineseName': '維尼',
    'password': 'Bear',
    'mobilePhone': '99999999',
    'title': 'Chairman',
    'employeeID': '00000002',
    'sex': 1,
    'birthday': new Date('1950/01/01'),
    'joinedDate': new Date('2013/01/01'),
    'emailAddress': 'winnie@power.cn',
    'physicalAddress': '.... ',
    'autobiography': 'Hello my name is Winnie',
    'admin': 1,
    'photo': 2,
    'status': 1
};
describe('DB connect test', () => {
    let app = new koa();
    before('connectdb', () => {
        return mysqldb_1.initDatabase(app);
    });
    after(async () => {
        let res = await mysqldb_1.closeDatabase();
    });
    it('Account Table insert', async () => {
        let res = await UserAccount_1.UserAccount.destroy({ where: {}, truncate: true });
        let acc1 = new UserAccount_1.UserAccount(userAcc1);
        let acc2 = new UserAccount_1.UserAccount(userAcc2);
        let res1 = await acc1.save();
        chai_1.expect(acc1).have.property('id');
        let res2 = await acc2.save();
        chai_1.expect(acc1).have.property('id');
        let acc_list = await UserAccount_1.UserAccount.findAll({});
        chai_1.expect(acc_list).lengthOf(2);
        /*
        acc_list.map((item) =>{
          console.log(item.toJSON());
        });
        */
    });
    it('Account Table find my Apple', async () => {
        let search = {
            pageIndex: 0,
            maxRows: 2,
            query: {
                englishName: 'Apple'
            }
        };
        let query = dbquery_1.queryDBGenerator(search);
        let res_list = await UserAccount_1.UserAccount.findAll(query);
        chai_1.expect(res_list).lengthOf(1);
        res_list.map((item) => {
            console.log(item.toJSON());
        });
    });
    it('Account Table update Apple address', async () => {
        let params = {
            condition: {
                englishName: 'Apple'
            },
            update: {
                physicalAddress: 'USA white house',
            }
        };
        let res = await UserAccount_1.UserAccount.update(params.update, {
            where: params.condition
        });
        chai_1.expect(res[0]).to.equal(1);
        let newapple = await UserAccount_1.UserAccount.findOne({ where: params.update });
        chai_1.expect(newapple).not.null;
        if (newapple) {
            chai_1.expect(newapple.physicalAddress).to.equal(params.update.physicalAddress);
            console.log(newapple.toJSON());
        }
    });
    it('Account Table Delete Beta', async () => {
        let params = {
            'chineseName': '維尼'
        };
        let res = await UserAccount_1.UserAccount.destroy({
            where: params
        });
        chai_1.expect(res).to.equal(1);
        let newapple = await UserAccount_1.UserAccount.findOne({ where: params });
        chai_1.expect(newapple).eq(null);
    });
});
