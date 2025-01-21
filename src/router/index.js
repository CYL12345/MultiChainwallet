import { createRouter, createWebHistory } from 'vue-router';
import WalletGenerator from '@/components/account/WalletGenerator.vue';
import LoginWallet from '@/components/account/LoginWallet.vue';
import Home from '@/components/Home.vue';
import TransacationList from '@/components/modal/TransactionList.vue';
const routes = [
    {
        path:'/LoginWallet',
        name:'LoginWallet',
        component:LoginWallet
    },
    {
        path:'/WalletGenerator',
        name:'WalletGenerator',
        component:WalletGenerator
    },
    {
        path:'/Home',
        name:'Home',
        component:Home,
        meta:{requiresAuth:true},
        children:[
            {
                path: 'transactions',
                component: TransacationList
            }
        ]
    }
];
const router = createRouter({
    history:createWebHistory(),
    routes
})
export default router;