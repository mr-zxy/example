const CategoryService = require("./categoryService")
const Http = require("../../utils/http")
const categoryService = new CategoryService();

module.exports = ({ router }) => {

    router.get('/getCategory', async (ctx, next) => {
        try {
            const list=await categoryService.getCategory({});
            Http.success(ctx, "成功",{
                list
            })
        } catch (e) {
            Http.error(ctx, e);
        }
    })

    router.get('/updateCategory', async (ctx, next) => {
        try {
            await categoryService.updateCategory({});
            Http.success(ctx, "更新成功")
        } catch (e) {
            Http.error(ctx, e);
        }
    })

}