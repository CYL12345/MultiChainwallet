// store/modules/wallet.js
const state = {
    wallet: {}, // 注意这里定义的是 wallets
    id:null,
    balance:null
};

const mutations = {

    addWallet(state, { id,wallet,balance }) {
        state.id = id;
        state.wallet = wallet; // 这里不再使用 Vue.set
        state.balance = balance;
    },

};

const actions = {

    addWallet({ commit }, { id, wallet ,balance}) {
        commit('addWallet', { id, wallet, balance });
    }
};

const getters = {
    //getWalletAddress: (state) => (id) => state.wallets[id]?.address || null,
    getWallet: (state) => state.wallet,
    getBalance: (state) =>state.balance
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
};