<template>
    <h2>Wallet Login</h2>
    <div>
        <form @submit.prevent="loginWallet">
            <label for="password">enter PID</label>
            <input type="password" id="password" v-model="password" required />
            <button type="submit">LOGIN</button>
            <p v-if="address">{{ address }}</p>
            <p v-if="error">{{ error }}</p>
        </form>
    </div>
</template>

<script>
    import {ref,onMounted,nextTick} from 'vue';
    import { ethers } from 'ethers';
    import CryptoJS from 'crypto-js';
    import { useRouter } from 'vue-router';
    import * as bip39 from 'bip39';

    export default{
        setup(){
            const error = ref(null);
            const address = ref(null)
            const password = ref('');
            const router = useRouter();
            onMounted(() =>{
                address.value = localStorage.getItem('address');
            });

            const loginWallet = async () =>{
                try{
                    await nextTick();
                    const userPassword = password.value;
                    const encryptedMnemonic =await localStorage.getItem('encryptedMnemonic');
                    console.log("encryptedMnemonic:",encryptedMnemonic);
                    console.log("密码:",password);

                    if(!encryptedMnemonic || !userPassword){
                        error.value = "No account found or password is empty.";
                        return;
                    }
                    const decryptBool = decrytpMnemonic(encryptedMnemonic.toString(),userPassword);
                    if(decryptBool){
                        console.log("login success.");
                        router.push({name:'Home'});
                    }else{
                        error.value = "login error.";
                    }
                }catch(error){
                    console.log("loginWallet error",error);
                }
            };

            const decrytpMnemonic = (encryptedMnemonic,password) =>{
                try{
                    const bytes = CryptoJS.AES.decrypt(encryptedMnemonic,password);
                    let decryptedMnemonic = '';
                     if(bytes.toString(CryptoJS.enc.Utf8)){
                        decryptedMnemonic = bytes.toString(CryptoJS.enc.Utf8);
                    }else{
                        console.log(bytes.toString(CryptoJS.enc.Utf8));
                        throw new Error("Incorrect password");
                    }

                    if(!bip39.validateMnemonic(decryptedMnemonic)){
                        throw new Error("Invalid mnemonic");
                    }

                    const wallet = ethers.Wallet.fromMnemonic(decryptedMnemonic);
                    address.value = wallet.address;
                    error.value = ''; // Clear any previous errors
                    return true;
                }catch(error){
                    console.error("login Failed",error);
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