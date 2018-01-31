<template>
  <div class="table">
      {{game}}!
      <points></points>
      <bids></bids>
    <card 
        :key="card.rank+''+card.suit" 
        v-for="card in cards" 
        :card="card">
    </card>
  </div>
</template>

<script>
import { initializeTable } from '../game'
import { shuffleCards } from '../helpers'
import { cases } from '../game-cases'
import { firebase } from '../firebase'
import { createDeck } from '1k'
import store from '../store'

export default {
    computed: {
        room() {
            return this.$store.state.room
        },
        game() {
            return this.$store.state.game
        },
        cards() {
            return this.game.cards
        }
    },
    created() {
        const defaultState = {
            settings: {
                permitBombOnBarrel: true,
                maxBombs: 2,
                barrelPointsLimit: 880
            },
            phase: 'REGISTERING_PLAYERS_START',
            players: [],
            deck: [],
            stock: [],
            bid: [],
            cards: {},
            battle: null
        };
        const tableStore = this.$store

        const roomId = this.$router.currentRoute.params.id
        const gameRef = firebase.database().ref(`game/${roomId}`);

        gameRef.once('value', (snapshot) => {
            const game = snapshot.val()
            let loadedState = game ? Object.assign({}, defaultState, game) : undefined

            const thousand = initializeTable(loadedState, tableStore)
            thousand.setCustomShufflingMethod(shuffleCards)
            thousand.init()
            thousand.events.addListener('phaseUpdated', (next) => {
                gameRef.set(thousand.getState())
                next()
            });

            if(!game) {
                console.log('initialising')
                console.log(this.room);
            } else {
                console.log('continuing')
            }
        })
    }
}
</script>

<style scoped>
.table {
    width: 100%;
    height: 100%;
}
</style>
