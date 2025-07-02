import { defineDocumentType, makeSource } from 'contentlayer2/source-files'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypePrettyCode from 'rehype-pretty-code'

export const BlogPost = defineDocumentType(() => ({
  name: 'BlogPost',
  filePathPattern: `posts/**/*.mdx`,
  contentType: 'mdx',
  fields: {
    title: {
      type: 'string',
      description: 'The title of the post',
      required: true,
    },
    publishedAt: {
      type: 'date',
      description: 'The date of the post',
      required: true,
    },
    description: {
      type: 'string',
      description: 'The description of the post',
      required: false,
    },
    tags: {
      type: 'list',
      of: { type: 'string' },
      description: 'Tags for the post',
      required: false,
    },
  },
  computedFields: {
    slug: {
      type: 'string',
      resolve: (doc) => doc._raw.flattenedPath.replace('posts/', ''),
    },
  },
}))

export const Profile = defineDocumentType(() => ({
  name: 'Profile',
  filePathPattern: `profile.mdx`,
  contentType: 'mdx',
  fields: {
    title: {
      type: 'string',
      description: 'Profile title',
      required: true,
    },
    biography: {
      type: 'string',
      description: 'Biography',
      required: true,
    },
    career: {
      type: 'string',
      description: 'Career information',
      required: true,
    },
    contact: {
      type: 'json',
      description: 'Contact information',
      required: false,
    },
  },
}))

export default makeSource({
  contentDirPath: './content',
  documentTypes: [BlogPost, Profile],
  mdx: {
    rehypePlugins: [
      rehypeSlug,
      [
        rehypePrettyCode,
        {
          theme: {
            dark: 'github-dark',
            light: 'github-light',
          },
          keepBackground: false,
        },
      ],
      [
        rehypeAutolinkHeadings,
        {
          properties: {
            className: ['subheading-anchor'],
            ariaLabel: 'Link to section',
          },
        },
      ],
    ],
  },
})