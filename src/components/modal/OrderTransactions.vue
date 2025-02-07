<template>
    <div>
      <h1>Real-time Transactions</h1>
      <label for="amountRange">Filter by amount (ETH): </label>
      <input type="number" id="amountRange" v-model="amountRange" @change="fetchTransactions">
      <table>
        <thead>
          <tr>
            <th>Hash</th>
            <th>From Address</th>
            <th>To Address</th>
            <th>Value (ETH)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(transaction, index) in filteredTransactions" :key="transaction.hash">
            <td style="width: 30%;">
              <span>{{ shortenHash(transaction.hash) }}</span>
              <button @click="toggleDetails(index)">...</button>
              <div v-if="expandedIndex === index" class="details">
                {{ transaction.hash }}
              </div>
            </td>
            <td style="width: 25%;">
              <span>{{ shortenAddress(transaction.fromAddress) }}</span>
              <button @click="toggleDetails(index)">...</button>
              <div v-if="expandedIndex === index" class="details">
                {{ transaction.fromAddress }}
              </div>
            </td>
            <td style="width: 25%;">
              <span>{{ shortenAddress(transaction.toAddress) }}</span>
              <button @click="toggleDetails(index)">...</button>
              <div v-if="expandedIndex === index" class="details">
                {{ transaction.toAddress }}
              </div>
            </td>
            <td style="width: 20%;">
              {{ transaction.value }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>

<script>
import { initializeEthers,startMonitoring,stopMonitoring } from '../services/blockchainService';

export default {
    data(){
        return {
            transactions: [],
            amountRange: 1
        };
    },
    computed: {
    filteredTransactions() {
      return this.transactions.filter(tx => tx.value >= this.amountRange);
    }
  },
    methods:{
        async initializeAndStartMonitoring(){
            try{
                await initializeEthers()
                startMonitoring(this.updateTransactions);
            }catch(error) {
                console.error('Failed to initialize ethers:', error);
            }
        },
        updateTransactions(newTransactions){
            this.transactions.unshift(...newTransactions);
        },
        fetchTransactions() {
            // 清空现有交易列表以便重新筛选
            this.transactions = [];
            this.initializeAndStartMonitoring();
        },
        shortenHash(hash) {
            return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
        },
        shortenAddress(address) {
            return `${address.slice(0, 6)}...${address.slice(-4)}`;
        },
        toggleDetails(index) {
            this.expandedIndex = this.expandedIndex === index ? null : index;
        }
    },
    mounted() {
        this.initializeAndStartMonitoring();
    },
    beforeUnmount() {
        stopMonitoring();
    }
}
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 8px;
  text-align: left;
  border-bottom: 1px solid #ddd;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

th {
  background-color: #f2f2f2;
}

.details {
  margin-top: 5px;
  font-size: 0.9em;
  color: #555;
}

button {
  margin-left: 5px;
  background-color: transparent;
  border: none;
  cursor: pointer;
  font-size: 0.9em;
  color: #007bff;
}

button:hover {
  text-decoration: underline;
}
</style>