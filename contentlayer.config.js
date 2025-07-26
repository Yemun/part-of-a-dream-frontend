import { defineDocumentType, makeSource } from "contentlayer2/source-files";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeUnwrapImages from "rehype-unwrap-images";

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
      resolve: (doc) => doc._raw.flattenedPath.replace("posts/", ""),
    },
  },
}));


export default makeSource({
  contentDirPath: "./content",
  documentTypes: [BlogPost],
  mdx: {
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
