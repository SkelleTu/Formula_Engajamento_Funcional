import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ErrorProvider } from '@/contexts/ErrorContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Fórmula Engajamento - Transforme Curtidas em Crescimento Real',
  description: 'Aprenda a transformar cada curtida, comentário e compartilhamento em crescimento real para seu negócio.',
  keywords: 'engajamento, redes sociais, marketing digital, crescimento',
  authors: [{ name: 'Fórmula Engajamento' }],
  openGraph: {
    title: 'Fórmula Engajamento',
    description: 'Transforme Curtidas em Crescimento Real',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <ErrorProvider>
          {children}
        </ErrorProvider>
      </body>
    </html>
  )
}
