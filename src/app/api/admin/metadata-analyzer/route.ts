import { NextRequest, NextResponse } from 'next/server';

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
    
    // Простой парсер HTML с помощью регулярных выражений
    const parseHtml = (html: string) => {
      const getMetaContent = (name: string, property?: boolean) => {
        const pattern = property 
          ? new RegExp(`<meta\\s+property="${name}"\\s+content="([^"]*)"`, 'i')
          : new RegExp(`<meta\\s+name="${name}"\\s+content="([^"]*)"`, 'i');
        const match = html.match(pattern);
        return match ? match[1] : null;
      };

      const getTitle = () => {
        const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
        return match ? match[1] : null;
      };

      const getCanonical = () => {
        const match = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]*)"[^>]*>/i);
        return match ? match[1] : null;
      };

      const getCharset = () => {
        const match = html.match(/<meta[^>]*charset="([^"]*)"[^>]*>/i);
        return match ? match[1] : null;
      };

      const getViewport = () => {
        const match = html.match(/<meta[^>]*name="viewport"[^>]*content="([^"]*)"[^>]*>/i);
        return match ? match[1] : null;
      };

      const getHreflang = () => {
        const matches = html.match(/<link[^>]*rel="alternate"[^>]*hreflang="([^"]*)"[^>]*href="([^"]*)"[^>]*>/gi);
        if (!matches) return [];
        return matches.map(match => {
          const hreflangMatch = match.match(/hreflang="([^"]*)"/i);
          const hrefMatch = match.match(/href="([^"]*)"/i);
          return {
            hreflang: hreflangMatch ? hreflangMatch[1] : null,
            href: hrefMatch ? hrefMatch[1] : null
          };
        });
      };

      const getStructuredData = () => {
        const matches = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([^<]*)<\/script>/gi);
        if (!matches) return [];
        return matches.map(match => {
          const contentMatch = match.match(/<script[^>]*>([^<]*)<\/script>/i);
          if (!contentMatch) return { error: 'Invalid JSON-LD' };
          try {
            return JSON.parse(contentMatch[1]);
          } catch {
            return { error: 'Invalid JSON-LD' };
          }
        });
      };

      const getAdditionalMeta = () => {
        const matches = html.match(/<meta[^>]*>/gi);
        if (!matches) return [];
        return matches.map(match => {
          const nameMatch = match.match(/name="([^"]*)"/i);
          const propertyMatch = match.match(/property="([^"]*)"/i);
          const contentMatch = match.match(/content="([^"]*)"/i);
          return {
            name: nameMatch ? nameMatch[1] : null,
            property: propertyMatch ? propertyMatch[1] : null,
            content: contentMatch ? contentMatch[1] : null
          };
        }).filter(meta => meta.name || meta.property);
      };

      const getContentAnalysis = () => {
        const h1Count = (html.match(/<h1[^>]*>/gi) || []).length;
        const h2Count = (html.match(/<h2[^>]*>/gi) || []).length;
        const h3Count = (html.match(/<h3[^>]*>/gi) || []).length;
        const imageCount = (html.match(/<img[^>]*>/gi) || []).length;
        const linkCount = (html.match(/<a[^>]*>/gi) || []).length;
        
        // Простой подсчет слов (удаляем HTML теги)
        const textContent = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        const wordCount = textContent.split(/\s+/).filter(word => word.length > 0).length;

        return {
          h1Count,
          h2Count,
          h3Count,
          imageCount,
          linkCount,
          wordCount
        };
      };

      return {
        getMetaContent,
        getTitle,
        getCanonical,
        getCharset,
        getViewport,
        getHreflang,
        getStructuredData,
        getAdditionalMeta,
        getContentAnalysis
      };
    };

    const parser = parseHtml(html);

    // Извлекаем мета-данные
    const metadata = {
      // Основные мета-теги
      title: parser.getTitle() || 'No title',
      description: parser.getMetaContent('description') || 'No description',
      keywords: parser.getMetaContent('keywords') || 'No keywords',
      
      // Open Graph
      ogTitle: parser.getMetaContent('og:title', true) || 'No OG title',
      ogDescription: parser.getMetaContent('og:description', true) || 'No OG description',
      ogType: parser.getMetaContent('og:type', true) || 'No OG type',
      ogUrl: parser.getMetaContent('og:url', true) || 'No OG URL',
      ogImage: parser.getMetaContent('og:image', true) || 'No OG image',
      
      // Twitter Cards
      twitterCard: parser.getMetaContent('twitter:card') || 'No Twitter card',
      twitterTitle: parser.getMetaContent('twitter:title') || 'No Twitter title',
      twitterDescription: parser.getMetaContent('twitter:description') || 'No Twitter description',
      twitterImage: parser.getMetaContent('twitter:image') || 'No Twitter image',
      
      // Canonical URL
      canonical: parser.getCanonical() || 'No canonical URL',
      
      // Robots
      robots: parser.getMetaContent('robots') || 'No robots directive',
      
      // Viewport
      viewport: parser.getViewport() || 'No viewport',
      
      // Charset
      charset: parser.getCharset() || 'No charset',
      
      // Hreflang
      hreflang: parser.getHreflang(),
      
      // Structured Data (JSON-LD)
      structuredData: parser.getStructuredData(),
      
      // Дополнительные мета-теги
      additionalMeta: parser.getAdditionalMeta(),
      
      // Анализ контента
      contentAnalysis: parser.getContentAnalysis()
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
