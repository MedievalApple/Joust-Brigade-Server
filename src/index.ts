import { Server, Socket } from 'socket.io';
import { createServer } from 'http';
import { v4 as uuidv4 } from 'uuid';

const SERVER_PORT = 3000;

const server = createServer();

// events that can go both ways
export interface SharedEvents {
    
}

// so how this works is once we have these on both the server and client, 
// the client will emit the .move with it's position,
// then the server code will look up the player id from the socket id,
// and then emit to the room the playerMoved event and then all client use that to update that players position

// to keep movement for each player more client side you should probably have each client ignore the playerMoved event for its own position
// yea
// you can also check this: 
// server: https://github.com/tristanmcpherson/alieninvasion/blob/master/src/app/socketio/handler.ts
// client: https://github.com/tristanmcpherson/alieninvasion-front/blob/master/src/core/WebSocket.tsx
// alright, i'll look at that

// also when we update, we do that inside the player class, because we only update on player press, is there a better way to do that?

// events that that come from the client
export interface ClientEvents extends SharedEvents {
    move: (x: number, y: number) => void;
    playerJoined: (playerName: string) => void;
}

// events that come from the server (outgoing to client)
export interface ServerEvents extends SharedEvents {
    playerMoved: (playerId: string, x: number, y: number) => void; // possible that socket id changes on reconnect???
    playerJoined: (playerID: string, playerName: string) => void;
    playerLeft: (playerID: string) => void;
}

const io = new Server<ClientEvents, ServerEvents>(server, {
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

declare module 'socket.io' {
    interface Socket {
        uuid: string;
    }
}

const connectedClients: ClientData[] = [];

io.on('connection', (socket: Socket) => {
    socket.uuid = uuidv4();

    console.log(`user connected: ${socket.uuid}`)
    connectedClients.push({ username: '', socket });

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

    socket.on('move', (x: number, y: number) => {
        for (let existingUser of connectedClients) {
            if (existingUser.socket !== socket && existingUser.username !== '') {
                existingUser.socket.emit('playerMoved', socket.uuid, x, y); 
            }
        }
    });

    socket.on('disconnect', () => {
        console.log(`user disconnected: ${socket.uuid}`);
        const user = connectedClients.find((s) => s.socket === socket);
        if (!user) return console.error('sender not found');
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