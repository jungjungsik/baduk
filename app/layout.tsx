import type { Metadata, Viewport } from 'next'
import './globals.css'
import BottomNav from '@/components/layout/BottomNav'

export const metadata: Metadata = {
  title: '흑백 - 바둑 교육 앱',
  description: '배우고, 두고, 성장하다. 흑백으로 바둑을 시작하세요.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '흑백',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#fffcf7',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body className="bg-surface font-body text-on-surface min-h-screen">
        <div className="lg:flex">
          <BottomNav />
          <main className="lg:ml-64 flex-1 pb-24 lg:pb-0">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
