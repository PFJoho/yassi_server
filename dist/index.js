"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const gamestate_1 = require("./gamestate");
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
const io = new socket_io_1.Server(httpServer, { cors: {
        origin: [frontend]
    } });
const PORT = 3000; //Your server port here
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
const users = new Map();
const gameFunctions = new game_1.default();
let gameState = (0, gamestate_1.defaultState)();
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
        let res = gameFunctions.rollAllDice(gameState, playerId);
        res.diceAreThrown = true;
        if (res.playerThrows === 0) {
            res.waitingPlayerSetScore = playerId;
        }
        io.emit('alea jacta est', res);
        setTimeout(() => {
            res.diceAreThrown = false;
            io.emit('update state', res);
        }, 1000);
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
        let res = gameFunctions.setScore(gameState, playerId, inputId, score);
        res.diceAreThrown = false;
        res.waitingPlayerThrow = true;
        res.waitingPlayerSetScore = 0;
        io.emit('update state', res);
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