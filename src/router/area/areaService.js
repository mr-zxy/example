const db = require("../../common/mysql")
class AreaService {

    getProvince = async (params = {}) => {
        return await db.query(
            `
            SELECT
            province_id,
            province 
        FROM
            region 
        GROUP BY
            province_id,
            province
            `
        )
    }

    getCity = async (params = {}) => {
        return await db.query(
            `
            SELECT
            city_id,
            city 
        FROM
            region 
        WHERE
            province_id = "${params.province_id}" 
        GROUP BY
            city_id,
            city
            `
        )
    }

    getCounty = async (params = {}) => {
        return await db.query(
            `
            SELECT
            county_id,
            county 
        FROM
            region 
        WHERE
            city_id = "${params.city_id}" 
        GROUP BY
            county_id,
            county
            `
        )
    }

}
module.exports = AreaService;