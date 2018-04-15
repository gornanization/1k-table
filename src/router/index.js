import Vue from 'vue'
import Router from 'vue-router'
import Table from '@/components/Table'
import Card from '@/components/Card'
import Points from '@/components/Points'
import Bids from '@/components/Bids'
import BidRow from '@/components/BidRow'
import Lobby from '@/components/Lobby'
import Game from '@/components/Game'
import Home from '@/components/Home'
import Logs from '@/components/Logs'

Vue.use(Router)

Vue.component('card', Card)
Vue.component('game', Game)
Vue.component('points', Points)
Vue.component('bids', Bids)
Vue.component('bid-row', BidRow)
Vue.component('lobby', Lobby)
Vue.component('home', Home)
Vue.component('logs', Logs)

export default new Router({
    routes: [
        {
            path: '/:id',
            component: Table,
            children: [
                { path: 'lobby', component: Lobby },
                { path: 'table', component: Game }
            ]
        },
        {
            path: '/',
            name: '',
            component: Home
        }
    ]
})
