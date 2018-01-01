<template>
  <div class="points"
  :class="[
    {'points--hidden': !$store.state.pointsVisible },
    ]">
      <table>
          <tr class="points__players"> 
              <td class="center" :key="key" v-for="(value, key, index) in players">
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

import { getTotalBombsByPoints } from '../helpers';

export default {
    data: () => {
        return {
            players: {
                adam: [0, -220, null, 120],
                alan: [0, 100, 60, 10],
                pic: [0, 80, 60, 10]
            }
        };
    },
    computed: {
        bombs: function() {
            return _.chain(this.players)
                .values()
                .map(getTotalBombsByPoints)
                .map((totalBombs, id) => [id, totalBombs])
                .value();
        },
        battlesPoints: function () {
            const parsedPoints = _.chain(this.players)
                .values()
                .map(playerPoints => {
                    let total = 0;
                    return _.chain(playerPoints)
                        .map((point, i) => {
                            total = total + point;
                            if(i < playerPoints.length - 1) {
                                const diff = playerPoints[i+1];
                                return [i, total, diff]
                            } else {
                                return [i, total, 0];
                            }
                            
                        })
                        .value()
                })
                .value();
            
            return _.zip(...parsedPoints);
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
$points-card-width: 50vw;
$zIndex: 999;

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
    transition: ease 1s;
    border-radius: 0 0 10px .7vw;
    box-shadow: 8px 8px 12px rgba(0, 0, 0, 0.1);
    font-size: 3vw;
    width: $points-card-width;
    position: relative;
    z-index: $zIndex;
    background: #fff1f1;
    padding-bottom: 2vw;
    left: calc( (100% - #{$points-card-width}) / 2);

    &--hidden {
        top: -100%;
    }
    
    &__players__bombs {
        font-size: 1.5vw
    }

    &__players {
        color: #ccc;
    }
    table {
        border-spacing: 0;
        width: 100%;
    }

    td {
        border-top: 1px solid #ffffff6e;
        width: 33%;
    }
}


</style>