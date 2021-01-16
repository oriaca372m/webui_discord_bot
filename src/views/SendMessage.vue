<template>
  <div>
    <v-text-field
      solo
      label="メッセージ"
      prepend-inner-icon="mdi-message"
      v-model="messageToSend"
    >
      <template v-slot:append-outer>
        <v-btn @click="send">送信</v-btn>
      </template>
    </v-text-field>
  </div>
</template>

<script>
import Vue from "vue";

export default Vue.extend({
  name: "App",

  data: () => ({
    messageToSend: ""
  }),

  methods: {
    async send() {
      await this.$store.dispatch("requestApi", {
        method: "sendToChannel",
        args: { msg: this.messageToSend }
      });
    }
  }
});
</script>
