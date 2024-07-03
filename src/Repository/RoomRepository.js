const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

class RoomRepository {
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
                    if (err) console.error('Error truncating room table:', err);
                });
                this.connection.query('TRUNCATE TABLE room_user', (err) => {
                    if (err) console.error('Error truncating room_user table:', err);
                });
            }
        });
    }

    disconnect(callback) {
        this.connection.end(callback);
    }

    createRoom(room, callback) {
        this.connection.query('INSERT INTO room SET ?', room, callback);
    }

    addUserToRoom(roomUser, callback) {
        this.connection.query('INSERT INTO room_user SET ?', roomUser, callback);
    }

    findRoomByName(roomName, callback) {
        this.connection.query('SELECT * FROM room WHERE name = ?', [roomName], callback);
    }

    findRoomByUserIp(userIp, callback) {
        this.connection.query('SELECT * FROM room_user WHERE user_ip = ?', [userIp], callback);
    }

    removeUserFromRoom(userIp, callback) {
        this.connection.query('DELETE FROM room_user WHERE user_ip = ?', [userIp], callback);
    }

    countUsersInRoom(roomName, callback) {
        this.connection.query('SELECT COUNT(*) AS userCount FROM room_user WHERE room_name = ?', [roomName], callback);
    }

    getUsersInRoom(roomName, callback) {
        this.connection.query('SELECT * FROM room_user WHERE room_name = ?', [roomName], callback);
    }

    updateRoomCreator(roomName, newCreatorIp, callback) {
        this.connection.query('UPDATE room SET creator_ip = ? WHERE name = ?', [newCreatorIp, roomName], callback);
    }

    deleteRoomByName(roomName, callback) {
        this.connection.query('DELETE FROM room WHERE name = ?', [roomName], callback);
    }

    isUserInRoom(roomName, userIp, callback) {
        this.connection.query('SELECT * FROM room_user WHERE room_name = ? AND user_ip = ?', [roomName, userIp], (err, results) => {
            if (err) return callback(err);
            callback(null, results.length > 0);
        });
    }
}

module.exports = RoomRepository;