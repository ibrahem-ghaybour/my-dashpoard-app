import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "~/stores/auth";

const routes = [
  {
    path: '/',
    component: () => import("@/layouts/defaults.vue"),
    meta: { requiresAuth: true, allowedRoles: ['admin', 'manager'] },
    children: [
      { 
        path: '', 
        name: 'home', 
        component: () => import('~/pages/index.vue'),
        meta: { requiresAuth: true, allowedRoles: ['admin', 'manager'] }
      },
      { 
        path: 'orders', 
        name: 'orders', 
        component: () => import('~/pages/orders.vue'),
        meta: { requiresAuth: true, allowedRoles: ['admin', 'manager'] }
      },
      { 
        path: 'carts', 
        name: 'carts', 
        component: () => import('~/pages/carts.vue'),
        meta: { requiresAuth: true, allowedRoles: ['admin', 'manager'] }
      },
      { 
        path: 'users', 
        name: 'users', 
        component: () => import('~/pages/users/index.vue'),
        meta: { requiresAuth: true, allowedRoles: ['admin', 'manager'] }
      },
      { 
        path: 'users/:id', 
        name: 'user-details', 
        component: () => import('~/pages/users/[id].vue'),
        meta: { requiresAuth: true, allowedRoles: ['admin', 'manager'] }
      },
      { 
        path: 'users/:id/edit', 
        name: 'user-edit', 
        component: () => import('~/pages/users/[id]/edit.vue'),
        meta: { requiresAuth: true, allowedRoles: ['admin', 'manager'] }
      },
      { 
        path: 'wishlist', 
        name: 'wishlist', 
        component: () => import('~/pages/wishlist/index.vue'),
        meta: { requiresAuth: true, allowedRoles: ['admin', 'manager'] }
      },
      { 
        path: 'wishlist/:userId', 
        name: 'wishlist-details', 
        component: () => import('~/pages/wishlist/[userId].vue'),
        meta: { requiresAuth: true, allowedRoles: ['admin', 'manager'] }
      },
      { 
        path: 'products', 
        name: 'products', 
        component: () => import('~/pages/products/index.vue'),
        meta: { requiresAuth: true, allowedRoles: ['admin', 'manager'] }
      },
      { 
        path: 'products/:id', 
        name: 'product-details', 
        component: () => import('~/pages/products/[id].vue'),
        meta: { requiresAuth: true, allowedRoles: ['admin', 'manager'] }
      },
      { 
        path: 'categories', 
        name: 'categories', 
        component: () => import('~/pages/categories/index.vue'),
        meta: { requiresAuth: true, allowedRoles: ['admin', 'manager'] }
      },
    ],
  },
  {
    path: '/login',
    name: 'login',
    component: () => import("~/pages/auth/login.vue"),
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import("~/pages/auth/register.vue"),
    meta: { requiresAuth: false }
  },
  {
    path: '/forbidden',
    name: 'forbidden',
    component: () => import("~/pages/forbidden.vue"),
    meta: { requiresAuth: false }
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore();
  
  // Try to fetch current user if authenticated but user data not loaded
  if (authStore.isAuthenticated && !authStore.currentUser) {
    try {
      await authStore.fetchMe();
    } catch (error) {
      // If fetch fails, clear auth and redirect to login
      authStore.setAccessToken(null);
      authStore.currentUser = null;
    }
  }

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const allowedRoles = to.meta.allowedRoles as string[] | undefined;

  // If route requires authentication
  if (requiresAuth) {
    if (!authStore.isAuthenticated) {
      // Not authenticated, redirect to login
      next({ name: 'login', query: { redirect: to.fullPath } });
      return;
    }

    // Check if user has required role
    if (allowedRoles && allowedRoles.length > 0 && authStore.currentUser) {
      if (!allowedRoles.includes(authStore.currentUser.role)) {
        // User doesn't have required role, redirect to forbidden
        next({ name: 'forbidden' });
        return;
      }
    }
  }

  // If trying to access login/register while authenticated
  if ((to.name === 'login' || to.name === 'register') && authStore.isAuthenticated) {
    next({ name: 'home' });
    return;
  }

  next();
});
