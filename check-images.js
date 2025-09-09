#!/usr/bin/env node

// Скрипт для проверки доступности изображений персонажей
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://reguides.ru';
const CHARACTERS_DIR = './public/images/characters';

// Функция для проверки URL
function checkUrl(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https:') ? https : http;
    
    const req = client.get(url, (res) => {
      resolve({
        url,
        status: res.statusCode,
        contentType: res.headers['content-type'],
        contentLength: res.headers['content-length'],
        success: res.statusCode === 200
      });
    });
    
    req.on('error', (error) => {
      resolve({
        url,
        status: 0,
        error: error.message,
        success: false
      });
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({
        url,
        status: 0,
        error: 'Timeout',
        success: false
      });
    });
  });
}

// Функция для проверки изображений персонажей
async function checkCharacterImages() {
  console.log('🔍 Проверяем изображения персонажей...\n');
  
  try {
    // Получаем список файлов персонажей
    const files = fs.readdirSync(CHARACTERS_DIR);
    const imageFiles = files.filter(file => 
      file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')
    );
    
    console.log(`📁 Найдено ${imageFiles.length} изображений персонажей\n`);
    
    const results = [];
    
    // Проверяем первые 10 изображений для примера
    const sampleFiles = imageFiles.slice(0, 10);
    
    for (const file of sampleFiles) {
      const characterName = file.replace(/\.(png|jpg|jpeg)$/i, '');
      const url = `${BASE_URL}/images/characters/${file}`;
      
      console.log(`🔍 Проверяем ${characterName}...`);
      const result = await checkUrl(url);
      results.push({ character: characterName, ...result });
      
      if (result.success) {
        console.log(`✅ ${characterName}: OK (${result.contentType}, ${result.contentLength} bytes)`);
      } else {
        console.log(`❌ ${characterName}: FAILED (${result.status} - ${result.error || 'Unknown error'})`);
      }
      
      // Небольшая задержка между запросами
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n📊 Результаты проверки:');
    console.log('='.repeat(50));
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log(`✅ Успешно: ${successful.length}`);
    console.log(`❌ Ошибки: ${failed.length}`);
    
    if (failed.length > 0) {
      console.log('\n❌ Проблемные изображения:');
      failed.forEach(result => {
        console.log(`  - ${result.character}: ${result.url} (${result.status} - ${result.error || 'Unknown error'})`);
      });
    }
    
    // Проверяем конкретно Эскофье
    console.log('\n🎯 Проверяем Эскофье:');
    const escoffierUrl = `${BASE_URL}/images/characters/escoffier.png`;
    const escoffierResult = await checkUrl(escoffierUrl);
    
    if (escoffierResult.success) {
      console.log(`✅ Эскофье: ${escoffierUrl} - OK`);
      console.log(`   Content-Type: ${escoffierResult.contentType}`);
      console.log(`   Content-Length: ${escoffierResult.contentLength} bytes`);
    } else {
      console.log(`❌ Эскофье: ${escoffierUrl} - FAILED`);
      console.log(`   Status: ${escoffierResult.status}`);
      console.log(`   Error: ${escoffierResult.error}`);
    }
    
  } catch (error) {
    console.error('❌ Ошибка при проверке изображений:', error.message);
  }
}

// Запускаем проверку
checkCharacterImages();
