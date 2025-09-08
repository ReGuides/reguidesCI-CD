'use client'

import { useState, useEffect } from 'react'

export default function SitemapDebugPage() {
  const [sitemapData, setSitemapData] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const fetchSitemap = async () => {
      try {
        const response = await fetch('/sitemap.xml')
        const text = await response.text()
        setSitemapData(text)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchSitemap()
  }, [])

  if (loading) return <div>Loading sitemap...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Sitemap Debug</h1>
      <div className="bg-gray-100 p-4 rounded">
        <pre className="whitespace-pre-wrap text-sm">{sitemapData}</pre>
      </div>
    </div>
  )
}
