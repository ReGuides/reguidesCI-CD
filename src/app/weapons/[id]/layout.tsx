import { Metadata } from 'next';
import connectDB from '@/lib/mongodb';
import { WeaponModel } from '@/models/Weapon';


async function getWeapon(id: string) {
  try {
    await connectDB();
    const weapon = await WeaponModel.findOne({ id }).lean();
    return Array.isArray(weapon) ? weapon[0] : weapon;
  } catch (error) {
    console.error('Error fetching weapon:', error);
    return null;
  }
}

// Генерация мета-данных для страницы оружия
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const weapon = await getWeapon(id);
  
  if (!weapon) {
    return {
      title: 'Оружие не найдено | ReGuides',
      description: 'Запрашиваемое оружие не найдено на сайте ReGuides.',
    };
  }

  const title = `${weapon.name} - Гайд по оружию | ReGuides`;
  const description = `Подробный гайд по оружию ${weapon.name} в Genshin Impact. Статистика, пассивные способности, материалы для улучшения и рекомендации по персонажам. Тип: ${weapon.type || 'Неизвестно'}, Редкость: ${weapon.rarity || 'Неизвестно'} звезд.`;
  
  const keywords = [
    weapon.name.toLowerCase(),
    'genshin impact',
    'оружие',
    'гайд',
    'статистика',
    'пассивные способности',
    'материалы',
    'улучшение',
    'рекомендации',
    'персонажи',
    weapon.type?.toLowerCase() || '',
    weapon.rarity ? `${weapon.rarity} звезд` : '',
    weapon.rarity ? `${weapon.rarity}⭐` : '',
    'базовая атака',
    'дополнительная характеристика',
    'эффект',
    'сборка',
    'билд',
    'каталог',
    'список оружия'
  ].filter(Boolean);

  // Формируем правильный URL изображения
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getWeaponImageUrl = (weapon: any) => {
    if (!weapon?.image) return '/images/logos/logo.png';
    if (weapon.image.startsWith('http')) return weapon.image;
    return weapon.image.startsWith('/') ? weapon.image : `/${weapon.image}`;
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
      url: `https://reguides.ru/weapons/${id}`,
      siteName: 'ReGuides',
      locale: 'ru_RU',
      images: [
        {
          url: getWeaponImageUrl(weapon),
          width: 1200,
          height: 630,
          alt: `${weapon.name} - Оружие Genshin Impact`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [getWeaponImageUrl(weapon)],
    },
    alternates: {
      canonical: `/weapons/${id}`,
    },
  };
}

export default function WeaponLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
