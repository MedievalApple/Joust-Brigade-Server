"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const http_1 = require("http");
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
    console.log(`user connected: ${socket.id}`);
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
                existingUser.socket.emit('playerJoined', username);
            }
        }
        // send all existing users to sender
        for (let existingUser of connectedClients) {
            if (existingUser.username !== '') {
                newUser.socket.emit('playerJoined', existingUser.username);
            }
        }
    });
    socket.on('move', (data) => {
        // this _may_ be slow, since we're doing multiple emits
        // the way to emit something to a number of people is to use rooms
        // brodact?
        // how do players join, is it multiplayer like multiple people can join a lobby or something
        // or is it just 1 instance
        // it's multiplayer more than 2, in the future we want to run the game on the server, and relay the game state to the clients
        // right but is there only 1 session of the game at a time, or could multiple groups of people play different games
        // right now it's only the server ur connected too, but in the future we want to allow for different gamemodes, so prolly different servers yea, but for now no
        // well different game modes could still have only 1 total session
        // i'm asking ideally would you have lobbies
        // yes in the future we want to have lobbies, but for now no, so yes
        // ok so for now this will just be players or something, but in the future you're going to want to replace this with a lobby identifier
        // also can u see the terminal?
        // i can see the debug console with user connected, and on the other one i can see the terminal
        // yea i wanted to show u the ids that we already set for players :D
        // that's what u wanted to search right?
        // like the socket id?
        // or ig u meant on the client we create an id for each game object i see, i dont remember
        // my friend changed it to only send requests on actual player movement, so i guess maybe the sheer number of requests was slowing it down
        // now it appears to be working better
        // im also sharing the server port so u can access at localhost:3000
        // top right pin / ctrl alt f
        // let me show you something
        // my friend wants to know if there are any good libraries that handle rectangle collision
        // because our collisions are bad rn
        // there are lots yes but it will probably require a bit of work
        // idk how many are just basic collision libs
        for (let existingUser of connectedClients) {
            if (existingUser.username !== data.username && existingUser.username !== '') {
                existingUser.socket.emit('move', data);
            }
        }
    });
    socket.on('disconnect', () => {
        console.log(`user disconnected: ${socket.id}`);
        const user = connectedClients.find((s) => s.socket === socket);
        if (!user)
            return console.error('sender not found');
        connectedClients.splice(connectedClients.indexOf(user), 1);
        for (let existingUser of connectedClients) {
            if (existingUser.username !== '') {
                existingUser.socket.emit('playerLeft', user.username);
            }
        }
    });
});
server.listen(SERVER_PORT, () => {
    console.log(`listening on *:${SERVER_PORT}`);
});
//# sourceMappingURL=index.js.map