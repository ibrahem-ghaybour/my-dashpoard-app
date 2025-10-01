// src/plugins/theme.ts
import type { App, Plugin } from "vue";
import { watch, onMounted } from "vue";
import { useThemeStore } from "@/stores/theme";
import { useCookies } from "@vueuse/integrations/useCookies";

export interface ThemePluginOptions {
  key?: string; // اسم الكوكي
  default?: "dark" | "light";
  maxAge?: number; // بالثواني
}

export const ThemePlugin: Plugin = {
  install(app: App, opts: ThemePluginOptions = {}) {
    const key = opts.key ?? "theme";
    const maxAge = opts.maxAge ?? 60 * 60 * 24 * 365;
    const cookies = useCookies();
    const store = useThemeStore();

    // 1) init from cookie
    const saved = cookies.get(key) as "dark" | "light" | undefined;
    store.theme = saved ?? opts.default ?? "dark";

    // 2) apply <html> class
    const apply = (t: "dark" | "light") => {
      const html = document.documentElement;
      if (!html) return;
      html.classList.toggle("dark", t === "dark");
    };

    onMounted(() => apply(store.theme));

    watch(
      () => store.theme,
      (t) => {
        apply(t);
        cookies.set(key, t, { maxAge });
      },
      { immediate: true }
    );

    // (اختياري) تعريض دوال عامة
    // app.config.globalProperties.$toggleTheme = () => {
    //   store.theme = store.theme === "dark" ? "light" : "dark";
    // };
  },
};

