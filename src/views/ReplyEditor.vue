<template>
  <v-container ref="container">
    <v-row>
      <v-col>
        <v-card>
          <v-card-title>
            設定ファイルの編集
            <v-spacer></v-spacer>
            <v-select
              class="mx-1"
              v-model="selectedConfigId"
              :items="configIds"
              label="ID"
              :disabled="!isDocClean"
            ></v-select>
            <v-btn
              class="mx-1"
              color="primary"
              @click="save"
              :disabled="isDocClean"
              >保存</v-btn
            >
            <v-btn
              class="mx-1"
              color="grey"
              @click="cancel"
              :disabled="isDocClean"
              >キャンセル</v-btn
            >
          </v-card-title>
          <div ref="editor"></div>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar v-model="snackbar" timeout="3000">
      {{ snackbarText }}
    </v-snackbar>
  </v-container>
</template>

<script>
import Vue from "vue";
import CodeMirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/mode/toml/toml.js";

export default Vue.extend({
  name: "ReplyEditor",

  data: () => ({
    editor: undefined,
    isDocClean: true,
    cancelText: undefined,
    resizeHandler: undefined,
    configIds: [],
    selectedConfigId: undefined,
    snackbar: false,
    snackbarText: ""
  }),

  methods: {
    resizeEditor() {
      const targetHeight = this.$refs.container.parentNode.clientHeight - 150;
      const editorHeight = Math.max(150, targetHeight);
      this.editor.getWrapperElement().style.height = `${editorHeight}px`;
    },

    async save() {
      const text = this.editor.getValue();
      const res = await this.$store.dispatch("requestApi", {
        method: "custom-reply/set-config",
        args: { id: this.selectedConfigId, text }
      });
      if (res.formatError !== null) {
        this.$store.commit(
          "setLastError",
          `フォーマットが不正です: ${res.formatError}`
        );
        return;
      }
      this.showSnackbar("更新に成功しました");
      this.cancelText = text;
      this.isDocClean = true;
    },

    async cancel() {
      this.editor.setValue(this.cancelText);
      this.isDocClean = true;
    },

    showSnackbar(text) {
      this.snackbarText = text;
      this.snackbar = true;
    }
  },

  watch: {
    async selectedConfigId(val) {
      const res = await this.$store.dispatch("requestApi", {
        method: "custom-reply/get-config",
        args: { id: val }
      });

      this.cancelText = res.text;
      this.editor.setOption("readOnly", false);
      this.editor.setValue(res.text);
      this.editor.clearHistory();
      this.isDocClean = true;
    }
  },

  async created() {
    const res = await this.$store.dispatch("requestApi", {
      method: "custom-reply/get-config-list",
      args: {}
    });
    this.configIds = res.configIds;
  },

  mounted() {
    this.editor = CodeMirror(this.$refs.editor, {
      readOnly: true,
      mode: "toml",
      lineNumbers: true,
      lineWrapping: true,
      indentUnit: 4,
      tabSize: 4,
      indentWithTabs: true,
      extraKeys: {
        "Ctrl-S": () => {
          this.save();
        }
      }
    });

    this.editor.getDoc().on("change", () => {
      this.isDocClean = false;
    });

    this.resizeEditor();

    // なんか無くても行けそうだけどthisがわからなくて怖いので
    this.resizeHandler = () => {
      this.resizeEditor();
    };
    window.addEventListener("resize", this.resizeHandler);
  },

  beforeRouteLeave(to, from, next) {
    if (this.isDocClean) {
      next();
      return;
    }

    this.showSnackbar("保存されていません");
    next(false);
  },

  destroyed() {
    window.removeEventListener("resize", this.resizeHandler);
  }
});
</script>

<style>
.my-editor {
  font-size: 14px;
  line-height: 1.5;
  font-family: monospace;
  max-height: 80%;
}

.prism-editor__textarea:focus {
  outline: none;
}
</style>
