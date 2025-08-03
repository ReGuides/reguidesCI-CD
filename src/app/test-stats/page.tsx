'use client';

import { useState } from 'react';

interface MainStat {
  stat: string;
  targetValue?: string;
  unit?: string;
  description?: string;
}

interface TalentPriority {
  talentName: string;
  priority: number;
  description?: string;
}

interface ApiResponse {
  characterId: string;
  weapons: any[];
  artifacts: any[];
  mainStats?: {
    detailedStats?: MainStat[];
    sands?: string[];
    goblet?: string[];
    circlet?: string[];
  };
  subStats?: string[];
  talentPriorities?: TalentPriority[];
  notes?: string;
}

export default function TestStatsPage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testAPI = async (characterId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/recommendations/${characterId}`);
      if (response.ok) {
        const result = await response.json();
        setData(result);
        console.log('API Response:', result);
      } else {
        setError(`API request failed: ${response.status}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Тест API Статов</h1>
        
        <div className="space-y-4 mb-8">
          <button
            onClick={() => testAPI('chevreuse')}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded"
          >
            {loading ? 'Загрузка...' : 'Тест Chevreuse'}
          </button>
          
          <button
            onClick={() => testAPI('raiden')}
            disabled={loading}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded ml-4"
          >
            {loading ? 'Загрузка...' : 'Тест Raiden'}
          </button>
        </div>

        {error && (
          <div className="bg-red-900 border border-red-700 rounded-lg p-4 mb-6">
            <h3 className="text-red-400 font-semibold mb-2">Ошибка:</h3>
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {data && (
          <div className="space-y-6">
            <div className="bg-neutral-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Результат API</h2>
              <pre className="bg-neutral-900 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>

            {data.mainStats?.detailedStats && (
              <div className="bg-neutral-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Детальные статы ({data.mainStats.detailedStats.length})</h3>
                <div className="space-y-3">
                  {data.mainStats.detailedStats.map((stat, idx) => (
                    <div key={idx} className="bg-neutral-700 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">📊</span>
                        <span className="font-semibold">{stat.stat}</span>
                      </div>
                      <div className="text-sm text-gray-300 mb-2">
                        Целевое значение: <span className="text-white font-semibold">
                          {stat.targetValue}{stat.unit ? ` ${stat.unit}` : ''}
                        </span>
                      </div>
                      {stat.description && (
                        <div className="text-xs text-gray-400 italic">
                          {stat.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.mainStats && (data.mainStats.sands?.length || data.mainStats.goblet?.length || data.mainStats.circlet?.length) && (
              <div className="bg-neutral-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Статы артефактов</h3>
                <div className="space-y-2">
                  {data.mainStats.sands && data.mainStats.sands.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Пески времени:</span>
                      <span className="text-white">{data.mainStats.sands.join(', ')}</span>
                    </div>
                  )}
                  {data.mainStats.goblet && data.mainStats.goblet.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Кубок:</span>
                      <span className="text-white">{data.mainStats.goblet.join(', ')}</span>
                    </div>
                  )}
                  {data.mainStats.circlet && data.mainStats.circlet.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Корона:</span>
                      <span className="text-white">{data.mainStats.circlet.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {data.subStats && data.subStats.length > 0 && (
              <div className="bg-neutral-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Дополнительные статы ({data.subStats.length})</h3>
                <div className="flex flex-wrap gap-2">
                  {data.subStats.map((stat, idx) => (
                    <span key={idx} className="px-3 py-1 bg-neutral-700 rounded text-sm">
                      {stat}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {data.talentPriorities && data.talentPriorities.length > 0 && (
              <div className="bg-neutral-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Приоритеты талантов ({data.talentPriorities.length})</h3>
                <div className="space-y-2">
                  {data.talentPriorities
                    .sort((a, b) => a.priority - b.priority)
                    .map((talent, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          talent.priority === 1 ? 'bg-red-500/20 text-red-400' :
                          talent.priority === 2 ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {talent.priority}
                        </span>
                        <span className="text-white">{talent.talentName}</span>
                        {talent.description && (
                          <span className="text-gray-400 text-xs">({talent.description})</span>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {data.notes && (
              <div className="bg-neutral-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Заметки</h3>
                <p className="text-gray-300">{data.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 