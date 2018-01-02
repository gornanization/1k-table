<template>
    <div
        class="bids"
        :class="[{'hidden': !$store.state.bidsVisible }]">
        <table>
          <bid-row
              v-for="bid in bids" :bid="bid"
              :key="bid.player+bid.bid">
          </bid-row>
      </table>
    </div>
</template>

<script>
    import * as _ from 'lodash';
    const TOTAL_BIDS_DISPLAYED = 5;

    export default {
        computed: {
            bids() {
                return _.chain(this.$store.state.bid)
                        .slice(0, TOTAL_BIDS_DISPLAYED)
                        .reverse()
                        .value();
            }
        }
    }
</script>

<style lang="scss">
@import "../helpers";
.bids {
    @extend .board-table;
}
</style>

