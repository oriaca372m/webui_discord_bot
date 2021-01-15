import Vue from "vue";
import Vuex from "vuex";
import { Api } from "@/models/api";

Vue.use(Vuex);

function getT<T>(): T {
  return (undefined as unknown) as T;
}

export default new Vuex.Store({
  state: {
    api: getT<Api>(),
    musicDb: getT<any>()
  },
  mutations: {
    setApi(state, api: Api) {
      state.api = api;
    },

    setMusicDb(state, db: any) {
      state.musicDb = db;
    }
  },
  actions: {
    async fetchMusicDb({ state, commit }) {
      if (state.musicDb !== undefined) {
        return;
      }

      const api = state.api;
      const res = await api.request({
        method: "play-music/get-all-musics",
        args: {}
      });

      commit("setMusicDb", (res as any).musics);
    }
  },
  modules: {}
});
