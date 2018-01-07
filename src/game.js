import { Position } from "./components/Position";
import { Phase, initializeGame, getNextTurn, getTrickWinner } from "1k";
import { noop, redistributeCards, getWonCardsPositionByPlayerId, 
        cardToString,
        getCardsPositionByPlayerId, updateStoreByInitState, getTrickCardPositionByPlayerId } from "./helpers";
import { performActionsOneByOne, performActionsAllInOne, delay } from "./flow";
import { MINOR_DELAY } from './animation';
import * as _ from "lodash";

export function initializeTable(initState, store) {
    let initialStateDawingFinished = false;

    const thousand = initializeGame(initState);

    thousand.events.addListener('phaseUpdated', onPhaseUpdated);
    thousand.events.addListener('action', onActionPerfomed);

    thousand.init();

    return thousand;

    // called after action is performed by game logic
    function onActionPerfomed(action, next) {
        const state = thousand.getState();
        console.log(action, state);

        const actionHandlers = {
            SHARE_STOCK: () => performActionsOneByOne([
                () => store.dispatch('moveCards', {
                    cards: [action.card],
                    pos: getCardsPositionByPlayerId(state.players, action.targetPlayer)
                })
            ]),
            THROW_CARD: () => performActionsOneByOne([
                () => store.dispatch('moveCardToTrick', {
                    card: action.card,
                    pos: getTrickCardPositionByPlayerId(state.players, action.player)
                })
            ])
        };

        if (actionHandlers[action.type]) {
            actionHandlers[action.type]().then(next);
        } else {
            next();
        }
    }

    // called after game logic state has changed
    function onPhaseUpdated(next, isFirst) {
        const state = thousand.getState();

        if (isFirst && !initialStateDawingFinished) {
            updateStoreByInitState(state, store);
            initialStateDawingFinished = true;
        }

        const phasesHandler = {
            [Phase.REGISTERING_PLAYERS_START]() {
                store.commit('showPoints');
                next();
            },
            [Phase.REGISTERING_PLAYERS_IN_PROGRESS]() {
                if (isFirst) {     
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
                performActionsAllInOne([
                    () => store.dispatch('moveCardsToStock', state.stock)
                ]).then(next);
            },
            [Phase.BIDDING_IN_PROGRESS]() {
                if (isFirst) {
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
                    () => store.dispatch('moveStockToPlayer', { players: state.players, playerId: 'alan' }),
                ]).then(next);
            },
            [Phase.SHARE_STOCK]() {},
            [Phase.BATTLE_START]() {
                next();
            },
            [Phase.TRICK_START]() {
                next();
            },
            [Phase.TRICK_IN_PROGRESS]() { },
            [Phase.TRICK_FINISHED]() {
                performActionsOneByOne([
                    () => delay(MINOR_DELAY * 3),
                    () => store.dispatch('moveCardsToPlayerWonCard', {
                        cards: state.battle.trickCards,
                        pos: getWonCardsPositionByPlayerId(state.players, getTrickWinner(state))
                    })
                ]).then(next);
            },
            [Phase.ASSIGN_TRICK_CARDS]() {
                next();
            },
            [Phase.BATTLE_FINISHED]() {
                next();
            },
            [Phase.BATTLE_RESULTS_ANNOUNCEMENT]() {
                performActionsOneByOne([
                    () => delayWith(0, () => store.commit('showPoints')),
                    () => delay(MINOR_DELAY * 3),
                    () => delayWith(0, () => store.commit('hidePoints')),
                    () => store.dispatch('moveCardsToDeck')
                ]).then(next);
            }
        };
        console.log(state.phase, isFirst);
        (phasesHandler[state.phase] || (() => console.log(state.phase, 'not handled...')) )();
    }
}

function delayWith(timeout, action = () => {}) {
    return new Promise(resolve => setTimeout(() => {
        action();
        resolve();   
    }, timeout));
}