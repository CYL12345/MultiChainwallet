import { ethers } from "ethers";


//.1初始化Provider
//.2获取钱包地址
//.3定义代理合约和实现合约信息
//.4创建contract实例
//.5调用转账方法
export async function transferViaPorxy(network,password,recipient,amount) {
    try{
        console.log(network,password,recipient,amount);
        const provider = new ethers.providers.JsonRpcProvider(network);
        const encyptedJson = localStorage.getItem('encyptedAccountJson');
        const wallet = await ethers.Wallet.fromEncryptedJson(encyptedJson,password).then((wallet)=>{
            return wallet.connect(provider);
        });

        const contract = await getContract(wallet);

        contract.on('DebugLog', (message, messageHash, signature, recoveredSigner) => {
            console.log('DebugLog:', {
                message,
                messageHash,
                signature,
                recoveredSigner
            });
        });

        const amountWei = ethers.utils.parseEther(amount.toString());

        const sender = wallet.address;

        const implementationAddress = await contract.getImplementation();
        console.log("Implementation Address:", implementationAddress);

        const messageHash = await  contract.getMessageHash(sender, recipient, amountWei);
        console.log("Message Hash:", messageHash);
        const ethSignedMessageHash = await contract.getEthSignedMessageHash(messageHash);
        console.log("ethSignedMessageHash:", ethSignedMessageHash);
        const signature = await wallet.signMessage(ethers.utils.arrayify(ethSignedMessageHash));
        console.log("Signature:", signature,ethSignedMessageHash);
        //await authorizedAddress(wallet,wallet.address)
        await approveTransfer(wallet, recipient, amount, signature)

        console.log("Sending transaction...");
        const tx = {
            to: recipient,
            value:amountWei
        }
        const sentTx = await wallet.sendTransaction(tx);
        console.log("Waiting for transaction confirmation...");
        const receipt = await sentTx.wait();
        console.log("Transaction successful!", receipt.transactionHash);

        // 移除事件监听器
        contract.removeAllListeners('DebugLog');
    }catch(error){
        console.error("Error during transaction:", error);
    }
}

async function approveTransfer(wallet, receipt, amount, signature) {
    try{
        const contract =await getContract(wallet);
        const sender = wallet.address;
        const tx = await contract.approveTransfer(
            sender,
            receipt,
            ethers.utils.parseEther(amount.toString()),
            signature
        );
        await tx.wait();
    }catch (error){
        console.error("approveTransfer error",error);
    }
}

async function getContract(wallet) {
    const proxyAddress = "0x5720d1eFBD6E0B29114a3fE9A30ce297b7E8fEb4";
    const implementationABI=[
        //替换为实现合约的ABI
        "function approveTransfer(address sender, address recipient, uint256 amount, bytes signature) external",
        "function getMessageHash(address sender, address recipient, uint256 amount) view returns (bytes32)",
        "function getEthSignedMessageHash(bytes32 messageHash) public pure returns (bytes32)",
        "event DebugLog(string message, bytes32 messageHash, bytes signature, address recoveredSigner)",
        "function getImplementation() external view returns (address)"
    ];

    const contract = new ethers.Contract(proxyAddress,implementationABI,wallet);
    return contract;
}
