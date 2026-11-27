import type { ReactNode } from 'react';

/** Match http(s) URLs and bare www. hosts in plain text. */
const URL_PATTERN =
  /(https?:\/\/[^\s<>"'()\[\]{}]+|www\.[^\s<>"'()\[\]{}]+)/gi;

function normalizeHref(raw: string): string | null {
  const trimmed = raw.replace(/[.,;:!?)]+$/g, '');
  const href = trimmed.startsWith('www.') ? `https://${trimmed}` : trimmed;
  try {
    const url = new URL(href);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    return url.toString();
  } catch {
    return null;
  }
}

/** Turn plain text into nodes with clickable http(s) links. */
export function linkifyText(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;

  for (const match of text.matchAll(URL_PATTERN)) {
    const raw = match[0];
    const index = match.index ?? 0;
    if (index > lastIndex) {
      nodes.push(text.slice(lastIndex, index));
    }

    const trailing = raw.match(/[.,;:!?)]+$/)?.[0] ?? '';
    const core = trailing ? raw.slice(0, -trailing.length) : raw;
    const href = normalizeHref(core);

    if (href) {
      nodes.push(
        <a
          key={`link-${key++}`}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="break-all font-semibold text-yellow-300 underline decoration-yellow-500/60 underline-offset-2 transition hover:text-yellow-200"
        >
          {core}
        </a>,
      );
      if (trailing) nodes.push(trailing);
    } else {
      nodes.push(raw);
    }

    lastIndex = index + raw.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes.length > 0 ? nodes : [text];
}
