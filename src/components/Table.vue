<template>
    <router-view>
    </router-view>
</template>

<script>
import { initializeTable } from '../game'
import { shuffleCards } from '../helpers'
import { cases } from '../game-cases'
import { firebase } from '../firebase'
import { createDeck } from '1k'
import * as _ from 'lodash'
import store from '../store'

export default {
    methods: {
        redirectToLobby() {
            this.$router.push({ path: `/${this.roomName}/lobby` })
        },
        redirectToGame() {
            this.$router.push({ path: `/${this.roomName}/table` })
        }
    },
    computed: {
        roomName() {
            return this.$router.currentRoute.params.id
        }
    },
    beforeRouteEnter(to, from, next) {
        console.log('TABLE');
        const roomName = to.params.id;
        const refName = 'rooms/' + roomName;

        firebase.database().ref(refName).once('value').then(snapshot => {
            const room = snapshot.val();
            if (room) {
                watchForRoomChanges()
            } else {
                firebase.database().ref(refName).set({
                    name: roomName
                }, err => {
                    watchForRoomChanges()
                });
            }
        });

        const redirectToLobbyOrGame = _.once(function(room) {
            console.log('TABLE DONE');
            if (room.first && room.second && room.third) {
                next(vm => vm.redirectToGame())
            } else {
                next(vm => vm.redirectToLobby())
            }
        })

        function watchForRoomChanges() {
            const removeWatcher = firebase.database().ref(refName).on('value', (snapshot) => {
                const room = snapshot.val();
                store.commit('updateRoom', room)
                redirectToLobbyOrGame(room)
            })
        }
    }
}
</script>

<style scoped>

</style>
