"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const UserAccount_1 = require("../database/models/UserAccount");
const OTA_1 = require("../database/models/OTA");
const KoaSend = require("koa-send");

const KoaMulter = require("koa-multer");
const path = require("path");
const fs = require("fs");
const dbquery_1 = require("../database/dbquery");
const sequelize = require("sequelize")


exports.registerOTAAPI = function (OTARouter) {

    const tmppath = path.join(__dirname, '../../../uploadOTA/');
    let storage = KoaMulter.diskStorage({
        destination: path.resolve(tmppath),
        filename: (ctx, file, cb)=>{
            cb(null, (new Date()).getTime()+"_"+file.originalname);
        }
    });
    let upload = KoaMulter({ storage: storage});
    // let router = new Router();
    OTARouter.post('/ota/upload', upload.single('file'), async ctx => {
        let req = ctx.req;
        try {
            let resp = {
                success: false,
                result: "",
                record: []
            };
            if(req.file!=undefined){
                let otarecord = {
                    name: req.body.name,
                    type: req.body.type,
                    version: req.body.version,
                    remark:req.body.remark,
                    file:req.file.filename,
                    updateFlag:req.body.updateFlag,
                    md5:req.body.md5,
                    time: new Date()
                };
                let docs = await OTA_1.OTA.insertOrUpdate(otarecord, { returning: true });
                // console.log('docs_otaupload', docs)
                resp.record=otarecord;
                if (docs) {
                    resp.result = "insert";
                }
                else {
                    resp.result = "update";
                }
                resp.success=true;
            }
            else{
                resp.success==false;
                resp.result = "file error";
            }

            ctx.body = resp
            ctx.status = 200;
            ctx.respond = true;
        }
        catch (err) {
            console.log(err);
            if(req.file!=undefined){
                if (fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                }
            }
            ctx.throw('api.uploadFileFailed:115,error:' + err.toString(), 500);
        }
        finally {
            ;
        }
    });


    OTARouter.get('/ota/download/:filename', async (ctx) => { 
        var fileName = ctx.params.filename;
        // 设置实体头（表示消息体的附加信息的头字段）,提示浏览器以文件下载的方式打开
        // 也可以直接设置 ctx.set("Content-disposition", "attachment; filename=" + fileName);
        ctx.attachment(fileName);
        await KoaSend(ctx, fileName, { root:tmppath });
    });
  

    OTARouter.post('/ota/search', async (ctx) => {

        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:59', 400);
        }
        else {
            try {
                let type = ctx.request.body.type;
                let queryota={};
                if(type!=undefined) {
                    queryota={
                        where: {
                            type: type
                        }
                    }
                }
                let docs_ota = await OTA_1.OTA.findAll(queryota);
                console.log('docs_ota', docs_ota)
                let resp = {
                    recordsCount: 0,
                    records: []
                };

                if (docs_ota && docs_ota.length > 0) {
                    docs_ota.map((item) => {
                        resp.records.push(item.toJSON());
                    });
                }
                resp.recordsCount = resp.records.length;
                ctx.body = resp;
                ctx.status = 200;
                ctx.respond = true;
                console.log("ctx:", ctx)
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidQuery:89', 400);
            }
        }
    });

    OTARouter.post('/OTA/add', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:122', 400);
        }
        else {
            try {
                let otarecord = ctx.request.body;
                otarecord['time'] = new Date();
                console.log(new Date());
                console.log('otarecord', otarecord);
                let docs = await OTA_1.OTA.insertOrUpdate(otarecord, { returning: true });
                console.log('docs', docs)
                let resp = {
                    success: true,
                    result: "",
                    record: otarecord
                };
                if (docs) {
                    resp.result = "insert";
                }
                else {
                    resp.result = "update";
                }

                ctx.body = JSON.stringify(resp);
                ctx.status = 200;
                ctx.respond = true;
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:141,error:' + err.toString(), 400);
            }
        }
    });
    OTARouter.delete('/ota/delete', async (ctx) => {
        if (false === dbquery_1.checkRequestParamObject(ctx.request.body)) {
            ctx.throw('api.bodyIsEmpty:239', 400);
        }
        else {
            try {
                if(ctx.request.body.type==undefined&&ctx.request.body.id==undefined)
                {
                    ctx.throw('db.invalidParameters:FC', 400);
                }
                let condition = {
                    where: ctx.request.body
                };
                let delcount = await OTA_1.OTA.destroy(condition);
                if (null !== delcount && undefined !== delcount) {
                    let res = {
                        deleteCount: delcount
                    };
                    ctx.body = res;
                    ctx.status = 200;
                    ctx.respond = true;
                }
                else {
                    ctx.throw('db.invalidParameters:256', 400);
                }
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalidParameters:260,error:'+err.toString(), 400);
            }
        }
    });

};