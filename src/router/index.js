import Vue from 'vue'
import Router from 'vue-router'
import Table from '@/components/Table'
import Card from '@/components/Card'
import Points from '@/components/Points'
import Bids from '@/components/Bids'
import BidRow from '@/components/BidRow'
import Lobby from '@/components/Lobby'
import { firebase } from '../firebase'
import store from '../store'
import * as _ from 'lodash'
import YANG from 'yet-another-name-generator'

Vue.use(Router)

Vue.component('card', Card)
Vue.component('points', Points)
Vue.component('bids', Bids)
Vue.component('bid-row', BidRow)
Vue.component('lobby', Lobby)


export default new Router({
    routes: [
        {
            path: '/:id',
            component: {
                methods: {
                    redirectToLobby() {
                        this.$router.push({ path: `/${this.roomName}/lobby` })
                    }
                },
                computed: {
                    roomName() {
                        return this.$router.currentRoute.params.id
                    }
                },
                beforeRouteEnter (to, from, next) {
                    const roomName = to.params.id;
                    console.log('/' + roomName)

                    const refName = 'rooms/' + roomName;
                    firebase.database().ref(refName).once('value').then(snapshot => {
                        const room = snapshot.val();
                        if(room) {
                            watch()
                        } else {
                            firebase.database().ref(refName).set({
                                name: roomName
                            }, err => {
                                watch()
                            });
                        }
                    });
            
                    function watch() {
                        let isInitial = true;
                        const removeWatcher = firebase.database().ref(refName).on('value', (snapshot) => {
                            store.commit('updateRoom', snapshot.val())
                            if(isInitial) {
                                isInitial = false
                                next(vm => vm.redirectToLobby());
                            }
                        })
                    }
                },
                template: '<div>{{roomName}}<router-view></router-view></div>'
            },
            children: [
                {
                    path: 'lobby',
                    component: Lobby
                },
                {
                    path: 'table',
                    component: Table
                }
            ]
        },
        {
            path: '/',
            name: '',
            component: {
                template: '<div></div>',
                created() {
                    const newRoomName = YANG.generate();
                    this.$router.push({ path: `/${newRoomName}` })
                }
            }
        }
        // {
        //     path: '/lobby/:id',
        //     name: 'Lobby',
        //     component: Lobby
        // }
    ]
})
