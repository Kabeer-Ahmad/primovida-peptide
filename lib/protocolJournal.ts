export type JournalBlock =
  | { kind: 'paragraph'; text: string }
  | { kind: 'section'; title: string; body: string }

/** Split protocol narrative into journal blocks (paragraphs + **Title:** sections). */
export function parseProtocolJournal(content: string): JournalBlock[] {
  const parts = content.split(/\n\n+/)
  const blocks: JournalBlock[] = []
  for (const part of parts) {
    const trimmed = part.trim()
    if (!trimmed) continue
    const sectionMatch = trimmed.match(/^\*\*(.+?)\*\*\s*:?\s*([\s\S]*)$/m)
    if (sectionMatch) {
      blocks.push({
        kind: 'section',
        title: sectionMatch[1].trim(),
        body: sectionMatch[2].trim(),
      })
    } else {
      blocks.push({ kind: 'paragraph', text: trimmed })
    }
  }
  return blocks
}

/** Top stays sharp; from first “Compound” section onward = blurred on locked page. */
export function splitLockedPreview(blocks: JournalBlock[]): {
  sharp: JournalBlock[]
  blur: JournalBlock[]
} {
  const i = blocks.findIndex(
    (b) => b.kind === 'section' && /compound/i.test(b.title)
  )
  const cut = i >= 0 ? i : Math.min(3, blocks.length)
  return {
    sharp: blocks.slice(0, cut),
    blur: blocks.slice(cut),
  }
}
