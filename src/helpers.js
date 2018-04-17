import { isTrickPostion, Position } from './position';
import { Phase, createDeck, defaultState } from '1k';
import * as _ from 'lodash';

export function getRandomDeg() {
    const sign = !!Math.floor(Math.random() * 2);
    const random = Math.ceil(Math.random() * 5);

    return sign ? random : -random;
}

export function findCardByRandAndSuit(cards, rank, suit) {
    return cards.find((card) => rank === card.rank && suit === card.suit);
}

export function getTotalCardsInTrick(cards) {
    return cards.filter(card => isTrickPostion(card.position)).length;
}

export function cardToString({ rank, suit }) {
    return rank + '' + suit;
}

export function getRankAndSuitByPattern(pattern) {
    const CARD_PATTERN_REGEX = /([A|K|Q|J|9]|10)([♥|♦|♣|♠])/;

    const result = CARD_PATTERN_REGEX.exec(pattern);
    const [, rank, suit] = result;
    return [rank, suit];
}

export function isBomb(pointValue) {
    return pointValue === null;
}

export function getTotalBombsByPoints(pointValues) {
    return _.chain(pointValues).filter(isBomb).value().length;
}

export function parseBattlePoints(players) {
    const parsedPoints = _.chain(players)
        .map(player => {
            let total = 0;
            return _.chain(player.battlePoints)
                .map((point, i) => {
                    total = total + point;
                    if (i < player.battlePoints.length - 1) {
                        const diff = player.battlePoints[i + 1];
                        return [i, total, diff]
                    } else {
                        return [i, total, 0];
                    }
                })
                .value()
        })
        .value();
    return _.zip(...parsedPoints);
}

export function getPlayerOrderIndex(players, playerId) {
    const playerOrder = _.map(players, 'id');
    return _.findIndex(playerOrder, _playerId => _playerId === playerId);
}

export function getWonCardsPositionByPlayerId(players, playerId) {
    const wonCardsPositions = [
        Position.WON_PLAYER_FIRST,
        Position.WON_PLAYER_SECOND,
        Position.WON_PLAYER_THIRD
    ];

    return wonCardsPositions[getPlayerOrderIndex(players, playerId)];
}

export function getCardsPositionByPlayerId(players, playerId) {
    const cardsPositions = [
        Position.PLAYER_FIRST,
        Position.PLAYER_SECOND,
        Position.PLAYER_THIRD
    ];

    return cardsPositions[getPlayerOrderIndex(players, playerId)];
}

export function getTrickCardPositionByPlayerId(players, playerId) {
    const cardsPositions = [
        Position.TRICK_FIRST,
        Position.TRICK_SECOND,
        Position.TRICK_THIRD
    ];

    return cardsPositions[getPlayerOrderIndex(players, playerId)];
}

export function parseCardWithPosition(players, playerId, handler) {
    return (card) => {
        const [rank, suit] = getRankAndSuitByPattern(card);
        return {
            rank, suit, position: handler(players, playerId)
        };
    }
}
export function getNextTurn(players, playerId) {
    const playerIndex = _.findIndex(players, ({ id }) => playerId === id);
    const nextPlayerIndex = playerIndex + 1 === players.length ? 0 : playerIndex + 1;

    return players[nextPlayerIndex].id;
}

export function hideCard(card) {
    card.shown = false;
    return card;
}

export function showCard(card) {
    card.shown = true;
    return card;
}

export function tryToPerformAction(actionFn) {
    return () => new Promise(resolve => {
        const intervalInstance = setInterval(() => {
            if (!actionFn()) return;
            clearInterval(intervalInstance);
            resolve();
        }, 100);
    });
}

export function repalceBombCharacterWithString(clonedState) {
    clonedState.players = _.chain(clonedState.players).map(player => {
        player.battlePoints = player.battlePoints.map(a => a === null ? 'null' : a)
        return player;
    }).value();
}

export function replaceBombCharacterWithNull(clonedState) {
    clonedState.players = _.chain(clonedState.players).map(player => {
        player.battlePoints = player.battlePoints.map(a => a === 'null' ? null : a)
        return player;
    }).value()
}

export function redistributeCards(state) {
    let playerCards = [];
    let playerWonCards = [];
    let trickCards = [];
    let deckCards = [];
    let stockCards = [];

    const { players } = state;
    // manage player cards
    if (state.cards) {
        playerCards = _.chain(state.cards)
            .map((cards, playerId) => _.map(cards, parseCardWithPosition(players, playerId, getCardsPositionByPlayerId)))
            .value();
    }
    // deck cards
    deckCards = _.chain(state.deck).map((card) => {
        const [rank, suit] = getRankAndSuitByPattern(card);
        return { suit, rank, position: Position.DECK };
    });

    // stock cards
    const stockPositions = [Position.STOCK_FIRST, Position.STOCK_SECOND, Position.STOCK_THIRD];
    stockCards = _.chain(state.stock)
        .map(getRankAndSuitByPattern)
        .map(([rank, suit], i) => ({ rank, suit, position: stockPositions[i] }))
        .value();

    // battle cards
    if (state.battle) {
        playerWonCards = _.chain(state.battle.wonCards)
            .map((cards, playerId) =>
                _.map(cards, parseCardWithPosition(players, playerId, getWonCardsPositionByPlayerId))
            )
            .value();

        const trickLeadPlayer = state.battle.leadPlayer;
        const trickOrder = [
            trickLeadPlayer,
            getNextTurn(players, trickLeadPlayer),
            getNextTurn(players, getNextTurn(players, trickLeadPlayer))
        ];

        trickCards = _.map(state.battle.trickCards, (cardPattern, index) => {
            const [rank, suit] = getRankAndSuitByPattern(cardPattern);
            return { rank, suit, position: getTrickCardPositionByPlayerId(players, trickOrder[index]) }
        });
    }

    playerCards = _.chain(playerCards).flatten().map(hideCard).value();
    playerWonCards = _.chain(playerWonCards).flatten().map(hideCard).value();
    trickCards = _.chain(trickCards).map(showCard).value();
    stockCards = _.chain(stockCards).compact().map(hideCard).value();

    const cards = [...deckCards, ...stockCards, ...trickCards, ...playerCards, ...playerWonCards];
    if (cards.length === 0) {
        return _.chain(createDeck())
            .map((card) => {
                const [rank, suit] = getRankAndSuitByPattern(card);
                return { suit, rank, position: Position.DECK };
            })
            .value();
    }
    return cards;
}

export function updateStoreByInitState(initState, store) {
    // set cardss
    _.each(redistributeCards(initState), card => store.commit('addCard', card));
    // set players
    store.dispatch('setPlayers', initState.players);
    // set bids
    store.dispatch('setBids', initState.bid);

    const phaseHandlers = {
        [Phase.REGISTERING_PLAYERS_IN_PROGRESS]() {
            store.commit('showPoints');
        }
    };

    phaseHandlers[initState.phase] && phaseHandlers[initState.phase]();
}

export function delayWith(timeout, action = () => { }) {
    return new Promise(resolve => setTimeout(() => {
        action();
        resolve();
    }, timeout));
}

export function shuffleCards(cards, cb) {
    fetch('/random/sequences/?min=0&max=23&col=1&format=plain&rnd=new#/')
        .then(response => response.text())
        .then(text => {
            const shuffledCards = _.chain(text)
                    .split(/\s/)
                    .compact()
                    .map(index => cards[index])
                    .value()
            cb(shuffledCards);
        })
        .catch(() => cb(cards));
}

export function noop() { }
