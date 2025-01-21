import { ethers } from "ethers";
import {ref,computed} from 'vue';
import { chainConfig } from "./chainConfig";
import { selectDeriveAccountsFromRootkey } from "../services/mnemonicService";


const selectBlockChains = ref([]);
const wallet = ref(null);
const currentChainId = ref('1');
let currentChain = computed(() => chainConfig[currentChainId.value]);



export function initializeAllWallet(mnemonic,password){
    try{
        if(!mnemonic){return;}
        const provider = new ethers.providers.JsonRpcProvider(currentChain.value.url);
        checkConnection(provider).then(success => {
         if(success){
             currentChain = computed(() => chainConfig[currentChainId.value])
             console.log("Provider connected successfully.");
         }else{
                 console.log("Provider connection failed.");
             }
        });
        Object.values(chainConfig).forEach(chain => {
            selectBlockChains.value.push(chain.name);
          });
        //const wallets = selectDeriveAccountsFromRootkey(rootKey,selectBlockChains);
        const wallets = selectDeriveAccountsFromRootkey(mnemonic,password,selectBlockChains);

        console.log('initializeWallet',wallets);

        return wallets;
    }catch(error){
        console.error(error);
    }
}

export async function switchChain(chainId,selectWallet) {
    if(chainId.value === currentChainId.value){return;}
    currentChainId.value = chainId.value;
    console.log('switchChain',selectWallet);
    if(selectWallet){
        const provider = new ethers.providers.JsonRpcProvider(chainConfig[chainId.value].url);
        checkConnection(provider).then(success => {
            if(success){
                console.log("Provider connected successfully.");
            }else{
                console.log("Provider connection failed.");
            }
        });
        wallet.value = selectWallet.connect(provider);
        return wallet;
    }
    updateState();
}

export async function getChainList() {
    const chainListArray = chainConfig;
    return chainListArray;
}

export async function checkConnection(provider) {
    try{
        const network = await provider.getNetwork();
        console.log("Connected to network:",network);
        return true;
    }catch(error){
        console.error("Failed to connect to the provider:",error);
        return false;
    }
}

export function getWalletAddress(){
    return wallet.value?.address || null;
}

export function getCurrentChainName(){
    return currentChain.value.name
}

export function updateState(){
    console.log('Updating state for chain:', currentChain.value.name);
}