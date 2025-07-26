import { Metadata } from "next";

// Base metadata configuration
const baseConfig = {
  siteName: "꿈의 일환",
  author: "예문",
  baseUrl: "https://yemun.kr",
  defaultDescription: "사용자와 제품의 관계를 탐구하는 일지입니다.",
  keywords: {
    base: ["꿈의 일환", "블로그", "디자인시스템", "예문"],
    additional: ["사용자 경험", "제품 디자인", "서울", "프로필"],
  },
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
}

export function createMetadata(options: MetadataOptions = {}): Metadata {
  const {
    title,
    description = baseConfig.defaultDescription,
    keywords = [],
    url = baseConfig.baseUrl,
    type = "website",
    publishedTime,
    authors = [baseConfig.author],
    tags = [],
  } = options;

  const fullTitle = title
    ? `${title} | ${baseConfig.siteName}`
    : baseConfig.siteName;
  const allKeywords = [...baseConfig.keywords.base, ...keywords];

  const metadata: Metadata = {
    title: fullTitle,
    description,
    keywords: allKeywords,
    authors: authors.map((name) => ({ name })),
    creator: baseConfig.author,
    publisher: baseConfig.siteName,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(baseConfig.baseUrl),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: title || baseConfig.siteName,
      description,
      url,
      siteName: baseConfig.siteName,
      locale: "ko_KR",
      type,
      ...(type === "article" &&
        publishedTime && {
          publishedTime,
          authors,
          tags: [...baseConfig.keywords.base, ...tags],
        }),
    },
    twitter: {
      card: "summary_large_image",
      title: title || baseConfig.siteName,
      description,
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
}) {
  const { title, description, author, publishedTime, slug } = options;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    author: {
      "@type": "Person",
      name: author,
      url: `${baseConfig.baseUrl}/profile`,
    },
    publisher: {
      "@type": "Organization",
      name: baseConfig.siteName,
      url: baseConfig.baseUrl,
    },
    datePublished: publishedTime,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${baseConfig.baseUrl}/posts/${slug}`,
    },
    url: `${baseConfig.baseUrl}/posts/${slug}`,
    inLanguage: "ko-KR",
  };
}

export function createPersonSchema(options: {
  name: string;
  alternateName?: string;
  description: string;
  contact?: {
    email?: string;
    linkedin?: string;
    github?: string;
    instagram?: string;
  };
}) {
  const { name, alternateName, description, contact } = options;

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    ...(alternateName && { alternateName }),
    description,
    url: `${baseConfig.baseUrl}/profile`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${baseConfig.baseUrl}/profile`,
    },
    worksFor: {
      "@type": "Organization",
      name: baseConfig.siteName,
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
