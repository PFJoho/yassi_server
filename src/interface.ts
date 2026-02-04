
export interface DiceList {
  diceList: Dice[];
}

export interface DefaultScore {
  possibleScore: number;
  player1: number; 
  player2: number; 
  player3: number; 
  player4: number;
}

export interface Combo {
  ones: DefaultScore;
  twos: DefaultScore;
  threes: DefaultScore;
  fours: DefaultScore;
  fives: DefaultScore;
  sixes: DefaultScore;
  top: DefaultScore;
  bonus: DefaultScore;
  pair: DefaultScore;
  twoPairs: DefaultScore;
  threePairs: DefaultScore;
  threeOfaKind: DefaultScore;
  fourOfaKind: DefaultScore;
  fiveOfaKind: DefaultScore;
  smallStraight: DefaultScore;
  largeStraight: DefaultScore;
  fullStraight: DefaultScore;
  fullHouse: DefaultScore;
  fullHouse2: DefaultScore;
  fullHouse3: DefaultScore;
  chance: DefaultScore;
  yahtzee: DefaultScore;  
  total: DefaultScore;
}

export interface Dice {
  id: number;
  value: number;
  selected: boolean;
  enabled: boolean;
}

export interface GameState {
  diceList: Dice[];
  bonusValue: number;
  bonusLimit: number;
  nextPlayer: number;  
  yassiValue:number;
  numberOfRounds: number;
  numberOfPlayers: number;
  waitingPlayerSetScore: boolean;
  benchmarkScore: DefaultScore;
  scoreWasSet: boolean;
  diceAreThrown: boolean;
  waitingPlayerThrow: boolean;
  gameOver: boolean;
  playerRound: number;
  playerThrows: number;  
  savedThrows: DefaultScore;
  gameMode: GameMode;
  multiplayer: boolean;
  canUndo: boolean;
  newGame: boolean;
  protocol:Combo;
  roomName:string;
  totalScore:DefaultScore;
  winner: number;
  winningScore:number;
  yahtzyFest: boolean
}

export enum GameMode {
  Regular = 3,
  Straight = 2,
  Maxi = 4
}