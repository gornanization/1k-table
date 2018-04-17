import Vue from 'vue'
import * as _ from 'lodash'
import Vuex from 'vuex'
import { cardToString, findCardByRandAndSuit, getCardsPositionByPlayerId,
    getRankAndSuitByPattern, getTotalCardsInTrick, delayWith } from './helpers'
import { isStockPostion, Position } from './position'
import { createAnimationDelay, MINOR_DELAY } from './animation'
import { performActionsOneByOne, performActionsAllInOne } from './flow';

Vue.use(Vuex);

const state = {
    room: null,
    game: {
        cards: [],
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
    },
    logs: [],
    pointsVisible: false,
    bidsVisible: false,
    animationTimeoutMs: 3000,
    pointsAnimationTimeoutMs: 3000,
    isAnimationPerforming: false
};

const mutations = {
    addCard(state, { rank, suit, position, shown, deg, zIndex }) {
        state.game.cards.push({ rank, suit, position, shown, deg: deg || 0, zIndex: zIndex || 0 })
    },
    markAnimationAsStarted(state) {
        console.log('| starting animation');
        state.isAnimationPerforming = true
    },
    markAnimationAsFinished(state) {
        console.log('| finishing animation');
        state.isAnimationPerforming = false
    },
    updateRoom(state, room) {
        state.room = room
    },
    updateGame(state, game) {
        state.game = game
    },
    addLog(state, text) {
        const logs = state.logs
        const lastLog = _.last(logs)

        state.logs = (lastLog && lastLog.text === text) ? logs : [...logs, { text, timestamp: Date.now() }]
    },
    toggleVisibility(state, { rank, suit }) {
        const foundCard = findCardByRandAndSuit(state.game.cards, rank, suit);
        foundCard.shown = !foundCard.shown;
    },
    changeCardOrder(state, { card: cardPattern, zIndex }) {
        const [rank, suit] = getRankAndSuitByPattern(cardPattern);
        const card = findCardByRandAndSuit(state.game.cards, rank, suit);
        card.zIndex = zIndex;
    },
    hideCard(state, { card: cardPattern }) {
        const [rank, suit] = getRankAndSuitByPattern(cardPattern);
        const card = findCardByRandAndSuit(state.game.cards, rank, suit);
        card.shown = false;
    },
    showCard(state, { card: cardPattern }) {
        const [rank, suit] = getRankAndSuitByPattern(cardPattern);
        const card = findCardByRandAndSuit(state.game.cards, rank, suit);
        card.shown = true;
    },
    positionCard(state, { card: cardPattern, position }) {
        const [rank, suit] = getRankAndSuitByPattern(cardPattern);
        const card = findCardByRandAndSuit(state.game.cards, rank, suit);
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
        state.game.players = players;
    },
    setBids(state, bids) {
        state.game.bid = bids;
    },
    setCards(state, cards = []) {
        state.game.cards = cards;
    }
}

const actions = {
    markAnimationAsStarted: ({ commit }) => {
        commit('markAnimationAsStarted')
    },
    markAnimationAsFinished: ({ commit }) => {
        commit('markAnimationAsFinished')
    },
    hidePoints: ({ commit }) => {
        commit('hidePoints');
        return Promise.resolve();
    },
    showPoints: ({ commit }) => {
        commit('showPoints');
        return Promise.resolve();
    },
    addLog: ({ commit }, log) => {
        commit('addLog', log);
    },
    changeCardsPosition: ({ commit }, cards) => {
        _.each(cards, (card) => commit('positionCard', { card: cardToString(card), position: card.position }));
        return delayWith(state.animationTimeoutMs);
    },
    showBids: ({ commit }) => {
        commit('showBids');
        return Promise.resolve();
    },
    hideBids: ({ commit }) => {
        commit('hideBids');
        return Promise.resolve();
    },
    setPlayers: ({ commit, state }, players) => {
        commit('setPlayers', players);
        return Promise.resolve();
    },
    setBids: ({ commit }, bids) => {
        commit('setBids', [...bids]);
        return Promise.resolve();
    },
    moveCard: ({ commit, state }, { card, pos: targetPosition }) => {
        commit('changeCardOrder', { card, zIndex: 0 });
        commit('positionCard', { card, position: targetPosition });
        return delayWith(state.animationTimeoutMs);
    },
    moveCards: ({ commit, state, getters }, { cards, pos: targetPosition }) => {
        _.chain(cards)
            .map(card => {
                commit('changeCardOrder', { card, zIndex: 0 });
                commit('positionCard', { card, position: targetPosition });
            })
            .value();
        return delayWith(state.animationTimeoutMs);
    },
    moveCardsToDeck: ({ commit, state, getters }) => {
        _.chain(state.game.cards)
            .map(cardToString)
            .map(card => {
                commit('changeCardOrder', { card, zIndex: 0 });
                commit('positionCard', { card, position: Position.DECK });
            })
            .value();
        return delayWith(state.animationTimeoutMs);
    },
    moveCardToTrick: ({ commit, state }, { card, pos: targetPosition }) => {
        commit('changeCardOrder', { card, zIndex: getTotalCardsInTrick(state.game.cards, targetPosition) + 1 });

        setTimeout(() => commit('showCard', { card }), createAnimationDelay(80, state.animationTimeoutMs));
        commit('positionCard', { card, position: targetPosition });

        return delayWith(state.animationTimeoutMs);
    },
    showStockCards({ dispatch, state, getters }) {
        const [firstStockCard, secondStockCard, thirdStockCard] = getters.stockCards;
        return performActionsOneByOne([
            () => dispatch('showCard', cardToString(firstStockCard)),
            () => delayWith(MINOR_DELAY),
            () => dispatch('showCard', cardToString(secondStockCard)),
            () => delayWith(MINOR_DELAY),
            () => dispatch('showCard', cardToString(thirdStockCard))
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
        // const deg = {
        //     [Position.WON_PLAYER_FIRST]: 90,
        //     [Position.WON_PLAYER_SECOND]: -90,
        //     [Position.WON_PLAYER_THIRD]: 0
        // }[targetPosition] + getRandomDeg();

        commit('changeCardOrder', { card, zIndex: 0 });
        setTimeout(() => commit('hideCard', { card }), createAnimationDelay(50, state.animationTimeoutMs));
        commit('positionCard', { card, position: targetPosition });

        return delayWith(state.animationTimeoutMs);
    },
    moveCardsToPlayerWonCard: ({ dispatch }, { cards, pos }) => {
        return performActionsAllInOne([
            ...cards.map(card => () => dispatch('moveCardToPlayerWonCard', { card, pos }))
        ]);
    },
    moveStockToPlayer({dispatch, state}, {players, playerId}) {
        const cards = _.filter(state.game.cards, ({position}) => isStockPostion(position)).map(cardToString);
        const targetPos = getCardsPositionByPlayerId(players, playerId);

        return dispatch('moveCards', { cards, pos: targetPos });
    },
    toggleVisibility: ({ commit }, card) => commit('toggleVisibility', card),
    showCard: ({ commit }, card) => {
        commit('showCard', {card});
        return Promise.resolve();
    },
    togglePointsVisibility: ({ commit, state }) => {
        if (state.pointsVisible) {
            return Promise.reject(new Error());
        }

        commit('togglePointsVisibility');
        return delayWith(state.pointsAnimationTimeoutMs, () => commit('togglePointsVisibility'));
    },
    toggleBidsVisibility: ({ commit }) => commit('toggleBidsVisibility')
};

const getters = {
    cards: state => state.cards,
    logs: state => state.logs,
    isAnimationPerforming: state => state.isAnimationPerforming,
    stockCards: state => _.filter(state.game.cards, ({position}) => isStockPostion(position))
}

export default new Vuex.Store({
    state,
    getters,
    actions,
    mutations
});
