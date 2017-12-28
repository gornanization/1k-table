<template>
  <div 
    v-on:click="flip()"
    v-bind:class="[{ card__front: cardShown },
    'card__rank-' + normalizeRankName(rank),
    'card__suit-' + normalizeSuitName(suit),
    'card__position-' + positionToClassName(position)
    ]"
    class="card">
      <div class="card-front">
          {{rank}} {{suit}}
      </div>
      <div class="card-back">
          <div class="card-back-inner"></div>
      </div>    
  </div>
</template>

<script>
import { Position } from './Position';

function positionToClassName(pos) {
    return {
        [Position.TRICK_FIRST]: 'trick-first',
        [Position.TRICK_SECOND]: 'trick-second',
        [Position.TRICK_THIRD]: 'trick-third',
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
        '♥': 'heart'
    }[rank] || 'undefined';
}

export default {
    data: () => {
        return {
            cardShown: true
        }
    },
    created() {
        setTimeout(() => {
            const rand = Math.random(10) * 10 + 1;
            this.$el.style['transform'] = `rotate(${rand}deg)`;
            console.log();
            
        })
    },
    props: ['rank', 'suit', 'position'],
    methods: {
        flip() {
            this.cardShown = !this.cardShown;
        },
        positionToClassName,
        normalizeRankName,
        normalizeSuitName
    }
}
</script>

<style lang="scss">
    $width: 9vw;
    $height: $width * 1.43;
    $card-padding: 5px;
    $border-radius: 0.5vw;

    .card {
        font-size: 1.5vw;
        transition: ease 0.4s;
        top: calc(50% - #{$height / 2});
        left: calc(50% - #{$width / 2});
        width: $width;
        height: $height;
        position: absolute;
        box-shadow: 1px 1px 1px rgba(0,0,0,.1);
        border-radius: $border-radius;
    }

    .card__position-trick {
        &-first {
            top: calc(45% - #{$height / 2});
            left: calc(45% - #{$width / 2});
        }
        &-second {
            top: calc(45% - #{$height / 2});
            left: calc(55% - #{$width / 2});
        }
        &-third {
            top: calc(60% - #{$height / 2});
            left: calc(50% - #{$width / 2});
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