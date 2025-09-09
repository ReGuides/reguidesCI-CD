import type { Metadata } from 'next';

// Функция для получения данных персонажа на сервере
async function getCharacter(id: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/characters/${id}`, {
      cache: 'no-store' // Всегда получаем свежие данные
    });
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching character:', error);
    return null;
  }
}

// Генерация мета-данных для страницы персонажа
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const character = await getCharacter(id);
  
  if (!character) {
    return {
      title: 'Персонаж не найден | ReGuides',
      description: 'Запрашиваемый персонаж не найден на сайте ReGuides.',
    };
  }

  const title = `${character.name} - Гайд по персонажу | ReGuides`;
  const description = `Подробный гайд по персонажу ${character.name} в Genshin Impact. Рекомендации по оружию, артефактам, талантам и сборкам. Элемент: ${character.element || 'Неизвестно'}, Оружие: ${character.weaponType || 'Неизвестно'}.`;
  
  const keywords = [
    character.name.toLowerCase(),
    'genshin impact',
    'персонаж',
    'гайд',
    'сборка',
    'билд',
    character.element?.toLowerCase() || '',
    character.weaponType?.toLowerCase() || '',
    'оружие',
    'артефакты',
    'таланты',
    'констелляции',
    'команды',
    'рекомендации'
  ].filter(Boolean);

  // Формируем правильный URL изображения
  const getCharacterImageUrl = (character: { image?: string }) => {
    if (character.image) {
      // Если изображение уже содержит полный путь
      if (character.image.startsWith('http')) {
        return character.image;
      }
      // Если изображение содержит только имя файла
      if (character.image.includes('.')) {
        return `https://reguides.ru/images/characters/${character.image}`;
      }
      // Если изображение содержит только имя персонажа
      return `https://reguides.ru/images/characters/${character.image}.png`;
    }
    // Fallback на логотип
    return 'https://reguides.ru/images/logos/logo.png';
  };

  const characterImageUrl = getCharacterImageUrl(character);

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `https://reguides.ru/characters/${id}`,
      images: [
        {
          url: characterImageUrl,
          width: 1200,
          height: 630,
          alt: `${character.name} - Гайд по персонажу Genshin Impact`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [characterImageUrl],
    },
    alternates: {
      canonical: `/characters/${id}`,
    },
  };
}

export default function CharacterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}