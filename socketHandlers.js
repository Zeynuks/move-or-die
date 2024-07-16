const RoomRepository = require("./src/Repository/RoomRepository");
const RoomManager = require('./src/Manager/RoomManager');

module.exports = (io) => {

    const roomRepository = new RoomRepository(io);

    const roomManager = new RoomManager(io, roomRepository);

    io.on('connection', (socket) => {

        socket.on('createRoom', (roomName, userName) => {
            if (!userName) {
                console.error('Error: userName is null or undefined.');
                socket.emit('error', 'User name cannot be null or undefined');
                return;
            }
            roomManager.createRoom(socket, roomName, userName);
        });

        socket.on('joinRoom', (roomName, userName) => {
            if (!userName) {
                console.error('Error: userName is null or undefined.');
                socket.emit('error', 'User name cannot be null or undefined');
                return;
            }
            roomManager.joinRoom(socket, roomName, userName);
        });

        socket.on('playerReady', (roomName, userName) => {
            roomManager.playerReady(socket, roomName, userName);
        });

        socket.on('disconnect', () => {
            roomManager.disconnect(socket);
        });

    });

    const gameNamespace = io.of('/game');
    gameNamespace.on('connection', (socket) => {

        socket.on('playerStart', (roomName, userName) => {
            roomManager.playerStart(socket, roomName, userName);
        });

        socket.on('playerMovement', (roomName, moveData) => {
            roomManager.handleMove(socket, roomName, moveData);
        });

        socket.on('disconnect', () => {
            roomManager.gameDisconnect(socket);
        });

        socket.on('endGame', () => {
            roomManager.removeRoom(socket);
        });
    });

    process.on('SIGINT', () => {
        roomManager.closeAllRooms();
        process.exit();
    });
};
