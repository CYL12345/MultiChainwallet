
<template>
    <div class="wallet-generator">
        <h2>Wallet Generator</h2>
        <div>
            <form @submit.prevent="generateMnemonic">
                <label for="password">enter PIN</label>
                <input type="password" id="password" v-model="password" required/>
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

    import {ref} from 'vue';
    import {ethers} from 'ethers';
    import * as bip39 from 'bip39';
    import { Buffer } from 'buffer';
    import CryptoJS from 'crypto-js';

    window.Buffer = Buffer;
    export default{
        setup(){
            const mnemonic = ref(null);
            const privateKey = ref(null);
            const address = ref(null);
            const generateMnemonic = (password) =>{
                try{
                    
                    const generatdMnemonic = bip39.generateMnemonic(256);
                    mnemonic.value = generatdMnemonic;

                    const encryptedMnemonic = encryptMnemonic(generatdMnemonic.toString(),password.toString());

                    localStorage.setItem('encryptedMnemonic',encryptedMnemonic);


                    deriveAccountFromMnemonic(generatdMnemonic);
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
            /*
            const decryptMnemonic = async(password,encryptedDate)=>{
                try{
                    const decryptedDate =  await ethers.utils.decrypt(password,encryptedDate);
                    return decryptedDate;
                }catch(error){
                    console.log("decryptMnemonic error",error);
                }
            };
            */

            const deriveAccountFromMnemonic = (mnemonic) =>{
                try{
                    //const seed = bip39.mnemonicToSeedSync(mnemonic);

                    const wallet = ethers.Wallet.fromMnemonic(mnemonic,"m/44'/60'/0'/0/0");

                    privateKey.value = wallet.privateKey;
                    address.value = wallet.address;

                    console.log('Generated private key:', wallet.privateKey);
                    console.log('Generated address:', wallet.address);
                }catch(error){
                    console.error('Error deriving account from mnemonic:', error);   
                }
            };

            return{
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