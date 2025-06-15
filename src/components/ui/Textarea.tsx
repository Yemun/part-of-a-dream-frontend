import React from "react";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export default function Textarea({
  label,
  error,
  className = "",
  id,
  ...props
}: TextareaProps) {
  const baseClasses =
    "w-full px-3 py-2 border bg-white border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical dark:bg-slate-800 dark:border-slate-600 dark:text-white placeholder-slate-400 dark:placeholder-slate-600";
  const errorClasses = error
    ? "border-red-300 focus:ring-red-500 dark:border-red-500"
    : "";
  const classes = `${baseClasses} ${errorClasses} ${className}`;

  return (
    <div>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
        >
          {label}
        </label>
      )}
      <textarea id={id} className={classes} {...props} />
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
