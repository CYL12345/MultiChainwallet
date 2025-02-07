<template>
    <div class="trade-history">
        <h2>Trade History for {{ symbol }}</h2>
        <label for="symbol">Enter Symbol(e.g., BTC-USDT): </label>
        <input type="text" id="symbol" v-model="symbol"/>
        <button @click="fetchTradeHistoy">Fetch Trade History</button>

        <ul v-if="trades.length > 0">
            <li v-for="trade in trades" :key="trade.tradeId">
                {{ trade.instId }} - Price:{{ trade.px }} - Size: {{ trade.sz }}
            </li>
        </ul>

        <p v-if="error">{{ error }}</p>
    </div>
</template>

<script setup>
    import axios from 'axios';
    import { ref } from 'vue';
    
    const error = ref(null);
    const trades = ref([]);
    const symbol = ref('');

    const fetchTradeHistoy = async()=>{
        try{
            console.log(symbol);
            const response = await axios.get('http://localhost:8080/api/trade-history',{
                params:{
                    symbol: symbol.value,
                }
            });
            trades.value = response.data.data;
            console.log(trades.value)
            error.value = null;
        }catch(error){
            console.error('Error fetching trade history:', error);
            error.value = 'Failed to fetch trade history. Please check the symbol and try again.';
            trades.value = [];
        }
    }

</script>

<style scoped>
.trade-history {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

label {
  display: block;
  margin-bottom: 5px;
}

input {
  width: calc(100% - 22px);
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  margin: 5px 0;
  padding: 10px;
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 4px;
}

p {
  color: red;
}
</style>

