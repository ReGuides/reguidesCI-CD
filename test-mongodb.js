// Простой тест подключения к MongoDB
const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://localhost:27017/reguides';

async function testConnection() {
  try {
    console.log('🔌 Подключение к MongoDB...');
    console.log('URI:', MONGODB_URI);
    
    await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 30000,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      heartbeatFrequencyMS: 10000,
      retryWrites: true,
      retryReads: true,
    });
    
    console.log('✅ MongoDB подключена успешно!');
    
    // Проверяем коллекции
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📋 Коллекции в базе:');
    collections.forEach(col => {
      console.log(`  - ${col.name}`);
    });
    
    // Проверяем коллекцию News
    const News = mongoose.model('News', new mongoose.Schema({}, { strict: false }));
    const newsCount = await News.countDocuments();
    console.log(`📰 Новостей в базе: ${newsCount}`);
    
    await mongoose.disconnect();
    console.log('🔌 Отключение от MongoDB');
    
  } catch (error) {
    console.error('❌ Ошибка подключения к MongoDB:');
    console.error('Сообщение:', error.message);
    console.error('Код:', error.code);
    console.error('Имя:', error.name);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Решение:');
      console.log('1. Убедитесь, что MongoDB запущена локально');
      console.log('2. Проверьте, что MongoDB слушает на порту 27017');
      console.log('3. Запустите MongoDB: mongod');
    }
  }
}

testConnection();
