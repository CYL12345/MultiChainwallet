import { createRouter, createWebHistory } from 'vue-router';
import WalletGenerator from '@/components/account/WalletGenerator.vue';
import LoginWallet from '@/components/account/LoginWallet.vue';
import HomeView from '@/components/HomeView.vue';
import TransacationList from '@/components/modal/TransactionList.vue';
import OrderTransactions from '@/components/modal/OrderTransactions.vue';
import TradeHistory from '@/components/modal/TradeHistory.vue';
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
        path:'/OrderTransactions',
        name:'OrderTransactions',
        component:OrderTransactions
    },
    {
        path:'/TradeHistory',
        name:'TradeHistory',
        component:TradeHistory
    },
    {
        path:'/HomeView',
        name:'HomeView',
        component:HomeView,
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