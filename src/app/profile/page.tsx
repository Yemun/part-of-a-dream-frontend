import { getProfile } from "@/lib/strapi";
import ReactMarkdown from "react-markdown";
import Navigation from "@/components/Navigation";

/* eslint-disable @typescript-eslint/no-explicit-any */
const markdownComponents: any = {
  h1: ({ children }: any) => (
    <h1 className="text-xl sm:text-3xl font-bold text-gray-900 mt-6 sm:mt-8 mb-3 sm:mb-4">
      {children}
    </h1>
  ),
  h2: ({ children }: any) => (
    <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mt-4 sm:mt-6 mb-2 sm:mb-3">
      {children}
    </h2>
  ),
  h3: ({ children }: any) => (
    <h3 className="text-base sm:text-xl font-bold text-gray-900 mt-3 sm:mt-4 mb-2">
      {children}
    </h3>
  ),
  h4: ({ children }: any) => (
    <h4 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white mt-2 sm:mt-3 mb-1 sm:mb-2">
      {children}
    </h4>
  ),
  p: ({ children }: any) => (
    <p className="mb-3 sm:mb-4 leading-relaxed text-sm sm:text-base">
      {children}
    </p>
  ),
  ul: ({ children }: any) => (
    <ul className="list-disc list-outside mb-3 sm:mb-4 space-y-1 text-sm sm:text-base pl-5">
      {children}
    </ul>
  ),
  ol: ({ children }: any) => (
    <ol className="list-decimal list-outside mb-3 sm:mb-4 space-y-1 text-sm sm:text-base pl-5">
      {children}
    </ol>
  ),
  li: ({ children }: any) => <li>{children}</li>,
  code: ({ children }: any) => (
    <code className="bg-gray-100 px-1 sm:px-2 py-1 rounded text-xs sm:text-sm font-mono">
      {children}
    </code>
  ),
  pre: ({ children }: any) => (
    <pre className="bg-gray-100 p-2 sm:p-4 rounded-lg overflow-x-auto mb-3 sm:mb-4 text-xs sm:text-sm">
      {children}
    </pre>
  ),
};
/* eslint-enable @typescript-eslint/no-explicit-any */

export const revalidate = 604800; // 1주일(7일)마다 재생성

export default async function Profile() {
  const profile = await getProfile();

  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen">
      <div className="flex flex-col items-center min-h-screen">
        <div className="flex flex-col gap-12 sm:gap-20 items-center justify-start px-4 sm:px-8 lg:px-16 py-8 sm:py-12 lg:py-20 w-full">
          <Navigation />

        {profile ? (
          <div className="max-w-4xl w-full">
            <section>
              <div className="mb-6 sm:mb-8">
                <h1 className="font-bold text-slate-950 dark:text-white text-2xl sm:text-3xl leading-7 sm:leading-9">
                  {profile.title}
                </h1>
              </div>

              {profile.biography && (
                <div className="mb-4 sm:mb-6">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 sm:mb-3">
                    소개
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-normal text-sm sm:text-base">
                    {profile.biography}
                  </p>
                </div>
              )}

              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
                {profile.career && (
                  <div>
                    <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 sm:mb-3">
                      경력
                    </h2>
                    <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300">
                      <ReactMarkdown components={markdownComponents}>
                        {profile.career}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}

                {profile.education && (
                  <div>
                    <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 sm:mb-3">
                      학력
                    </h2>
                    <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300">
                      <ReactMarkdown components={markdownComponents}>
                        {profile.education}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>

              {profile.contact && (
                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 sm:mb-3">
                    연락처
                  </h2>
                  <div className="text-gray-700 dark:text-gray-300">
                    {typeof profile.contact === "object" &&
                    profile.contact !== null ? (
                      <div className="space-y-1">
                        {profile.contact.email && (
                          <p>
                            이메일:{" "}
                            <a
                              href={`mailto:${profile.contact.email}`}
                              className="text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              {profile.contact.email}
                            </a>
                          </p>
                        )}
                        {profile.contact.phone && (
                          <p>전화: {profile.contact.phone}</p>
                        )}
                        {profile.contact.linkedin && (
                          <p>
                            LinkedIn:{" "}
                            <a
                              href={profile.contact.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              {profile.contact.linkedin}
                            </a>
                          </p>
                        )}
                        {profile.contact.github && (
                          <p>
                            GitHub:{" "}
                            <a
                              href={profile.contact.github}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              {profile.contact.github}
                            </a>
                          </p>
                        )}
                      </div>
                    ) : profile.contact ? (
                      <p>{profile.contact}</p>
                    ) : null}
                  </div>
                </div>
              )}
            </section>
          </div>
        ) : (
          <div className="max-w-4xl w-full text-center py-6 sm:py-8">
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
              프로필 정보를 불러올 수 없습니다.
            </p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
