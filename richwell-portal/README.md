# Richwell College Portal

A comprehensive school management system built with modern web technologies, designed for educational institutions to manage enrollment, grades, and academic analytics.

## 🎯 Features

### 👥 **Multi-Role System**
- **Students**: Enrollment, grades viewing, GPA tracking, INC resolution
- **Professors**: Grade entry, section management, class analytics
- **Registrar**: Section management, grade approval, enrollment oversight
- **Admission**: Enrollment workflow, applicant tracking
- **Dean**: Professor assignments, academic oversight, performance analytics

### 📚 **Core Functionality**
- **Enrollment Management**: Complete student enrollment workflow with validation
- **Grade Management**: Professor grade entry with registrar approval system
- **INC Resolution**: Digital workflow for incomplete grade resolution
- **Repeat Logic**: Automatic subject repeat eligibility (Major: 6 months, Minor: 1 year)
- **Analytics Dashboards**: Role-based analytics with interactive charts
- **Academic Data Management**: Programs, subjects, sections, and terms

### 🔧 **Technical Features**
- **Authentication**: JWT-based with role-based access control
- **Database**: MySQL with Prisma ORM
- **Frontend**: React 19 with Tailwind CSS
- **Backend**: Node.js with Express
- **Charts**: Chart.js for interactive analytics
- **Responsive Design**: Mobile-friendly interface

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MySQL 8.0+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd richwell-portal
   ```

2. **Backend Setup**
   ```bash
   cd richwell-portal/backend
   npm install
   
   # Create .env file
   cp .env.example .env
   # Edit .env with your database credentials
   
   # Setup database
   npx prisma migrate dev
   npx prisma generate
   npm run seed
   
   # Start backend
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd richwell-portal/frontend
   npm install
   
   # Start frontend
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 📁 Project Structure

```
richwell-portal/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Business logic
│   │   ├── routes/         # API endpoints
│   │   ├── middleware/     # Authentication
│   │   └── utils/         # Helper functions
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── seed.js        # Sample data
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context
│   │   └── utils/         # Helper functions
│   └── package.json
└── Documentation/         # Project documentation
```

## 🗄️ Database Schema

### Core Tables
- **users**: Authentication and user management
- **students**: Student-specific information
- **professors**: Professor information
- **programs**: Academic programs
- **subjects**: Course catalog with prerequisites
- **sections**: Class sections with professor assignments
- **enrollments**: Student enrollment records
- **grades**: Grade records with approval workflow
- **inc_resolutions**: INC grade resolution tracking

### Key Relationships
- Users → Students/Professors (one-to-one)
- Programs → Subjects (one-to-many)
- Subjects → Sections (one-to-many)
- Students → Enrollments (one-to-many)
- Enrollments → Grades (one-to-many)

## 🔐 Authentication & Authorization

### User Roles
- **student**: Can enroll, view grades, track GPA
- **professor**: Can enter grades, manage sections
- **registrar**: Can approve grades, manage sections
- **admission**: Can manage enrollment workflow
- **dean**: Can assign professors, view analytics

### Security Features
- JWT token authentication
- Password hashing with bcrypt
- Role-based route protection
- Input validation and sanitization

## 📊 Analytics & Reporting

### Student Analytics
- GPA tracking and trends
- Grade distribution charts
- Academic performance over time
- INC subject tracking

### Professor Analytics
- Grade distribution by class
- Class average calculations
- Student performance metrics
- Section load analysis

### Registrar Analytics
- Enrollment statistics
- Grade approval workflows
- Program performance metrics
- Student progress tracking

### Dean Analytics
- Professor workload analysis
- Subject performance metrics
- Course pass rates
- Academic oversight data

## 🔄 Business Logic

### Enrollment Rules
- Maximum 30 units per semester
- Prerequisite validation
- INC blocking for related subjects
- Repeat eligibility enforcement
- Section slot availability

### Grade Management
- Standardized grade values (1.0-5.0, INC, DRP)
- Professor grade entry with dropdown validation
- Registrar approval workflow
- Automatic GPA calculation
- INC resolution tracking

### Repeat Logic
- **Major subjects**: 6 months waiting period
- **Minor subjects**: 1 year waiting period
- Automatic eligibility date calculation
- Enrollment blocking for ineligible subjects

## 🚀 Deployment

### Local Deployment
1. Set up MySQL database
2. Configure environment variables
3. Run database migrations
4. Start backend server
5. Build and serve frontend
6. Configure local network access

### Production Deployment
1. Set up production database
2. Configure environment variables
3. Build frontend for production
4. Deploy backend to server
5. Configure reverse proxy (nginx)
6. Set up SSL certificates
7. Configure domain and DNS

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

### Integration Testing
- Full enrollment workflow
- Grade entry and approval
- INC resolution process
- Analytics data accuracy

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout
- `PUT /api/auth/change-password` - Change password

### Enrollment Endpoints
- `GET /api/enrollments/available-subjects` - Get available subjects
- `GET /api/enrollments/recommended-subjects` - Get recommended subjects
- `POST /api/enrollments/enroll` - Enroll student
- `GET /api/enrollments/history` - Get enrollment history

### Grade Management Endpoints
- `GET /api/grades/sections` - Get professor sections
- `PUT /api/grades/:id` - Update grade
- `GET /api/grades/pending-approval` - Get pending grades
- `PUT /api/grades/:id/approve` - Approve grade

### Analytics Endpoints
- `GET /api/analytics/student` - Student analytics
- `GET /api/analytics/professor` - Professor analytics
- `GET /api/analytics/registrar` - Registrar analytics
- `GET /api/analytics/dean` - Dean analytics

## 🔧 Configuration

### Environment Variables
```env
# Database
DATABASE_URL="mysql://username:password@localhost:3306/richwell_portal"

# JWT
JWT_SECRET="your-secret-key"

# Server
PORT=5000
NODE_ENV=development

# Client
CLIENT_URL="http://localhost:5173"
```

### Database Configuration
- MySQL 8.0+ required
- UTF-8 character set
- InnoDB storage engine
- Proper indexing for performance

## 📈 Performance Optimization

### Backend Optimizations
- Database query optimization
- Connection pooling
- Caching strategies
- API response compression

### Frontend Optimizations
- Code splitting
- Lazy loading
- Image optimization
- Bundle size optimization

## 🛠️ Development

### Code Style
- ESLint configuration
- Prettier formatting
- Consistent naming conventions
- Comprehensive comments

### Git Workflow
- Feature branches
- Pull request reviews
- Automated testing
- Deployment pipelines

## 📞 Support

### Documentation
- API documentation
- User guides
- Developer documentation
- Deployment guides

### Troubleshooting
- Common issues
- Error handling
- Performance tuning
- Security best practices

## 🎯 Future Enhancements

### Planned Features
- Mobile app development
- Advanced reporting
- Integration with external systems
- Real-time notifications
- Advanced analytics
- Multi-language support

### Technical Improvements
- Microservices architecture
- Container deployment
- Advanced caching
- Real-time updates
- Performance monitoring

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📧 Contact

For questions or support, please contact the development team.

---

**Richwell College Portal** - Empowering education through technology.
