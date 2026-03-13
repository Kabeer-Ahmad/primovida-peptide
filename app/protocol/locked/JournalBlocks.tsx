import type { JournalBlock } from '@/lib/protocolJournal'

export function JournalBlocks({ blocks, className = '' }: { blocks: JournalBlock[]; className?: string }) {
  return (
    <div className={`space-y-5 ${className}`}>
      {blocks.map((b, i) =>
        b.kind === 'paragraph' ? (
          <p
            key={i}
            className="text-[0.9375rem] leading-[1.75] text-[#3D3D3A] sm:text-base"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            {b.text}
          </p>
        ) : (
          <div
            key={i}
            className="rounded-xl border border-[#E8E4DC] bg-[#FAF8F4] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] sm:px-5 sm:py-4"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C9A84C]">{b.title}</p>
            <p
              className="mt-2 text-sm leading-relaxed text-[#2C2C2A] sm:text-[0.9375rem]"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              {b.body}
            </p>
          </div>
        )
      )}
    </div>
  )
}
