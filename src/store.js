import Vue from 'vue'
import * as _ from 'lodash'
import Vuex from 'vuex'
import { findCardByRandAndSuit, getRankAndSuitByPattern, getRandomDeg, getTotalCardsInTrick } from './helpers'
import { isTrickPostion, Position } from './components/Position'
import { createAnimationDelay } from './animation'
import { performActionsOneByOne, performActionsAllInOne, delay } from "./flow";

Vue.use(Vuex);

const state = {
    pointsVisible: false,
    bidsVisible: false,
    cards: [],
    animationTimeoutMs: 1000,
    pointsAnimationTimeoutMs: 3000,
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
    toggleBidsVisibility(state) {
        state.bidsVisible = !state.bidsVisible;
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
    
    toggleVisibility: ({ commit }, card) => commit('toggleVisibility', card),
    showCard: ({ commit }, card) => commit('showCard', {card}),
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
