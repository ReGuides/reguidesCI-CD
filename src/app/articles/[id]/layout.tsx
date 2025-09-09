import { Metadata } from 'next';
import connectDB from '@/lib/mongodb';
import News from '@/models/News';

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    await connectDB();
    
    const article = await News.findById(params.id).lean();
    
    if (!article || article.type !== 'article' || !article.isPublished) {
      return {
        title: 'Статья не найдена | ReGuides',
        description: 'Запрашиваемая статья не найдена или не опубликована.',
      };
    }

    // Извлекаем текст из HTML для описания
    const plainText = article.content.replace(/<[^>]*>/g, '').trim();
    const description = article.excerpt || plainText.substring(0, 160) + (plainText.length > 160 ? '...' : '');
    
    // Создаем SEO-оптимизированный заголовок
    const seoTitle = `${article.title} | ReGuides`;
    
    // Определяем тип контента для Open Graph
    const ogType = 'article';
    
    // Создаем изображение для Open Graph
    const ogImage = article.image || '/images/logos/logo.png';
    
    // Создаем канонический URL
    const canonicalUrl = `https://reguides.ru/articles/${params.id}`;
    
    // Создаем ключевые слова на основе тегов и контента
    const keywords = [
      'Genshin Impact',
      'гайд',
      'статья',
      'новости',
      ...(article.tags || []),
      ...(article.characterName ? [article.characterName] : [])
    ].filter(Boolean).join(', ');

    return {
      title: seoTitle,
      description,
      keywords,
      authors: [{ name: article.author || 'ReGuides' }],
      creator: 'ReGuides',
      publisher: 'ReGuides',
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
      openGraph: {
        type: ogType,
        title: seoTitle,
        description,
        url: canonicalUrl,
        siteName: 'ReGuides',
        locale: 'ru_RU',
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: article.title,
          },
        ],
        publishedTime: article.publishedAt ? new Date(article.publishedAt).toISOString() : undefined,
        modifiedTime: article.updatedAt ? new Date(article.updatedAt).toISOString() : undefined,
        authors: [article.author || 'ReGuides'],
        section: 'Genshin Impact',
        tags: article.tags || [],
      },
      twitter: {
        card: 'summary_large_image',
        title: seoTitle,
        description,
        images: [ogImage],
        creator: '@reguides',
        site: '@reguides',
      },
      alternates: {
        canonical: canonicalUrl,
      },
      other: {
        'article:author': article.author || 'ReGuides',
        'article:section': 'Genshin Impact',
        'article:tag': (article.tags || []).join(','),
        'article:published_time': article.publishedAt ? new Date(article.publishedAt).toISOString() : undefined,
        'article:modified_time': article.updatedAt ? new Date(article.updatedAt).toISOString() : undefined,
      },
    };
  } catch (error) {
    console.error('Error generating metadata for article:', error);
    return {
      title: 'Ошибка загрузки статьи | ReGuides',
      description: 'Произошла ошибка при загрузке статьи.',
    };
  }
}

export default function ArticleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
