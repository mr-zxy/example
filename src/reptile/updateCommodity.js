
const cheerio = require('cheerio');
const got = require('got');
const iconv = require('iconv-lite');
const uuid = require("uuid");
const db = require("../common/mysql/index")
const moment = require("moment");


class UpdateCommodity {
    constructor(props = {}) {
        this.props = props;
        this.page_size = 1;
        this.url = null;
        this.count = 0;
        this.uid = uuid.v4();
        this.endFlag = false; // 结束标识
        this.date = this.getDate_YYYY_M_D_H_M_s();
        this.date1 = this.getDate_YYYY_M_D()
        this.init()
    }
    getDate_YYYY_M_D() {
        return moment(new Date()).format('YYYY-MM-DD')
    }
    getDate_YYYY_M_D_H_M_s() {
        return moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
    }

    getUrl() {
        const props = this.props;
        this.url = `https://bj.zhue.com.cn/search_list.php?pid=${props.province_id}&s_id=${props.categroy_id}&cid=${props.city_id}&county_id=${props.county_id}&page=${this.page_size}`
    }

    async init() {
        await this.destory();
        this.beforePlay()
    }

    async beforePlay() {
        this.getUrl();
        this.play()
    }

    async play() {
        console.log("开始爬取！" + this.page_size + "页")
        const response = await got(this.url);
        const buf = iconv.decode(response.rawBody, 'gb2312');
        const $ = cheerio.load(buf);
        const dom = $("table[class=t_f] tbody").eq(1);
        const domList = dom.children("tr")
        const dom2List = domList.slice(2, domList.length);
        if (dom2List.length === 0) {
            this.page_size--;
            this.end();
            return false
        }
        dom2List.each((i, elem) => {
            const data = $(elem).children().eq(0).text().replace(/\s*/g, "");
            const _price = $(elem).children().eq(5).text().replace(/\s*/g, "");
            const name = $(elem).children().eq(6).text().replace(/\s*/g, "");
            const phone=$(elem).children().eq(7).text().replace(/\s*/g, "");
            const price=_price.replace(/[\u4E00-\u9FA5|/]/g,"" );
            const price_unit=_price.replace(/[\d|.|/|元]/g,"");
            this.count++;
            this.result({ data, price,name,phone,price_unit })
        });
        this.page_size++;
        this.beforePlay();
    }

    async end() {
        const handleEnd = () => { this.endFlag = true; console.log(`爬取结束！共爬取：${this.page_size}页，共${this.count}条`) }
        if (this.count == 0) {
            handleEnd();
            return false
        }
        await db.query(`INSERT INTO com_reg_cat_relation(commodity_id,province_id,city_id,county_id,categroy_id,create_date) VALUES('${this.uid}','${this.props.province_id}','${this.props.city_id}','${this.props.county_id}','${this.props.categroy_id}','${this.date}')`)
        handleEnd();
    }

    async destory() {
        let resultList = (await db.query(`SELECT COUNT(1) AS count,commodity_id FROM com_reg_cat_relation WHERE province_id='${this.props.province_id}' AND city_id='${this.props.city_id}' AND county_id='${this.props.county_id}' AND categroy_id='${this.props.categroy_id}' AND create_date LIKE '${this.date1}%' GROUP BY commodity_id`))
        if (resultList.length === 0) { resultList = [{ count: 0 }] }

        const { count, commodity_id } = resultList[0];

        if (count > 0) {
            console.log("此次需要更新数据库数据！正在自动更新！");
            await db.query(`DELETE FROM com_reg_cat_relation WHERE province_id='${this.props.province_id}' AND city_id='${this.props.city_id}' AND county_id='${this.props.county_id}' AND categroy_id='${this.props.categroy_id}' AND create_date LIKE '${this.date1}%'`);
            await db.query(`DELETE FROM commodity WHERE commodity_id='${commodity_id}'`);
            console.log("更新完成，开始爬取。")
        }

    }

    result = async function ({ data, price,name,phone,price_unit }) {
        await db.query(`INSERT INTO commodity(commodity_id,release_date,release_price,user_name,user_phone,price_unit) VALUES('${this.uid}','${data}','${price}','${name}','${phone}','${price_unit}')`)
    }

};

module.exports = UpdateCommodity;