"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const config_1 = require("../config");
const Company_1 = require("./models/Company");
const Step_1 = require("./models/Step");
//by simon 20181119
const Module_1 =require("./models/Module");

const connopts = {
    dialect: 'mysql',
    database: config_1.config.dbname,
    username: config_1.config.dbaccount,
    password: config_1.config.dbpasswd,
    host: config_1.config.dbhost,
    port: config_1.config.dbport,
    modelPaths: [__dirname + '/models/*'],
    operatorsAliases: false
};
let sequelizedb = null; // new Sequelize(connopts);
const DBReady = 'ok';
async function createtable() {
    return new Promise(async (resolve, reject) => {
        const connchkopts = {
            dialect: 'mysql',
            database: '',
            username: config_1.config.dbaccount,
            password: config_1.config.dbpasswd,
            host: config_1.config.dbhost,
            port: config_1.config.dbport
        };
        const sequelizechkdb = new sequelize_typescript_1.Sequelize(connchkopts);
        let res = DBReady;
        try {
            let database = config_1.config.dbname;
            let res = await sequelizechkdb.query(`CREATE DATABASE IF NOT EXISTS ${database} CHARACTER SET utf8 COLLATE utf8_general_ci;`); //.then(() => console.log('Database created'));
            sequelizechkdb.close();
        }
        catch (err) {
            if (err.name && err[err.name]) {
                switch (err.name) {
                    case 'SequelizeAccessDeniedError':
                        res = 'db.permissionDenied:43';
                        break;
                    case 'SequelizeConnectionError':
                        res = 'db.dbNotReady:46';
                        break;
                    default:
                        res = 'db.dbNotReady:49';
                        break;
                }
                console.log({ message: err.err[err.name] });
            }
            else if (err.message) {
                res = 'db.dbNotReady:54';
                console.log({ message: err.message });
            }
            else if (err.original && err.original.Error) {
                res = 'db.dbNotReady:58';
                console.log({ message: err.original.Error });
            }
            else {
                res = 'db.dbNotReady:61';
                console.log(err);
            }
        }
        finally {
            sequelizechkdb.close();
            resolve(res);
        }
    });
}
async function initDB(app) {
    let error = 'db.dbConnectionClosed:109';
    app.use(async (ctx, next) => {
        if (null === sequelizedb) {
            ctx.throw('db.dbConnectionClosed:109', 503);
        }
        if (error !== 'ok') {
            ctx.throw(error, 503);
        }
        else {
            await next();
        }
    });
    error = await createtable();
    if (null === sequelizedb) {
        sequelizedb = new sequelize_typescript_1.Sequelize(connopts);
    }
    if (error === DBReady) {
        try {
            await sequelizedb.sync({ force: false });
            Company_1.initCompanyInfo();
            Step_1.initSteps();
            //by simon 20181119
            Module_1.initModules();
        }
        catch (err) {
            if (err.name && err[err.name]) {
                switch (err.name) {
                    case 'SequelizeAccessDeniedError':
                        error = 'db.permissionDenied:80';
                        break;
                    case 'SequelizeConnectionError':
                        error = 'db.dbNotReady:83';
                        break;
                    default:
                        error = 'db.dbNotReady:86';
                        break;
                }
                console.log({ message: err.err[err.name] });
            }
            else if (err.message) {
                error = 'db.dbNotReady:91';
                console.log({ message: err.message });
            }
            else if (err.original && err.original.Error) {
                error = 'db.dbNotReady:94';
                console.log({ message: err.original.Error });
            }
            else {
                error = 'db.dbNotReady:97';
                console.log(err);
            }
        }
    }
    return Promise.resolve(error);
}
async function closeDB() {
    let res = true;
    if (sequelizedb) {
        sequelizedb.close();
        sequelizedb = null;
    }
    return Promise.resolve(res);
}
exports.DB_READY = DBReady;
exports.initDatabase = initDB;
exports.closeDatabase = closeDB;
