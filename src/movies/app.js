const fs = require("fs");
const stream = require('stream');
const { promisify } = require('util')
const got = require('got');
const utils = require('../utils/index');
const path = require("path");
const pipeline = promisify(stream.pipeline);
const { emit } = require("../utils/unit");

const PARENT_DIR_PATH = path.join(path.resolve(), "/assets/video");

const PREFIX = "index.m3u8";

const HTTP_CODE = new Map([["SUCCESS", 200], ["TEMP_SUCCESS", 201], ["ERROR", 500], ["VERIFY_ERROR", 501], ["NET_STOP", 400]])
class Movies {
    constructor(props) {
        this.socket = props.socket;
        this.m3u8Url = this.urlFormat(props.url); // m3u8 文件地址
        this.resultFn = props.result || (() => { }); // 回调
        this.everyDownLoadNum = props.everyDownLoadNum; // 每次并发下载的次数
        this.everyDownLoadNumRecord = props.everyDownLoadNum; // 记录最开始的下载并发次数
        this.merge(props);
    }

    urlM3u8ListTs = [] // .ts 名称 ['playlist0.ts','playlist1.ts',]
    errorList = []; // 失败的
    isErrorDownLoad = false;
    downLoadCount = 0; // 下载完成数量
    errorCount = 0; // 失败数量
    retryCount = 3; // 重试次数
    timeout = 10000; // 超时时间
    stopFlag = true; // 结束标识

    body = (code, text) => {
        const state = {
            name: this.dirName,
            url: this.m3u8Url.m3u8_url,
            downLoadCount: this.downLoadCount,
            m3u8Length: this.urlM3u8ListTs.length || this.formatUrlRelpace(null, true).length,
            // startLength: this.startLength,
            endLength: this.endLength,
            status: code,
            message: text
        }
        this.resultFn(state)
        this.socketEmit(state);
    }

    socketEmit = (data) => {
        emit(this.socket, "ReptilesVideoMessage", data)
    }

    /**
     * 同步数据库数据
     * @param {} props 
     */
    merge(props = {}) {
        this.dirName = props.name; // 下载文件and文件夹名称
        this.startLength = props.startLength; // 开始下载长度
        this.endLength = 9999; // 结束下载长度
    }

    /**
     * 链接处理
     * @param {*} m3u8Url 
     * @returns 
     */
    urlFormat(m3u8Url) {
        const urlSplit = m3u8Url.split("?")?.[0].split("/")
        let url = "";
        let suffix = "";
        urlSplit.forEach((v, idx) => (idx + 1) === urlSplit.length ? suffix = v : url += v + "/")
        return { m3u8_url: m3u8Url, url, suffix }
    }

    /**
     * 数组分组
     * @param {} baseArray 
     * @param {*} n 
     * @returns 
     */
    splitArray(baseArray, n) {
        let length = baseArray.length
        let sliceNum = length % n === 0 ? length / n : Math.floor((length / n) + 1)
        let res = []
        for (let i = 0; i < length; i += sliceNum) {
            let arr = baseArray.slice(i, i + sliceNum)
            res.push(arr)
        }
        return res
    }

    /**
     * 获取到http
     * @param {} s 
     * @returns 
     */
    getHttpStrUrl(s) {
        var reg = /(http:\/\/|https:\/\/)((\w|=|\?|\.|\/|&|-)+)/g;
        var reg = /(https?|http|ftp|file):\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]/g;
        s = s.match(reg);
        return (s && s.length ? s : []);
    }

    /**
     * 目录是否包含了文件
     * @returns boolean
     */
    isIncludesFile() {
        const list = fs.readdirSync(`${PARENT_DIR_PATH}/${this.dirName}`)
        return list.includes(PREFIX)
    }

    /**
     * 目录是否包含了文件夹，不包含创建，包含跳过
     * @returns boolean
     */
    isIncludesDirectory() {
        const mkdir = promisify(fs.mkdirSync);

        const someQuery = (url = null, str) => {
            let _url = PARENT_DIR_PATH;
            if (url !== null) {
                _url += "/" + url
            }
            if (fs.readdirSync(`${_url}`).some(v => v === str) === false) {
                mkdir(`${_url}/${str}`)
            }
        }

        const list = this.dirName.split('/');
        list.reduce((pre = null, cur, idx) => {
            const str = (pre[pre.length - 1] || "") + cur + '/';
            if (idx === 0) {
                someQuery(null, list[idx])
            }

            if (list[idx + 1]) {
                someQuery(str, list[idx + 1])
            }
            pre.push(str);
            return pre;
        }, []);
    }

    formatUrlRelpace = (data, flag = false) => {
        try {
            if (flag) {
                data = fs.readFileSync(`${PARENT_DIR_PATH}/${this.dirName}/${PREFIX}`).toString();
            }
            let newM3u8 = data.replace(/#.*/g, ",").split(',');
            newM3u8 = Object.values(newM3u8).map(v => v.trim()).filter(v => !utils.isEmpth(v));
            return newM3u8;
        } catch (e) {
            return []
        }
    }

    async init() {
        try {
            const _log = `start${this.dirName} ! 请不要关闭浏览器哦！`
            this.socketEmit(_log);
            global.logger.info(_log);
            this.stop(false);
            this.isIncludesDirectory();
            if (!this.isIncludesFile()) {
                const m3u8 = await got(this.m3u8Url.m3u8_url)
                let m3u8Info = m3u8.body;
                // const http = this.getHttpStrUrl(m3u8Info);
                // http.forEach(element => {
                //     m3u8Info=m3u8Info.replace(new RegExp(element, "g"), "");
                // });
                this.urlM3u8ListTs = this.formatUrlRelpace(m3u8Info, false); /// 
                const w = promisify(fs.writeFileSync);
                w(`${PARENT_DIR_PATH}/${this.dirName}/${PREFIX}`, m3u8Info, "utf-8")
            } else {
                this.urlM3u8ListTs = this.formatUrlRelpace(null, true)
            };
            this.beforeDownLoad(this.urlM3u8ListTs);
        } catch (e) {
            this.body(HTTP_CODE.get("ERROR"), e);
        }
    }

    forAwait(list, size) {
        return new Promise(async (resolve) => {
            list.forEach((_, idx) => {
                list[idx] = (_.split('/').length === 1 ? (this.m3u8Url.url + _) : _).trim()
            });

            try {
                await Promise.all(list.map(v => this.downLoadM3u8(v)))
                this.downLoadCount += list.length;
                let downLoadCount = this.downLoadCount;
                // 失败下载
                if (this.isErrorDownLoad) {
                    list.forEach(item => {
                        this.errorList.splice(this.errorList.findIndex(v => v === item), 1)
                    })
                    size = this.errorCount;
                    downLoadCount = this.downLoadCount - this.startLength;
                }
                const log = `下载完成第：${downLoadCount}个,总长度：${size},url：${list.join(",")}`
                this.socketEmit(log);
                global.logger.info(log);
            } catch (e) {
                let downLoadCount = this.downLoadCount;
                if (!this.isErrorDownLoad) {
                    this.errorList.push(...list);
                } else {
                    downLoadCount = this.downLoadCount - this.startLength;
                }
                const log = `下载失败第：${downLoadCount}个,url：${list.join(",")}`
                this.socketEmit(log);
                global.logger.info(log)
            } finally {
                resolve()
            }
        })
    }

    async beforeDownLoad(urlM3u8) {
        const queues = this.splitArray(urlM3u8, Math.ceil(urlM3u8.length / this.everyDownLoadNum))
        for (let j = 0; j < queues.length;) {
            if (this.stopFlag) {
                const log = "手动暂停";
                this.body(HTTP_CODE.get("NET_STOP"), log);
                global.logger.info(log);
                break;
            }
            if (this.downLoadCount < this.startLength) {
                this.downLoadCount += this.everyDownLoadNum*1;
                j++
                continue
            }
            let end = 0;
            if (this.endLength == 9999) {
                end = urlM3u8.length
            } else {
                end = this.endLength
            }
            if (this.downLoadCount >= end && !this.isErrorDownLoad) {
                global.logger.info(`到达指定条数：${end}暂停状态！`)
                this.body(HTTP_CODE.get("TEMP_SUCCESS"), `到达指定条数：${end}暂停状态！`);
                this.end();
                return false
            }
            const list = queues[j];

            await this.forAwait(list, urlM3u8.length);

            j++
        }
        global.logger.info("下载完成！")
        this.end();
    }

    /**
     * 下载文件
     * @param {} url 
     * @param {*} prefix 后缀
     * @param {*} flag 下载 .m3u8 文件传入必须true，其余false
     * @returns 
     */
    async downLoadM3u8(url, prefix = null, flag = false) {
        const urlArray = url.split('/');
        const _prefix = prefix || urlArray[urlArray.length - 1];
        return pipeline(
            got.stream(url).on('request', request => setTimeout(() => request.destroy(), this.timeout)),
            fs.createWriteStream(`${PARENT_DIR_PATH}/${this.dirName}/${_prefix}`)
        ).catch((e) => {
            if (flag) {
                fs.rmSync(`${PARENT_DIR_PATH}/${this.dirName}/${_prefix}`);
            }
        });
    }

    /**
     * 根据url列表进行下载
     * @param {} list 
     */
    downLoadUrl = async (optios, list) => {
        this.downLoadCount = optios.downLoadCount;
        this.everyDownLoadNum = 2;
        this.startLength = 0;
        this.endLength = optios.m3u8Length;
        await this.beforeDownLoad(list);
        this.everyDownLoadNum = this.everyDownLoadNumRecord;
    }

    end() {
        if (this.errorList.length > 0) {
            if (this.retryCount === 0) {
                this.verification()
                return false
            }
            const log = ("失败列表正在重新下载！还剩于重试次数：", this.retryCount)
            this.socketEmit(log);
            global.logger.info(log);
            this.retryCount -= 1;
            this.downLoadCount = this.startLength;
            this.everyDownLoadNum = this.retryCount * 4;
            this.timeout = 20000 - this.retryCount * 2000;
            this.errorCount = this.errorList.length;
            this.isErrorDownLoad = true;
            this.beforeDownLoad(this.errorList)
        } else {
            this.verification()
        }
    }

    /**
     * 校验 下载视频准确度
     */
    verification() {
        const log = "开始校验下载文件准确度！"
        this.socketEmit(log);
        global.logger.info(log);
        const list = fs.readdirSync(`${PARENT_DIR_PATH}/${this.dirName}`).filter(v => /.ts/.test(v) && fs.statSync(`${PARENT_DIR_PATH}/${this.dirName}/${v}`).size > 0);
        let end = 0;
        if (this.endLength == 9999) { end = this.urlM3u8ListTs.length } else { end = this.endLength }
        const defectList = this.urlM3u8ListTs.slice(0, this.downLoadCount).reduce((pre, cur) => {
            if (!list.some(v => !!~cur.indexOf(v))) {
                pre.push(cur)
            };
            return pre;
        }, [])

        if (defectList.length === 0) {
            const log = "校验完成！没有缺失文件！"
            this.body(HTTP_CODE.get("SUCCESS"), log);
            global.logger.info(log)
        } else {
            const log = defectList.map(v => `${this.m3u8Url.url}${v}`).join();
            this.body(HTTP_CODE.get("VERIFY_ERROR"), defectList.map(v => `${this.m3u8Url.url}${v}`));
            global.logger.info("校验失败!", log)
        }
    }

    verificationV2() {
        const list = fs.readdirSync(`${PARENT_DIR_PATH}/${this.dirName}`).filter(v => /.ts/.test(v) && fs.statSync(`${PARENT_DIR_PATH}/${this.dirName}/${v}`).size === 0);
        return list
    }

    stop(flag = true) {
        this.stopFlag = flag;
    }

    getStop() {
        return this.stopFlag;
    }

    setDownLoadCount(val) {
        this.downLoadCount = val
    }

    getDownLoadCount() {
        return this.downLoadCount;
    }
    
}

Movies.SUCCESS = HTTP_CODE.get("SUCCESS");
Movies.TEMP_SUCCESS = HTTP_CODE.get("TEMP_SUCCESS");
Movies.ERROR = HTTP_CODE.get("ERROR");
Movies.VERIFY_ERROR = HTTP_CODE.get("VERIFY_ERROR");
Movies.NET_STOP = HTTP_CODE.get("NET_STOP");

module.exports = Movies;