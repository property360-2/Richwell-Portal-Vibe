# Richwell Portal - Deployment Guide

## 🚀 Local Deployment

### Prerequisites
- Node.js 18+ installed
- MySQL 8.0+ installed
- Git installed

### Step 1: Database Setup

1. **Create MySQL Database**
   ```sql
   CREATE DATABASE richwell_portal;
   CREATE USER 'richwell_user'@'localhost' IDENTIFIED BY 'your_password';
   GRANT ALL PRIVILEGES ON richwell_portal.* TO 'richwell_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

2. **Configure Environment Variables**
   ```bash
   cd richwell-portal/backend
   cp .env.example .env
   ```
   
   Edit `.env` file:
   ```env
   DATABASE_URL="mysql://richwell_user:your_password@localhost:3306/richwell_portal"
   JWT_SECRET="your-super-secret-jwt-key"
   PORT=5000
   NODE_ENV=development
   CLIENT_URL="http://localhost:5173"
   ```

### Step 2: Backend Setup

1. **Install Dependencies**
   ```bash
   cd richwell-portal/backend
   npm install
   ```

2. **Database Migration**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

3. **Seed Database**
   ```bash
   npm run seed
   ```

4. **Start Backend Server**
   ```bash
   npm run dev
   ```

### Step 3: Frontend Setup

1. **Install Dependencies**
   ```bash
   cd richwell-portal/frontend
   npm install
   ```

2. **Start Frontend Development Server**
   ```bash
   npm run dev
   ```

### Step 4: Access Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Database**: localhost:3306

## 🌐 Network Deployment

### Step 1: Configure Static IP

1. **Set Static IP on Server**
   ```bash
   # Edit network configuration
   sudo nano /etc/netplan/01-netcfg.yaml
   ```

2. **Configure Static IP**
   ```yaml
   network:
     version: 2
     ethernets:
       eth0:
         dhcp4: false
         addresses: [192.168.1.100/24]
         gateway4: 192.168.1.1
         nameservers:
           addresses: [8.8.8.8, 8.8.4.4]
   ```

3. **Apply Configuration**
   ```bash
   sudo netplan apply
   ```

### Step 2: Production Build

1. **Build Frontend**
   ```bash
   cd richwell-portal/frontend
   npm run build
   ```

2. **Configure Backend for Production**
   ```bash
   cd richwell-portal/backend
   # Update .env for production
   NODE_ENV=production
   PORT=5000
   ```

### Step 3: Serve Application

1. **Option A: Using PM2 (Recommended)**
   ```bash
   # Install PM2 globally
   npm install -g pm2
   
   # Start backend with PM2
   cd richwell-portal/backend
   pm2 start src/server.js --name "richwell-backend"
   
   # Serve frontend with PM2
   cd richwell-portal/frontend
   pm2 serve dist 3000 --name "richwell-frontend"
   
   # Save PM2 configuration
   pm2 save
   pm2 startup
   ```

2. **Option B: Using Express Static**
   ```bash
   # Serve frontend from backend
   cd richwell-portal/backend
   # Add static file serving to server.js
   ```

### Step 4: Network Access

1. **Configure Firewall**
   ```bash
   sudo ufw allow 3000
   sudo ufw allow 5000
   sudo ufw enable
   ```

2. **Access from Network**
   - Frontend: http://192.168.1.100:3000
   - Backend API: http://192.168.1.100:5000

## ✅ Post-Deployment Verification

### Analytics Smoke Tests

Run a lightweight verification suite against the deployed backend immediately after each deployment.

1. **Configure environment variables** for the automation user accounts that exist in the target environment:
   ```bash
   export ANALYTICS_BASE_URL="https://api.richwell.edu"
   export ANALYTICS_STUDENT_EMAIL="student.analytics@richwell.edu"
   export ANALYTICS_STUDENT_PASSWORD="<password>"
   export ANALYTICS_PROFESSOR_EMAIL="professor.analytics@richwell.edu"
   export ANALYTICS_PROFESSOR_PASSWORD="<password>"
   export ANALYTICS_REGISTRAR_EMAIL="registrar.analytics@richwell.edu"
   export ANALYTICS_REGISTRAR_PASSWORD="<password>"
   export ANALYTICS_DEAN_EMAIL="dean.analytics@richwell.edu"
   export ANALYTICS_DEAN_PASSWORD="<password>"
   export ANALYTICS_ADMISSION_EMAIL="admission.analytics@richwell.edu"
   export ANALYTICS_ADMISSION_PASSWORD="<password>"
   ```

2. **Execute the smoke test script**
   ```bash
   cd richwell-portal/backend
   npm run postdeploy
   ```

3. **Integrate into CI/CD** by adding a post-deployment step. For GitHub Actions, append to your deployment job:
   ```yaml
   - name: Analytics smoke tests
     working-directory: richwell-portal/backend
     run: npm run postdeploy
     env:
       ANALYTICS_BASE_URL: ${{ secrets.ANALYTICS_BASE_URL }}
       ANALYTICS_STUDENT_EMAIL: ${{ secrets.ANALYTICS_STUDENT_EMAIL }}
       ANALYTICS_STUDENT_PASSWORD: ${{ secrets.ANALYTICS_STUDENT_PASSWORD }}
       ANALYTICS_PROFESSOR_EMAIL: ${{ secrets.ANALYTICS_PROFESSOR_EMAIL }}
       ANALYTICS_PROFESSOR_PASSWORD: ${{ secrets.ANALYTICS_PROFESSOR_PASSWORD }}
       ANALYTICS_REGISTRAR_EMAIL: ${{ secrets.ANALYTICS_REGISTRAR_EMAIL }}
       ANALYTICS_REGISTRAR_PASSWORD: ${{ secrets.ANALYTICS_REGISTRAR_PASSWORD }}
       ANALYTICS_DEAN_EMAIL: ${{ secrets.ANALYTICS_DEAN_EMAIL }}
       ANALYTICS_DEAN_PASSWORD: ${{ secrets.ANALYTICS_DEAN_PASSWORD }}
       ANALYTICS_ADMISSION_EMAIL: ${{ secrets.ANALYTICS_ADMISSION_EMAIL }}
       ANALYTICS_ADMISSION_PASSWORD: ${{ secrets.ANALYTICS_ADMISSION_PASSWORD }}
   ```

The script authenticates each role, hits the `/api/analytics/*` endpoints, and validates the response structure so regressions are detected within the pipeline.

## 🐳 Docker Deployment

### Step 1: Create Dockerfile

**Backend Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN npx prisma generate

EXPOSE 5000

CMD ["npm", "start"]
```

**Frontend Dockerfile:**
```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```

### Step 2: Docker Compose

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: richwell_portal
      MYSQL_USER: richwell_user
      MYSQL_PASSWORD: your_password
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      DATABASE_URL: mysql://richwell_user:your_password@mysql:3306/richwell_portal
      JWT_SECRET: your-super-secret-jwt-key
    depends_on:
      - mysql

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  mysql_data:
```

### Step 3: Deploy with Docker

```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🔒 Security Configuration

### Step 1: SSL Certificate

1. **Install Certbot**
   ```bash
   sudo apt update
   sudo apt install certbot python3-certbot-nginx
   ```

2. **Generate SSL Certificate**
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

### Step 2: Nginx Configuration

**nginx.conf:**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 📊 Monitoring & Maintenance

### Step 1: Log Management

1. **Configure Log Rotation**
   ```bash
   sudo nano /etc/logrotate.d/richwell-portal
   ```

2. **Log Rotation Configuration**
   ```
   /var/log/richwell-portal/*.log {
       daily
       missingok
       rotate 52
       compress
       delaycompress
       notifempty
       create 644 www-data www-data
   }
   ```

### Step 2: Database Backup

1. **Create Backup Script**
   ```bash
   #!/bin/bash
   DATE=$(date +%Y%m%d_%H%M%S)
   mysqldump -u richwell_user -p richwell_portal > /backups/richwell_portal_$DATE.sql
   ```

2. **Schedule Backup**
   ```bash
   # Add to crontab
   0 2 * * * /path/to/backup-script.sh
   ```

### Step 3: Performance Monitoring

1. **Install Monitoring Tools**
   ```bash
   npm install -g pm2-logrotate
   pm2 install pm2-logrotate
   ```

2. **Monitor Application**
   ```bash
   pm2 monit
   pm2 logs
   ```

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Check MySQL service status
   - Verify database credentials
   - Check firewall settings

2. **Port Conflicts**
   - Check if ports are already in use
   - Change ports in configuration
   - Update firewall rules

3. **Build Issues**
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall
   - Check Node.js version compatibility

### Performance Issues

1. **Slow Database Queries**
   - Add database indexes
   - Optimize query performance
   - Consider database connection pooling

2. **High Memory Usage**
   - Monitor PM2 processes
   - Restart services if needed
   - Optimize application code

## 📈 Scaling

### Horizontal Scaling

1. **Load Balancer Configuration**
   ```nginx
   upstream backend {
       server 192.168.1.100:5000;
       server 192.168.1.101:5000;
   }
   ```

2. **Database Clustering**
   - Configure MySQL master-slave replication
   - Implement read/write splitting
   - Add database connection pooling

### Vertical Scaling

1. **Server Optimization**
   - Increase server resources
   - Optimize database configuration
   - Implement caching strategies

2. **Application Optimization**
   - Code splitting
   - Lazy loading
   - Image optimization
   - Bundle size reduction

## 🎯 Production Checklist

- [ ] Database properly configured and secured
- [ ] Environment variables set correctly
- [ ] SSL certificate installed
- [ ] Firewall configured
- [ ] Backup strategy implemented
- [ ] Monitoring tools installed
- [ ] Log rotation configured
- [ ] Performance optimized
- [ ] Security measures in place
- [ ] Documentation updated

## 📞 Support

For deployment issues or questions:
- Check the troubleshooting section
- Review application logs
- Contact the development team
- Refer to the main README.md

---

**Richwell Portal** - Ready for production deployment! 🚀
