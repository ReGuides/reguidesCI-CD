// Скрипт для проверки данных в БД
import mongoose from 'mongoose';
import connectDB from './src/lib/mongodb.js';

const checkDB = async () => {
  try {
    await connectDB();
    console.log('Connected to database');

    // Проверяем коллекцию characterstats
    const characterStatsCollection = mongoose.connection.db.collection('characterstats');
    const chevreuseStats = await characterStatsCollection.findOne({ characterId: 'chevreuse' });
    
    console.log('Chevreuse stats found:', !!chevreuseStats);
    if (chevreuseStats) {
      console.log('Main stats count:', chevreuseStats.mainStats?.length || 0);
      console.log('Sub stats count:', chevreuseStats.subStats?.length || 0);
      console.log('Talent priorities count:', chevreuseStats.talentPriorities?.length || 0);
      
      if (chevreuseStats.mainStats) {
        console.log('\nMain stats details:');
        chevreuseStats.mainStats.forEach((stat, idx) => {
          console.log(`Stat ${idx + 1}:`, {
            stat: stat.stat,
            targetValue: stat.targetValue,
            unit: stat.unit,
            description: stat.description,
            artifactType: stat.artifactType
          });
        });
      }
      
      if (chevreuseStats.subStats) {
        console.log('\nSub stats:', chevreuseStats.subStats);
      }
      
      if (chevreuseStats.talentPriorities) {
        console.log('\nTalent priorities:');
        chevreuseStats.talentPriorities.forEach((talent, idx) => {
          console.log(`Talent ${idx + 1}:`, {
            talentName: talent.talentName,
            priority: talent.priority,
            description: talent.description
          });
        });
      }
    } else {
      console.log('No stats found for Chevreuse');
    }

    // Проверяем коллекцию characters
    const charactersCollection = mongoose.connection.db.collection('characters');
    const chevreuse = await charactersCollection.findOne({ id: 'chevreuse' });
    
    console.log('\nChevreuse character found:', !!chevreuse);
    if (chevreuse) {
      console.log('Character name:', chevreuse.name);
      console.log('Character element:', chevreuse.element);
    }

    // Проверяем коллекцию recommendations
    const recommendationsCollection = mongoose.connection.db.collection('recommendations');
    const chevreuseRecommendations = await recommendationsCollection.findOne({ characterId: 'chevreuse' });
    
    console.log('\nChevreuse recommendations found:', !!chevreuseRecommendations);
    if (chevreuseRecommendations) {
      console.log('Weapons count:', chevreuseRecommendations.weapons?.length || 0);
      console.log('Artifacts count:', chevreuseRecommendations.artifacts?.length || 0);
    }

  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    await mongoose.disconnect();
  }
};

checkDB(); 