"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectedClients = exports.io = void 0;
const socket_io_1 = require("socket.io");
const http_1 = require("http");
const joust_1 = require("./joust");
const map_1 = require("./map");
const uuid_1 = require("uuid");
const SERVER_PORT = 3000;
const server = (0, http_1.createServer)();
exports.io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
    transports: ['websocket', "polling"],
});
exports.io.engine.generateId = (req) => {
    return (0, uuid_1.v4)();
};
exports.connectedClients = [];
var gameStarted = false;
exports.io.on('connection', (socket) => {
    if (!gameStarted) {
        gameStarted = true;
        joust_1.enemyHandler.createEnemies(5);
        (0, map_1.createMap)();
        (0, joust_1.update)();
    }
    console.log(`user connected: ${socket.id}`);
    exports.connectedClients.push({ username: '', socket });
    // get join event from client, get data from client
    socket.on('playerJoined', (username) => {
        // find socket of sender
        const newUser = exports.connectedClients.find((s) => s.socket === socket);
        if (!newUser)
            return console.error('sender not found');
        // update username
        newUser.username = username;
        // send join event to existing users
        for (let existingUser of exports.connectedClients) {
            if (existingUser.socket !== socket && existingUser.username !== '') {
                existingUser.socket.emit('playerJoined', socket.uuid, username);
            }
        }
        // send all existing users to sender
        for (let existingUser of exports.connectedClients) {
            if (existingUser.username !== '') {
                newUser.socket.emit('playerJoined', existingUser.socket.uuid, existingUser.username);
            }
        }
    });
    socket.on('move', (x, y) => {
        for (let existingUser of exports.connectedClients) {
            if (existingUser.socket !== socket && existingUser.username !== '') {
                existingUser.socket.emit('playerMoved', socket.uuid, x, y);
            }
        }
    });
    socket.on('disconnect', () => {
        console.log(`user disconnected: ${socket.uuid}`);
        const user = exports.connectedClients.find((s) => s.socket === socket);
        if (!user)
            return console.error('sender not found');
        exports.connectedClients.splice(exports.connectedClients.indexOf(user), 1);
        for (let existingUser of exports.connectedClients) {
            if (existingUser.username !== '') {
                existingUser.socket.emit('playerLeft', user.socket.uuid);
            }
        }
    });
});
server.listen(SERVER_PORT, () => {
    console.log(`listening on *:${SERVER_PORT}`);
});
//# sourceMappingURL=index.js.map