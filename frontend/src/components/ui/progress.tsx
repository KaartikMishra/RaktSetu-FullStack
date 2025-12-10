import * as React from "react";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
}

export function Progress({ value, className = "", ...props }: ProgressProps) {
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      className={`relative h-2 w-full overflow-hidden rounded-full ${className}`}
      {...props}
    >
      <div
        className="h-full w-full flex-1 bg-red-600 transition-all"
        style={{ transform: `translateX(-${100 - value}%)` }}
      />
    </div>
  );
}