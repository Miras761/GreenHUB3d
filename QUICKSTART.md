# Быстрый старт GreenHub3d

## Шаг 1: Установка зависимостей

```bash
npm run install-all
```

## Шаг 2: Настройка MongoDB

Убедитесь, что MongoDB запущен локально, или используйте MongoDB Atlas.

Создайте файл `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/greenhub3d
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRE=7d
NODE_ENV=development
```

## Шаг 3: Запуск

```bash
npm run dev
```

Это запустит:
- Backend сервер на http://localhost:5000
- Frontend приложение на http://localhost:3000

## Шаг 4: Первые шаги

1. Откройте http://localhost:3000 в браузере
2. Зарегистрируйтесь
3. Создайте категорию (например, "Персонажи" или "Архитектура")
4. Загрузите свою первую 3D модель (рекомендуется GLTF/GLB формат)

## Важные замечания

- Для просмотра моделей в браузере используйте форматы GLTF или GLB
- Другие форматы (FBX, OBJ и т.д.) можно загружать и скачивать, но просмотр недоступен
- Максимальный размер файла: 100MB

## Устранение проблем

### MongoDB не подключается
- Убедитесь, что MongoDB запущен: `mongod` (или через сервисы)
- Проверьте MONGODB_URI в .env файле

### Порты заняты
- Измените PORT в server/.env
- Измените port в client/vite.config.js

### Модели не загружаются
- Проверьте права доступа к папке server/uploads
- Убедитесь, что сервер запущен
