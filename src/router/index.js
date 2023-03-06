const Router = require("koa-router");
const router = new Router();

const routers = [
    require("./commodity/commodityApi"),
    require("./category/categoryApi"),
    require("./area/areaApi"),
    require('./reptilesVideo/reptilesVideoApi')
]

routers.forEach(classIns => {
    classIns({router})
})

module.exports = router;