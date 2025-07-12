import { getProfile } from "@/lib/content";
import { createMetadata, createPersonSchema } from "@/lib/metadata";
import { Metadata } from "next";
import MDXRenderer from "@/components/post/MDXRenderer";

// Generate metadata for profile page
export async function generateMetadata(): Promise<Metadata> {
  try {
    const profile = await getProfile();

    if (!profile) {
      return createMetadata({
        title: "프로필",
        keywords: ["프로필"],
      });
    }

    const description =
      profile.biography || "사용자와 제품의 관계를 탐구하는 일지입니다.";

    return createMetadata({
      title: profile.title,
      description,
      keywords: ["서을", "프로필"],
      url: "https://yemun.kr/profile",
      type: "profile",
    });
  } catch (error) {
    console.error("Error generating profile metadata:", error);
    return createMetadata({
      title: "프로필",
      keywords: ["프로필"],
    });
  }
}

export default async function Profile() {
  const profile = await getProfile();

  // Person schema for profile page
  const personSchema = profile
    ? createPersonSchema({
        name: "예문",
        alternateName: "서을",
        description:
          profile.biography ||
          "사용자와 제품의 관계를 탐구하는 일지를 작성합니다.",
        contact:
          typeof profile.contact === "object" && profile.contact !== null
            ? profile.contact
            : undefined,
      })
    : null;

  return (
    <>
      {personSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
      )}
      {profile ? (
        <section>
          <div className="mb-6 sm:mb-8">
            <h1 className="font-bold text-gray-950 dark:text-white text-2xl sm:text-3xl leading-7 sm:leading-9">
              {profile.title}
            </h1>
          </div>

          {profile.biography && (
            <div className="mb-8 sm:mb-10">
              <h2 className="text-2xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
                소개
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-normal text-base sm:text-lg">
                {profile.biography}
              </p>
            </div>
          )}

          <div className="mb-4 sm:mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
              경력
            </h2>
            <div className="text-gray-700 dark:text-gray-300">
              <MDXRenderer code={profile.body.code} />
            </div>
          </div>

          {profile.contact && (
            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
                연락처
              </h2>
              <div className="sm:text-lg text-gray-700 dark:text-gray-300">
                {typeof profile.contact === "object" &&
                profile.contact !== null ? (
                  <div className="space-y-1">
                    {profile.contact.email && (
                      <p>
                        이메일 -{" "}
                        <a
                          href={`mailto:${profile.contact.email}`}
                          className="dark:text-blue-400 underline"
                        >
                          {profile.contact.email}
                        </a>
                      </p>
                    )}
                    {profile.contact.instagram && (
                      <p>
                        Instagram -{" "}
                        <a
                          href={profile.contact.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline"
                        >
                          {profile.contact.instagram}
                        </a>
                      </p>
                    )}
                    {profile.contact.linkedin && (
                      <p>
                        LinkedIn -{" "}
                        <a
                          href={profile.contact.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="dark:text-blue-400 underline"
                        >
                          {profile.contact.linkedin}
                        </a>
                      </p>
                    )}
                    {profile.contact.github && (
                      <p>
                        GitHub -{" "}
                        <a
                          href={profile.contact.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="dark:text-blue-400 underline"
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
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            프로필 정보를 불러올 수 없습니다.
          </p>
        </div>
      )}
    </>
  );
}
