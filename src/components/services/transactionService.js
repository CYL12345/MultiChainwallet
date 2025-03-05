import { chains } from "./chainConfig";

export async function fetchAndPrintNormalTransactionHistoryByNetwork(chainName,address) {
    if(!chains[chainName]){
        console.error(`Unsupported blockchain: ${chainName}`);
        return;
    }

    const chain = chains[chainName];
    const provider = chain.getProvider();

    try{
        const [normalTransactions] = await Promise.all([
            chain.getNormalTransactions(address, provider),
            //chain.getTokenTransfers(address, provider)
        ]);
        console.log("normalTransactions");
        console.log('\nNormal Transactions:',normalTransactions);
        normalTransactions.forEach((tx, index) => {
            console.log(`#${index + 1}: Hash - ${tx.hash}, Value - ${tx.value} ETH/BNB/MATIC, From - ${tx.from}, To - ${tx.to}, Time - ${tx.timestamp}`);
        });



        return normalTransactions;
    }catch (error) {
        console.error(`Error fetching transaction history on ${chainName}:`, error);
        return null;
    }
}

export async function fetchAndPrintERC20TransactionHistoryByNetwork(chainName,address) {
    console.log('fetchAndPrintTransactionHistory',chains);
    if(!chains[chainName]){
        console.error(`Unsupported blockchain: ${chainName}`);
        return;
    }

    const chain = chains[chainName];
    const provider = chain.getProvider();

    try{
        const [ tokenTransfers] = await Promise.all([
            //chain.getNormalTransactions(address, provider),
            chain.getTokenTransfers(address, provider)
        ]);


        console.log('\nERC20 Token Transfers:');
        tokenTransfers.forEach((transfer, index) => {
            console.log(`#${index + 1}: Contract - ${transfer.contractAddress}, Value - ${transfer.value} ${transfer.tokenSymbol}, From - ${transfer.from}, To - ${transfer.to}, Time - ${transfer.timestamp}`);
        });

        return tokenTransfers;
    }catch (error) {
        console.error(`Error fetching transaction history on ${chainName}:`, error);
        return null;
    }
}