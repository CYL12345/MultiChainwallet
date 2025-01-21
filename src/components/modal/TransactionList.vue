<template>
    <div class="transcation-list">
        <h2>Transaction History</h2>
        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Hash</th>
                    <th>Value</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Time</th>
                </tr>
            </thead>
        </table>
        <tbody>
            <tr v-for="(tx, index) in transactions" :key="tx.hash">
                <td>{{ index + 1 }}</td>
                <td>{{ tx.hash }}</td>
                <td>{{ tx.value }} ETH</td>
                <td>{{ tx.from }}</td>
                <td>{{ tx.to }}</td>
                <td>{{ tx.timestamp }}</td>
            </tr>
        </tbody>
    </div>
</template>

<script>

import { computed ,onMounted,ref} from 'vue';
import { fetchAndPrintTransactionHistory } from '../services/ethTransactionService';
import { useStore } from 'vuex';


    export default {
        name:'HomePage',

        setup(){
            const transactions = ref([]);
            //const ETHERSCAN_API_KEY = ref(null);
            const ADDRESS = ref(null);
            const store = useStore();

            onMounted(async()=>{
                ADDRESS.value = computed(() => store.getters['wallet/getWallet']);
                transactions.value = fetchAndPrintTransactionHistory(ADDRESS);
            })
        } 
    }
</script>
<style scoped>
/* 添加样式 */
.transaction-list {
  margin: 20px;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  padding: 8px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}
</style>