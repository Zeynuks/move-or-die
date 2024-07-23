const dotenv = require('dotenv');
dotenv.config();
/**
 * Сервис для управления комнатами.
 * @class RoomService
 */
class RoomService {
    /**
     * Создает экземпляр RoomService.
     * @param {RoomRepository} roomRepository - Репозиторий комнат.
     */
    constructor(roomRepository) {
        this.roomRepository = roomRepository;
        this.playersReadyStates = {};
        this.timeout = 1000;
    }

    /**
     * Создает новую комнату.
     * @param {string} roomName - Имя комнаты.
     * @param {string} userName - Имя пользователя, создающего комнату.
     * @param {string} userIp - IP пользователя, создающего комнату.
     * @async
     */
    async createRoom(roomName, userName, userIp) {
        const room = {name: roomName, creator_ip: userIp};
        try {
            await this.roomRepository.createRoom(room);
        } catch (error) {
            throw new Error('Ошибка создания комнаты: ' + error.message);
        }
    }

    /**
     * Присоединяет пользователя к комнате.
     * @param {string} roomName - Имя комнаты.
     * @param {string} userName - Имя пользователя.
     * @param {string} userIp - IP пользователя.
     * @async
     */
    async joinRoom(roomName, userName, userIp) {
        try {
            this.playersReadyStates[userName] = false;
            await this.addUserToRoom(roomName, userName, userIp);
        } catch (error) {
            throw new Error('Ошибка подключения к комнате: ' + error.message);
        }
    }

    /**
     * Устанавливает состояние готовности игрока.
     * @param {string} userName - Имя пользователя.
     * @returns {Object.<string, boolean>} Состояния готовности игроков.
     * @async
     */
    async playerReady(userName) {
        try {
            if (this.playersReadyStates.length > 1) {
                this.playersReadyStates[userName] = true;
                return this.playersReadyStates;
            } else {
                throw new Error('Недостаточно игроков для запуска игры');
            }
        } catch (error) {
            throw new Error('Ошибка установки готовности игрока: ' + error.message);
        }
    }

    /**
     * Проверяет, все ли игроки в комнате готовы.
     * @returns {boolean} Все ли игроки готовы.
     * @async
     */
    async isAllReady() {
        const values = Object.values(this.playersReadyStates);
        return values.every(isReady => isReady === true);
    }

    /**
     * Проверяет емкость комнаты.
     * @param {Array<User>} users - Пользователи в комнате.
     * @returns {boolean} Достигнута ли емкость комнаты.
     * @async
     */
    async checkRoomCapacity(users) {
        const userCount = users.length;
        return userCount >= 4;
    }

    /**
     * Добавляет пользователя в комнату.
     * @param {string} roomName - Имя комнаты.
     * @param {string} userName - Имя пользователя.
     * @param {string} userIp - IP пользователя.
     * @async
     */
    async addUserToRoom(roomName, userName, userIp) {
        try {
            const user = {
                room_name: roomName,
                user_ip: userIp,
                user_name: userName,
            };
            await this.roomRepository.addUserToRoom(user);
        } catch (error) {
            throw new Error('Ошибка добавления пользователя в комнату: ' + error.message);
        }
    }

    /**
     * Обновляет данные пользователя в комнате.
     * @param {string} roomName - Имя комнаты.
     * @param {string} userSkin - Скин пользователя.
     * @param {string} userColor - Цвет пользователя.
     * @param {string} userIp - IP пользователя.
     * @async
     */
    async changeUserData(roomName, userSkin, userColor, userIp) {
        try {
            await this.roomRepository.changeUserData(roomName, userSkin, userColor, userIp);
        } catch (error) {
            throw new Error('Ошибка смены данных игрока: ' + error.message);
        }
    }

    /**
     * Получает пользователей в комнате.
     * @param {string} roomName - Имя комнаты.
     * @returns {Promise<Array<RoomUser>>} Список пользователей в комнате.
     * @async
     */
    async getUsersInRoom(roomName) {
        try {
            return await this.roomRepository.getUsersInRoom(roomName);
        } catch (error) {
            throw new Error('Ошибка получения пользователей в комнате: ' + error.message);
        }
    }

    /**
     * Обрабатывает отключение пользователя от комнаты.
     * @param {string} roomName - Имя комнаты.
     * @param {string} userIp - IP пользователя.
     * @async
     */
    async userDisconnect(roomName, userIp) {
        try {
            await this.roomRepository.removeUserFromRoom(roomName, userIp);
            await this.deleteRoomIfEmpty(roomName);
        } catch (error) {
            throw new Error('Ошибка отключения пользователя от комнаты: ' + error.message);
        }
    }

    /**
     * Получает хоста комнаты.
     * @param {string} roomName - Имя комнаты.
     * @param {string} roomHost - Текущий хост комнаты.
     * @param {string} userIp - IP пользователя.
     * @returns {Promise<string>} IP нового хоста комнаты.
     * @async
     */
    async getRoomHost(roomName, roomHost, userIp) {
        try {
            if (roomHost === userIp) {
                await this.roomRepository.updateRoomHost(roomName, userIp);
                return userIp;
            }
            return roomHost;
        } catch (error) {
            throw new Error('Ошибка смены хоста комнаты: ' + error.message);
        }
    }

    /**
     * Удаляет комнату, если она пуста.
     * @param {string} roomName - Имя комнаты.
     * @async
     */
    async deleteRoomIfEmpty(roomName) {
        setTimeout(async () => {
            const users = await this.getUsersInRoom(roomName);
            if (users.length === 0) {
                await this.roomRepository.deleteRoomByName(roomName);
            }
        }, this.timeout);
    }

    /**
     * Отключается от сервиса комнаты.
     */
    closeAllRooms() {
        try {
            this.roomRepository.disconnect();
        } catch (error) {
            throw new Error('Ошибка отключения базы данных: ' + error.message);
        }

    }
}

module.exports = RoomService;
