import Vue from 'vue'
import * as _ from 'lodash'
import Vuex from 'vuex'
import { cardToString, findCardByRandAndSuit, getCardsPositionByPlayerId,
    getRankAndSuitByPattern, getRandomDeg, getTotalCardsInTrick } from './helpers'
import { isTrickPostion, isStockPostion, Position } from './components/Position'
import { createAnimationDelay, MINOR_DELAY } from './animation'
import { performActionsOneByOne, performActionsAllInOne, delay } from "./flow";

Vue.use(Vuex);

const state = {
    pointsVisible: false,
    bidsVisible: false,
    cards: [],
    animationTimeoutMs: 1000,
    pointsAnimationTimeoutMs: 3000,
    players: {
        adam: [0, -220, null, 120],
        alan: [0, 100, 60, 10],
        pic: [0, 80, 60, 10]
    },
    bid: [
        { player: 'adam', bid: 0, pass: true },
        { player: 'pic', bid: 0, pass: true },
        { player: 'alan', bid: 110, pass: false },
        { player: 'adam', bid: 100, pass: false }
   ]
}

const mutations = {
    addCard(state, { rank, suit, position, shown, deg, zIndex }) {
        state.cards.push({ rank, suit, position, shown, deg: deg || 0, zIndex: zIndex || 0 });
    },
    toggleVisibility(state, { rank, suit }) {
        const foundCard = findCardByRandAndSuit(state.cards, rank, suit);
        foundCard.shown = !foundCard.shown;
    },
    rotateCard(state, { card: cardPattern, deg }) {
        const [rank, suit] = getRankAndSuitByPattern(cardPattern);
        const card = findCardByRandAndSuit(state.cards, rank, suit);
        card.deg = deg;
    },
    changeCardOrder(state, { card: cardPattern, zIndex }) {
        const [rank, suit] = getRankAndSuitByPattern(cardPattern);
        const card = findCardByRandAndSuit(state.cards, rank, suit);
        card.zIndex = zIndex;
    },
    hideCard(state, { card: cardPattern }) {
        const [rank, suit] = getRankAndSuitByPattern(cardPattern);
        const card = findCardByRandAndSuit(state.cards, rank, suit);
        card.shown = false;
    },
    showCard(state, { card: cardPattern }) {
        const [rank, suit] = getRankAndSuitByPattern(cardPattern);
        const card = findCardByRandAndSuit(state.cards, rank, suit);
        card.shown = true;
    },
    positionCard(state, { card: cardPattern, position }) {
        const [rank, suit] = getRankAndSuitByPattern(cardPattern);
        const card = findCardByRandAndSuit(state.cards, rank, suit);
        card.position = position;
    },
    togglePointsVisibility(state) {
        state.pointsVisible = !state.pointsVisible;
    },
    showPoints(state) {
        state.pointsVisible = true;
    },
    hidePoints(state) {
        state.pointsVisible = false;
    },
    toggleBidsVisibility(state) {
        state.bidsVisible = !state.bidsVisible;
    },
    showBids(state) {
        state.bidsVisible = true;
    },
    hideBids(state) {
        state.bidsVisible = false;
    },
    setPlayers(state, players) {
        state.players = players;
    },
    setBids(state, bids) {
        state.bid = bids;
    }
}

const actions = {
    hideCards: ({ commit, state }, cards) => {
        _.chain(cards)
            .map(card => {
                commit('hideCard', { card });
            })
            .value()
    },
    setPlayers: ({ commit, state }, players) => {
        const parsedPlayers = _.reduce(players, (players, player) => {
            players[player.id] = player.battlePoints;
            return players;
        }, {});
        
        commit('setPlayers', parsedPlayers);
    },
    setBids: ({ commit }, bids) => {
        commit('setBids', [...bids]);
    },
    moveCardToTrick: ({ commit, state }, { card, pos: targetPosition }) => {
        commit('rotateCard', { card, deg: getRandomDeg() });
        commit('changeCardOrder', { card, zIndex: getTotalCardsInTrick(state.cards, targetPosition) + 1 });

        setTimeout(() => commit('showCard', { card }), createAnimationDelay(80, state.animationTimeoutMs));
        commit('positionCard', { card, position: targetPosition });
        
        return new Promise(resolve => setTimeout(resolve, state.animationTimeoutMs));
    },
    moveCard: ({ commit, state }, { card, pos: targetPosition }) => {
        commit('rotateCard', { card, deg: 0 });
        commit('changeCardOrder', { card, zIndex: 0 });
        commit('positionCard', { card, position: targetPosition });
        
        return new Promise(resolve => setTimeout(resolve, state.animationTimeoutMs));
    },
    moveCards: ({ commit, state }, { cards, pos: targetPosition }) => {
        
        _.chain(cards)
            .map(card => {
                commit('rotateCard', { card, deg: 0 });
                commit('changeCardOrder', { card, zIndex: 0 });
                commit('positionCard', { card, position: targetPosition });
            })
            .value();
        
        return new Promise(resolve => setTimeout(resolve, state.animationTimeoutMs));
    },
    showStockCards({ dispatch, state }) {
        const cards = _.filter(state.cards, ({position}) => isStockPostion(position));
        const [firstStockCard, secondStockCard, thirdStockCard] = cards;
        return performActionsOneByOne([
            () => dispatch('showCard', cardToString(firstStockCard)),
            () => delay(MINOR_DELAY),
            () => dispatch('showCard', cardToString(secondStockCard)),
            () => delay(MINOR_DELAY),
            () => dispatch('showCard', cardToString(thirdStockCard)),
        ]);
    },
    moveCardsToStock({ dispatch, state }, [firstStockCard, secondStockCard, thirdStockCard]) {
        return performActionsAllInOne([
            () => dispatch('moveCards', {
                cards: [firstStockCard], pos: Position.STOCK_FIRST
            }),
            () => dispatch('moveCards', {
                cards: [secondStockCard], pos: Position.STOCK_SECOND
            }),
            () => dispatch('moveCards', {
                cards: [thirdStockCard], pos: Position.STOCK_THIRD
            })
        ]);
    },
    moveCardToPlayerWonCard: ({ commit, state }, { card, pos: targetPosition }) => {
        const deg = {
            [Position.WON_PLAYER_FIRST]: 90,
            [Position.WON_PLAYER_SECOND]: -90,
            [Position.WON_PLAYER_THIRD]: 0,
        }[targetPosition] + getRandomDeg();

        commit('rotateCard', { card, deg });
        commit('changeCardOrder', { card, zIndex: 0 });
        
        setTimeout(() => commit('hideCard', { card }), createAnimationDelay(50, state.animationTimeoutMs));
        commit('positionCard', { card, position: targetPosition });

        return new Promise(resolve => setTimeout(resolve, state.animationTimeoutMs));
    },
    moveCardsToPlayerWonCard: ({ dispatch , state }, { cards, pos }) => {
        return performActionsAllInOne([
            ...cards.map(card => () => dispatch('moveCardToPlayerWonCard', { card, pos }))
        ]);
    },
    moveStockToPlayer({dispatch, state}, {players, playerId}) {
        const cards = _.filter(state.cards, ({position}) => isStockPostion(position)).map(cardToString);
        
        const targetPos = getCardsPositionByPlayerId(players, playerId);

        return dispatch('moveCards', { cards, pos: targetPos });
    },
    toggleVisibility: ({ commit }, card) => commit('toggleVisibility', card),
    showCard: ({ commit }, card) => {
        commit('showCard', {card});
        return Promise.resolve();   
    },
    togglePointsVisibility: ({ commit, state }) => {
        if(state.pointsVisible) {
            return Promise.reject();
        }

        commit('togglePointsVisibility');
        return delayWith(state.pointsAnimationTimeoutMs, () => commit('togglePointsVisibility'));
    },
    toggleBidsVisibility: ({ commit }) => commit('toggleBidsVisibility')
};

function delayWith(timeout, action = () => {}) {
    return new Promise(resolve => setTimeout(() => {
        action();
        resolve();   
    }, timeout));
}

// getters are functions
const getters = {
    //   evenOrOdd: state => state.count % 2 === 0 ? 'even' : 'odd'
}

// A Vuex instance is created by combining the state, mutations, actions,
// and getters.
export default new Vuex.Store({
    state,
    getters,
    actions,
    mutations
});
