// Утилиты для размеров изображений Open Graph

export interface ImageDimensions {
  width: number;
  height: number;
}

// Стандартные размеры для Open Graph
export const OPENGRAPH_SIZES = {
  // Стандартный размер (1.91:1) - лучше для ландшафтных изображений
  STANDARD: { width: 1200, height: 630 },
  // Портретный размер (5:7) - лучше для персонажей
  PORTRAIT: { width: 800, height: 1120 },
  // Квадратный размер (1:1) - для аватаров
  SQUARE: { width: 1200, height: 1200 },
  // Широкий размер (16:9) - для видео/баннеров
  WIDE: { width: 1920, height: 1080 }
} as const;

// Функция для получения размеров в зависимости от типа контента
export function getImageDimensions(contentType: 'character' | 'weapon' | 'artifact' | 'article' | 'default'): ImageDimensions {
  switch (contentType) {
    case 'character':
      return OPENGRAPH_SIZES.PORTRAIT; // 5:7 для персонажей
    case 'weapon':
      return OPENGRAPH_SIZES.STANDARD; // 1.91:1 для оружия
    case 'artifact':
      return OPENGRAPH_SIZES.STANDARD; // 1.91:1 для артефактов
    case 'article':
      return OPENGRAPH_SIZES.STANDARD; // 1.91:1 для статей
    default:
      return OPENGRAPH_SIZES.STANDARD; // 1.91:1 по умолчанию
  }
}

// Функция для проверки, нужно ли обрезать изображение
export function shouldCropImage(originalWidth: number, originalHeight: number, targetWidth: number, targetHeight: number): boolean {
  const originalRatio = originalWidth / originalHeight;
  const targetRatio = targetWidth / targetHeight;
  
  // Если разница в пропорциях больше 10%, нужно обрезать
  return Math.abs(originalRatio - targetRatio) > 0.1;
}

// Функция для получения CSS стилей для обрезки изображения
export function getCropStyles(targetWidth: number, targetHeight: number): string {
  return `width: ${targetWidth}px; height: ${targetHeight}px; object-fit: cover; object-position: center;`;
}
