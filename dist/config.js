"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = {
    port: process.env.NODE_PORT || 8080,
    dbhost: process.env.DB_HOST || '10.193.206.27',
    dbport: 3306,
    dbaccount: process.env.DB_ACCOUNT || 'API',
    dbpasswd: process.env.DB_PASSWD || '111qqqpwd',
    dbname: process.env.DB_DATABASE || 'vgtest'
};
