<template>
  <v-card>
    <v-card-title>
      楽曲一覧
      <v-spacer></v-spacer>
      <v-text-field
        v-model="search"
        append-icon="mdi-magnify"
        label="検索"
        single-line
        hide-details
      ></v-text-field>
    </v-card-title>

    <v-data-table
      :headers="headers"
      :items="filteredMusics"
      :loading="!hasFinishedLoadingMusics"
      loading-text="楽曲一覧を読み込み中です…"
    >
      <template v-slot:[`item.actions`]="{ item }">
        <v-btn icon @click="playMusic(item.serialized)">
          <v-icon>mdi-play</v-icon>
        </v-btn>
        <v-btn icon @click="addMusic(item)">
          <v-icon>mdi-playlist-plus</v-icon>
        </v-btn>
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
import Vue from "vue";
import { mapState } from "vuex";
import Fuse from "fuse.js";

export default Vue.extend({
  name: "MusicDatabase",

  data: () => ({
    search: "",
    hasFinishedLoadingMusics: false,
    headers: [
      {
        text: "タイトル",
        align: "start",
        value: "title"
      },
      {
        text: "アルバム",
        value: "album"
      },
      {
        text: "アーティスト",
        value: "artist"
      },
      { text: "", value: "actions", sortable: false, width: "120px" }
    ]
  }),

  methods: {
    async addMusic(music) {
      const api = this.$store.state.api;
      await api.request({
        method: "play-music/add-to-playlist",
        args: { music: music.serialized }
      });
    }
  },

  computed: {
    filteredMusics() {
      if (this.search === "") {
        return this.musics;
      }
      return this.musicsFuse.search(this.search).map(x => x.item);
    },

    musicsFuse() {
      return new Fuse(this.musics, {
        keys: [
          { name: "title", weight: 0.6 },
          { name: "album", weight: 0.3 },
          { name: "artist", weight: 0.1 }
        ]
      });
    },

    ...mapState({ musics: "musicDb" })
  },

  async created() {
    await this.$store.dispatch("fetchMusicDb");
    this.hasFinishedLoadingMusics = true;
  }
});
</script>
