# Настройка GitHub Secrets для CI/CD

## Проблема
Ошибка в GitHub Actions: `Error: can't connect without a private SSH key or password`

## Решение

### 1. Настройка GitHub Secrets

Перейдите в ваш GitHub репозиторий:
1. Откройте репозиторий на GitHub
2. Перейдите в **Settings** → **Secrets and variables** → **Actions**
3. Нажмите **New repository secret**

### 2. Добавьте следующие секреты:

#### `HOST`
- **Name**: `HOST`
- **Value**: IP адрес или домен вашего сервера
- **Example**: `123.456.789.012` или `your-domain.com`

#### `USERNAME`
- **Name**: `USERNAME`
- **Value**: Имя пользователя для SSH подключения
- **Example**: `root` или `ubuntu`

#### `SSH_KEY`
- **Name**: `SSH_KEY`
- **Value**: Приватный SSH ключ (весь ключ, включая `-----BEGIN OPENSSH PRIVATE KEY-----` и `-----END OPENSSH PRIVATE KEY-----`)

### 3. Генерация SSH ключа (если нужно)

Если у вас нет SSH ключа:

```bash
# Генерируем новый SSH ключ
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"

# Копируем публичный ключ на сервер
ssh-copy-id username@your-server-ip

# Приватный ключ (содержимое файла ~/.ssh/id_rsa) нужно добавить в GitHub Secrets
cat ~/.ssh/id_rsa
```

### 4. Альтернативный способ - использование пароля

Если вы предпочитаете использовать пароль вместо SSH ключа, измените workflow:

```yaml
- name: Upload build to server
  uses: appleboy/scp-action@v0.1.7
  with:
    host: ${{ secrets.HOST }}
    username: ${{ secrets.USERNAME }}
    password: ${{ secrets.PASSWORD }}  # Вместо key
    source: "build.tar.gz"
    target: "/var/www/reguides"
```

И добавьте секрет `PASSWORD` с паролем от пользователя.

### 5. Проверка подключения

После настройки секретов:

1. Сделайте push в ветку `master` или `main`
2. Проверьте, что GitHub Actions запустился
3. Убедитесь, что этап `deploy` выполняется без ошибок

### 6. Дополнительные настройки сервера

Убедитесь, что на сервере:

1. Установлен Node.js 18+
2. Установлен PM2: `npm install -g pm2`
3. Создана директория: `mkdir -p /var/www/reguides`
4. Настроены права доступа для пользователя

### 7. Troubleshooting

Если проблемы продолжаются:

1. Проверьте, что SSH ключ добавлен в `~/.ssh/authorized_keys` на сервере
2. Убедитесь, что порт 22 открыт на сервере
3. Проверьте логи GitHub Actions для более подробной информации об ошибке

## Структура секретов

```
HOST: 123.456.789.012
USERNAME: root
SSH_KEY: -----BEGIN OPENSSH PRIVATE KEY-----
         ... содержимое приватного ключа ...
         -----END OPENSSH PRIVATE KEY-----
``` 