<template>
    <div>
      <p>{{ msg }}</p>
      <button @click='get'>链接钱包</button>
      <button @click='getETH'>获取余额</button>
      <button @click='getTokenBalance'>获取代币余额</button>
      <p>{{ balance }}</p>
      <button @click='getAllAcount'>获取所有代币余额</button>
      <button @click='getToken'>获取私有链代币余额</button>

    </div>
    <div>
        <input v-model='inputToAddress' type="text" placeholder="请输入要转入的账号"/>
        <input v-model='inputAmount' type="text" placeholder="请输入要转入数量"/>
        <button @click='getTransferButton'>转账</button>
    </div>
    <div>
      <li v-for="[key,value] in mapEntries" :key="key" class="map-item">
        <strong>钱包链接：{{ key }}</strong>余额：{{ value }}
      </li>
    </div>

  </template>
  
  <script>
  //import router from '@/router';
import Web3 from 'web3';
  //import abi from '../abi/TutorialToken.json';

  export default {
    name: 'ConnectWallet',
    props: {
      msg: String
    },
    data() {
      return {
        inputToAddress:'',//存储输入账户
        inputAmount:'',
        balance:'',
        allAccountInfo:new Map([])
      };
    },
    computed:{
      mapEntries(){
        return Array.from(this.allAccountInfo.entries());
      }
    },
    created() {
      this.getAllAcount();
    },
    methods: {
      async get() { // 引起钱包
        if (window.ethereum) {
          try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            if (accounts.length > 0) {
              alert("当前钱包地址: " + accounts[0]);
            } else {
              alert("未找到钱包地址");
            }
          } catch (error) {
            alert("请求授权失败，请尝试重新连接MetaMask");
            console.error(error);
          }
        } else {
          alert("请安装MetaMask");
        }
      },
      async getETH() { // 获取余额
        try {
          let web3 = new Web3(window.ethereum);
          console.log(web3);
          let fromAddress = await web3.eth.getAccounts();
          console.log(fromAddress);
          let balance = await web3.eth.getBalance(fromAddress[0]);
          console.log(balance);
          alert('ETH余额: ' + web3.utils.fromWei(balance, 'ether') + ' ETH');
        } catch (error) {
          console.error('获取余额失败', error);
          alert('获取余额失败');
        }
      },
      getTransferButton(){
        if(this.inputToAddress.trim()){
          console.log('输入账户为',this.inputToAddress);
          this.getTransfer(this.inputToAddress,this.inputAmount);
        }
        else{
          alert('输入账户为空');
        }
      },
      //以太坊转账
      async getTransfer(toAddress,amount){
        let web3 = new Web3(window.ethereum);
        try{
          let fromAddress = await web3.eth.getAccounts();//转出账户
          if(fromAddress[0] === 0){
            alert('请链接你的钱包');
            return;
          }
          let weiAmount =await web3.utils.toWei(amount,'ether');
          console.log('转出账户为：'+fromAddress[0]);
          //let amount = 0.01*Math.pow(10,18);
          console.log('转入账户为：'+toAddress);
          const tx = {
            from:fromAddress[0],
            to:toAddress,
            value:weiAmount
          }
          console.log(tx);
          const receipt = await web3.eth.sendTransaction(tx);
          console.log('交易成功,交易哈希：'+receipt);
        }catch(error){
          console.error('交易失败',error);
        }
      },
      async getTokenBalance(){
        if(window.web3){
          try{
            let web3 = new Web3(window.ethereum);
            let fromAccount = await web3.eth.getAccounts();
            let balance = await web3.eth.getBalance(fromAccount[0]);
            this.balance = web3.utils.fromWei(balance, 'ether');
          }catch(error){
            console.error('提取地址失败',error);

          }
        }
      },
      async getToken(){
        if(window.web3){
          try{
            let web3 = new Web3('HTTP://127.0.0.1:7545');
            let balance = await web3.eth.getBalance('0xC166E062548b36c86710ed920Bf70F93D7B75817');
            console.log(balance);
          }catch(error){
            console.error('提取地址失败',error);

          }
        }
      },
      //获取所有账户，并显示余额
      async getAllAcount(){
        if(window.web3){
          try{
            let web3 = new Web3(window.ethereum);
            let allAccount = await web3.eth.getAccounts();
            console.log(allAccount);
            let oneAccountBalance = '';
            for(let i = 0;i < allAccount.length; i++){
              oneAccountBalance =await web3.eth.getBalance(allAccount[i]);
              console.log(oneAccountBalance);
              await this.allAccountInfo.set(allAccount[i],web3.utils.fromWei(oneAccountBalance,'ether'));
            }
            console.log(this.allAccountInfo);
          }catch(error){
            console.log("获取所有账户余额模块出错",error);
          }
        }
      }
    }
  }
  </script>
  
  <style scoped>
  /* 你的样式 */
    ul{
      list-style-type: none;
      padding: 0;
      margin: 0;
    }
    .map-item{
      display: block;/*确保每个条目在新的一行显示*/
      margin: 10px;/*上下边距*/
      border:1px solid #ccc;/**这是边框 */
      padding:10px;/**内边距 */
      border-radius: 4px;/**圆角边框 */
    }
    li{
      margin: 10px 0;
    }
  </style>