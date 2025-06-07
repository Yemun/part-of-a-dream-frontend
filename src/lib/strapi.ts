import axios from 'axios';

const strapi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337',
});

export interface BlogPost {
  id: number;
  documentId: string;
  Slug: string;
  Title: string;
  Content: string;
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
    const response = await strapi.get<StrapiResponse<BlogPost[]>>('/api/blogs?populate=*');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
};

export const getBlogPost = async (slug: string): Promise<BlogPost | null> => {
  try {
    const response = await strapi.get<StrapiResponse<BlogPost[]>>(`/api/blogs?filters[Slug]=${slug}&populate=*`);
    return response.data.data[0] || null;
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
};

export default strapi;