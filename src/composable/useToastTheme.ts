import { toast } from "vue-sonner";

const variants = {
  default: "bg-primary text-primary-foreground !border-none",
  success: "!bg-chart-2 !text-white !border-none",
  error: "!bg-destructive !text-white !border-none",
  warning: "!bg-yellow-500 !text-black !border-none",
  info: "!bg-chart-1 !text-white !border-none",
};

type VariantKey = keyof typeof variants;

function themedToast(
  variant: VariantKey,
  message: string,
  opts?: {
    description?: string;
    action?: { label: string; onClick: () => void };
  }
) {
  const toastOptions = {
    description: opts?.description,
    action: opts?.action,
    class: variants[variant],
  };

  if (variant === "default") {
    toast(message, toastOptions);
  } else {
    toast[variant](message, toastOptions);
  }
}

export const useToastTheme = {
  default: (msg: string, opts?: Parameters<typeof themedToast>[2]) =>
    themedToast("default", msg, opts),
  success: (msg: string, opts?: Parameters<typeof themedToast>[2]) =>
    themedToast("success", msg, opts),
  error: (msg: string, opts?: Parameters<typeof themedToast>[2]) =>
    themedToast("error", msg, opts),
  warning: (msg: string, opts?: Parameters<typeof themedToast>[2]) =>
    themedToast("warning", msg, opts),
  info: (msg: string, opts?: Parameters<typeof themedToast>[2]) =>
    themedToast("info", msg, opts),
};
