const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

/**
 * @class MapRepository
 * @description Класс для работы с картами уровней с использованием MySQL.
 */
class MapRepository {
    /**
     * Создает экземпляр MapRepository.
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
            connection.release();
        } catch (error) {
            throw new Error('Ошибка инициализации базы данных: ' + error.message);
        }
    }

    /**
     * Ищет карту по названию уровня.
     * @param {string} levelName - Название уровня.
     * @returns {Promise<string>} Карта уровня.
     * @async
     * @throws {Error} Если произошла ошибка при поиске карты или данные не найдены.
     */
    async findMapByLevelName(levelName) {
        try {
            const [results] = await this.connection.query('SELECT level_map FROM map WHERE level_name = ?', [levelName]);
            if (results.length > 0) {
                return results[Math.floor(Math.random() * results.length)].level_map;
            } else {
                throw new Error('Данные не найдены');
            }
        } catch (error) {
            throw new Error('Ошибка поиска карты по названию уровня: ' + error.message);
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

module.exports = MapRepository;
