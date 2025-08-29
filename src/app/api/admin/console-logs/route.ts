import { NextResponse } from 'next/server';

// Простой endpoint для получения консольных логов
export async function GET() {
  try {
    // Здесь можно добавить логику для получения логов из разных источников
    // Пока возвращаем заглушку с инструкциями
    
    return NextResponse.json({
      success: true,
      data: {
        message: 'Console logs endpoint is working. Check server console for detailed logs.',
        instructions: [
          '1. Check server console (terminal where you run npm run dev)',
          '2. Look for logs starting with "Team GET -" or "Team PUT -"',
          '3. These logs will show what\'s happening with the team API',
          '4. If you see errors, they will be displayed here'
        ],
        tips: [
          'Make sure MongoDB is running',
          'Check database connection string',
          'Verify that SiteSettings collection exists',
          'Look for any JavaScript errors in server console'
        ]
      }
    });
    
  } catch (error) {
    console.error('Error in console-logs endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to get console logs info' },
      { status: 500 }
    );
  }
}
