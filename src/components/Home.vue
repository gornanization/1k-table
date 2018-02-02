<template>
    <section></section>
</template>

<script>
import { mapActions } from 'vuex'
import * as _ from 'lodash'
import { firebase } from '../firebase';
import store from '../store'
import YANG from 'yet-another-name-generator'

export default {
    created() {
        const newRoomName = YANG.generate();
        this.$router.push({ path: `/${newRoomName}` })
    }
}
</script>