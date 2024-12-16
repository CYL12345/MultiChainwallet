import { createRouter, createWebHistory } from 'vue-router';
import ReigisterWallet from '@/components/account/ReigisterWallet.vue';
import WalletGenerator from '@/components/account/WalletGenerator.vue';
import LoginWallet from '@/components/account/LoginWallet.vue';

const routes = [
    {
        path:'/LoginWallet',
        name:'LoginWallet',
        component:LoginWallet
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