# Webhook 설정 가이드

이 문서는 Strapi Cloud에서 새 글 작성 시 자동으로 Next.js 블로그가 업데이트되도록 webhook을 설정하는 방법을 설명합니다.

## 1. 환경 변수 설정

### Vercel (프로덕션 환경)

1. Vercel 대시보드에서 프로젝트 설정 > Environment Variables로 이동
2. 다음 환경 변수를 추가:

```
REVALIDATE_TOKEN=your-super-secret-token-here
```

⚠️ **보안 중요**: 강력한 랜덤 토큰을 사용하세요. 예: `openssl rand -hex 32`

### 로컬 개발 환경

`.env.local` 파일에 추가:

```
REVALIDATE_TOKEN=your-super-secret-token-here
```

## 2. Strapi Cloud Webhook 설정

### 2.1 Strapi Cloud 관리자 패널 접속

1. Strapi Cloud 대시보드 로그인
2. 해당 프로젝트의 "Content Manager" 클릭

### 2.2 Webhook 생성

1. 설정(Settings) > Webhooks 메뉴로 이동
2. "Create new webhook" 클릭
3. 다음 정보 입력:

#### 기본 정보
- **Name**: `Blog Revalidation Webhook`
- **URL**: `https://yemun.kr/api/revalidate`
- **Headers**:
  ```
  Authorization: Bearer your-super-secret-token-here
  Content-Type: application/json
  ```

#### 이벤트 선택
다음 이벤트들을 체크:
- ✅ `entry.create` (새 글 작성)
- ✅ `entry.update` (글 수정)
- ✅ `entry.delete` (글 삭제)
- ✅ `entry.publish` (글 발행)
- ✅ `entry.unpublish` (글 비공개)

4. "Save" 클릭하여 webhook 생성

## 3. 테스트

### 3.1 Webhook 헬스체크

브라우저에서 접속하여 확인:
```
https://yemun.kr/api/revalidate
```

응답 예시:
```json
{
  "status": "ok",
  "message": "Revalidation webhook endpoint is ready",
  "timestamp": "2025-01-29T..."
}
```

### 3.2 수동 재검증 테스트

curl 명령어로 테스트:
```bash
curl -X POST https://yemun.kr/api/revalidate \
  -H "Authorization: Bearer your-super-secret-token-here" \
  -H "Content-Type: application/json"
```

### 3.3 실제 블로그 포스트 테스트

1. Strapi Cloud에서 새 블로그 포스트 작성
2. "Publish" 클릭
3. 1-2분 후 `https://yemun.kr` 접속하여 새 글이 표시되는지 확인

## 4. 동작 원리

### 자동 Revalidation 프로세스

1. **Strapi에서 블로그 포스트 발행**
2. **Strapi Cloud가 webhook 전송** → `https://yemun.kr/api/revalidate`
3. **Next.js가 인증 토큰 확인**
4. **캐시 무효화 및 페이지 재생성**:
   - 홈페이지 (`/`)
   - 모든 포스트 페이지 (`/posts/[id]`)
   - Sitemap (`/sitemap.xml`)
   - 프로필 페이지 (`/profile`)
5. **사용자가 사이트 방문 시 최신 내용 표시**

### 재생성되는 항목들

- ✅ **홈페이지**: 새 글이 포스트 목록에 표시
- ✅ **Sitemap**: 새 글 URL이 자동으로 포함
- ✅ **개별 포스트**: 수정된 내용 반영
- ✅ **SEO 메타데이터**: 새 글의 제목, 설명 등

## 5. 문제 해결

### Webhook이 작동하지 않을 때

1. **환경 변수 확인**: Vercel에서 `REVALIDATE_TOKEN` 설정 여부 확인
2. **토큰 일치 확인**: Strapi webhook 헤더의 토큰과 환경 변수 일치 여부
3. **URL 확인**: webhook URL이 `https://yemun.kr/api/revalidate`인지 확인
4. **Vercel 로그 확인**: Functions 탭에서 webhook 호출 로그 확인

### 수동 재검증이 필요한 경우

동일한 엔드포인트를 사용하여 수동으로 모든 페이지 재검증:

```bash
curl -X POST https://yemun.kr/api/revalidate \
  -H "Authorization: Bearer your-super-secret-token-here"
```

## 6. 보안 고려사항

- ✅ 강력한 랜덤 토큰 사용 (단일 토큰으로 간소화)
- ✅ 환경 변수로 토큰 보호
- ✅ HTTPS 필수 사용
- ✅ 특정 모델(blog)과 이벤트만 처리
- ✅ Webhook과 수동 호출 모두 동일한 보안 수준

이제 새 글을 작성하면 자동으로 블로그가 업데이트됩니다! 🎉