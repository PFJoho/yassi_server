import { createServer } from "http";
import { Server } from "socket.io";
import  GameFunctions  from "./game.js"
const defaultProtocol = {
                ones: { possibleScore: -1, player1: -1, player2: -1 },
                twos: { possibleScore: -1, player1: -1, player2: -1 },
                threes: { possibleScore: -1, player1: -1, player2: -1 },
                fours: { possibleScore: -1, player1: -1, player2: -1 },
                fives: { possibleScore: -1, player1: -1, player2: -1 },
                sixes: { possibleScore: -1, player1: -1, player2: -1 },
                top: { possibleScore: -1, player1: 0, player2: 0 },
                bonus: { possibleScore: -1, player1: -1, player2: -1 },
                pair: { possibleScore: -1, player1: -1, player2: -1 },
                twoPairs: { possibleScore: -1, player1: -1, player2: -1 },               
                threeOfaKind: { possibleScore: -1, player1: -1, player2: -1 },
                fourOfaKind: { possibleScore: -1, player1: -1, player2: -1 },               
                smallStraight: { possibleScore: -1, player1: -1, player2: -1 },
                largeStraight: { possibleScore: -1, player1: -1, player2: -1 },             
                fullHouse: { possibleScore: -1, player1: -1, player2: -1 },             
                chance: { possibleScore: -1, player1: -1, player2: -1 },
                yahtzee: { possibleScore: -1, player1: -1, player2: -1 },  
                total: { possibleScore: -1, player1: -1, player2: -1 },           
            }
const defaultState =  {                
                diceList: [
                    { id: 1, value: 6, selected: false, enabled: false },
                    { id: 2, value: 6, selected: false, enabled: false },
                    { id: 3, value: 6, selected: false, enabled: false },
                    { id: 4, value: 6, selected: false, enabled: false },
                    { id: 5, value: 6, selected: false, enabled: false },
                ],
                bonusValue: 0,
                bonusLimit: 0,
                yatzyValue: 0,
                nextPlayer: 0,
                maxiYatzy: false,
                straightYatzy: false,
                waitingPlayerSetScore: 0,
                scoreWasSet: false,
                diceAreThrown: false,
                waitingPlayerThrow: true,
                gameOver: false,
                playerThrows: 3,
                playerRound: 0,                
                gameMode: "Yassi",
                canUndo: false,
                newGame: false,
                benchmarkScore: { player1: 0, player2: 0 },
                protocol: defaultProtocol,  
                totalScore: {player1: 0, player2: 0},
                winner: 0              
            };
const server = createServer();
const gameFunctions = new GameFunctions();
let connections = [];
let gameState = defaultState;

const users = new Map();

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



const io = new Server(server, {
  cors: {
    origin: ["http://localhost:4200"],
  }
});

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

const PORT = 3000; //Your server port here
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));


/*
Actions:
throw dice
set score
*/

