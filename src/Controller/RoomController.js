const BaseController = require("./BaseController");

class RoomController extends BaseController {
    constructor(io, roomName, services) {
        super(io, roomName);
        this.roomName = roomName;
        this.roomHost = null;
        this.roomService = services.roomService;
    }

    async createRoom(socket, userName) {
        try {
            this.roomHost = socket.handshake.address;
            await this.roomService.createRoom(this.roomName, userName, this.roomHost);
            socket.emit('roomCreated', this.roomName);
        } catch (err) {
            socket.emit('error', 'Ошибка сощдания комнаты');
        }
    }

    async joinRoom(socket, userName) {
        try {
            await this.checkRoomCapacity(socket, userName);
            await this.roomService.joinRoom(this.roomName, userName, socket.handshake.address);
            const users = await this.roomService.getUsersInRoom(this.roomName);
            socket.join(this.roomName);
            socket.emit('joinedRoom', this.roomName);
            this.io.emit('updateRoom', users, this.roomHost, {});
        } catch (err) {
            socket.emit('error', 'Ошибка присоединения к комнате');
        }
    }

    async checkRoomCapacity(socket, userName) {
        const users = await this.roomService.getUsersInRoom(this.roomName);
        if (await this.roomService.checkRoomCapacity(users)) {
            socket.emit('fullRoom', userName);
            throw new Error('Комната заполнена');
        }
    }

    async playerReady(socket, userName) {
        try {
            const playersReadyStates = await this.roomService.playerReady(userName);
            const users = await this.roomService.getUsersInRoom(this.roomName);
            this.io.emit('updateRoom', users, this.roomHost, playersReadyStates);
            await this.isAllReady();
        } catch (err) {
            socket.emit('error', 'Ошибка смены статуса');
        }
    }

    async isAllReady() {
        if (await this.roomService.isAllReady()) {
            this.io.emit('gameStarted');
        } else {
            throw new Error('Не удалось проверить статус игроков');
        }
    }

    async disconnect(socket) {
        try {
            await this.roomService.userDisconnect(this.roomName, socket.handshake.address);
            this.roomHost = await this.roomService.getRoomHost(this.roomName, this.roomHost, socket.handshake.address);
            this.io.emit('userDisconnected', socket.handshake.address);
        } catch (err) {
            socket.emit('error', 'Ошибка отключения');
        }
    }

    async closeAllRooms() {
        try {
            await this.roomService.disconnect();
            process.exit(0);
        } catch (err) {
            console.error('Ошибка отключения базы данных:', err);
        }
    }

}

module.exports = RoomController;
