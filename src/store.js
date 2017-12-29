import Vue from 'vue'
import * as _ from 'lodash'
import Vuex from 'vuex'
import { findCardByRandAndSuit, getRankAndSuitByPattern, getRandomDeg, getTotalCardsInTrick } from './helpers'
import { isTrickPostion } from './components/Position'
import { createAnimationDelay } from './animation'

Vue.use(Vuex)

const state = {
    cards: [],
    animationTimeoutMs: 1300
}

const mutations = {
    addCard(state, {rank, suit, position, shown, deg, zIndex}) {
        state.cards.push({rank, suit, position, shown, deg: deg || 0, zIndex: zIndex || 0});
    },
    toggleVisibility(state, {rank, suit}) {
        const foundCard = findCardByRandAndSuit(state.cards, rank, suit);
        foundCard.shown = !foundCard.shown;
    }
}

const actions = {
    moveCard: ({commit, state}, {card: cardPattern, pos: targetPosition}) => {
        const [rank, suit] = getRankAndSuitByPattern(cardPattern);
        const card = findCardByRandAndSuit(state.cards, rank, suit);

        if(isTrickPostion(targetPosition)) {
            const totalCardsInTrick = getTotalCardsInTrick(state.cards, targetPosition);
            card.deg = getRandomDeg();
            card.zIndex = totalCardsInTrick + 1;
            setTimeout(() => {
                card.shown = true;
            }, createAnimationDelay(90, state.animationTimeoutMs));
        }

        card.position = targetPosition;
        return new Promise((resolve, reject) => {
            setTimeout(resolve, state.animationTimeoutMs);
        });
    },
    toggleVisibility: ({ commit }, card) => {
        commit('toggleVisibility', card)   
    },
    // incrementIfOdd ({ commit, state }) {
    //     if ((state.count + 1) % 2 === 0) {
    //     commit('increment')
    //     }
    // },
    // incrementAsync ({ commit }) {
    //     return new Promise((resolve, reject) => {
    //     setTimeout(() => {
    //         commit('increment')
    //         resolve()
    //     }, 1000)
    //     })
    // }
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
})