"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errCode_1 = require("./errCode");
/**
 * @apiDefine MyError
 * @apiError UserNotFound The <code>id</code> of the User was not found.
 */
exports.errorhandler = (app) => {
    app.use(async (ctx, next) => {
        try {
            await next();
        }
        catch (err) {
            ctx.status = err.status || 500;
            let errid = err.message || 'error.unknown';
            let msg = 'error';
            let msggroup = errid.split(':');
            if (msggroup.length === 2) {
                let msgnode = errCode_1.errCode;
                let msgpath = msggroup[0];
                let msgpathlist = msgpath.split('.');
                let idx = 0;
                while (idx < msgpathlist.length) {
                    if (msgnode[msgpathlist[idx]]) {
                        msgnode = msgnode[msgpathlist[idx]];
                    }
                    else {
                        break;
                    }
                    idx++;
                }
                if (msgnode.message) {
                    msg = msgnode.message;
                }
            }
            ctx.body = JSON.stringify({ id: errid, message: msg });
            app.emit('error', err, ctx);
        }
    });
    app.on('error', (err, ctx) => {
        console.log(err);
    });
};
