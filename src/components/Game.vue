<template>
    <div class="table">
        <logs></logs>
        <points></points>
        <bids></bids>
        <card :key="card.rank+''+card.suit" v-for="card in cards" :card="card">
        </card>
    </div>
</template>

<script>
import { initializeTable } from '../game'
import { tryToPerformAction, replaceBombCharacterWithNull, repalceBombCharacterWithString } from '../helpers'
import { firebase } from '../firebase'
import { extendStateWithDefaults, Phase } from '1k'
import { performActionsOneByOne } from '../flow'
import * as _ from 'lodash';

export default {
    computed: {
        store() {
            return this.$store
        },
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
    data() {
        return {
            gameRef: null,
            gameInstance: null
        }
    },
    methods: {
        setupDebugHelpers() {
            window.Phase = Phase;
            window.update = this.sendNewGameSate.bind(this)
            window.getState = () => JSON.stringify(this.gameInstance.getState())
        },
        sendNewGameSate(state) {
            const clonedState = _.cloneDeep(state)
            repalceBombCharacterWithString(clonedState);

            this.gameRef.set(clonedState)
        },
        onActionReceived(type, args) {
            console.log('performing', type, args);

            if (this.store.getters.isAnimationPerforming) {
                return console.log('animation in progress')
            } else {
                const gameInstance = this.gameInstance;
                const result = gameInstance[type].apply(gameInstance, args);
                console.log('performed', type, args, result);
            }
        }
    },
    created() {
        this.setupDebugHelpers()

        // const roomId = this.$router.currentRoute.params.id
        console.log('room:', this.room.name)
        this.gameRef = firebase.database().ref(`game/${this.room.name}`)
        const actionsRef = firebase.database().ref(`actions/${this.room.name}`)

        this.gameRef.once('value', (snapshot) => {
            const receivedState = snapshot.val();

            let loadedState = extendStateWithDefaults(receivedState)

            if (loadedState) {
                console.log('loadedState:')
                console.log(loadedState)
                replaceBombCharacterWithNull(loadedState)
            }

            this.gameInstance = initializeTable(loadedState, this.store)
            this.gameInstance.init()

            this.gameInstance.events.addListener('phaseUpdated', () => {
                const state = this.gameInstance.getState();
                console.log('phaseUpdated:', state)
                this.sendNewGameSate(state)
            })

            actionsRef.on('child_added', (_data) => {
                const { type, args } = _data.val();
                _data.ref.remove();

                if (type && args && this.gameInstance[type]) {
                    this.onActionReceived(type, args)
                }
            });

            if (!receivedState) {
                console.log('initializing new game...')
                const { first, second, third } = this.room
                performActionsOneByOne([
                    tryToPerformAction(() => this.gameInstance.registerPlayer(first)),
                    tryToPerformAction(() => this.gameInstance.registerPlayer(second)),
                    tryToPerformAction(() => this.gameInstance.registerPlayer(third))
                ])
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
