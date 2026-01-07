import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import {defaultState} from "./gamestate"
import  GameFunctions  from "./game"

const app = express();
app.options('*', cors());

const httpServer = createServer(app);
const io = new Server(httpServer, { 
  cors: {
    origin: ["https://yassi.onrender.com", "http://localhost:4200"]
  }
});
const PORT = 3000; //Your server port here
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const users = new Map();
const gameFunctions = new GameFunctions();
let gameState = defaultState;

io.on('connection', (socket:any) => {
  if(!users.has(socket.id) && users.size < 2){
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
  socket.on('incoming', (msg:any) => {      
    switch(msg){
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

   socket.on('throw dice', (msg:any) => { 
      let gameState = msg.state;
      const playerId = msg.player;

      let res = gameFunctions.rollAllDice(gameState, playerId);     
      res.diceAreThrown = true;
      if(res.playerThrows === 0){
        res.waitingPlayerSetScore = playerId;
      }

      io.emit('alea jacta est', res);

      setTimeout(() => {
        res.diceAreThrown = false;
        io.emit('update state', res);
      }, 1000)
      
   })

   socket.on('select dice', (msg:any) => {      
      const socketId = users.get(msg.otherId);
      console.log(socketId);
      io.emit("player select", {
        msg
      });

   })

   socket.on('set score', (msg:any) => { 
      let gameState = msg.state;
      const playerId = msg.playerId;
      const inputId = msg.inputId;
      const score = msg.score;
      let res = gameFunctions.setScore(gameState, playerId, inputId, score);
      res.diceAreThrown = false;
      res.waitingPlayerThrow = true;
      res.waitingPlayerSetScore = 0;
      io.emit('update state', res);
      
   })

  // Handle client disconnection
  socket.on('disconnect', () => {
    users.delete(socket.userId)
  });
});

function handleConnection(userId:any) {      
    const size = users.size + 1;
    users.set(size, userId);
    console.log('New client connected', users);
    return size;  
}

function handleDisconnection(userId:any) {
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

