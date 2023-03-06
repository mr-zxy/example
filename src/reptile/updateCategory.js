
const cheerio = require('cheerio');
const got = require('got');
const iconv = require('iconv-lite');
const db = require("../common/mysql/index")
const utils = require("../utils/index")

class UpdateCategory {
    constructor(props = {}) {
        this.url = "https://bj.zhue.com.cn/search_list.php";
        this.count = 0;
        this.endCount = 0;
        this.endFlag=false;
        this.init()
    }
    async init() {
        await this.destory();
        const response = await got(this.url);
        const buf = iconv.decode(response.rawBody, 'gb2312');
        const $ = cheerio.load(buf);
        const children = $("[name=s_id]").children();
        Object.keys(children).forEach(async (v, idx) => {
            if (utils.isUndefined(children[idx])) {
                return false
            }
            this.count++;
            const value = children[idx].attribs.value;
            let text = children[idx].children[0].data.replace(/—$/g, "");
            await this.result({ value, text })
        })
    }
    async destory() {
        await db.query("DELETE FROM categroy")
    }
    result = async function ({ value, text }) {
        await db.query(`INSERT INTO categroy(categroy_id,categroy_name) VALUES ('${value}','${text}')`)
        console.log(`${value}-${text}:正在写入数据库`);
        this.endCount++;
        this.end();
    }
    end = () => {
        if (this.count === this.endCount) {
            console.log("写入完成");
            this.endFlag=true;
            // process.exit(0)
        }
    }
}
module.exports = UpdateCategory;