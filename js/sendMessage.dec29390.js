(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["sendMessage"],{"71ea":function(e,a,n){"use strict";n.r(a);var s=function(){var e=this,a=e.$createElement,n=e._self._c||a;return n("v-container",[n("v-row",[n("v-col",[n("v-card",[n("v-card-title",[e._v("メッセージの送信")]),n("v-text-field",{attrs:{label:"メッセージ","prepend-inner-icon":"mdi-message"},scopedSlots:e._u([{key:"append-outer",fn:function(){return[n("v-btn",{on:{click:e.send}},[e._v("送信")])]},proxy:!0}]),model:{value:e.messageToSend,callback:function(a){e.messageToSend=a},expression:"messageToSend"}})],1)],1)],1)],1)},t=[],d=n("2b0e"),o=d["a"].extend({name:"SendMessage",data:()=>({messageToSend:""}),methods:{async send(){await this.$store.dispatch("requestApi",{method:"sendToChannel",args:{msg:this.messageToSend}})}}}),r=o,i=n("2877"),l=n("6544"),c=n.n(l),u=n("8336"),p=n("b0af"),m=n("99d9"),v=n("62ad"),f=n("a523"),g=n("0fd9"),w=n("8654"),b=Object(i["a"])(r,s,t,!1,null,null,null);a["default"]=b.exports;c()(b,{VBtn:u["a"],VCard:p["a"],VCardTitle:m["a"],VCol:v["a"],VContainer:f["a"],VRow:g["a"],VTextField:w["a"]})}}]);
//# sourceMappingURL=sendMessage.dec29390.js.map