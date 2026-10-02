import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const alertVariants = cva("relative grid grid-cols-[auto_1fr] items-start gap-x-3 rounded-xl border p-4 text-sm", {
  variants: {
    variant: {
      default: "border-border bg-card text-card-foreground",
      info: "border-blue-200 bg-blue-50 text-blue-950",
      success: "border-emerald-200 bg-emerald-50 text-emerald-950",
      warning: "border-amber-200 bg-amber-50 text-amber-950",
      destructive: "border-rose-200 bg-rose-50 text-rose-950",
      dark: "border-white/10 bg-[#0b1f38] text-white",
    },
  },
  defaultVariants: { variant: "default" },
});

function Alert({ className, variant, ...props }: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return <div data-slot="alert" role="status" className={cn(alertVariants({ variant }), className)} {...props} />;
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-title" className={cn("col-start-2 font-semibold leading-5", className)} {...props} />;
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-description" className={cn("col-start-2 mt-1 text-sm leading-6 opacity-80", className)} {...props} />;
}

export { Alert, AlertTitle, AlertDescription };
