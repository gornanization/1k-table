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
import { shuffleCards } from '../helpers';
import { cases } from '../game-cases';
import { createDeck } from '1k';

export default {
    computed: {
        cards() {
            return this.$store.state.cards;
        }
    },
    created() {
        const tableStore = this.$store;

        shuffleCards(createDeck(), cards => console.log(cards));

        reproduceGameCase(cases.TRICK_IN_PROGRESS_3_CARDS_LAST_TRICK);

        function reproduceGameCase(gameCase) {
            const thousand = initializeTable(gameCase.state, tableStore);

            thousand.setCustomShufflingMethod(shuffleCards);
            thousand.init();

            gameCase.actions(thousand);
        }
    }
};
</script>

<style scoped>
.table {
    width: 100%;
    height: 100%;
}
</style>
