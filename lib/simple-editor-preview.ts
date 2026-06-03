function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function renderInlineFormatting(value: string) {
  const withUnderlinePlaceholders = value
    .replaceAll("<u>", "%%UNDERLINE_OPEN%%")
    .replaceAll("</u>", "%%UNDERLINE_CLOSE%%");

  const escaped = escapeHtml(withUnderlinePlaceholders)
    .replaceAll("%%UNDERLINE_OPEN%%", "<u>")
    .replaceAll("%%UNDERLINE_CLOSE%%", "</u>");

  return escaped
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*(.+?)\*/g, "$1<em>$2</em>");
}

export function renderSimpleEditorPreview(source: string) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const html: string[] = [];
  let paragraphLines: string[] = [];
  let listItems: string[] = [];

  function flushParagraph() {
    if (paragraphLines.length === 0) return;
    html.push(`<p>${paragraphLines.map(renderInlineFormatting).join("<br />")}</p>`);
    paragraphLines = [];
  }

  function flushList() {
    if (listItems.length === 0) return;
    html.push(`<ul>${listItems.map((item) => `<li>${renderInlineFormatting(item)}</li>`).join("")}</ul>`);
    listItems = [];
  }

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    if (trimmed === "---") {
      flushParagraph();
      flushList();
      html.push("<hr />");
      continue;
    }

    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      flushParagraph();
      listItems.push(trimmed.slice(2));
      continue;
    }

    flushList();

    if (trimmed.startsWith("### ")) {
      flushParagraph();
      html.push(`<h3>${renderInlineFormatting(trimmed.slice(4))}</h3>`);
      continue;
    }

    if (trimmed.startsWith("## ")) {
      flushParagraph();
      html.push(`<h2>${renderInlineFormatting(trimmed.slice(3))}</h2>`);
      continue;
    }

    if (trimmed.startsWith("# ")) {
      flushParagraph();
      html.push(`<h1>${renderInlineFormatting(trimmed.slice(2))}</h1>`);
      continue;
    }

    paragraphLines.push(trimmed);
  }

  flushParagraph();
  flushList();

  return html.join("");
}
