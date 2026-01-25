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
console.log(process.env.PORT);
let frontend = process.env.FRONTEND_URI_DEVELOPMENT;
if (process.env.STATUS === 'production') {
    frontend = process.env.FRONTEND_URI_PRODUCTION;
}
console.log(frontend);
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
let gameState = gameFunctions.defaultState();
io.on('connection', (socket) => {
    if (!users.has(socket.id) && users.size < 2) {
        const userId = handleConnection(socket.id);
        socket.userId = userId;
        socket.emit("private message", {
            userId,
            to: socket.id
        });
    }
    else {
        socket.disconnect();
    }
    gameState.nextPlayer = 1;
    let welcomeObject = { player: socket.id, msg: "", gameState: gameState };
    io.emit('welcome', welcomeObject);
    // Listen for a message from the client
    socket.on('incoming', (msg) => {
        switch (msg) {
            case "all set":
                io.emit('start message', 'OK');
                break;
            case "zebra":
                io.emit('message', "någon sa zebra");
                break;
            default:
                io.emit('message', `någon sa ${msg}`);
        }
    });
    socket.on('throw dice', (msg) => {
        let gameState = msg.state;
        const playerId = msg.player;
        gameState.nextPlayer = playerId;
        gameState.diceAreThrown = true;
        gameState = gameFunctions.rollAllDice(gameState);
        gameState.playerThrows = gameState.playerThrows - 1;
        const lastThrow = gameState.playerThrows == 0;
        gameState = gameFunctions.evaluateDiceResult(gameState);
        console.log(gameState.protocol);
        if (gameState.playerThrows === 0) {
            gameState.waitingPlayerSetScore = playerId;
        }
        io.emit('alea jacta est', gameState);
    });
    socket.on('chat out', (msg) => {
        io.emit('chat in', {
            msg
        });
    });
    socket.on('select dice', (msg) => {
        const socketId = users.get(msg.otherId);
        console.log(socketId);
        io.emit("player select", {
            msg
        });
    });
    socket.on('set score', (msg) => {
        let gameState = msg.state;
        const playerId = msg.playerId;
        const inputId = msg.inputId;
        const score = msg.score;
        console.log("inputid", inputId);
        gameState = gameFunctions.setScore(gameState, inputId, score, playerId);
        gameState.diceAreThrown = false;
        gameState.waitingPlayerThrow = true;
        io.emit('update state', gameState);
    });
    // Handle client disconnection
    socket.on('disconnect', () => {
        users.delete(socket.userId);
    });
});
function handleConnection(userId) {
    const size = users.size + 1;
    users.set(size, userId);
    console.log('New client connected', users);
    return size;
}
function handleDisconnection(userId) {
    const count = users.get(userId) - 1;
    if (count === 0) {
        users.delete(userId);
    }
    else {
        users.set(userId, count);
    }
    return count === 0;
}
function cors() {
    throw new Error("Function not implemented.");
}
//# sourceMappingURL=index.js.map