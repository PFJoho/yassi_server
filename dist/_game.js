"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class OldGameFunctions {
    getGameState() {
    }
    updateGameState(playerId, gameState) {
    }
    rollAllDice(gameState, playerId) {
        gameState.playerThrows -= 1;
        const lastThrow = gameState.playerThrows == 0;
        gameState.diceList = gameState.diceList.map((d) => { d.enabled = true; return d; });
        for (const prop in gameState.protocol) {
            gameState.protocol[prop].possibleScore = 0;
        }
        gameState.diceList = this.getRandomDice(gameState.diceList);
        console.log('Rolling all dice...');
        const res = this.evaluateDiceResult(gameState, playerId);
        return res;
    }
    getRandomDice(diceList) {
        let diceListObj = diceList;
        diceListObj = diceListObj.map((d, ix) => {
            if (!d.selected) {
                let randomNumber = Math.random();
                const min = Math.ceil(1);
                const max = Math.floor(6);
                d.value = Math.floor(randomNumber * (max - min + 1)) + min;
            }
            return d;
        });
        return diceListObj;
    }
    evaluateDiceResult(gameState, playerId) {
        let dice = gameState.diceList;
        const player = playerId == 1 ? "player1" : "player2";
        const counts = dice.reduce((acc, d) => {
            acc[d.value] = (acc[d.value] || 0) + 1;
            return acc;
        }, {});
        const values = Object.values(counts);
        const uniqueDice = Object.keys(counts).map(Number).sort((a, b) => a - b);
        const newCombos = gameState.protocol;
        const smallRegex = /(?=.*1)(?=.*2)(?=.*3)(?=.*4)(?=.*5)/;
        const largeRegex = /(?=.*6)(?=.*2)(?=.*3)(?=.*4)(?=.*5)/;
        // Score for each number (1 to 6)
        for (const prop in counts) {
            const numberText = this.numberToText(Number(prop));
            console.log("protoprop", newCombos[numberText]);
            console.log("score", Number(prop) * counts[prop]);
            if (newCombos[numberText][player] === -1) {
                newCombos[numberText]["possibleScore"] = Number(prop) * counts[prop];
            }
        }
        // Two Pairs
        if (values.filter(v => v === 2).length >= 2 && newCombos.twoPairs[player] === -1) {
            const res = this.diceScore(counts, 2);
            newCombos.twoPairs.possibleScore = res[0] + res[1]; // Sum of two pairs      
        }
        //kåk 3+2
        if (values.includes(5)) {
            newCombos.yahtzee.possibleScore = newCombos.yahtzee[player] === -1 ? 50 : 0;
            newCombos.fourOfaKind.possibleScore = newCombos.fourOfaKind[player] === -1 ? this.diceScore(counts, 5)[0] / 5 * 4 : 0;
            newCombos.threeOfaKind.possibleScore = newCombos.threeOfaKind[player] === -1 ? this.diceScore(counts, 5)[0] / 5 * 3 : 0;
            newCombos.pair.possibleScore = newCombos.pair[player] === -1 ? this.diceScore(counts, 4)[0] / 2 : 0;
        }
        if (values.includes(3) && values.includes(2)) {
            newCombos.fullHouse.possibleScore = newCombos.fullHouse[player] === -1 ? this.diceScore(counts, 3)[0] + this.diceScore(counts, 2)[0] : 0;
            newCombos.threeOfaKind.possibleScore = newCombos.threeOfaKind[player] === -1 ? this.diceScore(counts, 3)[0] : 0;
            newCombos.twoPairs.possibleScore = newCombos.twoPairs[player] === -1 ? this.diceScore(counts, 3)[0] / 3 * 2 + this.diceScore(counts, 2)[0] : 0;
            if (newCombos.pair[player] === -1) {
                const pair1 = this.diceScore(counts, 3)[0] / 3 * 2;
                newCombos.pair.possibleScore = Math.max(pair1, this.diceScore(counts, 2)[0]);
            } //kåk 3+3
        }
        else if (values.includes(4)) {
            newCombos.fourOfaKind.possibleScore = newCombos.fourOfaKind[player] === -1 ? this.diceScore(counts, 4)[0] : 0;
            newCombos.threeOfaKind.possibleScore = newCombos.threeOfaKind[player] === -1 ? this.diceScore(counts, 4)[0] / 4 * 3 : 0;
            newCombos.pair.possibleScore = newCombos.pair[player] === -1 ? this.diceScore(counts, 4)[0] / 2 : 0;
        }
        else if (values.includes(3)) {
            newCombos.threeOfaKind.possibleScore = newCombos.threeOfaKind[player] === -1 ? this.diceScore(counts, 3)[0] : 0;
            newCombos.pair.possibleScore = newCombos.pair[player] === -1 ? this.diceScore(counts, 3)[0] / 3 * 2 : 0;
        }
        else if (values.includes(2) && newCombos.pair[player] === -1) {
            newCombos.pair.possibleScore = Math.max(...this.diceScore(counts, 2));
        }
        // Small Straight (1-5)
        if (uniqueDice.join('').match(smallRegex) && newCombos.smallStraight[player] === -1) {
            newCombos.smallStraight.possibleScore = 15; // Small Straight score
        }
        // Large Straight (2-6)
        if (uniqueDice.join('').match(largeRegex) && newCombos.largeStraight[player] === -1) {
            newCombos.largeStraight.possibleScore = 20;
        }
        // Chance (Total value of all dice)
        if (newCombos.chance[player] === -1) {
            const total = dice.reduce((sum, d) => sum + d.value, 0);
            newCombos.chance.possibleScore = total;
        }
        if (gameState.playerThrows === 0) {
            for (const prop in newCombos) {
                if (newCombos[prop].possibleScore === -1)
                    newCombos[prop].possibleScore = 0;
            }
        }
        gameState.protocol = newCombos;
        return gameState;
    }
    textToNumber(combo) {
        switch (combo) {
            case 'ones': return 1;
            case 'twos': return 2;
            case 'threes': return 3;
            case 'fours': return 4;
            case 'fives': return 5;
            case 'sixes': return 6;
            default: return 0;
        }
    }
    numberToText(num) {
        switch (num) {
            case 1:
                return 'ones';
            case 2:
                return 'twos';
            case 3:
                return 'threes';
            case 4:
                return 'fours';
            case 5:
                return 'fives';
            case 6:
                return 'sixes';
            case 9:
                return 'pair';
            case 10:
                return 'twoPairs';
            case 11:
                return 'threeOfaKind';
            case 12:
                return 'fourOfaKind';
            case 13:
                return 'smallStraight';
            case 14:
                return 'largeStraight';
            case 15:
                return 'fullHouse';
            case 16:
                return 'chance';
            case 17:
                return 'yahtzee';
            default:
                return 'unknown';
        }
    }
    diceScore(counts, val) {
        let numbers = [];
        for (const property in counts) {
            if (counts[property] === val) {
                let score = Number(property) * val;
                numbers.push(score);
            }
        }
        return numbers;
    }
    setScore(gameState, playerId, inputId, score) {
        let canUndo = false;
        console.log("inputId", inputId);
        const newcombo = this.numberToText(inputId);
        const player = playerId == 1 ? "player1" : "player2";
        gameState.nextPlayer = playerId == 1 ? 2 : 1;
        gameState.playerThrows = 3;
        if (playerId == 2) {
            gameState.playerRound += 1;
        }
        gameState.diceList = gameState.diceList.map((d) => { d.enabled = false; d.selected = false; return d; });
        gameState.gameOver = gameState.playerRound >= 15;
        gameState.diceAreThrown = false;
        gameState.scoreWasSet = true;
        gameState.waitingPlayerThrow = true;
        if (gameState.playerRound <= 18) {
            console.log("setting score in game service");
            gameState.protocol[newcombo][player] = score;
            gameState.totalScore[player] += score;
        }
        for (const property in gameState.protocol) {
            gameState.protocol[property]['possibleScore'] = -1;
        }
        if (inputId > 0 && inputId < 7) {
            gameState.benchmarkScore[player] = gameState.benchmarkScore[player] + (3 * inputId);
        }
        return this.calculateScores(gameState, playerId, player);
    }
    calcAndSetBenchmark(comboNumber, gameState, player) {
        const multiplier = 3;
        const score = comboNumber * multiplier;
        return gameState.benchmarkScore[player] + score;
    }
    calculateScores(gameState, playerId, benchmarkScore) {
        const player = playerId == 1 ? "player1" : "player2";
        let inputs = gameState.protocol;
        const topSixSum = [
            inputs.ones[player],
            inputs.twos[player],
            inputs.threes[player],
            inputs.fours[player],
            inputs.fives[player],
            inputs.sixes[player]
        ];
        const inputMap = new Map(Object.entries(gameState.protocol));
        inputs.top[player] = 0;
        topSixSum.forEach((s) => {
            if (s > 0)
                inputs.top[player] += s;
        });
        inputMap.delete("top");
        inputMap.delete("total");
        // Calculate bonus (if topSixSum >= 63 or 84, bonus is 50)
        const topIsNotFull = topSixSum.find((i) => i === -1);
        inputs.bonus[player] = inputs.top[player] >= 63 ? 50 : topIsNotFull ? -1 : 0;
        console.log(inputs.top[player]);
        // Calculate total score (sum of all rows)
        let totalScore = 0;
        inputMap.forEach((i, ix) => {
            if ((ix != 6 && ix != 17) && i[player] > 0) {
                totalScore += i[player];
            }
        });
        inputs.total[player] = totalScore;
        if (gameState.gameOver) {
            if (inputs.total.player1 > inputs.total.player2) {
                gameState.winner = 1;
            }
            else {
                gameState.winner = 2;
            }
        }
        return gameState;
    }
}
exports.default = OldGameFunctions;
//# sourceMappingURL=_game.js.map