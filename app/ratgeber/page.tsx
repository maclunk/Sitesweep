import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { blogArticles } from '@/src/data/blogArticles'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Infos: Website-Sicherheit für KMU',
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const day = date.getDate()
  const month = date.toLocaleDateString('de-DE', { month: 'long' })
  const year = date.getFullYear()
  return `${day}. ${month} ${year}`
}

function getExcerpt(content: string, maxLength: number = 180): string {
  // Remove markdown headers, bold markers, and newlines
  const plainText = content
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*/g, '')
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  
  if (plainText.length <= maxLength) return plainText
  return plainText.substring(0, maxLength).trim() + '…'
}

export default function RatgeberPage() {
  return (
    <div className="min-h-screen bg-bg-soft">
      <Header />
      
      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-6">
            Infos
          </h1>
          <p className="text-lg text-text-muted max-w-3xl">
            Wissen für KMU & Handwerker – Fachartikel zur Website-Sicherheit, Datenschutz und Optimierung für kleine und mittlere Unternehmen.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {blogArticles.map((article) => (
            <Link
              key={article.id}
              href={`/ratgeber/${article.slug}`}
              className="group bg-white rounded-2xl shadow-soft border border-slate-200/50 overflow-hidden hover:shadow-soft-lg transition-all duration-200 flex flex-col"
            >
              {/* Image */}
              <div className="relative w-full h-48 bg-slate-200 overflow-hidden">
                <Image
                  src={article.imageSrc}
                  alt={article.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>

              {/* Content */}
              <div className="p-5 flex flex-col flex-1">
                {/* Date */}
                <div className="text-sm text-text-muted mb-2">
                  {formatDate(article.publishDate)}
                </div>

                {/* Title */}
                <h2 className="text-lg font-semibold text-slate-900 mb-3 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                  {article.title}
                </h2>

                {/* Excerpt */}
                <p className="text-sm text-text-muted leading-relaxed mb-4 flex-1 line-clamp-3">
                  {getExcerpt(article.content, 180)}
                </p>

                {/* Read More */}
                <div className="text-primary font-medium text-sm mt-auto">
                  Weiterlesen →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}
