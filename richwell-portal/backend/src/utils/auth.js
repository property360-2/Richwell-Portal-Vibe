// backend/src/utils/auth.js
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

/**
 * Generate JWT token for user
 */
export const generateToken = (userId, roleId) => {
  return jwt.sign(
    { userId, roleId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

/**
 * Verify JWT token
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

/**
 * Hash password
 */
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

/**
 * Compare password with hashed password
 */
export const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

/**
 * Generate student number
 * Format: YYYY-XXXX (e.g., 2024-0001)
 */
export const generateStudentNumber = async (prisma) => {
  const year = new Date().getFullYear();
  
  // Get the latest student number for current year
  const latestStudent = await prisma.student.findFirst({
    where: {
      studentNo: {
        startsWith: `${year}-`
      }
    },
    orderBy: {
      studentNo: 'desc'
    }
  });

  let nextNumber = 1;
  if (latestStudent) {
    const lastNumber = parseInt(latestStudent.studentNo.split('-')[1]);
    nextNumber = lastNumber + 1;
  }

  return `${year}-${String(nextNumber).padStart(4, '0')}`;
};

/**
 * Generate a random temporary password for onboarding
 */
export const generateTemporaryPassword = (length = 12) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i += 1) {
    const index = Math.floor(Math.random() * chars.length);
    password += chars.charAt(index);
  }
  return password;
};

/**
 * Role mappings
 */
export const ROLES = {
  STUDENT: 'student',
  PROFESSOR: 'professor',
  REGISTRAR: 'registrar',
  ADMISSION: 'admission',
  DEAN: 'dean'
};

/**
 * Get role ID from role name
 */
export const getRoleId = async (prisma, roleName) => {
  const role = await prisma.role.findUnique({
    where: { name: roleName }
  });
  return role?.id;
};