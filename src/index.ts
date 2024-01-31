import { Server, Socket } from 'socket.io';
import { createServer } from 'http';
import { GAME_OBJECTS, enemyHandler, update } from './joust';
import { createMap } from './map';
import { Enemy, Player } from './player';
import { Direction } from './enums';
import { advancedLog } from './utils';

const SERVER_PORT = 3000;
const server = createServer();

// Client ←→ Server
export interface SharedEvents { }

// Client → Server
export interface ClientEvents extends SharedEvents {
    move: (x: number, y: number, velx: number, vely: number, xAccel: number, isJumping: boolean, direction: Direction) => void;
    playerJoined: (playerName: string) => void;
}

// Server → Client
export interface ServerEvents extends SharedEvents {
    playerMoved: (playerID: string, x: number, y: number, velx: number, vely: number, xAccel: number, isJumping: boolean, direction: Direction) => void;
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
var isGameRunning = false;

io.on('connection', (socket: Socket) => {
    if (!isGameRunning) {
        isGameRunning = true;
        enemyHandler.createEnemy(5);
        
        createMap()
        advancedLog("Map loaded", "#32a852", "🗺️");

        update()
    }

    advancedLog(`User connected`, 'green', socket.id);
    connectedClients.set(socket.id, { username: '', socket: socket });

    // get join event from client, get data from client
    socket.on('playerJoined', (username: string) => {
        if (username === '') return advancedLog('username is empty', 'red');
        advancedLog(`${socket.id} joined as ${username}`, 'green');
        socket.join("players");

        // find socket of sender
        // const newUser = connectedClients.find((s) => s.socket === socket);
        const joiningUser = connectedClients.get(socket.id);
        if (!joiningUser) return console.error('sender not found');

        // update username
        joiningUser.username = username;

        connectedClients.forEach((value, key) => {
            if (value.socket !== socket && value.username !== '') {
                value.socket.emit('playerJoined', socket.id, username);
                joiningUser.socket.emit('playerJoined', value.socket.id, value.username);
            }
        })

        //Add to servers internal game
        GAME_OBJECTS.set(socket.id, new Player(50, 310, 13 * 2, 18 * 2, username));
    
        for (let existingEnemys of enemyHandler.enemies) {
            io.in("players").emit("enemyJoined", existingEnemys.id, existingEnemys.name);
        }
    });

    socket.on('move', (x: number, y: number, velx: number, vely: number, xAccel: number, isJumping: boolean, direction: Direction) => {
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

        connectedClients.forEach((value, key) => {
            if (value.socket !== socket && value.username !== '') {
                value.socket.emit('playerMoved', socket.id, x, y, velx, vely, xAccel, isJumping, direction);
            }
        });
    });

    socket.on('disconnect', () => {
        const disconnectingUser = connectedClients.get(socket.id);
        if (!disconnectingUser) return console.error('Sender not found');

        console.log(`User disconnected: ${socket.id}`);
        
        connectedClients.delete(socket.id);
        GAME_OBJECTS.delete(socket.id);
        
        socket.leave("players");
        io.in("players").emit("playerLeft", socket.id);
    });
});

server.listen(SERVER_PORT, () => {
    console.log(`Server running on port ${SERVER_PORT}`);
});