import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'STYLEMATE - 韓國服裝虛擬試穿平台',
  description: '透過 AI 推薦與 2D 虛擬試穿技術，讓你輕鬆找到最適合的韓式穿搭風格',
  keywords: ['韓國服裝', '虛擬試穿', 'K-pop', '韓式風格', '線上購物', 'AI推薦'],
  authors: [{ name: 'STYLEMATE Team' }],
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'STYLEMATE - 韓國服裝虛擬試穿平台',
    description: '透過 AI 推薦與 2D 虛擬試穿技術，讓你輕鬆找到最適合的韓式穿搭風格',
    type: 'website',
    locale: 'zh_TW',
    siteName: 'STYLEMATE',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-neutral-cream text-neutral-dark min-h-screen">
        <div className="flex flex-col min-h-screen">
          <main className="flex-1">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}