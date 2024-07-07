class RoomService {
    constructor(roomRepository) {
        this.roomRepository = roomRepository;
        this.playersReadyStates = {};
        this.timeout = 1000;
    }

    async createRoom(roomName, userName, userIp) {
        const room = {name: roomName, creator_ip: userIp};
        try {
            await this.roomRepository.createRoom(room);
        } catch (error) {
            console.error('Ошбика создания комнаты: ' + error.message);
        }
    }

    async joinRoom(roomName, userName, userIp) {
        try {
            this.playersReadyStates[userName] = false;
            await this.addUserToRoom(roomName, userName, userIp)
        } catch (error) {
            console.error('Ошибка подключения к комнате: ' + error.message);
        }
    }

    async playerReady(userName) {
        try {
            this.playersReadyStates[userName] = true;
            return this.playersReadyStates;
        } catch (error) {
            console.error('Ошибка подключения к комнате: ' + error.message);
        }
    }

    async isAllReady() {
        const values = Object.values(this.playersReadyStates);
        return values.every(isReady => isReady === true);
    }

    async checkRoomCapacity(users) {
        const userCount = users.length;
        return userCount >= 4;
    }

    async addUserToRoom(roomName, userName, userIp) {
        try {
            const roomUser = {
                room_name: roomName,
                user_name: userName,
                user_ip: userIp,
            };
            await this.roomRepository.addUserToRoom(roomUser);
        } catch (error) {
            throw new Error('Ошибка добавления пользователя');
        }
    }

    async getUsersInRoom(roomName) {
        try {
            return await this.roomRepository.getUsersInRoom(roomName);
        } catch (error) {
            console.error('Ошибка подключения к комнате: ' + error.message);
        }
    }

    async userDisconnect(roomName, userIp) {
        try {
            await this.roomRepository.removeUserFromRoom(roomName, userIp);
            await this.deleteRoomIfEmpty(roomName);
        } catch (error) {
            console.error('Ошибка отключения: ' + error.message);
        }
    }

    async getRoomHost(roomName, roomHost, userIp) {
        try {
            if (roomHost === userIp) {
                await this.roomRepository.updateRoomHost(roomName, userIp);
                return userIp
            }
            return roomHost
        } catch (error) {
            console.error('Ошибка смены хоста: ' + error.message);
        }
    }

    async deleteRoomIfEmpty(roomName) {
        setTimeout(async () => {
            const users = await this.getUsersInRoom(roomName);
            if (users.length === 0) {
                await this.roomRepository.deleteRoomByName(roomName);
            }
        }, this.timeout);
    }

    async disconnect() {
        this.roomRepository.disconnect();
    }
}

module.exports = RoomService;
