import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
//import Web3 from 'web3';
import store from './store'; // 引入 Vuex store

const app = createApp(App);

let web3;
/*
if (window.ethereum) {
  web3 = new Web3(window.ethereum);
  try {
    await window.ethereum.enable();
  } catch (error) {
    console.error("用户拒绝了账户请求", error);
  }
} else if (window.web3) {
  web3 = new Web3(window.web3.currentProvider);
} else {
  console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
}*/
router.beforeEach((to,from,next)=>{
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  if (requiresAuth && !isAuthenticated) {
    next({ name: 'LoginWallet' }); 
  } else {
    next(); 
  }
})

app.provide('web3', web3);
app.use(router);
app.mount('#app');
app.use(store);