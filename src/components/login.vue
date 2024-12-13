<template>
    <div>
        <input v-model='inputAccount' type=”text“ placeholder="请输入你的账号">
        <input v-model='inputPWD' type="password" placeholder="请输入密码">
        <button @click="userLogin">登录</button>
    </div>
</template>

<script>
  import axios from 'axios'; 
  //import { accounts } from 'web3/lib/commonjs/eth.exports';
  export default{
    name:'LoginWallet',
    props:{
        msg:String
    },
    data(){
        return{
            inputAccount:'',
            inputPWD:'',
            processedDate:''
        };
    },
    methods:{
        async userLogin(){
            try{
                const response = await axios.post('http://localhost:8082/process-data',
                {
                    account:this.inputAccount,
                    pwd:this.inputPWD
                });
                console.log('Response:', response.data.result);
                this.processedDate = response.data.result;
            }catch(error){
                console.log('processedDate error',error);
            }
        }
    }
  }
</script>