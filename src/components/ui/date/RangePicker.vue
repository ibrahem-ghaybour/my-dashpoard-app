<script setup lang="ts">
import { ref, watch } from "vue";
import {
  CalendarDate,
  DateFormatter,
  getLocalTimeZone,
} from "@internationalized/date";
import { Calendar as CalendarIcon } from "lucide-vue-next";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RangeCalendar } from "@/components/ui/range-calendar";

const df = new DateFormatter("en-US", { dateStyle: "medium" });

const props = defineProps<{
  start?: string;
  end?: string;
}>();

function extractDateParts(time: Date): [number, number, number] {
  const year = time.getFullYear();
  const month = time.getMonth() + 1; 
  const day = time.getDate();
  return [year, month, day];
}

const emit = defineEmits(['update:start', 'update:end'])

const value = ref<any>({
  start: props.start ? new CalendarDate(...extractDateParts(new Date(props.start))) : undefined,
  end: props.end ? new CalendarDate(...extractDateParts(new Date(props.end))) : undefined,
});

// Watch for changes and emit updates
watch(() => value.value, (newValue) => {
  if (newValue.start) {
    const startDate = newValue.start.toDate(getLocalTimeZone());
    emit('update:start', startDate.toISOString());
  }
  if (newValue.end) {
    const endDate = newValue.end.toDate(getLocalTimeZone());
    emit('update:end', endDate.toISOString());
  }
}, { deep: true });
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button
        variant="outline"
        :class="
          cn(
            'w-[280px] justify-start text-left font-normal',
            !value && 'text-muted-foreground'
          )
        "
      >
        <CalendarIcon class="mr-2 h-4 w-4" />
        <template v-if="value?.start">
          <template v-if="value?.end">
            {{ df.format(value.start.toDate(getLocalTimeZone())) }} -
            {{ df.format(value.end.toDate(getLocalTimeZone())) }}
          </template>
          <template v-else>
            {{ df.format(value.start.toDate(getLocalTimeZone())) }}
          </template>
        </template>
        <template v-else> Pick a date </template>
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-auto p-0">
      <RangeCalendar
        v-model="value"
        initial-focus
        :number-of-months="2"
      />
    </PopoverContent>
  </Popover>
</template>