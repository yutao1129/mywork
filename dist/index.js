"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const Koa = require("koa");
const serve = require("koa-static");
const error_handler_1 = require("./error-handler");
const koa_json_log_1 = require("koa-json-log");
const config_1 = require("./config");
const mysqldb_1 = require("./database/mysqldb");
const index_1 = require("./routes/index");
const cors = require("@koa/cors");
const app = new Koa();
app.use(cors());
app.use(serve(path.join(__dirname, '../../doc')));
app.use(koa_json_log_1.jsonLog());
error_handler_1.errorhandler(app);
mysqldb_1.initDatabase(app);
index_1.registerFileUploader(app);
index_1.registerRoutes(app);

const index_2 = require("./routes2/routes2index");
index_2.registerRoutes(app);

app.listen(config_1.config.port);
console.log(`Server is running at http://localhost:${config_1.config.port}/`);
