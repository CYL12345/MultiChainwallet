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
    <div>
        <form @submit.prevent="enterAccount">
            <label for="privateKey">enter privateKey</label>
            <input type="text" id="privateKey" v-model="privateKey" required />
            <label for="netwrok">enter network</label>
            <input type="text" id="network" v-model="network" required />
            <label for="networkAccountPassword">enter password</label>
            <input type="password" id="networkAccountPassword" v-model="networkAccountPassword"> 
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
    import { initializeAllWallet,importWalletByPrivateKey } from '../services/chainService';
    import { generatdSessionKey } from '../services/mnemonicService';
    //import { fetchAndPrintTransactionHistory } from '../services/ethTransactionService';
    //import { fetchAndPrintTransactionHistoryByNetwork } from '../services/testnetworkTransactionService';
    import { fetchAndPrintNormalTransactionHistoryByNetwork } from '../services/transactionService';
    import { ethers } from "ethers";

    export default{
        setup(){
            const error = ref(null);
            const address = ref(null)
            const password = ref('');
            const store = useStore();
            const router = useRouter();
            const isAuthenticated = useLocalStorage('isAuthenticated',false);
            const privateKey = ref('');
            const network = ref('');
            const networkAccountPassword = ref('');

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
                        const chain = 'ethereum';
                        const currentChainId = '1';
                        const sessionKey = generatdSessionKey();
                        
                        store.dispatch('wallet/addWallet',{id:currentChainId, wallet:wallets[chain].walletAddress, balance:wallets[chain].balance});
                        store.dispatch("chains/setCurrentChainId",currentChainId);
                        store.dispatch("chains/setCurrentChainName",chain);
                        console.log('loginWallet', store.getters['chains/getCurrentChainName']);


                        saveEncryptedMnemonicByPSS(decryptedMnemonic,sessionKey);

                        localStorage.setItem('sessionKey',sessionKey);
                        store.commit('sessionKey/SET_SESSION_KEY',sessionKey);
                        store.dispatch('sessionKey/startSessionTimer');

                        setWallets(wallets);

                        fetchAndPrintNormalTransactionHistoryByNetwork(chain,wallets[chain].walletAddress);

                        isAuthenticated.value = true;
                        router.push({name:'Home'});
                    }else{
                        error.value = "login error.";
                    }
                }catch(error){
                    console.error("loginWallet error",error);
                }
            };

            const enterAccount = async() =>{
              try{
                const wallet = await importWalletByPrivateKey(privateKey.value);
                const provider = new ethers.providers.JsonRpcProvider(network.value);
                const account = wallet.connect(provider);
                const balance = await account.getBalance();
                const balanceETH = ethers.utils.formatEther(balance);
                const chainName = "ganache";
                store.dispatch('wallet/addWallet',{id:network.value, wallet:wallet.address, balance:balanceETH});
                store.dispatch("chains/setCurrentChainName",chainName);
                store.dispatch("chains/setCurrentChainId",network.value);

                await fetchAndPrintNormalTransactionHistoryByNetwork(chainName,wallet.address);
                isAuthenticated.value = true;
                
                const encyptedAccountJson = await wallet.encrypt(networkAccountPassword.value);
                localStorage.setItem("encyptedAccountJson",encyptedAccountJson);

                router.push({name:'HomeView'});
              }catch (error){
                console.error("enterAccount",error);
              }
            }

            return{
                password,
                address,
                error,
                loginWallet,
                enterAccount,
                privateKey,
                network,
                networkAccountPassword
            }
        }
    }
</script>