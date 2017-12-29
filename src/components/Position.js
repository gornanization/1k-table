import * as _ from 'lodash';

export const Position = {
    TRICK_FIRST: 'TRICK_FIRST',
    TRICK_SECOND: 'TRICK_SECOND',
    TRICK_THIRD: 'TRICK_THIRD',

    PLAYER_FIRST: 'PLAYER_FIRST',
    PLAYER_SECOND: 'PLAYER_SECOND',
    PLAYER_THIRD: 'PLAYER_THIRD',
};


export function isTrickPostion(pos) {
    return _.includes([
        Position.TRICK_FIRST,
        Position.TRICK_SECOND,
        Position.TRICK_THIRD
    ], pos);
}
