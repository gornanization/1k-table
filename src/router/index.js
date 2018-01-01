import Vue from 'vue'
import Router from 'vue-router'
import Table from '@/components/Table'
import Card from '@/components/Card'
import Points from '@/components/Points'

Vue.use(Router)
Vue.component('card', Card);
Vue.component('points', Points);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Table',
      component: Table
    }
  ]
});
