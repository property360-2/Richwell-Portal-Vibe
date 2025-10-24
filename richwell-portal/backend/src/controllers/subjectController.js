// backend/src/controllers/subjectController.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * @desc    Get all subjects
 * @route   GET /api/subjects
 * @access  Private
 */
export const getAllSubjects = async (req, res) => {
  try {
    const { programId, yearStanding, semester } = req.query;

    const where = {};
    if (programId) where.programId = parseInt(programId);
    if (yearStanding) where.yearStanding = yearStanding;
    if (semester) where.recommendedSemester = semester;

    const subjects = await prisma.subject.findMany({
      where,
      include: {
        program: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        prerequisite: {
          select: {
            id: true,
            code: true,
            name: true
          }
        },
        _count: {
          select: {
            sections: true
          }
        }
      },
      orderBy: [
        { code: 'asc' }
      ]
    });

    res.status(200).json({
      status: 'success',
      count: subjects.length,
      data: subjects
    });
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch subjects'
    });
  }
};

/**
 * @desc    Get single subject
 * @route   GET /api/subjects/:id
 * @access  Private
 */
export const getSubject = async (req, res) => {
  try {
    const { id } = req.params;

    const subject = await prisma.subject.findUnique({
      where: { id: parseInt(id) },
      include: {
        program: true,
        prerequisite: true,
        prerequisites: {
          select: {
            id: true,
            code: true,
            name: true
          }
        },
        sections: {
          include: {
            professor: {
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
    });

    if (!subject) {
      return res.status(404).json({
        status: 'error',
        message: 'Subject not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: subject
    });
  } catch (error) {
    console.error('Get subject error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch subject'
    });
  }
};

/**
 * @desc    Create subject
 * @route   POST /api/subjects
 * @access  Private (Dean, Registrar)
 */
export const createSubject = async (req, res) => {
  try {
    const {
      code,
      name,
      units,
      subjectType,
      yearStanding,
      recommendedYear,
      recommendedSemester,
      programId,
      prerequisiteId
    } = req.body;

    // Validation
    if (!code || !name || !units || !subjectType || !programId) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide all required fields'
      });
    }

    // Check if code already exists
    const existingSubject = await prisma.subject.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (existingSubject) {
      return res.status(400).json({
        status: 'error',
        message: 'Subject code already exists'
      });
    }

    // Verify program exists
    const program = await prisma.program.findUnique({
      where: { id: parseInt(programId) }
    });

    if (!program) {
      return res.status(404).json({
        status: 'error',
        message: 'Program not found'
      });
    }

    // Verify prerequisite exists if provided
    if (prerequisiteId) {
      const prerequisite = await prisma.subject.findUnique({
        where: { id: parseInt(prerequisiteId) }
      });

      if (!prerequisite) {
        return res.status(404).json({
          status: 'error',
          message: 'Prerequisite subject not found'
        });
      }
    }

    const subject = await prisma.subject.create({
      data: {
        code: code.toUpperCase(),
        name,
        units: parseInt(units),
        subjectType,
        yearStanding: yearStanding || null,
        recommendedYear: recommendedYear || null,
        recommendedSemester: recommendedSemester || null,
        programId: parseInt(programId),
        prerequisiteId: prerequisiteId ? parseInt(prerequisiteId) : null
      },
      include: {
        program: true,
        prerequisite: true
      }
    });

    res.status(201).json({
      status: 'success',
      message: 'Subject created successfully',
      data: subject
    });
  } catch (error) {
    console.error('Create subject error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create subject'
    });
  }
};

/**
 * @desc    Update subject
 * @route   PUT /api/subjects/:id
 * @access  Private (Dean, Registrar)
 */
export const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      code,
      name,
      units,
      subjectType,
      yearStanding,
      recommendedYear,
      recommendedSemester,
      programId,
      prerequisiteId
    } = req.body;

    // Check if subject exists
    const existingSubject = await prisma.subject.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingSubject) {
      return res.status(404).json({
        status: 'error',
        message: 'Subject not found'
      });
    }

    // If code is being changed, check if new code already exists
    if (code && code.toUpperCase() !== existingSubject.code) {
      const codeExists = await prisma.subject.findUnique({
        where: { code: code.toUpperCase() }
      });

      if (codeExists) {
        return res.status(400).json({
          status: 'error',
          message: 'Subject code already exists'
        });
      }
    }

    // Verify prerequisite if provided
    if (prerequisiteId && prerequisiteId !== existingSubject.prerequisiteId) {
      // Can't be its own prerequisite
      if (parseInt(prerequisiteId) === parseInt(id)) {
        return res.status(400).json({
          status: 'error',
          message: 'Subject cannot be its own prerequisite'
        });
      }

      const prerequisite = await prisma.subject.findUnique({
        where: { id: parseInt(prerequisiteId) }
      });

      if (!prerequisite) {
        return res.status(404).json({
          status: 'error',
          message: 'Prerequisite subject not found'
        });
      }
    }

    const subject = await prisma.subject.update({
      where: { id: parseInt(id) },
      data: {
        ...(code && { code: code.toUpperCase() }),
        ...(name && { name }),
        ...(units && { units: parseInt(units) }),
        ...(subjectType && { subjectType }),
        ...(yearStanding !== undefined && { yearStanding }),
        ...(recommendedYear !== undefined && { recommendedYear }),
        ...(recommendedSemester !== undefined && { recommendedSemester }),
        ...(programId && { programId: parseInt(programId) }),
        ...(prerequisiteId !== undefined && { 
          prerequisiteId: prerequisiteId ? parseInt(prerequisiteId) : null 
        })
      },
      include: {
        program: true,
        prerequisite: true
      }
    });

    res.status(200).json({
      status: 'success',
      message: 'Subject updated successfully',
      data: subject
    });
  } catch (error) {
    console.error('Update subject error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update subject'
    });
  }
};

/**
 * @desc    Delete subject
 * @route   DELETE /api/subjects/:id
 * @access  Private (Dean)
 */
export const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if subject exists
    const subject = await prisma.subject.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: {
            sections: true,
            prerequisites: true
          }
        }
      }
    });

    if (!subject) {
      return res.status(404).json({
        status: 'error',
        message: 'Subject not found'
      });
    }

    // Check if subject has sections
    if (subject._count.sections > 0) {
      return res.status(400).json({
        status: 'error',
        message: `Cannot delete subject. ${subject._count.sections} section(s) exist for this subject.`
      });
    }

    // Check if subject is a prerequisite for other subjects
    if (subject._count.prerequisites > 0) {
      return res.status(400).json({
        status: 'error',
        message: `Cannot delete subject. It is a prerequisite for ${subject._count.prerequisites} other subject(s).`
      });
    }

    await prisma.subject.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json({
      status: 'success',
      message: 'Subject deleted successfully'
    });
  } catch (error) {
    console.error('Delete subject error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete subject'
    });
  }
};