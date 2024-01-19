import { Server, Socket } from 'socket.io';
import { createServer } from 'http';
import { enemyHandler, update } from './joust';
import { createMap } from './map';

const SERVER_PORT = 3000;
const server = createServer();

// Client → Server
// Server → Client
export interface SharedEvents {}

// Client → Server
export interface ClientEvents extends SharedEvents {
    move: (x: number, y: number, velx: number, vely:number, xAccel: number, isJumping:boolean) => void;
    playerJoined: (playerName: string) => void;
}

// Server → Client
export interface ServerEvents extends SharedEvents {
    playerMoved: (playerID: string, x: number, y: number, velx: number, vely:number, xAccel: number, isJumping:boolean) => void;
    playerJoined: (playerID: string, playerName: string) => void;
    playerLeft: (playerID: string) => void;
}

export const io = new Server<ClientEvents, ServerEvents>(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
    transports: ['websocket', "polling"],
});

interface ClientData {
    username: string;
    socket: Socket;
}

export const connectedClients: ClientData[] = [];
var gameStarted = false;

io.on('connection', (socket: Socket) => {
    if (!gameStarted) {
        gameStarted = true;
        enemyHandler.createEnemy(5);
        createMap()
        update()
    }

    console.log(`user connected: ${socket.id}`)
    connectedClients.push({ username: '', socket });
    socket.join('players');

    // get join event from client, get data from client
    socket.on('playerJoined', (username: string) => {
        // find socket of sender
        const newUser = connectedClients.find((s) => s.socket === socket);
        if (!newUser) return console.error('sender not found');

        // update username
        newUser.username = username;

        // send join event to existing users
        for (let existingUser of connectedClients) {
            if (existingUser.socket !== socket && existingUser.username !== '') {
                existingUser.socket.emit('playerJoined', socket.id, username);
            }
        }

        // send all existing users to sender
        for (let existingUser of connectedClients) {
            if (existingUser.username !== '') {
                newUser.socket.emit('playerJoined', existingUser.socket.id, existingUser.username);
            }
        }
    });

    socket.on('move', (x: number, y: number, velx: number, vely:number, xAccel:number, isJumping:boolean) => {
        for (let existingUser of connectedClients) {
            if (existingUser.socket !== socket && existingUser.username !== '') {
                existingUser.socket.emit('playerMoved', socket.id, x, y, velx, vely, xAccel, isJumping);
            }
        }
    });

    socket.on('disconnect', () => {
        console.log(`user disconnected: ${socket.id}`);
        const user = connectedClients.find((s) => s.socket === socket);
        if (!user) return console.error('sender not found');
        connectedClients.splice(connectedClients.indexOf(user), 1);
        for (let existingUser of connectedClients) {
            if (existingUser.username !== '') {
                existingUser.socket.emit('playerLeft', user.socket.id);
            }
        }
    });
});

server.listen(SERVER_PORT, () => {
    console.log(`listening on *:${SERVER_PORT}`);
});