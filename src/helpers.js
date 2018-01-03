import { isTrickPostion, Position } from './components/Position';
import * as _ from 'lodash';

export function getRandomDeg() {
    const sign = !!Math.floor(Math.random() * 2);
    const random =  Math.ceil(Math.random() * 5);

    return sign ? random : -random;
}

export function findCardByRandAndSuit(cards, rank, suit) {
    return cards.find((card) => rank === card.rank && suit === card.suit);
}

export function getTotalCardsInTrick(cards) {
    return cards.filter(card => isTrickPostion(card.position)).length;
}

export function getRankAndSuitByPattern(pattern) {
    const CARD_PATTERN_REGEX = /([A|K|Q|J|9]|10)([♥|♦|♣|♠])/;

    const result = CARD_PATTERN_REGEX.exec(pattern);
    const [, rank, suit] = result;
    return [rank, suit];
}

export function isBomb(pointValue) {
    return null === pointValue;
}

export function getTotalBombsByPoints(pointValues) {
    return _.chain(pointValues).filter(isBomb).value().length;
}

export function parseBattlePoints(battlePoints) {
    const parsedPoints = _.chain(battlePoints)
                .values()
                .map(playerPoints => {
                    let total = 0;
                    return _.chain(playerPoints)
                        .map((point, i) => {
                            total = total + point;
                            if(i < playerPoints.length - 1) {
                                const diff = playerPoints[i+1];
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
        Position.WON_PLAYER_THIRD,
    ];

    return wonCardsPositions[getPlayerOrderIndex(players, playerId)];
}

export function getCardsPositionByPlayerId(players, playerId) {
    const cardsPositions = [
        Position.PLAYER_FIRST,
        Position.PLAYER_SECOND,
        Position.PLAYER_THIRD,
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
    return ({rank, suit}) => {
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

export function redistributeCards(state) {

    let playerCards = [];
    let playerWonCards = [];
    let trickCards = [];
    let deckCards = [];
    let stockCards = [];

    const { players } = state;

    //manage player cards
    if(state.cards) {
        playerCards = _.chain(state.cards)
            .map((cards, playerId) => 
                _.map(cards, parseCardWithPosition(players, playerId, getCardsPositionByPlayerId))
            )
            .value();
    }

    //deck cards
    deckCards = _.chain(state.deck).map(({suit, rank}) => ({ suit, rank, position: Position.DECK }));

    //stock cards
    stockCards = [
        state.stock[0] && { ...state.stock[0], position: Position.STOCK_FIRST },
        state.stock[1] && { ...state.stock[1], position: Position.STOCK_SECOND },
        state.stock[2] && { ...state.stock[2], position: Position.STOCK_THIRD },
    ];
    
    if(state.battle) {
        playerWonCards = _.chain(state.battle.wonCards)
            .map((cards, playerId) => 
                _.map(cards, parseCardWithPosition(players, playerId, getWonCardsPositionByPlayerId))
            )
            .value();

        const trickLeadPlayer = state.battle.leadPlayer;
        const trickOrder = [
            trickLeadPlayer,
            getNextTurn(players, trickLeadPlayer),
            getNextTurn(players, getNextTurn(players, trickLeadPlayer)),
        ];

        trickCards = _.map(state.battle.trickCards, ({rank, suit}, index) => {
            return {rank, suit, position: getTrickCardPositionByPlayerId(players, trickOrder[index])}
        });
    }

    playerCards = _.chain(playerCards).flatten().map(hideCard).value();
    playerWonCards = _.chain(playerWonCards).flatten().map(hideCard).value();
    trickCards = _.chain(trickCards).map(showCard).value();
    stockCards = _.chain(stockCards).compact().map(hideCard).value();
    
    return [...deckCards, ...stockCards, ...trickCards, ...playerCards, ...playerWonCards];
}