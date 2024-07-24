function ErrorHandler(io, roomName, message, error) {
    console.error(roomName, message, error);
    io.emit('error', message, error);
}

module.exports = ErrorHandler;