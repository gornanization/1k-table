<template>

    <div class="points" :class="[{'hidden': !$store.state.pointsVisible }]">
        <div class="points__waiting-for-players center" v-if="Object.keys(game.players).length === 0">waiting for players</div>
        <table>
            <tr class="points__players">
                <td class="center" :key="player.id" v-for="(player, index) in game.players">
                    {{player.id}}
                    <span class="points__players__bombs">{{ formatBombs(bombs[index]) }}</span>
                </td>
            </tr>
            <tr :key="index" v-for="(battlePoints, index) in battlesPoints">
                <td v-for="userBattlePoint in battlePoints">
                    <div class="point">
                        <div class="point__total"> {{userBattlePoint[1]}}</div>
                        <div class="point__addition" v-if="userBattlePoint[2] !== 0" :class="[ 
                                    {'point__addition--plus': (userBattlePoint[2] && userBattlePoint[2] > 0) },
                                    {'point__addition--minus': (userBattlePoint[2] && userBattlePoint[2] < 0) }
                                ]">
                            <span v-if="userBattlePoint[2] === null">
                                *
                            </span>
                            <span v-if="userBattlePoint[2] !== null">
                                {{ Math.abs(userBattlePoint[2]) }}
                            </span>
                        </div>
                    </div>
                </td>
            </tr>
        </table>

    </div>
</template>

<script>
import { mapActions } from 'vuex';
import * as _ from 'lodash';

import { getTotalBombsByPoints, parseBattlePoints } from '../helpers';

export default {
    computed: {
        game() {
            return this.$store.state.game
        },
        bombs() {
            return _.chain(this.game.players)
                .map('battlePoints')
                .map(getTotalBombsByPoints)
                .value();
        },
        noPlayersRegistered() {
            return Object.keys(this.battlesPoints).length === 0;
        },
        battlesPoints() {
            return parseBattlePoints(this.game.players);
        }
    },
    methods: {
        formatBombs(total) {
            return _.fill(Array(total), '*').join(' ');
        },
        ...mapActions([])
    }
}
</script>

<style lang="scss">
@import "../helpers";

.point {
    display: flex;
    color: #525252;
    div {
        flex: 1 0 50%;
    }
    &__total {
        font-weight: bold;
        text-align: center;
    }
    &__addition {
        opacity: 0.5;
        &--plus {
            color: green;
            &::before {
                content: '+'
            }
        }
        &--minus {
            color: red;
            &::before {
                content: '-'
            }
        }
    }
}

.center {
    text-align: center;
}

.points {
    @extend .board-table;

    &--hidden {
        top: -100%;
    }

    &__players__bombs {
        font-size: 1.5vw
    }

    &__players {
        color: #ccc;
    }
}
</style>