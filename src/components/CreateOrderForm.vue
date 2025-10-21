<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useOrders } from "~/composable/useOrders";
import { useUsers } from "~/composable/useUsers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Trash2, ShoppingCart } from "lucide-vue-next";

const emit = defineEmits<{
  success: [orderId: string];
  cancel: [];
}>();

const { createOrder, loading: orderLoading } = useOrders();
const { userList, fetchData: fetchUsers, loading: usersLoading } = useUsers();

// Form data
const formData = ref({
  userId: "",
  status: "pending",
  currency: "USD",
  notes: "",
  shippingAddress: {
    fullName: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    governorate: "",
    postalCode: "",
    country: "",
  },
});

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

const orderItems = ref<OrderItem[]>([
  { name: "", price: 0, quantity: 1 },
]);

const addItem = () => {
  orderItems.value.push({ name: "", price: 0, quantity: 1 });
};

const removeItem = (index: number) => {
  if (orderItems.value.length > 1) {
    orderItems.value.splice(index, 1);
  }
};

const calculateSubtotal = (item: OrderItem) => {
  return item.price * item.quantity;
};

const totalAmount = computed(() => {
  return orderItems.value.reduce((sum, item) => sum + calculateSubtotal(item), 0);
});

const isFormValid = computed(() => {
  return (
    formData.value.userId &&
    orderItems.value.length > 0 &&
    orderItems.value.every(item => item.name && item.price > 0 && item.quantity > 0) &&
    formData.value.shippingAddress.fullName &&
    formData.value.shippingAddress.phone &&
    formData.value.shippingAddress.line1 &&
    formData.value.shippingAddress.city &&
    formData.value.shippingAddress.country
  );
});

onMounted(() => {
  fetchUsers();
});

const handleSubmit = async () => {
  if (!isFormValid.value) return;

  try {
    const orderData = {
      userId: formData.value.userId,
      items: orderItems.value.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        subtotal: calculateSubtotal(item),
      })),
      totalAmount: totalAmount.value,
      currency: formData.value.currency,
      status: formData.value.status,
      notes: formData.value.notes || undefined,
      shippingAddress: formData.value.shippingAddress,
    };

    const result = await createOrder(orderData);
    emit("success", result._id);
  } catch (error) {
    console.error("Failed to create order:", error);
  }
};

const handleCancel = () => {
  emit("cancel");
};
</script>

<template>
  <div class="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <ShoppingCart class="h-5 w-5" />
          Create New Order
        </CardTitle>
        <CardDescription>Fill in the order details below</CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <!-- Customer Selection -->
        <div class="space-y-2">
          <Label for="customer">Customer *</Label>
          <Select v-model="formData.userId" :disabled="usersLoading">
            <SelectTrigger id="customer">
              <SelectValue placeholder="Select a customer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="user in userList"
                :key="user._id"
                :value="user._id"
              >
                {{ user.name }} ({{ user.email }})
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Order Status and Currency -->
        <div class="grid gap-4 md:grid-cols-2">
          <div class="space-y-2">
            <Label for="status">Status</Label>
            <Select v-model="formData.status">
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label for="currency">Currency</Label>
            <Select v-model="formData.currency">
              <SelectTrigger id="currency">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
                <SelectItem value="EGP">EGP</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <!-- Order Items -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <Label>Order Items *</Label>
            <Button type="button" size="sm" variant="outline" @click="addItem">
              <Plus class="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>

          <div
            v-for="(item, index) in orderItems"
            :key="index"
            class="p-4 border rounded-lg space-y-3"
          >
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium">Item {{ index + 1 }}</span>
              <Button
                v-if="orderItems.length > 1"
                type="button"
                size="sm"
                variant="ghost"
                @click="removeItem(index)"
              >
                <Trash2 class="h-4 w-4" />
              </Button>
            </div>

            <div class="grid gap-3 md:grid-cols-3">
              <div class="space-y-2">
                <Label :for="`item-name-${index}`">Product Name *</Label>
                <Input
                  :id="`item-name-${index}`"
                  v-model="item.name"
                  placeholder="Enter product name"
                />
              </div>

              <div class="space-y-2">
                <Label :for="`item-price-${index}`">Price *</Label>
                <Input
                  :id="`item-price-${index}`"
                  v-model.number="item.price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>

              <div class="space-y-2">
                <Label :for="`item-quantity-${index}`">Quantity *</Label>
                <Input
                  :id="`item-quantity-${index}`"
                  v-model.number="item.quantity"
                  type="number"
                  min="1"
                  placeholder="1"
                />
              </div>
            </div>

            <div class="text-right">
              <span class="text-sm text-muted-foreground">Subtotal: </span>
              <span class="font-semibold">
                {{ new Intl.NumberFormat('en-US', { style: 'currency', currency: formData.currency }).format(calculateSubtotal(item)) }}
              </span>
            </div>
          </div>

          <!-- Total Amount -->
          <div class="flex justify-end items-center gap-2 p-4 bg-muted rounded-lg">
            <span class="text-lg font-semibold">Total Amount:</span>
            <span class="text-2xl font-bold text-primary">
              {{ new Intl.NumberFormat('en-US', { style: 'currency', currency: formData.currency }).format(totalAmount) }}
            </span>
          </div>
        </div>

        <!-- Notes -->
        <div class="space-y-2">
          <Label for="notes">Notes</Label>
          <textarea
            id="notes"
            v-model="formData.notes"
            placeholder="Add any additional notes..."
            rows="3"
            class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </CardContent>
    </Card>

    <!-- Shipping Address -->
    <Card>
      <CardHeader>
        <CardTitle>Shipping Address *</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="grid gap-4 md:grid-cols-2">
          <div class="space-y-2">
            <Label for="fullName">Full Name *</Label>
            <Input
              id="fullName"
              v-model="formData.shippingAddress.fullName"
              placeholder="Enter full name"
            />
          </div>

          <div class="space-y-2">
            <Label for="phone">Phone *</Label>
            <Input
              id="phone"
              v-model="formData.shippingAddress.phone"
              placeholder="Enter phone number"
            />
          </div>

          <div class="space-y-2 md:col-span-2">
            <Label for="line1">Address Line 1 *</Label>
            <Input
              id="line1"
              v-model="formData.shippingAddress.line1"
              placeholder="Street address"
            />
          </div>

          <div class="space-y-2 md:col-span-2">
            <Label for="line2">Address Line 2</Label>
            <Input
              id="line2"
              v-model="formData.shippingAddress.line2"
              placeholder="Apartment, suite, etc. (optional)"
            />
          </div>

          <div class="space-y-2">
            <Label for="city">City *</Label>
            <Input
              id="city"
              v-model="formData.shippingAddress.city"
              placeholder="Enter city"
            />
          </div>

          <div class="space-y-2">
            <Label for="governorate">State/Governorate</Label>
            <Input
              id="governorate"
              v-model="formData.shippingAddress.governorate"
              placeholder="Enter state or governorate"
            />
          </div>

          <div class="space-y-2">
            <Label for="postalCode">Postal Code</Label>
            <Input
              id="postalCode"
              v-model="formData.shippingAddress.postalCode"
              placeholder="Enter postal code"
            />
          </div>

          <div class="space-y-2">
            <Label for="country">Country *</Label>
            <Input
              id="country"
              v-model="formData.shippingAddress.country"
              placeholder="Enter country"
            />
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Form Actions -->
    <div class="flex justify-end gap-3">
      <Button type="button" variant="outline" @click="handleCancel" :disabled="orderLoading">
        Cancel
      </Button>
      <Button
        type="button"
        @click="handleSubmit"
        :disabled="!isFormValid || orderLoading"
      >
        {{ orderLoading ? "Creating..." : "Create Order" }}
      </Button>
    </div>
  </div>
</template>
