<template>
  <v-container>
    <v-row>
      <v-col>
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
              @keypress.enter="addFirstMusic"
            ></v-text-field>
          </v-card-title>

          <v-data-table
            :headers="headers"
            :items="filteredMusics"
            :loading="!hasFinishedLoadingMusics"
            :footer-props="{ 'items-per-page-options': [10, 20, 30, 40, 50] }"
            :page.sync="tablePage"
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

          <v-snackbar v-model="snackbar" timeout="1000">
            {{ snackbarText }}
          </v-snackbar>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import Vue from "vue";
import { mapState } from "vuex";
import Fuse from "fuse.js";

export default Vue.extend({
  name: "MusicDatabase",

  data: () => ({
    search: "",
    delayedSearch: "",
    hasFinishedLoadingMusics: false,
    snackbar: false,
    snackbarText: "",
    interval: undefined,
    tablePage: 1,
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
    showSnackbar(text) {
      this.snackbarText = text;
      this.snackbar = true;
    },

    async addMusic(music) {
      await this.$store.dispatch("requestApi", {
        method: "play-music/add-to-playlist",
        args: { music: music.serialized }
      });
      this.showSnackbar(`${music.title} を追加しました`);
    },

    async addFirstMusic() {
      const music = this.filteredMusics[0];
      if (music !== undefined) {
        this.addMusic(music);
      }
    }
  },

  computed: {
    filteredMusics() {
      if (this.delayedSearch === "") {
        return this.musics;
      }
      return this.musicsFuse.search(this.delayedSearch).map(x => x.item);
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

    this.interval = setInterval(() => {
      if (this.delayedSearch !== this.search) {
        this.delayedSearch = this.search;
        this.tablePage = 1;
      }
    }, 1000);
  },

  destroyed() {
    clearInterval(this.interval);
  }
});
</script>
