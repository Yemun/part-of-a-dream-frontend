import { visit } from "unist-util-visit";

/**
 * Obsidian 문법을 MDX가 이해하는 노드로 바꾸는 remark 플러그인.
 *
 * - `![[name.png]]` / `![[name.png|설명]]` → `/images/name.png` 이미지 노드
 *   (`|` 뒤 텍스트는 alt → 블로그와 같은 figcaption. 숫자만 있으면 Obsidian 크기 지정이라 무시)
 * - `![설명](name.png)` 처럼 경로 없는 이미지 → `/images/name.png` (Obsidian은 파일명만 쓰므로)
 * - `[Name.tsx]` 단독 문단 → `<Name />` JSX (EMBEDDABLE 목록에 있는 이름만)
 * - 코드 블록 lang 소문자 정규화 (`HTML` → `html`)
 * - 본문에 직접 쓴 `<iframe>` → `<Iframe>` 컴포넌트로 승격.
 *   MDX는 소문자 JSX 태그를 `components` 매핑 없이 그대로 렌더하므로
 *   문자열 style 속성을 React가 받아들이게 하려면 컴포넌트를 거쳐야 한다.
 */
const EMBEDDABLE = new Set(["PaletteEntry", "JangbogiFrame"]);
const PROMOTED_TAGS = { iframe: "Iframe" };

const WIKI_EMBED = /!\[\[([^\]|]+?)(?:\|([^\]]*))?\]\]/g;
// 스킴(https:, data: …)이나 루트 경로(/)가 없는 이미지 URL은 vault 파일명으로 본다
const BARE_IMAGE_URL = /^(?![a-z][a-z0-9+.-]*:)(?!\/)(?:\.\/)?(.+)$/i;
const COMPONENT_PLACEHOLDER = /^\[([A-Z][A-Za-z0-9]*)\.tsx\]$/;

function splitWikiEmbeds(value) {
  const nodes = [];
  let last = 0;
  for (const match of value.matchAll(WIKI_EMBED)) {
    const [raw, file, caption = ""] = match;
    const start = match.index ?? 0;
    if (start > last) nodes.push({ type: "text", value: value.slice(last, start) });
    const alt = /^\s*\d*\s*$/.test(caption) ? "" : caption.trim();
    nodes.push({ type: "image", url: `/images/${file.trim()}`, alt });
    last = start + raw.length;
  }
  if (last === 0) return null;
  if (last < value.length) nodes.push({ type: "text", value: value.slice(last) });
  return nodes;
}

export default function remarkObsidian() {
  return (tree) => {
    visit(tree, "code", (node) => {
      if (typeof node.lang === "string") node.lang = node.lang.toLowerCase();
    });

    visit(tree, "image", (node) => {
      const match = node.url.match(BARE_IMAGE_URL);
      if (match) node.url = `/images/${match[1]}`;
    });

    visit(tree, ["mdxJsxFlowElement", "mdxJsxTextElement"], (node) => {
      const promoted = PROMOTED_TAGS[node.name];
      if (promoted) node.name = promoted;
    });

    visit(tree, "paragraph", (node, index, parent) => {
      if (!parent || typeof index !== "number") return;

      // `[PaletteEntry.tsx]` 한 줄짜리 문단 → JSX 컴포넌트
      if (node.children.length === 1 && node.children[0].type === "text") {
        const match = node.children[0].value.trim().match(COMPONENT_PLACEHOLDER);
        if (match && EMBEDDABLE.has(match[1])) {
          parent.children[index] = {
            type: "mdxJsxFlowElement",
            name: match[1],
            attributes: [],
            children: [],
          };
          return;
        }
      }

      // `![[image.png]]` → image 노드
      node.children = node.children.flatMap((child) =>
        child.type === "text" ? (splitWikiEmbeds(child.value) ?? [child]) : [child],
      );
    });
  };
}
