// src/plugins/api.ts
import { ofetch, type $Fetch, type FetchOptions } from "ofetch";
import { type App, type Plugin, inject } from "vue";
import { useAuthStore } from "@/stores/auth";

export interface ApiPluginOptions {
  baseURL: string;
  refreshPath?: string; // default: /auth/refresh
  tokenSkewSec?: number; // default: 20
}

const RETRY_KEY = Symbol("retry");
const ApiKey = Symbol("api");

const withAuthHeader = (headers: FetchOptions["headers"], token: string) => {
  const h: Record<string, string> = {};
  if (headers instanceof Headers) headers.forEach((v, k) => (h[k] = v));
  else if (Array.isArray(headers))
    headers.forEach(([k, v]) => (h[k] = v as string));
  else if (headers) Object.assign(h, headers as Record<string, string>);
  h.Authorization = `Bearer ${token}`;
  return h;
};

export const createApiPlugin = (opts: ApiPluginOptions): Plugin => {
  return {
    install(app: App) {
      const refreshPath = opts.refreshPath ?? "/auth/refresh";
      const skew = opts.tokenSkewSec ?? 20;

      let isRefreshing = false;
      let failedQueue: {
        resolve: (t: string) => void;
        reject: (e: any) => void;
      }[] = [];

      const processQueue = (error: any, token: string | null) => {
        failedQueue.forEach(({ resolve, reject }) =>
          token ? resolve(token) : reject(error)
        );
        failedQueue = [];
      };

      const isExpired = (jwt?: string | null) => {
        try {
          if (!jwt) return true;
          const [, p] = jwt.split(".");
          if (!p) return true;
          const payload = JSON.parse(
            atob(p.replace(/-/g, "+").replace(/_/g, "/"))
          );
          console.log(payload);
          return typeof payload.exp === "number"
            ? Math.floor(Date.now() / 1000) >= payload.exp - skew
            : true;
        } catch {
          return true;
        }
      };

      const api = ofetch.create({
        baseURL: opts.baseURL,
        credentials: "include",

        async onRequest({ options }) {
          const auth = useAuthStore();

          (options as any)[RETRY_KEY] = (options as any)[RETRY_KEY] ?? false;
          if ((options as any).noAuth) return;

          if (!auth.accessToken || isExpired(auth.accessToken)) {
            try {
              const newToken = await refreshToken();
              (options as any).headers = withAuthHeader(
                options.headers,
                newToken
              );
              return;
            } catch {
              // let the request fail; logout will happen in refreshToken
              return;
            }
          }

          (options as any).headers = withAuthHeader(
            options.headers,
            auth.accessToken!
          );
        },

        async onResponseError({ request, response, options }) {
          // const auth = useAuthStore();

          if (
            response?.status === 401 &&
            !(options as any)[RETRY_KEY] &&
            !(options as any).noAuth
          ) {
            (options as any)[RETRY_KEY] = true;
            try {
              const newToken = await refreshToken();
              (options as any).headers = withAuthHeader(
                options.headers,
                newToken
              );
              return api(request as any, options as any);
            } catch (e) {
              // auth.logout();
              return Promise.reject(e);
            }
          }

          const msg =
            response?._data?.errors?.[0]?.msg ??
            response?._data?.message ??
            "Request failed";
          return Promise.reject(new Error(msg));
        },
      });

      const refreshToken = async (): Promise<string> => {
        const auth = useAuthStore();

        if (isRefreshing) {
          return new Promise<string>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
        }

        isRefreshing = true;
        try {
          const data = await api<{ token: string }>(refreshPath, {
            method: "POST",
            credentials: "include",
            noAuth: true,
          } as any);

          const newToken = (data as any).token;
          auth.setAccessToken(newToken);
          processQueue(null, newToken);
          return newToken;
        } catch (err) {
          processQueue(err, null);
          auth.logout();
          throw err;
        } finally {
          isRefreshing = false;
        }
      };

      // expose: inject('api') or this.$api
      app.provide(ApiKey, api);
    },
  };
};

// Optional composable
export const useApi = () => {
  const api = inject<$Fetch>(ApiKey);
  if (!api) throw new Error("API plugin not installed");
  return api;
};

// Allow noAuth option
declare module "ofetch" {
  interface FetchOptions {
    noAuth?: boolean;
  }
}
// Add $api to component instance type
declare module "vue" {
  interface ComponentCustomProperties {
    $api: $Fetch;
  }
}
