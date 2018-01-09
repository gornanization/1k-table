<template>
  <div class="table">
      <points></points>
      <bids></bids>
    <card 
        :key="card.rank+''+card.suit" 
        v-for="card in cards" 
        :card="card">
    </card>
  </div>
</template>
<script>

import { initializeTable } from '../game';
import { cases } from '../game-cases';
import * as _ from "lodash";

export default {
    computed: {
        cards() {
            return this.$store.state.cards;
        }
    },
  created() {
    const tableStore = this.$store;

    function reproduceGameCase(gameCase) {
        const thousand = initializeTable(gameCase.state, tableStore);
        gameCase.actions(thousand);
    }

    reproduceGameCase(cases.TRICK_IN_PROGRESS_3_CARDS_LAST_TRICK);
    // reproduceGameCase(cases.TRICK_START);
  }
};
</script>

<style scoped>
.table {
    width: 100%;
    height: 100%;
}
</style>
