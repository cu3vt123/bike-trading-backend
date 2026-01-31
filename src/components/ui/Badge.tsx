import { cn } from "@/lib/cn";

type Props = {
  children: React.ReactNode;
  tone?: "green" | "gray" | "amber" | "red";
  className?: string;
};

const tones: Record<NonNullable<Props["tone"]>, string> = {
  green: "bg-brand/10 text-brand-dark",
  gray: "bg-slate-100 text-slate-700",
  amber: "bg-amber-100 text-amber-800",
  red: "bg-red-100 text-red-700",
};

export default function Badge({ children, tone = "gray", className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
