import { useAuthStore } from "~/stores/auth";
import type { Middleware } from "~/routers/middleware/type";
export const auth: Middleware = async ({ to, next }) => {
  const auth = useAuthStore();

  if (!auth.currentUser) {
    return next({ name: "login", query: { redirect: to.fullPath } });
  }
  return next();
};

export const guest: Middleware = ({ next }) => {
  const auth = useAuthStore();
  if (auth.currentUser) return next({ name: "home" });
  return next();
};

export const role =
  (roles: string[]): Middleware =>
  ({ next }) => {
    const auth = useAuthStore();
    if (!auth.currentUser) return next({ name: "login" });
    if (!roles.includes(auth.currentUser.role)) {
      return next({ name: "forbidden" }); // صفحة 403 مثلاً
    }
    return next();
  };
