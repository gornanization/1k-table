<template>
  <div class="card">
    {{rank}} {{suit}}
  </div>
</template>

<script>
export default {
    data: () => {
        return {
            rank: 'A',
            suit: '♥'
        }
    }
}
</script>

<style scoped>
    .card {
        width: 80px;
        height: 110px;
        background: #fff;
    }
</style>