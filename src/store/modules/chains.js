import { chainConfig } from "@/components/services/chainConfig";

const state = {
    currentChainId: '1'
};

const mutations = {
    setCurrentChainId(state, chainId) {
        state.currentChainId = chainId;
        console.log("setCurrentChainId", state.currentChainId);
    }
};

const actions = {
    setCurrentChainId({ commit }, chainId) {
        commit('setCurrentChainId', chainId);
    }
};

const getters = {
    getCurrentChainName: (state) => chainConfig[state.currentChainId]?.name || 'Unknown Chain',
    getCurrentChainId: (state) => state.currentChainId
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
};