# 🗺️ Project Index & Core File Map

Таблица ключевых файлов для мгновенного доступа без сканирования всего репозитория.

| Модуль / Назначение | Путь к файлу | Роль / Что внутри |
| :--- | :--- | :--- |
| **Admin Panel (UI)** | [`public/ApiKey_generator.html`](file:///c:/Users/user/Desktop/Projects/Eternal-Lunar-Games-Site/public/ApiKey_generator.html) | Главный UI HTML панели отладки: модалки, кроппер, генератор ключей, вёрстка. |
| **Admin Panel (Mods)** | [`public/mods_admin.js`](file:///c:/Users/user/Desktop/Projects/Eternal-Lunar-Games-Site/public/mods_admin.js) | Скрипт управления модами в панели управления: CRUD, интеграция с Supabase. |
| **Admin Panel (Sneak)** | [`public/sneak_peeks_admin.js`](file:///c:/Users/user/Desktop/Projects/Eternal-Lunar-Games-Site/public/sneak_peeks_admin.js) | Скрипт управления сник-пиками & devlogs: версионирование, прогресс, обрезка. |
| **App Entry & Routes** | [`src/App.tsx`](file:///c:/Users/user/Desktop/Projects/Eternal-Lunar-Games-Site/src/App.tsx) | Главная страница, навбар с кнопками, роутинг `/projects` и `/mods`. |
| **Auth & Admin Modal** | [`src/components/LoginModal.tsx`](file:///c:/Users/user/Desktop/Projects/Eternal-Lunar-Games-Site/src/components/LoginModal.tsx) | Модалка входа: проверка `Eternal_Lunar`, запрос 24h API ключа по паролю. |
| **Auth State** | [`src/core/store/useAuthStore.ts`](file:///c:/Users/user/Desktop/Projects/Eternal-Lunar-Games-Site/src/core/store/useAuthStore.ts) | Zustand-стор авторизации, ролей (`admin`/`user`) и проверки ключей. |
| **Sneak Peeks Page** | [`src/features/projects/ProjectsPage.tsx`](file:///c:/Users/user/Desktop/Projects/Eternal-Lunar-Games-Site/src/features/projects/ProjectsPage.tsx) | Витрина сник-пиков и проектов с Supabase Realtime подпиской. |
| **Sneak Peeks Service** | [`src/features/projects/sneakPeeksService.ts`](file:///c:/Users/user/Desktop/Projects/Eternal-Lunar-Games-Site/src/features/projects/sneakPeeksService.ts) | Сервис подписки на Supabase `postgres_changes` для сник-пиков. |
| **Minecraft Mods Page** | [`src/features/mods/ModsPage.tsx`](file:///c:/Users/user/Desktop/Projects/Eternal-Lunar-Games-Site/src/features/mods/ModsPage.tsx) | Страница каталога модов, плашка вкладок, фильтрация по платформам. |
| **PC Master Game** | [`src/features/games/pc-master/PcMasterGame.tsx`](file:///c:/Users/user/Desktop/Projects/Eternal-Lunar-Games-Site/src/features/games/pc-master/PcMasterGame.tsx) | UI встроенной игры PC Master с главами и веб-ссылками. |
