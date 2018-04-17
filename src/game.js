import { Phase, initializeGame, getTrickWinner, getNextTurn, getBidWinner, getNextTrickTurn } from '1k';
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
        console.log('action', action);
        const actionHandlers = {
            SHARE_STOCK: () => performActionsOneByOne([
                () => store.dispatch('moveCards', {
                    cards: [action.card],
                    pos: getCardsPositionByPlayerId(state.players, action.targetPlayer)
                }),
                () => log(`${action.player} shared a card with ${action.targetPlayer}`)
            ]),
            THROW_CARD: () => performActionsOneByOne([
                () => store.dispatch('moveCardToTrick', {
                    card: action.card,
                    pos: getTrickCardPositionByPlayerId(state.players, action.player)
                }),
                () => log(`${action.player} thrown a ${action.card} card`)
            ])
        };

        if (actionHandlers[action.type]) {
            actionHandlers[action.type]().then(next);
        } else {
            next();
        }
    }

    function log(msg) {
        store.dispatch('addLog', msg)
        return Promise.resolve()
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
            [Phase.NOT_ENOUGHT_CARD_POINTS]() {
                performActionsOneByOne([
                    () => delayWith(MINOR_DELAY * 4),
                    () => store.dispatch('moveCardsToDeck')
                ]).then(next);
            },
            [Phase.BIDDING_START]: next,
            [Phase.BIDDING_IN_PROGRESS]() {
                const nextPlayer = getNextTurn(state.players, state.bid[0].player);
                log(`next turn for bidding: ${nextPlayer}`)

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
                const winnerBidding = getBidWinner(state.bid);
                log(`${winnerBidding.player} has won a bidding with ${winnerBidding.bid} points`)

                performActionsOneByOne([
                    () => delayWith(MINOR_DELAY * 3),
                    () => store.dispatch('hideBids')
                ]).then(next);
            },
            [Phase.FLIP_STOCK]() {
                const winnerBidding = getBidWinner(state.bid);
                log(`${winnerBidding.player} needs to share cards...`)
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
            [Phase.BOMB_DECLARED] () {
                performActionsOneByOne([
                    () => log('A bomb has been thrown!!!'),
                    () => store.dispatch('moveCardsToDeck')
                ]).then(next);
            },
            [Phase.SHARE_STOCK]() {
                if (isFirst) {
                    const winnerBidding = getBidWinner(state.bid);
                    log(`${winnerBidding.player} needs to share cards...`)
                }
                next();
            },
            [Phase.BATTLE_START]: next,
            [Phase.TRICK_START]: next,
            [Phase.TRICK_IN_PROGRESS]() {
                performActionsOneByOne([
                    () => log(`next trick turn: ${getNextTrickTurn(state)}`)
                ]).then(next);
            },
            [Phase.TRICK_FINISHED]() {
                const trickWinner = getTrickWinner(state);
                performActionsOneByOne([
                    () => delayWith(MINOR_DELAY * 3),
                    () => store.dispatch('moveCardsToPlayerWonCard', {
                        cards: state.battle.trickCards,
                        pos: getWonCardsPositionByPlayerId(state.players, trickWinner)
                    }),
                    () => log(`${trickWinner} has won a trick!`)
                ]).then(next);
            },
            [Phase.ASSIGN_TRICK_CARDS]: next,
            [Phase.BATTLE_FINISHED]() {
                performActionsOneByOne([
                    () => log('battle finished!')
                ]).then(next);
            },
            [Phase.BATTLE_RESULTS_ANNOUNCEMENT]() {
                performActionsOneByOne([
                    () => store.dispatch('setPlayers', state.players),
                    () => store.dispatch('showPoints'),
                    () => delayWith(MINOR_DELAY * 6),
                    () => store.dispatch('hidePoints'),
                    () => store.dispatch('moveCardsToDeck')
                ]).then(next);
            },
            [Phase.GAME_FINISHED]() {
                store.commit('togglePointsVisibility');
                next();
            }
        };
        (phasesHandler[state.phase] || (() => console.log(state.phase, 'not handled...')))();
    }
}
