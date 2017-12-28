import Vue from 'vue'
import * as _ from 'lodash'
import Vuex from 'vuex'
import { findCardByRandAndSuit, getRankAndSuitByPattern } from './helpers'

Vue.use(Vuex)

const state = {
  cards: []
}

const mutations = {
    addCard(state, {rank, suit, position, shown}) {
        state.cards.push({rank, suit, position, shown});
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

        console.log(card.position, ' -> ', targetPosition);
        card.position = targetPosition
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