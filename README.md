# MAX Chat — веб-клиент WhatsApp на GREEN-API

Веб-приложение для отправки и получения сообщений WhatsApp через GREEN-API.
Написано на React + Vite.

## Возможности

- Авторизация по `idInstance` и `apiTokenInstance` от GREEN-API
- Список чатов с поиском
- Отправка и приём текстовых сообщений
- Создание нового чата по номеру телефона
- Обработка ошибок (включая лимит тарифа 466)

## Технологии

- React 18
- Vite
- GREEN-API (REST API)

## Локальный запуск

### Требования

- **Node.js** версии 18 или выше. Проверить: `node -v`.
  Если не установлен — скачать с [nodejs.org](https://nodejs.org) (версия LTS).
- **Аккаунт GREEN-API** — `idInstance` и `apiTokenInstance` из личного кабинета.

### Шаг 1. Клонирование репозитория

```bash
git clone https://github.com/lexa2000lexa-afk/max-chat.git
cd max-chat
```

### Шаг 2. Установка зависимостей

```bash
npm install
```

### Шаг 3. Настройка GREEN-API

1. Зайдите в [личный кабинет GREEN-API](https://console.green-api.com).
2. Создайте инстанс (или используйте существующий).
3. Отсканируйте QR-код через WhatsApp на телефоне
   (Настройки → Привязка устройства).
4. Скопируйте **idInstance** и **apiTokenInstance** из настроек инстанса.

### Шаг 4. Проверка прокси в `vite.config.js`

Запросы идут по относительному пути `/api/waInstance...`.
Vite проксирует их на сервер GREEN-API, обходя CORS.
Откройте `vite.config.js` — там должен быть блок `server.proxy`:

```js
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://api.green-api.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
```

Если блока нет — добавьте.

### Шаг 5. Запуск

```bash
npm run dev
```

Приложение откроется на `http://localhost:5173`.

### Шаг 6. Вход

На экране авторизации введите **idInstance** и **apiTokenInstance**,
скопированные из кабинета GREEN-API.

После входа доступны действия:
- Создать новый чат — кнопка нового чата, введите номер телефона.
- Отправлять сообщения в существующие чаты.
- Получать входящие сообщения автоматически.

## Возможные проблемы

| Проблема | Решение |
|---|---|
| `node: command not found` | Установите Node.js с [nodejs.org](https://nodejs.org) |
| `npm install` падает с ошибкой | Удалите `node_modules` и `package-lock.json`, запустите `npm install` заново |
| Ошибка 466 при отправке | Исчерпан лимит бесплатного тарифа GREEN-API — нужен бизнес-тариф |
| Сообщения не приходят | Проверьте статус инстанса в кабинете — должен быть `authorized` |
| Ошибка CORS в браузере | Прокси в `vite.config.js` не настроен — см. шаг 4 |

## Структура проекта

```
src/
  api/
    greenApi.js          — функции для работы с GREEN-API
  components/
    Login.jsx            — экран авторизации
    ChatWindow.jsx       — основное окно с чатами
  App.jsx                — корневой компонент
  main.jsx               — точка входа
```

## Ограничения

На бесплатном тарифе «Разработчик» действуют лимиты на отправку сообщений.
При превышении возвращается ошибка 466.
