import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 md:p-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-slate-800 mb-4">
            Seite nicht gefunden
          </h2>
          <p className="text-slate-600 mb-8">
            Die angeforderte Seite konnte nicht gefunden werden.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-sky-600 text-white font-medium rounded-lg hover:bg-sky-700 transition-colors"
          >
            Zur Startseite
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}

