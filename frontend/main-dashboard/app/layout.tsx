import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'maula.ai - AI-Powered Security Services',
  description: '50+ AI-powered tools to protect your business',
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
