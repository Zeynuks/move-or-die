class BaseController {
    constructor(io, roomName) {
        this.io = io;
        this.roomName = roomName;
    }

}

module.exports = BaseController;
