import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import ConditionalFooter from '@/components/ConditionalFooter'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '600', '700'],
})

export const metadata: Metadata = {
  title: 'PRIMOVIDAL — Your personalised peptide protocol',
  description:
    'Find out exactly what peptide protocol is right for you. Takes 2 minutes.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased flex min-h-dvh flex-col`}>
        <div className="flex min-h-0 min-h-dvh flex-1 flex-col">{children}</div>
        <ConditionalFooter />
      </body>
    </html>
  )
}
