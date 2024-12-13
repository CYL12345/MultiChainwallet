<template>
    <div class="wallet-registration">
      <button @click="generateWallet">Register Wallet</button>
      <PasswordModal
        v-if="showPasswordModal"
        :onSubmit="handlePasswordSubmit"
        :onCancel="handlePasswordCancel"
        :loading="isEncrypting"
      />
      <p v-if="walletCreated" class="success-message">Wallet created successfully!</p>
      <p v-if="error" class="error-message">{{ error }}</p>
    </div>
  </template>
  
  <script>
  import Web3 from 'web3';
  import { ref } from 'vue';
  import PasswordModal from '../modal/PasswordModal.vue';
  export default {
    components: {
      PasswordModal
    },
    setup() {
      const web3 = new Web3(window.ethereum);
      const isEncrypting = ref(false);
      const showPasswordModal = ref(false);
      const walletCreated = ref(false); 
      const error = ref(null);
  
      const generateWallet = async () => {
        try {
          if (!window.ethereum) {
            throw new Error('请安装并连接 MetaMask');
          }
  
          const newAccount = await web3.eth.accounts.create();
          console.log('新账户：', newAccount);
  
          showPasswordModal.value = true;
          return newAccount;
        } catch (err) {
          error.value = `注册钱包时出错: ${err.message}`;
          console.error('registerWallet ERROR', err);
        }
      };
  
      const handlePasswordSubmit = async (password) => {
        try {
          isEncrypting.value = true;
  
          const newAccount = await web3.eth.accounts.create();
  
          const encryptedAccount = await web3.eth.accounts.encrypt(newAccount.privateKey, password);
          console.log('加密账号：', encryptedAccount);
  
          const decryptedAccount = await web3.eth.accounts.decrypt(encryptedAccount, password);
          if (decryptedAccount) {
            console.log('解密账户：', decryptedAccount);
  
            localStorage.setItem('ethAccount', JSON.stringify(encryptedAccount));
  
            showPasswordModal.value = false;
            walletCreated.value = true;
          } else {
            throw new Error('解密失败，请检查密码');
          }
        } catch (err) {
          error.value = `加密或解密账户时出错: ${err.message}`;
          console.error('Encryption/Decryption ERROR', err);
        } finally {
          isEncrypting.value = false;
        }
      };
  
      const handlePasswordCancel = () => {
        showPasswordModal.value = false;
        error.value = '用户取消了密码输入';
      };
  
      return {
        generateWallet,
        handlePasswordSubmit,
        handlePasswordCancel,
        showPasswordModal,
        isEncrypting,
        walletCreated,
        error
      };
    }
  };
  </script>
  
  <style scoped>
  .success-message {
    color: green;
    font-weight: bold;
  }
  
  .error-message {
    color: red;
    font-weight: bold;
  }
  </style>