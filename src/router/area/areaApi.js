const AreaService = require("./areaService")
const Http = require("../../utils/http")
const areaService = new AreaService();

module.exports = ({ router }) => {

    router.get('/getProvince', async (ctx, next) => {
        try {
            const list=await areaService.getProvince({});
            Http.success(ctx, "成功",{
                list
            })
        } catch (e) {
            Http.error(ctx, e);
        }
    })

    router.get('/getCity', async (ctx, next) => {
        try {
            const params = ctx.query || {};
            const list=await areaService.getCity(params);
            Http.success(ctx, "成功",{
                list
            })
        } catch (e) {
            Http.error(ctx, e);
        }
    })

    router.get('/getCounty', async (ctx, next) => {
        try {
            const params = ctx.query || {};
            const list=await areaService.getCounty(params);
            Http.success(ctx, "成功",{
                list
            })
        } catch (e) {
            Http.error(ctx, e);
        }
    })

}



