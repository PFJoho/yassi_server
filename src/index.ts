import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { defaultState } from "./gamestate"
import GameFunctions from "./game"
import 'dotenv/config'
import { GameState } from "./interface";

//require('dotenv').config();
require('dotenv').config({ path: __dirname + '/./../../.env' })
const port = process.env.PORT || 3000;
console.log(process.env.PORT);

let frontend = process.env.FRONTEND_URI_DEVELOPMENT;
if (process.env.STATUS === 'production') {
  frontend = process.env.FRONTEND_URI_PRODUCTION;
}
console.log(frontend);
const app = express();
app.use((req, res: any, next) => {
  res.setHeader('Access-Control-Allow-Origin')
  next()
})

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: [frontend]
  }
});
const PORT = 3000; //Your server port here
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const users = new Map();
const gameFunctions = new GameFunctions();
let gameState = gameFunctions.defaultState();


io.on('connection', (socket: any) => {
  if (!users.has(socket.id) && users.size < 2) {
    const userId = handleConnection(socket.id);
    socket.userId = userId;
    socket.emit("private message", {
      userId,
      to: socket.id
    });
  } else {
    socket.disconnect();
  }

  gameState.nextPlayer = 1;

  let welcomeObject = { player: socket.id, msg: "", gameState: gameState };

  io.emit('welcome', welcomeObject);

  // Listen for a message from the client
  socket.on('incoming', (msg: any) => {
    switch (msg) {
      case "all set":
        io.emit('start message', 'OK');
        break;
      case "zebra":
        io.emit('message', "någon sa zebra");
        break
      default:
        io.emit('message', `någon sa ${msg}`);
    }
  });

  socket.on('throw dice', (msg: any) => {
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

  })

  socket.on('chat out', (msg: any) => {

    io.emit('chat in', {
      msg
    });
  })

  socket.on('select dice', (msg: any) => {
    const socketId = users.get(msg.otherId);
    console.log(socketId);
    io.emit("player select", {
      msg
    });

  })

  socket.on('set score', (msg: any) => {
    
    let gameState = msg.state;
    const playerId = msg.playerId;
    const inputId = msg.inputId;
    const score = msg.score;
    console.log("inputid", inputId);
    gameState = gameFunctions.setScore(gameState, inputId, score, playerId);

    gameState.diceAreThrown = false;
    gameState.waitingPlayerThrow = true;
    io.emit('update state', gameState);

  })

  // Handle client disconnection
  socket.on('disconnect', () => {
    users.delete(socket.userId)
  });
});

function handleConnection(userId: any) {
  const size = users.size + 1;
  users.set(size, userId);
  console.log('New client connected', users);
  return size;
}

function handleDisconnection(userId: any) {
  const count = users.get(userId) - 1;
  if (count === 0) {
    users.delete(userId);
  } else {
    users.set(userId, count);
  }
  return count === 0;
}

function cors(): import("express-serve-static-core").RequestHandler<{}, any, any, import("qs").ParsedQs, Record<string, any>> {
  throw new Error("Function not implemented.");
}

