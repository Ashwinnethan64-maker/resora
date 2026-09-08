'use client';

import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  if (!content) return null;

  const lines = content.split('\n');
  const renderedElements: React.ReactNode[] = [];

  let inCodeBlock = false;
  let codeBlockLines: string[] = [];
  let codeBlockLang = '';

  let inTable = false;
  let tableRows: string[][] = [];

  const flushCodeBlock = (key: number) => {
    if (codeBlockLines.length > 0) {
      renderedElements.push(
        <div key={`code-${key}`} className="my-3 border-2 border-black bg-black text-green-400 p-3 font-mono text-xs overflow-x-auto shadow-[2px_2px_0px_#000]">
          {codeBlockLang && (
            <div className="text-[10px] uppercase font-bold text-black bg-[#FFD93D] px-1.5 py-0.5 inline-block mb-2 border border-black">
              {codeBlockLang}
            </div>
          )}
          <pre className="whitespace-pre">{codeBlockLines.join('\n')}</pre>
        </div>
      );
      codeBlockLines = [];
      codeBlockLang = '';
    }
  };

  const flushTable = (key: number) => {
    if (tableRows.length > 0) {
      const [header, ...body] = tableRows;
      renderedElements.push(
        <div key={`table-${key}`} className="my-3 overflow-x-auto border-2 border-black shadow-[3px_3px_0px_#000]">
          <table className="min-w-full text-xs font-mono text-left bg-white divide-y-2 divide-black">
            {header && (
              <thead className="bg-[#FFD93D]">
                <tr>
                  {header.map((cell, idx) => (
                    <th key={idx} className="p-2 border-r-2 border-black last:border-r-0 font-black uppercase">
                      {parseInlineFormatting(cell.trim())}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody className="divide-y border-t-2 border-black">
              {body.map((row, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-[#FFFDF5]">
                  {row.map((cell, cellIdx) => (
                    <td key={cellIdx} className="p-2 border-r border-black/20 last:border-r-0">
                      {parseInlineFormatting(cell.trim())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('```')) {
      if (inCodeBlock) {
        flushCodeBlock(i);
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
        codeBlockLang = line.replace('```', '').trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      if (line.includes('---')) {
        continue;
      }
      const cells = line
        .trim()
        .slice(1, -1)
        .split('|');
      tableRows.push(cells);
      inTable = true;
      continue;
    } else if (inTable) {
      flushTable(i);
      inTable = false;
    }

    if (!line.trim()) {
      renderedElements.push(<div key={`empty-${i}`} className="h-2" />);
      continue;
    }

    if (line.startsWith('### ')) {
      renderedElements.push(
        <h3 key={`h3-${i}`} className="text-sm font-black uppercase tracking-wider text-black mt-4 mb-1 border-b-2 border-black pb-0.5">
          {parseInlineFormatting(line.slice(4))}
        </h3>
      );
      continue;
    }
    if (line.startsWith('## ')) {
      renderedElements.push(
        <h2 key={`h2-${i}`} className="text-base font-black uppercase tracking-wide text-black mt-5 mb-1.5 bg-[#FFD93D] px-2 py-0.5 border-2 border-black inline-block shadow-[2px_2px_0px_#000]">
          {parseInlineFormatting(line.slice(3))}
        </h2>
      );
      continue;
    }
    if (line.startsWith('# ')) {
      renderedElements.push(
        <h1 key={`h1-${i}`} className="text-lg font-black uppercase text-black mt-5 mb-2 border-b-3 border-black pb-1">
          {parseInlineFormatting(line.slice(2))}
        </h1>
      );
      continue;
    }

    if (line.startsWith('> ')) {
      renderedElements.push(
        <blockquote key={`quote-${i}`} className="border-l-4 border-black bg-[#FFFDF5] pl-3 py-1.5 my-2 text-xs font-mono font-medium italic text-black/90">
          {parseInlineFormatting(line.slice(2))}
        </blockquote>
      );
      continue;
    }

    if (line.match(/^[\*\-]\s+/)) {
      const text = line.replace(/^[\*\-]\s+/, '');
      renderedElements.push(
        <li key={`li-${i}`} className="ml-4 list-disc text-xs leading-relaxed font-sans text-black/90 my-0.5">
          {parseInlineFormatting(text)}
        </li>
      );
      continue;
    }

    if (line.match(/^\d+\.\s+/)) {
      const text = line.replace(/^\d+\.\s+/, '');
      renderedElements.push(
        <li key={`oli-${i}`} className="ml-4 list-decimal text-xs leading-relaxed font-sans text-black/90 my-0.5">
          {parseInlineFormatting(text)}
        </li>
      );
      continue;
    }

    renderedElements.push(
      <p key={`p-${i}`} className="text-xs leading-relaxed text-black/90 my-1">
        {parseInlineFormatting(line)}
      </p>
    );
  }

  if (inCodeBlock) flushCodeBlock(lines.length);
  if (inTable) flushTable(lines.length);

  return <div className={`space-y-1 ${className}`}>{renderedElements}</div>;
}

function parseInlineFormatting(text: string): React.ReactNode[] {
  const tokens: React.ReactNode[] = [];
  const pattern = /(\[([^\]]+)\]\(([^)]+)\))|(`([^`]+)`)|(\b\*\*([^*]+)\*\*)|(\b\*([^*]+)\*)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(text.slice(lastIndex, match.index));
    }

    if (match[1]) {
      const label = match[2];
      const rawUrl = match[3].trim();
      const safeUrl = sanitizeLinkUrl(rawUrl);

      if (safeUrl) {
        const isExternal = safeUrl.startsWith('http://') || safeUrl.startsWith('https://');
        tokens.push(
          <a
            key={`link-${match.index}`}
            href={safeUrl}
            target={isExternal ? '_blank' : undefined}
            rel={isExternal ? 'noopener noreferrer' : undefined}
            className="text-black font-bold underline decoration-2 decoration-[#FF6B6B] hover:bg-[#FFD93D] px-0.5 transition-colors"
          >
            {label}
            {isExternal && <span className="text-[10px] ml-0.5">↗</span>}
          </a>
        );
      } else {
        tokens.push(label);
      }
    } else if (match[4]) {
      tokens.push(
        <code key={`code-${match.index}`} className="bg-black/10 px-1 py-0.2 font-mono text-[11px] font-bold border border-black/20 text-black">
          {match[5]}
        </code>
      );
    } else if (match[6]) {
      tokens.push(
        <strong key={`bold-${match.index}`} className="font-black text-black">
          {match[7]}
        </strong>
      );
    } else if (match[8]) {
      tokens.push(
        <em key={`italic-${match.index}`} className="italic">
          {match[9]}
        </em>
      );
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    tokens.push(text.slice(lastIndex));
  }

  return tokens.length > 0 ? tokens : [text];
}

function sanitizeLinkUrl(url: string): string | null {
  const trimmed = url.trim();
  const lower = trimmed.toLowerCase();

  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('file:')
  ) {
    return null;
  }

  if (lower.startsWith('http://') || lower.startsWith('https://')) {
    return trimmed;
  }

  if (lower.startsWith('#')) {
    return trimmed;
  }

  if (lower.startsWith('/')) {
    return trimmed;
  }

  if (trimmed.includes('.') && !trimmed.includes(' ')) {
    return `https://${trimmed}`;
  }

  return null;
}
