import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement | HTMLSpanElement> {
  as?: "div" | "span"
}

function Skeleton({ className, as: Component = "div", ...props }: SkeletonProps) {
  return (
    <Component
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      {...props}
    />
  )
}

export { Skeleton }

