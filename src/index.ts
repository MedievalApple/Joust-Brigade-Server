import { Server, Socket } from 'socket.io';
import { createServer } from 'http';

const SERVER_PORT = 3000;

const server = createServer();

// events that can go both ways
export interface SharedEvents {
    playerJoined: (playerName: string) => void;
    playerLeft: (playerName: string) => void;
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
}

// events that come from the server (outgoing to client)
export interface ServerEvents extends SharedEvents {
    playerMoved: (playerId: string, x: number, y: number) => void; // possible that socket id changes on reconnect???
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

const connectedClients: ClientData[] = [];

io.on('connection', (socket: Socket) => {
    console.log(`user connected: ${socket.id}`)
    connectedClients.push({ username: '', socket });

    // get join event from client, get data from client
    socket.on('playerJoined', (username) => {
        // find socket of sender
        const newUser = connectedClients.find((s) => s.socket === socket);
        if (!newUser) return console.error('sender not found');

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

    socket.on('move', (x: number, y: number) => {
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
                existingUser.socket.emit('playerMoved', data.username, data.x, data.y);
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
                existingUser.socket.emit('playerLeft', user.username);
            }
        }
    });
});

server.listen(SERVER_PORT, () => {
    console.log(`listening on *:${SERVER_PORT}`);
});