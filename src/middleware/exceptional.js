/**
 *  异常处理
 * @returns 
 */
const Http=require("../utils/http")
module.exports = () => {
    return async (ctx, next) => {

        await next().catch((err={}) => {
            const params = Http.getRequestParams(ctx);
            global.logger.error(params.method, params.url, params.body,err.code, err.errno, err.sqlMessage, err.sqlState, err.sql);
            Http.error(ctx,err)
        })

    }
}