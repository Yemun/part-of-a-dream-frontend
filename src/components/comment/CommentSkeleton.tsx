export default function CommentSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2].map((item) => (
        <div key={item} className="animate-pulse">
          <div className="flex items-start space-x-3">
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between space-x-2">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              </div>
              <div className="space-y-1">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
