<template>
  <div class="table">
    <card 
        :key="card.rank+''+card.suit" 
        v-for="card in cards" 
        :rank="card.rank"
        :position="card.position"
        :suit="card.suit">
    </card>
  </div>
</template>
<script>

import { Position } from './Position';

export default {
  data() {
    return {
      cards: [
        {rank: 'J', suit: '♥', position: Position.TRICK_FIRST},
        {rank: 'Q', suit: '♥', position: Position.TRICK_SECOND},
        {rank: '9', suit: '♥', position: Position.TRICK_THIRD}
      ]
    }
  }
}
</script>

<style scoped>
.table {
    width: 100%;
    height: 100%;
}
</style>
