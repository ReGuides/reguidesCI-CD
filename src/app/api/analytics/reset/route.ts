import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Analytics from '@/models/Analytics';
import { addServerLog } from '@/lib/serverLog';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { 
      confirmReset, 
      resetType = 'all', // 'all', 'old', 'test'
      daysToKeep = 30 
    } = body;

    // Проверяем подтверждение
    if (!confirmReset) {
      return NextResponse.json({ 
        success: false, 
        error: 'Reset confirmation required' 
      }, { status: 400 });
    }

    let deletedCount = 0;
    let message = '';

    switch (resetType) {
      case 'all':
        // Удаляем все данные аналитики
        const allResult = await Analytics.deleteMany({});
        deletedCount = allResult.deletedCount;
        message = `All analytics data deleted (${deletedCount} records)`;
        break;

      case 'old':
        // Удаляем старые данные (старше указанного количества дней)
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
        const oldResult = await Analytics.deleteMany({
          createdAt: { $lt: cutoffDate }
        });
        deletedCount = oldResult.deletedCount;
        message = `Old analytics data deleted (${deletedCount} records older than ${daysToKeep} days)`;
        break;

      case 'test':
        // Удаляем тестовые данные (с определенными паттернами)
        const testResult = await Analytics.deleteMany({
          $or: [
            { page: { $regex: /test/i } },
            { page: { $regex: /localhost/i } },
            { anonymousSessionId: { $regex: /test/i } }
          ]
        });
        deletedCount = testResult.deletedCount;
        message = `Test analytics data deleted (${deletedCount} records)`;
        break;

      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid reset type' 
        }, { status: 400 });
    }

    addServerLog('info', 'analytics-reset', 'Analytics data reset', { 
      resetType, 
      deletedCount, 
      daysToKeep 
    });

    return NextResponse.json({ 
      success: true, 
      message,
      deletedCount
    });

  } catch (error) {
    console.error('Analytics reset error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    addServerLog('error', 'analytics-reset', 'Error resetting analytics data', { error: errorMessage });
    
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    
    // Получаем статистику для предварительного просмотра
    const totalRecords = await Analytics.countDocuments({});
    
    const oldRecords = await Analytics.countDocuments({
      createdAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });
    
    const testRecords = await Analytics.countDocuments({
      $or: [
        { page: { $regex: /test/i } },
        { page: { $regex: /localhost/i } },
        { anonymousSessionId: { $regex: /test/i } }
      ]
    });

    return NextResponse.json({ 
      success: true, 
      data: {
        totalRecords,
        oldRecords,
        testRecords,
        recentRecords: totalRecords - oldRecords
      }
    });

  } catch (error) {
    console.error('Analytics reset preview error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    addServerLog('error', 'analytics-reset', 'Error getting reset preview', { error: errorMessage });
    
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
