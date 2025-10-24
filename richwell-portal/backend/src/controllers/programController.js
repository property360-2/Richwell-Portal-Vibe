// backend/src/controllers/programController.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * @desc    Get all programs
 * @route   GET /api/programs
 * @access  Private (All roles)
 */
export const getAllPrograms = async (req, res) => {
  try {
    const programs = await prisma.program.findMany({
      include: {
        _count: {
          select: {
            students: true,
            subjects: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.status(200).json({
      status: 'success',
      count: programs.length,
      data: programs
    });
  } catch (error) {
    console.error('Get programs error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch programs'
    });
  }
};

/**
 * @desc    Get single program
 * @route   GET /api/programs/:id
 * @access  Private
 */
export const getProgram = async (req, res) => {
  try {
    const { id } = req.params;

    const program = await prisma.program.findUnique({
      where: { id: parseInt(id) },
      include: {
        students: {
          include: {
            user: {
              select: {
                email: true
              }
            }
          }
        },
        subjects: {
          orderBy: {
            code: 'asc'
          }
        },
        _count: {
          select: {
            students: true,
            subjects: true
          }
        }
      }
    });

    if (!program) {
      return res.status(404).json({
        status: 'error',
        message: 'Program not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: program
    });
  } catch (error) {
    console.error('Get program error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch program'
    });
  }
};

/**
 * @desc    Create program
 * @route   POST /api/programs
 * @access  Private (Dean, Registrar)
 */
export const createProgram = async (req, res) => {
  try {
    const { name, code, description } = req.body;

    // Validation
    if (!name || !code) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide program name and code'
      });
    }

    // Check if code already exists
    const existingProgram = await prisma.program.findUnique({
      where: { code }
    });

    if (existingProgram) {
      return res.status(400).json({
        status: 'error',
        message: 'Program code already exists'
      });
    }

    const program = await prisma.program.create({
      data: {
        name,
        code: code.toUpperCase(),
        description
      }
    });

    res.status(201).json({
      status: 'success',
      message: 'Program created successfully',
      data: program
    });
  } catch (error) {
    console.error('Create program error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create program'
    });
  }
};

/**
 * @desc    Update program
 * @route   PUT /api/programs/:id
 * @access  Private (Dean, Registrar)
 */
export const updateProgram = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, description } = req.body;

    // Check if program exists
    const existingProgram = await prisma.program.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingProgram) {
      return res.status(404).json({
        status: 'error',
        message: 'Program not found'
      });
    }

    // If code is being changed, check if new code already exists
    if (code && code !== existingProgram.code) {
      const codeExists = await prisma.program.findUnique({
        where: { code: code.toUpperCase() }
      });

      if (codeExists) {
        return res.status(400).json({
          status: 'error',
          message: 'Program code already exists'
        });
      }
    }

    const program = await prisma.program.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(code && { code: code.toUpperCase() }),
        ...(description !== undefined && { description })
      }
    });

    res.status(200).json({
      status: 'success',
      message: 'Program updated successfully',
      data: program
    });
  } catch (error) {
    console.error('Update program error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update program'
    });
  }
};

/**
 * @desc    Delete program
 * @route   DELETE /api/programs/:id
 * @access  Private (Dean)
 */
export const deleteProgram = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if program exists
    const program = await prisma.program.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: {
            students: true,
            subjects: true
          }
        }
      }
    });

    if (!program) {
      return res.status(404).json({
        status: 'error',
        message: 'Program not found'
      });
    }

    // Prevent deletion if program has students or subjects
    if (program._count.students > 0) {
      return res.status(400).json({
        status: 'error',
        message: `Cannot delete program. ${program._count.students} student(s) are enrolled in this program.`
      });
    }

    if (program._count.subjects > 0) {
      return res.status(400).json({
        status: 'error',
        message: `Cannot delete program. ${program._count.subjects} subject(s) are assigned to this program.`
      });
    }

    await prisma.program.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json({
      status: 'success',
      message: 'Program deleted successfully'
    });
  } catch (error) {
    console.error('Delete program error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete program'
    });
  }
};