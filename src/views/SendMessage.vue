<template>
  <v-container>
    <v-row>
      <v-col>
        <v-card>
          <v-card-title>メッセージの送信</v-card-title>
          <v-text-field
            label="メッセージ"
            prepend-inner-icon="mdi-message"
            v-model="messageToSend"
          >
            <template v-slot:append-outer>
              <v-btn @click="send">送信</v-btn>
            </template>
          </v-text-field>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import Vue from "vue";

export default Vue.extend({
  name: "SendMessage",

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
