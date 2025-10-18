<script setup lang="ts">
import { type HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "vee-validate";
import { useToastTheme } from "~/composable/useToastTheme";
import { z } from "zod";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Schema } from "~/composable/useSchema";
import { useAuthStore } from "~/stores/auth";
import { useRouter } from "vue-router";
import { Spinner } from "~/components/ui/spinner";
const router = useRouter();

const authStore = useAuthStore();
const { login } = authStore;
const formSchema = Schema({
  email: z.string().email("Invalid email"),
  password: z
    .string()
    .min(4, "The password is too short, it must be greater than 8"),
});

const { handleSubmit } = useForm({
  validationSchema: formSchema,
});

const onSubmit = handleSubmit(async (values) => {
  await login(values);
  useToastTheme.success("Login successfully.");
  router.push("/");
});

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <form
    @submit.prevent="onSubmit"
    :class="cn('flex flex-col gap-6', props.class)"
  >
    <div class="flex flex-col items-center gap-2 text-center">
      <h1 class="text-2xl font-bold">Login to your account</h1>
      <p class="text-muted-foreground text-sm text-balance">
        Enter your email below to login to your account
      </p>
    </div>
    <div class="grid gap-3">
      <FormField class="gap-1" v-slot="{ componentField }" name="email">
        <FormItem>
          <FormLabel>email</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder="your-email@"
              v-bind="componentField"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField class="gap-1" v-slot="{ componentField }" name="password">
        <FormItem>
          <FormLabel>Password</FormLabel>
          <FormControl>
            <Input
              type="password"
              placeholder="password"
              v-bind="componentField"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <Button type="submit" :disabled="authStore.loading" class-name="w-full">
        <Spinner v-if="authStore.loading" />
        <span>Login</span>
      </Button>
      <div
        class="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t"
      >
        <span class="bg-background text-muted-foreground relative z-10 px-2">
          Or continue with
        </span>
      </div>
    </div>
    <div class="text-center text-sm">
      Don't have an account?
      <router-link to="/register" class="underline underline-offset-4"> Sign up </router-link>
    </div>
  </form>
</template>
