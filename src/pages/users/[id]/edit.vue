<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUsers } from "~/composable/useUsers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Save } from "lucide-vue-next";

const route = useRoute();
const router = useRouter();
const { selectedUser, loading, getUserById, updateUser } = useUsers();

const userId = computed(() => route.params.id as string);

// Form data
const formData = ref({
  name: "",
  email: "",
  phone: "",
  role: "",
  status: "",
  gender: "",
  birthdate: "",
  avatar: "",
});

const saving = ref(false);

onMounted(async () => {
  if (userId.value) {
    await getUserById(userId.value);
    if (selectedUser.value) {
      formData.value = {
        name: selectedUser.value.name,
        email: selectedUser.value.email,
        phone: selectedUser.value.phone || "",
        role: selectedUser.value.role,
        status: selectedUser.value.status,
        gender: selectedUser.value.gender || "",
        birthdate: selectedUser.value.birthdate
          ? new Date(selectedUser.value.birthdate).toISOString().split("T")[0]
          : "",
        avatar: selectedUser.value.avatar || "",
      };
    }
  }
});

const handleSubmit = async () => {
  saving.value = true;
  try {
    const updateData: any = {
      name: formData.value.name,
      email: formData.value.email,
      phone: formData.value.phone,
      role: formData.value.role,
      status: formData.value.status,
    };

    if (formData.value.gender) {
      updateData.gender = formData.value.gender;
    }
    if (formData.value.birthdate) {
      updateData.birthdate = formData.value.birthdate;
    }
    if (formData.value.avatar) {
      updateData.avatar = formData.value.avatar;
    }

    await updateUser(userId.value, updateData);
    router.push(`/users/${userId.value}`);
  } catch (error) {
    console.error("Failed to update user:", error);
  } finally {
    saving.value = false;
  }
};

const handleCancel = () => {
  router.push(`/users/${userId.value}`);
};
</script>

<template>
  <div class="container mx-auto py-6 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <Button variant="ghost" size="icon" @click="handleCancel">
          <ArrowLeft class="h-5 w-5" />
        </Button>
        <div>
          <h1 class="text-3xl font-bold">Edit User</h1>
          <p class="text-muted-foreground">Update user information</p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <Card v-if="loading">
      <CardHeader>
        <Skeleton class="h-8 w-48" />
        <Skeleton class="h-4 w-64 mt-2" />
      </CardHeader>
      <CardContent class="space-y-4">
        <Skeleton class="h-10 w-full" />
        <Skeleton class="h-10 w-full" />
        <Skeleton class="h-10 w-full" />
      </CardContent>
    </Card>

    <!-- Edit Form -->
    <Card v-else-if="selectedUser">
      <CardHeader>
        <CardTitle>User Information</CardTitle>
        <CardDescription>Edit the user's details below</CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div class="grid gap-6 md:grid-cols-2">
            <!-- Name -->
            <div class="space-y-2">
              <Label for="name">Name *</Label>
              <Input
                id="name"
                v-model="formData.name"
                placeholder="Enter name"
                required
              />
            </div>

            <!-- Email -->
            <div class="space-y-2">
              <Label for="email">Email *</Label>
              <Input
                id="email"
                type="email"
                v-model="formData.email"
                placeholder="Enter email"
                required
              />
            </div>

            <!-- Phone -->
            <div class="space-y-2">
              <Label for="phone">Phone</Label>
              <Input
                id="phone"
                v-model="formData.phone"
                placeholder="Enter phone number"
              />
            </div>

            <!-- Role -->
            <div class="space-y-2">
              <Label for="role">Role *</Label>
              <Select v-model="formData.role" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <!-- Status -->
            <div class="space-y-2">
              <Label for="status">Status *</Label>
              <Select v-model="formData.status" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <!-- Gender -->
            <div class="space-y-2">
              <Label for="gender">Gender</Label>
              <Select v-model="formData.gender">
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Not specified</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <!-- Birthdate -->
            <div class="space-y-2">
              <Label for="birthdate">Birthdate</Label>
              <Input
                id="birthdate"
                type="date"
                v-model="formData.birthdate"
              />
            </div>

            <!-- Avatar URL -->
            <div class="space-y-2 md:col-span-2">
              <Label for="avatar">Avatar URL</Label>
              <Input
                id="avatar"
                v-model="formData.avatar"
                placeholder="Enter avatar URL"
              />
            </div>
          </div>

          <!-- Avatar Preview -->
          <div v-if="formData.avatar" class="flex items-center gap-4 p-4 border rounded-lg">
            <img
              :src="formData.avatar"
              alt="Avatar preview"
              class="w-16 h-16 rounded-full object-cover"
              @error="() => (formData.avatar = '')"
            />
            <div>
              <p class="text-sm font-medium">Avatar Preview</p>
              <p class="text-xs text-muted-foreground">
                This is how the avatar will appear
              </p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-4 justify-end pt-4 border-t">
            <Button type="button" variant="outline" @click="handleCancel">
              Cancel
            </Button>
            <Button type="submit" :disabled="saving">
              <Save class="h-4 w-4 mr-2" />
              {{ saving ? "Saving..." : "Save Changes" }}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>

    <!-- Error State -->
    <Card v-else>
      <CardContent class="py-10 text-center">
        <p class="text-muted-foreground">User not found</p>
        <Button class="mt-4" @click="router.push('/users')">
          Back to Users
        </Button>
      </CardContent>
    </Card>
  </div>
</template>
