<template>
    <tr class="bids__row">
        <td class="bids__row__name">{{ bid.player }}</td>
        <td class="bids__row__bid">
            <span v-if=" bid.pass">pass</span>
            <span v-if="!bid.pass">{{ bid.bid }}</span>
        </td>
    </tr>
</template>

<script>
export default {
    props: ['bid']
}
</script>

<style lang="scss">

.bids__row {
    &__name, &__bid {
        padding: 0 0.5vw;
    }

    &__name {
        color: #ccc;
        text-align: right;
    }
}

</style>