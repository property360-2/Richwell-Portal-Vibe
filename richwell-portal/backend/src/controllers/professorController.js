// backend/src/controllers/professorController.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * @desc    Get all professors
 * @route   GET /api/professors
 * @access  Private (Registrar, Dean)
 */
export const getAllProfessors = async (req, res) => {
  try {
    const professors = await prisma.professor.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            status: true,
            createdAt: true
          }
        },
        sections: {
          include: {
            subject: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      status: 'success',
      count: professors.length,
      data: professors
    });
  } catch (error) {
    console.error('Get all professors error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch professors'
    });
  }
};

/**
 * @desc    Get single professor
 * @route   GET /api/professors/:id
 * @access  Private (Registrar, Dean, Professor)
 */
export const getProfessor = async (req, res) => {
  try {
    const { id } = req.params;

    const professor = await prisma.professor.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            status: true,
            createdAt: true
          }
        },
        sections: {
          include: {
            subject: true,
            enrollmentSubjects: {
              include: {
                enrollment: {
                  include: {
                    student: {
                      include: {
                        user: {
                          select: {
                            email: true
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!professor) {
      return res.status(404).json({
        status: 'error',
        message: 'Professor not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: professor
    });
  } catch (error) {
    console.error('Get professor error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch professor'
    });
  }
};

/**
 * @desc    Create new professor
 * @route   POST /api/professors
 * @access  Private (Registrar, Dean)
 */
export const createProfessor = async (req, res) => {
  try {
    const { email, password, department, employmentStatus } = req.body;

    // Validation
    if (!email || !password || !department) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide email, password, and department'
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'User with this email already exists'
      });
    }

    // Get professor role ID
    const professorRole = await prisma.role.findUnique({
      where: { name: 'professor' }
    });

    if (!professorRole) {
      return res.status(500).json({
        status: 'error',
        message: 'Professor role not found'
      });
    }

    // Hash password
    const { hashPassword } = await import('../utils/auth.js');
    const hashedPassword = await hashPassword(password);

    // Create user and professor in transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          roleId: professorRole.id,
          status: 'active'
        }
      });

      const professor = await tx.professor.create({
        data: {
          userId: user.id,
          department,
          employmentStatus: employmentStatus || 'full_time'
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              status: true,
              createdAt: true
            }
          }
        }
      });

      return professor;
    });

    res.status(201).json({
      status: 'success',
      message: 'Professor created successfully',
      data: result
    });
  } catch (error) {
    console.error('Create professor error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create professor'
    });
  }
};

/**
 * @desc    Update professor
 * @route   PUT /api/professors/:id
 * @access  Private (Registrar, Dean, Professor)
 */
export const updateProfessor = async (req, res) => {
  try {
    const { id } = req.params;
    const { department, employmentStatus } = req.body;

    // Check if professor exists
    const existingProfessor = await prisma.professor.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingProfessor) {
      return res.status(404).json({
        status: 'error',
        message: 'Professor not found'
      });
    }

    // Update professor
    const professor = await prisma.professor.update({
      where: { id: parseInt(id) },
      data: {
        ...(department && { department }),
        ...(employmentStatus && { employmentStatus })
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            status: true,
            createdAt: true
          }
        }
      }
    });

    res.status(200).json({
      status: 'success',
      message: 'Professor updated successfully',
      data: professor
    });
  } catch (error) {
    console.error('Update professor error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update professor'
    });
  }
};

/**
 * @desc    Delete professor
 * @route   DELETE /api/professors/:id
 * @access  Private (Dean)
 */
export const deleteProfessor = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if professor exists
    const professor = await prisma.professor.findUnique({
      where: { id: parseInt(id) },
      include: {
        sections: true,
        grades: true
      }
    });

    if (!professor) {
      return res.status(404).json({
        status: 'error',
        message: 'Professor not found'
      });
    }

    // Check if professor has active sections
    const activeSections = professor.sections.filter(section => section.status === 'open');
    if (activeSections.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete professor with active sections'
      });
    }

    // Delete professor and user in transaction
    await prisma.$transaction(async (tx) => {
      await tx.professor.delete({
        where: { id: parseInt(id) }
      });

      await tx.user.delete({
        where: { id: professor.userId }
      });
    });

    res.status(200).json({
      status: 'success',
      message: 'Professor deleted successfully'
    });
  } catch (error) {
    console.error('Delete professor error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete professor'
    });
  }
};

/**
 * @desc    Get professor's sections
 * @route   GET /api/professors/:id/sections
 * @access  Private (Registrar, Dean, Professor)
 */
export const getProfessorSections = async (req, res) => {
  try {
    const { id } = req.params;
    const { termId } = req.query;

    const whereClause = {
      professorId: parseInt(id)
    };

    if (termId) {
      whereClause.semester = termId;
    }

    const sections = await prisma.section.findMany({
      where: whereClause,
      include: {
        subject: true,
        enrollmentSubjects: {
          include: {
            enrollment: {
              include: {
                student: {
                  include: {
                    user: {
                      select: {
                        email: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      status: 'success',
      count: sections.length,
      data: sections
    });
  } catch (error) {
    console.error('Get professor sections error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch professor sections'
    });
  }
};
