import Vue from 'vue'
import Router from 'vue-router'
import Table from '@/components/Table'
import Card from '@/components/Card'
import Points from '@/components/Points'
import Bids from '@/components/Bids'
import BidRow from '@/components/BidRow'

Vue.use(Router)

Vue.component('card', Card)
Vue.component('points', Points)
Vue.component('bids', Bids)
Vue.component('bid-row', BidRow)

export default new Router({
    routes: [
        {
            path: '/',
            name: 'Table',
            component: Table
        }
    ]
})
