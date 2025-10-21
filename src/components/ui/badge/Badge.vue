<script setup lang="ts">
import { type HTMLAttributes, computed } from 'vue'
import { type BadgeVariants, badgeVariants } from '.'
import { cn } from '@/lib/utils'

interface Props {
  variant?: BadgeVariants['variant']
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props

  return delegated
})
</script>

<template>
  <div :class="cn(badgeVariants({ variant }), props.class)" v-bind="delegatedProps">
    <slot />
  </div>
</template>
