const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

class RoomRepository {
    constructor() {
        this.connection = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });
        this.initialize();
    }

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

    async createRoom(room) {
        try {
            await this.connection.query('INSERT INTO room SET ?', room);
        } catch (error) {
            throw new Error('Ошибка создания комнаты: ' + error.message);
        }
    }

    async updateRoomHost(roomName, newHostIp) {
        try {
            await this.connection.query('UPDATE room SET creator_ip = ? WHERE name = ?', [newHostIp, roomName]);
        } catch (error) {
            throw new Error('Ошибка обновления хоста комнаты: ' + error.message);
        }
    }

    async deleteRoomByName(roomName) {
        try {
            const [results] = await this.connection.query('DELETE FROM room WHERE name = ?', [roomName]);
            return results;
        } catch (error) {
            throw new Error('Ошибка удаления комнаты: ' + error.message);
        }
    }

    async addUserToRoom(user) {
        try {
            await this.connection.query('INSERT INTO room_user SET ?', user);
        } catch (error) {
            throw new Error('Ошибка добавления пользователя в комнату: ' + error.message);
        }
    }

    async getUsersInRoom(roomName) {
        try {
            const [users] = await this.connection.query('SELECT * FROM room_user WHERE room_name = ?', [roomName]);
            return users;
        } catch (error) {
            throw new Error('Ошибка получения данных пользователей в комнате: ' + error.message);
        }
    }

    async removeUserFromRoom(roomName, userIp) {
        try {
            await this.connection.query('DELETE FROM room_user WHERE room_name = ? AND user_ip = ?', [roomName, userIp]);
        } catch (error) {
            throw new Error('Ошибка удаления пользователя из комнаты: ' + error.message);
        }
    }

    async disconnect() {
        try {
            await this.connection.end();
        } catch (error) {
            throw new Error('Ошибка отключения от базы данных: ' + error.message);
        }
    }
}

module.exports = RoomRepository;
