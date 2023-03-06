const Socket = require("./../common/socket/index");
const { on } = require("../../src/utils/unit");
const { reptilesVideo, reptilesVideoStart, reptilesVideoDelete, reptilesVideoStop } = require("./reptilesVideo/reptilesVideoSocketApi")
exports.setup = (socket) => {
    new Socket(socket);

    on(socket, "disconnect", async () => {
        reptilesVideoDelete(socket);
    })

    on(socket, "ReptilesVideoStop", async () => {
        reptilesVideoStop(socket);
    })

    on(socket, "ReptilesVideoStart", async (data) => {
        reptilesVideoDelete(socket);
        await reptilesVideo(socket, data);
        reptilesVideoStart(socket);
    })
}