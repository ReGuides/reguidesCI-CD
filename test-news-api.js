// Простой тест для API новостей
const fetch = require('node-fetch');

async function testNewsAPI() {
  console.log('🧪 Тестируем API новостей...\n');

  try {
    // Тест 1: GET /api/news
    console.log('1. Тестируем GET /api/news');
    const response = await fetch('http://localhost:3000/api/news');
    const data = await response.json();
    
    console.log('Статус:', response.status);
    console.log('Успех:', data.success);
    
    if (data.success) {
      console.log('Количество новостей:', data.data?.length || 0);
      console.log('Пагинация:', data.pagination);
    } else {
      console.log('Ошибка:', data.error);
      console.log('Детали:', data.details);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');

    // Тест 2: GET /api/news с параметрами
    console.log('2. Тестируем GET /api/news?limit=5');
    const response2 = await fetch('http://localhost:3000/api/news?limit=5');
    const data2 = await response2.json();
    
    console.log('Статус:', response2.status);
    console.log('Успех:', data2.success);
    
    if (data2.success) {
      console.log('Количество новостей:', data2.data?.length || 0);
    } else {
      console.log('Ошибка:', data2.error);
      console.log('Детали:', data2.details);
    }

  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error.message);
  }
}

// Запускаем тест
testNewsAPI();
