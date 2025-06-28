import { NextRequest, NextResponse } from "next/server";
import { revalidateAllPages } from "@/lib/actions";

const REVALIDATE_TOKEN = process.env.REVALIDATE_TOKEN;

export async function POST(request: NextRequest) {
  try {
    // 인증 토큰 확인
    const authHeader = request.headers.get("authorization");
    const providedToken = authHeader?.replace("Bearer ", "");

    if (!REVALIDATE_TOKEN) {
      console.error("REVALIDATE_TOKEN not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    if (!providedToken || providedToken !== REVALIDATE_TOKEN) {
      console.error("Invalid or missing token");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 요청 본문 파싱 (webhook 또는 수동 호출 모두 처리)
    let requestType = "manual";
    let eventInfo = {};

    try {
      const body = await request.json();
      if (body.event && body.model) {
        requestType = "webhook";
        const { event, model, entry } = body;
        eventInfo = { event, model, entry: entry?.id };

        console.log("Webhook received:", eventInfo);

        // Blog 관련 이벤트만 처리
        if (model !== "blog") {
          return NextResponse.json(
            { message: "Event ignored - not a blog entry" },
            { status: 200 }
          );
        }

        // 처리할 이벤트 목록
        const validEvents = [
          "entry.create",
          "entry.update", 
          "entry.delete",
          "entry.publish",
          "entry.unpublish"
        ];

        if (!validEvents.includes(event)) {
          return NextResponse.json(
            { message: "Event ignored - not a relevant blog event" },
            { status: 200 }
          );
        }
      }
    } catch {
      // JSON 파싱 실패 시 수동 호출로 간주
      console.log("Manual revalidation request");
    }

    // 모든 페이지 재검증 실행
    try {
      await revalidateAllPages();
      
      const message = requestType === "webhook" 
        ? "Webhook revalidation successful" 
        : "Manual revalidation successful";

      console.log(message);

      return NextResponse.json({
        message,
        type: requestType,
        revalidated: ["/", "/posts/[id]", "/profile", "/sitemap.xml"],
        timestamp: new Date().toISOString(),
        ...eventInfo
      });

    } catch (revalidationError) {
      console.error("Revalidation error:", revalidationError);
      return NextResponse.json(
        { error: "Revalidation failed", details: String(revalidationError) },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("Revalidation processing error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}

// GET 메서드로 헬스체크 제공
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Revalidation endpoint is ready",
    note: "Supports both webhook and manual revalidation",
    timestamp: new Date().toISOString()
  });
}