'use client'

import { LayoutDashboard, Sparkles, Lock } from 'lucide-react'
import LogoutButton from '@/components/LogoutButton'

export default function DashboardShell({
  firstName,
  paid,
  compound,
  goal,
  children,
}: {
  firstName: string
  paid: boolean
  compound?: string
  goal?: string
  children: React.ReactNode
}) {
  return (
    <div className="min-h-dvh bg-[#E8E4DE]">
      <header className="sticky top-0 z-50 bg-[#0A0A0A] shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
        <div
          className="mx-auto flex h-[3.25rem] max-w-3xl items-center justify-between gap-2 px-3 sm:h-14 sm:gap-4 sm:px-6"
          style={{ paddingTop: 'max(0px, env(safe-area-inset-top))' }}
        >
          <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#C9A84C]/25 to-[#3D5A80]/20 text-[#C9A84C] ring-1 ring-white/10">
              <LayoutDashboard className="h-[18px] w-[18px] sm:h-5 sm:w-5" strokeWidth={2} aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#C9A84C] sm:text-[10px] sm:tracking-[0.25em]">
                PRIMOVIDAL
              </p>
              <p className="truncate text-sm font-bold text-white sm:text-base">Dashboard</p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
            {paid ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-emerald-300 ring-1 ring-emerald-400/20 sm:px-2.5 sm:text-[10px]">
                <Sparkles className="h-3 w-3 text-emerald-400" aria-hidden />
                <span className="hidden sm:inline">Unlocked</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-amber-200/95 ring-1 ring-amber-400/15 sm:px-2.5 sm:text-[10px]">
                <Lock className="h-3 w-3 text-amber-400/90" aria-hidden />
                <span className="hidden sm:inline">Locked</span>
              </span>
            )}
            <LogoutButton variant="dark" />
          </div>
        </div>

        {paid && compound ? (
          <div className="border-t border-white/[0.06] bg-black/50 px-3 py-2 sm:px-6">
            <p className="mx-auto max-w-3xl truncate text-center text-[11px] text-white/55 sm:text-xs">
              <span className="font-semibold text-[#C9A84C]">Your protocol</span>
              <span className="mx-1.5 text-white/25">·</span>
              <span className="font-medium text-white/90">{compound}</span>
              {goal ? (
                <>
                  <span className="mx-1.5 text-white/25">·</span>
                  <span>{goal}</span>
                </>
              ) : null}
            </p>
          </div>
        ) : !paid ? (
          <div className="border-t border-white/[0.06] bg-black/50 px-3 py-2 sm:px-6">
            <p className="mx-auto max-w-3xl text-center text-[11px] text-white/55 sm:text-xs">
              Hey <span className="font-semibold text-white/90">{firstName || 'there'}</span>
              {' — '}
              unlock to read your full personalised plan.
            </p>
          </div>
        ) : null}
      </header>

      <div className="relative min-h-[calc(100dvh-3.25rem)] rounded-t-[1.25rem] bg-[#E8E4DE] shadow-[0_-4px_24px_rgba(0,0,0,0.06)] sm:min-h-[calc(100dvh-3.5rem)] sm:rounded-t-3xl">
        {children}
      </div>
    </div>
  )
}
