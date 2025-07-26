import { getBlogPosts, BlogPost } from "@/lib/content";
import PostCard from "@/components/post/PostCard";
import { createMetadata } from "@/lib/metadata";

// Metadata for homepage
export const metadata = createMetadata({
  keywords: ["사용자 경험", "제품 디자인"],
  type: "website",
});

export default async function Home() {
  let posts: BlogPost[] = [];

  try {
    posts = await getBlogPosts();
    console.log(`Loaded ${posts.length} posts from Contentlayer`);
  } catch (error) {
    console.error("Failed to load posts:", error);
  }

  return (
    <div className="border-t border-l flex items-start content-start self-stretch flex-wrap overflow-hidden max-h-[1008px] sm:max-h-[960px]">
      {posts
        .sort(
          (a, b) =>
            new Date(b.publishedAt).getTime() -
            new Date(a.publishedAt).getTime()
        )
        .map((post: BlogPost) => (
          <PostCard key={post.slug} post={post} />
        ))}

      {/* 30개의 "작업 중" 링크 추가 */}
      {Array.from({ length: 48 }, (_, index) => {
        return <PostCard key={`placeholder-${index}`} text="-" />;
      })}
    </div>
  );
}
