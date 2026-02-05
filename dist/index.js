"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const game_1 = __importDefault(require("./game"));
require("dotenv/config");
//require('dotenv').config();
require('dotenv').config({ path: __dirname + '/./../../.env' });
const port = process.env.PORT || 3000;
let rooms = [];
let frontend = process.env.FRONTEND_URI_DEVELOPMENT;
if (process.env.STATUS === 'production') {
    frontend = process.env.FRONTEND_URI_PRODUCTION;
}
const app = (0, express_1.default)();
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin');
    next();
});
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: [frontend]
    }
});
const PORT = 3000; //Your server port here
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
const users = new Map();
const gameFunctions = new game_1.default();
let gameState = gameFunctions.getGameState(2);
io.on('connection', (socket) => {
    let welcomeObject = { msg: "", gameState: gameState, initials: ["aa", "bb"] };
    let roomarray = rooms.map((r) => { return { name: r.name }; });
    if (roomarray.length === 0) {
        roomarray = [{ name: "empty" }];
    }
    socket.emit("lobby info", roomarray);
    // Listen for a message from the client
    socket.on('incoming', (msg) => {
        const text = msg.msg;
        console.log("incoming", msg, rooms);
        switch (text) {
            case "ready":
                let roomobj = rooms.find((r) => r.room === msg.room);
                welcomeObject.msg = 'OK';
                welcomeObject.initials = [...roomobj.initials];
                io.to(msg.room).emit('welcome', welcomeObject);
                rooms = rooms.filter((r) => r.room !== msg.room);
                break;
            case "zebra":
                io.emit('message', "någon sa zebra");
                break;
            default:
                io.emit('message', `någon sa ${text}`);
        }
    });
    socket.on('throw dice', (msg) => {
        let gameState = msg.state;
        const playerId = msg.player;
        let roomName = gameState.roomName;
        gameState.nextPlayer = playerId;
        gameState.diceAreThrown = true;
        gameState = gameFunctions.rollAllDice(gameState);
        const lastThrow = gameState.playerThrows == 0;
        gameState = gameFunctions.evaluateDiceResult(gameState);
        if (gameState.playerThrows === 0) {
            gameState.waitingPlayerSetScore = playerId;
        }
        io.to(roomName).emit('alea jacta est', gameState);
    });
    socket.on('chat out', (msg) => {
        io.to(msg.room).emit('chat in', {
            msg
        });
    });
    socket.on('select dice', (msg) => {
        const socketId = users.get(msg.otherId);
        io.emit("player select", {
            msg
        });
    });
    socket.on('set score', (msg) => {
        let gameState = msg.state;
        const playerId = msg.playerId;
        const inputId = msg.inputId;
        const score = msg.score;
        gameState = gameFunctions.setScore(gameState, inputId, score, playerId);
        gameState.diceAreThrown = false;
        gameState.waitingPlayerThrow = true;
        io.emit('update state', gameState);
    });
    socket.on('my name is', (msg) => {
        socket.playerName = msg;
    });
    socket.on('enter lobby', (msg) => {
        console.log("Welcome to the lobby!", msg);
        const res = lobbyManager(socket, msg.room, msg.initials);
    });
    // Handle client disconnection
    socket.on('disconnect', () => {
        handleDisconnection(socket.id);
    });
});
function handleConnection(userId) {
    const size = users.size + 1;
    users.set(size, userId);
    return size;
}
function handleDisconnection(id) {
    console.log("Disconnect? WHY?!?");
    rooms = rooms.filter((r) => r.playerId !== id);
}
function cors() {
    throw new Error("Function not implemented.");
}
function lobbyManager(socket, room, playerInits) {
    let roomobj = rooms.find((r) => r.name === room);
    console.log("roomobj", roomobj);
    gameState.gameMode = room === "maxi" ? 4 : room === "straight" ? 2 : 3;
    gameState.numberOfPlayers = 2;
    gameState = gameFunctions.setGameType(gameState);
    gameState.diceAreThrown = false;
    if (!roomobj) {
        const randomRoom = `${room}_${Math.floor(Math.random() * 10000)}`;
        let initarr = [playerInits];
        roomobj = { room: randomRoom, name: room, playerId: socket.id, initials: initarr };
        rooms.push(roomobj);
        gameState.roomName = randomRoom;
        roomobj.player = socket;
        socket.join(roomobj.room);
        console.log("Player 1 has joined lobby", randomRoom);
        socket.emit('lobby entered', {
            msg: "me so ready",
            state: gameState,
        });
        io.emit('lobby entered', {
            msg: "player1 ready",
            room: room
        });
    }
    else {
        socket.join(roomobj.room);
        roomobj.initials.push(playerInits);
        gameState.roomName = roomobj.room;
        console.log("Player 2 has joined lobby");
        socket.emit('lobby entered', {
            msg: "player2 ready",
            state: gameState,
        });
        io.emit('lobby entered', {
            msg: "game started",
            room: room
        });
    }
}
//# sourceMappingURL=index.js.map