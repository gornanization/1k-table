// import { Phase, initializeGame, getTrickWinner } from '1k';
import { Phase, initializeGame, getTrickWinner } from '../../1k/dist/src/index';
import { redistributeCards, getWonCardsPositionByPlayerId,
    delayWith, getCardsPositionByPlayerId, updateStoreByInitState, getTrickCardPositionByPlayerId } from './helpers';
import { performActionsOneByOne } from './flow';
import { MINOR_DELAY } from './animation';

export function initializeTable (initState, store) {
    let initialStateDawingFinished = false;

    const thousand = initializeGame(initState);

    thousand.events.addListener('phaseUpdated', onPhaseUpdated);
    thousand.events.addListener('action', onActionPerfomed);

    return thousand;

    // called after action is performed by game logic
    function onActionPerfomed (action, next) {
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
    function onPhaseUpdated (next, isFirst) {
        const state = thousand.getState();

        if (isFirst && !initialStateDawingFinished) {
            updateStoreByInitState(state, store);
            initialStateDawingFinished = true;
        }

        const phasesHandler = {
            [Phase.REGISTERING_PLAYERS_START]() {
                performActionsOneByOne([
                    () => store.dispatch('showPoints')
                ]).then(next);
            },
            [Phase.REGISTERING_PLAYERS_IN_PROGRESS]() {
                performActionsOneByOne([
                    () => store.dispatch('setPlayers', state.players)
                ]).then();
            },
            [Phase.REGISTERING_PLAYERS_FINISHED]() {
                performActionsOneByOne([
                    () => delayWith(MINOR_DELAY * 2),
                    () => store.dispatch('hidePoints')
                ]).then(next);
            },
            [Phase.DEALING_CARDS_START]: next,
            [Phase.DEALING_CARDS_FINISHED]() {
                performActionsOneByOne([
                    () => delayWith(MINOR_DELAY),
                    () => store.dispatch('changeCardsPosition', redistributeCards(state, store))
                ]).then(next);
            },
            [Phase.BIDDING_START]: next,
            [Phase.BIDDING_IN_PROGRESS]() {
                if (isFirst) {
                    performActionsOneByOne([
                        () => store.dispatch('showBids'),
                        () => store.dispatch('setBids', state.bid)
                    ]).then();
                } else {
                    performActionsOneByOne([
                        () => store.dispatch('setBids', state.bid)
                    ]).then();
                }
            },
            [Phase.BIDDING_FINISHED]() {
                performActionsOneByOne([
                    () => delayWith(MINOR_DELAY * 3),
                    () => store.dispatch('hideBids')
                ]).then(next);
            },
            [Phase.FLIP_STOCK]() {
                performActionsOneByOne([
                    () => store.dispatch('showStockCards'),
                    () => delayWith(MINOR_DELAY)
                ]).then(next);
            },
            [Phase.ASSIGN_STOCK]() {
                performActionsOneByOne([
                    () => delayWith(MINOR_DELAY * 2),
                    () => store.dispatch('moveStockToPlayer', { players: state.players, playerId: 'alan' })
                ]).then(next);
            },
            [Phase.SHARE_STOCK]: next,
            [Phase.BATTLE_START]: next,
            [Phase.TRICK_START]: next,
            [Phase.TRICK_IN_PROGRESS]: next,
            [Phase.TRICK_FINISHED]() {
                performActionsOneByOne([
                    () => delayWith(MINOR_DELAY * 3),
                    () => store.dispatch('moveCardsToPlayerWonCard', {
                        cards: state.battle.trickCards,
                        pos: getWonCardsPositionByPlayerId(state.players, getTrickWinner(state))
                    })
                ]).then(next);
            },
            [Phase.ASSIGN_TRICK_CARDS]: next,
            [Phase.BATTLE_FINISHED]: next,
            [Phase.BATTLE_RESULTS_ANNOUNCEMENT]() {
                performActionsOneByOne([
                    () => store.dispatch('setPlayers', state.players),
                    () => store.dispatch('showPoints'),
                    () => delayWith(MINOR_DELAY * 3),
                    () => store.dispatch('hidePoints'),
                    () => store.dispatch('moveCardsToDeck')
                ]).then(next);
            }
        };
        console.log(state.phase, isFirst);
        (phasesHandler[state.phase] || (() => console.log(state.phase, 'not handled...')))();
    }
}
