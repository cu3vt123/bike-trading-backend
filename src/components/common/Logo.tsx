import { useState } from "react";

const LOGO_SRC = "/logo.png";
const LOGO_ALT = "ShopBike";

type LogoVariant = "header" | "headerStacked" | "hero" | "heroBar" | "auth";

const variantClasses: Record<LogoVariant, string> = {
  header:
    "h-9 w-auto max-w-[140px] object-contain object-left drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] sm:h-10 sm:max-w-[160px]",
  /** Header stacked: chỉ ảnh logo to gấp ~3 lần (không chữ ShopBike), chữ xác minh ở dưới */
  headerStacked:
    "h-16 w-auto max-w-[180px] object-contain object-center dark:mix-blend-screen sm:h-20 sm:max-w-[220px] md:h-24 md:max-w-[280px]",
  hero: "h-24 w-auto max-w-[380px] object-contain drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)] sm:h-32 sm:max-w-[500px] md:h-40 md:max-w-[600px]",
  heroBar: "h-8 w-auto max-w-[120px] object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.4)] md:h-9 md:max-w-[140px]",
  auth: "h-9 w-auto max-w-[140px] object-contain dark:mix-blend-screen sm:h-10 sm:max-w-[160px]",
};

const fallbackClasses: Record<LogoVariant, string> = {
  header: "flex h-10 w-10 min-w-[2.5rem] items-center justify-center rounded-2xl bg-primary text-primary-foreground text-lg font-bold",
  headerStacked: "flex h-16 w-16 min-w-[4rem] items-center justify-center rounded-2xl bg-primary text-primary-foreground text-3xl font-bold sm:h-20 sm:w-20 md:h-24 md:w-24 md:text-4xl",
  hero: "flex h-28 w-28 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-4xl font-bold sm:h-32 sm:w-32 sm:text-5xl md:h-40 md:w-40 md:text-6xl",
  heroBar: "flex h-8 w-8 min-w-[2rem] items-center justify-center rounded-xl bg-primary text-primary-foreground text-sm font-bold md:h-9 md:min-w-[2.25rem]",
  auth: "flex h-9 w-9 min-w-[2.25rem] items-center justify-center rounded-xl bg-primary text-primary-foreground text-sm font-bold sm:h-10 sm:w-10",
};

export interface LogoProps {
  variant?: LogoVariant;
  className?: string;
  /** Hiển thị dòng phụ "Đã xác minh & kiểm định" bên cạnh (header/auth) */
  showLabel?: boolean;
  /** Luôn dùng chữ trắng cho label (dùng trên nền tối, ví dụ header login) */
  alwaysWhite?: boolean;
}

export function Logo({ variant = "header", className = "", showLabel = false, alwaysWhite = false }: LogoProps) {
  const [failed, setFailed] = useState(false);

  const imgClass = variantClasses[variant];
  const fallbackClass = fallbackClasses[variant];

  const isStacked = variant === "headerStacked";
  const imgCls = isStacked ? variantClasses.headerStacked : imgClass;

  if (failed) {
    return (
      <span
        className={`flex shrink-0 ${isStacked ? "flex-col items-center gap-0.5" : "items-center gap-2.5"} ${className}`}
      >
        <span className={`${fallbackClass}`} aria-hidden>
          S
        </span>
        {showLabel && !isStacked && (
          <span className="hidden flex-col leading-tight sm:flex">
            <span className={`text-sm font-bold ${alwaysWhite ? "text-white" : "text-foreground"}`}>ShopBike</span>
            <span className={`text-xs ${alwaysWhite ? "text-white/80" : "text-muted-foreground"}`}>Đã xác minh &amp; kiểm định</span>
          </span>
        )}
        {showLabel && isStacked && (
          <span className={`text-[10px] sm:text-xs ${alwaysWhite ? "text-white/80" : "text-muted-foreground"}`}>Đã xác minh &amp; kiểm định</span>
        )}
      </span>
    );
  }

  return (
    <span
      className={`flex shrink-0 ${isStacked ? "flex-col items-center gap-0.5" : "items-center gap-2.5"} ${className}`}
    >
      <img
        src={LOGO_SRC}
        alt={LOGO_ALT}
        className={imgCls}
        onError={() => setFailed(true)}
      />
      {showLabel && isStacked && (
        <span className={`text-[10px] sm:text-xs ${alwaysWhite ? "text-white/80" : "text-muted-foreground"}`}>Đã xác minh &amp; kiểm định</span>
      )}
      {showLabel && !isStacked && (
        <span className="hidden flex-col leading-tight min-w-0 sm:flex">
          <span className={`text-sm font-bold truncate ${alwaysWhite ? "text-white" : "text-foreground"}`}>ShopBike</span>
          <span className={`text-xs ${alwaysWhite ? "text-white/80" : "text-muted-foreground"}`}>Đã xác minh &amp; kiểm định</span>
        </span>
      )}
    </span>
  );
}
