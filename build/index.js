"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const http_1 = require("http");
const uuid_1 = require("uuid");
const SERVER_PORT = 3000;
const server = (0, http_1.createServer)();
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
    transports: ['websocket', "polling"],
});
const connectedClients = [];
io.on('connection', (socket) => {
    socket.uuid = (0, uuid_1.v4)();
    console.log(`user connected: ${socket.uuid}`);
    connectedClients.push({ username: '', socket });
    // get join event from client, get data from client
    socket.on('playerJoined', (username) => {
        // find socket of sender
        const newUser = connectedClients.find((s) => s.socket === socket);
        if (!newUser)
            return console.error('sender not found');
        // update username
        newUser.username = username;
        // send join event to existing users
        for (let existingUser of connectedClients) {
            if (existingUser.socket !== socket && existingUser.username !== '') {
                existingUser.socket.emit('playerJoined', socket.uuid, username);
            }
        }
        // send all existing users to sender
        for (let existingUser of connectedClients) {
            if (existingUser.username !== '') {
                newUser.socket.emit('playerJoined', existingUser.socket.uuid, existingUser.username);
            }
        }
    });
    socket.on('move', (x, y) => {
        for (let existingUser of connectedClients) {
            if (existingUser.socket !== socket && existingUser.username !== '') {
                existingUser.socket.emit('playerMoved', socket.uuid, x, y);
            }
        }
    });
    socket.on('disconnect', () => {
        console.log(`user disconnected: ${socket.uuid}`);
        const user = connectedClients.find((s) => s.socket === socket);
        if (!user)
            return console.error('sender not found');
        connectedClients.splice(connectedClients.indexOf(user), 1);
        for (let existingUser of connectedClients) {
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