<template>
    <section></section>
</template>

<script>
import YANG from 'yet-another-name-generator'

export default {
    created() {
        const newRoomName = YANG.generate();
        this.$router.push({ path: `/${newRoomName}` })
    }
}
</script>