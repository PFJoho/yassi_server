"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultState = exports.defaultProtocol = void 0;
exports.defaultProtocol = {
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
};
exports.defaultState = {
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
    protocol: exports.defaultProtocol,
    totalScore: { player1: 0, player2: 0 },
    winner: 0
};
//# sourceMappingURL=gamestate.js.map