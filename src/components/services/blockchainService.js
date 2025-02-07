import {ethers} from 'ethers';

let provider;
//let signer;
let blockListener;

export async function initializeEthers(){
    if (window.ethereum){
        try{
            //请求用户授权访问其以太坊账户
            await window.ethereum.request({method:'eth_requestAccounts'});

            //创建ethers提供者
            provider = new ethers.providers.Web3Provider(window.ethereum);
            // 创建 ethers 提供者
            //provider = new ethers.providers.WebSocketProvider('wss://mainnet.infura.io/ws/v3/dd8e2890ec5c41d68055818bdb846bae');
            //获取签名者
            //signer = provider.getSigner();

            console.log('Ethers initialized successfully');
            return provider;
        }catch (error) {
            console.error('User denied account access', error);
            throw error;
        }
    }else {
        console.error('Non-Ethereum browser detected. You should consider trying MetaMask!');
        throw new Error('Non-Ethereum browser detected.');
    }
}

export function startMonitoring(callback) {
    if (!provider) {
        console.error('Provider not initialized. Please call initializeEthers first.');
        return;
    }

    console.log('Starting block monitoring...');

    blockListener = provider.on('block',async(blockNumber)=>{
        console.log('New block number received:', blockNumber);
        try{
            const block = await provider.getBlockWithTransactions(blockNumber);
            if(!block || !block.transactions || block.transactions.length === 0){
                console.log(`No transactions found in block: ${blockNumber}`);
                return;
            }
            console.log(`transactions for Block ${blockNumber}`,block.transactions);

            const filteredTransactions = block.transactions.filter(tx => {
                const valueInEther = ethers.utils.formatEther(tx.value);
                return parseFloat(valueInEther)>= 1;
            });
            console.log(`filtered Transcations for Block ${blockNumber}`,filteredTransactions);

            if(filteredTransactions.length > 0){
                callback(filteredTransactions.map(tx =>({
                    hash:tx.hash,
                    fromAddress:tx.from,
                    toAddress:tx.to,
                    value:parseFloat(ethers.utils.formatEther(tx.value))
                })));
            }
        }catch (error){
            console.error(`Error fetching block ${blockNumber}:`, error);
        }
    });
}

export function stopMonitoring() {
    if (blockListener) {
        provider.off('block', blockListener);
        console.log('Block monitoring stopped.');
    }
  }