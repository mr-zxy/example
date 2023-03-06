/**
 *  省 市 县 数据处理 
 *  area.js 为线上地址数据
 */

const uuid = require("uuid");
const db = require("../common/mysql/index")
const areaConfig = require('./config/area')
class UpdateArea {
    constructor() {
        this.Items = {};
        this.count = 0
    }
    init = async function () {
        await this.destory();
        this.getProvince();
    }
    add = function (id, iArray) {
        this.Items[id] = iArray;
    }
    async destory() {
        await db.query("DELETE FROM region");
    }
    exists = function (id) {
        if (typeof (this.Items[id]) == "undefined") return false;
        return true;
    }
    getProvince = async function () {
        const str = "0";
        this.Items[str].forEach(v => {
            let [province, id] = v.split("|")
            id--;
            this.getCity(province, id)
        });
    }
    getCity = function (province, provinceId) {
        const str = "0_" + provinceId;
        const cityList = this.Items[str];
        if (this.exists(str) === false) { return false }
        cityList.forEach((v, idx) => {
            let [city, id] = v.split("|")
            this.getCounty(province, provinceId, city, id, idx)
        })
    }

    getCounty = function (province, provinceId, city, cityId, cityIdx) {
        const str = "0_" + provinceId + "_" + cityIdx;
        const cityList = this.Items[str];
        if (this.exists(str) === false) { return false }
        cityList.forEach(async (v) => {
            let [county, id] = v.split("|")
            this.result({
                province, provinceId: String(provinceId + 1), city, cityId, county, countyId: id
            })
        })
    }
    result = async function (props) {
        await db.query(`INSERT INTO region(id,province,province_id,city,city_id,county,county_id) VALUES ('${uuid.v4()}','${props.province}','${props.provinceId}','${props.city}','${props.cityId}','${props.county}','${props.countyId}')`)
        this.count++
        console.log(`${props.province}-${props.city}-${props.county}:正在写入数据库`)
        this.end();
    }
    end = () => {
        // 3027  =  this.count 写入数据库长度 3027 这个不会变
        if (this.count === 3027) {
            process.exit(0)
        }
    }
}

const updateArea = new UpdateArea();
areaConfig.setArea(updateArea)
updateArea.init()