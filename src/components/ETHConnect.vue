<template>
    <div v-if="account">
        <p>您的ETH地址:</p>
        <p></p>
    </div>
    <div>
        <button @click ='registerWallet'>注册钱包</button>
    </div>
    <div>
        <input v-model="inputAddress"  type="text" placeholder="请输入地址"/>
        <button @click='inputAddressTransfer'>查询余额</button>
    </div>
    <div class="container">
        <div class ='transaction-block'>
            <input v-model="fromAddress"  type="text" placeholder="请输入转出地址"/>
            <input v-model="toAddress"  type="text" placeholder="请输入转入地址"/>
            <input v-model="privateKey" type="text" placeholder="输入私钥"/>
            <input v-model="amount" type="text" placeholder="输入金额"/>
            <button @click='ethAccountTransactionButton'>提交签名</button>
        </div>
    </div>
</template>
<script>

import Web3 from 'web3';

export default{
    name:'ETHConnect',
    props:{
        msg:String
    },
    data(){
        return{
            accuont:'',
            privateKey:'',
            inputAddress:'',//输入地址,
            fromAddress:'',
            toAddress:'',
            amount:''
        };
    },
    methods:{
        //注册ETH钱包
        async registerWallet(){
            try{
                let web3 = new Web3(window.ethereum);
                //创建一个钱包
                const newAccount = await web3.eth.accounts.create();
                const password = 'abd714984797';
                //加密账户
                const encryptedAccount =await web3.eth.accounts.encrypt(newAccount.privateKey,password);
                console.log('加密账号：',encryptedAccount);
                console.log(newAccount);
                try{
                    const decryptedAccount =await web3.eth.accounts.decrypt(encryptedAccount,'abd714984797');
                    if(decryptedAccount!=null){
                        console.log('解密账户：',decryptedAccount);
                    }
                }catch(error){
                    console.log('解密账户出错',error);
                }
                //私钥存储到本地
                localStorage.setItem('ethAccount',JSON.stringify(encryptedAccount));
            }catch(error){
                console('registerWallet ERROR',error);
            }
        },
        inputAddressTransfer(){
            if(this.inputAddress.trim()){
                this.getBalance(this.inputAddress);
            }else{
                console.log('没有进入到余额模块');
            }
        },
        //显示余额
        async getBalance(inputAddress){
            try{
                let web3 = new Web3(window.ethereum);
                let balance = await web3.eth.getBalance(inputAddress);
                console.log('余额',balance);
            }catch(error){
                console.error('显示余额模块出现问题',error);
            }
        },
        //账户签名交易
        async ethAccountTransaction(fromAddress,toAddress,amount){
            try{
                let web3 = new Web3(window.ethereum);
                let weiAmount = web3.utils.toWei(amount);
                if(!web3.utils.isAddress(fromAddress)){
                    console.log('转出账户有问题');
                    return;
                }
                if(!web3.utils.isAddress(toAddress)){
                    console.log('转入账户有问题');
                    return;
                }
                if(!this.verifyBalance(fromAddress,weiAmount)){
                    console.log('余额不足',weiAmount);
                    return;
                }
                else{
                    const gasEstimate = await web3.eth.estimateGas({
                        from:fromAddress,
                        to:toAddress,
                        value:weiAmount
                    });
                    const gaslimit = Math.ceil(gasEstimate*1.5);
                    // 获取当前的 gas 价格
                    const gasPrice = await web3.eth.getGasPrice();
                    const transcation ={
                        from:fromAddress,
                        to:toAddress,
                        value:weiAmount,
                        gasLimit:gaslimit,
                        gasPrice:gasPrice
                    };
                     // 签署并发送交易
                    const signedTx = await web3.eth.accounts.signTransaction(transcation, this.privateKey);
                    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
                    console.log('交易已发送:', receipt.transactionHash);
                }
            }catch(error){
                console.error('转账交易发生错误',error);
            }
        },
        //查询余额是否足够
        async verifyBalance(fromAccount,amount){
            try{
                const weibalance =await this.getBalance(fromAccount);

                if(weibalance < amount){
                    return false;
                }
                else{
                    return true;
                }
            }catch(error){
                console.error('verifyBalance error:',error);
            }
        },
        ethAccountTransactionButton(){
            if(this.toAddress.trim()){
                console.log('输入账户为：',this.toAddress);
                this.ethAccountTransaction(this.fromAddress,this.toAddress,this.amount);
            }else{
                console.log('输入账户为空');
            }
        }
    }
}

</script>
<style scoped>
    .container{
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 0vh;
    }
    .transaction-block{
        display:flex;
        flex-direction: column;
        gap:10px;
        width: 50%;
        padding: 10px;
        box-sizing: border-box;
        grid-template-rows: auto;
    }
</style>