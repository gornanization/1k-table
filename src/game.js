import { Phase, initializeGame, getTrickWinner, getNextTurn, getBidWinner, getNextTrickTurn } from '1k'
import { redistributeCards, getWonCardsPositionByPlayerId,
    delayWith, getCardsPositionByPlayerId, updateStoreByInitState, getTrickCardPositionByPlayerId } from './helpers'
import { performActionsOneByOne } from './flow'
import { MINOR_DELAY } from './animation'

export function initializeTable (initState, store) {
    let initialStateDawingFinished = false

    const thousand = initializeGame(initState)

    thousand.events.addListener('phaseUpdated', onPhaseUpdated)
    thousand.events.addListener('action', onActionPerfomed)

    return thousand

    // called after action is performed by game logic
    function onActionPerfomed (action, next) {
        store.dispatch('markAnimationAsStarted')
        const continueGame = () => {
            next()
            store.dispatch('markAnimationAsFinished')
        }

        const state = thousand.getState()
        console.log('action', action)
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
        }

        const actionHandler = actionHandlers[action.type]
        actionHandler ? actionHandler().then(continueGame) : continueGame()
    }

    function log(msg) {
        store.dispatch('addLog', msg)
        return createPromise()
    }

    function createPromise() {
        return Promise.resolve()
    }

    // called after game logic state has changed
    function onPhaseUpdated (next, isFirst) {
        store.dispatch('markAnimationAsStarted')
        const state = thousand.getState()

        const continueGame = () => {
            store.dispatch('markAnimationAsFinished')
            next();
        }

        if (isFirst && !initialStateDawingFinished) {
            updateStoreByInitState(state, store)
            initialStateDawingFinished = true
        }

        const phasesHandler = {
            [Phase.REGISTERING_PLAYERS_START]: () => {
                return performActionsOneByOne([
                    () => store.dispatch('showPoints')
                ])
            },
            [Phase.REGISTERING_PLAYERS_IN_PROGRESS]: () => {
                return performActionsOneByOne([
                    () => store.dispatch('setPlayers', state.players)
                ])
            },
            [Phase.REGISTERING_PLAYERS_FINISHED]: () => {
                return performActionsOneByOne([
                    () => delayWith(MINOR_DELAY * 2),
                    () => store.dispatch('hidePoints')
                ])
            },
            [Phase.DEALING_CARDS_START]: () => {
                return createPromise()
            },
            [Phase.DEALING_CARDS_FINISHED]: () => {
                return performActionsOneByOne([
                    () => delayWith(MINOR_DELAY),
                    () => store.dispatch('changeCardsPosition', redistributeCards(state, store))
                ])
            },
            [Phase.NOT_ENOUGHT_CARD_POINTS]: () => {
                return performActionsOneByOne([
                    () => delayWith(MINOR_DELAY * 4),
                    () => store.dispatch('moveCardsToDeck')
                ])
            },
            [Phase.BIDDING_START]: () => {
                return createPromise()
            },
            [Phase.BIDDING_IN_PROGRESS]: () => {
                const nextPlayer = getNextTurn(state.players, state.bid[0].player)

                return performActionsOneByOne([
                    () => log(`next turn for bidding: ${nextPlayer}`),
                    () => isFirst ? store.dispatch('showBids') : createPromise(),
                    () => store.dispatch('setBids', state.bid)
                ])
            },
            [Phase.BIDDING_FINISHED]: () => {
                const winnerBidding = getBidWinner(state.bid)
                return performActionsOneByOne([
                    () => log(`${winnerBidding.player} has won a bidding with ${winnerBidding.bid} points`),
                    () => delayWith(MINOR_DELAY * 3),
                    () => store.dispatch('hideBids')
                ])
            },
            [Phase.FLIP_STOCK]: () => {
                const winnerBidding = getBidWinner(state.bid)
                log(`${winnerBidding.player} needs to share cards...`)
                return performActionsOneByOne([
                    () => store.dispatch('showStockCards'),
                    () => delayWith(MINOR_DELAY)
                ])
            },
            [Phase.ASSIGN_STOCK]: () => {
                const winnerBidding = getBidWinner(state.bid)
                return performActionsOneByOne([
                    () => delayWith(MINOR_DELAY * 2),
                    () => store.dispatch('moveStockToPlayer', { players: state.players, playerId: winnerBidding.player })
                ])
            },
            [Phase.BOMB_DECLARED]: () => {
                return performActionsOneByOne([
                    () => log('A bomb has been thrown!!!'),
                    () => store.dispatch('moveCardsToDeck')
                ])
            },
            [Phase.SHARE_STOCK]: () => {
                const winnerBidding = getBidWinner(state.bid)
                return isFirst ? performActionsOneByOne([
                    () => log(`${winnerBidding.player} needs to share cards...`)
                ]) : createPromise()
            },
            [Phase.BATTLE_START]: () => {
                return createPromise()
            },
            [Phase.TRICK_START]: () => {
                return createPromise()
            },
            [Phase.TRICK_IN_PROGRESS]: () => {
                return performActionsOneByOne([
                    () => log(`next trick turn: ${getNextTrickTurn(state)}`)
                ])
            },
            [Phase.TRICK_FINISHED]: () => {
                const trickWinner = getTrickWinner(state)
                return performActionsOneByOne([
                    () => delayWith(MINOR_DELAY * 3),
                    () => store.dispatch('moveCardsToPlayerWonCard', {
                        cards: state.battle.trickCards,
                        pos: getWonCardsPositionByPlayerId(state.players, trickWinner)
                    }),
                    () => log(`${trickWinner} has won a trick!`)
                ])
            },
            [Phase.ASSIGN_TRICK_CARDS]: () => {
                return createPromise()
            },
            [Phase.BATTLE_FINISHED]: () => {
                return performActionsOneByOne([
                    () => log('battle finished!')
                ])
            },
            [Phase.BATTLE_RESULTS_ANNOUNCEMENT]: () => {
                return performActionsOneByOne([
                    () => store.dispatch('setPlayers', state.players),
                    () => store.dispatch('showPoints'),
                    () => delayWith(MINOR_DELAY * 6),
                    () => store.dispatch('hidePoints'),
                    () => store.dispatch('moveCardsToDeck')
                ])
            },
            [Phase.GAME_FINISHED]: () => {
                return performActionsOneByOne([
                    () => store.commit('togglePointsVisibility')
                ])
            }
        }

        const actionHandler = phasesHandler[state.phase]
        actionHandler ? actionHandler().then(continueGame) : continueGame()
    }
}
