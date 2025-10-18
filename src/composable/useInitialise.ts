import { ref } from "vue";
import type { Pagination } from "~/types/user";
export const useInitialise = () => {
    const pagination = ref<Pagination>({
        page: 1,
        limit: 10,
        total: 2,
        pages: 1,
        hasNext: false,
        hasPrev: false
    })
    const loading = ref(false)
    const error = ref<string | null>(null)
    const search = ref<string>('')
    const filterOptions = ref({
        status: "all",
        startDate: "",
        endDate: "",
        minAmount: null,
        maxAmount: null,
        sortBy: "",
        sortOrder: "",
    })
    return {
        pagination,
        loading,
        search,
        filterOptions
    }
}

