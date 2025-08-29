'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { 
  RefreshCw, 
  Trash2, 
  Download,
  Filter,
  FileText,
  AlertTriangle,
  Info,
  Eye,
  Terminal,
  HelpCircle
} from 'lucide-react';

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  source: string;
}

interface LogsData {
  logs: LogEntry[];
  total: number;
  filtered: number;
  sources: string[];
}

interface ConsoleLogsData {
  message: string;
  instructions: string[];
  tips: string[];
}

export default function LogsPage() {
  const [activeTab, setActiveTab] = useState<'files' | 'console'>('console');
  const [logs, setLogs] = useState<LogsData | null>(null);
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLogsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [lines, setLines] = useState(100);
  const [level, setLevel] = useState('all');
  const [source, setSource] = useState('all');
  const [search, setSearch] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        lines: lines.toString(),
        level: level === 'all' ? 'all' : level
      });
      
      const response = await fetch(`/api/admin/logs?${params}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setLogs(result.data);
        }
      }
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadConsoleLogs = async () => {
    try {
      const response = await fetch('/api/admin/console-logs');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setConsoleLogs(result.data);
        }
      }
    } catch (error) {
      console.error('Error loading console logs:', error);
    }
  };

  const refreshLogs = async () => {
    setRefreshing(true);
    if (activeTab === 'files') {
      await loadLogs();
    } else {
      await loadConsoleLogs();
    }
    setRefreshing(false);
  };

  const clearLogs = async () => {
    if (!confirm('Вы уверены, что хотите очистить все логи? Это действие нельзя отменить.')) {
      return;
    }

    try {
      setClearing(true);
      const response = await fetch('/api/admin/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'clear' }),
      });

      if (response.ok) {
        await loadLogs();
      }
    } catch (error) {
      console.error('Error clearing logs:', error);
    } finally {
      setClearing(false);
    }
  };

  const downloadLogs = () => {
    if (!logs) return;
    
    const logText = logs.logs
      .map(log => `[${log.timestamp}] [${log.level.toUpperCase()}] [${log.source}] ${log.message}`)
      .join('\n');
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `server-logs-${new Date().toISOString().split('T')[0]}.log`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (activeTab === 'files') {
      loadLogs();
    } else {
      loadConsoleLogs();
    }
  }, [activeTab, lines, level]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh && activeTab === 'files') {
      interval = setInterval(loadLogs, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, activeTab]);

  const getLevelIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'warn':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'error':
        return 'text-red-400 bg-red-900/20 border-red-700';
      case 'warn':
        return 'text-yellow-400 bg-yellow-900/20 border-yellow-700';
      case 'info':
        return 'text-blue-400 bg-blue-900/20 border-blue-700';
      default:
        return 'text-gray-400 bg-gray-900/20 border-gray-700';
    }
  };

  const filteredLogs = logs?.logs.filter(log => {
    if (source !== 'all' && log.source !== source) return false;
    if (search && !log.message.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" className="text-purple-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Логи сервера</h1>
          <p className="text-gray-400">Просмотр и управление логами сервера</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={refreshLogs}
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Обновление...' : 'Обновить'}
          </Button>
          {activeTab === 'files' && (
            <>
              <Button
                onClick={downloadLogs}
                variant="outline"
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Скачать
              </Button>
              <Button
                onClick={clearLogs}
                disabled={clearing}
                variant="outline"
                size="sm"
                className="text-red-400 hover:text-red-300 hover:border-red-400"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {clearing ? 'Очистка...' : 'Очистить'}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Вкладки */}
      <div className="flex space-x-1 mb-6">
        <button
          onClick={() => setActiveTab('console')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'console'
              ? 'bg-purple-600 text-white'
              : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
          }`}
        >
          <Terminal className="w-4 h-4 inline mr-2" />
          Консольные логи
        </button>
        <button
          onClick={() => setActiveTab('files')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'files'
              ? 'bg-purple-600 text-white'
              : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
          }`}
        >
          <FileText className="w-4 h-4 inline mr-2" />
          Файлы логов
        </button>
      </div>

      {activeTab === 'console' ? (
        /* Консольные логи */
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="w-5 h-5" />
              Консольные логи и отладка
            </CardTitle>
          </CardHeader>
          <CardContent>
            {consoleLogs ? (
              <div className="space-y-6">
                <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-blue-400 mb-2">
                    {consoleLogs.message}
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-blue-400" />
                      Инструкции по отладке
                    </h4>
                    <div className="space-y-2">
                      {consoleLogs.instructions.map((instruction, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <span className="text-blue-400 font-mono text-sm">{index + 1}.</span>
                          <span className="text-neutral-300">{instruction}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <Info className="w-5 h-5 text-green-400" />
                      Полезные советы
                    </h4>
                    <div className="space-y-2">
                      {consoleLogs.tips.map((tip, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <span className="text-green-400 font-mono text-sm">•</span>
                          <span className="text-neutral-300">{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-yellow-400 mb-2">
                    Как проверить логи команды
                  </h4>
                  <p className="text-neutral-300 mb-3">
                    Для отладки проблемы с командой разработчиков:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-neutral-300">
                    <li>Откройте терминал, где запущен <code className="bg-neutral-800 px-1 rounded">npm run dev</code></li>
                    <li>Попробуйте добавить участника команды через админку</li>
                    <li>Ищите логи, начинающиеся с <code className="bg-neutral-800 px-1 rounded">Team GET -</code> или <code className="bg-neutral-800 px-1 rounded">Team PUT -</code></li>
                    <li>Если есть ошибки, они будут показаны в консоли</li>
                  </ol>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                Загрузка информации о консольных логах...
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        /* Файлы логов */
        <>
          {/* Фильтры */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Фильтры
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Количество строк
                  </label>
                  <Input
                    type="number"
                    value={lines}
                    onChange={(e) => setLines(parseInt(e.target.value) || 100)}
                    min="10"
                    max="1000"
                    className="bg-neutral-800 border-neutral-600 text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Уровень
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full bg-neutral-800 border border-neutral-600 text-white rounded-md px-3 py-2"
                  >
                    <option value="all">Все уровни</option>
                    <option value="error">Ошибки</option>
                    <option value="warn">Предупреждения</option>
                    <option value="info">Информация</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Источник
                  </label>
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="w-full bg-neutral-800 border border-neutral-600 text-white rounded-md px-3 py-2"
                  >
                    <option value="all">Все источники</option>
                    {logs?.sources.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Поиск
                  </label>
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Поиск по сообщению..."
                    className="bg-neutral-800 border-neutral-600 text-white"
                  />
                </div>
              </div>
              
              <div className="mt-4 flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="rounded border-neutral-600 bg-neutral-800 text-purple-600"
                  />
                  <span className="text-sm text-gray-300">Автообновление (5 сек)</span>
                </label>
                
                {logs && (
                  <span className="text-sm text-gray-400">
                    Показано {filteredLogs.length} из {logs.total} записей
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Логи */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Логи сервера
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredLogs.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  Логи не найдены
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredLogs.map((log, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${getLevelColor(log.level)}`}
                    >
                      <div className="flex items-start gap-3">
                        {getLevelIcon(log.level)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs opacity-70">{log.timestamp}</span>
                            <span className="text-xs px-2 py-1 rounded bg-neutral-800/50">
                              {log.source}
                            </span>
                            <span className="text-xs px-2 py-1 rounded bg-neutral-800/50 uppercase">
                              {log.level}
                            </span>
                          </div>
                          <div className="text-sm break-words">{log.message}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
