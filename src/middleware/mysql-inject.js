const { mysql } = require("../common/mysql")
const Utils = require("../utils/index")
/**
 * mysql 注入
 * @returns 
 */
module.exports = () => {
    return async (ctx, next) => {

        const format = (options) => {
            for (let i in options) {
                const str = mysql.escape(options[i]).replace(/'|"/g, "");
                options[i] = str;
            }
            // mysql like 识别 ""
            Utils.dataFilterEmpty(options)
        }

        const { request } = ctx;

        if (request.method === "GET") {
            format(request.query)
        } else {
            format(request.body)
        }
        await next();
    }
}