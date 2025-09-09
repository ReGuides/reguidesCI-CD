import { NextRequest, NextResponse } from 'next/server';
import { JSDOM } from 'jsdom';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Валидация URL
    let targetUrl: URL;
    try {
      targetUrl = new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    // Проверяем, что это наш домен
    if (!targetUrl.hostname.includes('reguides.ru') && !targetUrl.hostname.includes('localhost')) {
      return NextResponse.json({ error: 'Only reguides.ru domain is allowed' }, { status: 400 });
    }

    // Получаем HTML страницы
    const response = await fetch(targetUrl.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      return NextResponse.json({ error: `Failed to fetch page: ${response.status}` }, { status: response.status });
    }

    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Извлекаем мета-данные
    const metadata = {
      // Основные мета-теги
      title: document.querySelector('title')?.textContent || 'No title',
      description: document.querySelector('meta[name="description"]')?.getAttribute('content') || 'No description',
      keywords: document.querySelector('meta[name="keywords"]')?.getAttribute('content') || 'No keywords',
      
      // Open Graph
      ogTitle: document.querySelector('meta[property="og:title"]')?.getAttribute('content') || 'No OG title',
      ogDescription: document.querySelector('meta[property="og:description"]')?.getAttribute('content') || 'No OG description',
      ogType: document.querySelector('meta[property="og:type"]')?.getAttribute('content') || 'No OG type',
      ogUrl: document.querySelector('meta[property="og:url"]')?.getAttribute('content') || 'No OG URL',
      ogImage: document.querySelector('meta[property="og:image"]')?.getAttribute('content') || 'No OG image',
      
      // Twitter Cards
      twitterCard: document.querySelector('meta[name="twitter:card"]')?.getAttribute('content') || 'No Twitter card',
      twitterTitle: document.querySelector('meta[name="twitter:title"]')?.getAttribute('content') || 'No Twitter title',
      twitterDescription: document.querySelector('meta[name="twitter:description"]')?.getAttribute('content') || 'No Twitter description',
      twitterImage: document.querySelector('meta[name="twitter:image"]')?.getAttribute('content') || 'No Twitter image',
      
      // Canonical URL
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') || 'No canonical URL',
      
      // Robots
      robots: document.querySelector('meta[name="robots"]')?.getAttribute('content') || 'No robots directive',
      
      // Viewport
      viewport: document.querySelector('meta[name="viewport"]')?.getAttribute('content') || 'No viewport',
      
      // Charset
      charset: document.querySelector('meta[charset]')?.getAttribute('charset') || 'No charset',
      
      // Hreflang
      hreflang: Array.from(document.querySelectorAll('link[rel="alternate"][hreflang]')).map(link => ({
        hreflang: link.getAttribute('hreflang'),
        href: link.getAttribute('href')
      })),
      
      // Structured Data (JSON-LD)
      structuredData: Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map(script => {
        try {
          return JSON.parse(script.textContent || '{}');
        } catch {
          return { error: 'Invalid JSON-LD' };
        }
      }),
      
      // Дополнительные мета-теги
      additionalMeta: Array.from(document.querySelectorAll('meta')).map(meta => ({
        name: meta.getAttribute('name'),
        property: meta.getAttribute('property'),
        content: meta.getAttribute('content')
      })).filter(meta => meta.name || meta.property),
      
      // Анализ контента
      contentAnalysis: {
        h1Count: document.querySelectorAll('h1').length,
        h2Count: document.querySelectorAll('h2').length,
        h3Count: document.querySelectorAll('h3').length,
        imageCount: document.querySelectorAll('img').length,
        linkCount: document.querySelectorAll('a').length,
        wordCount: document.body?.textContent?.split(/\s+/).length || 0
      }
    };

    return NextResponse.json({
      success: true,
      url: targetUrl.toString(),
      metadata,
      analyzedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Metadata analysis error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
