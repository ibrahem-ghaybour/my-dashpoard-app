<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "vue-sonner";
import { useRouter } from "vue-router";
const formSchema = toTypedSchema(
  z.object({
    email: z.string().email("Please enter a valid email."),
    password: z.string().min(6, "Password must be at least 6 chars."),
    name: z.string().min(6, "Name must be at least 6 chars."),
  })
);
import { useAuthStore } from "~/stores/auth";
import { Spinner } from "~/components/ui/spinner";
const router = useRouter();
const auth = useAuthStore();

const { handleSubmit, isFieldDirty } = useForm({
  validationSchema: formSchema,
  // optional:
  // initialValues: { email: "", password: "" },
});
const authStore = useAuthStore();
const onSubmit = handleSubmit(async (values) => {
  try {
    await authStore.register(values);
    toast.success("Account created successfully",{class:'!bg-chart-2/50'});
    router.push("/");
  } catch (error) {
    console.error(error);
  }
});
</script>

<template>
  <form
    class="w-full lg:w-2/5 md:w-2/3 space-y-6 rounded-2xl border border-primary/20 p-4 bg-background/80"
    @submit.prevent="onSubmit"
  >
    <h2 class="text-2xl mb-0 pb-0">Login</h2>
    <span class="text-sm inline-block"
      >Enter your email, password and name</span
    >

    <FormField
      v-slot="{ componentField }"
      name="name"
      :validate-on-blur="!isFieldDirty('name')"
    >
      <FormItem>
        <FormLabel>Name</FormLabel>
        <FormControl>
          <Input
            type="text"
            placeholder="user name"
            autocomplete="name"
            v-bind="componentField"
          />
        </FormControl>
        <FormDescription>Enter your account name.</FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>
    <!-- Email -->
    <FormField
      v-slot="{ componentField }"
      name="email"
      :validate-on-blur="!isFieldDirty('email')"
    >
      <FormItem>
        <FormLabel>Email</FormLabel>
        <FormControl>
          <Input
            type="email"
            placeholder="email"
            autocomplete="email"
            v-bind="componentField"
          />
        </FormControl>
        <FormDescription>Enter your account email.</FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- Password -->
    <FormField
      v-slot="{ componentField }"
      name="password"
      :validate-on-blur="!isFieldDirty('password')"
    >
      <FormItem>
        <FormLabel>Password</FormLabel>
        <FormControl>
          <Input
            type="password"
            placeholder="password"
            autocomplete="current-password"
            v-bind="componentField"
          />
        </FormControl>
        <FormDescription>Minimum 6 characters.</FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>

    <Button
      variant="outline"
      :disabled="auth.loading"
      class="w-full flex justify-center items-center"
      type="submit"
      >
      <Spinner v-if="auth.loading" />
      <span >Register</span>
    </Button>
    <Button type="button" class="w-full" variant="link">
      <router-link to="/login">Already have an account? login</router-link>
    </Button>
  </form>
</template>
