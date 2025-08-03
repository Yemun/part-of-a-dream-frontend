import { Metadata } from "next";
import { getMessages, setRequestLocale } from "next-intl/server";

// Message types for type safety
interface MetaMessages {
  meta: {
    defaultTitle: string;
    defaultDescription: string;
    keywords: {
      userExperience: string;
      productDesign: string;
      seoul: string;
    };
    pages: {
      home: {
        keywords: string[];
      };
      profile: {
        title: string;
        description: string;
        keywords: string[];
        biography: string;
        alternateName: string;
      };
      post: {
        notFoundTitle: string;
        notFoundDescription: string;
      };
    };
  };
}

// Base metadata configuration with locale support
const baseConfig = {
  ko: {
    siteName: "꿈의 일환",
    author: "예문",
    defaultDescription: "사용자와 제품의 관계를 탐구하는 일지입니다.",
    keywords: {
      base: ["꿈의 일환", "블로그", "디자인시스템", "예문"],
      additional: ["사용자 경험", "제품 디자인", "서울", "프로필"],
    },
  },
  en: {
    siteName: "Part of a Dream",
    author: "Yemun",
    defaultDescription:
      "A journal exploring the relationship between users and products.",
    keywords: {
      base: ["Part of a Dream", "blog", "design system", "Yemun"],
      additional: ["user experience", "product design", "Seoul", "profile"],
    },
  },
  baseUrl: "https://yemun.kr",
  social: {
    twitter: "@seounplugged",
  },
};

interface MetadataOptions {
  title?: string;
  description?: string;
  keywords?: string[];
  url?: string;
  type?: "website" | "article" | "profile";
  publishedTime?: string;
  authors?: string[];
  tags?: string[];
  locale?: "ko" | "en";
}

export function createMetadata(options: MetadataOptions = {}): Metadata {
  const {
    title,
    description,
    keywords = [],
    url = baseConfig.baseUrl,
    type = "website",
    publishedTime,
    authors,
    tags = [],
    locale = "ko",
  } = options;

  const config = baseConfig[locale];
  const finalDescription = description || config.defaultDescription;
  const finalAuthors = authors || [config.author];

  // HTML 엔티티 처리를 위한 헬퍼 함수
  const escapeHtml = (str: string) =>
    str
      .replace(/'/g, "&apos;")
      .replace(/"/g, "&quot;")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  const safeTitle = title ? escapeHtml(title) : title;
  const fullTitle = safeTitle
    ? `${safeTitle} | ${config.siteName}`
    : config.siteName;
  const allKeywords = [...config.keywords.base, ...keywords];

  const ogLocale = locale === "ko" ? "ko_KR" : "en_US";

  const metadata: Metadata = {
    title: fullTitle,
    description: finalDescription,
    keywords: allKeywords,
    authors: finalAuthors.map((name) => ({ name })),
    creator: config.author,
    publisher: config.siteName,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(baseConfig.baseUrl),
    alternates: {
      canonical: url,
      languages: {
        ko: `${baseConfig.baseUrl}`,
        en: `${baseConfig.baseUrl}/en`,
      },
    },
    openGraph: {
      title: safeTitle || config.siteName,
      description: finalDescription,
      url,
      siteName: config.siteName,
      locale: ogLocale,
      type,
      ...(type === "article" &&
        publishedTime && {
          publishedTime,
          authors: finalAuthors,
          tags: [...config.keywords.base, ...tags],
        }),
    },
    twitter: {
      card: "summary_large_image",
      title: safeTitle || config.siteName,
      description: finalDescription,
      creator: baseConfig.social.twitter,
      site: baseConfig.social.twitter,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };

  return metadata;
}

// Helper function for extracting description from markdown content
export function extractDescription(
  content: string,
  maxLength: number = 160
): string {
  const cleanContent = content
    .replace(/[#*`]/g, "") // Remove markdown formatting
    .replace(/\n/g, " ") // Replace newlines with spaces
    .trim();

  return cleanContent.length > maxLength
    ? cleanContent.slice(0, maxLength).trim() + "..."
    : cleanContent;
}

// Schema.org structured data helpers
export function createArticleSchema(options: {
  title: string;
  description: string;
  author: string;
  publishedTime: string;
  slug: string;
  locale?: "ko" | "en";
}) {
  const {
    title,
    description,
    author,
    publishedTime,
    slug,
    locale = "ko",
  } = options;
  const config = baseConfig[locale];
  const localePrefix = locale === "ko" ? "" : `/${locale}`;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    author: {
      "@type": "Person",
      name: author,
      url: `${baseConfig.baseUrl}${localePrefix}/profile`,
    },
    publisher: {
      "@type": "Organization",
      name: config.siteName,
      url: baseConfig.baseUrl,
    },
    datePublished: publishedTime,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${baseConfig.baseUrl}${localePrefix}/posts/${slug}`,
    },
    url: `${baseConfig.baseUrl}${localePrefix}/posts/${slug}`,
    inLanguage: locale === "ko" ? "ko-KR" : "en-US",
  };
}

// Messages-based metadata creation helpers
export async function createMetadataWithMessages(options: {
  locale: 'ko' | 'en';
  page: 'home' | 'profile' | 'post';
  title?: string;
  description?: string;
  keywords?: string[];
  url?: string;
  type?: "website" | "article" | "profile";
  publishedTime?: string;
  authors?: string[];
  tags?: string[];
}) {
  const {
    locale,
    page,
    title,
    description,
    keywords = [],
    url = baseConfig.baseUrl,
    type = "website",
    publishedTime,
    authors,
    tags = [],
  } = options;

  // Enable static rendering
  setRequestLocale(locale);
  
  const messages = await getMessages() as MetaMessages;
  const pageMessages = messages.meta.pages[page];
  
  // Type-safe access to page-specific metadata
  let finalTitle = title;
  let finalDescription = description || messages.meta.defaultDescription;
  let pageKeywords: string[] = [];

  if (page === 'profile' && 'title' in pageMessages) {
    finalTitle = finalTitle || pageMessages.title;
    finalDescription = finalDescription || pageMessages.description;
    pageKeywords = pageMessages.keywords;
  } else if (page === 'home' && 'keywords' in pageMessages) {
    pageKeywords = pageMessages.keywords;
  }

  const allKeywords = [...keywords, ...pageKeywords];

  return createMetadata({
    title: finalTitle,
    description: finalDescription,
    keywords: allKeywords,
    url,
    type,
    publishedTime,
    authors,
    tags,
    locale,
  });
}

export function createPersonSchema(options: {
  name: string;
  alternateName?: string;
  description: string;
  locale?: "ko" | "en";
  contact?: {
    email?: string;
    linkedin?: string;
    github?: string;
    instagram?: string;
  };
}) {
  const { name, alternateName, description, contact, locale = "ko" } = options;
  const config = baseConfig[locale];
  const localePrefix = locale === "ko" ? "" : `/${locale}`;

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    ...(alternateName && { alternateName }),
    description,
    url: `${baseConfig.baseUrl}${localePrefix}/profile`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${baseConfig.baseUrl}${localePrefix}/profile`,
    },
    worksFor: {
      "@type": "Organization",
      name: config.siteName,
      url: baseConfig.baseUrl,
    },
    ...(contact && {
      contactPoint: {
        "@type": "ContactPoint",
        ...(contact.email && { email: contact.email }),
        contactType: "personal",
      },
      sameAs: [
        ...(contact.linkedin ? [contact.linkedin] : []),
        ...(contact.github ? [contact.github] : []),
        ...(contact.instagram ? [contact.instagram] : []),
      ].filter(Boolean),
    }),
  };
}

// Helper to create person schema with messages
export async function createPersonSchemaWithMessages(options: {
  locale: 'ko' | 'en';
  contact?: {
    email?: string;
    linkedin?: string;
    github?: string;
    instagram?: string;
  };
}) {
  const { locale, contact } = options;
  
  // Enable static rendering
  setRequestLocale(locale);
  
  const messages = await getMessages() as MetaMessages;
  const profileMessages = messages.meta.pages.profile;

  return createPersonSchema({
    name: profileMessages.title,
    alternateName: profileMessages.alternateName,
    description: profileMessages.biography,
    locale,
    contact,
  });
}
