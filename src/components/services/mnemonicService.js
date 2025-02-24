import CryptoJS from 'crypto-js';
import {ethers, Wallet} from 'ethers';
import {ref,computed} from 'vue';
import { chainConfig } from "./chainConfig";
import * as bip39 from 'bip39';
import BIP32Factory from 'bip32';
import * as ecc from 'tiny-secp256k1';

//import * as ed25519 from 'ed25519-hd-key';

const bip32 = BIP32Factory(ecc);
const wallets = ref({});
const currentChainId = ref(null);
let currentChain = null;


export function encryptMnemonic(generatdMnemonic,password){
    try{
        if(typeof generatdMnemonic !== 'string'||typeof password !== 'string'){
            throw new Error('generatdMnemonic and password must be strings.');
        }
        const encryptedData = CryptoJS.AES.encrypt(generatdMnemonic,password);
        return encryptedData.toString();
    }catch(error){
        console.error('encryptMnemonic error',error);
    }
}

export async function decryptMnemonic(encryptedMnemonic,password){
    try{
        console.log('decryptMnemonic的',encryptedMnemonic,password);
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
        
        return decryptedMnemonic;
    }catch(error){
        console.error('mnemonicService decryptedMnemonic ERROR',error);
    }
}

export async function selectDeriveAccountsFromRootkey(mnemonic,password,selectBlockChain){
    try{
        const seed = await bip39.mnemonicToSeed(mnemonic,password.value);
        const rootKey = bip32.fromSeed(seed);

        const derivePromise = selectBlockChain.value.map(async (chain)=>{
            let path;
            switch(chain){
                case 'ethereum':{
                    path = "m/44'/60'/0'/0/0";
                    currentChainId.value = '1';
                    currentChain = computed(() => chainConfig[currentChainId.value]);
                    break;

                }
                case 'bsc':{
                    path = "m/44'/60'/1'/0/0";
                    currentChainId.value = '56';
                    currentChain = computed(() => chainConfig[currentChainId.value]);
                    break;
                }
                case 'Pol':{
                    path = "m/44'/60'/2'/0/0";
                    currentChainId.value = '137';
                    currentChain = computed(() => chainConfig[currentChainId.value]);
                    break;
                }
                default:
                    console.warn(`Unsupported blockchain: ${chain}`);
                    return; // 忽略不支持的区块链
            }
            await deriveAccountFromRootKey(rootKey,path,chain);
        });
        await Promise.all(derivePromise);
        return wallets.value;
    }catch(error){
        console.error('selectDeriveAccountsFromRootkey error',error);
    }
}

export async function deriveAccountFromRootKey(rootKey,path,chain){
    try{
        const node = rootKey.derivePath(path);
        if (node.privateKey.length !== 32) {
            throw new Error('Invalid private key length. Expected 32 bytes.');
        }
        const privateKey = ethers.utils.hexlify(node.privateKey).replace('0x','');
        const wallet = new Wallet(privateKey);
        const provider = new ethers.providers.JsonRpcProvider(currentChain.value.url);
        const balanceInWei = await provider.getBalance(wallet.address);
        const balanceInEth = ethers.utils.formatEther(balanceInWei);
        wallets.value[chain]={
            path:path,
            walletAddress:wallet.address,
            balance:balanceInEth
        };
    
        return wallet;
    }catch(error){
        console.error('deriveAccountFromRootKey error',error);
    }
    
}

export function generatdSessionKey() {
    return CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Hex);
}


