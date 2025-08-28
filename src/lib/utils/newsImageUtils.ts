import { getImageWithFallback } from './imageUtils';

/**
 * Получает правильное изображение для новости
 * Если у новости есть свое изображение - использует его
 * Если нет, но есть characterImage - использует изображение персонажа
 * Если нет, но есть characterId или characterName - использует fallback изображение персонажа
 * Иначе возвращает null
 */
export function getNewsImage(
  newsImage?: string, 
  characterId?: string, 
  characterName?: string,
  characterImage?: string
): string | null {
  console.log('🔍 getNewsImage DEBUG:', { newsImage, characterId, characterName, characterImage });
  
  // Если у новости есть свое изображение
  if (newsImage) {
    console.log('✅ Using news image:', newsImage);
    return newsImage;
  }
  
  // Если есть изображение персонажа из базы данных
  if (characterImage) {
    console.log('✅ Using character image from DB:', characterImage);
    // Если characterImage содержит только имя файла, добавляем путь
    if (characterImage && !characterImage.startsWith('/') && !characterImage.startsWith('http')) {
      const fullPath = `/images/characters/${characterImage}`;
      console.log('🔧 Converting character image to full path:', characterImage, '->', fullPath);
      return fullPath;
    }
    return characterImage;
  }
  
  // Если нет изображения, но есть ID персонажа или имя персонажа
  if (characterId || characterName) {
    // Для новостей дня рождения всегда показываем изображение персонажа
    if (characterName) {
      const fallbackImage = getImageWithFallback(undefined, characterName, 'character');
      console.log('🔄 Using fallback for character:', characterName, '->', fallbackImage);
      return fallbackImage;
    }
  }
  
  console.log('❌ No image found, returning null');
  return null;
}

/**
 * Проверяет, является ли изображение изображением персонажа
 */
export function isCharacterImage(imageUrl: string): boolean {
  return imageUrl.includes('/characters/') || imageUrl.includes('characters/');
}

/**
 * Получает alt текст для изображения новости
 */
export function getNewsImageAlt(
  newsTitle: string, 
  characterName?: string
): string {
  if (characterName) {
    return `${newsTitle} - ${characterName}`;
  }
  return newsTitle;
}
