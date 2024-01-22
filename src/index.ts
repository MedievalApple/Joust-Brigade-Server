import { Server, Socket } from 'socket.io';
import { createServer } from 'http';
import { GAME_OBJECTS, enemyHandler, update } from './joust';
import { createMap } from './map';
import { Enemy, Player } from './player';
import { Direction } from './enums';

const SERVER_PORT = 3000;
const server = createServer();

// Client → Server
// Server → Client
export interface SharedEvents {}

// Client → Server
export interface ClientEvents extends SharedEvents {
    move: (x: number, y: number, velx: number, vely:number, xAccel: number, isJumping:boolean, direction:Direction) => void;
    playerJoined: (playerName: string) => void;
}

// Server → Client
export interface ServerEvents extends SharedEvents {
    playerMoved: (playerID: string, x: number, y: number, velx: number, vely:number, xAccel: number, isJumping:boolean, direction:Direction) => void;
    playerJoined: (playerID: string, playerName: string) => void;
    enemyJoined: (enemyID: string, EnemyName: string) => void;
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

export const connectedClients: Map<string, ClientData> = new Map();
var gameStarted = false;

io.on('connection', (socket: Socket) => {
    if (!gameStarted) {
        gameStarted = true;
        enemyHandler.createEnemy(5);
        createMap()
        update()
    }

    console.log(`user connected: ${socket.id}`)
    // connectedClients.push({ username: '', socket });
    connectedClients.set(socket.id, { username: '', socket: socket });
    socket.join('players');

    // get join event from client, get data from client
    socket.on('playerJoined', (username: string) => {
        // find socket of sender
        // const newUser = connectedClients.find((s) => s.socket === socket);
        const newUser = connectedClients.get(socket.id);
        if (!newUser) return console.error('sender not found');

        // update username
        newUser.username = username;

        // send join event to existing users
        // for (let existingUser of connectedClients) {
        //     if (existingUser.socket !== socket && existingUser.username !== '') {
        //         existingUser.socket.emit('playerJoined', socket.id, username);
        //     }
        // }

        connectedClients.forEach((value, key) => {
            if (value.socket !== socket && value.username !== '') {
                value.socket.emit('playerJoined', socket.id, username);
            }
        })
        
        //Add to servers internal game
        GAME_OBJECTS.set(socket.id, new Player(50, 310, 13 * 2, 18 * 2, username));

        // send all existing users to sender
        // for (let existingUser of connectedClients) {
        //     if (existingUser.username !== '') {
        //         newUser.socket.emit('playerJoined', existingUser.socket.id, existingUser.username);
        //     }
        // }

        connectedClients.forEach((value, key) => {
            if (value.username !== '') {
                newUser.socket.emit('playerJoined', value.socket.id, value.username);
            }
        });

        for (let existingEnemys of enemyHandler.enemies) {
            io.in("players").emit("enemyJoined", existingEnemys.id, existingEnemys.name);
        }
    });

    socket.on('move', (x: number, y: number, velx: number, vely:number, xAccel:number, isJumping:boolean, direction:Direction) => {
        const player = GAME_OBJECTS.get(socket.id);
        
        if (player instanceof Player) {
            player.position.x = x;
            player.position.y = y;
            player.velocity.x = velx;
            player.velocity.y = vely;
            player.xAccel = xAccel;
            player.isJumping = isJumping;
            player.direction = direction;
            player.updateCollider(player.position);
        }

        // for (let existingUser of connectedClients) {
        //     if (existingUser.socket !== socket && existingUser.username !== '') {
        //         existingUser.socket.emit('playerMoved', socket.id, x, y, velx, vely, xAccel, isJumping, direction);
        //     }
        // }

        connectedClients.forEach((value, key) => {
            if (value.socket !== socket && value.username !== '') {
                value.socket.emit('playerMoved', socket.id, x, y, velx, vely, xAccel, isJumping, direction);
            }
        });
    });

    socket.on('disconnect', () => {
        console.log(`user disconnected: ${socket.id}`);
        // const user = connectedClients.find((s) => s.socket === socket);
        const user = connectedClients.get(socket.id);
        if (!user) return console.error('sender not found');
        // connectedClients.splice(connectedClients.indexOf(user), 1);
        connectedClients.delete(socket.id);

        GAME_OBJECTS.delete(socket.id)

        // for (let existingUser of connectedClients) {
        //     if (existingUser.username !== '') {
        //         existingUser.socket.emit('playerLeft', user.socket.id);
        //     }
        // }

        connectedClients.forEach((value, key) => {
            if (value.username !== '') {
                value.socket.emit('playerLeft', user.socket.id);
            }
        });
    });
});

server.listen(SERVER_PORT, () => {
    console.log(`listening on *:${SERVER_PORT}`);
});