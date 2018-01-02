<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'app'
}
</script>

<style lang="scss">
#app {
  width: 100%;
  height: 100%;
  background: #a1d4a1;
}

body {
  font-family: Arial;
}

* {
  margin: 0;
  padding: 0;
}

body, html {
  width: 100%;
  height: 100%;
}

</style>
