<script setup lang="ts">
import type { LucideIcon } from "lucide-vue-next";
import { ChevronRight } from "lucide-vue-next";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

defineProps<{
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}>();
</script>

<template>
  <SidebarGroup>
    <SidebarGroupLabel>Platform</SidebarGroupLabel>
    <SidebarMenu>
      <slot name="sidebarItems" />
      <template v-if="items">
        <Collapsible
          v-for="item in items"
          :key="item.title"
          as-child
          :default-open="item.isActive"
          class="group/collapsible"
        >
          <SidebarMenuItem>
            <CollapsibleTrigger v-if="item.items" as-child>
              <SidebarMenuButton class="!h-10" :tooltip="item.title">
                <component :is="item.icon" v-if="item.icon" />
                <span>{{ item.title }}</span>
                <ChevronRight 
                  class="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
                />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <SidebarMenuButton class="!h-10" as-child :tooltip="item.title" v-else>
              <router-link :to="item.url" class="flex items-center gap-2  w-full">
                <component :is="item.icon" class="h-4 w-4" v-if="item.icon" />
                <span>{{ item.title }}</span>
              </router-link>
            </SidebarMenuButton>
            <CollapsibleContent>
              <SidebarMenuSub>
                <SidebarMenuSubItem
                  v-for="subItem in item.items"
                  :key="subItem.title"
                >
                  <SidebarMenuSubButton as-child>
                    <router-link
                    class="flex items-center gap-2 p-2 w-full"
                      :class="{
                        '!bg-[color-mix(in_oklab,var(--ring)_50%,transparent)]':
                          $route.path === subItem.url
                      }"
                      :to="subItem.url"
                    >
                      <span>{{ subItem.title }}</span>
                    </router-link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible></template
      >
    </SidebarMenu>
  </SidebarGroup>
</template>
