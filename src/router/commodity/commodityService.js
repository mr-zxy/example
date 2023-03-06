const db = require("../../common/mysql")
const Utils = require("../../utils")
const UpdateCommodity = require("../../reptile/updateCommodity")
class CommodityService {

    viewCommodity = async (params = {}) => {
        return await db.queryPagination(`
        SELECT
           com.id,
           reg.province_id,
           reg.province,
           reg.city_id,
           reg.city,
           reg.county_id,
           reg.county,
           com.release_date,
           com.release_price,
           com.price_unit,
           com.user_name,
           com.user_phone,
           cat.categroy_id,
           cat.categroy_name,
           rel.create_date 
       FROM
        com_reg_cat_relation rel
           LEFT JOIN categroy cat ON rel.categroy_id = cat.categroy_id
           LEFT JOIN region reg ON rel.province_id = reg.province_id 
           AND rel.city_id = reg.city_id 
           AND rel.county_id = reg.county_id
           JOIN commodity com ON rel.commodity_id = com.commodity_id 
       WHERE
           rel.province_id = "${params.province_id}" AND rel.city_id = "${params.city_id}" AND rel.county_id = "${params.county_id}" AND rel.categroy_id = "${params.categroy_id}" AND create_date <= "${params.create_date}" AND release_price < ${params.release_price}
       `, `
       SELECT
       COUNT(*) AS total
   FROM
      com_reg_cat_relation rel
           LEFT JOIN categroy cat ON rel.categroy_id = cat.categroy_id
           LEFT JOIN region reg ON rel.province_id = reg.province_id 
           AND rel.city_id = reg.city_id 
           AND rel.county_id = reg.county_id
           JOIN commodity com ON rel.commodity_id = com.commodity_id 
           WHERE
           rel.province_id = "${params.province_id}" AND rel.city_id = "${params.city_id}" AND rel.county_id = "${params.county_id}" AND rel.categroy_id = "${params.categroy_id}" AND create_date <= "${params.create_date}" AND release_price < ${params.release_price}
       `, params)
    }

    getCommodity = async (params = {}) => {
        return db.queryPagination(`
    SELECT
        rel.commodity_id,
        rel.create_date,
        reg.province_id,
        reg.province,
        reg.city_id,
        reg.city,
        reg.county_id,
        reg.county,
        cat.categroy_id,
        cat.categroy_name,
        (
            SELECT COUNT(*) FROM commodity WHERE commodity_id=rel.commodity_id
        ) AS commodity_total
    FROM
        com_reg_cat_relation rel
        LEFT JOIN categroy cat ON rel.categroy_id = cat.categroy_id
        LEFT JOIN region reg ON rel.province_id = reg.province_id
        AND rel.city_id = reg.city_id
        AND reg.county_id = rel.county_id
	WHERE date(rel.create_date) between '${params.start_time}' and '${params.end_time}' AND reg.province_id LIKE '%${params.province_id}%' AND reg.city_id LIKE '%${params.city_id}%' AND reg.county_id LIKE '%${params.county_id}%' AND cat.categroy_id LIKE '%${params.categroy_id}%'
    ORDER BY
        create_date DESC
        `, `
        SELECT
        COUNT(*) AS total
    FROM
        com_reg_cat_relation rel
        LEFT JOIN categroy cat ON rel.categroy_id = cat.categroy_id
        LEFT JOIN region reg ON rel.province_id = reg.province_id
        AND rel.city_id = reg.city_id
        AND reg.county_id = rel.county_id 
    WHERE date(rel.create_date) between '${params.start_time}' and '${params.end_time}' AND reg.province_id LIKE '%${params.province_id}%' AND reg.city_id LIKE '%${params.city_id}%' AND reg.county_id LIKE '%${params.county_id}%' AND cat.categroy_id LIKE '%${params.categroy_id}%'
        `, params)
    }
    getCommodityCity = async (params = {}) => {
        return db.queryPagination(`
        SELECT
	* 
FROM
	(
	SELECT DISTINCT
		reg.province_id,
		reg.province,
		reg.city_id,
		reg.city,
		reg.county_id,
		reg.county 
	FROM
		com_reg_cat_relation rel
		LEFT JOIN region reg ON rel.province_id = reg.province_id 
		AND rel.city_id = reg.city_id 
		AND reg.county_id = rel.county_id 
	) AS content 
        `, `
        SELECT
	COUNT(*)  AS total
FROM
	(
	SELECT DISTINCT
		reg.province_id,
		reg.province,
		reg.city_id,
		reg.city,
		reg.county_id,
		reg.county 
	FROM
		com_reg_cat_relation rel
		LEFT JOIN region reg ON rel.province_id = reg.province_id 
		AND rel.city_id = reg.city_id 
		AND reg.county_id = rel.county_id 
	) AS content
        `, params)
    }

    addCommodity = async (params = {}) => {
        const options = params;
        return new Promise((resolve, reject) => {
            const updateCommodity = new UpdateCommodity({
                province_id: options.province_id,
                city_id: options.city_id,
                county_id: options.county_id,
                categroy_id: options.categroy_id
            });
            const date1 = new Date();
            let timer = []
            timer[timer.length] = setInterval(() => {
                const date2 = new Date();
                if (date2.getSeconds() - date1.getSeconds() > 300) {
                    // 300 秒超时
                    timer.forEach(v => clearInterval(v))
                    reject()
                }
                if (updateCommodity.endFlag) {
                    timer.forEach(v => clearInterval(v))
                    resolve()
                }
            }, 100)
        })
    }

    deleteCommodity = async (id) => {
        return Promise.all([db.query(`DELETE FROM com_reg_cat_relation WHERE commodity_id="${id}"`), db.query(`DELETE FROM commodity WHERE commodity_id="${id}"`)
        ])
    }

    deleteViewCommodity = async (id) => {
        return db.query(`DELETE FROM commodity WHERE id="${id}"`
        )
    }

}
module.exports = CommodityService;