'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { LayoutDashboard, FlaskConical, Menu, X, ChevronRight } from 'lucide-react'
import LogoutButton from '@/components/LogoutButton'

type ShellUser = {
  firstName: string
  email: string
  paid: boolean
  compound?: string
  goal?: string
}

export default function DashboardLayoutClient({
  user: shellUser,
  children,
}: {
  user: ShellUser | null
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = useCallback(() => setMenuOpen(false), [])
  useEffect(() => {
    closeMenu()
  }, [pathname, closeMenu])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeMenu()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen, closeMenu])

  const title =
    pathname === '/dashboard' || pathname === '/dashboard/'
      ? 'Home'
      : pathname.startsWith('/dashboard/protocol')
        ? 'My protocol'
        : 'Dashboard'

  if (!shellUser) {
    return <div className="min-h-dvh bg-[#E8E4DE]">{children}</div>
  }

  const { firstName, paid, compound, goal } = shellUser

  const nav = [
    { href: '/dashboard', label: 'Home', icon: LayoutDashboard, show: true },
    { href: '/dashboard/protocol', label: 'My protocol', icon: FlaskConical, show: true },
  ]

  return (
    <div className="min-h-dvh bg-[#0A0A0A]">
      {/* Top bar */}
      <header
        className="sticky top-0 z-40 flex h-[3.25rem] shrink-0 items-center gap-2 border-b border-white/[0.08] bg-[#0A0A0A] px-3 shadow-lg sm:h-14 sm:px-4"
        style={{ paddingTop: 'max(0px, env(safe-area-inset-top))' }}
      >
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white/90 transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C]"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" strokeWidth={2} aria-hidden />
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#C9A84C]">PRIMOVIDAL</p>
          <h1 className="truncate text-sm font-bold text-white sm:text-base">{title}</h1>
        </div>
        <div className="flex shrink-0 items-center">
          <LogoutButton variant="dark" />
        </div>
      </header>

      {/* Overlay + sidebar */}
      <div
        className={`fixed inset-0 z-50 transition-[visibility] duration-300 ${menuOpen ? 'visible' : 'invisible'}`}
        aria-hidden={!menuOpen}
      >
        <button
          type="button"
          className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${menuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={closeMenu}
          aria-label="Close menu"
        />
        <aside
          className={`absolute left-0 top-0 flex h-full w-[min(100vw-3rem,18rem)] max-w-[18rem] flex-col border-r border-white/10 bg-[#111] shadow-2xl transition-transform duration-300 ease-out ${
            menuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
        >
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#C9A84C]">Menu</p>
              <p className="truncate text-sm font-semibold text-white">{firstName || 'Member'}</p>
            </div>
            <button
              type="button"
              onClick={closeMenu}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-2 py-4">
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-white/35">Main</p>
            <ul className="space-y-0.5">
              {nav
                .filter((n) => n.show)
                .map(({ href, label, icon: Icon }) => {
                  const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        onClick={closeMenu}
                        className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${
                          active
                            ? 'bg-[#C9A84C]/20 text-[#C9A84C]'
                            : 'text-white/80 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <Icon className="h-5 w-5 shrink-0 opacity-90" strokeWidth={2} aria-hidden />
                        {label}
                        <ChevronRight className="ml-auto h-4 w-4 opacity-40" aria-hidden />
                      </Link>
                    </li>
                  )
                })}
            </ul>

            <div className="mt-8 border-t border-white/10 px-3 pt-6">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#C9A84C]/80">Why peptides</p>
              <p className="mt-2 text-xs leading-relaxed text-white/45">
                Short chains of amino acids that signal repair, metabolism, and recovery. The right match depends on
                your goal, not trends.
              </p>
            </div>
          </nav>

          {paid && compound ? (
            <div className="border-t border-white/10 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">Active protocol</p>
              <p className="mt-1 truncate text-sm font-medium text-white/90">{compound}</p>
              {goal ? <p className="truncate text-xs text-white/50">{goal}</p> : null}
            </div>
          ) : null}
        </aside>
      </div>

      {/* Main content */}
      <main className="min-h-[calc(100dvh-3.25rem)] rounded-t-[1.25rem] bg-[#E8E4DE] sm:min-h-[calc(100dvh-3.5rem)] sm:rounded-t-2xl">
        {children}
      </main>
    </div>
  )
}
