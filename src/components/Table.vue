<template>
  <div class="table">
    <card 
        :key="card.rank+''+card.suit" 
        v-for="card in cards" 
        :card="card">
    </card>
  </div>
</template>
<script>

import { Position } from "./Position";
import * as _ from "lodash";

export default {
    computed: {
        cards() {
            return this.$store.state.cards;
        }
    },
  created() {
      _.chain([
          { rank: "J", suit: "♥", position: Position.PLAYER_FIRST, shown: true },
          { rank: "Q", suit: "♥", position: Position.TRICK_SECOND, shown: false },
          { rank: "9", suit: "♥", position: Position.TRICK_THIRD, shown: false }
      ])
        .map(card => this.$store.commit('addCard', card))
        .value();
    
    setTimeout(() => {
        this.$store.dispatch('moveCard', {
            card: 'J♥',
            pos: Position.TRICK_FIRST
        });
    }, 6000);
  }
};
</script>

<style scoped>
.table {
    width: 100%;
    height: 100%;
}
</style>
