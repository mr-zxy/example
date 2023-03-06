exports.on = (socket, key, cb) => {
    socket.on(key, (...agrs) => {
        if (agrs.length === 1) {
            cb(agrs[0])
        }
        else {
            cb(agrs)
        }
    })
}

exports.emit = (socket, key, data = {}, cb) => {
    socket.emit(key, data, (...args) => cb(args))
}