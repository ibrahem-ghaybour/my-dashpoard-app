<template>
  <div class="container-app">
    <slot></slot>
  </div>
</template>

<script lang="ts" setup>

</script>

<style scoped>
.container-app {
    width: 100%;
    @media (width >= 40rem /* 640px */) {
        padding: 1rem;
    }
    @media (width >= 48rem /* 768px */) {
        padding: 1.5rem;
    }
    @media (width >= 64rem /* 1024px */) {
       padding: 2rem
    }
    @media (width >= 80rem /* 1280px */) {
        max-width: 80rem /* 1280px */;
    }
    @media (width >= 96rem /* 1536px */) {
        max-width: 96rem /* 1536px */;
    }
}
</style>