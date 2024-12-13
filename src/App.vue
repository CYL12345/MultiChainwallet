<template>
  <img alt="Vue logo" src="./assets/logo.png">
  <HelloWorld msg="Welcome to Your Vue.js App"/>
  <div id="app">

      <router-link to="/WalletGenerator">WalletGenerator</router-link>
      <router-link to="/LoginWallet">LoginWallet</router-link>
       <!-- 路由视图，显示当前路由对应的组件 -->
      <router-view></router-view>
    </div>
</template>

<script>
//import router from './router';

export default {
  name: 'App',
  components: {
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
