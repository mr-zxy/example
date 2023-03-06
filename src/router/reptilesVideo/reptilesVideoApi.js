const Http = require("../../utils/http");
const ReptilesVideoService = require("./reptilesVideoService");
const reptilesVideoService = new ReptilesVideoService();
const FileApp = require("../../movies/file/app");
const fileApp = new FileApp("");
module.exports = ({ router }) => {

    router.get("/getReptilesVideoList", async (ctx, next) => {
        try {
            const list = await reptilesVideoService.getReptilesVideoList();
            Http.success(ctx, "", {
                list
            })
        } catch (e) {
            Http.error(ctx, e);
        }
    })

    router.get("/getFileList", async (ctx, next) => {
        try {
            const list = fileApp.setUp(ctx.query.url);
            Http.success(ctx, "", {
                list
            })
        } catch (e) {
            Http.error(ctx, e);
        }
    })

}

