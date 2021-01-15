<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-toolbar-title>Discord Bot Web UI</v-toolbar-title>

      <template v-slot:extension>
        <v-tabs v-model="tab" align-with-title>
          <v-tabs-slider color="yellow"></v-tabs-slider>

          <v-tab to="/">ホーム</v-tab>
          <v-tab to="/music_database">楽曲DB</v-tab>
          <v-tab to="/playlist">プレイリストの編集</v-tab>
          <v-tab to="/send_message">メッセージの送信</v-tab>
        </v-tabs>
      </template>
    </v-app-bar>

    <v-main>
      <v-container>
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import Vue from "vue";
import { Api } from "@/models/api";

export default Vue.extend({
  name: "App",

  created() {
    try {
      const url = new URL(window.location.href);

      const accessToken = url.searchParams.get("accessToken") || "";
      const accessTokenSecret = url.searchParams.get("accessTokenSecret") || "";
      const server = url.searchParams.get("server") || "";

      const api = new Api(server, accessToken, accessTokenSecret);
      this.$store.commit("setApi", api);
    } catch (e) {
      console.error(e);
    }
  }
});
</script>
