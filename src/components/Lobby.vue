<template>
  <div class="lobby">
      {{room.name}}
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import * as _ from 'lodash'
import { firebase } from '../firebase';
import store from '../store'

export default {
    name: 'Lobby',
    beforeRouteEnter (to, from, next) {
        console.log('lobby')
        const room = store.state.room;
        next();
        // if(room.ready) {
        //     next({ path: '/' + room.name + '/table' });
        // } else {
        //     next();
        // }
        
    },
    computed: {
        room() {
            return this.$store.state.room
        }
    },
    created() {
        const roomId = this.$router.currentRoute.params.id;

        const removeWatcher = this.$store.subscribe(() => {
            if(this.room.ready) {
                removeWatcher();
                this.$router.push({ path: `/${roomId}/table` })
            }
        });
    },
    methods: {
        ...mapActions([])
    }
}
</script>

<style lang="scss">


</style>