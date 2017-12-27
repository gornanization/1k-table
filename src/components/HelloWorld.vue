<template>
  <div>
    {{msg}}
    <card></card>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  data () {
    return {
      msg: '1k table'
    }
  }
}
</script>

<style scoped>
.table {
  background: #ccc;
}
</style>

<style>
* {
  margin: 0;
  padding: 0;
}
body, html {
  width: 100%;
  height: 100%;
}
</style>
