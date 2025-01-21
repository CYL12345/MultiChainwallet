import { createStore } from "vuex";
import wallet from './modules/wallet';
import chains from './modules/chains';
import sessionKey from "./modules/sesssionKey";

export default createStore({
    modules: {
        sessionKey,
        wallet,
        chains,
    },

});