import { Server, Socket } from 'socket.io';
import { createServer } from 'http';

const SERVER_PORT = 3000;

const server = createServer();
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
    transports: ['websocket', "polling"],
});

interface UserConnection {
    username: string;
    socket: Socket;
}

const sockets: UserConnection[] = [];

io.on('connection', (socket: Socket) => {
    console.log(`user connected: ${socket.id}`)
    sockets.push({ username: '', socket });

    // get join event from client, get data from client
    socket.on('join', (username) => {
        // find socket of sender
        const newUser = sockets.find((s) => s.socket === socket);
        if (!newUser) return console.error('sender not found');

        // update username
        newUser.username = username;

        // send join event to existing users
        for (let existingUser of sockets) {
            if (existingUser.socket !== socket && existingUser.username !== '') {
                existingUser.socket.emit('join', username);
            }
        }
        
        // send all existing users to sender
        for (let existingUser of sockets) {
            if (existingUser.username !== '') {
                newUser.socket.emit('join', existingUser.username);
            }
        }        
    });

    socket.on('move', (data) => {
        for (let existingUser of sockets) {
            if (existingUser.socket !== socket && existingUser.username !== '') {
                existingUser.socket.emit('move', data);
            }
        }
    });

    socket.on('disconnect', () => {
        console.log(`user disconnected: ${socket.id}`);
        const user = sockets.find((s) => s.socket === socket);
        if (!user) return console.error('sender not found');
        sockets.splice(sockets.indexOf(user), 1);
        for (let existingUser of sockets) {
            if (existingUser.username !== '') {
                existingUser.socket.emit('leave', user.username);
            }
        }
    });
});

server.listen(SERVER_PORT, () => {
    console.log(`listening on *:${SERVER_PORT}`);
});