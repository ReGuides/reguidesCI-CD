// Простой тест для проверки API рекомендаций
const testAPI = async () => {
  try {
    console.log('Testing API for character: chevreuse');
    const response = await fetch('http://localhost:3000/api/recommendations/chevreuse');
    
    if (response.ok) {
      const data = await response.json();
      console.log('API Response:', JSON.stringify(data, null, 2));
      
      if (data.mainStats?.detailedStats) {
        console.log('✅ Detailed stats found:', data.mainStats.detailedStats.length);
        data.mainStats.detailedStats.forEach((stat, idx) => {
          console.log(`Stat ${idx + 1}:`, {
            stat: stat.stat,
            targetValue: stat.targetValue,
            unit: stat.unit,
            description: stat.description
          });
        });
      } else {
        console.log('❌ No detailed stats found');
      }
      
      if (data.subStats) {
        console.log('✅ Sub stats found:', data.subStats.length);
      }
      
      if (data.talentPriorities) {
        console.log('✅ Talent priorities found:', data.talentPriorities.length);
      }
    } else {
      console.error('❌ API request failed:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('❌ Error testing API:', error);
  }
};

// Запускаем тест
testAPI(); 