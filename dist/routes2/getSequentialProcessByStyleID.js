// Author LiuYutao     20181017
// 根据styleID获取 排好序的工序图
// step 1 select * from StyleProcess where style =<step 1>
// step 2 order <step 3>
// step 3 select * from Process where id=<step 3>.<process>

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const Process_1 = require("../database/models/Process");
const StyleProcess_1 =require("../database/models/StyleProcess");

const dbquery_1 = require("../database/dbquery");
const Sequelize_1 = require("sequelize")

exports.registerGetSequentialProcessByStyleIDAPI = function (getSequentialProcessByStyleIDAPIRouter) {
    /**
     * @api {get} /Process/getSequentialProcessByStyleID [根據款號查詢工序信息，返回一個樹形結構]-查詢
     * @apiDescription 查詢符合條件的工序信息
     * @apiGroup Knowledge Base
     * @apiVersion 0.0.1
     * @apiUse Yutao Liu
     * @apiParam {String} [styleID] 款式編號
     * @apiParamExample {json} Request Example
     * URL:
     *   http://{host}/Process/getSequentialProcessByStyleID?styleID=168261/9652

     * @apiSuccess (Success 200) {Number} pageIndex 目前的頁碼
     * @apiSuccess (Success 200) {Number} maxRows 每一頁的最大筆數
     * @apiSuccess (Success 200) {Number} totalPage 總頁數
     * @apiSuccess (Success 200) {Array} records 查詢的結果。
     * @apiSuccessExample {json} Response Example
     * 
     * [
     * 
     *  {
     *   "id": 16,
     *   "style": "168261/9652",
     *   "process": 1,
     *   "nextProcess": 2,
     *   "processInfo": {
     *       "id": 1,
     *       "processID": "1",
     *       "type": "前道",
     *       "name": "烫前脚边",
     *       "partCard": null,
     *       "step": null,
     *       "equipmentCategory": 4,
     *       "workingHours": 5,
     *       "workingPrice": 0.2,
     *       "operationalRequirement": "烫平",
     *       "mold": 0
     *   },
     *   "nextProcessInfo": {
     *       "id": 2,
     *       "processID": "2",
     *       "type": "前道",
     *       "name": "前袋口落朴",
     *       "partCard": null,
     *       "step": null,
     *       "equipmentCategory": 4,
     *       "workingHours": 6,
     *       "workingPrice": 0.25,
     *       "operationalRequirement": "平",
     *       "mold": 0
     *   },
     *   "childs": [
     *       {
     *           "id": 11,
     *           "style": "168261/9652",
     *           "process": 2,
     *           "nextProcess": 3,
     *           "processInfo": {
     *               "id": 2,
     *               "processID": "2",
     *               "type": "前道",
     *               "name": "前袋口落朴",
     *               "partCard": null,
     *               "step": null,
     *               "equipmentCategory": 4,
     *               "workingHours": 6,
     *               "workingPrice": 0.25,
     *               "operationalRequirement": "平",
     *               "mold": 0
     *           },
     *           "nextProcessInfo": {
     *               "id": 3,
     *               "processID": "3",
     *               "type": "车缝",
     *               "name": "拷前边袋贴，袋垫",
     *               "partCard": null,
     *               "step": null,
     *               "equipmentCategory": 1,
     *               "workingHours": 7,
     *               "workingPrice": 0.32,
     *               "operationalRequirement": "仔细",
     *               "mold": 0
     *           },
     *           "childs": [
     *               {
     *                   "id": 14,
     *                   "style": "168261/9652",
     *                   "process": 3,
     *                   "nextProcess": 6,
     *                   "processInfo": {
     *                       "id": 3,
     *                       "processID": "3",
     *                       "type": "车缝",
     *                       "name": "拷前边袋贴，袋垫",
     *                       "partCard": null,
     *                       "step": null,
     *                       "equipmentCategory": 1,
     *                       "workingHours": 7,
     *                       "workingPrice": 0.32,
     *                       "operationalRequirement": "仔细",
     *                       "mold": 0
     *                   },
     *                   "nextProcessInfo": {
     *                       "id": 6,
     *                       "processID": "6",
     *                       "type": "车缝",
     *                       "name": "夹前袋口，修反压0.1助线",
     *                       "partCard": null,
     *                       "step": null,
     *                       "equipmentCategory": 2,
     *                       "workingHours": 14,
     *                       "workingPrice": 0.96,
     *                       "operationalRequirement": "齐",
     *                       "mold": 0
     *                   }
     *               }
     *           ]
     *       },     
     *   ]
     * @apiUse api_permissionDenied
     * @apiUse db_dbNotReady
     */
    getSequentialProcessByStyleIDAPIRouter.get('/Process/getSequentialProcessByStyleID', async (ctx) => {

        if(!ctx.query || !ctx.query.styleID || ctx.query.styleID == undefined){
            ctx.throw('api.invalidParameters:162', 400);
        }
        else{
            try {
                let styleID =ctx.query.styleID;

                let processes = await StyleProcess_1.StyleProcess.findAll({
                    where: {
                        style: styleID
                    },
                    raw:true
                });
                if (null === processes) {
                    ctx.throw('api.cartNumberNotFound:149', 404);
                }
                let infos =await getProcesses(processes);
                processes= buildProcesses(processes,infos);
                ctx.body = toTree(processes);
                ctx.status = 200;
                ctx.respond = true;
            }
            catch (err) {
                console.log(err);
                ctx.throw('db.invalorderIDQuery:98', 400);
            }
        }
    });
    //数据库查询返回的数组 转化为 树形 结构
    function toTree(processes){
        let temProcesses =processes.slice();
        let count =0;
        for(let i=0;i<processes.length;i++){
            let indexChild=findChildtProcess(processes[i].nextProcess,temProcesses);
            if(indexChild !=null && indexChild>= count){
                if(!processes[i].childs){
                    processes[i].childs=[];
                }
                processes[i].childs.push(processes[indexChild-count]);
                processes.splice(indexChild-count,1);
                count =count+1
            }
            let index =findParentProcess(processes[i].process,temProcesses);

            if(index !=null && index >=count){
                if(!processes[index-count].childs){
                    processes[index-count].childs=[];
                }
                processes[index-count].childs.push(processes[i]);

                processes.splice(i,1);
                i--;
                count =count +1;
                
            }
        }
        return processes;
    }
    //找到父节点 
    function findParentProcess(process,temProcesses){
        for(let i=0;i<temProcesses.length;i++){
            if(process == temProcesses[i].nextProcess){
                return i;
            }
        }
        return null;
    }
    //找到子节点
    function findChildtProcess(process,temProcesses){
        for(let i=0;i<temProcesses.length;i++){
            if(process == temProcesses[i].process){
                return i;
            }
        }
        return null;
    }
    //查询 所有的工序id对应的工序信息
    async function  getProcesses  (processes){
        /*
        let processIds=[];
        for(let i=0;i<processes.length;i++){
            if(processes[i].process !=null){
                processIds.push(processes[i].process)
            }
            if(processes[i].nextProcess !=null){
                processIds.push(processes[i].nextProcess)
            }
        }
        let processInfos=await Process_1.Process.findAll({
            where:{
                id:{
                    [Sequelize_1.Op.in]:processIds
                }
            },
            raw:true
        });
        return processInfos;
        */
       let inList ="(";
       for(let i=0;i<processes.length;i++){
            if(processes[i].process !=null){
                inList=inList+"'"+processes[i].process+"',"
            }
            if(processes[i].nextProcess !=null){
                inList=inList+"'"+processes[i].nextProcess+"',"
            }
        }
        inList =inList.substring(0,inList.length-1);
        let queryString="SELECT Process.*, PartCard.* from Process,PartCard WHERE Process.partCard = PartCard.id AND Process.id IN "+ inList+")";
        let processInfos=await Process_1.Process.sequelize.query(queryString);
        
        return processInfos;
        
    }
    //把 工序id对应的工序信息 组装到 数组中
    function buildProcesses(processes,infos){
        for(let i=0;i<processes.length;i++){
            processes[i].processInfo=findInfo(processes[i].process,infos);
            processes[i].nextProcessInfo=findInfo(processes[i].nextProcess,infos);
        }
        return processes;
    }
    //根据 id 找到 工序信息
    function findInfo(id,infos){
        for(let i=0;i<infos[0].length;i++){
            if(id == infos[0][i].id){
                return infos[0][i];
            }
        }
        return null;
    }
}
