import { decryptMnemonic,encryptMnemonic } from "../services/mnemonicService";

const DB_NAME = 'WalletDB';
const DB_VERSION = 1;
const STORE_NAME = 'wallets';

let db;

function openDatabase() {
    return new Promise((resolve,reject)=>{
        let request = indexedDB.open(DB_NAME,DB_VERSION);

        request.onupgradeneeded = function(event){
            db = event.target.result;
            if(!db.objectStoreNames.contains(STORE_NAME)){
                db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
            }
        };

        request.onsuccess = function(event) {
            db = event.target.result;
            resolve(db);
        };

        request.onerror = function(event) {
            reject(event.target.error);
        };
    });
}

export async function saveEncryptedMnemonicByPWD(mnemonic, password){
    try{
        await openDatabase();
        const encryptedData =await encryptMnemonic(mnemonic.value, password.value);
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put({ id:'encryptedMnemonicByPWD', encryptedMnemonic: encryptedData });
        return new Promise((resolve, reject) =>{
            request.onsuccess = () => resolve('Save successsfully');
            request.onerror = () =>reject(request.error);
        });
    }catch (error){
        console.error('Failed to save encrypted mnemonic:', error);
        throw error;
    }
}

export async function getEncryptedMnemonicByPWD(password) {
    try{
        await openDatabase();
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get('encryptedMnemonicByPWD');

        return new Promise((resolve, reject) => {
            request.onsuccess = async function (event) {
                const result = event.target.result;
                if(result && result.encryptedMnemonic){
                    const decryptedMnemonic = decryptMnemonic(result.encryptedMnemonic,password);
                    resolve(decryptedMnemonic);
                }else{
                    reject('No encrypted mnemonic found');
                }
            };
            request.onerror = () => reject(request.error);
        });
    }catch (error){
        console.error('Failed to get encrypted mnemonic:', error);
        throw error;
    }
}

export async function saveEncryptedMnemonicByPSS(mnemonic,sessionKey ){
    try{
        await openDatabase();
        const encryptedData =await encryptMnemonic(mnemonic, sessionKey);
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put({ id:'encryptedMnemonicByPSS', encryptedMnemonic: encryptedData });
        return new Promise((resolve, reject) =>{
            request.onsuccess = () => resolve('Save successsfully');
            request.onerror = () =>reject(request.error);
        });
    }catch (error){
        console.error('Failed to save encrypted mnemonic:', error);
        throw error;
    }
}

export async function getEncryptedMnemonicByPSS(sessionKey) {
    try{
        await openDatabase();
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get('encryptedMnemonicByPSS');
        return new Promise((resolve, reject) => {
            request.onsuccess = async function (event) {
                const result = event.target.result;
                if(result && result.encryptedMnemonic){
                    const decryptedMnemonic = decryptMnemonic(result.encryptedMnemonic,sessionKey);
                    resolve(decryptedMnemonic);
                }else{
                    reject('No encrypted mnemonic found');
                }
            };
            request.onerror = () => reject(request.error);
        });
    }catch (error){
        console.error('Failed to get encrypted mnemonic:', error);
        throw error;
    }
}

export async function setWallets(wallets) {
    try {
      await openDatabase();
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      console.log('setWallets',wallets);
      const request = store.put({ id: 'wallets', wallets: wallets });
        
      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve('Save successfully');
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to save wallets:', error);
      throw error;
    }
  }
  
  export async function getWallets() {
    try {
      await openDatabase();
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get('wallets');
  
      return new Promise((resolve, reject) => {
        request.onsuccess = function (event) {
          const result = event.target.result;
          if (result && result.wallets) {
            resolve(result.wallets);
          } else {
            resolve({}); // 如果没有找到，则返回空对象
          }
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to get wallets:', error);
      throw error;
    }
  }