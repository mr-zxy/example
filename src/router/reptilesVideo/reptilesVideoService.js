const db = require("../../common/mysql")
class ReptilesVideoService {

    addReptilesVideo = async (params = {}) => {
        return await db.query(`INSERT INTO reptiles_video(name,describe_text,code,end_num,video_url,m3u8_length,down_load_count,create_time) VALUES ('${params.name}','${JSON.stringify(params.message)}','${params.status}','${params.endLength}','${params.url}','${params.m3u8Length}','${params.downLoadCount}',NOW())`)
    }

    getReptilesVideoByName = async (params = {}) => {
        return await db.query(`SELECT * FROM reptiles_video WHERE name="${params.name}"`)
    }

    getReptilesVideoList = async () => {
        return await db.query(`SELECT * FROM reptiles_video  WHERE code = 200 ORDER BY name ASC`)
    }

    updateReptilesVideo = async (params = {}) => {
        return await db.query(`UPDATE reptiles_video SET end_num="${params.endLength}",m3u8_length="${params.m3u8Length}",down_load_count="${params.downLoadCount}",create_time=NOW() WHERE name="${params.name}" AND code="${params.status}"`)
    }
    updateReptilesByName = async (params = {}) => {
        return await db.query(`UPDATE reptiles_video SET describe_text='${JSON.stringify(params.message)}' WHERE name='${params.name}' AND code='${params.status}'`)
    }

}

module.exports = ReptilesVideoService;
