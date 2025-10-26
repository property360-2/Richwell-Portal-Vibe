// backend/src/controllers/authController.js
import { PrismaClient } from '@prisma/client';
import { 
  hashPassword, 
  comparePassword, 
  generateToken,
  generateStudentNumber,
  getRoleId 
} from '../utils/auth.js';

const prisma = new PrismaClient();

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide email and password'
      });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
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
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Check if account is active
    if (user.status !== 'active') {
      return res.status(401).json({
        status: 'error',
        message: 'Account is inactive. Please contact administrator.'
      });
    }

    // Generate token
    const token = generateToken(user.id, user.roleId);

    // Prepare user data (exclude password)
    const userData = {
      id: user.id,
      email: user.email,
      role: user.role.name,
      status: user.status,
      ...(user.student && {
        student: {
          id: user.student.id,
          studentNo: user.student.studentNo,
          program: user.student.program.name,
          yearLevel: user.student.yearLevel
        }
      }),
      ...(user.professor && {
        professor: {
          id: user.professor.id,
          department: user.professor.department
        }
      })
    };

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      token,
      user: userData
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Login failed. Please try again.'
    });
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res) => {
  try {
    const user = req.user;

    const userData = {
      id: user.id,
      email: user.email,
      role: user.role.name,
      status: user.status,
      ...(user.student && {
        student: {
          id: user.student.id,
          studentNo: user.student.studentNo,
          program: user.student.program?.name,
          yearLevel: user.student.yearLevel,
          gpa: user.student.gpa,
          hasInc: user.student.hasInc,
          status: user.student.status
        }
      }),
      ...(user.professor && {
        professor: {
          id: user.professor.id,
          department: user.professor.department,
          employmentStatus: user.professor.employmentStatus
        }
      })
    };

    res.status(200).json({
      status: 'success',
      data: {
        user: userData
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get user data'
    });
  }
};

/**
 * @desc    Logout user (client-side token removal)
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = async (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully'
  });
};

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide current and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        status: 'error',
        message: 'New password must be at least 6 characters'
      });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    // Verify current password
    const isPasswordValid = await comparePassword(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    res.status(200).json({
      status: 'success',
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to change password'
    });
  }
};

/**
 * @desc    Setup password for new student (first time login)
 * @route   POST /api/auth/setup-password
 * @access  Public (with temporary token or student ID validation)
 */
export const setupPassword = async (req, res) => {
  try {
    const { studentNo, email, newPassword } = req.body;

    // Validation
    if (!studentNo || !email || !newPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide student number, email, and password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        status: 'error',
        message: 'Password must be at least 6 characters'
      });
    }

    // Find student
    const student = await prisma.student.findUnique({
      where: { studentNo },
      include: { user: true }
    });

    if (!student) {
      return res.status(404).json({
        status: 'error',
        message: 'Student not found'
      });
    }

    // Verify email matches
    if (student.user.email !== email) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Check if password already set (not default)
    // Assuming default password is 'password123' or student number
    const isDefaultPassword = await comparePassword('password123', student.user.password) ||
                             await comparePassword(studentNo, student.user.password);

    if (!isDefaultPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Password already set. Please use login.'
      });
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: student.userId },
      data: { password: hashedPassword }
    });

    res.status(200).json({
      status: 'success',
      message: 'Password setup successful. You can now login.'
    });
  } catch (error) {
    console.error('Setup password error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to setup password'
    });
  }
};