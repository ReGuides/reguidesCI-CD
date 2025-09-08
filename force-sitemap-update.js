// Скрипт для принудительного обновления sitemap
const fs = require('fs');
const path = require('path');

// Удаляем кеш sitemap
const sitemapCachePath = path.join(__dirname, '.next', 'cache', 'sitemap');
if (fs.existsSync(sitemapCachePath)) {
  fs.rmSync(sitemapCachePath, { recursive: true, force: true });
  console.log('✅ Sitemap cache cleared');
}

// Удаляем кеш Next.js
const nextCachePath = path.join(__dirname, '.next');
if (fs.existsSync(nextCachePath)) {
  fs.rmSync(nextCachePath, { recursive: true, force: true });
  console.log('✅ Next.js cache cleared');
}

console.log('🔄 Restart your development server to see changes');
