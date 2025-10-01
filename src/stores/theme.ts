import { defineStore } from "pinia";
import { useCookies } from "@vueuse/integrations/useCookies";

const cookies = useCookies();
type theme = "dark" | "light";
export const useThemeStore = defineStore("theme", {
  state: () => ({
    theme: cookies.get("theme") || "dark",
  }),
  actions: {
    toggleTheme(theme: theme) {
      this.theme = theme;
      cookies.set("theme", this.theme);
    },
  },
});
