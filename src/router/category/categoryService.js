const db = require("../../common/mysql")
const UpdateCategory = require("../../reptile/updateCategory")
class CategoryService {

    getCategory = async (params={})=>{
        return db.query("SELECT * FROM categroy");
    }
    
    updateCategory = async (params = {}) => {
        return new Promise((resolve, reject) => {
            const updateCategory = new UpdateCategory({});
            const date1 = new Date();
            let timer = []
            timer[timer.length] = setInterval(() => {
                const date2 = new Date();
                if (date2.getSeconds() - date1.getSeconds() > 300) {
                    // 300 秒超时
                    timer.forEach(v => clearInterval(v))
                    reject()
                }
                if (updateCategory.endFlag) {
                    timer.forEach(v => clearInterval(v))
                    resolve()
                }
            }, 100)
        })
    }

}
module.exports = CategoryService;