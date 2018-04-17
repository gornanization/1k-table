<template>
    <section class="lobby">
        <strong class="lobby__name">{{room.name}}</strong>
        <strong class="lobby__state">
            <span v-if="players.length === 0">waiting for players...</span>
            <span v-if="players.length !== 0">{{players.join(', ')}} joined</span>
        </strong>
    </section>
</template>

<script>
import { mapActions } from 'vuex'
import * as _ from 'lodash'

export default {
    name: 'Lobby',
    computed: {
        room() {
            return this.$store.state.room
        },
        players() {
            return _.compact([ this.room.first, this.room.second, this.room.third ])
        }
    },
    created() {
        const roomId = this.$router.currentRoute.params.id;

        const removeWatcher = this.$store.subscribe(() => {
            const room = this.room;
            if (room.first && room.second && room.third) {
                removeWatcher();
                this.$router.push({ path: `/${roomId}/table` })
            }
        })
    },
    methods: {
        ...mapActions([])
    }
}
</script>

<style lang="scss">
.lobby {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    &__state,
    &__name {
        color: white;
    }

    &__state {
        font-size: 2vw;
    }

    &__name {
        font-size: 7vw;
    }
}
</style>