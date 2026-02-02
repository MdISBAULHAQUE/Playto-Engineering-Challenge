# KarmaX 🚀

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-prototype-orange.svg)
![Stack](https://img.shields.io/badge/stack-Django%20%7C%20React%20%7C%20PostgreSQL-green.svg)

**KarmaX** is a next-generation community feed prototype designed for high performance, concurrency handling, and a premium user experience. It features threaded discussions, a dynamic 24-hour leaderboard, and a robust token-based authentication system.

---

## ✨ Key Features

- **🧵 Threaded Comments**: Infinite nesting with optimized recursive loading (N+1 query prevention).
- **🏆 Dynamic Leaderboard**: Real-time ranking based on Karma earned in the last 24 hours (not lifetime).
- **⚡ High Performance**:
    - **Optimized Queries**: Fetching complex trees in just 2 SQL queries.
    - **Concurrency Safe**: Idempotent "Like" system using database constraints to prevent race conditions.
- **🎨 Premium UI**: Fully responsive design with a dedicated Mobile Bottom Nav, Trending Sidebar, and Toast notifications.
- **🔐 Secure Auth**: Complete authentication flow (Login/Signup) with Token-based session management.
- **🔍 Discovery**:
    - **Search**: Real-time search for users and posts.
    - **Trending**: Top posts from the last 24h.
- **👤 Public Profiles**: deeply integrated user profiles with bio and avatar support.

---

## 🛠️ Tech Stack

### Backend
- **Framework**: Django 4.2 + Django REST Framework (DRF)
- **Database**: SQLite (Dev) / PostgreSQL (Production ready)
- **Authentication**: DRF Token Authentication
- **Testing**: Django `TestCase` with `assertNumQueries` for performance auditing.

### Frontend
- **Framework**: React 18 (Vite)
- **Styling**: Tailwind CSS, Lucide React (Icons)
- **State**: React Hooks + LocalStorage persistence
- **Notifications**: React Hot Toast

---

## 🚀 Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites
- Python 3.8+
- Node.js 18+

### 1. Backend Setup

```bash
# Clone the repository
git clone <repository-url>
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`

# Install dependencies
pip install -r requirements.txt
# If requirements.txt is missing:
# pip install django djangorestframework django-cors-headers python-dateutil

# Run Migrations
python manage.py migrate

# Start Server
python manage.py runserver
```
The API will be live at `http://localhost:8000/api/`.

### 2. Frontend Setup

```bash
cd frontend

# Install Node modules
npm install

# Start Development Server
npm run dev
```
The application will be accessible at `http://localhost:5173/`.

---

## 🧪 Testing & Verification

KarmaX includes a suite of tests to enforce critical constraints.

**Run Backend Tests:**
```bash
cd backend
python manage.py test core
```

**What is tested?**
1.  **N+1 Prevention**: Ensures fetching a post with 50 comments uses fixed queries.
2.  **Concurrency**: Simulates multiple threads liking a post simultaneously to verify race condition handling.
3.  **Leaderboard Logic**: Verifies that only karma from the last 24 hours counts towards the score.

---

## 📂 Project Structure

```
├── backend/
│   ├── config/             # Django settings & URL config
│   ├── core/               # Main application logic
│   │   ├── models.py       # DB Schema (Post, Comment, Like, Profile)
│   │   ├── views.py        # API Views (Feed, Leaderboard)
│   │   ├── serializers.py  # JSON Serialization
│   │   └── tests.py        # Constraint verification tests
│   └── manage.py
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI (Layout, Post, CommentTree)
│   │   ├── pages/          # Route Pages (Feed, Login, Profile)
│   │   ├── api.js          # Axios configuration
│   │   └── App.jsx         # Main Router
│   └── tailwind.config.js
```

---

## 📖 API Documentation

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/feed/` | Fetch main feed posts |
| `GET` | `/api/posts/:id/` | Fetch single post with full comment tree |
| `POST` | `/api/comments/` | Create a comment (or reply) |
| `POST` | `/api/like/` | Like/Unlike a post or comment |
| `GET` | `/api/leaderboard/` | Get top users (last 24h) |
| `GET` | `/api/trending/` | Get top posts (last 24h) |
| `GET` | `/api/search/?q=` | Search users and posts |

---

## 🤝 Contributing

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---

*Built with ❤️ by the KarmaX Team.*
