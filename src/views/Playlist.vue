<template>
  <v-container>
    <v-row>
      <v-col>
        <v-card>
          <v-card-title>
            プレイリスト
            <v-spacer></v-spacer>
            <v-btn class="mx-1" @click="fetchPlaylist">更新</v-btn>
            <input
              style="display: none"
              ref="importPlaylistInput"
              type="file"
              accept="text/plain"
              @change="importPlaylist"
            />
            <v-btn class="mx-1" @click="clickImportPlaylistInput"
              >インポート</v-btn
            >
            <v-btn
              ref="exportPlaylistButton"
              class="mx-1"
              target="_blank"
              download="playlist.txt"
              href="#"
              @click="exportPlaylist"
              >エクスポート</v-btn
            >
          </v-card-title>
          <v-card-text>
            <v-text-field
              label="URL"
              prepend-inner-icon="mdi-web"
              v-model="urlToAdd"
              outlined
              clearable
              @keypress.enter="addUrl"
            >
              <template v-slot:append-outer>
                <v-btn @click="addUrl">追加</v-btn>
              </template>
            </v-text-field>
          </v-card-text>
          <v-simple-table>
            <thead>
              <tr>
                <th style="width: 30px;"></th>
                <th class="text-left">タイトル</th>
                <th class="text-left">アルバム</th>
                <th class="text-left">アーティスト</th>
                <th style="width: 120px;"></th>
              </tr>
            </thead>
            <draggable
              tag="tbody"
              v-model="playlist"
              draggable=".item"
              :options="{ handle: '.handle' }"
              @end="pushPlaylist"
            >
              <tr class="item" v-for="(music, i) in playlist" :key="i">
                <td class="pr-0 handle">
                  <v-icon>mdi-drag</v-icon>
                </td>
                <td>
                  <v-btn
                    v-if="music.serialized.kind === 'youtube'"
                    icon
                    :href="music.serialized.url"
                    target="_blank"
                  >
                    <v-icon>mdi-youtube</v-icon>
                  </v-btn>
                  {{ music.title }}
                </td>
                <td>{{ music.album }}</td>
                <td>{{ music.artist }}</td>
                <td>
                  <v-btn icon @click="playPlaylist(i)">
                    <v-icon>mdi-play</v-icon>
                  </v-btn>
                  <v-btn icon @click="removeMusic(i)">
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </td>
              </tr>
            </draggable>
          </v-simple-table>
        </v-card>

        <v-snackbar v-model="snackbar" timeout="1000">{{
          snackbarText
        }}</v-snackbar>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import Vue from "vue";
import { mapState } from "vuex";
import Draggable from "vuedraggable";

function readFile(file) {
  return new Promise(resolve => {
    const reader = new FileReader();

    reader.onload = e => {
      resolve(e.target.result);
    };

    reader.readAsText(file);
  });
}

export default Vue.extend({
  name: "Playlist",

  components: {
    Draggable
  },

  data: () => ({
    playlist: undefined,
    urlToAdd: "",
    snackbar: false,
    snackbarText: ""
  }),

  methods: {
    showSnackbar(text) {
      this.snackbarText = text;
      this.snackbar = true;
    },

    async playPlaylist(index) {
      await this.$store.dispatch("requestApi", {
        method: "play-music/play",
        args: { index }
      });
    },

    async fetchPlaylist() {
      this.hasFinishedLoadingPlaylist = false;
      const playlist = await this.$store.dispatch("requestApi", {
        method: "play-music/get-playlist",
        args: {}
      });
      this.playlist = playlist.musics.map(pm => {
        if (pm.kind === "file") {
          const r = this.musics.find(dm => dm.serialized.uuid === pm.uuid);
          return r;
        } else if (pm.kind === "youtube") {
          return {
            serialized: pm,
            title: pm.title
          };
        }

        return undefined;
      });
      this.hasFinishedLoadingPlaylist = true;
    },

    async pushPlaylist() {
      await this.$store.dispatch("requestApi", {
        method: "play-music/set-playlist",
        args: { musics: this.playlist.map(x => x.serialized) }
      });
    },

    exportPlaylist() {
      const content = JSON.stringify(this.playlist.map(x => x.serialized));
      const blob = new Blob([content], { type: "text/plain" });

      this.$refs.exportPlaylistButton.href = window.URL.createObjectURL(blob);
    },

    async removeMusic(index) {
      this.playlist.splice(index, 1);
      await this.pushPlaylist();
    },

    clickImportPlaylistInput() {
      this.$refs.importPlaylistInput.click();
    },

    async importPlaylist() {
      const file = this.$refs.importPlaylistInput.files[0];
      if (!file) {
        return;
      }

      const playlist = JSON.parse(await readFile(file));
      console.log(playlist);

      await this.$store.dispatch("requestApi", {
        method: "play-music/set-playlist",
        args: { musics: playlist }
      });
      await this.fetchPlaylist();
    },

    async addUrl() {
      const url = this.urlToAdd;
      const res = await this.$store.dispatch("requestApi", {
        method: "play-music/add-url-to-playlist",
        args: { url }
      });
      const addedCount = res.added.length;
      if (addedCount === 0) {
        this.showSnackbar(`追加出来ませんでした`);
      } else {
        await this.fetchPlaylist();
        this.urlToAdd = "";
        this.showSnackbar(`${addedCount} 件追加しました`);
      }
    }
  },

  computed: {
    ...mapState({ musics: "musicDb" })
  },

  async created() {
    await this.$store.dispatch("fetchMusicDb");
    this.fetchPlaylist();
  }
});
</script>
