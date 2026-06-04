type AccordionEntry = {
  title: string;
  content: string;
};

function escapeAttribute(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;");
}

function decodeMojibake(value: string) {
  if (!/[ÃÂ]/.test(value)) {
    return value;
  }

  try {
    const bytes = Uint8Array.from([...value].map((character) => character.charCodeAt(0)));
    return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  } catch {
    return value;
  }
}

function parseAccordionEntries(source: string): AccordionEntry[] {
  const entries: AccordionEntry[] = [];
  const pattern = /title:\s*"((?:\\"|[^"])*)"\s*,\s*content:\s*"((?:\\"|[^"])*)"/gm;

  for (const match of source.matchAll(pattern)) {
    const [, rawTitle = "", rawContent = ""] = match;

    entries.push({
      title: decodeMojibake(rawTitle.replaceAll('\\"', '"')),
      content: decodeMojibake(rawContent.replaceAll('\\"', '"')),
    });
  }

  return entries;
}

export function normalizeBodyForMdx(source: string) {
  return source.replace(/<Accordion\s+items=\{\[([\s\S]*?)\]\}\s*\/>/gm, (_match, itemsSource: string) => {
    const entries = parseAccordionEntries(itemsSource);

    if (entries.length === 0) {
      return "";
    }

    const encoded = encodeURIComponent(JSON.stringify(entries));
    return `<Accordion itemsEncoded="${escapeAttribute(encoded)}" />`;
  });
}
