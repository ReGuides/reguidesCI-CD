// Утилиты для работы с изображениями

export function getCharacterImage(name: string): string {
  if (!name) {
    return getFallbackImage('character');
  }
  
  // Нормализуем имя персонажа для поиска файла
  const normalizedName = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const result = `/images/characters/${normalizedName}.png`;
  
  return result;
}

export function getWeaponImage(name: string): string {
  // Нормализуем имя оружия для поиска файла
  const normalizedName = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  
  // Попробуем найти изображение по нормализованному имени
  return `/images/weapons/${normalizedName}.webp`;
}

export function getArtifactImage(name: string): string {
  // Нормализуем имя артефакта для поиска файла
  const normalizedName = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  
  // Попробуем найти изображение по нормализованному имени
  return `/images/artifacts/${normalizedName}.webp`;
}

export function getAvatarImage(name: string): string {
  // Нормализуем имя для поиска аватара
  const normalizedName = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
  
  return `/images/avatars/${normalizedName}.png`;
}

// Функция для проверки существования изображения
export async function imageExists(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

// Функция для получения fallback изображения
export function getFallbackImage(type: 'character' | 'weapon' | 'artifact' | 'avatar'): string {
  switch (type) {
    case 'character':
      return '/images/characters/default.png';
    case 'weapon':
      return '/images/weapons/default.png';
    case 'artifact':
      return '/images/artifacts/default.webp';
    case 'avatar':
      return '/images/avatars/default.png';
    default:
      return '/images/logos/default.png';
  }
}

// Функция для оптимизации изображений
export function optimizeImageUrl(url: string): string {
  // В будущем можно добавить CDN или сервис оптимизации изображений
  return url;
}

// Функция для получения изображения с fallback
export function getImageWithFallback(
  originalImage: string | undefined,
  name: string,
  type: 'character' | 'weapon' | 'artifact'
): string {
  // Если есть ссылка из базы данных, используем её
  if (originalImage && originalImage.trim() !== '') {
    // Если это полный URL, возвращаем как есть
    if (originalImage.startsWith('http://') || originalImage.startsWith('https://')) {
      return originalImage;
    }
    // Если это относительный путь, начинающийся с /, возвращаем как есть
    if (originalImage.startsWith('/')) {
      return originalImage;
    }
    // Если это просто имя файла (без пути), добавляем правильный префикс
    if (!originalImage.includes('/')) {
      // Для персонажей используем правильную папку
      if (type === 'character') {
        return `/images/characters/${originalImage}`;
      }
      return `/images/${type}s/${originalImage}`;
    }
    // Если это относительный путь без начального /, добавляем префикс
    if (type === 'character') {
      return `/images/characters/${originalImage}`;
    }
    return `/images/${type}s/${originalImage}`;
  }
  
  // Если ссылки нет, используем имя персонажа для поиска изображения
  if (name && type === 'character') {
    return getCharacterImage(name);
  }
  
  // Иначе возвращаем fallback изображение
  return getFallbackImage(type);
}

// Функция для проверки существования изображения
export function getSafeImageUrl(
  originalImage: string | undefined,
  name: string,
  type: 'character' | 'weapon' | 'artifact'
): string {
  const imageUrl = getImageWithFallback(originalImage, name, type);
  
  // Проверяем, не является ли это проблемным изображением
  if (imageUrl.includes('waster-greatsword.webp')) {
    return getFallbackImage(type);
  }
  
  return imageUrl;
} 