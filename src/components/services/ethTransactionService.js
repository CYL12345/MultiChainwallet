import { ethers } from "ethers";
import axios from "axios";

//const ADDRESS = "0x2bf916f8169Ed2a77324d3E168284FC252aE4087"; // 替换为你要查询的地址
const ETHERSCAN_API_KEY = "UPT9YBDS2IYSCVKAGN7IFR2XEV4SJY3KGI"; // 替换为你的 Etherscan API Key


// 创建 InfuraProvider 实例（用于其他交互）
//const INFURA_PROJECT_ID = 'dd8e2890ec5c41d68055818bdb846bae';
//const provider = new ethers.providers.InfuraProvider('mainnet', INFURA_PROJECT_ID);



async function getNormalTransactions(address, apiKey) {
        try{
            const response = await axios.get('https://api.etherscan.io/api',{
                params: {
                    module: 'account',
                    action: 'txlist',
                    address,
                    startblock: 0,
                    endblock: 99999999,
                    sort: 'asc',
                    apikey: apiKey
                }
            });
            if (response.data.status === '1') {
                return response.data.result.map(tx => ({
                    hash: tx.hash,
                    value: parseFloat(ethers.utils.formatEther(tx.value)).toFixed(4),
                    from: tx.from,
                    to: tx.to,
                    timestamp: new Date(parseInt(tx.timeStamp) * 1000).toLocaleString()
                }));
            } else {
                console.error('Error fetching normal transactions:', response.data.message);
                return [];
            }
        }catch (error) {
            console.error('Error during API request:', error);
            return [];
        }
}

async function getTokenTransfers(address, apiKey) {
    try {
        const response = await axios.get('https://api.etherscan.io/api', {
            params: {
                module: 'account',
                action: 'tokentx',
                address,
                startblock: 0,
                endblock: 99999999,
                sort: 'asc',
                apikey: apiKey
            }
        });

        if (response.data.status === '1') {
            return response.data.result.map(transfer => ({
                contractAddress: transfer.contractAddress,
                value: parseFloat(ethers.utils.formatUnits(transfer.value, transfer.tokenDecimal)).toFixed(4),
                tokenSymbol: transfer.tokenSymbol,
                from: transfer.from,
                to: transfer.to,
                timestamp: new Date(parseInt(transfer.timeStamp) * 1000).toLocaleString()
            }));
        } else {
            console.error('Error fetching token transfers:', response.data.message);
            return [];
        }
    } catch (error) {
        console.error('Error during API request:', error);
        return [];
    }
}

export async function fetchAndPrintTransactionHistory(ADDRESS) {
    console.log(`Fetching transaction history for address: ${ADDRESS}`);

    const normalTransactions = await getNormalTransactions(ADDRESS, ETHERSCAN_API_KEY);
    console.log('\nNormal Transactions:');
    normalTransactions.forEach((tx, index) => {
        console.log(`#${index + 1}: Hash - ${tx.hash}, Value - ${tx.value} ETH, From - ${tx.from}, To - ${tx.to}, Time - ${tx.timestamp}`);
    });

    const tokenTransfers = await getTokenTransfers(ADDRESS, ETHERSCAN_API_KEY);
    console.log('\nERC20 Token Transfers:');
    tokenTransfers.forEach((transfer, index) => {
        console.log(`#${index + 1}: Contract - ${transfer.contractAddress}, Value - ${transfer.value} ${transfer.tokenSymbol}, From - ${transfer.from}, To - ${transfer.to}, Time - ${transfer.timestamp}`);
    });

    return normalTransactions;
}