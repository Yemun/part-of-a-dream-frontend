import { getProfile } from "@/lib/strapi";
import PageLayout from "@/components/PageLayout";
import MarkdownRenderer from "@/components/MarkdownRenderer";

export const revalidate = 604800; // 1주일(7일)마다 재생성

export default async function Profile() {
  const profile = await getProfile();

  return (
    <PageLayout>
      {profile ? (
        <section>
          <div className="mb-6 sm:mb-8">
            <h1 className="font-bold text-slate-950 dark:text-white text-2xl sm:text-3xl leading-7 sm:leading-9">
              {profile.title}
            </h1>
          </div>

          {profile.biography && (
            <div className="mb-8 sm:mb-10">
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-2 sm:mb-3">
                소개
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-normal text-base sm:text-lg">
                {profile.biography}
              </p>
            </div>
          )}

          {profile.career && (
            <div className="mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-2 sm:mb-3">
                경력
              </h2>
              <div className="text-slate-700 dark:text-slate-300">
                <MarkdownRenderer content={profile.career} />
              </div>
            </div>
          )}

          {profile.contact && (
            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-slate-200 dark:border-slate-700">
              <h2 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2 sm:mb-3">
                연락처
              </h2>
              <div className="text-slate-700 dark:text-slate-300">
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
      ) : (
        <div className="text-center py-6 sm:py-8">
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
            프로필 정보를 불러올 수 없습니다.
          </p>
        </div>
      )}
    </PageLayout>
  );
}
