import { performActionsOneByOne } from './flow';
import { tryToPerformAction } from './helpers';
import { Phase } from '1k';

export const cases = {
    // ------------------------------------------------------------------------
    REGISTERING_PLAYERS_IN_PROGRESS: {
        state: {
            settings: {
                permitBombOnBarrel: true,
                maxBombs: 2,
                barrelPointsLimit: 880,
                shuffleAgainIfPointsCountLessThan: 18
            },
            phase: Phase.REGISTERING_PLAYERS_IN_PROGRESS,
            players: [
                { id: 'adam', battlePoints: [] },
                { id: 'alan', battlePoints: [] }
            ],
            deck: [],
            stock: [],
            bid: [],
            cards: {
                'adam': [],
                'alan': [],
                'pic': []
            },
            battle: null
        },
        actions(thousand) {
            performActionsOneByOne([
                tryToPerformAction(() => thousand.registerPlayer('pic'))
            ]);
        }
    },
    REGISTERING_PLAYERS_START: {
        state: undefined,
        actions(thousand) {
            performActionsOneByOne([
                tryToPerformAction(() => thousand.registerPlayer('adam')),
                tryToPerformAction(() => thousand.registerPlayer('alan')),
                tryToPerformAction(() => thousand.registerPlayer('pic')),
                tryToPerformAction(() => thousand.bid('alan', 110)),
                tryToPerformAction(() => thousand.pass('pic')),
                tryToPerformAction(() => thousand.pass('adam')),
                tryToPerformAction(() => thousand.shareStock('alan', thousand.getState().cards['alan'][0], 'adam')),
                tryToPerformAction(() => thousand.shareStock('alan', thousand.getState().cards['alan'][1], 'pic')),
                tryToPerformAction(() => thousand.throwCard(thousand.getState().cards['alan'][0], 'alan')),
                tryToPerformAction(() => thousand.throwCard(thousand.getState().cards['pic'][0], 'pic'))
            ]);
        }
    },
    // ------------------------------------------------------------------------
    BIDDING_IN_PROGRESS: {
        state: {
            settings: {
                permitBombOnBarrel: true,
                maxBombs: 2,
                barrelPointsLimit: 880,
                shuffleAgainIfPointsCountLessThan: 18
            },
            phase: Phase.BIDDING_IN_PROGRESS,
            players: [
                { id: 'adam', battlePoints: [120, null] },
                { id: 'alan', battlePoints: [100, 60] },
                { id: 'pic', battlePoints: [1000, 60] }
            ],
            deck: [],
            stock: ['10♠', 'Q♠', 'A♠'],
            bid: [
                { player: 'pic', bid: 100, pass: false }
            ],
            cards: {
                'adam': ['9♥', '10♥', 'J♥', 'Q♥', 'K♥', 'A♥', '9♠'],
                'alan': ['9♦', '10♦', 'J♦', 'Q♦', 'K♦', 'A♦', 'J♠'],
                'pic': ['9♣', '10♣', 'J♣', 'Q♣', 'K♣', 'A♣', 'K♠']
            },
            battle: null
        },
        actions(thousand) {
            performActionsOneByOne([
                tryToPerformAction(() => thousand.bid('adam', 110)),
                tryToPerformAction(() => thousand.pass('alan')),
                tryToPerformAction(() => thousand.pass('pic'))
            ]);
        }
    },
    // ------------------------------------------------------------------------
    TRICK_START: {
        state: {
            settings: {
                permitBombOnBarrel: true,
                maxBombs: 2,
                barrelPointsLimit: 880,
                shuffleAgainIfPointsCountLessThan: 18
            },
            phase: Phase.TRICK_START,
            players: [
                { id: 'adam', battlePoints: [120, null] },
                { id: 'alan', battlePoints: [100, 60] },
                { id: 'pic', battlePoints: [1000, 60] }
            ],
            deck: [],
            stock: [],
            bid: [
                { player: 'alan', bid: 0, pass: true },
                { player: 'adam', bid: 0, pass: true },
                { player: 'pic', bid: 100, pass: false }
            ],
            cards: {
                'adam': [ '9♥', '10♥', 'J♥', 'Q♥', 'K♥', 'A♥', '9♠', '10♠' ],
                'alan': [ '9♦', '10♦', 'J♦', 'Q♦', 'K♦', 'A♦', 'J♠', 'Q♠' ],
                'pic': [ '9♣', '10♣', 'J♣', 'Q♣', 'K♣', 'A♣', 'K♠', 'A♠' ]
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
        },
        actions(thousand) {
            performActionsOneByOne([
                tryToPerformAction(() => thousand.throwCard('9♣', 'pic')),
                tryToPerformAction(() => thousand.throwCard('9♥', 'adam')),
                tryToPerformAction(() => thousand.throwCard('9♦', 'alan'))
            ]);
        }
    },
    TRICK_IN_PROGRESS_3_CARDS: {
        state: {
            settings: {
                permitBombOnBarrel: true,
                maxBombs: 2,
                barrelPointsLimit: 880,
                shuffleAgainIfPointsCountLessThan: 18
            },
            phase: Phase.TRICK_IN_PROGRESS,
            players: [
                { id: 'adam', battlePoints: [120, null] },
                { id: 'alan', battlePoints: [100, 60] },
                { id: 'pic', battlePoints: [1000, 60] }
            ],
            deck: [],
            stock: [],
            bid: [
                { player: 'alan', bid: 0, pass: true },
                { player: 'adam', bid: 0, pass: true },
                { player: 'pic', bid: 100, pass: false }
            ],
            cards: {
                'adam': [ '10♥', 'J♥', 'Q♥', 'K♥', 'A♥', '9♠', '10♠' ],
                'alan': [ '10♦', 'J♦', 'Q♦', 'K♦', 'A♦', 'J♠', 'Q♠' ],
                'pic': [ '10♣', 'J♣', 'Q♣', 'K♣', 'A♣', 'K♠', 'A♠' ]
            },
            battle: {
                trumpAnnouncements: [],
                leadPlayer: 'pic',
                trickCards: [ '9♥', '9♦', '9♣' ],
                wonCards: {
                    pic: [],
                    adam: [],
                    alan: []
                }
            }
        },
        actions(thousand) {
            performActionsOneByOne([]);
        }
    },
    TRICK_IN_PROGRESS_3_CARDS_LAST_TRICK: {
        state: {
            settings: {
                permitBombOnBarrel: true,
                maxBombs: 2,
                barrelPointsLimit: 880,
                shuffleAgainIfPointsCountLessThan: 18
            },
            phase: Phase.TRICK_IN_PROGRESS,
            players: [
                { id: 'adam', battlePoints: [120, null] },
                { id: 'alan', battlePoints: [100, 60] },
                { id: 'pic', battlePoints: [100, 60] }
            ],
            deck: [],
            stock: [],
            bid: [
                { player: 'alan', bid: 0, pass: true },
                { player: 'adam', bid: 0, pass: true },
                { player: 'pic', bid: 100, pass: false }
            ],
            cards: {
                'adam': [],
                'alan': [],
                'pic': []
            },
            battle: {
                trumpAnnouncements: [],
                leadPlayer: 'pic',
                trickCards: ['9♥', '9♦', '9♣'],
                wonCards: {
                    pic: [
                        '10♥', 'J♥', 'Q♥', 'K♥', 'A♥', '9♠', '10♠',
                        '10♦', 'J♦', 'Q♦', 'K♦', 'A♦', 'J♠', 'Q♠',
                        '10♣', 'J♣', 'Q♣', 'K♣', 'A♣', 'K♠', 'A♠'
                    ],
                    adam: [],
                    alan: []
                }
            }
        },
        actions(thousand) {
            performActionsOneByOne([
                tryToPerformAction(() => thousand.pass('alan'))
            ]);
        }
    },
    NOT_ENOUGHT_CARD_POINTS_TO_CONTINUE: {
        state: {
            settings: {
                permitBombOnBarrel: true,
                maxBombs: 2,
                barrelPointsLimit: 880,
                shuffleAgainIfPointsCountLessThan: 18
            },
            phase: Phase.DEALING_CARDS_FINISHED,
            players: [
                { id: 'adam', battlePoints: [120, null] },
                { id: 'alan', battlePoints: [100, 60] },
                { id: 'pic', battlePoints: [100, 60] }
            ],
            deck: ['10♥', 'A♥', '10♠'],
            stock: [],
            bid: [
                { player: 'alan', bid: 0, pass: true },
                { player: 'adam', bid: 0, pass: true },
                { player: 'pic', bid: 100, pass: false }
            ],
            cards: {
                'adam': ['9♥', '9♦', '9♣', 'J♥', 'Q♥', 'K♥', '9♠'],
                'alan': ['10♦', 'J♦', 'Q♦', 'K♦', 'A♦', 'J♠', 'Q♠'],
                'pic': ['10♣', 'J♣', 'Q♣', 'K♣', 'A♣', 'K♠', 'A♠']
            },
            battle: null
        },
        actions(thousand) {
            performActionsOneByOne([

            ]);
        }
    }
}
