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
    //   _.chain([
    //       { rank: "J", suit: "♥", position: Position.PLAYER_FIRST, shown: false },
    //       { rank: "Q", suit: "♥", position: Position.PLAYER_SECOND, shown: false },
    //       { rank: "9", suit: "♣", position: Position.PLAYER_THIRD, shown: false }
    //   ])
    //     .map(card => this.$store.commit('addCard', card))
    //     .value();

    _.chain([
          { rank: "J", suit: "♥", position: Position.TRICK_FIRST, shown: false },
          { rank: "Q", suit: "♥", position: Position.TRICK_SECOND, shown: false },
          { rank: "9", suit: "♣", position: Position.TRICK_THIRD, shown: false }
      ])
        .map(card => this.$store.commit('addCard', card))
        .value();


    
const MINOR_DELAY = 600; 
    const store = this.$store;

    //moving cards to stock
    function moveCardsToStock() {
        return performActionsAllInOne([
                () => store.dispatch('moveCard', { card: 'J♥', pos: Position.STOCK_FIRST }),
                () => store.dispatch('moveCard', { card: 'Q♥', pos: Position.STOCK_SECOND }),
                () => store.dispatch('moveCard', { card: '9♣', pos: Position.STOCK_THIRD })
        ]);
    }
    //showing stock cards
    function showStockCards() {
        return performActionsOneByOne([
            () => store.dispatch('showCard', 'J♥'),
            () => delay(MINOR_DELAY),
            () => store.dispatch('showCard', 'Q♥'),
            () => delay(MINOR_DELAY),
            () => store.dispatch('showCard', '9♣'),
        ])
    }
    //moving cards to bid winner
    function moveStockCardsToWinner() {
        store.dispatch('moveCards', { cards: ['J♥', 'Q♥', '9♣'], pos: Position.PLAYER_FIRST});
    }
        // moveCardsToStock();
        // store.dispatch('togglePointsVisibility')

    setTimeout(() => {
        store.dispatch('toggleBidsVisibility');
    });

    // setTimeout(() => {
    //     performActionsOneByOne([
    //         moveCardsToStock,
    //         showStockCards,
    //         () => delay(MINOR_DELAY * 2),
    //         moveStockCardsToWinner
    //     ]);
    // });

    
    //let i =0; setInterval(() => console.log(++i), 1000);

    // setTimeout(() => {
    //     performActionsOneByOne([
    //         () => this.$store.dispatch('moveCardToTrick', { card: 'J♥', pos: Position.TRICK_FIRST }),
    //         () => this.$store.dispatch('moveCardToTrick', { card: 'Q♥', pos: Position.TRICK_SECOND }),
    //         () => this.$store.dispatch('moveCardToTrick', { card: '9♣', pos: Position.TRICK_THIRD }),
    //         () => delay(1300),
    //         () => performActionsAllInOne([
    //             () => this.$store.dispatch('moveCardToPlayerWonCard', { card: 'J♥', pos: Position.WON_PLAYER_SECOND }),
    //             () => this.$store.dispatch('moveCardToPlayerWonCard', { card: 'Q♥', pos: Position.WON_PLAYER_SECOND }),
    //             () => this.$store.dispatch('moveCardToPlayerWonCard', { card: '9♣', pos: Position.WON_PLAYER_SECOND })
    //         ])
    //     ]).then(() => {
    //         console.log('done');
    //     });
    // }, 1);
  }
};
</script>

<style scoped>
.table {
    width: 100%;
    height: 100%;
}
</style>
