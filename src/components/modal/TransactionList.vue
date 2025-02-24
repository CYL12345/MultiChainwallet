<template>
    <div class="transcation-list">
        <h2>Transaction History</h2>

        <!-- 展示交易记录 -->
        <table v-if="transactions.length > 0" border="1" cellpadding="10" cellspacing="0" width="100%">
            <thead>
                <tr>
                <th>Hash</th>
                <th>Value</th>
                <th>From</th>
                <th>To</th>
                <th>Timestamp</th>
                </tr>
            </thead>
        <tbody>
            <tr v-for="(transaction, index) in transactions" :key="index">
            <td>{{ transaction.hash }}</td>
            <td>{{ transaction.value }}</td>
            <td>{{ transaction.from }}</td>
            <td>{{ transaction.to || 'N/A' }}</td>
            <td>{{ formatDate(transaction.timestamp) }}</td>
            </tr>
        </tbody>
        </table>
    </div>
</template>

<script setup>

import { onMounted,ref} from 'vue';
import { fetchAndPrintNormalTransactionHistoryByNetwork } from '../services/transactionService';
import { useStore } from 'vuex';

    const transactions = ref([]);
    //const ETHERSCAN_API_KEY = ref(null);
    const ADDRESS = ref(null);
    const CHAIN_NAME = ref(null);
    const store = useStore();

            onMounted(async()=>{
                ADDRESS.value = store.getters['wallet/getWallet'];
                CHAIN_NAME.value = store.getters['chains/getCurrentChainName'];
                transactions.value  = await fetchAndPrintNormalTransactionHistoryByNetwork(CHAIN_NAME.value,ADDRESS.value);
                console.log('Transactionlist',transactions.value)

            })

            const formatDate = (dateString) => {
                if (dateString === 'Invalid Date') {
                    return 'Invalid Date';
                }
                const date = new Date(dateString);
                if (isNaN(date.getTime())) {
                    return 'Invalid Date';
                }
            return date.toLocaleString(); // 格式化为本地日期字符串
            };
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