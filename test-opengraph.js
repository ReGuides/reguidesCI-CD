#!/usr/bin/env node

// Скрипт для тестирования Open Graph мета-данных
const https = require('https');
const http = require('http');

function testOpenGraph(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https:') ? https : http;
    
    const req = client.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        // Парсим HTML для извлечения мета-тегов
        const metaTags = {};
        
        // Ищем title
        const titleMatch = data.match(/<title[^>]*>([^<]*)<\/title>/i);
        if (titleMatch) {
          metaTags.title = titleMatch[1];
        }
        
        // Ищем meta description
        const descMatch = data.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i);
        if (descMatch) {
          metaTags.description = descMatch[1];
        }
        
        // Ищем Open Graph теги
        const ogTitleMatch = data.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)"[^>]*>/i);
        if (ogTitleMatch) {
          metaTags.ogTitle = ogTitleMatch[1];
        }
        
        const ogDescMatch = data.match(/<meta[^>]*property="og:description"[^>]*content="([^"]*)"[^>]*>/i);
        if (ogDescMatch) {
          metaTags.ogDescription = ogDescMatch[1];
        }
        
        const ogImageMatch = data.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"[^>]*>/i);
        if (ogImageMatch) {
          metaTags.ogImage = ogImageMatch[1];
        }
        
        const ogTypeMatch = data.match(/<meta[^>]*property="og:type"[^>]*content="([^"]*)"[^>]*>/i);
        if (ogTypeMatch) {
          metaTags.ogType = ogTypeMatch[1];
        }
        
        // Ищем Twitter Card теги
        const twitterCardMatch = data.match(/<meta[^>]*name="twitter:card"[^>]*content="([^"]*)"[^>]*>/i);
        if (twitterCardMatch) {
          metaTags.twitterCard = twitterCardMatch[1];
        }
        
        const twitterImageMatch = data.match(/<meta[^>]*name="twitter:image"[^>]*content="([^"]*)"[^>]*>/i);
        if (twitterImageMatch) {
          metaTags.twitterImage = twitterImageMatch[1];
        }
        
        resolve({
          url,
          status: res.statusCode,
          metaTags
        });
      });
    });
    
    req.on('error', (error) => {
      resolve({
        url,
        status: 0,
        error: error.message,
        metaTags: {}
      });
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        url,
        status: 0,
        error: 'Timeout',
        metaTags: {}
      });
    });
  });
}

async function testCharacterPage() {
  console.log('🔍 Тестируем Open Graph мета-данные для страницы персонажа...\n');
  
  const testUrl = 'https://reguides.ru/characters/escoffier';
  
  try {
    const result = await testOpenGraph(testUrl);
    
    console.log(`📊 Результат для ${testUrl}:`);
    console.log(`Status: ${result.status}`);
    
    if (result.error) {
      console.log(`❌ Ошибка: ${result.error}`);
      return;
    }
    
    console.log('\n📋 Мета-теги:');
    console.log('='.repeat(50));
    
    if (result.metaTags.title) {
      console.log(`✅ Title: ${result.metaTags.title}`);
    } else {
      console.log('❌ Title: не найден');
    }
    
    if (result.metaTags.description) {
      console.log(`✅ Description: ${result.metaTags.description}`);
    } else {
      console.log('❌ Description: не найден');
    }
    
    console.log('\n🔗 Open Graph:');
    if (result.metaTags.ogTitle) {
      console.log(`✅ OG Title: ${result.metaTags.ogTitle}`);
    } else {
      console.log('❌ OG Title: не найден');
    }
    
    if (result.metaTags.ogDescription) {
      console.log(`✅ OG Description: ${result.metaTags.ogDescription}`);
    } else {
      console.log('❌ OG Description: не найден');
    }
    
    if (result.metaTags.ogImage) {
      console.log(`✅ OG Image: ${result.metaTags.ogImage}`);
      
      // Проверяем доступность изображения
      console.log('\n🖼️  Проверяем изображение...');
      const imageResult = await testOpenGraph(result.metaTags.ogImage);
      if (imageResult.status === 200) {
        console.log(`✅ Изображение доступно (${imageResult.status})`);
      } else {
        console.log(`❌ Изображение недоступно (${imageResult.status} - ${imageResult.error || 'Unknown error'})`);
      }
    } else {
      console.log('❌ OG Image: не найден');
    }
    
    if (result.metaTags.ogType) {
      console.log(`✅ OG Type: ${result.metaTags.ogType}`);
    } else {
      console.log('❌ OG Type: не найден');
    }
    
    console.log('\n🐦 Twitter Cards:');
    if (result.metaTags.twitterCard) {
      console.log(`✅ Twitter Card: ${result.metaTags.twitterCard}`);
    } else {
      console.log('❌ Twitter Card: не найден');
    }
    
    if (result.metaTags.twitterImage) {
      console.log(`✅ Twitter Image: ${result.metaTags.twitterImage}`);
    } else {
      console.log('❌ Twitter Image: не найден');
    }
    
  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error.message);
  }
}

// Запускаем тест
testCharacterPage();
