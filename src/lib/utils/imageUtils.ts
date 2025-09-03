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
  console.log('🔧 getImageWithFallback DEBUG:', { originalImage, name, type });
  
  let imageUrl = '';
  
  // Если есть ссылка из базы данных, используем её
  if (originalImage && originalImage.trim() !== '') {
    // Если это полный URL, возвращаем как есть
    if (originalImage.startsWith('http://') || originalImage.startsWith('https://')) {
      console.log('🌐 Using full URL:', originalImage);
      imageUrl = originalImage;
    }
    // Если это относительный путь, начинающийся с /, возвращаем как есть
    else if (originalImage.startsWith('/')) {
      console.log('📁 Using absolute path:', originalImage);
      imageUrl = originalImage;
    }
    // Если это просто имя файла (без пути), добавляем правильный префикс
    else if (!originalImage.includes('/')) {
      // Для персонажей используем правильную папку
      if (type === 'character') {
        imageUrl = `/images/characters/${originalImage}`;
        console.log('👤 Using character filename with prefix:', imageUrl);
      } else {
        imageUrl = `/images/${type}s/${originalImage}`;
        console.log('📦 Using filename with prefix:', imageUrl);
      }
    }
    // Если это относительный путь без начального /, добавляем префикс
    else {
      if (type === 'character') {
        imageUrl = `/images/characters/${originalImage}`;
        console.log('👤 Using character relative path with prefix:', imageUrl);
      } else {
        imageUrl = `/images/${type}s/${originalImage}`;
        console.log('📦 Using relative path with prefix:', imageUrl);
      }
    }
  }
  // Если ссылки нет, используем имя для поиска изображения
  else if (name) {
    if (type === 'character') {
      imageUrl = getCharacterImage(name);
      console.log('🔄 Using character name fallback:', imageUrl);
    } else if (type === 'weapon') {
      imageUrl = getWeaponImage(name);
      console.log('🔄 Using weapon name fallback:', imageUrl);
    } else if (type === 'artifact') {
      imageUrl = getArtifactImage(name);
      console.log('🔄 Using artifact name fallback:', imageUrl);
    }
  }
  // Иначе возвращаем fallback изображение
  else {
    imageUrl = getFallbackImage(type);
    console.log('🆘 Using default fallback:', imageUrl);
  }
  
  // Добавляем timestamp для предотвращения кэширования (только для локальных изображений)
  if (imageUrl.startsWith('/') && !imageUrl.startsWith('//')) {
    const timestamp = Date.now();
    const separator = imageUrl.includes('?') ? '&' : '?';
    imageUrl = `${imageUrl}${separator}v=${timestamp}`;
    console.log('🕒 Added cache-busting timestamp:', imageUrl);
  }
  
  return imageUrl;
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