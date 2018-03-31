<template>
    <div class="table">
        <points></points>
        <bids></bids>
        <card :key="card.rank+''+card.suit" v-for="card in cards" :card="card">
        </card>
    </div>
</template>

<script>
import { initializeTable } from '../game'
import { shuffleCards } from '../helpers'
import { cases } from '../game-cases'
import { firebase } from '../firebase'
import { createDeck, defaultState } from '1k'
import store from '../store'
import { performActionsOneByOne } from '../flow'
import { tryToPerformAction } from '../helpers'
import * as _ from 'lodash';

function extendStateWithDefaults(game) {
    let loadedState = game ? Object.assign({}, defaultState, game) : undefined
            
            if(loadedState && loadedState.battle) {
                const battle = loadedState.battle;

                battle.trickCards = battle.trickCards || [];
                battle.trumpAnnouncements = battle.trumpAnnouncements || [];
                battle.wonCards = battle.wonCards || {};
                _.each(loadedState.players, (player) => {
                    if(!player.battlePoints) {
                        player.battlePoints = [];
                    }
                    if(!battle.wonCards[player.id]) {
                        battle.wonCards[player.id] = [];
                    }
                });
            }
    return loadedState;            
}

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
        }
        const tableStore = this.$store

        const roomId = this.$router.currentRoute.params.id
        const gameRef = firebase.database().ref(`game/${roomId}`)
        const actionsRef = firebase.database().ref(`actions/${roomId}`)
        
        gameRef.once('value', (snapshot) => {
            const game = snapshot.val();

            let loadedState = extendStateWithDefaults(game)
            
            console.log('loadedState:')
            console.log(loadedState)

            const thousand = initializeTable(loadedState, tableStore)
            thousand.setCustomShufflingMethod(shuffleCards)
            thousand.init()

            thousand.events.addListener('phaseUpdated', () => {
                console.log('phaseUpdated:')
                console.log(thousand.getState())
                gameRef.set(thousand.getState())
            })

            actionsRef.on('child_added', function(_data) {
                const { type, args } = _data.val();
                _data.ref.remove();
                if(type && args && thousand[type]) {
                    const result = thousand[type].apply(thousand, args);
                    console.log(type, args, result);
                }
            });

            if (!game) {
                console.log('initialising')
                const { first, second, third } = this.room

                performActionsOneByOne([
                    tryToPerformAction(() => thousand.registerPlayer(first)),
                    tryToPerformAction(() => thousand.registerPlayer(second)),
                    tryToPerformAction(() => thousand.registerPlayer(third))
                ])
            } else {
                console.log('continuing')
                console.log(thousand.getState())
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
