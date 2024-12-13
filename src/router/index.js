import { createRouter, createWebHistory } from 'vue-router';
import ConnectWallet from '@/components/ConnectWallet.vue';
import Home from '@/components/Home.vue';
import ETHConnect from '@/components/ETHConnect.vue';
import ReigisterWallet from '@/components/account/ReigisterWallet.vue';
import WalletGenerator from '@/components/account/WalletGenerator.vue';
import LoginWallet from '@/components/account/LoginWallet.vue';

const routes = [
    {
        path:'/ConnectWallte',
        name:'ConnectWallte',
        component:ConnectWallet
    },
    {
        path:'/LoginWallet',
        name:'LoginWallet',
        component:LoginWallet
    },
    {
        path:'/',
        name:'Home',
        component:Home
    },
    {
        path:'/ETHConnect',
        name:'ETHConnect',
        component:ETHConnect
    },
    {
        path:'/ReigisterWallet',
        name:'ReigisterWallet',
        component:ReigisterWallet
    },
    {
        path:'/WalletGenerator',
        name:'WalletGenerator',
        component:WalletGenerator
    },
];
const router = createRouter({
    history:createWebHistory(),
    routes
})
export default router;