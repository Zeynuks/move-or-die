const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

class MapRepository {
    constructor() {
        this.connection = mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });
        this.connection.connect((err) => {
            if (err) {
                console.error('Error connecting to database:', err);
            } else {
                console.log('Connected to MySQL database');
                this.connection.query('TRUNCATE TABLE room', (err) => {
                    if (err) console.error('Error truncating map table:', err);
                });
            }
        });
    }

    disconnect(callback) {
        this.connection.end(callback);
    }

    findMapByLevelName(levelName) {
        return new Promise((resolve, reject) => {
            this.connection.query('SELECT level_map FROM map WHERE level_name = ?', [levelName], (error, results, fields) => {
                if (error) {
                    reject(error);
                    return;
                }
                if (results.length > 0) {
                    resolve(results[0].level_map);
                } else {
                    reject('Данные не найдены');
                }
            });
        });
    }
}

module.exports = MapRepository;
