export const getFormFieldClasses = (error?: string, className = "") => {
  const baseClasses =
    "w-full px-3 py-2 border bg-white border-gray-300 rounded-sm focus:outline focus:outline-2 focus:outline-black focus:border-blue-500 focus:border-transparent dark:bg-gray-950 dark:border-gray-600 dark:text-white placeholder-gray-500 dark:focus:outline-white";

  const errorClasses = error
    ? "border-red-300 focus:outline-red-500 dark:border-red-500"
    : "";

  return `${baseClasses} ${errorClasses} ${className}`;
};
