//import { chainConfig } from "@/components/services/chainConfig";

const state = {
    currentChainId: '1',
    currentChainName: ''
};

const mutations = {
    setCurrentChainId(state, chainId) {
        state.currentChainId = chainId;
    },
    setCurrentChainName(state, chainName) {
        state.currentChainName = chainName;
    }
};

const actions = {
    setCurrentChainId({ commit }, chainId) {
        commit('setCurrentChainId', chainId);
    },
    setCurrentChainName({ commit }, chainName) {
        commit('setCurrentChainName', chainName);
    },
};

const getters = {
    getCurrentChainName: (state) =>state.currentChainName ,
    getCurrentChainId: (state) => state.currentChainId
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
};