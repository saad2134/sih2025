export default function StreakIcon({ 
  streak = 0, 
  size = "md",
  showLabel = true,
  className = "" 
}: { 
  streak?: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}) {
  const sizes = {
    sm: { icon: 16, text: "text-xs" },
    md: { icon: 20, text: "text-sm" },
    lg: { icon: 28, text: "text-base" }
  };
  
  const isActive = streak > 0;
  const isHighStreak = streak >= 7;
  
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div className="relative">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill={isActive ? (isHighStreak ? "#f97316" : "#fb923c") : "#9ca3af"}
          className={`transition-all duration-300 ${isActive ? "animate-pulse" : "opacity-50"}`}
          width={sizes[size].icon}
          height={sizes[size].icon}
        >
          <path d="M12 23c-3.866 0-7-3.134-7-7 0-2.468 1.126-4.65 3-6.09V8.5a1.5 1.5 0 0 1 2.545-1.07l.91.91V5a5 5 0 0 1 10 0v2.5h.091a1.5 1.5 0 0 1 .909 2.57c-.23.285-.506.542-.819.762C19.874 13.35 21 15.532 21 18c0 3.866-3.134 7-9 7Z"/>
        </svg>
        {isActive && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className={`absolute inline-flex h-full w-full rounded-full ${isHighStreak ? "bg-orange-400" : "bg-yellow-400"} opacity-75 animate-ping`}></span>
            <span className={`relative inline-flex rounded-full h-3 w-3 ${isHighStreak ? "bg-orange-500" : "bg-yellow-500"}`}></span>
          </span>
        )}
      </div>
      {showLabel && (
        <div className="flex flex-col">
          <span className={`${sizes[size].text} font-bold ${isActive ? "text-orange-500 dark:text-orange-400" : "text-gray-400"}`}>
            {streak} day{streak !== 1 ? "s" : ""}
          </span>
        </div>
      )}
    </div>
  );
}
