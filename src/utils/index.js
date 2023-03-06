
class Utils {
    static isEmpth = (val) => {
        return ["",'',undefined,"undefined",null,"null"].includes(val);
    }
    static isUndefined = (val) => {
        return val === undefined
    }
    static locationFormat(url){
        var u = url.split("?");
        if (typeof (u[1]) == "string") {
            u = u[1].split("&");
            var get = {};
            for (var i in u) {
                var j = u[i].split("=");
                get[j[0]] = j[1];
            }
            return get;
        } else {
            return {};
        }
    }
    static dataFilterEmpty(params){
        for(const i in params){
            if([null,undefined,''].includes(params[i])){
                params[i]="";
            }
        }
    }
}

module.exports = Utils;