module.exports = {
  apps: [
    {
      name: 'reguides-nextjs',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/reguides',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/var/log/pm2/reguides-error.log',
      out_file: '/var/log/pm2/reguides-out.log',
      log_file: '/var/log/pm2/reguides-combined.log',
      time: true,
      // Автоматический перезапуск при сбоях
      max_restarts: 10,
      min_uptime: '10s',
      // Мониторинг
      pmx: true,
      // Переменные окружения для MongoDB
      env_file: '.env',
      // Дополнительные настройки для монолитного приложения
      node_args: '--max-old-space-size=1024',
      // Логирование в JSON формате
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      // Автоматическое сохранение процесса
      pmx: true,
      // Настройки для кластера (если понадобится)
      exec_mode: 'fork'
    }
  ],

  deploy: {
    production: {
      user: 'root',
      host: '95.215.56.7',
      ref: 'origin/master',
      repo: 'https://github.com/ReGuides/reguidesCI-CD.git',
      path: '/var/www/reguides',
      'pre-deploy-local': 'echo "Начинаем деплой..."',
      'post-deploy': 'npm ci --only=production && pm2 reload ecosystem.config.js --env production && echo "Деплой завершен"',
      'pre-setup': 'echo "Настройка сервера..."',
      'post-setup': 'echo "Сервер настроен"'
    }
  }
}; 