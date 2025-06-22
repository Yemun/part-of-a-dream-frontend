import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const baseClasses =
    "rounded-md font-medium focus:outline-2 focus:outline-offset-2 focus:outline-black dark:focus:outline-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors";

  const variantClasses = {
    primary:
      "bg-black text-white hover:bg-blue-700 dark:bg-white dark:text-black dark:hover:bg-blue-200",
    secondary:
      "bg-gray-300 text-gray-700 hover:bg-gray-400 focus:outline-gray-500 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500",
    danger:
      "bg-red-600 text-white hover:bg-red-700 focus:outline-red-500 dark:bg-red-500 dark:hover:bg-red-600",
  };

  const sizeClasses = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-2 text-base",
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
