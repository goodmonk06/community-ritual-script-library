import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ritual Script Library',
  description: 'Community ritual script library for managing and rendering ritual templates',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
