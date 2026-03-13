import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "primary" | "ghost" | "neutral";
};

export function Button({ children, className, tone = "neutral", ...props }: PropsWithChildren<Props>) {
  return (
    <button className={cn("button", `button-${tone}`, className)} {...props}>
      {children}
    </button>
  );
}
