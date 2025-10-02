// src/stores/auth.ts
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { FetchOptions } from "ofetch";
import { useCookies } from "@vueuse/integrations/useCookies";
import { useToastTheme } from "~/composable/useToastTheme";
import type {
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  User,
} from "@/types/user";
import { useApi } from "~/plugins/api";

export const useAuthStore = defineStore("auth", () => {
  const cookies = useCookies();
  const api = useApi();
  const accessToken = ref<string | null>(cookies.get("access_token") ?? null);
  const currentUser = ref<User | null>(null);
  const loading = ref<boolean>(false);

  const isAuthenticated = computed(() => !!accessToken.value);

  const setAccessToken = (token: string | null) => {
    accessToken.value = token;
    if (token) cookies.set("access_token", token, { maxAge: 60 * 15 });
    else cookies.remove("access_token");
  };

  const fetchMe = async () => {
    if (!accessToken.value) {
      currentUser.value = null;
      return null;
    }

    const { user: me } = await api<{ user: User }>("/auth/me", {
      method: "GET",
    } as FetchOptions<"json", any>);
    currentUser.value = me;
    return me;
  };
  const login = async (payload: LoginPayload) => {
    loading.value = true;
    try {
      const res = await api<LoginResponse>("/auth/login", {
        method: "POST",
        body: payload,
        noAuth: true,
      } as FetchOptions<"json", any>);

      setAccessToken(res.token);
      if (res.user) currentUser.value = res.user as User;
      return res;
    } catch (error) {
      useToastTheme.error((error as Error)?.message);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const register = async (payload: RegisterPayload) => {
    loading.value = true;
    try {
      const res = await api<LoginResponse>("/auth/register", {
        method: "POST",
        body: payload,
        noAuth: true,
      } as FetchOptions<"json", any>);

      setAccessToken(res.token);
      if (res.user) currentUser.value = res.user as User;
      return res;
    } catch (error) {
      useToastTheme.error((error as Error)?.message);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const logout = async () => {
    try {
      loading.value = true;
      await api("/auth/logout", {
        method: "POST",
        credentials: "include",
      } as FetchOptions);
      setAccessToken(null);
      currentUser.value = null;
    } catch (error) {
      useToastTheme.error((error as Error)?.message);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  return {
    accessToken,
    currentUser,
    loading,
    isAuthenticated,
    setAccessToken,
    login,
    register,
    logout,
    fetchMe,
  };
});
