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

        //const contract = new ethers.Contract(proxyAddress,implementationABI,wallet);

        const amountWei = ethers.utils.parseEther(amount.toString());

        const sender = wallet.address;

        const messageHash = ethers.utils.keccak256(
            ethers.utils.defaultAbiCoder.encode(
                ["address", "address", "uint256"],
                [sender, recipient, ethers.utils.parseEther(amount.toString())]
            )
        );
        const signature = await wallet.signMessage(ethers.utils.arrayify(messageHash));

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
    const proxyAddress = "0x202Df70BD024e246924d12043659B971ec1C94FB";
    const implementationABI=[
        //替换为实现合约的ABI
        "function approveTransfer(address sender, address recipient, uint256 amount, bytes signature) external",
        "function getMessageHash(address sender, address recipient, uint256 amount) view returns (bytes32)",
    ];

    const contract = new ethers.Contract(proxyAddress,implementationABI,wallet);
    return contract;
}