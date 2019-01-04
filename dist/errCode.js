"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 每個錯誤碼都會有 status code，id 與 message。
 * @namespace ErrorCode
 */
exports.errCode = {
    api: {
        /**
         * @apiDefine api_permissionDenied
         * @apiError (Error 403) {api} permissionDenied  權限不足
         * @apiErrorExample {json}  permissionDenied Response
         *    HTTP/1.1 403 Forbidden
         *    { 'id': api.permissionDenied:xxx, 'message': 'Permission denied.' }
         */
        permissionDenied: {
            code: 403,
            message: 'Permission denied.'
        },
        /**
         * @apiDefine api_bodyIsEmpty
         * @apiError (Error 400) {api} bodyIsEmpty  查詢的參數不能是空的.
         * @apiErrorExample {json}  bodyIsEmpty Response
         *    HTTP/1.1 400 BadRequest
         *    { 'id': api.bodyIsEmpty:xxx, 'message': 'Post request body is empty!' }
         */
        bodyIsEmpty: {
            code: 400,
            message: 'Post request body is empty!'
        },
        /**
         * @apiDefine api_invalidParameters
         * @apiError (Error 400) {api} invalidParameters  查詢的參數不能是空的.
         * @apiErrorExample {json}  invalidParameters Response
         *    HTTP/1.1 400 BadRequest
         *    { 'id': api.invalidParameters:xxx, 'message': 'Request parameters are invalid!' }
         */
        invalidParameters: {
            code: 400,
            message: 'Request parameters are invalid!'
        },
        /**
         * @apiDefine api_fileNotFound
         * @apiError (Error 404) {api} fileNotFound  查詢檔案不存在.
         * @apiErrorExample {json}  fileNotFound Response
         *    HTTP/1.1 404 notFound
         *    { 'id': api.invalidParameters:xxx, 'message': 'Request file not found!' }
         */
        fileNotFound: {
            code: 404,
            message: 'Request file not found!'
        },
        /**
         * @apiDefine api_uploadFileFailed
         * @apiError (Error 500) {api} uploadFileFailed  查詢檔案不存在.
         * @apiErrorExample {json}  uploadFileFailed Response
         *    HTTP/1.1 500 internalError
         *    { 'id': api.invalidParameters:xxx, 'message': 'File upload failed!' }
         */
        uploadFileFailed: {
            code: 500,
            message: 'File upload failed!'
        },
        /**
         * @apiDefine api_orderNotSpecified
         * @apiError (Error 400) {api} orderNotSpecified  查詢的參數無法找到生產單.
         * @apiErrorExample {json}  orderNotSpecified Response
         *    HTTP/1.1 400 BadRequest
         *    { 'id': api.invalidParameters:xxx, 'message': 'Request parameters are invalid!' }
         */
        orderNotSpecified: {
            code: 400,
            message: 'The order parameters is required for this API!'
        },
    },
    ac: {
        /**
         * @apiDefine  ac_accountNotFound
         * @apiError (Error 404) {ac} accountNotFound 找不到帳號
         * @apiErrorExample {json} accountNotFound Response
         *    HTTP/1.1 404 Not Found
         *    { 'id': ac.accountNotFound:xxx, 'message': 'Account not found.' }
         */
        accountNotFound: {
            code: 404,
            message: 'Account not found.'
        },
        /**
         * @apiDefine  ac_roleNotFound
         * @apiError (Error 404) {ac} roleNotFound 找不到角色權限定義
         * @apiErrorExample {json} roleNotFound Response
         *    HTTP/1.1 404 Not Found
         *    { 'id': ac.roleNotFound:xxx, 'message': 'Role not found.' }
         */
        roleNotFound: {
            code: 404,
            message: 'Role not found.'
        },
        /**
         * @apiDefine  ac_loginTokenNotFound
         * @apiError (Error 404) {ac} loginTokenNotFound 找不到角色權限定義
         * @apiErrorExample {json} loginTokenNotFound Response
         *    HTTP/1.1 404 Not Found
         *    { 'id': ac.loginTokenNotFound:xxx, 'message': 'Login token not found.' }
         */
        loginTokenNotFound: {
            code: 404,
            message: 'Login token not found.'
        },
    },
    db: {
        /**
         * @apiDefine db_dbNotReady
         * @apiError (Error 500) {db} dbNotReady 連不上資料庫
         * @apiErrorExample {json}  dbNotReady Response
         *    HTTP/1.1 500 Internal Server Error
         *    { 'id': db.dbNotReady:xxx, 'message': 'Database not ready' }
         */
        dbNotReady: {
            code: 500,
            message: 'Database not ready.'
        },
        /**
         * @apiDefine db_permissionDenied
         * @apiError (Error 503) {db} permissionDenied 權限不足
         * @apiErrorExample {json} permissionDenied Response
         *    HTTP/1.1 503 Internal Server Error
         *    { 'id': db.permissionDenied:xxx, 'message': 'Permission denied.' }
         */
        permissionDenied: {
            code: 503,
            message: 'Permission denied.'
        },
        /**
         * @apiDefine db_ConnectionClosed
         * @apiError (Error 503) {db} ConnectionClosed 權限不足
         * @apiErrorExample {json} ConnectionClosed Response
         *    HTTP/1.1 503 Internal Server Error
         *    { 'id': db.ConnectionClosed:xxx, 'message': 'Database connection had closed!' }
         */
        dbConnectionClosed: {
            code: 503,
            message: 'Database connection had closed!'
        },
        /**
         * @apiDefine db_invalidQuery
         * @apiError (Error 400) {db} invalidQuery 不合法的查詢
         * @apiErrorExample {json} invalidQuery Response
         *    HTTP/1.1 400 BadRequest
         *    { 'id': db.invalidQuery:xxx, 'message': 'Invalid query parameters!' }
         */
        invalidQuery: {
            code: 400,
            message: 'Invalid query parameters!'
        },
    },
    sc: {
        /**
         * @apiDefine  sc_supplierNotFound
         * @apiError (Error 404) {sc} supplierNotFound 找不到供應商資料
         * @apiErrorExample {json} supplierNotFound Response
         *    HTTP/1.1 404 Not Found
         *    { 'id': sc.supplierNotFound:xxx, 'message': 'Supplier not found.' }
         */
        supplierNotFound: {
            code: 404,
            message: 'Supplier not found.'
        },
        /**
         * @apiDefine  sc_clientNotFound
         * @apiError (Error 404) {ac} clientNotFound 找不到客戶資料
         * @apiErrorExample {json} clientNotFound Response
         *    HTTP/1.1 404 Not Found
         *    { 'id': sc.clientNotFound:xxx, 'message': 'Client not found.' }
         */
        clientNotFound: {
            code: 404,
            message: 'Client not found.'
        },
    },
    km: {
        /**
         * @apiDefine  km_equipmentNotFound
         * @apiError (Error 404) {km} equipmentNotFound 找不到供應商資料
         * @apiErrorExample {json} equipmentNotFound Response
         *    HTTP/1.1 404 Not Found
         *    { 'id': km.equipmentNotFound:xxx, 'message': 'Equipment not found.' }
         */
        equipmentNotFound: {
            code: 404,
            message: 'Equipment not found.'
        },
    },
    etc: {
        /**
         * @apiDefine  etc_fileNotFound
         * @apiError (Error 404) {etc} fileNotFound 找不到供應商資料
         * @apiErrorExample {json} fileNotFound Response
         *    HTTP/1.1 404 Not Found
         *    { 'id': etc.fileNotFound:xxx, 'message': 'File not found.' }
         */
        fileNotFound: {
            code: 404,
            message: 'File not found.'
        },
    },
    pd: {
        /**
         * @apiDefine  pd_styleNotFound
         * @apiError (Error 404) {pd} styleNotFound 找不到款式
         * @apiErrorExample {json} styleNotFound Response
         *    HTTP/1.1 404 Not Found
         *    { 'id': pd.styleNotFound:xxx, 'message': 'Style not found.' }
         */
        styleNotFound: {
            code: 404,
            message: 'Style not found.'
        },
    },
};
