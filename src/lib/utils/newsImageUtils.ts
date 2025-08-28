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
  // Если у новости есть свое изображение
  if (newsImage) {
    return newsImage;
  }
  
  // Если есть изображение персонажа из базы данных
  if (characterImage) {
    return characterImage;
  }
  
  // Если нет изображения, но есть ID персонажа или имя персонажа
  if (characterId || characterName) {
    // Для новостей дня рождения всегда показываем изображение персонажа
    if (characterName) {
      return getImageWithFallback(undefined, characterName, 'character');
    }
  }
  
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
