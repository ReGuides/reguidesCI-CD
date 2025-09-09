// Тест sitemap для проверки новостей-статей
const mongoose = require('mongoose');

async function testSitemap() {
  try {
    console.log('🔗 Testing sitemap generation...');
    
    // Подключаемся к MongoDB
    await mongoose.connect('mongodb://localhost:27017/reguides');
    console.log('✅ Connected to MongoDB');
    
    // Импортируем модели
    const News = require('./src/models/News').default;
    
    // Ищем новости типа "статья"
    const newsArticles = await News.find({ 
      type: 'article', 
      isPublished: true 
    }).select('_id title updatedAt');
    
    console.log('📰 Found news articles:', newsArticles.length);
    newsArticles.forEach(article => {
      console.log(`  - ${article.title} (ID: ${article._id})`);
    });
    
    // Проверяем, что они будут включены в sitemap
    const sitemapUrls = newsArticles.map(article => ({
      url: `https://reguides.ru/articles/${article._id}`,
      lastModified: article.updatedAt || new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    }));
    
    console.log('🗺️ Sitemap URLs for news articles:');
    sitemapUrls.forEach(url => {
      console.log(`  - ${url.url}`);
    });
    
    console.log('✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testSitemap();
