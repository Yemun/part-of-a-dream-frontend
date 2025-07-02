// contentlayer.config.js
import { defineDocumentType, makeSource } from "contentlayer2/source-files";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
var BlogPost = defineDocumentType(() => ({
  name: "BlogPost",
  filePathPattern: `posts/**/*.mdx`,
  contentType: "mdx",
  fields: {
    title: {
      type: "string",
      description: "The title of the post",
      required: true
    },
    publishedAt: {
      type: "date",
      description: "The date of the post",
      required: true
    },
    updatedAt: {
      type: "date",
      description: "The updated date of the post",
      required: false
    },
    description: {
      type: "string",
      description: "The description of the post",
      required: false
    },
    tags: {
      type: "list",
      of: { type: "string" },
      description: "Tags for the post",
      required: false
    }
  },
  computedFields: {
    url: {
      type: "string",
      resolve: (doc) => `/posts/${doc._raw.flattenedPath}`
    },
    slug: {
      type: "string",
      resolve: (doc) => doc._raw.flattenedPath
    }
  }
}));
var Profile = defineDocumentType(() => ({
  name: "Profile",
  filePathPattern: `profile.mdx`,
  contentType: "mdx",
  fields: {
    title: {
      type: "string",
      description: "Profile title",
      required: true
    },
    biography: {
      type: "string",
      description: "Biography",
      required: true
    },
    career: {
      type: "string",
      description: "Career information",
      required: true
    },
    contact: {
      type: "json",
      description: "Contact information",
      required: false
    }
  }
}));
var contentlayer_config_default = makeSource({
  contentDirPath: "./content",
  documentTypes: [BlogPost, Profile],
  mdx: {
    rehypePlugins: [
      rehypeSlug,
      [
        rehypePrettyCode,
        {
          theme: {
            dark: "github-dark",
            light: "github-light"
          },
          keepBackground: false
        }
      ],
      [
        rehypeAutolinkHeadings,
        {
          properties: {
            className: ["subheading-anchor"],
            ariaLabel: "Link to section"
          }
        }
      ]
    ]
  }
});
export {
  BlogPost,
  Profile,
  contentlayer_config_default as default
};
//# sourceMappingURL=compiled-contentlayer-config-A6IH37R5.mjs.map
