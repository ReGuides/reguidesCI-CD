'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, CheckCircle, XCircle } from 'lucide-react';

export default function TestPage() {
  const [testResult, setTestResult] = useState<{
    success?: boolean;
    error?: string;
    details?: string;
    message?: string;
    data?: {
      database?: string;
      characterCount?: number;
      sampleCharacters?: Array<{
        name: string;
        element: string;
        weapon: string;
        rarity: number;
      }>;
    };
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const testDatabase = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test');
      const data = await response.json();
      setTestResult(data);
    } catch (error) {
      setTestResult({
        success: false,
        error: 'Failed to test database',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Тест подключения к базе данных</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Проверка подключения
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={testDatabase} disabled={loading}>
              {loading ? 'Тестирование...' : 'Тестировать подключение'}
            </Button>
          </CardContent>
        </Card>

        {testResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {testResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                Результат теста
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <strong>Статус:</strong>{' '}
                  <span className={testResult.success ? 'text-green-600' : 'text-red-600'}>
                    {testResult.success ? 'Успешно' : 'Ошибка'}
                  </span>
                </div>
                
                {testResult.message && (
                  <div>
                    <strong>Сообщение:</strong> {testResult.message}
                  </div>
                )}
                
                {testResult.error && (
                  <div>
                    <strong>Ошибка:</strong> {testResult.error}
                  </div>
                )}
                
                {testResult.details && (
                  <div>
                    <strong>Детали:</strong> {testResult.details}
                  </div>
                )}
                
                {testResult.data && (
                  <div className="space-y-2">
                    <div>
                      <strong>База данных:</strong> {testResult.data.database}
                    </div>
                    <div>
                      <strong>Количество персонажей:</strong> {testResult.data.characterCount}
                    </div>
                    {testResult.data.sampleCharacters && testResult.data.sampleCharacters.length > 0 && (
                      <div>
                        <strong>Примеры персонажей:</strong>
                        <ul className="list-disc list-inside mt-2 ml-4">
                          {testResult.data.sampleCharacters.map((char: { name: string; element: string; weapon: string; rarity: number }, index: number) => (
                            <li key={index}>
                              {char.name} ({char.element}, {char.weapon}, {char.rarity}★)
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 