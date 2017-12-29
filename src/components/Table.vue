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
import { performActionsOneByOne, performActionsAllInOne, delay } from "../flow";

import * as _ from "lodash";

export default {
    computed: {
        cards() {
            return this.$store.state.cards;
        }
    },
  created() {
      _.chain([
          { rank: "J", suit: "♥", position: Position.PLAYER_FIRST, shown: false },
          { rank: "Q", suit: "♥", position: Position.PLAYER_SECOND, shown: false },
          { rank: "9", suit: "♣", position: Position.PLAYER_THIRD, shown: false }
      ])
        .map(card => this.$store.commit('addCard', card))
        .value();
    
    setTimeout(() => {

        performActionsOneByOne([
            () => this.$store.dispatch('moveCard', { card: 'J♥', pos: Position.TRICK_FIRST }),
            () => this.$store.dispatch('moveCard', { card: 'Q♥', pos: Position.TRICK_SECOND }),
            () => this.$store.dispatch('moveCard', { card: '9♣', pos: Position.TRICK_THIRD }),
            () => delay(1000),
            () => performActionsAllInOne([
                () => this.$store.dispatch('moveCard', { card: 'J♥', pos: Position.PLAYER_FIRST }),
                () => this.$store.dispatch('moveCard', { card: 'Q♥', pos: Position.PLAYER_FIRST }),
                () => this.$store.dispatch('moveCard', { card: '9♣', pos: Position.PLAYER_FIRST })
            ])
        ]).then(() => {
            console.log('done');
        });
        
    }, 1);
  }
};
</script>

<style scoped>
.table {
    width: 100%;
    height: 100%;
}
</style>
