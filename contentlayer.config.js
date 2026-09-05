import { defineDocumentType, makeSource } from "contentlayer2/source-files";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeUnwrapImages from "rehype-unwrap-images";
import remarkObsidian from "./src/lib/mdx/remark-obsidian.mjs";

export const BlogPost = defineDocumentType(() => ({
  name: "BlogPost",
  filePathPattern: `posts/**/*.mdx`,
  contentType: "mdx",
  fields: {
    title: {
      type: "string",
      description: "The title of the post",
      required: true,
    },
    publishedAt: {
      type: "date",
      description: "The date of the post",
      required: true,
    },
    description: {
      type: "string",
      description: "The description of the post",
      required: false,
    },
    tags: {
      type: "list",
      of: { type: "string" },
      description: "Tags for the post",
      required: false,
    },
  },
  computedFields: {
    slug: {
      type: "string",
      resolve: (doc) => {
        const path = doc._raw.flattenedPath.replace("posts/", "");
        // 언어 접미사 제거하여 동일한 slug 생성 (댓글 통합용)
        return path.replace(/-(?:ko|en)$/, "");
      },
    },
    originalSlug: {
      type: "string",
      resolve: (doc) => doc._raw.flattenedPath.replace("posts/", ""),
    },
    locale: {
      type: "string",
      resolve: (doc) => {
        const path = doc._raw.flattenedPath.replace("posts/", "");
        // 파일명에서 locale 추출: -en이면 'en', 그외는 'ko'
        return path.endsWith('-en') ? 'en' : 'ko';
      },
    },
  },
}));

export const Work = defineDocumentType(() => ({
  name: "Work",
  filePathPattern: `work/**/*.mdx`,
  contentType: "mdx",
  fields: {
    title: { type: "string", required: true },
    description: { type: "string", required: false },
    category: { type: "string", required: false },
    company: { type: "string", required: false },
    role: { type: "string", required: false },
    startDate: { type: "date", required: true },
    endDate: { type: "date", required: false },
    problem: { type: "list", of: { type: "string" }, required: false },
    impact: { type: "list", of: { type: "string" }, required: false },
    tags: { type: "list", of: { type: "string" }, required: false },
    product: { type: "string", required: false },
    productDescription: { type: "string", required: false },
  },
  computedFields: {
    slug: {
      type: "string",
      resolve: (doc) =>
        doc._raw.flattenedPath.replace("work/", "").replace(/-(?:ko|en)$/, ""),
    },
    locale: {
      type: "string",
      resolve: (doc) =>
        doc._raw.flattenedPath.endsWith("-en") ? "en" : "ko",
    },
  },
}));

export default makeSource({
  contentDirPath: "./content",
  documentTypes: [BlogPost, Work],
  mdx: {
    remarkPlugins: [remarkObsidian],
    rehypePlugins: [
      rehypeUnwrapImages, // 이미지를 p 태그에서 분리
      rehypeSlug,
      [
        rehypePrettyCode,
        {
          theme: {
            dark: "github-dark",
            light: "github-light",
          },
          keepBackground: false,
        },
      ],
      [
        rehypeAutolinkHeadings,
        {
          properties: {
            className: ["subheading-anchor"],
            ariaLabel: "Link to section",
          },
        },
      ],
    ],
  },
});
