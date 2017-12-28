import Vue from 'vue'
import Router from 'vue-router'
import Table from '@/components/Table'
import Card from '@/components/Card'

Vue.use(Router)
Vue.component('card', Card)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Table',
      component: Table
    }
  ]
})
