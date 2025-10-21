<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useCurrency } from "~/composable/useCurrency";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, Save, Pencil } from "lucide-vue-next";

const {
  currencyList,
  loading,
  fetchData,
  createCurrency,
} = useCurrency();

const currentCurrency = ref("");
const isEditing = ref(false);
const saving = ref(false);

onMounted(async () => {
  await fetchData();
  if (currencyList.value && currencyList.value.length > 0 && currencyList.value[0]) {
    currentCurrency.value = currencyList.value[0]?.currency || "";
  }
});

const handleEdit = () => {
  isEditing.value = true;
};

const handleCancel = () => {
  isEditing.value = false;
  if (currencyList.value && currencyList.value.length > 0 && currencyList.value[0]) {
    currentCurrency.value = currencyList.value[0]?.currency || "";
  }
};

const handleSave = async () => {
  if (!currentCurrency.value.trim()) return;

  saving.value = true;
  try {
    await createCurrency({ currency: currentCurrency.value.toUpperCase() });
    isEditing.value = false;
    await fetchData();
    if (currencyList.value && currencyList.value.length > 0 && currencyList.value[0]) {
      currentCurrency.value = currencyList.value[0]?.currency || "";
    }
  } catch (error) {
    console.error("Failed to update currency:", error);
  } finally {
    saving.value = false;
  }
};
</script>

<template>
  <div class="container mx-auto py-6 space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-3xl font-bold flex items-center gap-2">
        <DollarSign class="h-8 w-8" />
        Currency Settings
      </h1>
      <p class="text-muted-foreground">Set the default currency for your application</p>
    </div>

    <!-- Currency Settings Card -->
    <Card>
      <CardHeader>
        <CardTitle>Application Currency</CardTitle>
        <CardDescription>
          The currency code used throughout the application (e.g., USD, EUR, GBP, EGP)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <!-- Loading State -->
        <div v-if="loading" class="space-y-4">
          <Skeleton class="h-10 w-full" />
          <Skeleton class="h-10 w-32" />
        </div>

        <!-- Currency Form -->
        <div v-else class="space-y-6">
          <div class="space-y-2">
            <Label for="currency">Currency Code</Label>
            <div class="flex gap-3">
              <Input
                id="currency"
                v-model="currentCurrency"
                :disabled="!isEditing"
                placeholder="e.g., USD, EUR, GBP"
                maxlength="3"
                class="max-w-xs font-mono text-lg"
                @input="currentCurrency = currentCurrency.toUpperCase()"
              />
            </div>
            <p class="text-sm text-muted-foreground">
              Enter a 3-letter currency code (ISO 4217 format)
            </p>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-2">
            <Button
              v-if="!isEditing"
              @click="handleEdit"
              variant="default"
            >
              <Pencil class="h-4 w-4 mr-2" />
              Edit Currency
            </Button>
            <template v-else>
              <Button
                @click="handleSave"
                :disabled="!currentCurrency.trim() || saving"
              >
                <Save class="h-4 w-4 mr-2" />
                {{ saving ? "Saving..." : "Save Changes" }}
              </Button>
              <Button
                variant="outline"
                @click="handleCancel"
                :disabled="saving"
              >
                Cancel
              </Button>
            </template>
          </div>

          <!-- Current Currency Display -->
          <div v-if="!isEditing && currentCurrency" class="pt-4 border-t">
            <div class="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <DollarSign class="h-8 w-8 text-primary" />
              <div>
                <p class="text-sm text-muted-foreground">Current Currency</p>
                <p class="text-2xl font-bold font-mono">{{ currentCurrency }}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
