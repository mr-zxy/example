const fs = require("fs");

class App {
    constructor(url){
        this.initialization = "/生活媒体/assets"
    }
   
    setUp(url) {
        return this.readdirSyncFile(url);
    }
    /**
     * 读取文件夹
     * @returns boolean
     */
    readdirSyncFile(url = "") {
        if (url) {
            url = "/" + url;
        }
        return fs.readdirSync(`${this.initialization}${url}`)

    }
}
module.exports=App;