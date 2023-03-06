const EventEmitter = require("events");
EventEmitter.defaultMaxListeners = 10000;

const SOCKET_MAP = new Map();
exports.SOCKET_MAP = SOCKET_MAP;

exports.Event = class Event extends EventEmitter {
    static REPTILE = "reptile";
    static ADD_SOCKET = "addSocket";
    static REMOVE_SOCKER = "removeSocket";
    constructor(props) {
        super(props)
        this.onSocket()
    }

    onSocket() {
        this.on(Event.ADD_SOCKET, (socket) => {
            SOCKET_MAP.set(socket.id, socket);
        })

        this.on(Event.REMOVE_SOCKER, (socket) => {
            SOCKET_MAP.delete(socket.id);
        })
    }

}


