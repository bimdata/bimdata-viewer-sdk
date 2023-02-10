<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style lang="scss">
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2f374a;
  font-size: 14px;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2f374a;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
