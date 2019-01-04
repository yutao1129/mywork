"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const KoaMulter = require("koa-multer");
const path = require("path");
const fs = require("fs");
const Files_1 = require("../database/models/Files");
const dbquery_1 = require("../database/dbquery");
const urlencode = require('urlencode');
function fileReadToBuffer(file, buf, pos, len) {
    return new Promise((resolve, reject) => {
        fs.read(file, buf, pos, len, pos, (err, bytes, buffer) => {
            console.log('read', pos, len, bytes);
            if (err) {
                reject(err);
            }
            else {
                resolve(bytes);
            }
        });
    });
}
function read2Buffer(filepath) {
    return new Promise(async (resolve, reject) => {
        let stat = fs.statSync(filepath);
        if (stat && stat.isFile()) {
            let buf = new Buffer(stat.size);
            let file = fs.openSync(filepath, 'r');
            let pos = 0;
            let len = 0;
            try {
                while (pos < stat.size) {
                    len = stat.size - pos;
                    let readbytes = await fileReadToBuffer(file, buf, pos, len);
                    pos += readbytes;
                }
            }
            catch (err) {
                console.log(err);
            }
            finally {
                fs.closeSync(file);
            }
            if (pos === stat.size) {
                resolve(buf);
            }
            else {
                reject('read error');
            }
        }
        else {
            reject('Open Failed');
        }
    });
}
exports.registerFileUploadAPI = function (uploadRouter) {
    const tmppath = path.join(__dirname, '../../../uploadTmp');
    console.log('uploadTmp: ', tmppath);
    const multer = KoaMulter({
        dest: tmppath
    });
    /**
     * @api {post} /file [檔案]-上傳
     * @apiDescription 使用multipart/form-data格式上傳檔案
     * @apiGroup File
     * @apiVersion 0.0.1
     * @apiParam {File} file 要上傳的檔案，注意，form-data的name一定要是"file"，請參見下面的範例。
     * @apiParamExample {multipart/form-data} Request Example:
     * POST /upload HTTP/1.1
     *
     * ----WebKitFormBoundaryE19zNvXGzXaLvS5C
     * Content-Disposition: form-data; name="file"; filename="sample.jpg"
     * Content-Type: image/jpeg
     *
     *
     * ----WebKitFormBoundaryE19zNvXGzXaLvS5C
     * @apiSuccess (Success 200) {String} id 檔案的資料庫唯一ID，可以拿來查詢或是修改使用
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "id": "5b6d0d03993dc24293de551c"
     * }
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    uploadRouter.post('/file', multer.single('file'), async (ctx) => {
        let req = ctx.req;
        console.log('req', req.file);
        try {
            let filebuf = await read2Buffer(req.file.path);
            let dbinst = new Files_1.Files({
                filename: req.file.originalname,
                mimetype: req.file.mimetype,
                content: filebuf,
                createdTime: new Date()
            });
            let res = await dbinst.save();
            ctx.body = {
                id: res.id
            };
            ctx.status = 200;
            ctx.respond = true;
        }
        catch (err) {
            ctx.throw('api.uploadFileFailed:115', 500);
            console.log(err);
        }
        finally {
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
        }
    });
};
exports.registerFilesAPI = function (filesRouter) {
    /**
     * @api {get} /file/:id [檔案]-下載
     * @apiDescription 下載檔案
     * @apiGroup File
     * @apiVersion 0.0.1
     * @apiParam {Number} id 檔案編號
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/file/123456
     * @apiSuccessExample {buffer} Response Example
     * HTTP/1.1 200 OK
     * content-disposition: attachment; filename="sample.jpg"
     * content-length: 236956
     * content-type: image/jpeg
     * ............
     * @apiUse etc_fileNotFound
     * @apiUse db_dbNotReady
     */
    filesRouter.get('/file/:id', async (ctx) => {
        if (ctx.params && ctx.params.id) {
            let data = await Files_1.Files.findById(ctx.params.id);
            if (null === data) {
                ctx.throw('api.fileNotFound:149', 404);
            }
            else {
                let contentDisp="attachment; filename* = UTF-8''"+urlencode(data.filename, "utf-8");
                ctx.set('Content-Type', data.mimetype);
                ctx.set('Content-Disposition', contentDisp);
                ctx.set('Content-Length', data.content.byteLength.toString(10));
                ctx.body = data.content;
                ctx.status = 200;
                ctx.respond = true;
            }
        }
        else {
            ctx.throw('api.invalidParameters:162', 400);
        }
    });
    /**
     * @api {delete} /file [檔案]-刪除
     * @apiDescription 刪除檔案
     * @apiGroup File
     * @apiVersion 0.0.1
     * @apiParam {String} id 檔案編號
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/file
     * Body:
     * {
     *   "id": "xxxx"
     * }
     * @apiSuccess (Success 200) {Number} deleteCount 刪除成功的檔案筆數
     * @apiSuccessExample {json} Success-Response Example:
     * {
     *   "deleteCount": 1
     * }
     * @apiUse api_permissionDenied
     * @apiUse etc_fileNotFound
     * @apiUse db_dbNotReady
     */
    filesRouter.delete('/file', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:191', 186);
        }
        else {
            try {
                let condition = {
                    where: ctx.request.body
                };
                let delcount = await Files_1.Files.destroy(condition);
                if (null !== delcount && undefined !== delcount) {
                    let res = {
                        deleteCount: delcount
                    };
                    ctx.body = res;
                    ctx.status = 200;
                    ctx.respond = true;
                }
                else {
                    ctx.throw('db.invalidParameters:208', 400);
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:212', 400);
            }
        }
    });
};
