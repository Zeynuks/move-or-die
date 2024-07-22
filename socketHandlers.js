const RoomRepository = require("./src/Repository/RoomRepository");
const ServerManager = require('./src/Manager/ServerManager');

module.exports = (io) => {

    const roomRepository = new RoomRepository(io);

    const serverManager = new ServerManager(io, roomRepository);

    io.on('connection', (socket) => {

        socket.on('createRoom', (roomName, userName) => {
            serverManager.createRoom(socket, roomName, userName);
        });

        socket.on('gameStart', (roomName, users) => {
            serverManager.gameStart(roomName, users);
        });

        socket.on('joinRoom', (roomName, userName) => {
            serverManager.joinRoom(socket, roomName, userName);
        });

        socket.on('applySettings', (roomName, userData) => {
            serverManager.applySettings(socket, roomName, userData);
        });

        socket.on('playerReady', (roomName, userName) => {
            serverManager.playerReady(socket, roomName, userName);
        });

        socket.on('disconnect', () => {
            serverManager.disconnect(socket);
        });

    });

    const gameNamespace = io.of('/game');
    gameNamespace.on('connection', (socket) => {

        socket.on('playerJoin', (roomName) => {
            serverManager.playerJoin(socket, roomName);
        });

        socket.on('playerMovement', (roomName, moveData) => {
            serverManager.handleMove(socket, roomName, moveData);
        });

        socket.on('disconnect', () => {
            serverManager.gameDisconnect(socket);
        });

        socket.on('endGame', (roomName) => {
            serverManager.removeRoom(socket, roomName);
        });
    });

    process.on('SIGINT', () => {
        serverManager.closeAllRooms();
        process.exit();
    });
};
