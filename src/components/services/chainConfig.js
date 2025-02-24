//import { timestamp } from "@vueuse/core";
import { ethers } from "ethers";

export const chainConfig = {
    [1]:{
        id:1,
        name:'ethereum',
        url:'HTTP://127.0.0.1:7545',
        //url:'https://mainnet.infura.io/v3/dd8e2890ec5c41d68055818bdb846bae',
    },
    [56]:{//Binance Smart Chain Mainnet
        id:56,
        name:'bsc',
        url:'https://bsc-dataseed.binance.org/',
    },
    [137]:{// Polygon Mainnet
        id:137,
        name:'Polygon',
        url:'https://polygon-mainnet.infura.io/v3/dd8e2890ec5c41d68055818bdb846bae'
    },
};

export const chains = {
    ethereum:{
        name: 'ethereum',
        providerUrl:"'https://mainnet.infura.io/v3/UPT9YBDS2IYSCVKAGN7IFR2XEV4SJY3KGI",
        getProvider: ()=> new ethers.providers.InfuraProvider('mainnet', 'UPT9YBDS2IYSCVKAGN7IFR2XEV4SJY3KGI'),
        checkNetwork: async (provider) => {
            const network = await provider.getNetwrok();
            return network.chainId === 1;
        },
        getTokenSymbol: async (contractAddress, provider) => {
            const abi = ["function symbol() view returns (string)"];
            const contract = new ethers.Contract(contractAddress, abi, provider);
            return await contract.symbol();
        },
        getNormalTransactions: async (address, provider) =>{
            console.log('getNormalTransactions');
            const bolckNumber = await provider.getBlockNumber();
            const transactions = [];
            for(let i=0 ;i<=bolckNumber;i++){
                const block = await provider.getBlockWithTransactions(i);
                block.transactions.forEach(tx => {
                    if(tx.from === address || tx.to === address){
                        transactions.push({
                            hash: tx.hash,
                            value: parseFloat(ethers.utils.formatEther(tx.value)).toFixed(4),
                            from: tx.from,
                            to: tx.to,
                            timestamp: new Date(parseInt((provider.getBlock(tx.blockNumber)).timestamp) * 1000).toLocaleString()
                        });
                    }
                });
            }
            console.log('getNormalTransactions',transactions);
            return transactions;
        },
        getTokenTransfers: async (address, provider) => {
            const erc20TransferEventSignature = ethers.utils.id("Transfer(address,address,uint256)");
            const filter = {
                address:null,//查询所有合约
                topics:[
                    erc20TransferEventSignature,
                    [null, ethers.utils.hexZeroPad(address, 32)], // 监听 from 或 to 地址
                    [null, ethers.utils.hexZeroPad(address, 32)]  // 监听 from 或 to 地址
                ]
            };
            const logs = await provider.getLogs({
                fromBlock: 0,
                toBlock: 'latest',
                ...filter
            });
            const transfers = await Promise.all(logs.map(async (log) =>{
                const decodedData = ethers.utils.defaultAbiCoder.decode(['address', 'address', 'uint256'], log.data);
                const tokenAddress = log.address;
                const from = decodedData[0];
                const to = decodedData[1];
                const value = ethers.utils.formatUnits(decodedData[2],18);
                const tokenSymbol = await chains.ethereum.getTokenSymbol(tokenAddress, provider);

                return {
                    contractAddress: tokenAddress,
                    value: parseFloat(value).toFixed(4),
                    tokenSymbol: tokenSymbol,
                    from: from,
                    to: to,
                    timestamp: new Date(parseInt((await provider.getBlock(log.blockNumber)).timestamp) * 1000).toLocaleString()
                };
            }));
            return transfers;
        }
    },
    bsc:{
        name:'bsc',
        providerUrl: 'https://bsc-dataseed.binance/org/',
        getProvider: ()=>new ethers.providers.JsonRpcBatchProvider('https://bsc-dataseed.binance.org/'),
        checkNetwork:async (provider) =>{
            const network = await provider.getNetwork();
            return network.chainId === 56;
        },
        getTokenSymbol:async(contractAddress,provider)=>{
            const abi = ["function symbol() view returns (string)"];
            const contract = new ethers.Contract(contractAddress,abi,provider);
            return await contract.symbol();
        },
        getNormalTransactions: async (address,provider)=>{
            const bolckNumber = ethers.utils.getBlockNumber();
            const transactions = [];
            for(let i=0;i<=bolckNumber;i++){
                const block = await provider.getBlockWithTransactions(i);
                block.transactions.forEach(tx=>{
                    if(tx.from === address || tx.to === address){
                        transactions.push({
                            hash:tx.hash,
                            value:parseFloat(ethers.utils.formatEther(tx.value).toFixed(4)),
                            from:tx.from,
                            to:tx.to,
                            timestamp: new Date(parseInt((provider.getBlock(tx.blockNumber)).timestamp) * 1000).toLocaleString()
                        });
                    }
                });
                return transactions;
            }
        },
        getTokenTransfers: async (address,provider)=>{
            const erc20TransferEventSignature = ethers.utils.id("Transfer(address,address,uint256)");
            const filter ={
                address:null,
                topics:[
                    erc20TransferEventSignature,
                    [null,ethers.utils.hexZeroPad(address,32)],
                    [null,ethers.utils.hexZeroPad(address,32)]
                ]
            };
            const logs = provider.getLogs({
                fromBlock:0,
                toBlock:'latest',
                ...filter
            });
            const transfers = await Promise.all(logs.map(async(log) =>{
                const decodedData = ethers.utils.defaultAbiCoder.decode(['address', 'address', 'uint256'], log.data);
                const from = decodedData[0];
                const to = decodedData[1];
                const tokenAddress = log.address;
                const value = ethers.utils.formatUnits(decodedData[2],18);
                const tokenSymbol = await chains.ethereum.getTokenSymbol(tokenAddress, provider);

                return {
                    contractAddress: tokenAddress,
                    value: parseFloat(value).toFixed(4),
                    tokenSymbol: tokenSymbol,
                    from: from,
                    to: to,
                    timestamp: new Date(parseInt((await provider.getBlock(log.blockNumber)).timestamp) * 1000).toLocaleString()
                };
            }));
            return transfers;
            }
    },
    ganache: {
            name: 'ganache',
            providerUrl: 'http://127.0.0.1:7545',
            getProvider: () => new ethers.providers.JsonRpcProvider('http://127.0.0.1:7545'),
            checkNetwork: async (provider) => {
                const network = await provider.getNetwork();
                return network.chainId === 1337 || network.chainId === 5777; // Ganache 默认的 chainId 是 1337 或 5777
            },
            getTokenSymbol: async (contractAddress, provider) => {
                const abi = ["function symbol() view returns (string)"];
                const contract = new ethers.Contract(contractAddress, abi, provider);
                return await contract.symbol();
            },
            getNormalTransactions: async (address, provider) =>{
                const bolckNumber = await provider.getBlockNumber();
                const transactions = [];
                for(let i=0 ;i<=bolckNumber;i++){
                    const block = await provider.getBlockWithTransactions(i);
                    block.transactions.forEach(tx => {
                        if(tx.from === address || tx.to === address){
                            transactions.push({
                                hash: tx.hash,
                                value: parseFloat(ethers.utils.formatEther(tx.value)).toFixed(4),
                                from: tx.from,
                                to: tx.to,
                                timestamp: new Date(parseInt((provider.getBlock(tx.blockNumber)).timestamp) * 1000).toLocaleString()
                            });
                        }
                    });
                }
                return transactions;

            },
            getTokenTransfers: async (address, provider) => {
                const erc20TransferEventSignature = ethers.utils.id("Transfer(address,address,uint256)");
                const filter = {
                    address:null,//查询所有合约
                    topics:[
                        erc20TransferEventSignature,
                        [null, ethers.utils.hexZeroPad(address, 32)], // 监听 from 或 to 地址
                        [null, ethers.utils.hexZeroPad(address, 32)]  // 监听 from 或 to 地址
                    ]
                };
                const logs = await provider.getLogs({
                    fromBlock: 0,
                    toBlock: 'latest',
                    ...filter
                });
                const transfers = await Promise.all(logs.map(async (log) =>{
                    const decodedData = ethers.utils.defaultAbiCoder.decode(['address', 'address', 'uint256'], log.data);
                    const tokenAddress = log.address;
                    const from = decodedData[0];
                    const to = decodedData[1];
                    const value = ethers.utils.formatUnits(decodedData[2],18);
                    const tokenSymbol = await chains.ethereum.getTokenSymbol(tokenAddress, provider);
    
                    return {
                        contractAddress: tokenAddress,
                        value: parseFloat(value).toFixed(4),
                        tokenSymbol: tokenSymbol,
                        from: from,
                        to: to,
                        timestamp: new Date(parseInt((await provider.getBlock(log.blockNumber)).timestamp) * 1000).toLocaleString()
                    };
                }));
                return transfers;
            }
    }
};

