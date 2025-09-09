// Тест улучшенной системы аналитики
const mongoose = require('mongoose');

async function testAnalyticsImproved() {
  try {
    console.log('🔗 Testing improved analytics system...');
    
    // Подключаемся к MongoDB
    await mongoose.connect('mongodb://localhost:27017/reguides');
    console.log('✅ Connected to MongoDB');
    
    // Импортируем модели
    const Analytics = require('./src/models/Analytics').default;
    const UserSession = require('./src/models/UserSession').default;
    
    // 1. Проверяем текущие данные
    const totalAnalytics = await Analytics.countDocuments({});
    const totalSessions = await UserSession.countDocuments({});
    
    console.log('📊 Current data:');
    console.log(`  - Analytics records: ${totalAnalytics}`);
    console.log(`  - User sessions: ${totalSessions}`);
    
    // 2. Тестируем API сброса
    console.log('\n🔄 Testing reset API...');
    
    const resetResponse = await fetch('http://localhost:3000/api/analytics/reset', {
      method: 'GET'
    });
    const resetData = await resetResponse.json();
    
    if (resetData.success) {
      console.log('✅ Reset preview loaded:');
      console.log(`  - Total records: ${resetData.data.totalRecords}`);
      console.log(`  - Old records: ${resetData.data.oldRecords}`);
      console.log(`  - Test records: ${resetData.data.testRecords}`);
      console.log(`  - Recent records: ${resetData.data.recentRecords}`);
    } else {
      console.log('❌ Reset preview failed:', resetData.error);
    }
    
    // 3. Тестируем улучшенную статистику
    console.log('\n📈 Testing improved stats API...');
    
    const statsResponse = await fetch('http://localhost:3000/api/analytics/stats-improved?period=7d');
    const statsData = await statsResponse.json();
    
    if (statsData.success) {
      console.log('✅ Improved stats loaded:');
      console.log(`  - Total page views: ${statsData.data.total.totalPageViews}`);
      console.log(`  - Unique visitors: ${statsData.data.total.uniqueVisitors}`);
      console.log(`  - Total sessions: ${statsData.data.sessions.totalSessions}`);
      console.log(`  - New sessions: ${statsData.data.sessions.newSessions}`);
      console.log(`  - Returning sessions: ${statsData.data.sessions.returningSessions}`);
      console.log(`  - Engaged sessions: ${statsData.data.sessions.engagedSessions}`);
    } else {
      console.log('❌ Improved stats failed:', statsData.error);
    }
    
    // 4. Тестируем улучшенное отслеживание
    console.log('\n🎯 Testing improved tracking...');
    
    const testSessionId = 'test-session-' + Date.now();
    const trackData = {
      anonymousSessionId: testSessionId,
      page: '/test-page',
      pageType: 'other',
      pageId: 'test-123',
      deviceCategory: 'desktop',
      screenSize: 'large',
      region: 'europe',
      visitDate: new Date().toISOString().split('T')[0],
      visitHour: new Date().getHours(),
      visitDayOfWeek: new Date().getDay() + 1,
      timeOnPage: 45,
      scrollDepth: 75,
      clicks: 3,
      loadTime: 1200,
      isBounce: false
    };
    
    const trackResponse = await fetch('http://localhost:3000/api/analytics/track-improved', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(trackData)
    });
    
    const trackResult = await trackResponse.json();
    
    if (trackResult.success) {
      console.log('✅ Improved tracking successful:', trackResult.message);
      console.log(`  - Is new session: ${trackResult.isNewSession}`);
    } else {
      console.log('❌ Improved tracking failed:', trackResult.error);
    }
    
    // 5. Проверяем созданную сессию
    const createdSession = await UserSession.findOne({ sessionId: testSessionId });
    if (createdSession) {
      console.log('✅ User session created:');
      console.log(`  - Session ID: ${createdSession.sessionId}`);
      console.log(`  - First visit: ${createdSession.firstVisit}`);
      console.log(`  - Visit count: ${createdSession.visitCount}`);
      console.log(`  - Page views: ${createdSession.pageViews}`);
      console.log(`  - Is returning: ${createdSession.isReturning}`);
      console.log(`  - Is engaged: ${createdSession.isEngaged}`);
    } else {
      console.log('❌ User session not created');
    }
    
    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testAnalyticsImproved();
