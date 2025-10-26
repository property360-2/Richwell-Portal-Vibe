# Environment Setup

## Required Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Database
DATABASE_URL="mysql://username:password@localhost:3306/richwell_portal"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRE="7d"

# Server Configuration
PORT=5000
NODE_ENV="development"

# CORS Configuration
CLIENT_URL="http://localhost:5173"
```

## Database Setup

1. Install MySQL and create a database named `richwell_portal`
2. Update the `DATABASE_URL` with your MySQL credentials
3. Run the following commands:

```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed the database with initial data
npm run seed
```

## Security Notes

- Change the `JWT_SECRET` to a strong, random string in production
- Use environment-specific values for `NODE_ENV` (development, production)
- Ensure your database credentials are secure
