import { createApp } from "vue";
import { createPinia } from "pinia";
import "~/assets/css/main.css";
import "vue-sonner/style.css";
import App from "./App.vue";
// import
import { router } from "~/routers/index";
import { ThemePlugin } from "~/plugins/theme";
import { createApiPlugin } from "./plugins/api";
const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
app.use(router);
app.use(ThemePlugin, { default: "dark" });
app.use(
  createApiPlugin({
    baseURL: import.meta.env.VITE_API_BASE_URL as string,
  })
);
app.mount("#app");
// console.log(import.meta.env.VITE_API_BASE_URL,'apppppp')
