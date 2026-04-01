import { cn } from "@/lib/utils";

const SIZE_PX = { sm: 40, md: 52, lg: 68 } as const;

type Size = keyof typeof SIZE_PX;

export type BicycleLoaderProps = {
  /** Kích thước icon — mặc định dùng màu primary (xanh teal) khớp theme sáng/tối */
  size?: Size;
  className?: string;
  /** Ẩn hiệu ứng trượt nhẹ (chỉ bánh quay) */
  noGlide?: boolean;
};

/**
 * Xe đạp SVG — bánh quay + thân trượt nhẹ. Dùng `text-primary` (xanh trắng / xanh đen theo theme).
 */
export function BicycleLoader({ size = "md", className, noGlide }: BicycleLoaderProps) {
  const w = SIZE_PX[size];
  const h = Math.round(w * 0.58);

  return (
    <div
      role="status"
      aria-busy="true"
      className={cn(
        "inline-flex shrink-0 text-primary motion-reduce:animate-none",
        !noGlide && "animate-bicycle-glide",
        className,
      )}
      style={{ width: w, height: h }}
    >
      <svg
        viewBox="0 0 96 58"
        className="h-full w-full overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        {/* Khung xe (tĩnh) */}
        <path
          d="M22 30v12M22 30l22-14 24 6 6 20M44 16l-6 26M38 42H22M38 42h36"
          stroke="currentColor"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Bánh sau */}
        <g transform="translate(22 42)">
          <g>
            <animateTransform
              attributeName="transform"
              attributeType="XML"
              type="rotate"
              from="0 0 0"
              to="360 0 0"
              dur="0.62s"
              repeatCount="indefinite"
            />
            <circle r="12" fill="none" stroke="currentColor" strokeWidth="2.5" />
            <path d="M-9 0h18M0-9v18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </g>
        </g>
        {/* Bánh trước */}
        <g transform="translate(74 42)">
          <g>
            <animateTransform
              attributeName="transform"
              attributeType="XML"
              type="rotate"
              from="0 0 0"
              to="360 0 0"
              dur="0.62s"
              repeatCount="indefinite"
            />
            <circle r="12" fill="none" stroke="currentColor" strokeWidth="2.5" />
            <path d="M-9 0h18M0-9v18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </g>
        </g>
      </svg>
    </div>
  );
}

export function BicycleLoadingBlock({
  message,
  size = "md",
  className,
}: {
  message?: string;
  size?: Size;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <BicycleLoader size={size} />
      {message ? <p className="text-center text-sm text-muted-foreground">{message}</p> : null}
    </div>
  );
}
