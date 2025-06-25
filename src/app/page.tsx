import { getBlogPosts, BlogPost } from "@/lib/strapi";
import PostCard from "@/components/post/PostCard";

export const revalidate = 604800; // 1주일(7일)마다 재생성

export default async function Home() {
  let posts: BlogPost[] = [];

  try {
    posts = await getBlogPosts();
    console.log(`Loaded ${posts.length} posts from Strapi`);
  } catch (error) {
    console.error("Failed to load posts:", error);
  }

  return (
    <div className="border-t border-l flex items-start content-start self-stretch flex-wrap">
      {posts
        .sort(
          (a, b) =>
            new Date(b.publishedAt).getTime() -
            new Date(a.publishedAt).getTime()
        )
        .map((post: BlogPost) => (
          <PostCard key={post.id} post={post} />
        ))}

      {/* 30개의 "작업 중" 링크 추가 */}
      {Array.from({ length: 24 }, (_, index) => {
        return <PostCard key={`placeholder-${index}`} text="-" />;
      })}
    </div>
  );
}
