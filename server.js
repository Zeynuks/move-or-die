const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const dotenv = require('dotenv');
const config = require('./config/preload');

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
    path: config.socket.path,
});

const PORT = process.env.PORT || config.server.port;
const HOST = process.env.HOST || config.server.host;

app.use(express.static(path.join(__dirname, config.paths.public)));

config.routes.forEach(route => {
    app[route.method.toLowerCase()](route.path, (req, res) => {
        res.sendFile(path.join(__dirname, config.paths.public, route.file));
    });
});

app.get('/get-info', (req, res) => {
    const nets = require('os').networkInterfaces();
    let localIp = '';
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                localIp = net.address;
                break;
            }
        }
    }
    res.send({ ip: localIp, port: PORT });
});

server.listen(PORT, () => console.log(`Server running on ${PORT}`));

require('./socketHandlers')(io);

module.exports = { io, server };
