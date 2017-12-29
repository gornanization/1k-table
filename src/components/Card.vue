<template>
  <div 
    v-on:click="flip()"
    :class="[{ card__front: card.shown },
    'card__rank-' + normalizeRankName(card.rank),
    'card__suit-' + normalizeSuitName(card.suit),
    'card__position-' + positionToClassName(card.position)
    ]"
    :style="{
        transition: 'ease ' + $store.state.animationTimeoutMs / 1000+ 's',
        transform: 'rotate('+ card.deg +'deg)',
        zIndex: card.zIndex
    }"
    class="card">
      <div class="card-front">
          {{ card.rank }} {{ card.suit }}
      </div>
      <div class="card-back">
          <div class="card-back-inner"></div>
      </div>    
  </div>
</template>

<script>
import { Position, isTrickPostion } from './Position';
import { mapActions } from 'vuex';
import { getRandomDeg } from '../helpers';

function positionToClassName(pos) {
    return {
        [Position.TRICK_FIRST]: 'trick-first',
        [Position.TRICK_SECOND]: 'trick-second',
        [Position.TRICK_THIRD]: 'trick-third',

        [Position.PLAYER_FIRST]: 'player-first',
        [Position.PLAYER_SECOND]: 'player-second',
        [Position.PLAYER_THIRD]: 'player-third',
    }[pos];
}

function normalizeRankName(rank) {
    return {
        'A': 'ace',
        'K': 'king',
        'Q': 'queen',
        'J': 'jack',
        '10': 'ten',
        '9': 'nine'
    }[rank] || 'undefined';
}

function normalizeSuitName(rank) {
    return {
        '♥': 'heart',
        '♦': 'diamond',
        '♣': 'club',
        '♠': 'spade'
    }[rank] || 'undefined';
}

export default {
    data: () => {
        return {
        };
    },
    created() {
    },
    computed: {
        count () {
            return this.$store.state.count
        }
    },
    props: ['card'],
    methods: {
        flip() {
            this.toggleVisibility(this.card);
        },
        positionToClassName,
        normalizeRankName,
        normalizeSuitName,
        ...mapActions(['increment', 'toggleVisibility'])
    }
}
</script>

<style lang="scss">
    $width: 9vw;
    $height: $width * 1.43;
    $card-padding: 5px;
    $border-radius: 0.5vw;
    $animation-time: 1s;

    @mixin transform($top, $left) {
        top: calc(#{$top} - #{$height / 2});
        left: calc(#{$left} - #{$width / 2});
    }

    .card {
        font-size: 1.5vw;
        @include transform(50%, 50%);
        width: $width;
        height: $height;
        position: absolute;
        border: 1px inset rgba(0,0,0, .1);
        box-shadow: 1px 1px 1px rgba(0,0,0,.1);
        border-radius: $border-radius;
    }

    .card__suit {
        &-heart, &-diamond {
            color: red;
        }

        &-club, &-spade {
            color: black;
        }
    }

    .card__position {
        &-trick {
            &-first {
                @include transform(45%, 45%);
            }
            &-second {
                @include transform(45%, 55%);
            }
            &-third {
                @include transform(60%, 50%);
            }
        }
        &-player {
            &-first {
                @include transform(50%, -10%);
            }
            &-second {
                @include transform(50%, 110%);
            }
            &-third {
                @include transform(120%, 50%);
            }
        }
    }

    .card-front, .card-back {
        width: calc(#{$width} - #{2 * $card-padding});
        height: calc(#{$height} - #{2 * $card-padding});
        padding: 5px;
        border-radius: $border-radius;
        top: 0;
        position: absolute;
    }

    .card-front {
        background: #FFF2ED;
    }
    .card-back {
        background: #ff6c6c;
    }

    .card-back-inner {
        background: #ff8787;
        border-radius: $border-radius;
        width: 100%;
        height: 100%;
    }

    .card__front {
        .card-back {
            visibility: hidden;
        }
    }
</style>