import { createRouter, createWebHistory } from "vue-router";



const routes = [
      {
      path: '/',
      component: ()=> import("@/layouts/defaults.vue"), // ✅ فيه Sidebar
      children: [
        { path: '', name: 'home', component: () => import('~/pages/index.vue') },
        { path: 'orders', name: 'orders', component: () => import('~/pages/orders.vue') },
        { path: 'carts', name: 'carts', component: () => import('~/pages/carts.vue') },
        { path: 'users', name: 'users', component: () => import('~/pages/users/index.vue') },
        { path: 'users/:id', name: 'user-details', component: () => import('~/pages/users/[id].vue') },
        { path: 'users/:id/edit', name: 'user-edit', component: () => import('~/pages/users/[id]/edit.vue') },
      ],
    },
    {
      path: '/login',
      component: ()=> import("~/pages/auth/login.vue"),
    },
    {
      path: '/register',
      component: ()=> import("~/pages/auth/register.vue"),
    },

];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
