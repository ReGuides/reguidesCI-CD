import { getImageWithFallback } from './imageUtils';

/**
 * Получает правильное изображение для новости
 * Если у новости есть свое изображение - использует его
 * Если нет, но есть characterId - использует изображение персонажа
 * Иначе возвращает null
 */
export function getNewsImage(
  newsImage?: string, 
  characterId?: string, 
  characterName?: string
): string | null {
  // Если у новости есть свое изображение
  if (newsImage) {
    return newsImage;
  }
  
  // Если нет изображения, но есть ID персонажа
  if (characterId && characterName) {
    return getImageWithFallback(undefined, characterName, 'character');
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
