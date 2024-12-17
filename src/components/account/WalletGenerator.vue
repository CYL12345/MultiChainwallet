
<template>
    <div class="wallet-generator">
        <h2>Wallet Generator</h2>
        <div>
            <form @submit.prevent="generateMnemonic">
                <label for="password">enter PIN</label>
                <input type="password" id="password" v-model="password" required />
                <label v-for="(chain,index) in blockchains" :key="index">
                    <input type="checkbox" :value="chain.value" v-model="selectBlockChain">{{chain.label}}
                </label>
                <button type="submit">Generate Mnemonic</button>
            </form>
        </div>

        <div v-if="mnemonic" class="mnemonic-container">
            <h3>mnemonic</h3>
            <pre class="mnemonic">{{ mnemonic }}</pre>
        </div>

        <div v-if="address" class="account-info">
            <h3>以太坊账户信息</h3>
            <p><strong>地址:</strong> {{ address }}</p>
            <p><strong>私钥:</strong> {{ privateKey }}</p>
        </div>
    </div>
</template>

<script>

    import {ref,nextTick} from 'vue';
    import {ethers, Wallet} from 'ethers';
    import { Buffer } from 'buffer';
    import { Keypair } from '@solana/web3.js';
    import { useRouter } from 'vue-router';
    import CryptoJS from 'crypto-js';
    import BIP32Factory from 'bip32';
    import * as ecc from 'tiny-secp256k1';
    import * as bip39 from 'bip39';
    import * as ed25519 from 'ed25519-hd-key';

    window.Buffer = Buffer;
    export default{
        setup(){
            const blockchains =ref([
                {label:'ethereum',value:'ethereum'},
                {label:'Binance Smart Chain',value:'binance'},
                {label:'Polygon',value:'polygon'},
                {label:'Solana',value:'solana'},
            ])
            const password = ref(null);
            const bip32 = BIP32Factory(ecc);
            const selectBlockChain = ref([]);
            const mnemonic = ref(null);
            const privateKey = ref(null);
            const address = ref(null);
            const accounts = ref({});
            const router = useRouter();

            const generateMnemonic = async() =>{
                try{
                    await nextTick();
                    console.log('密码',password);
                    const userPassword = password.value;
                    const generatdMnemonic = bip39.generateMnemonic(256);
                    mnemonic.value = generatdMnemonic;

                    const seed = await bip39.mnemonicToSeed(generatdMnemonic,userPassword);
                    const rootKey = bip32.fromSeed(seed);

                    const encryptedMnemonic = encryptMnemonic(generatdMnemonic.toString(),userPassword.toString());
                    localStorage.setItem('encryptedMnemonic',encryptedMnemonic);
                
                    deriveAccountFromMnemonic(seed,rootKey);
                    await router.push({name: 'LoginWallet'});
                }catch(error){
                    console.log("generateMneminic error",error);
                }
            };
            
            const encryptMnemonic = (generatdMnemonic,password)=>{
                try{
                    // Ensure both mnemonic and password are strings
                    if (typeof generatdMnemonic !== 'string' || typeof password !== 'string') {
                        throw new Error('generatdMnemonic and password must be strings.');
                    }
                    const encryptedDate =  CryptoJS.AES.encrypt(generatdMnemonic,password);
                    console.log('encryptedDate',encryptedDate);
                    return encryptedDate.toString();
                }catch(error){
                    console.log("encryptMnemonic error",error);
                }
            };

            const deriveAccountFromMnemonic = (seed,rootKey) =>{
                try{
                    selectBlockChain.value.forEach(chain=>{
                        let path,wallet;
                        switch(chain){
                            case 'ethereum':{
                                path = "m/44'/60'/0'/0/0";
                                const ethNode = rootKey.derivePath(path);
                                // 确保私钥是 32 字节
                                if (ethNode.privateKey.length !== 32) {
                                    throw new Error('Invalid private key length. Expected 32 bytes.');
                                }
                                const ethPrivateKey = `${ethers.utils.hexlify(ethNode.privateKey)}`;
                                wallet = new Wallet(ethPrivateKey);
                                accounts.value[chain]={
                                    address:wallet.address,
                                    privateKey:ethPrivateKey,
                                    balance:0,
                                };
                            }
                            break;

                            case 'binance':
                                {
                                    path =  "m/44'/60'/1'/0/0";
                                    const bscNode = rootKey.derivePath(path);

                                    if (bscNode.privateKey.length !== 32) {
                                        throw new Error('Invalid private key length. Expected 32 bytes.');
                                    }
                                    const bscPrivateKey = `${ethers.utils.hexlify(bscNode.privateKey)}`;
                                    wallet = new Wallet(bscPrivateKey);
                                    accounts.value[chain]={
                                        address:wallet.address,
                                        privateKey:bscPrivateKey,
                                        balance:0,
                                    };
                                }
                                break;
                            
                                case 'polygon':
                                    {
                                        path = "m/44'/60'/2'/0/0";
                                        const polNode = rootKey.derivePath(path);

                                        if (polNode.privateKey.length !== 32) {
                                            throw new Error('Invalid private key length. Expected 32 bytes.');
                                        }
                                        const polPrivateKey = `${ethers.utils.hexlify(polNode.privateKey)}`;
                                        wallet = new Wallet(polPrivateKey);
                                        accounts.value[chain]={
                                            address:wallet.address,
                                            privateKey:polPrivateKey,
                                            balance:0,
                                        };
                                    }
                                    break;

                                case 'solana':
                                    {
                                        const path = "m/44'/501'/0'/0'";
                                        console.log(seed.toString("hex"));
                                        const solanaKeypair = Keypair.fromSeed(ed25519.derivePath(path, seed.toString("hex")).key);
                                        console.log(solanaKeypair);
                                        accounts.value[chain] = {
                                            address: solanaKeypair.publicKey.toBase58(),
                                            privateKey: solanaKeypair.secretKey,
                                            balance: 0,
                                        };
                                    }
                                    break;
                            }
                            console.log(`${chain} 地址:`, accounts.value[chain].address);
                        });
                }catch(error){
                    console.error('Error deriving account from mnemonic:', error);   
                }
            };

            return{
                password,
                selectBlockChain,
                blockchains,
                mnemonic,
                privateKey,
                address,
                generateMnemonic,
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