<script setup lang="ts">
import { useRouter } from "vue-router";
import { useAuthStore } from "~/stores/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert, Home, LogOut } from "lucide-vue-next";

const router = useRouter();
const authStore = useAuthStore();

const handleGoHome = () => {
  router.push("/");
};

const handleLogout = async () => {
  await authStore.logout();
  router.push("/login");
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
    <Card class="w-full max-w-md">
      <CardHeader class="text-center space-y-4">
        <div class="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
          <ShieldAlert class="h-10 w-10 text-red-600" />
        </div>
        <CardTitle class="text-3xl font-bold text-red-600">Access Denied</CardTitle>
        <CardDescription class="text-base">
          You do not have permission to access this page
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <p class="text-sm text-red-800 text-center">
            This area is restricted to authorized personnel only. 
            If you believe this is an error, please contact your administrator.
          </p>
        </div>
        
        <div class="space-y-3">
          <Button @click="handleGoHome" class="w-full" variant="outline">
            <Home class="h-4 w-4 mr-2" />
            Go to Home
          </Button>
          <Button @click="handleLogout" class="w-full" variant="destructive">
            <LogOut class="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        <div class="text-center">
          <p class="text-xs text-muted-foreground">
            Required roles: Admin, Manager
          </p>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
