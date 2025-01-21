<template>
    <div class="wallet-generator">
        <h2>Wallet Generator</h2>
        <div>
            <form @submit.prevent="generateMnemonic">
                <label for="password">enter PIN</label>
                <input type="password" id="password" v-model="password" required />
                <label v-for="(chain,chainId) in blockchains" :key="chainId">
                    <input type="checkbox" :value="chain.name " v-model="selectBlockChain">{{chain.name }}
                </label>
                <button type="submit">Generate Mnemonic</button>
            </form>
        </div>

        <div v-if="mnemonic" class="mnemonic-container">
            <h3>请安全保存好助记词，这是找回账户的唯一途径</h3>
            <pre class="mnemonic">{{ mnemonic }}</pre>
            <button @click="confirmAndRedirect">Confirm</button>
        </div>

        <div v-if="address" class="account-info">
            <h3>以太坊账户信息</h3>
            <p><strong>地址:</strong> {{ address }}</p>
            <p><strong>私钥:</strong> {{ privateKey }}</p>
        </div>
    </div>
</template>

<script>

    import {ref,nextTick, onMounted} from 'vue';
    import { Buffer } from 'buffer';
    import { useRouter } from 'vue-router';
    import { getChainList } from '../services/chainService';
    import { selectDeriveAccountsFromRootkey } from '../services/mnemonicService'
    import { saveEncryptedMnemonicByPWD } from '../db/walletDB'
    import BIP32Factory from 'bip32';
    import * as ecc from 'tiny-secp256k1';
    import * as bip39 from 'bip39';

    window.Buffer = Buffer;
    export default{
        setup(){
            const blockchains = ref([]);
            const password = ref(null);
            const bip32 = BIP32Factory(ecc);
            const selectBlockChain = ref([]);
            const mnemonic = ref(null);
            const privateKey = ref(null);
            const address = ref(null);
            const router = useRouter();
            //const store = useStore();
            //const accounts = ref({});

            onMounted(async() => {
                const blockchainsData  = await getChainList();
                blockchains.value = blockchainsData;
            });

            const generateMnemonic = async() =>{
                try{
                    await nextTick();
                    const userPassword = password.value;
                    const generatdMnemonic = bip39.generateMnemonic(256);
                    mnemonic.value = generatdMnemonic;
                    const seed = await bip39.mnemonicToSeed(generatdMnemonic,userPassword);
                    const rootKey = bip32.fromSeed(seed);

                    console.log(selectBlockChain);
                    selectDeriveAccountsFromRootkey(rootKey,selectBlockChain);

                    const response = await saveEncryptedMnemonicByPWD(mnemonic, password);
                    console.log('Response from saveEncryptedMnemonic:', response);
                }catch(error){
                    console.log("generateMneminic error",error);
                }
            };
            
            const confirmAndRedirect = ()=>{
                router.push({name: 'LoginWallet'});
            }

            return{
                password,
                selectBlockChain,
                blockchains,
                mnemonic,
                privateKey,
                address,
                generateMnemonic,
                confirmAndRedirect
            };
        }
    }

</script>

<style scoped>
.wallet-generator {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
}

button {
  display: block;
  margin: 20px 0;
  padding: 10px 20px;
  font-size: 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

.mnemonic-container {
  background-color: #e9f7ef;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.account-info {
  background-color: #f8f9fa;
  padding: 10px;
  border-radius: 4px;
  margin-top: 20px;
}

.mnemonic {
    white-space: pre-wrap;
}
</style>