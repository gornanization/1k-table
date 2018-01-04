import * as _ from 'lodash';

export const Position = {
    TRICK_FIRST: 'TRICK_FIRST',
    TRICK_SECOND: 'TRICK_SECOND',
    TRICK_THIRD: 'TRICK_THIRD',

    PLAYER_FIRST: 'PLAYER_FIRST',
    PLAYER_SECOND: 'PLAYER_SECOND',
    PLAYER_THIRD: 'PLAYER_THIRD',

    WON_PLAYER_FIRST: 'WON_PLAYER_FIRST',
    WON_PLAYER_SECOND: 'WON_PLAYER_SECOND',
    WON_PLAYER_THIRD: 'WON_PLAYER_THIRD',

    DECK: 'DECK',

    STOCK_FIRST: 'STOCK_FIRST',
    STOCK_SECOND: 'STOCK_SECOND',
    STOCK_THIRD: 'STOCK_THIRD',
};


export function isTrickPostion(pos) {
    return _.includes([
        Position.TRICK_FIRST,
        Position.TRICK_SECOND,
        Position.TRICK_THIRD
    ], pos);
}

export function isStockPostion(pos) {
    return _.includes([
        Position.STOCK_FIRST,
        Position.STOCK_SECOND,
        Position.STOCK_THIRD
    ], pos);
}
