import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

// 빠른 axios 인스턴스 (짧은 timeout)
const quickStrapi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337",
  timeout: 5000, // 5초 timeout
  headers: {
    "Content-Type": "application/json",
  },
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ blogId: string }> }
) {
  try {
    const { blogId } = await params;
    
    if (!blogId) {
      return NextResponse.json(
        { error: "Blog ID is required" },
        { status: 400 }
      );
    }

    console.log(`Fetching comments for blog documentId: ${blogId}`);
    
    // Blog에서 comments relation으로 가져오기
    const response = await quickStrapi.get(
      `/api/blogs/${blogId}?populate[comments][fields][0]=id&populate[comments][fields][1]=author&populate[comments][fields][2]=email&populate[comments][fields][3]=content&populate[comments][fields][4]=createdAt&populate[comments][fields][5]=approved&populate[comments][sort][0]=createdAt:desc`
    );

    const blog = response.data.data;
    if (!blog || !blog.comments) {
      return NextResponse.json({
        comments: [],
        count: 0,
        timestamp: new Date().toISOString()
      });
    }

    // 승인된 댓글만 필터링
    const comments = blog.comments
      .filter((comment: { approved: boolean }) => comment.approved === true)
      .sort((a: { createdAt: string }, b: { createdAt: string }) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    
    return NextResponse.json({
      comments,
      count: comments.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const { blogId } = await params;
    console.error("Error in comments API:", error);
    
    // axios 오류인 경우 상태 코드 확인
    if (axios.isAxiosError(error)) {
      // 404 에러 (블로그 없음)는 정상적으로 빈 댓글로 처리
      if (error.response?.status === 404) {
        console.log(`Blog with documentId ${blogId} not found, returning empty comments`);
        return NextResponse.json({
          comments: [],
          count: 0,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    // 다른 에러는 여전히 500으로 처리하되, 빈 댓글 배열도 함께 반환
    return NextResponse.json(
      { 
        error: "Failed to fetch comments", 
        details: error instanceof Error ? error.message : "Unknown error",
        comments: [],
        count: 0,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}