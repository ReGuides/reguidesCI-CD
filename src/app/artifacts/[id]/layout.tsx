import { Metadata } from 'next';
import connectDB from '@/lib/mongodb';
import { ArtifactModel } from '@/models/Artifact';

interface ArtifactData {
  name?: string;
  rarity?: number;
  image?: string;
}

async function getArtifact(id: string) {
  try {
    await connectDB();
    const artifact = await ArtifactModel.findOne({ id }).lean();
    return Array.isArray(artifact) ? artifact[0] : artifact;
  } catch (error) {
    console.error('Error fetching artifact:', error);
    return null;
  }
}

// Генерация мета-данных для страницы артефакта
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const artifact = await getArtifact(id);
  
  if (!artifact) {
    return {
      title: 'Артефакт не найден | ReGuides',
      description: 'Запрашиваемый артефакт не найден на сайте ReGuides.',
    };
  }

  const title = `${artifact.name} - Гайд по артефакту | ReGuides`;
  const description = `Подробный гайд по артефакту ${artifact.name} в Genshin Impact. Статистика, бонусы, места получения и рекомендации по персонажам. Редкость: ${artifact.rarity || 'Неизвестно'} звезд.`;
  
  const keywords = [
    artifact.name.toLowerCase(),
    'genshin impact',
    'артефакт',
    'гайд',
    'статистика',
    'бонусы',
    'места получения',
    'рекомендации',
    'персонажи',
    artifact.rarity ? `${artifact.rarity} звезд` : '',
    artifact.rarity ? `${artifact.rarity}⭐` : '',
    'цветок жизни',
    'перо смерти',
    'песочные часы',
    'кубок пространства',
    'корона разума',
    'сет артефактов',
    'комплект',
    'бонус 2 части',
    'бонус 4 части',
    'сборка',
    'билд',
    'каталог',
    'список артефактов',
    'фарм',
    'дроп'
  ].filter(Boolean);

  // Формируем правильный URL изображения
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getArtifactImageUrl = (artifact: any) => {
    if (!artifact?.image) return '/images/logos/logo.png';
    if (artifact.image.startsWith('http')) return artifact.image;
    return artifact.image.startsWith('/') ? artifact.image : `/${artifact.image}`;
  };

  return {
    title,
    description,
    keywords,
    authors: [{ name: 'ReGuides' }],
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
      type: 'website',
      title,
      description,
      url: `https://reguides.ru/artifacts/${id}`,
      siteName: 'ReGuides',
      locale: 'ru_RU',
      images: [
        {
          url: getArtifactImageUrl(artifact),
          width: 1200,
          height: 630,
          alt: `${artifact.name} - Артефакт Genshin Impact`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [getArtifactImageUrl(artifact)],
    },
    alternates: {
      canonical: `/artifacts/${id}`,
    },
  };
}

export default function ArtifactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
