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
  // Используем имя оружия как есть, без нормализации
  // так как файлы могут иметь разные имена
  return `/images/weapons/${name}`;
}

export function getArtifactImage(name: string): string {
  // Используем имя артефакта как есть, без нормализации
  // так как файлы могут иметь разные имена
  return `/images/artifacts/${name}`;
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
  let imageUrl = '';
  
  // Если есть ссылка из базы данных, используем её
  if (originalImage && originalImage.trim() !== '') {
    // Если это полный URL, возвращаем как есть
    if (originalImage.startsWith('http://') || originalImage.startsWith('https://')) {
      imageUrl = originalImage;
    }
    // Если это относительный путь, начинающийся с /, возвращаем как есть
    else if (originalImage.startsWith('/')) {
      imageUrl = originalImage;
    }
    // Если это просто имя файла (без пути), добавляем правильный префикс
    else if (!originalImage.includes('/')) {
      // Для персонажей используем правильную папку
      if (type === 'character') {
        imageUrl = `/images/characters/${originalImage}`;
      } else {
        imageUrl = `/images/${type}s/${originalImage}`;
      }
    }
    // Если это относительный путь без начального /, добавляем префикс
    else {
      if (type === 'character') {
        imageUrl = `/images/characters/${originalImage}`;
      } else {
        imageUrl = `/images/${type}s/${originalImage}`;
      }
    }
  }
  // Если ссылки нет, используем имя для поиска изображения
  else if (name) {
    if (type === 'character') {
      imageUrl = getCharacterImage(name);
    } else if (type === 'weapon') {
      imageUrl = getWeaponImage(name);
    } else if (type === 'artifact') {
      imageUrl = getArtifactImage(name);
    }
  }
  // Иначе возвращаем fallback изображение
  else {
    imageUrl = getFallbackImage(type);
  }
  
  // Убираем добавление timestamp, так как это может вызывать проблемы с загрузкой
  
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