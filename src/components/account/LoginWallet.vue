<template>
    <h2>Wallet Login</h2>
    <div>
        <form @submit.prevent="loginWallet">
            <label for="password">enter PID</label>
            <input type="password" id="password" v-model="password" required />
            <button type="submit">LOGIN</button>
            <p v-if="error">{{ error }}</p>
        </form>
    </div>
</template>

<script>
    import {ref,onMounted,nextTick,toRaw} from 'vue';
    import { useStore } from 'vuex';
    import { useRouter } from 'vue-router';
    import { useLocalStorage } from '@vueuse/core';
    import { getEncryptedMnemonicByPWD,saveEncryptedMnemonicByPSS,setWallets } from '../db/walletDB';
    import { initializeAllWallet } from '../services/chainService';
    import { generatdSessionKey } from '../services/mnemonicService';
    import { fetchAndPrintTransactionHistory } from '../services/ethTransactionService';

    export default{
        setup(){
            const error = ref(null);
            const address = ref(null)
            const password = ref('');
            const store = useStore();
            const router = useRouter();
            const isAuthenticated = useLocalStorage('isAuthenticated',false);
            onMounted(() =>{
                address.value = localStorage.getItem('address');
            });

            const loginWallet = async () =>{ 
                try{
                    await nextTick();
                    const userPassword = password.value;
                    const decryptedMnemonic =await getEncryptedMnemonicByPWD(userPassword);
                    if(decryptedMnemonic){
                        const wallets = toRaw(await initializeAllWallet(decryptedMnemonic,password));
                        const chain = 'Ethereum Mainnet';
                        const currentChainId = '1';
                        const sessionKey = generatdSessionKey();
                        
                        store.dispatch('wallet/addWallet',{id:currentChainId, wallet:wallets[chain].walletAddress, balance:wallets[chain].balance});
                        store.dispatch("chains/setCurrentChainId",currentChainId);
                        console.log('loginWallet', store.getters['wallet/getBalance']);


                        saveEncryptedMnemonicByPSS(decryptedMnemonic,sessionKey);

                        localStorage.setItem('sessionKey',sessionKey);
                        store.commit('sessionKey/SET_SESSION_KEY',sessionKey);
                        store.dispatch('sessionKey/startSessionTimer');

                        setWallets(wallets);

                        fetchAndPrintTransactionHistory(wallets[chain].walletAddress);

                        isAuthenticated.value = true;
                        router.push({name:'Home'});
                    }else{
                        error.value = "login error.";
                    }
                }catch(error){
                    console.error("loginWallet error",error);
                }
            };

        
            return{
                password,
                address,
                error,
                loginWallet
            }
        }
    }
</script>