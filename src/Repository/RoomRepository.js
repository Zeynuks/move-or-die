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
     */
    async initialize() {
        const connection = await this.connection.getConnection();
        await connection.query('TRUNCATE TABLE room');
        await connection.query('TRUNCATE TABLE room_user');
        connection.release();
    }

    /**
     * Создает комнату.
     * @param {Object} room - Объект комнаты.
     * @async
     */
    async createRoom(room) {
        await this.connection.query('INSERT INTO room SET ?', room);
    }

    /**
     * Обновляет хоста комнаты.
     * @param {string} roomName - Имя комнаты.
     * @param {string} newHostIp - Новый IP хоста.
     * @async
     */
    async updateRoomHost(roomName, newHostIp) {
        await this.connection.query('UPDATE room SET creator_ip = ? WHERE name = ?', [newHostIp, roomName]);
    }

    /**
     * Удаляет комнату по имени.
     * @param {string} roomName - Имя комнаты.
     * @async
     */
    async deleteRoomByName(roomName) {
        await this.connection.query('DELETE FROM room WHERE name = ?', [roomName]);
    }

    /**
     * Добавляет пользователя в комнату.
     * @param {Object} user - Объект пользователя.
     * @async
     */
    async addUserToRoom(user) {
        await this.connection.query('INSERT INTO room_user SET ?', user);
    }

    /**
     * Обновляет данные пользователя в комнате.
     * @param {string} userIp - IP пользователя.
     * @param {string} userSkin - Скин пользователя.
     * @param {string} userColor - Цвет пользователя.
     * @async
     */
    async changeUserData(userIp, userSkin, userColor) {
        await this.connection.query('UPDATE room_user SET user_color = ?, user_skin = ? WHERE user_ip = ?', [userColor, userSkin, userIp]);
    }

    /**
     * Получает пользователей в комнате.
     * @param {string} roomName - Имя комнаты.
     * @returns {Promise<Array[]>} Список пользователей.
     * @async
     */
    async getUsersInRoom(roomName) {
        const [users] = await this.connection.query('SELECT * FROM room_user WHERE room_name = ?', [roomName]);
        return users;
    }

    /**
     * Удаляет пользователя из комнаты.
     * @param {string} roomName - Имя комнаты.
     * @param {string} userIp - IP пользователя.
     * @async
     */
    async removeUserFromRoom(roomName, userIp) {
        await this.connection.query('DELETE FROM room_user WHERE room_name = ? AND user_ip = ?', [roomName, userIp]);
    }

    /**
     * Отключается от базы данных.
     * @async
     */
    async disconnect() {
        await this.connection.end();
    }
}

module.exports = RoomRepository;