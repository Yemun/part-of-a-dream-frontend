import axios from "axios";

const strapi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337",
});

export interface BlogPost {
  id: number;
  documentId: string;
  slug: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface Profile {
  id: number;
  documentId: string;
  title: string;
  biography: string;
  career: string;
  contact:
    | {
        email?: string;
        phone?: string;
        linkedin?: string;
        github?: string;
        [key: string]: string | undefined;
      }
    | string
    | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface StrapiResponse<T> {
  data: T;
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export const getBlogPosts = async (): Promise<BlogPost[]> => {
  try {
    const response = await strapi.get<StrapiResponse<BlogPost[]>>(
      "/api/blogs?populate=*"
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return [];
  }
};

export const getBlogPost = async (slug: string): Promise<BlogPost | null> => {
  try {
    const response = await strapi.get<StrapiResponse<BlogPost[]>>(
      `/api/blogs?filters[slug]=${slug}&populate=*`
    );
    return response.data.data[0] || null;
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return null;
  }
};

export const getAdjacentPosts = async (
  currentSlug: string
): Promise<{ previous: BlogPost | null; next: BlogPost | null }> => {
  try {
    const posts = await getBlogPosts();
    const sortedPosts = posts.sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
    
    const currentIndex = sortedPosts.findIndex(post => post.slug === currentSlug);
    
    return {
      previous: currentIndex > 0 ? sortedPosts[currentIndex - 1] : null,
      next: currentIndex < sortedPosts.length - 1 ? sortedPosts[currentIndex + 1] : null,
    };
  } catch (error) {
    console.error("Error fetching adjacent posts:", error);
    return { previous: null, next: null };
  }
};

export const getProfile = async (): Promise<Profile | null> => {
  try {
    const response = await strapi.get<{ data: Profile }>(
      "/api/profile?populate=*"
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
};

export default strapi;
