import { GameState, DefaultScore, Combo, GameMode } from "./interface"

export default class GameFunctions {
    players = ["player1", "player2", "player3", "player4"];

    rollAllDice(gameState: any) {

        gameState.playerThrows = gameState.playerThrows - 1;
        const lastThrow = gameState.playerThrows == 0;
        gameState.diceList = gameState.diceList.map((d: any) => { d.enabled = true; return d; });
        for (const prop in gameState.protocol) {
            gameState.protocol[prop].possibleScore = 0;
        }

        let diceList = this.getRandomDice(gameState.diceList);
        console.log('Rolling all dice...');


        gameState.diceList = diceList;
        gameState.waitingPlayerThrow = false;
        gameState.diceAreThrown = true;

        return gameState;

    }



    getRandomDice(diceListObj: any) {

        diceListObj = diceListObj.map((d: any, ix: any) => {
            if (!d.selected) {
                const minCeiled = Math.ceil(1);
                const maxFloored = Math.floor(6);
                d.value = Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled)
            }
            return d;
        })

        // diceListObj = diceListObj.map((d: any, ix: number) => {
        //     if (ix < 3) {
        //         d.value = 6;
        //     } if (ix > 2) {
        //         d.value = 5;
        //         // } else if(ix > 3) {
        //         //     d.value = 4;
        //     }

        //     return d;
        // })

        return diceListObj;
    }

    evaluateDiceResult(gameState: GameState) {
        const player = this.players[gameState.nextPlayer - 1];
        console.log("player", gameState.nextPlayer);

        let dice = gameState.diceList;

        const counts = dice.reduce((acc: any, d: any) => {
            acc[d.value] = (acc[d.value] || 0) + 1;
            return acc;
        }, {});

        const values = Object.values(counts);
        const uniqueDice = Object.keys(counts).map(Number).sort((a, b) => a - b);
        const newCombos = Object.assign({}, gameState.protocol);
        const smallRegex = /(?=.*1)(?=.*2)(?=.*3)(?=.*4)(?=.*5)/;
        const largeRegex = /(?=.*6)(?=.*2)(?=.*3)(?=.*4)(?=.*5)/;
        // Score for each number (1 to 6)

        for (const prop in counts) {
            const numberText = this.numberToText(Number(prop));
            if (newCombos[numberText][player as keyof DefaultScore] === -1) {
                newCombos[numberText]["possibleScore"] = Number(prop) * counts[prop];
            }
        }
        if (values.includes(6)) {
            newCombos.yahtzee.possibleScore = newCombos.yahtzee[player as keyof DefaultScore] === -1 ? gameState.yassiValue : 0;
            const diceval = dice.reduce((sum: any, d: any) => sum + d.value, 0) / 6;
            newCombos.fiveOfaKind.possibleScore = newCombos.fiveOfaKind[player as keyof DefaultScore] === -1 ? diceval * 5 : 0;
            newCombos.fourOfaKind.possibleScore = newCombos.fourOfaKind[player as keyof DefaultScore] === -1 ? diceval * 4 : 0;
            newCombos.threeOfaKind.possibleScore = newCombos.threeOfaKind[player as keyof DefaultScore] === -1 ? diceval * 3 : 0;

            if (newCombos.pair[player as keyof DefaultScore] === -1) {
                newCombos.pair.possibleScore = this.diceScore(counts, 6)[0] / 6 * 2;
            }
        } else if (values.includes(5) && gameState.gameMode !== GameMode.Maxi) {
            newCombos.yahtzee.possibleScore = newCombos.yahtzee[player as keyof DefaultScore] === -1 ? gameState.yassiValue : 0;
            newCombos.fourOfaKind.possibleScore = newCombos.fourOfaKind[player as keyof DefaultScore] === -1 ? this.diceScore(counts, 5)[0] / 5 * 4 : 0;
            newCombos.threeOfaKind.possibleScore = newCombos.threeOfaKind[player as keyof DefaultScore] === -1 ? this.diceScore(counts, 5)[0] / 5 * 3 : 0;
            if (newCombos.pair[player as keyof DefaultScore] === -1) {
                newCombos.pair.possibleScore = this.diceScore(counts, 5)[0] / 5 * 2;
            }
        } else if (values.includes(5) && gameState.gameMode === GameMode.Maxi) {
            newCombos.fiveOfaKind.possibleScore = newCombos.fiveOfaKind[player as keyof DefaultScore] === -1 ? this.diceScore(counts, 5)[0] : 0;
            newCombos.fourOfaKind.possibleScore = newCombos.fourOfaKind[player as keyof DefaultScore] === -1 ? this.diceScore(counts, 5)[0] / 5 * 4 : 0;
            newCombos.threeOfaKind.possibleScore = newCombos.threeOfaKind[player as keyof DefaultScore] === -1 ? this.diceScore(counts, 5)[0] / 5 * 3 : 0;
            if (newCombos.pair[player as keyof DefaultScore] === -1) {
                newCombos.pair.possibleScore = this.diceScore(counts, 5)[0] / 5 * 2;
            }
        } else if (values.includes(4)) {
            newCombos.fourOfaKind.possibleScore = newCombos.fourOfaKind[player as keyof DefaultScore] === -1 ? this.diceScore(counts, 4)[0] : 0;
            newCombos.threeOfaKind.possibleScore = newCombos.threeOfaKind[player as keyof DefaultScore] === -1 ? this.diceScore(counts, 4)[0] / 4 * 3 : 0;
            newCombos.pair.possibleScore = newCombos.pair[player as keyof DefaultScore] === -1 ? this.diceScore(counts, 4)[0] / 2 : 0;
        }
        else if (values.includes(3)) {
            newCombos.threeOfaKind.possibleScore = newCombos.threeOfaKind[player as keyof DefaultScore] === -1 ? this.diceScore(counts, 3)[0] : 0;
            newCombos.pair.possibleScore = newCombos.pair[player as keyof DefaultScore] === -1 ? this.diceScore(counts, 3)[0] / 3 * 2 : 0;
        } else if (values.includes(2)) {
            const best = Math.max(...this.diceScore(counts, 2));
            newCombos.pair.possibleScore = newCombos.pair[player as keyof DefaultScore] === -1 ? best : 0;
        }

        if (values.includes(3) && values.includes(2)) {
            newCombos.fullHouse.possibleScore = newCombos.fullHouse[player as keyof DefaultScore] === -1 ? this.diceScore(counts, 3)[0] + this.diceScore(counts, 2)[0] : 0;
            newCombos.threeOfaKind.possibleScore = newCombos.threeOfaKind[player as keyof DefaultScore] === -1 ? this.diceScore(counts, 3)[0] : 0;
            newCombos.twoPairs.possibleScore = newCombos.twoPairs[player as keyof DefaultScore] === -1 ? this.diceScore(counts, 3)[0] / 3 * 2 + this.diceScore(counts, 2)[0] : 0;
            if (newCombos.pair[player as keyof DefaultScore] === -1) {
                const pair1 = this.diceScore(counts, 3)[0] / 3 * 2;
                newCombos.pair.possibleScore = Math.max(pair1, this.diceScore(counts, 2)[0] || 0);
            }   //kåk 3+3
        } else if (values.includes(4) && values.includes(2)) {
            newCombos.fullHouse3.possibleScore = newCombos.fullHouse3[player as keyof DefaultScore] === -1 ? this.diceScore(counts, 4)[0] + this.diceScore(counts, 2)[0] : 0;
            newCombos.fullHouse.possibleScore = newCombos.fullHouse[player as keyof DefaultScore] === -1 ? this.diceScore(counts, 4)[0] / 4 * 3 + this.diceScore(counts, 2)[0] : 0;
            newCombos.fourOfaKind.possibleScore = newCombos.fourOfaKind[player as keyof DefaultScore] === -1 ? this.diceScore(counts, 4)[0] : 0;
            newCombos.threeOfaKind.possibleScore = newCombos.threeOfaKind[player as keyof DefaultScore] === -1 ? this.diceScore(counts, 4)[0] / 4 * 3 : 0;
            newCombos.twoPairs.possibleScore = newCombos.twoPairs[player as keyof DefaultScore] === -1 ? this.diceScore(counts, 4)[0] / 4 * 2 + this.diceScore(counts, 2)[0] : 0;
            if (newCombos.pair[player as keyof DefaultScore] === -1) {
                const pair1 = this.diceScore(counts, 4)[0] / 4 * 2;
                newCombos.pair.possibleScore = Math.max(pair1, this.diceScore(counts, 2)[0] || 0);
            }
        } else if (values[0] === 3 && values[1] === 3) {
            const three = this.diceScore(counts, 3)[0];
            const bestthree = Math.max(three, this.diceScore(counts, 3)[1]);
            const lowthree = Math.min(this.diceScore(counts, 3)[0], this.diceScore(counts, 3)[1]);
            newCombos.fullHouse2.possibleScore = newCombos.fullHouse2[player as keyof DefaultScore] === -1 ? bestthree + lowthree : 0;
            newCombos.fullHouse.possibleScore = newCombos.fullHouse[player as keyof DefaultScore] === -1 ? bestthree + (lowthree / 3 * 2) : 0;
            newCombos.threeOfaKind.possibleScore = newCombos.threeOfaKind[player as keyof DefaultScore] === -1 ? bestthree : 0;
            newCombos.twoPairs.possibleScore = newCombos.twoPairs[player as keyof DefaultScore] === -1 ? (bestthree / 3 * 2) + (lowthree / 3 * 2) : 0;
            if (newCombos.pair[player as keyof DefaultScore] === -1) {
                newCombos.pair.possibleScore = bestthree / 3 * 2;
            }
        }


        if (values.filter(v => v === 2).length === 3 && newCombos.threePairs[player as keyof DefaultScore] === -1) {
            const res = this.diceScore(counts, 2);
            newCombos.threePairs.possibleScore = res[0] + res[1] + res[2]; // Sum of two pairs      
        }

        // Two Pairs
        if (values.filter(v => v === 2).length >= 2 && newCombos.twoPairs[player as keyof DefaultScore] === -1) {
            const len = values.filter(v => v === 2).length;
            const best = Math.max(...this.diceScore(counts, 2));
            let nextbest = 0;
            this.diceScore(counts, 2).forEach((s) => { if (s < best && s > nextbest) nextbest = s; })

            newCombos.twoPairs.possibleScore = best + nextbest;
        }

        // Small Straight (1-5)
        if (uniqueDice.join('').match(smallRegex) && newCombos.smallStraight[player as keyof DefaultScore] === -1) {
            newCombos.smallStraight.possibleScore = 15; // Small Straight score
        }

        // Large Straight (2-6)
        if (uniqueDice.join('').match(largeRegex) && newCombos.largeStraight[player as keyof DefaultScore] === -1) {
            newCombos.largeStraight.possibleScore = 20;
        }

        // Full Straight (1-6)
        if (uniqueDice.join('') === '123456' && newCombos.fullStraight[player as keyof DefaultScore] === -1) {
            newCombos.fullStraight.possibleScore = 25;
        }

        // Chance (Total value of all dice)
        if (newCombos.chance[player as keyof DefaultScore] === -1) {
            const total = dice.reduce((sum: any, d: any) => sum + d.value, 0);
            newCombos.chance.possibleScore = total;
        }

        if (gameState.gameMode === GameMode.Straight) {
            const round = gameState.playerRound < 6 ? gameState.playerRound + 1 : gameState.playerRound + 3;
            const currentCombo = this.roundToText(round);
            for (const prop in newCombos) {
                if (prop !== currentCombo && newCombos[prop][player as keyof DefaultScore] === -1)
                    newCombos[prop].possibleScore = -1;
            }
        }
        gameState.protocol = newCombos;

        return gameState;
    }
    diceScore(counts: any, val: any) {
        let numbers = [];

        for (const property in counts) {
            if (counts[property] === val) {
                let score = Number(property) * val;
                numbers.push(score);
            }
        }
        return numbers;

    }

    setScore(gameState: GameState, inputId: any, score: any, playerId: any,) {

        let canUndo = false;


        const newcombo = this.numberToText(inputId);

        const player = this.players[playerId - 1];

        gameState.diceList = gameState.diceList.map((d: any) => { d.enabled = false; d.selected = false; return d; });

        if (gameState.playerRound <= gameState.numberOfRounds) {
            gameState.protocol[newcombo][player as keyof DefaultScore] = score;
            gameState.totalScore[player as keyof DefaultScore] += score;
            gameState.yahtzyFest = newcombo === "yahtzee" && score > 0;
        }

        for (const property in gameState.protocol) {
            gameState.protocol[property]['possibleScore'] = -1;
        }
        console.log("gamemode", gameState.gameMode)
        console.log("input id", inputId)
        if (inputId > 0 && inputId < 7) {
            gameState.benchmarkScore[player] = gameState.benchmarkScore[player] + (gameState.gameMode * inputId);
        }

        gameState = this.calculateScores(gameState, playerId, player);


        if (gameState.gameMode === GameMode.Maxi) {
            gameState.savedThrows[player] = (gameState.playerThrows);
                        
            if (gameState.nextPlayer === 1) {
                gameState.playerThrows = gameState.savedThrows["player2"] + 3;
            } else {
                gameState.playerThrows = gameState.savedThrows["player1"] + 3
            }
        } else {
            gameState.playerThrows = 3;
        }

        gameState.nextPlayer = gameState.nextPlayer === 1 ? 2 : 1;


        if (gameState.nextPlayer === 1) {
            gameState.playerRound += 1;
            gameState.gameOver = gameState.playerRound >= gameState.numberOfRounds;
        }

        return gameState;

    }

    calcAndSetBenchmark(comboNumber: any, gameState: any, player: any) {
        const multiplier = 3;
        const score = comboNumber * multiplier;
        return (gameState.benchmarkScore[player as keyof DefaultScore] || 0) + score;
    }

    calculateScores(gameState: any, playerId: any, benchmarkScore: any) {
        const player: any = this.players[playerId - 1];
        let inputs: any = gameState.protocol;

        const topSixSum = [
            inputs.ones[player as keyof DefaultScore],
            inputs.twos[player as keyof DefaultScore],
            inputs.threes[player as keyof DefaultScore],
            inputs.fours[player as keyof DefaultScore],
            inputs.fives[player as keyof DefaultScore],
            inputs.sixes[player as keyof DefaultScore]
        ];

        const inputMap = new Map(Object.entries(gameState.protocol));

        inputs.top[player as keyof DefaultScore] = 0;
        topSixSum.forEach((s) => {
            if (s > 0)
                inputs.top[player as keyof DefaultScore] += s;
        })

        inputMap.delete("top");
        inputMap.delete("total");
        // Calculate bonus (if topSixSum >= 63 or 84, bonus is 50)
        const topIsNotFull = topSixSum.find((i) => i === -1);
        const prevBonus = gameState.protocol.bonus[player as keyof DefaultScore];

        inputs.bonus[player as keyof DefaultScore] = inputs.top[player as keyof DefaultScore] >= gameState.bonusLimit ? gameState.bonusValue : topIsNotFull ? -1 : 0;

        if (prevBonus < inputs.bonus[player as keyof DefaultScore]) {
            inputs.bonus = {
                possibleScore: -1,
                player1: inputs.bonus.player1,
                player2: inputs.bonus.player2,
                player3: inputs.bonus.player3,
                player4: inputs.bonus.player4,
                bonus: player
            }
        }

        let totalScore = 0;

        inputMap.forEach((i: any, ix: any) => {
            if ((ix != 6 && ix != 17) && i[player as keyof DefaultScore] > 0) {
                totalScore += i[player as keyof DefaultScore];
            }
        })

        inputs.total[player as keyof DefaultScore] = totalScore;

        let winningScore = 0;
        let winner = 0;

        this.players.forEach((p, ix) => {
            if (inputs.total[p] > winningScore) {
                winningScore = inputs.total[p];
                winner = ix + 1;
            }
        })

        if (gameState.gameOver) {
            gameState.winner = winner;
            gameState.winningScore = winningScore;
        }

        return gameState;
    }

    textToNumber(combo: any) {
        switch (combo) {
            case 'ones': return 0;
            case 'twos': return 1;
            case 'threes': return 2;
            case 'fours': return 3;
            case 'fives': return 4;
            case 'sixes': return 5;
            case 'pair': return 8;
            case 'twoPairs': return 9;
            case 'threePairs': return 10;
            case 'threeOfaKind': return 11;
            case 'fourOfaKind': return 12;
            case 'fiveOfaKind': return 13;
            case 'smallStraight': return 14;
            case 'largeStraight': return 15;
            case 'fullStraight': return 16;
            case 'fullHouse': return 17;
            case 'fullHouse2': return 18;
            case 'fullHouse3': return 19;
            case 'chance': return 20;
            case 'yahtzee': return 21;
            case 'maxiYahtzee': return 22;
            default: return 0;
        }
    }

    getGameState(numberOfPlayers: number) {
        let defaultScoreObj: any = { player1: 0 };
        switch (numberOfPlayers) {
            case 2:
                defaultScoreObj = { player1: 0, player2: 0 };
                break;
            case 3:
                defaultScoreObj = { player1: 0, player2: 0, player3: 0 };
                break;
            case 4:
                defaultScoreObj = { player1: 0, player2: 0, player3: 0, player4: 0 };
                break;
            default:
                break;
        }
        let gs: GameState = {
            diceList: [
                { id: 1, value: 6, selected: false, enabled: false },
                { id: 2, value: 6, selected: false, enabled: false },
                { id: 3, value: 6, selected: false, enabled: false },
                { id: 4, value: 6, selected: false, enabled: false },
                { id: 5, value: 6, selected: false, enabled: false },
                { id: 6, value: 6, selected: false, enabled: false }
            ],
            bonusValue: 0,
            bonusLimit: 0,
            yassiValue: 0,
            numberOfRounds: 15,
            numberOfPlayers: numberOfPlayers,
            nextPlayer: 1,
            multiplayer: false,
            gameMode: GameMode.Regular,
            waitingPlayerSetScore: false,
            scoreWasSet: false,
            diceAreThrown: false,
            waitingPlayerThrow: true,
            gameOver: false,
            playerThrows: 3,
            playerRound: 0,
            savedThrows: Object.assign({ possibleScore: -1, player1: 0, player2: 0, player3: 0, player4: 0 }, defaultScoreObj),
            canUndo: false,
            newGame: false,
            benchmarkScore: Object.assign({}, defaultScoreObj),
            protocol: this.createProtoCol(),
            roomName: "",
            totalScore: Object.assign({}, defaultScoreObj),
            winner: 0,
            winningScore: 0,
            yahtzyFest: false
        }

        gs.protocol.top.player1 = 0;
        gs.benchmarkScore.possibleScore = 0;

        return gs;
    }

    createProtoCol() {
        return {
            ones: { possibleScore: -1, player1: -1, player2: -1, player3: -1, player4: -1 },
            twos: { possibleScore: -1, player1: -1, player2: -1, player3: -1, player4: -1 },
            threes: { possibleScore: -1, player1: -1, player2: -1, player3: -1, player4: -1 },
            fours: { possibleScore: -1, player1: -1, player2: -1, player3: -1, player4: -1 },
            fives: { possibleScore: -1, player1: -1, player2: -1, player3: -1, player4: -1 },
            sixes: { possibleScore: -1, player1: -1, player2: -1, player3: -1, player4: -1 },
            top: { possibleScore: -1, player1: -1, player2: -1, player3: -1, player4: -1 },
            bonus: { possibleScore: -1, player1: -1, player2: -1, player3: -1, player4: -1 },
            pair: { possibleScore: -1, player1: -1, player2: -1, player3: -1, player4: -1 },
            twoPairs: { possibleScore: -1, player1: -1, player2: -1, player3: -1, player4: -1 },
            threePairs: { possibleScore: -1, player1: -1, player2: -1, player3: -1, player4: -1 },
            threeOfaKind: { possibleScore: -1, player1: -1, player2: -1, player3: -1, player4: -1 },
            fourOfaKind: { possibleScore: -1, player1: -1, player2: -1, player3: -1, player4: -1 },
            fiveOfaKind: { possibleScore: -1, player1: -1, player2: -1, player3: -1, player4: -1 },
            smallStraight: { possibleScore: -1, player1: -1, player2: -1, player3: -1, player4: -1 },
            largeStraight: { possibleScore: -1, player1: -1, player2: -1, player3: -1, player4: -1 },
            fullStraight: { possibleScore: -1, player1: -1, player2: -1, player3: -1, player4: -1 },
            fullHouse: { possibleScore: -1, player1: -1, player2: -1, player3: -1, player4: -1 },
            fullHouse2: { possibleScore: -1, player1: -1, player2: -1, player3: -1, player4: -1 },
            fullHouse3: { possibleScore: -1, player1: -1, player2: -1, player3: -1, player4: -1 },
            yahtzee: { possibleScore: -1, player1: -1, player2: -1, player3: -1, player4: -1 },
            chance: { possibleScore: -1, player1: -1, player2: -1, player3: -1, player4: -1 },
            total: { possibleScore: -1, player1: -1, player2: -1, player3: -1, player4: -1 },
        }
    }

    prepareGameOver(state: GameState) {
        state.gameOver = true;
        const valuesArray = Object.values(state.totalScore); // [4, 0.5, 0.35, 5]
        const maxValue = Math.max(...valuesArray);
        const winners = valuesArray.map((v: number, ix: number) => { return { player: ix + 1, score: v } }).filter((wo) => wo.score === maxValue);
        state.winningScore = maxValue;
        state.winner = winners[0].player;

        return state;
    }

    numberToText(num: any) {

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
                return 'threePairs';
            case 12:
                return 'threeOfaKind';
            case 13:
                return 'fourOfaKind';
            case 14:
                return 'fiveOfaKind';
            case 15:
                return 'smallStraight';
            case 16:
                return 'largeStraight';
            case 17:
                return 'fullStraight';
            case 18:
                return 'fullHouse';
            case 19:
                return 'fullHouse2';
            case 20:
                return 'fullHouse3';
            case 21:
                return 'chance';
            case 22:
                return 'yahtzee';
            default:
                return 'unknown';
        }
    }

    comboName(key: string): any {
        switch (key) {
            case 'ones':
                return { name: "Ettor", id: 1 };
            case 'twos':
                return { name: "Tvåor", id: 2 };
            case 'threes':
                return { name: "Treor", id: 3 };
            case 'fours':
                return { name: "Fyror", id: 4 };
            case 'fives':
                return { name: "Femmor", id: 5 };
            case 'sixes':
                return { name: "Sexor", id: 6 };
            case 'top':
                return { name: "Summa", id: 7 };
            case 'bonus':
                return { name: "Bonus", id: 8 };
            case 'pair':
                return { name: "Par", id: 9 };
            case 'twoPairs':
                return { name: "Två par", id: 10 };
            case 'threePairs':
                return { name: "Tre par", id: 11 };
            case 'threeOfaKind':
                return { name: "Triss", id: 12 };
            case 'fourOfaKind':
                return { name: "Fyrtal", id: 13 };
            case 'fiveOfaKind':
                return { name: "Femtal", id: 14 };
            case 'smallStraight':
                return { name: "Liten stege", id: 15 };
            case 'largeStraight':
                return { name: "Stor stege", id: 16 };
            case 'fullStraight':
                return { name: "Full stege", id: 17 };
            case 'fullHouse':
                return { name: "Kåk", id: 18 };
            case 'fullHouse2':
                return { name: "Hus", id: 19 };
            case 'fullHouse3':
                return { name: "Torn", id: 20 };
            case 'chance':
                return { name: "Schans", id: 21 };
            case 'yahtzee':
                return { name: "Jassi!", id: 22 };
            case 'total':
                return { name: "Summa", id: 23 };
            default:
                return { name: "", id: -1 };
        }
    }

    roundToText(num: any) {

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

    setGameType(gameState:GameState) {
    
      const gameMode = gameState.gameMode;
      gameState.bonusLimit = gameMode === GameMode.Maxi ? 84 : gameMode === GameMode.Straight ? 42 : 63;
      gameState.bonusValue = gameMode === GameMode.Maxi ? 100 : gameMode === GameMode.Straight ? 25 : 50;
      gameState.yassiValue = gameMode === GameMode.Maxi ? 100 : 50;
      gameState.numberOfRounds = gameMode === GameMode.Maxi ? 20 : 15;  
      gameState.benchmarkScore = { possibleScore: -1, player1: 0, player2: 0, player3: 0, player4: 0 };
      
      if(gameMode !== GameMode.Maxi)  
        gameState.diceList = gameState.diceList.slice(0,5);

    return gameState;

  }
}