export const formattedDate = (dateStr: string|Date): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

export const formattedDateTime = (dateStr: string|Date): string => {
  const date = new Date(dateStr);
  return date.toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export const formattedCurrency = (amount: number): string => {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: useRuntimeConfig().public.currency,
  });
  return formatter.format(amount);
};
