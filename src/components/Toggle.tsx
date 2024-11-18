import React from "react";
import { motion } from "framer-motion";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: {
    width: "w-8",
    height: "h-4",
    circle: "w-3 h-3",
    translate: "translate-x-4",
  },
  md: {
    width: "w-11",
    height: "h-6",
    circle: "w-4 h-4",
    translate: "translate-x-6",
  },
  lg: {
    width: "w-14",
    height: "h-7",
    circle: "w-5 h-5",
    translate: "translate-x-8",
  },
};

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  disabled = false,
  size = "md",
}) => {
  const sizeStyles = sizes[size];

  return (
    <motion.button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      className={`
        relative inline-flex shrink-0 
        ${sizeStyles.height} ${sizeStyles.width}
        rounded-full border-2 border-transparent
        cursor-pointer transition-colors ease-in-out duration-200
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        disabled:cursor-not-allowed
        ${
          checked
            ? "bg-blue-600 dark:bg-blue-500"
            : "bg-gray-200 dark:bg-gray-600"
        }
        ${disabled ? "opacity-50" : ""}
      `}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
    >
      <span className="sr-only">Toggle setting</span>
      <motion.span
        layout
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
        className={`
          ${sizeStyles.circle}
          inline-block rounded-full 
          bg-white shadow transform ring-0 
          transition-transform ease-in-out duration-200
          ${checked ? sizeStyles.translate : "translate-x-0"}
        `}
      />
    </motion.button>
  );
};
