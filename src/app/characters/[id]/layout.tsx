import type { Metadata } from 'next';
import { Character } from '@/types';

// Генерируем мета-данные для SEO
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/characters/${id}`, {
      cache: 'no-store' // Всегда получаем свежие данные
    });
    
    if (!response.ok) {
      return {
        title: 'Персонаж не найден | ReGuides',
        description: 'Персонаж не найден в базе данных ReGuides.',
      };
    }
    
    const character: Character = await response.json();
    
    const characterName = character.name || 'Неизвестный персонаж';
    const characterElement = character.element || 'Неизвестный элемент';
    const characterWeapon = typeof character.weapon === 'string' ? character.weapon : character.weapon?.name || 'Неизвестное оружие';
    
    const title = `${characterName} - Гайд по персонажу | ReGuides`;
    const description = `Подробный гайд по персонажу ${characterName} в Genshin Impact. Рекомендации по оружию, артефактам, талантам и сборкам. Элемент: ${characterElement}, Оружие: ${characterWeapon}.`;
    
    return {
      title,
      description,
      keywords: [
        characterName,
        'genshin impact',
        'гайд',
        'персонаж',
        characterElement,
        characterWeapon,
        'сборка',
        'рекомендации',
        'таланты',
        'созвездия'
      ],
      openGraph: {
        title,
        description,
        type: 'article',
        url: `https://reguides.ru/characters/${id}`,
        images: [
          {
            url: character.image || '/images/logos/logo.png',
            width: 1200,
            height: 630,
            alt: `${characterName} - Genshin Impact`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [character.image || '/images/logos/logo.png'],
      },
      alternates: {
        canonical: `/characters/${id}`,
      },
      other: {
        'article:author': 'ReGuides',
        'article:section': 'Genshin Impact',
        'article:tag': [characterElement, characterWeapon].join(', '),
      },
    };
  } catch (error) {
    console.error('Error generating metadata for character:', error);
    return {
      title: 'Ошибка загрузки | ReGuides',
      description: 'Произошла ошибка при загрузке информации о персонаже.',
    };
  }
}

export default function CharacterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}