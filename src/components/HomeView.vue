<template>
    <div>
    <select v-model="selectedChainId" v-if="chains" @change="handleChainChange">
      <option v-for="(chain, chainId) in chains" :key="chainId" :value="chainId">
        {{ chain.name }}
      </option>
    </select>
    <p>Selected Chain ID: {{ selectedChainId }}</p>
    </div>

    <div>
      <h1>My Accounts</h1>
      <div>
        <ul>余额{{ balance !== '-' ? balance : '加载中...' }}</ul>
        <ul v-if="currentChainName">{{ currentChainName }}</ul>
        <ul v-if="walletAddress">{{ walletAddress }}</ul>
        <p v-else>No accounts found.</p>
      </div>
    </div>

      <button @click="openModal">转账</button>
        <teleport to="body">
          <div v-if="isModalVisible" class="modal-overlay">
            <div class="modal">
              <button class="close-button" @click="closeModal">&times;</button>

              <h3>输入转入地址</h3>
              <input type="text" id="toAddress" v-model="toAddress" placeholder="输入转入地址">
              <h3>输入密码</h3>
              <input type="password" v-model="password" placeholder="输入密码">
              <h3>输入转账金额</h3>
              <input type="number" v-model="amount" placeholder="输入金额（ETH）">
              <button @click="confirmInput">确认</button>
            </div>
          </div>
        </teleport>
    <div>
      <TransactionList/>
    </div>
</template>
<script setup>
    import TransactionList from '@/components/modal/TransactionList.vue';    
    import { computed ,onMounted,ref} from 'vue';
    import { useStore } from 'vuex';
    import { getChainList } from './services/chainService';
    import { getWallets } from './db/walletDB';
    import { transferViaPorxy } from './services/transferService';
   
            const store = useStore();
            const walletAddress = ref(null);
            const currentChainName = ref(null);
            const selectedChainId = ref(null);
            const balance = ref('-');
            const chains = ref([]);
            const isModalVisible = ref(false);
            const toAddress = ref("");
            const password = ref("");
            const amount = ref(null);

            onMounted(async()=>{
              try{
                currentChainName.value = store.getters['chains/getCurrentChainName'];
                selectedChainId.value = store.getters['chains/getCurrentChainId'];
                walletAddress.value = computed(() => store.getters['wallet/getWallet']);
                balance.value = store.getters['wallet/getBalance'];
                console.log('home',balance.value);
                const chainsData = await getChainList();
                chains.value = chainsData;
              }catch(error){
                console.error('Failed to fetch chains:', error);
              }
            });

            const openModal = () =>{
              isModalVisible.value = true;
            }

            const closeModal = () =>{
              isModalVisible.value = false;
              toAddress.value = "";
            }

            const confirmInput = () =>{
              if(toAddress.value.trim() !== ""){
                transferViaPorxy(selectedChainId.value,password.value,toAddress.value,amount.value);
                closeModal();
              }else{
                alert("请检查输入内容")
              }
            }

            const handleChainChange = async() =>{
              store.dispatch("chains/setCurrentChainId",selectedChainId.value);
              currentChainName.value =store.getters['chains/getCurrentChainName'];
              const wallets = await getWallets();
              console.log('handleChainChange:', wallets);

              //const walletConnect = await switchChain(selectedChainId,wallet);

              store.dispatch('wallet/addWallet',{id:selectedChainId.value, wallet:wallets[currentChainName.value].walletAddress});
              updateState();
            }

            const updateState = async() =>{
              console.log("currentChainName",currentChainName);
              currentChainName.value =store.getters['chains/getCurrentChainName'];
              walletAddress.value = computed(() => store.getters['wallet/getWallet']);
            }

</script>
<style>
/* 弹窗遮罩层样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 弹窗样式 */
.modal {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 350px;
  position: relative;
}

/* 关闭按钮样式 */
.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background: red;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 5px 10px;
  border-radius: 50%;
}

.close-button:hover {
  background: darkred;
}

/* 输入框和按钮样式 */
input {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  padding: 10px 20px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background: #35a172;
}
</style>