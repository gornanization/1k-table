<template>
  <div class="points"
  :class="[
    {'hidden': !$store.state.pointsVisible },
    ]">
      <table>
          <tr class="points__players"> 
              <td class="center" :key="key" v-for="(value, key, index) in $store.state.players">
                  {{key}} <span class="points__players__bombs">{{formatBombs(bombs[index][1])}}</span>
              </td>
          </tr>
            <tr :key="index" v-for="(battlePoints, index) in battlesPoints">
                <td v-for="userBattlePoint in battlePoints">
                    <div class="point">
                        <div  class="point__total"> {{userBattlePoint[1]}}</div>
                        <div
                            class="point__addition"
                            v-if="userBattlePoint[2] !== 0"
                            :class="[ 
                                {'point__addition--plus': (userBattlePoint[2] && userBattlePoint[2] > 0) },
                                {'point__addition--minus': (userBattlePoint[2] && userBattlePoint[2] < 0) }
                            ]"
                        >
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
    data: () => {
        return {};
    },
    computed: {
        bombs() {
            return _.chain(this.$store.state.players)
                .values()
                .map(getTotalBombsByPoints)
                .map((totalBombs, id) => [id, totalBombs])
                .value();
        },
        battlesPoints() {
            return parseBattlePoints(this.$store.state.players);
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