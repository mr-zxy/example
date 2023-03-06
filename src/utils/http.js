const Utils = require("./index")
class Http extends Utils {
    static ERROR = 500;
    static SUCCESS = 200;
    static getRequestParams(ctx) {

        const { request } = ctx;
        if (request.method === "GET") {
            return { method: request.method, url: request.url, body: request.query }
        } else {
            return { method: request.method, url: request.url, body: request.body }
        }
    }

    static lookLogger(ctx, code, body = "") {
        if (ctx?.request?.method) {
            const METHOD_KEY = code === 1 ? "info" : "error";
            const params = Http.getRequestParams(ctx)
            global.logger[METHOD_KEY](params.method, params.url, params.body, body)
        }
    }

    static success(ctx, body, params = {}) {
        ctx.status = Http.SUCCESS;
        ctx.body = {
            code: Http.SUCCESS,
            message: body,
            ...params
        };
        this.lookLogger(ctx, 1)
    }
    /**
     * 错误返回 
     * @param {*} ctx 
     * @param {*} body 
     * @param {*} isLog 是否记录日志 true
     */
    static error(ctx, body, isLog = true) {
        ctx.status = Http.ERROR;
        ctx.body = {
            code: Http.ERROR,
            message: body
        };
        if (isLog) {
            this.lookLogger(ctx, 0, body)
        }
    }
}

module.exports = Http;