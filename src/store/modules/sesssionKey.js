import { clearTimeout } from 'timers';

const defaultState = () => ({
    sessionKey: null,
    timerId: null,
    inactiveTime: 30 * 60 * 1000
});

const state = {
    ...defaultState()
};

const mutations = {
    SET_SESSION_KEY(state, key) {
        state.sessionKey = key;
    },
    CLEAR_SESSION_KEY(state) {
        state.sessionKey = null;
    },
    SET_TIMER_ID(state, id) {
        if (state.timerId) clearTimeout(state.timerId);
        state.timerId = id;
    }
};

const actions = {
    startSessionTimer({ commit, state }){
        const timerId = setTimeout(() => {
            console.log('Session expired');
            commit('CLEAR_SESSION_KEY');
        }, state.inactiveTime);
        commit('SET_TIMER_ID', timerId);
    },
    resetSessionTimer({ dispatch }) {
        dispatch('startSessionTimer');
    },
    initializeSession({ dispatch }) {
        const saveSessionKey = localStorage.getItem('sessionKey');
        if ( saveSessionKey ){
            dispatch('restoreSessionKey',saveSessionKey);
        }

        dispatch('startSessionTimer');
    },
    restoreSessionKey({commit},key) {
        commit('SET_SESSION_KEY', key);
    },
};

const getters = {
    hasActiveSession: state => !!state.sessionKey,
    getSessionKey: state => state.sessionKey
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
  };