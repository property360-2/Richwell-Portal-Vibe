// backend/src/controllers/academicTermController.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * @desc    Get all academic terms
 * @route   GET /api/academic-terms
 * @access  Private
 */
export const getAllTerms = async (req, res) => {
  try {
    const terms = await prisma.academicTerm.findMany({
      include: {
        _count: {
          select: {
            enrollments: true
          }
        }
      },
      orderBy: [
        { schoolYear: 'desc' },
        { semester: 'desc' }
      ]
    });

    res.status(200).json({
      status: 'success',
      count: terms.length,
      data: terms
    });
  } catch (error) {
    console.error('Get terms error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch academic terms'
    });
  }
};

/**
 * @desc    Get active academic term
 * @route   GET /api/academic-terms/active
 * @access  Private
 */
export const getActiveTerm = async (req, res) => {
  try {
    const activeTerm = await prisma.academicTerm.findFirst({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            enrollments: true
          }
        }
      }
    });

    if (!activeTerm) {
      return res.status(404).json({
        status: 'error',
        message: 'No active academic term found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: activeTerm
    });
  } catch (error) {
    console.error('Get active term error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch active term'
    });
  }
};

/**
 * @desc    Get single academic term
 * @route   GET /api/academic-terms/:id
 * @access  Private
 */
export const getTerm = async (req, res) => {
  try {
    const { id } = req.params;

    const term = await prisma.academicTerm.findUnique({
      where: { id: parseInt(id) },
      include: {
        enrollments: {
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
        },
        _count: {
          select: {
            enrollments: true
          }
        }
      }
    });

    if (!term) {
      return res.status(404).json({
        status: 'error',
        message: 'Academic term not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: term
    });
  } catch (error) {
    console.error('Get term error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch academic term'
    });
  }
};

/**
 * @desc    Create academic term
 * @route   POST /api/academic-terms
 * @access  Private (Registrar, Dean)
 */
export const createTerm = async (req, res) => {
  try {
    const { schoolYear, semester, isActive } = req.body;

    // Validation
    if (!schoolYear || !semester) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide school year and semester'
      });
    }

    // Validate school year format (e.g., 2024-2025)
    const yearRegex = /^\d{4}-\d{4}$/;
    if (!yearRegex.test(schoolYear)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid school year format. Use YYYY-YYYY (e.g., 2024-2025)'
      });
    }

    // Check if term already exists
    const existingTerm = await prisma.academicTerm.findFirst({
      where: {
        schoolYear,
        semester
      }
    });

    if (existingTerm) {
      return res.status(400).json({
        status: 'error',
        message: 'Academic term already exists'
      });
    }

    // If setting as active, deactivate other terms
    if (isActive) {
      await prisma.academicTerm.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      });
    }

    const term = await prisma.academicTerm.create({
      data: {
        schoolYear,
        semester,
        isActive: isActive || false
      }
    });

    res.status(201).json({
      status: 'success',
      message: 'Academic term created successfully',
      data: term
    });
  } catch (error) {
    console.error('Create term error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create academic term'
    });
  }
};

/**
 * @desc    Update academic term
 * @route   PUT /api/academic-terms/:id
 * @access  Private (Registrar, Dean)
 */
export const updateTerm = async (req, res) => {
  try {
    const { id } = req.params;
    const { schoolYear, semester, isActive } = req.body;

    // Check if term exists
    const existingTerm = await prisma.academicTerm.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingTerm) {
      return res.status(404).json({
        status: 'error',
        message: 'Academic term not found'
      });
    }

    // Validate school year format if provided
    if (schoolYear) {
      const yearRegex = /^\d{4}-\d{4}$/;
      if (!yearRegex.test(schoolYear)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid school year format. Use YYYY-YYYY (e.g., 2024-2025)'
        });
      }
    }

    // If setting as active, deactivate other terms
    if (isActive === true) {
      await prisma.academicTerm.updateMany({
        where: { 
          isActive: true,
          id: { not: parseInt(id) }
        },
        data: { isActive: false }
      });
    }

    const term = await prisma.academicTerm.update({
      where: { id: parseInt(id) },
      data: {
        ...(schoolYear && { schoolYear }),
        ...(semester && { semester }),
        ...(isActive !== undefined && { isActive })
      }
    });

    res.status(200).json({
      status: 'success',
      message: 'Academic term updated successfully',
      data: term
    });
  } catch (error) {
    console.error('Update term error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update academic term'
    });
  }
};

/**
 * @desc    Set active academic term
 * @route   PUT /api/academic-terms/:id/activate
 * @access  Private (Registrar, Dean)
 */
export const setActiveTerm = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if term exists
    const term = await prisma.academicTerm.findUnique({
      where: { id: parseInt(id) }
    });

    if (!term) {
      return res.status(404).json({
        status: 'error',
        message: 'Academic term not found'
      });
    }

    // Deactivate all other terms
    await prisma.academicTerm.updateMany({
      where: { isActive: true },
      data: { isActive: false }
    });

    // Activate this term
    const activatedTerm = await prisma.academicTerm.update({
      where: { id: parseInt(id) },
      data: { isActive: true }
    });

    res.status(200).json({
      status: 'success',
      message: 'Academic term activated successfully',
      data: activatedTerm
    });
  } catch (error) {
    console.error('Set active term error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to activate academic term'
    });
  }
};

/**
 * @desc    Delete academic term
 * @route   DELETE /api/academic-terms/:id
 * @access  Private (Dean)
 */
export const deleteTerm = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if term exists
    const term = await prisma.academicTerm.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: {
            enrollments: true
          }
        }
      }
    });

    if (!term) {
      return res.status(404).json({
        status: 'error',
        message: 'Academic term not found'
      });
    }

    // Prevent deletion if term is active
    if (term.isActive) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete active academic term. Deactivate it first.'
      });
    }

    // Prevent deletion if term has enrollments
    if (term._count.enrollments > 0) {
      return res.status(400).json({
        status: 'error',
        message: `Cannot delete term. ${term._count.enrollments} enrollment(s) exist.`
      });
    }

    await prisma.academicTerm.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json({
      status: 'success',
      message: 'Academic term deleted successfully'
    });
  } catch (error) {
    console.error('Delete term error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete academic term'
    });
  }
};