function ErrorHandler(io, roomName, message, error) {
    console.error(roomName, message, error);
    io.emit(message, error);
}

module.exports = ErrorHandler;