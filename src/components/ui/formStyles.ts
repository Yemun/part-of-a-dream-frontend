export const getFormFieldClasses = (error?: string, className = "") => {
  const baseClasses =
    "w-full px-3 py-2 border bg-white border-[0.5px] rounded-md focus:outline focus:outline-2 focus:outline-black focus:border-transparent dark:bg-gray-950 dark:border-white dark:text-white placeholder-gray-500 dark:focus:outline-white dark:placeholder-gray-400";

  const errorClasses = error
    ? "border-red-300 focus:outline-red-500 dark:border-red-500"
    : "";

  return `${baseClasses} ${errorClasses} ${className}`;
};
