'use client';

import { useState } from 'react';
import { Search, Copy, Check, AlertCircle, Info, ExternalLink } from 'lucide-react';
import PageTitle from '@/components/ui/page-title';

interface MetadataResult {
  success: boolean;
  url: string;
  metadata: {
    title: string;
    description: string;
    keywords: string;
    ogTitle: string;
    ogDescription: string;
    ogType: string;
    ogUrl: string;
    ogImage: string;
    twitterCard: string;
    twitterTitle: string;
    twitterDescription: string;
    twitterImage: string;
    canonical: string;
    robots: string;
    viewport: string;
    charset: string;
    hreflang: Array<{ hreflang: string | null; href: string | null }>;
    structuredData: Record<string, unknown>[];
    additionalMeta: Array<{ name: string | null; property: string | null; content: string | null }>;
    contentAnalysis: {
      h1Count: number;
      h2Count: number;
      h3Count: number;
      imageCount: number;
      linkCount: number;
      wordCount: number;
    };
  };
  analyzedAt: string;
}

export default function MetadataAnalyzerPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MetadataResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const analyzeMetadata = async () => {
    if (!url.trim()) {
      setError('Введите URL для анализа');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/admin/metadata-analyzer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при анализе мета-данных');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getStatusIcon = (value: string, isGood: boolean) => {
    if (value === 'No title' || value === 'No description' || value === 'No canonical URL') {
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
    return isGood ? <Check className="w-4 h-4 text-green-500" /> : <Info className="w-4 h-4 text-blue-500" />;
  };

  const getStatusColor = (value: string, isGood: boolean) => {
    if (value === 'No title' || value === 'No description' || value === 'No canonical URL') {
      return 'text-red-400';
    }
    return isGood ? 'text-green-400' : 'text-blue-400';
  };

  return (
    <div className="min-h-screen bg-background">
      <PageTitle title="Анализатор мета-данных" />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Форма ввода */}
        <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Анализ мета-данных страницы</h2>
          
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://reguides.ru/characters/raiden-shogun"
                className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && analyzeMetadata()}
              />
            </div>
            <button
              onClick={analyzeMetadata}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              {loading ? 'Анализ...' : 'Анализировать'}
            </button>
          </div>
          
          <p className="text-sm text-neutral-400 mt-2">
            Введите URL страницы с вашего сайта для анализа её мета-данных
          </p>
        </div>

        {/* Ошибка */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-5 h-5" />
              <span className="font-semibold">Ошибка:</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Результаты */}
        {result && (
          <div className="space-y-6">
            {/* Заголовок результата */}
            <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">Результаты анализа</h3>
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Открыть страницу
                </a>
              </div>
              <p className="text-neutral-400">
                Проанализировано: {new Date(result.analyzedAt).toLocaleString('ru-RU')}
              </p>
            </div>

            {/* Основные мета-теги */}
            <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Основные мета-теги</h4>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  {getStatusIcon(result.metadata.title, result.metadata.title !== 'No title')}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-neutral-300">Title</span>
                      <button
                        onClick={() => copyToClipboard(result.metadata.title, 'title')}
                        className="p-1 hover:bg-neutral-700 rounded transition-colors"
                      >
                        {copiedField === 'title' ? (
                          <Check className="w-3 h-3 text-green-400" />
                        ) : (
                          <Copy className="w-3 h-3 text-neutral-400" />
                        )}
                      </button>
                    </div>
                    <p className={`text-sm ${getStatusColor(result.metadata.title, result.metadata.title !== 'No title')}`}>
                      {result.metadata.title}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  {getStatusIcon(result.metadata.description, result.metadata.description !== 'No description')}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-neutral-300">Description</span>
                      <button
                        onClick={() => copyToClipboard(result.metadata.description, 'description')}
                        className="p-1 hover:bg-neutral-700 rounded transition-colors"
                      >
                        {copiedField === 'description' ? (
                          <Check className="w-3 h-3 text-green-400" />
                        ) : (
                          <Copy className="w-3 h-3 text-neutral-400" />
                        )}
                      </button>
                    </div>
                    <p className={`text-sm ${getStatusColor(result.metadata.description, result.metadata.description !== 'No description')}`}>
                      {result.metadata.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  {getStatusIcon(result.metadata.canonical, result.metadata.canonical !== 'No canonical URL')}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-neutral-300">Canonical URL</span>
                      <button
                        onClick={() => copyToClipboard(result.metadata.canonical, 'canonical')}
                        className="p-1 hover:bg-neutral-700 rounded transition-colors"
                      >
                        {copiedField === 'canonical' ? (
                          <Check className="w-3 h-3 text-green-400" />
                        ) : (
                          <Copy className="w-3 h-3 text-neutral-400" />
                        )}
                      </button>
                    </div>
                    <p className={`text-sm ${getStatusColor(result.metadata.canonical, result.metadata.canonical !== 'No canonical URL')}`}>
                      {result.metadata.canonical}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Open Graph */}
            <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Open Graph</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-neutral-300">Title</span>
                  <p className="text-sm text-neutral-400 mt-1">{result.metadata.ogTitle}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-neutral-300">Type</span>
                  <p className="text-sm text-neutral-400 mt-1">{result.metadata.ogType}</p>
                </div>
                <div className="md:col-span-2">
                  <span className="text-sm font-medium text-neutral-300">Description</span>
                  <p className="text-sm text-neutral-400 mt-1">{result.metadata.ogDescription}</p>
                </div>
                <div className="md:col-span-2">
                  <span className="text-sm font-medium text-neutral-300">Image</span>
                  <p className="text-sm text-neutral-400 mt-1 break-all">{result.metadata.ogImage}</p>
                </div>
              </div>
            </div>

            {/* Twitter Cards */}
            <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Twitter Cards</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-neutral-300">Card Type</span>
                  <p className="text-sm text-neutral-400 mt-1">{result.metadata.twitterCard}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-neutral-300">Title</span>
                  <p className="text-sm text-neutral-400 mt-1">{result.metadata.twitterTitle}</p>
                </div>
                <div className="md:col-span-2">
                  <span className="text-sm font-medium text-neutral-300">Description</span>
                  <p className="text-sm text-neutral-400 mt-1">{result.metadata.twitterDescription}</p>
                </div>
                <div className="md:col-span-2">
                  <span className="text-sm font-medium text-neutral-300">Image</span>
                  <p className="text-sm text-neutral-400 mt-1 break-all">{result.metadata.twitterImage}</p>
                </div>
              </div>
            </div>

            {/* Структурированные данные */}
            {result.metadata.structuredData.length > 0 && (
              <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-white mb-4">Структурированные данные (JSON-LD)</h4>
                <div className="space-y-4">
                  {result.metadata.structuredData.map((data, index) => (
                    <div key={index} className="bg-neutral-700 rounded-lg p-4">
                      <pre className="text-xs text-neutral-300 overflow-x-auto">
                        {JSON.stringify(data, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Анализ контента */}
            <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Анализ контента</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{result.metadata.contentAnalysis.h1Count}</div>
                  <div className="text-sm text-neutral-400">H1 заголовков</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{result.metadata.contentAnalysis.h2Count}</div>
                  <div className="text-sm text-neutral-400">H2 заголовков</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{result.metadata.contentAnalysis.h3Count}</div>
                  <div className="text-sm text-neutral-400">H3 заголовков</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400">{result.metadata.contentAnalysis.imageCount}</div>
                  <div className="text-sm text-neutral-400">Изображений</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-pink-400">{result.metadata.contentAnalysis.linkCount}</div>
                  <div className="text-sm text-neutral-400">Ссылок</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-400">{result.metadata.contentAnalysis.wordCount}</div>
                  <div className="text-sm text-neutral-400">Слов</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
