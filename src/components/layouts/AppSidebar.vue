<script setup lang="ts">
import type { SidebarProps } from '@/components/ui/sidebar'

import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-vue-next"
import NavMain from '@/components/layouts/NavMain.vue'
// D:\shadcd-vue\my-vue-app\src\components\layouts\NavMain.vue
import NavProjects from '@/components/layouts/NavProjects.vue'
import NavUser from '@/components/layouts/NavUser.vue'
import TeamSwitcher from '@/components/layouts/TeamSwitcher.vue'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { useAuthStore } from '~/stores/auth'
import SidebarMenuItem from '../ui/sidebar/SidebarMenuItem.vue'
import SidebarMenuButton from '../ui/sidebar/SidebarMenuButton.vue'

const props = withDefaults(defineProps<SidebarProps>(), {
  collapsible: "icon",
})
const authStore = useAuthStore();

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Sales",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Orders",
          url: "/orders",
        },
        {
          title: "Carts",
          url: "/carts",
        }
      ],
    },
    {
      title: "Catalog",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Products",
          url: "/products",
        },
        {
          title: "Categories",
          url: "/categories",
        },
        {
          title: "Quantum",
          url: "/quantum",
        },
      ],
    },
    {
      title: "Customers",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Users",
          url: "/users",
        },
        {
          title: "Wishlist",
          url: "/wishlist",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "Locations",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "Governorates",
          url: "#",
        },
        {
          title: "Cities",
          url: "#",
        },
        {
          title: "Addresses",
          url: "#",
        },
      ],
    },
    {
      title: "Support",
      url: "#",
      icon: PieChart,
      items: [
        {
          title: "Requests",
          url: "#",
        },
        {
          title: "FAQs",
          url: "#",
        },
        {
          title: "Contact",
          url: "#",
        },
      ],
    },
    {
      title: "Analytics",
      url: "#",
      icon: Command,
      items: [
        {
          title: "Stats",
          url: "#",
        },
        {
          title: "Reports",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: AudioWaveform,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Localization & Currency",
          url: "#",
        },
        {
          title: "Roles & Permissions",
          url: "#",
        },
      ],
    },
  ],
  // projects: [
  //   {
  //     name: "Design Engineering",
  //     url: "#",
  //     icon: Frame,
  //   },
  //   {
  //     name: "Sales & Marketing",
  //     url: "#",
  //     icon: PieChart,
  //   },
  //   {
  //     name: "Travel",
  //     url: "#",
  //     icon: Map,
  //   },
  // ],
}
</script>

<template>
  <Sidebar v-bind="props">
    <SidebarHeader>
      <TeamSwitcher :teams="data.teams" />
    </SidebarHeader>
    <SidebarContent>
      <NavMain :items="data.navMain">
        <template #sidebarItems>
          <SidebarMenuItem>
            <SidebarMenuButton class="!p-0 ">
              <router-link to="/" :class="{ 'bg-[color-mix(in_oklab,var(--ring)_50%,transparent)]': $route.path === '/' }" class="flex items-center gap-2 p-2 w-full" >
                <PieChart class="h-5 w-5" />
                <span>stats</span>
              </router-link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </template>
      </NavMain>
      <!-- <NavProjects :projects="data.projects" /> -->
    </SidebarContent>
    <SidebarFooter>
      <NavUser :user="authStore.currentUser" />
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
</template>
