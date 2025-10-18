<script lang="ts" setup>
import SingUpForm from '~/components/auth/SingUpForm.vue';
import ColoursSpinner from '~/components/ColoursSpinner.vue';


</script>
<template>
  <div class="flex  items-center justify-center min-h-[100dvh] ">
        <ColoursSpinner class="absolute top-20 -z-1 w-[30%] aspect-square" />
    <SingUpForm  />
  </div>
</template>

<style></style>
