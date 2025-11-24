import { notFound } from 'next/navigation'
import { blogArticles } from '@/src/data/blogArticles'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ScannerCta from '@/components/ScannerCta'
import Image from 'next/image'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import type { Metadata } from 'next'

interface PageProps {
  params: {
    slug: string
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const day = date.getDate()
  const month = date.toLocaleDateString('de-DE', { month: 'long' })
  const year = date.getFullYear()
  return `${day}. ${month} ${year}`
}

export async function generateStaticParams() {
  return blogArticles.map((article) => ({
    slug: article.slug,
  }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const article = blogArticles.find((a) => a.slug === params.slug)

  if (!article) {
    return {
      title: 'Artikel nicht gefunden',
    }
  }

  // Basis-URL für Canonical-Tag
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const canonicalUrl = `${siteUrl}/ratgeber/${params.slug}`

  return {
    title: article.title, // Template fügt automatisch " | SiteSweep" hinzu
    description: article.metaDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: article.title,
      description: article.metaDescription,
      images: [article.imageSrc],
      type: 'article',
      publishedTime: article.publishDate,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.metaDescription,
      images: [article.imageSrc],
    },
  }
}

export default function BlogArticlePage({ params }: PageProps) {
  const article = blogArticles.find((a) => a.slug === params.slug)

  if (!article) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="max-w-3xl mx-auto px-4 py-10">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/ratgeber"
            className="inline-flex items-center text-sm text-slate-600 hover:text-sky-600 transition-colors"
          >
            ← Zurück zu Infos
          </Link>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-2">
          {article.title}
        </h1>

        {/* Meta Info */}
        <div className="text-sm text-slate-500 mb-6">
          {formatDate(article.publishDate)}
        </div>

        {/* Featured Image */}
        <div className="relative w-full h-auto rounded-xl overflow-hidden mb-8 bg-slate-200">
          <Image
            src={article.imageSrc}
            alt={article.title}
            width={1024}
            height={512}
            className="w-full h-auto rounded-xl"
            priority
            sizes="(max-width: 768px) 100vw, 1024px"
          />
        </div>

        {/* Article Content */}
        <article className="prose prose-slate max-w-none prose-lg prose-headings:font-bold prose-headings:text-slate-900 prose-headings:tracking-tight prose-h1:text-3xl prose-h1:mt-10 prose-h1:mb-6 prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:border-b prose-h2:border-slate-200 prose-h2:pb-2 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-p:text-slate-700 prose-p:leading-relaxed prose-p:mb-6 prose-p:text-base prose-ul:list-disc prose-ul:ml-6 prose-ul:mb-6 prose-ul:space-y-2 prose-ol:list-decimal prose-ol:ml-6 prose-ol:mb-6 prose-ol:space-y-2 prose-li:text-slate-700 prose-li:leading-relaxed prose-li:pl-2 prose-strong:text-slate-900 prose-strong:font-semibold prose-a:text-sky-600 prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-4 prose-blockquote:border-slate-300 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-slate-600 prose-code:text-sm prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-slate-900 prose-pre:text-slate-100">
          <ReactMarkdown
            components={{
              a: ({ node, ...props }) => (
                <a {...props} target="_blank" rel="noopener noreferrer" />
              ),
            }}
          >
            {article.content}
          </ReactMarkdown>
        </article>

        {/* Scanner CTA */}
        <div className="mt-10">
          <ScannerCta />
        </div>
      </main>

      <Footer />
    </div>
  )
}

