const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

/**
 * @class RoomRepository
 * @description Класс для управления комнатами с использованием MySQL.
 */
class RoomRepository {
    /**
     * Создает экземпляр RoomRepository.
     * Устанавливает соединение с базой данных.
     */
    constructor() {
        this.connection = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });
        this.initialize();
    }

    /**
     * Инициализирует базу данных.
     * @private
     * @async
     * @throws {Error} Если произошла ошибка при инициализации.
     */
    async initialize() {
        try {
            const connection = await this.connection.getConnection();
            await connection.query('TRUNCATE TABLE room');
            await connection.query('TRUNCATE TABLE room_user');
            connection.release();
        } catch (error) {
            throw new Error('Ошибка инициализации базы данных: ' + error.message);
        }
    }

    /**
     * Создает комнату.
     * @param {Object} room - Объект комнаты.
     * @async
     * @throws {Error} Если произошла ошибка при создании комнаты.
     */
    async createRoom(room) {
        try {
            await this.connection.query('INSERT INTO room SET ?', room);
        } catch (error) {
            throw new Error('Ошибка создания комнаты: ' + error.message);
        }
    }

    /**
     * Обновляет хоста комнаты.
     * @param {string} roomName - Имя комнаты.
     * @param {string} newHostIp - Новый IP хоста.
     * @async
     * @throws {Error} Если произошла ошибка при обновлении хоста комнаты.
     */
    async updateRoomHost(roomName, newHostIp) {
        try {
            await this.connection.query('UPDATE room SET creator_ip = ? WHERE name = ?', [newHostIp, roomName]);
        } catch (error) {
            throw new Error('Ошибка обновления хоста комнаты: ' + error.message);
        }
    }

    /**
     * Удаляет комнату по имени.
     * @param {string} roomName - Имя комнаты.
     * @async
     * @throws {Error} Если произошла ошибка при удалении комнаты.
     */
    async deleteRoomByName(roomName) {
        try {
            await this.connection.query('DELETE FROM room WHERE name = ?', [roomName]);
        } catch (error) {
            throw new Error('Ошибка удаления комнаты: ' + error.message);
        }
    }

    /**
     * Добавляет пользователя в комнату.
     * @param {Object} user - Объект пользователя.
     * @async
     * @throws {Error} Если произошла ошибка при добавлении пользователя в комнату.
     */
    async addUserToRoom(user) {
        try {
            await this.connection.query('INSERT INTO room_user SET ?', user);
        } catch (error) {
            throw new Error('Ошибка добавления пользователя в комнату: ' + error.message);
        }
    }

    /**
     * Обновляет данные пользователя в комнате.
     * @param {string} userIp - IP пользователя.
     * @param {string} userSkin - Скин пользователя.
     * @param {string} userColor - Цвет пользователя.
     * @throws {Error} Если произошла ошибка при обновлении данных пользователя.
     * @async
     */
    async changeUserData(userIp, userSkin, userColor) {
        try {
            await this.connection.query('UPDATE room_user SET user_color = ? && user_skin = ? WHERE user_ip = ?', [userColor, userSkin, userIp]);
        } catch (error) {
            throw new Error('Ошибка обновления данных игрока: ' + error.message);
        }
    }

    /**
     * Получает пользователей в комнате.
     * @param {string} roomName - Имя комнаты.
     * @returns {Promise<any[]>} Список пользователей.
     * @async
     * @throws {Error} Если произошла ошибка при получении данных пользователей.
     */
    async getUsersInRoom(roomName) {
        try {
            const [users] = await this.connection.query('SELECT * FROM room_user WHERE room_name = ?', [roomName]);
            return users;
        } catch (error) {
            throw new Error('Ошибка получения данных пользователей в комнате: ' + error.message);
        }
    }

    /**
     * Удаляет пользователя из комнаты.
     * @param {string} roomName - Имя комнаты.
     * @param {string} userIp - IP пользователя.
     * @async
     * @throws {Error} Если произошла ошибка при удалении пользователя из комнаты.
     */
    async removeUserFromRoom(roomName, userIp) {
        try {
            await this.connection.query('DELETE FROM room_user WHERE room_name = ? AND user_ip = ?', [roomName, userIp]);
        } catch (error) {
            throw new Error('Ошибка удаления пользователя из комнаты: ' + error.message);
        }
    }

    /**
     * Отключается от базы данных.
     * @async
     * @throws {Error} Если произошла ошибка при отключении от базы данных.
     */
    async disconnect() {
        try {
            await this.connection.end();
        } catch (error) {
            throw new Error('Ошибка отключения от базы данных: ' + error.message);
        }
    }
}

module.exports = RoomRepository;