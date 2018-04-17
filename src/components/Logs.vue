<template>
    <ul class="logs">
        <li :key="log.timestamp" v-for="log in logs">
            {{log.text}}
        </li>
    </ul>
</template>

<script>
import { mapActions } from 'vuex';
import * as _ from 'lodash';

const NUMBER_OF_LOGS_TO_BE_PRINTED = 7

export default {
    name: 'Logs',
    computed: {
        logs() {
            return _.chain(this.state.logs).slice(-NUMBER_OF_LOGS_TO_BE_PRINTED).value()
        },
        state() {
            return this.$store.state
        }
    }
}
</script>

<style lang="scss">
.logs {
    color: #fff;
    list-style: none;
    padding: 1vw;
    position: absolute;
    z-index: 1;
}
</style>