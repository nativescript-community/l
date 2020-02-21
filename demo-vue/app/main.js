import { l, loadLocaleJSON } from "nativescript-l";
import Vue from "nativescript-vue";


loadLocaleJSON(require('./i18n/en.default'));

import App from "./components/App.vue";

// Vue.config.silent = (TNS_ENV === "production");
Vue.config.silent = true;
Vue.filter("L", l);

new Vue({
  render: h => h("frame", [h(App)])
}).$start();
