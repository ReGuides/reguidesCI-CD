// Скрипт для проверки лимитов загрузки файлов
const fs = require('fs');
const path = require('path');

console.log('🔍 Проверка лимитов загрузки файлов...\n');

// Проверяем размер файлов в папке public/images
const checkImageSizes = (dir) => {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  let totalSize = 0;
  let fileCount = 0;
  let largeFiles = [];

  files.forEach(file => {
    if (file.isFile()) {
      const filePath = path.join(dir, file.name);
      const stats = fs.statSync(filePath);
      const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
      
      totalSize += stats.size;
      fileCount++;
      
      if (stats.size > 10 * 1024 * 1024) { // > 10MB
        largeFiles.push({
          name: file.name,
          size: sizeInMB + ' MB'
        });
      }
    } else if (file.isDirectory()) {
      const subDir = path.join(dir, file.name);
      const subResult = checkImageSizes(subDir);
      totalSize += subResult.totalSize;
      fileCount += subResult.fileCount;
      largeFiles.push(...subResult.largeFiles);
    }
  });

  return { totalSize, fileCount, largeFiles };
};

const imagesDir = path.join(__dirname, 'public', 'images');
if (fs.existsSync(imagesDir)) {
  const result = checkImageSizes(imagesDir);
  const totalSizeInMB = (result.totalSize / (1024 * 1024)).toFixed(2);
  
  console.log(`📊 Статистика изображений:`);
  console.log(`   Всего файлов: ${result.fileCount}`);
  console.log(`   Общий размер: ${totalSizeInMB} MB`);
  
  if (result.largeFiles.length > 0) {
    console.log(`\n⚠️  Большие файлы (>10MB):`);
    result.largeFiles.forEach(file => {
      console.log(`   - ${file.name}: ${file.size}`);
    });
  } else {
    console.log(`\n✅ Все файлы меньше 10MB`);
  }
} else {
  console.log('❌ Папка public/images не найдена');
}

console.log('\n🔧 Рекомендации:');
console.log('1. Сжимайте изображения перед загрузкой');
console.log('2. Используйте WebP формат для лучшего сжатия');
console.log('3. Оптимизируйте изображения для веб-использования');
console.log('4. Максимальный размер файла: 10MB');
