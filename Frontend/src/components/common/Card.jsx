// Card.jsx
import { cn } from "@utils/helpers";

export const Card = ({ children, className, hover = false, ...props }) => {
  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm transition-all",
        hover &&
          "hover:shadow-md hover:border-primary-200 dark:hover:border-primary-800",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
