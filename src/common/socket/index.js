const {Event} = require("../event");

class Socket extends Event {
    constructor(socket) {
        super(socket);
        this.socket = socket;
        this.id = socket.id;
        this.addConnect();
        this.setUp();
    }
    setUp() {
        // 断开 
        this.socket.on("disconnect", () => {
            this.emit(Event.REMOVE_SOCKER, this.socket);
        })
    }
    /**
     * 添加
     */
    addConnect() {
        this.emit(Event.ADD_SOCKET, this.socket);
    }
}

module.exports = Socket;