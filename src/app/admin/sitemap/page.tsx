'use client'

import { useState, useEffect } from 'react'

interface SitemapSettings {
  includeAllCharacters: boolean
  lastUpdated?: string
  forceUpdate: boolean
}

export default function SitemapAdminPage() {
  const [settings, setSettings] = useState<SitemapSettings>({
    includeAllCharacters: true,
    forceUpdate: false
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [logs, setLogs] = useState<string[]>([])
  const [logsLoading, setLogsLoading] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/sitemap')
      const data = await response.json()
      
      if (data.success) {
        setSettings(data.data)
      } else {
        setMessage('Ошибка загрузки настроек: ' + data.error)
      }
    } catch {
      setMessage('Ошибка загрузки настроек')
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    setMessage('')
    
    try {
      const response = await fetch('/api/admin/sitemap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSettings(data.data)
        setMessage('Настройки сохранены успешно!')
      } else {
        setMessage('Ошибка сохранения: ' + data.error)
      }
    } catch {
      setMessage('Ошибка сохранения настроек')
    } finally {
      setSaving(false)
    }
  }

  const fetchLogs = async () => {
    setLogsLoading(true)
    try {
      const response = await fetch('/api/admin/sitemap-logs')
      const data = await response.json()
      
      if (data.success) {
        setLogs(data.logs)
        setMessage('Логи обновлены')
      } else {
        setLogs(data.logs || ['Ошибка получения логов'])
        setMessage('Ошибка получения логов: ' + data.error)
      }
    } catch {
      setLogs(['Ошибка получения логов'])
      setMessage('Ошибка получения логов')
    } finally {
      setLogsLoading(false)
    }
  }

  const forceUpdateSitemap = async () => {
    setSaving(true)
    setMessage('')
    
    try {
      // Сначала устанавливаем флаг принудительного обновления
      const forceResponse = await fetch('/api/force-sitemap', {
        method: 'POST',
      })
      
      if (!forceResponse.ok) {
        throw new Error('Failed to set force update flag')
      }
      
      // Затем обновляем настройки
      const response = await fetch('/api/admin/sitemap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ forceUpdate: true }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSettings(data.data)
        setMessage('Sitemap обновлен! Проверьте /sitemap.xml через несколько секунд')
        // Обновляем логи после обновления
        setTimeout(() => fetchLogs(), 1000)
      } else {
        setMessage('Ошибка обновления: ' + data.error)
      }
    } catch {
      setMessage('Ошибка обновления sitemap')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Управление Sitemap</h1>
      
      {message && (
        <div className={`p-4 rounded mb-6 ${
          message.includes('Ошибка') 
            ? 'bg-red-100 text-red-700 border border-red-300' 
            : 'bg-green-100 text-green-700 border border-green-300'
        }`}>
          {message}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Настройки персонажей</h2>
        
        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.includeAllCharacters}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                includeAllCharacters: e.target.checked
              }))}
              className="mr-3"
            />
            <span>Включать всех персонажей в sitemap (не только активных)</span>
          </label>
          <p className="text-sm text-gray-600 mt-1">
            Если включено, в sitemap будут все персонажи. Если выключено - только активные.
          </p>
        </div>
        
        <button
          onClick={saveSettings}
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Сохранение...' : 'Сохранить настройки'}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Принудительное обновление</h2>
        
        <div className="mb-4">
          <p className="text-gray-600 mb-2">
            Последнее обновление: {settings.lastUpdated 
              ? new Date(settings.lastUpdated).toLocaleString('ru-RU')
              : 'Никогда'
            }
          </p>
          <p className="text-sm text-gray-500">
            Нажмите кнопку ниже, чтобы принудительно обновить sitemap.
            Это полезно после добавления нового контента.
          </p>
        </div>
        
        <button
          onClick={forceUpdateSitemap}
          disabled={saving}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {saving ? 'Обновление...' : 'Обновить Sitemap'}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Логи Sitemap</h2>
          <button
            onClick={fetchLogs}
            disabled={logsLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {logsLoading ? 'Загрузка...' : 'Обновить логи'}
          </button>
        </div>
        
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-gray-500">Логи не загружены. Нажмите "Обновить логи"</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="mb-1">
                {log}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Информация</h2>
        <div className="space-y-2 text-sm text-gray-600">
          <p>• Sitemap доступен по адресу: <code className="bg-gray-200 px-1 rounded">/sitemap.xml</code></p>
          <p>• После обновления проверьте sitemap в браузере</p>
          <p>• Для поисковиков sitemap обновляется автоматически</p>
          <p>• Принудительное обновление сбрасывает кеш sitemap</p>
          <p>• Логи показывают процесс генерации sitemap в реальном времени</p>
        </div>
      </div>
    </div>
  )
}
