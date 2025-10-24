# ⚡ Phase 2 - Quick Command Reference

Copy and paste these commands in order.

---

## 🔧 Backend Setup Commands

```bash
# Navigate to backend
cd backend

# Update Prisma Client
npx prisma generate

# Create database migration
npx prisma migrate dev --name add_auth_system

# OR if migration fails, use push (dev only)
npx prisma db push

# Seed the database
npm run seed

# Start backend server
npm run dev
```

**Expected Output:**
```
✓ Roles created
✓ Program created
✓ Test users created
🎉 Database seeded successfully!
```

---

## 🎨 Frontend Setup Commands

```bash
# Navigate to frontend (new terminal)
cd frontend

# Install React Router
npm install react-router-dom

# Start frontend server
npm run dev
```

---

## 🧪 Test API Endpoints

### Using curl:

```bash
# Test Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@richwell.edu","password":"password123"}'

# Save the token from response, then test protected route:
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using Postman:

**1. Login:**
- Method: POST
- URL: `http://localhost:5000/api/auth/login`
- Body (JSON):
```json
{
  "email": "student@richwell.edu",
  "password": "password123"
}
```

**2. Get User (Protected):**
- Method: GET
- URL: `http://localhost:5000/api/auth/me`
- Headers:
  - Key: `Authorization`
  - Value: `Bearer YOUR_TOKEN`

---

## 🗄️ Database Commands

```bash
# Open MySQL
mysql -u root -p

# Inside MySQL:
USE richwell_portal;
SHOW TABLES;
SELECT * FROM roles;
SELECT * FROM users;
SELECT * FROM students;

# Exit MySQL
EXIT;

# Open Prisma Studio (Database GUI)
npx prisma studio
```

---

## 📦 File Creation Checklist

### Backend Files (create in order):

```bash
# 1. Create auth utility
touch backend/src/utils/auth.js

# 2. Create middleware
touch backend/src/middleware/authMiddleware.js

# 3. Create controller
touch backend/src/controllers/authController.js

# 4. Create routes
touch backend/src/routes/authRoutes.js

# 5. Create seeder
touch backend/prisma/seed.js
```

### Frontend Files (create in order):

```bash
# 1. Create context folder
mkdir -p frontend/src/context

# 2. Create dashboards folder
mkdir -p frontend/src/pages/dashboards

# 3. Create auth context
touch frontend/src/context/AuthContext.jsx

# 4. Create protected route
touch frontend/src/components/auth/ProtectedRoute.jsx

# 5. Create dashboard layout
touch frontend/src/components/layout/DashboardLayout.jsx

# 6. Create auth pages
touch frontend/src/pages/Login.jsx
touch frontend/src/pages/PasswordSetup.jsx

# 7. Create dashboard pages
touch frontend/src/pages/dashboards/StudentDashboard.jsx
touch frontend/src/pages/dashboards/ProfessorDashboard.jsx
touch frontend/src/pages/dashboards/RegistrarDashboard.jsx
touch frontend/src/pages/dashboards/AdmissionDashboard.jsx
touch frontend/src/pages/dashboards/DeanDashboard.jsx
```

---

## 🔄 Update Existing Files

### backend/package.json
Add this to the file:
```json
{
  "prisma": {
    "seed": "node prisma/seed.js"
  },
  "scripts": {
    "seed": "node prisma/seed.js"
  }
}
```

### backend/src/server.js
Add after existing routes:
```javascript
import authRoutes from './routes/authRoutes.js';
app.use('/api/auth', authRoutes);
```

### frontend/src/App.jsx
- Replace entire file with new routing code

---

## 🚦 Start Everything

### Option 1: Two Terminals

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

### Option 2: Using tmux (Linux/Mac)

```bash
# Create new session
tmux new -s richwell

# Split terminal horizontally
Ctrl+b then "

# In top pane (backend)
cd backend && npm run dev

# Switch to bottom pane
Ctrl+b then down arrow

# In bottom pane (frontend)
cd frontend && npm run dev

# Detach: Ctrl+b then d
# Reattach: tmux attach -t richwell
```

---

## 🧹 Cleanup/Reset Commands

### Reset Database:
```bash
# Drop all tables and recreate
cd backend
npx prisma migrate reset

# This will:
# - Drop database
# - Recreate database
# - Run all migrations
# - Run seed
```

### Clear Frontend Cache:
```bash
cd frontend
rm -rf node_modules .vite
npm install
```

### Clear Backend Cache:
```bash
cd backend
rm -rf node_modules
npm install
npx prisma generate
```

---

## 🔍 Debugging Commands

### Check if ports are in use:
```bash
# Check port 5000 (backend)
lsof -i :5000

# Check port 3000/5173 (frontend)
lsof -i :3000
lsof -i :5173

# Kill process if needed
kill -9 <PID>
```

### Check environment variables:
```bash
# Backend
cd backend
cat .env | grep -v '^#'

# Frontend
cd frontend
cat .env | grep -v '^#'
```

### Check Prisma Client:
```bash
cd backend
npx prisma validate    # Validate schema
npx prisma format      # Format schema
npx prisma generate    # Generate client
```

### View logs:
```bash
# Backend logs (running terminal)
# Frontend logs (running terminal)

# Or redirect to file:
npm run dev > output.log 2>&1
```

---

## 📊 Verification Commands

### Check database seeded correctly:
```bash
mysql -u root -p richwell_portal -e "
SELECT 'Roles:' as Check_Item, COUNT(*) as Count FROM roles
UNION ALL
SELECT 'Users:', COUNT(*) FROM users
UNION ALL
SELECT 'Students:', COUNT(*) FROM students
UNION ALL
SELECT 'Professors:', COUNT(*) FROM professors
UNION ALL
SELECT 'Programs:', COUNT(*) FROM programs;
"
```

Expected output:
```
+-------------+-------+
| Check_Item  | Count |
+-------------+-------+
| Roles:      |     5 |
| Users:      |     5 |
| Students:   |     1 |
| Professors: |     1 |
| Programs:   |     1 |
+-------------+-------+
```

### Check frontend builds:
```bash
cd frontend
npm run build

# If successful, preview:
npm run preview
```

---

## 🎯 Test Flow Commands

```bash
# 1. Start servers (in separate terminals)
cd backend && npm run dev
cd frontend && npm run dev

# 2. Open browser
open http://localhost:5173

# 3. Test login with each role:
# - student@richwell.edu / password123
# - professor@richwell.edu / password123
# - registrar@richwell.edu / password123
# - admission@richwell.edu / password123
# - dean@richwell.edu / password123

# 4. Check browser console (F12)
# - No errors should appear
# - Token should be in localStorage

# 5. Check backend logs
# - Should see login requests
# - Should see 200 status codes
```

---

## 💾 Backup Commands

```bash
# Backup database
mysqldump -u root -p richwell_portal > backup_$(date +%Y%m%d).sql

# Restore database
mysql -u root -p richwell_portal < backup_20241024.sql

# Backup code
cd richwell-portal
tar -czf richwell_backup_$(date +%Y%m%d).tar.gz .
```

---

## ⚙️ One-Line Installers

```bash
# Install everything for Phase 2
cd backend && npx prisma generate && npx prisma migrate dev --name init && npm run seed && cd ../frontend && npm install react-router-dom

# Reset and reseed database
cd backend && npx prisma migrate reset --force && npm run seed

# Full restart
cd backend && npm run dev & cd ../frontend && npm run dev
```

---

## 📱 Testing from Mobile Device

If testing on mobile device over local network:

```bash
# Find your local IP
# Mac/Linux:
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows:
ipconfig | findstr IPv4

# Update frontend/.env:
VITE_API_URL=http://YOUR_LOCAL_IP:5000/api

# Update backend/.env:
CLIENT_URL=http://YOUR_LOCAL_IP:3000

# Restart both servers
# Access from mobile: http://YOUR_LOCAL_IP:3000
```

---

## 🎬 Complete Setup Script

Save this as `setup_phase2.sh`:

```bash
#!/bin/bash

echo "🚀 Setting up Phase 2..."

# Backend
echo "📦 Setting up backend..."
cd backend
npx prisma generate
npx prisma migrate dev --name init
npm run seed

# Frontend
echo "🎨 Setting up frontend..."
cd ../frontend
npm install react-router-dom

echo "✅ Phase 2 setup complete!"
echo "Start backend: cd backend && npm run dev"
echo "Start frontend: cd frontend && npm run dev"
```

Run with: `chmod +x setup_phase2.sh && ./setup_phase2.sh`

---

**🎉 You're all set! Start coding Phase 2!**