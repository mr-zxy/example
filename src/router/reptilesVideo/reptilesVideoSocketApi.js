const Http = require("../../utils/http");
const Movies = require("../../movies/app");
const ReptilesVideoService = require("./reptilesVideoService");
const reptilesVideoService = new ReptilesVideoService();
const { emit } = require("../../utils/unit");

const SOCKET_MAP = new Map();

exports.reptilesVideoStart = async (socket) => {
    const movies = SOCKET_MAP.get(socket.id);
    const response = (await reptilesVideoService.getReptilesVideoByName({ name: movies.dirName })) || [];

    const start = (props) => {
        movies.stop(false);
        movies.setDownLoadCount(0);
        movies.merge({
            name: props.name, startLength: props.down_load_count
        })
        movies.init();
    }
    if (response.length > 0) {
        const getDataByCode = (httpCode) => response.find(v => parseInt(v.code) === httpCode);

        // 下载未完成
        const error501 = getDataByCode(Movies.VERIFY_ERROR);
        if (error501) {
            let list = [];
            try {
                list = JSON.parse(error501.describe_text);
            } catch (e) { list = [] };
            list = [...new Set([...list, ...movies.verificationV2()])]
            if (list.length > 0) {
                movies.stop(false);
                await movies.downLoadUrl(
                    {
                        downLoadCount: error501.down_load_count - list.length,
                        m3u8Length: error501.m3u8_length,
                    }, list);
                await reptilesVideoService.updateReptilesByName({
                    message: [],
                    name: movies.dirName,
                    status: Movies.VERIFY_ERROR
                });
            }
        }

        const success200 = getDataByCode(Movies.SUCCESS);
        // 成功
        if (success200) {
            if (success200.down_load_count != 0 && movies.verificationV2().length === 0 && success200.down_load_count === success200.m3u8_length) {
                emit(socket, "ReptilesVideoMessage", {
                    message: "视频已下载过啦呀！",
                    status: 200
                })
                return false;
            }
        }

        // 手动暂停 同步数据库 继续下载
        const net400 = getDataByCode(Movies.NET_STOP);
        if (net400 && movies.getStop()) {
            start(net400)
            return;
        }

        // 到达指定下载条数 同步数据库 继续下载
        const success201 = getDataByCode(Movies.TEMP_SUCCESS);
        if (success201) {
            start(success201)
            return;
        }

        const error500 = getDataByCode(Movies.ERROR);
        // 链接失效 
        if (error500 && /"errno":-2/.test(error500.describe_text)) {
            movies.init();
            return
        } else {
            movies.init();
        }
    } else {
        movies.init();
    }
}

exports.reptilesVideoStop = async (socket) => {
    const movies = SOCKET_MAP.get(socket.id);
    if (movies) {
        movies.endLength = movies.getDownLoadCount();
        movies.stop();
    }
}

exports.reptilesVideoDelete = async (socket) => {
    const movies = SOCKET_MAP.get(socket.id);
    if (movies) {
        movies.endLength = movies.getDownLoadCount();
        movies.stop();
    }
    SOCKET_MAP.delete(socket.id);
}

exports.reptilesVideo = async (socket, ctx) => {
    try {

        return new Promise((resolve) => {

            if (!ctx.url) {
                // reject({ code: Http.ERROR, message: "url是必填项哦！" });
                return false;
            }
            if (!/.m3u8/g.test(ctx.url)) {
                emit(socket, "ReptilesVideoMessage", {
                    status: Movies.ERROR,
                    message: "链接不正确！"
                })
                return false;
            }
            if (!ctx.name) {
                // reject({ code: Http.ERROR, message: "name是必填项哦！" });
                return false;
            }
            if (!ctx.endLength) {
                ctx.endLength = 9999
            }
            if (!ctx.everyDownLoadNum) {
                ctx.everyDownLoadNum = 30
            }
            if (!SOCKET_MAP.get(socket.id)) {
                SOCKET_MAP.set(socket.id, new Movies({
                    socket,
                    ...ctx,
                    result: async (props) => {
                        const { name, status, downLoadCount, m3u8Length } = props;
                        const response = (await reptilesVideoService.getReptilesVideoByName({ name })) || [];
                        if (response.some(v => parseInt(v.code) === status)) {
                            if (downLoadCount > m3u8Length) {
                                props.downLoadCount = m3u8Length
                            }
                            await reptilesVideoService.updateReptilesVideo(props);
                            if (status === Movies.VERIFY_ERROR) {
                                await reptilesVideoService.updateReptilesByName({
                                    message: props.message,
                                    name: name,
                                    status: Movies.VERIFY_ERROR
                                })
                            }
                        } else {
                            await reptilesVideoService.addReptilesVideo(props);
                        }
                    }
                }))
            }
            resolve(true);
        })

    } catch (e) {
        Http.error(ctx, e);
    }
}
