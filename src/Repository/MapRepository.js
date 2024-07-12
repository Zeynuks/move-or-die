const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

class MapRepository {
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
            connection.release();
        } catch (error) {
            throw new Error('Ошибка инициализации базы данных: ' + error.message);
        }
    }

    async findMapByLevelName(levelName) {
        try {
            const [results] = await this.connection.query('SELECT level_map FROM map WHERE level_name = ?', [levelName]);
            if (results.length > 0) {
                return results[0].level_map;
            } else {
                throw new Error('Данные не найдены');
            }
        } catch (error) {
            throw new Error('Ошибка поиска карты по названию уровня: ' + error.message);
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

module.exports = MapRepository;
