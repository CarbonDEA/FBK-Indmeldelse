import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-24">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Billardklubben</h1>
          <p className="text-gray-600 mb-8">Medlemsportal</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/indmelding"
            className="p-6 border border-gray-300 rounded-lg hover:border-blue-500 transition"
          >
            <h2 className="text-xl font-semibold mb-2">Indmelding →</h2>
            <p className="text-gray-600">
              Anmod om medlemskab af Billardklubben
            </p>
          </Link>

          <Link
            href="/udmelding"
            className="p-6 border border-gray-300 rounded-lg hover:border-blue-500 transition"
          >
            <h2 className="text-xl font-semibold mb-2">Udmelding →</h2>
            <p className="text-gray-600">
              Afmeld dit medlemskab
            </p>
          </Link>

          <Link
            href="/admin/applications"
            className="p-6 border border-gray-300 rounded-lg hover:border-blue-500 transition"
          >
            <h2 className="text-xl font-semibold mb-2">Administration →</h2>
            <p className="text-gray-600">
              Administrer medlemmer og ansøgninger
            </p>
          </Link>
        </div>
      </div>
    </main>
  )
}
