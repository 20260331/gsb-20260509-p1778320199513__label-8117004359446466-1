# Blog System

A modern blog system built with Vue 3, Naive UI, Tailwind CSS, Node.js, Express, and MySQL.

## Features

- **Blog Frontend**: Modern UI inspired by jiewen.run with hero section, article cards, and dark mode
- **Admin Panel**: Comprehensive dashboard with article, category, tag, and user management
- **User Authentication**: JWT-based authentication with role-based access control
- **Article Management**: Create, edit, delete articles with categories and tags
- **System Settings**: Configurable site title, description, and other settings
- **Docker Support**: One-click deployment with docker-compose

## How to Run

```bash
docker compose up
```

Wait for all services to start (about 30-60 seconds for the first run).

## Services

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3001 | Blog website and admin panel |
| Backend API | http://localhost:8080 | REST API server |
| MySQL | localhost:3308 | Database |

## Default Admin Account

- **Email**: admin@blog.com
- **Password**: password123

> **Note**: Please change the default password after first login.

## Project Structure

```
├── frontend/          # Vue 3 + Vite + Naive UI + Tailwind CSS
├── backend/           # Node.js + Express + Sequelize
├── database/          # MySQL initialization scripts
└── docker-compose.yml # Docker orchestration
```

## Tech Stack

### Frontend
- Vue 3 with Composition API
- TypeScript
- Vite
- Naive UI
- Tailwind CSS
- Pinia for state management
- Vue Router

### Backend
- Node.js
- Express
- Sequelize ORM
- MySQL 8.0
- JWT Authentication

## Verification

1. Open http://localhost:3001 in your browser
2. You should see the blog homepage with a hero section
3. Click "登录" (Login) and use the admin credentials
4. Navigate to http://localhost:3001/admin for the admin dashboard
5. Try creating, editing, and deleting articles

## API Health Check

```bash
curl http://localhost:8080/api/health
# Expected: {"status":"ok","timestamp":"..."}
```
