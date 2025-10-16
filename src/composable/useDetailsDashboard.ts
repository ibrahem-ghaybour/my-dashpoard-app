import { ref } from "vue";
import { toast } from "vue-sonner";
import { useApi } from "~/plugins/api";
import type {
  DashboardResponse,
  DashboardData,
  PreviousStats,
  CurrentStats,
} from "~/types/detailsDashboard";
type propertyPercentage =
  | "totalRevenue"
  | "subscriptions"
  | "sales"
  | "activeNow";
export function useDetailsDashboard() {
  const stats = ref<DashboardData | null>(null);
  const loading = ref(false);
  const currentStats = ref<CurrentStats | null>(null);
  const previousStats = ref<PreviousStats | null>(null);
  const error = ref<string | null>(null);

  const dateStart = ref<string | null>(null);
  const dateEnd = ref<string | null>(null);

  const limit = ref(10);
  const api = useApi();
  const fetchDataDashboard = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await api<DashboardResponse>("/stats/dashboard", {
        method: "GET",
        params: {
          limit: limit.value,
          ...(dateStart.value ? { start: dateStart.value } : {}), 
          ...(dateEnd.value ? { end: dateEnd.value } : {}),
        },
      });
      stats.value = response.data;
      currentStats.value = response.currentStats;
      previousStats.value = response.previousStats;
      dateStart.value = response.range.start;
      dateEnd.value = response.range.end;
      if (!response.success) {
        error.value = "Failed to fetch dashboard data";
        throw new Error("Failed to fetch dashboard data");
      }
    } catch (err) {
      error.value = "Failed to fetch dashboard data";
      toast.error(error.value);
    } finally {
      loading.value = false;
    }
  };
  const percentageChange = (propertyName: propertyPercentage) => {
    const current = currentStats.value?.[propertyName] || 0;
    const previous = previousStats.value?.[propertyName] || 0;
    return previous === 0 ? 0 : ((current - previous) / previous) * 100;
  };
  return {
    percentageChange,
    stats,
    loading,
    dateStart,
    dateEnd,
    error,
    currentStats,
    previousStats,
    fetchDataDashboard,
  };
}
