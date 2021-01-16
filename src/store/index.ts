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
    musicDb: getT<any>(),
    isVisibleErrorNotification: false,
    lastErrorMessage: ""
  },

  mutations: {
    setApi(state, api: Api) {
      state.api = api;
    },

    setMusicDb(state, db: any) {
      state.musicDb = db;
    },

    setErrorNotificationVisibility(state, isVisible: boolean) {
      state.isVisibleErrorNotification = isVisible;
    },

    setLastError(state, msg: string) {
      state.isVisibleErrorNotification = true;
      state.lastErrorMessage = msg;
    }
  },

  actions: {
    async requestApi({ state, commit }, payload: unknown) {
      const api = state.api;
      try {
        const res = (await api.request(payload)) as { error: string };

        if (typeof res.error === "string") {
          commit("setLastError", `APIがエラーを返しました: ${res.error}`);
          throw res;
        }
        return res;
      } catch (e) {
        commit("setLastError", "APIの呼び出し中にエラーが発生しました");
        throw e;
      }
    },

    async fetchMusicDb({ state, commit, dispatch }) {
      if (state.musicDb !== undefined) {
        return;
      }

      const res = await dispatch("requestApi", {
        method: "play-music/get-all-musics",
        args: {}
      });

      commit("setMusicDb", (res as any).musics);
    }
  },
  modules: {}
});
