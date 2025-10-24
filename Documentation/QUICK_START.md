# ⚡ Quick Start Guide

A rapid setup guide for experienced developers. For detailed instructions, see `SETUP_GUIDE.md`.

---

## 🚀 Fast Setup (10 minutes)

### 1. Prerequisites

```bash
# Verify installations
node --version  # v20+
npm --version   # v10+
mysql --version # 8.x+
```

### 2. Create Database

```sql
mysql -u root -p
CREATE DATABASE richwell_portal;
EXIT;
```

### 3. Backend Setup

```bash
# Create project
mkdir richwell-portal && cd richwell-portal
mkdir backend && cd backend

# Initialize
npm init -y
npm install express cors dotenv bcryptjs jsonwebtoken prisma @prisma/client
npm install -D nodemon
npx prisma init

# Update package.json - add "type": "module"
# Create src structure
mkdir -p src/{controllers,middleware,routes,utils}
```

Create `backend/.env`:

```env
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/richwell_portal"
PORT=5000
NODE_ENV=development
JWT_SECRET=your-secret-key-change-this
CLIENT_URL=http://localhost:3000
```

Create `backend/src/server.js` with Express setup.

### 4. Frontend Setup

```bash
# Back to project root
cd ..

# Create React app
npm create vite@latest frontend -- --template react
cd frontend
npm install

# Install dependencies
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install axios react-router-dom lucide-react recharts

# Create structure
mkdir -p src/components/{common,layout,auth} src/{pages,utils}
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Update `frontend/src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 5. Copy Component Files

Copy all provided component files to appropriate locations:

- Button.jsx, InputField.jsx, Modal.jsx, Table.jsx, Dropdown.jsx, Alert.jsx, Card.jsx, Chart.jsx → `src/components/common/`
- api.js → `src/utils/`
- App.jsx → `src/`

### 6. Start Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 7. Test

Open http://localhost:5173 and click "Check Server Status"

---

## 📦 Essential Commands

### Backend Commands

```bash
cd backend

# Development
npm run dev              # Start dev server with hot reload

# Production
npm start               # Start production server

# Database
npm run prisma:generate # Generate Prisma client
npm run prisma:migrate  # Run migrations
npm run prisma:studio   # Open database GUI

# Prisma direct commands
npx prisma migrate dev --name init  # Create first migration
npx prisma db push                  # Push schema without migration
npx prisma studio                   # Database GUI
```

### Frontend Commands

```bash
cd frontend

# Development
npm run dev            # Start dev server

# Production
npm run build         # Build for production
npm run preview       # Preview production build

# Maintenance
npm run lint          # Run linter
```

---

## 🔍 Quick Troubleshooting

### Backend won't start

```bash
# Check MySQL
sudo service mysql status  # Linux
brew services list         # Mac

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Frontend won't start

```bash
# Clear cache and reinstall
rm -rf node_modules .vite package-lock.json
npm install
```

### Connection issues

```bash
# Check if ports are in use
lsof -i :5000  # Backend
lsof -i :3000  # Frontend (Vite might use 5173)

# Kill process if needed
kill -9 <PID>
```

### Database connection fails

```sql
-- Verify database
mysql -u root -p
SHOW DATABASES;
USE richwell_portal;
SHOW TABLES;
```

---

## 🎯 Quick Test Endpoints

### Backend API

```bash
# Health check
curl http://localhost:5000/api/health

# Test endpoint
curl http://localhost:5000/api/test
```

### Expected Responses

```json
// /api/health
{
  "status": "success",
  "message": "Server is running!",
  "timestamp": "2024-XX-XX..."
}

// /api/test
{
  "message": "API is working correctly!",
  "environment": "development"
}
```

---

## 📁 File Tree (Minimal)

```
richwell-portal/
├── backend/
│   ├── prisma/schema.prisma
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── server.js
│   ├── .env
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/common/
    │   ├── utils/api.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── .env
    ├── tailwind.config.js
    └── package.json
```

---

## 🔥 One-Line Installers

### Backend Dependencies

```bash
npm i express cors dotenv bcryptjs jsonwebtoken prisma @prisma/client && npm i -D nodemon
```

### Frontend Dependencies

```bash
npm i axios react-router-dom lucide-react recharts && npm i -D tailwindcss postcss autoprefixer
```

---

## 🚦 Status Check

```bash
# Check all services
echo "Node: $(node -v)"
echo "NPM: $(npm -v)"
echo "MySQL: $(mysql --version)"
echo "Backend running: $(curl -s http://localhost:5173 | grep success && echo '✅' || echo '❌')"
echo "Frontend running: $(curl -s http://localhost:5173 && echo '✅' || echo '❌')"
```

---

## 💡 Pro Tips

1. **Use terminal multiplexer**: `tmux` or `screen` for multiple terminals
2. **Add to .gitignore**:
   ```
   node_modules/
   .env
   .vite/
   dist/
   ```
3. **VS Code extensions**: Prisma, Tailwind CSS IntelliSense, ES7 React snippets
4. **Database backup**:
   ```bash
   mysqldump -u root -p richwell_portal > backup.sql
   ```
5. **Quick port change**: Update PORT in both `.env` files

---

## 🎬 Video Tutorial Steps

If creating a video tutorial, cover these:

1. Prerequisites verification (2 min)
2. Database creation (1 min)
3. Backend setup & installation (3 min)
4. Frontend setup & installation (3 min)
5. Component creation (can skip/fast forward)
6. Testing connection (1 min)

---

## 📞 Quick Links

- Node.js: https://nodejs.org/
- MySQL: https://dev.mysql.com/downloads/
- Vite: https://vitejs.dev/
- Tailwind: https://tailwindcss.com/
- Prisma: https://www.prisma.io/

---

## ✅ Checklist Speedrun

- [ ] Node, npm, MySQL installed
- [ ] Database created
- [ ] Backend dependencies installed
- [ ] Backend .env configured
- [ ] Backend server.js created
- [ ] Frontend Vite project created
- [ ] Frontend dependencies installed
- [ ] Frontend .env configured
- [ ] Tailwind configured
- [ ] Components created
- [ ] Both servers running
- [ ] Connection test successful

**Time to complete: ~10-15 minutes**

---

