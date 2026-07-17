import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Simple - Installation',
  description: 'Simple Programming Language - Standalone installer for Windows, Linux, and macOS',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[var(--bg)] text-[var(--fg)] antialiased">
        {children}
      </body>
    </html>
  )
}