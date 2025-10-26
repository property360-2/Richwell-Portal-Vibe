// backend/src/middleware/authMiddleware.js
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../utils/auth.js';

const prisma = new PrismaClient();

/**
 * Protect routes - verify JWT token
 * Usage: router.get('/protected', protect, controller)
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authorized. Please login.'
      });
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid or expired token. Please login again.'
      });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        role: true,
        student: {
          include: {
            program: true
          }
        },
        professor: true
      }
    });

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'User not found.'
      });
    }

    if (user.status !== 'active') {
      return res.status(401).json({
        status: 'error',
        message: 'Account is inactive. Please contact administrator.'
      });
    }

    // Attach user to request object
    req.user = user;
    
    // Add convenience properties for easier access
    if (user.student) {
      req.user.studentId = user.student.id;
    }
    if (user.professor) {
      req.user.professorId = user.professor.id;
    }
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Authentication failed.'
    });
  }
};

/**
 * Role-based access control
 * Usage: router.get('/admin', protect, authorize('registrar', 'dean'), controller)
 * @param {...string} roles - Allowed role names
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authorized.'
      });
    }

    if (!roles.includes(req.user.role.name)) {
      return res.status(403).json({
        status: 'error',
        message: `Access denied. Required role: ${roles.join(' or ')}`,
        yourRole: req.user.role.name
      });
    }

    next();
  };
};

/**
 * Optional: Check if user owns the resource
 * Usage: router.put('/students/:id', protect, checkOwnership('student'), controller)
 */
export const checkOwnership = (resourceType) => {
  return (req, res, next) => {
    const resourceId = parseInt(req.params.id);
    
    switch (resourceType) {
      case 'student':
        if (req.user.student && req.user.student.id === resourceId) {
          return next();
        }
        break;
      case 'professor':
        if (req.user.professor && req.user.professor.id === resourceId) {
          return next();
        }
        break;
      default:
        break;
    }

    // If not owner, check if admin roles
    const adminRoles = ['registrar', 'dean', 'admission'];
    if (adminRoles.includes(req.user.role.name)) {
      return next();
    }

    return res.status(403).json({
      status: 'error',
      message: 'Access denied. You can only access your own resources.'
    });
  };
};