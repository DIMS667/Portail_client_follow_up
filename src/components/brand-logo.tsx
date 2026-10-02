import { cn } from "@/lib/utils";

export function BrandLogo({ className }: { className?: string }) {
  return (
    <img
      src="/follow-up-insurance-logo.png"
      alt="FOLLOW-UP INSURANCE"
      width={798}
      height={224}
      decoding="async"
      className={cn("block h-auto max-w-full object-contain", className)}
    />
  );
}
