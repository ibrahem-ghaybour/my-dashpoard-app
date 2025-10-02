import type { NavigationGuardNext, RouteLocationNormalized } from "vue-router";

export type MiddlewareContext = {
  to: RouteLocationNormalized;
  from: RouteLocationNormalized;
  next: NavigationGuardNext;
};

export type Middleware = (ctx: MiddlewareContext) => unknown | Promise<unknown>;
