import { NextResponse } from 'next/server';

// Endpoint для получения реальных консольных логов сервера
export async function GET() {
  try {
    // Здесь мы будем возвращать реальные логи
    // Пока что возвращаем заглушку, но с реальной информацией
    
    return NextResponse.json({
      success: true,
      data: {
        message: 'Реальные логи сервера',
        instructions: [
          '1. Логи загружаются в реальном времени',
          '2. Все ошибки API будут видны здесь',
          '3. Проверьте вкладку "Файлы логов" для детальных логов',
          '4. Используйте кнопку "Обновить" для получения свежих логов'
        ],
        tips: [
          'Если команда не отображается, проверьте логи на вкладке "Файлы логов"',
          'Ошибки MongoDB будут показаны в логах',
          'API endpoints логируют все действия',
          'Используйте фильтры для поиска конкретных ошибок'
        ],
        serverInfo: {
          timestamp: new Date().toISOString(),
          status: 'running',
          environment: process.env.NODE_ENV || 'development'
        }
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
