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
    <div>
      <TransactionList/>
    </div>
  </template>
<script>
    import { computed ,onMounted,ref} from 'vue';
    import { useStore } from 'vuex';
    import { getChainList } from './services/chainService';
    import { getWallets } from './db/walletDB';
    import TransactionList from '@/components/modal/TransactionList.vue';    export default{
        name: 'HomePage',
        components: {
          TransactionList
        },
        setup(){
            const store = useStore();
            const walletAddress = ref(null);
            const currentChainName = ref(null);
            const selectedChainId = ref(null);
            const balance = ref('-');
            const chains = ref([]);
            
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

            
            return{
              walletAddress,
              currentChainName,
              selectedChainId,
              chains,
              handleChainChange,
              balance,
            };
        },
    }
</script>