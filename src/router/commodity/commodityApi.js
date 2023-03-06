const CommodityService = require("./commodityService");
const Http = require("../../utils/http");
const moment=require("moment");
const commodityService = new CommodityService();
module.exports = ({ router }) => {

    router.get('/viewCommodity', async (ctx, next) => {
        try {
            const params = ctx.query || {};
            if(!params.release_price){
                Http.error(ctx,"release_price是必填项哦！");
                return false
            }
            const result = await commodityService.viewCommodity(params);
            Http.success(ctx, "成功", result)
        } catch (e) {
            Http.error(ctx, e);
        }
    })

    router.delete('/deleteViewCommodity/:id', async (ctx, next) => {
        try {
            const params = ctx.params || {};
            await commodityService.deleteViewCommodity(params.id);
            Http.success(ctx, "删除成功")
        } catch (e) {
            Http.error(ctx, e);
        }
    })

    router.get('/getCommodity', async (ctx, next) => {
        try {
            const params = ctx.query || {};
            if(!params.start_time){
                params.start_time=moment(new Date("1970-01-01")).format("YYYY-MM-DD")
            }
            if(!params.end_time){
                params.end_time=moment().format("YYYY-MM-DD")
            }
            if(!params.province_id){
                params.province_id=""
            }
            if(!params.city_id){
                params.city_id=""
            }
            if(!params.county_id){
                params.county_id=""
            }
            if(!params.categroy_id){
                params.categroy_id=""
            }
            const result = await commodityService.getCommodity(params);
            Http.success(ctx, "成功", result)
        } catch (e) {
            Http.error(ctx, e);
        }
    })
    router.get('/getCommodityCity', async (ctx, next) => {
        try {
            const params = ctx.query || {};
            const result = await commodityService.getCommodityCity(params);
            Http.success(ctx, "成功", result)
        } catch (e) {
            Http.error(ctx, e);
        }
    })

    router.post("/addCommodity", async (ctx, next) => {
        try {
            const params = ctx.request.body || {}
            if (!params.province_id) {
                Http.error(ctx, "province_id：不要为空");
                return false
            }
            if (!params.city_id) {
                Http.error(ctx, "city_id：不要为空");
                return false
            }
            if (!params.county_id) {
                Http.error(ctx, "county_id：不要为空");
                return false
            }
            if (!params.categroy_id) {
                Http.error(ctx, "categroy_id：不要为空");
                return false
            }
            await commodityService.addCommodity(params);
            Http.success(ctx, "添加成功")
        } catch (e) {
            Http.error(ctx, e);
        }
    })

    router.delete("/deleteCommodity/:categroy_id", async (ctx, next) => {
        try {
            const params = ctx.params || {};
            await commodityService.deleteCommodity(params.categroy_id);
            Http.success(ctx, "删除成功")
        } catch (e) {
            Http.error(ctx, e);
        }
    })

}



