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
import { createCards, createCard, Phase, initializeGame, getNextTurn, getTrickWinner } from "1k";
import { noop, redistributeCards, getWonCardsPositionByPlayerId, 
        cardToString,
        getCardsPositionByPlayerId, updateStoreByInitState, getTrickCardPositionByPlayerId } from "../helpers";
import { performActionsOneByOne, performActionsAllInOne, delay } from "../flow";
import { MINOR_DELAY } from '../animation';
import * as _ from "lodash";

export default {
    computed: {
        cards() {
            return this.$store.state.cards;
        }
    },
  created() {
      const store = this.$store;
      
      let initialStateDawingFinished = false;
    
    const initState = {
            settings: {
                permitBombOnBarrel: true,
                maxBombs: 2,
                barrelPointsLimit: 880
            },
            phase: Phase.BATTLE_START,
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
                'adam': createCards(['9♥', '10♥', 'J♥', 'Q♥', 'K♥', 'A♥', '9♠', '10♠']),
                'alan': createCards(['9♦', '10♦', 'J♦', 'Q♦', 'K♦', 'A♦', 'J♠', 'Q♠']),
                'pic':  createCards(['9♣', '10♣', 'J♣', 'Q♣', 'K♣', 'A♣', 'K♠', 'A♠'])
            },
            battle: {
                trumpAnnouncements: [],
                leadPlayer: 'pic',
                trickCards: [],
                wonCards: {
                    pic: [],
                    adam: [],
                    alan: []
                }
            }
        };

    const thousand = initializeGame(initState);

    thousand.events.addListener('phaseUpdated', onPhaseUpdated);
    thousand.events.addListener('action', onActionPerfomed);

    thousand.init();

    performActionsOneByOne([
        tryToPerformAction(() => thousand.throwCard(thousand.getState().cards['pic'][0], 'pic')),
        tryToPerformAction(() => thousand.throwCard(thousand.getState().cards['adam'][0], 'adam')),
        tryToPerformAction(() => thousand.throwCard(thousand.getState().cards['alan'][0], 'alan')),
    ]);

    // called after action is performed by game logic
    function onActionPerfomed(action, next) {
        const state = thousand.getState();
        console.log(action, state);

        const actionHandlers = {
            SHARE_STOCK: () => performActionsOneByOne([
                () => store.dispatch('moveCards', {
                    cards: [ cardToString(action.card) ],
                    pos: getCardsPositionByPlayerId(state.players, action.targetPlayer)
                })
            ]),
            THROW_CARD: () => performActionsOneByOne([
                () => store.dispatch('moveCardToTrick', {
                    card: cardToString(action.card),
                    pos: getTrickCardPositionByPlayerId(state.players, action.player)
                })
            ])
        };

        if(actionHandlers[action.type]) {
            actionHandlers[action.type]().then(next);
        } else {
            next();
        }
    }

    // called after game logic state has changed
    function onPhaseUpdated(next, isFirst) {
        const state = thousand.getState();
        
        if(isFirst && !initialStateDawingFinished) {
            updateStoreByInitState(state, store);
            initialStateDawingFinished = true;
        }

        const phasesHandler = {
            [Phase.REGISTERING_PLAYERS_START]() {
                store.commit('showPoints');
                next();
            },
            [Phase.REGISTERING_PLAYERS_IN_PROGRESS]() {
                if(isFirst) {
                    console.log('waiting for people');
                } else {
                    store.dispatch('setPlayers', state.players);
                }
            },
            [Phase.REGISTERING_PLAYERS_FINISHED]() {
                performActionsAllInOne([
                    () => delay(MINOR_DELAY * 3)
                ]).then(() => {
                    store.commit('hidePoints');
                    next();
                });
            },
            [Phase.DEALING_CARDS_START]() {
                next();
            },
            [Phase.DEALING_CARDS_FINISHED]() {
                _.each(redistributeCards(state, store), card => store.commit('addCard', card));
                setTimeout(next);
            },
            [Phase.BIDDING_START]() {
                const stockCards = _.map(thousand.getState().stock, cardToString);

                performActionsAllInOne([
                    () => store.dispatch('moveCardsToStock', stockCards)
                ]).then(next);
            },
            [Phase.BIDDING_IN_PROGRESS]() {
                if(isFirst) {
                    store.commit('showBids');
                }
                store.dispatch('setBids', state.bid);
            },
            [Phase.BIDDING_FINISHED]() {
                performActionsOneByOne([
                    () => delay(MINOR_DELAY * 3)
                ]).then(() => {
                    next();
                    store.commit('hideBids');
                });
            },
            [Phase.FLIP_STOCK]() {
                performActionsOneByOne([
                    () => store.dispatch('showStockCards'),
                    () => delay(MINOR_DELAY),
                ]).then(next);
            },
            [Phase.ASSIGN_STOCK]() {
                performActionsOneByOne([
                    () => delay(MINOR_DELAY * 2),
                    () => store.dispatch('moveStockToPlayer', {players: state.players, playerId: 'alan'}),
                ]).then(next);
            },
            [Phase.SHARE_STOCK]() {

            },
            [Phase.BATTLE_START]() {
                next();
            },
            [Phase.TRICK_START]() {
                next();
            },
            [Phase.TRICK_IN_PROGRESS]() {
            },
            [Phase.TRICK_FINISHED]() {
                console.log('trick winner', getTrickWinner(state), state.battle.trickCards.map(cardToString));
                performActionsOneByOne([
                    () => delay(MINOR_DELAY * 3),
                    () => store.dispatch('moveCardsToPlayerWonCard', {
                        cards: state.battle.trickCards.map(cardToString), 
                        pos: getCardsPositionByPlayerId(state.players, getTrickWinner(state))
                    })
                ]).then(next);
            },
        };
        console.log(state.phase, isFirst);
        (phasesHandler[state.phase] || noop)();
    }
    // performActionsOneByOne([
    //     tryToPerformAction(() => thousand.registerPlayer('adam')),
    //     tryToPerformAction(() => thousand.registerPlayer('alan')),
    //     tryToPerformAction(() => thousand.registerPlayer('pic')),
    //     tryToPerformAction(() => thousand.bid('alan', 110)),
    //     tryToPerformAction(() => thousand.pass('pic')),
    //     tryToPerformAction(() => thousand.pass('adam')),
    //     tryToPerformAction(() => thousand.shareStock('alan', thousand.getState().cards['alan'][0], 'adam')),
    //     tryToPerformAction(() => thousand.shareStock('alan', thousand.getState().cards['alan'][0], 'pic')),
    //     tryToPerformAction(() => thousand.throwCard(thousand.getState().cards['alan'][0], 'alan')),
    //     tryToPerformAction(() => thousand.throwCard(thousand.getState().cards['pic'][0], 'pic')),
    // ]);


    function tryToPerformAction(actionFn) {
        return () => new Promise(resolve => {
            const intervalInstance = setInterval(() => {
                if(!actionFn()) return;
                clearInterval(intervalInstance);
                resolve();
            }, 100);
        });
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
