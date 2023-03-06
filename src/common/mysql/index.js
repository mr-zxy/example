var mysql = require('mysql');
// var connection = mysql.createConnection({
//     host: '8.140.182.127',
//     port: '3307',
//     user: 'root',
//     password: 'root',
//     database: 'foodMarket',
//     timezone: '+08:00' //东八时区
// });
var pool = mysql.createPool({
    host: '8.140.182.127',
    port: '3307',
    user: 'root',
    password: 'root',
    database: 'foodMarket',
    timezone: '+08:00' //东八时区
});

module.exports.mysql = mysql;
module.exports.query = (sql) => {
    return new Promise((resolve, reject) => {
        pool.getConnection(function (err, connection) {
            if (err) {
                global.logger.error("mysql 连接失败！！！")
                throw err;
            }
            connection.query(sql, function (error, results, fields) {
                connection.release();
                if (error) {
                    reject(error)
                };
                resolve(results)
            });
        })
    });
}

/**
 * 分页查询
 * @param {*} sql 语句 
 * @param {*} sqlPage 查询总条数
 * @param {*} params 参数
 * @returns 
 */
module.exports.queryPagination = (sql, sqlPage, params = {}) => {
    if (!params.page_size) {
        params.page_size = "1"
    }
    if (!params.page_number) {
        params.page_number = "10"
    }

    const size = parseInt(params.page_size);
    const page_number = parseInt(params.page_number);
    const page_size = (size - 1) * page_number;
    const _sql = sql + ` LIMIT ${page_size},${page_number}`
    return new Promise(async (resolve, reject) => {
        try {

            // const [countList, results] = await Promise.all([
            //     module.exports.query(sqlPage),
            //     module.exports.query(_sql)
            // ])

            // 优化 查询条数为0不继续查询

            const countList = await module.exports.query(sqlPage);
            let total = 0
            
            if (countList && countList.length > 0) {
                total = countList[0].total
            } else {
                resolve({
                    list: [],
                    total
                })
            }
            
            const results = await module.exports.query(_sql)

            resolve({
                list: results,
                total
            })
        } catch (e) {
            reject(e)
        }
    });
}