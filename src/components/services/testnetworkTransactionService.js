import { ethers } from "ethers";


async function getNormalTransactions(address,provider) {
    try {
        const blockNumber = await provider.getBlockNumber();
        const transactions = [];

        for (let i = 0; i <= blockNumber; i++) {
            const block = await provider.getBlockWithTransactions(i);
            block.transactions.forEach(tx => {
                if (tx.from === address || tx.to === address) {
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
    } catch (error) {
        console.error('Error fetching normal transactions:', error);
        return [];
    }
}

async function getTokenTransfers(address,provider) {
    try {
        const erc20TransferEventSignature = ethers.utils.id("Transfer(address,address,uint256)");
        const blockNumber = await provider.getBlockNumber();
        const transfers = [];

        for (let i = 0; i <= blockNumber; i++) {
            const block = await provider.getBlockWithTransactions(i);
            for (const tx of block.transactions) {
                const receipt = await provider.getTransactionReceipt(tx.hash);
                receipt.logs.forEach(log => {
                    if (log.topics[0] === erc20TransferEventSignature) {
                        const decodedData = ethers.utils.defaultAbiCoder.decode(['address', 'address', 'uint256'], log.data);
                        const tokenAddress = log.address;
                        const from = decodedData[0];
                        const to = decodedData[1];
                        const value = ethers.utils.formatUnits(decodedData[2], 18); // 假设所有 ERC20 代币都是 18 位小数

                        if (from === address || to === address) {
                            transfers.push({
                                contractAddress: tokenAddress,
                                value: parseFloat(value).toFixed(4),
                                tokenSymbol: 'ERC20', // 这里需要进一步查询合约来获取符号
                                from: from,
                                to: to,
                                timestamp: new Date(parseInt(( provider.getBlock(tx.blockNumber)).timestamp) * 1000).toLocaleString()
                            });
                        }
                    }
                });
            }
        }

        return transfers;
    } catch (error) {
        console.error('Error fetching token transfers:', error);
        return [];
    }
}

export async function fetchAndPrintNormalTransactionHistoryByNetwork(address,network) {
    console.log(`Fetching transaction history for address: ${address}`);
    const provider = new ethers.providers.JsonRpcProvider(network);
    const normalTransactions = await getNormalTransactions(address,provider);
    console.log('\nNormal Transactions:');
    normalTransactions.forEach((tx, index) => {
        console.log(`#${index + 1}: Hash - ${tx.hash}, Value - ${tx.value} ETH, From - ${tx.from}, To - ${tx.to}, Time - ${tx.timestamp}`);
    });

    return normalTransactions;
}

export async function fetchAndPrintERC20TransactionHistoryByNetwork(address,network) {
    console.log(`Fetching transaction history for address: ${address}`);
    const provider = new ethers.providers.JsonRpcProvider(network);

    const tokenTransfers = await getTokenTransfers(address,provider);
    console.log('\nERC20 Token Transfers:');
    tokenTransfers.forEach((transfer, index) => {
        console.log(`#${index + 1}: Contract - ${transfer.contractAddress}, Value - ${transfer.value} ${transfer.tokenSymbol}, From - ${transfer.from}, To - ${transfer.to}, Time - ${transfer.timestamp}`);
    });

    return tokenTransfers;
}