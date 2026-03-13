import type { PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

export function Badge({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <span className={cn("badge", className)}>{children}</span>;
}
