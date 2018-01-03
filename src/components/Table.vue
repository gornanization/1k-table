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
import { createCards, createCard } from "1k";
import { redistributeCards, getWonCardsPositionByPlayerId, getCardsPositionByPlayerId } from "../helpers";
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


const initState = {
            settings: {
                permitBombOnBarrel: true,
                maxBombs: 2,
                barrelPointsLimit: 880
            },
            phase: 'TRICK_IN_PROGRESS',
            players: [
                { id: 'adam', battlePoints: [120, null] },
                { id: 'alan', battlePoints: [0, 60] },
                { id: 'pic', battlePoints: [0, 60] }
            ],
            deck: [],
            stock: [],
            bid: [
                { player: 'alan', bid: 0, pass: true },
                { player: 'adam', bid: 0, pass: true },
                { player: 'pic', bid: 100, pass: false }
            ],
            cards: {
                'adam': createCards(['9♥', '10♥', 'J♥', 'Q♥', 'K♥', 'A♥', '9♠']), // 7 cards
                'alan': createCards(['10♦', 'J♦', 'Q♦', 'K♦', 'A♦', 'J♠']), // 6 cards
                'pic':  createCards(['10♣', 'J♣', 'Q♣', 'K♣', 'A♣', 'A♠']), // 6 cards
            },
            battle: {
                trumpAnnouncements: [],
                leadPlayer: 'alan',
                trickCards: createCards(['9♦', '9♣']),
                wonCards: {
                    adam: [],
                    pic: [], 
                    alan: createCards(['K♠','Q♠', '10♠']) // 3 cards
                }
            }
        };

    const cardsList = redistributeCards(initState);


    _.each(cardsList, card => this.$store.commit('addCard', card));

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
        store.dispatch('togglePointsVisibility');
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
