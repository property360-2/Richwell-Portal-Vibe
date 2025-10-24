// backend/src/controllers/sectionController.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * @desc    Get all sections
 * @route   GET /api/sections
 * @access  Private
 */
export const getAllSections = async (req, res) => {
  try {
    const { subjectId, professorId, semester, schoolYear, status } = req.query;

    const where = {};
    if (subjectId) where.subjectId = parseInt(subjectId);
    if (professorId) where.professorId = parseInt(professorId);
    if (semester) where.semester = semester;
    if (schoolYear) where.schoolYear = schoolYear;
    if (status) where.status = status;

    const sections = await prisma.section.findMany({
      where,
      include: {
        subject: {
          include: {
            program: {
              select: {
                code: true,
                name: true
              }
            }
          }
        },
        professor: {
          include: {
            user: {
              select: {
                email: true
              }
            }
          }
        },
        _count: {
          select: {
            enrollmentSubjects: true
          }
        }
      },
      orderBy: [
        { schoolYear: 'desc' },
        { semester: 'asc' },
        { name: 'asc' }
      ]
    });

    res.status(200).json({
      status: 'success',
      count: sections.length,
      data: sections
    });
  } catch (error) {
    console.error('Get sections error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch sections'
    });
  }
};

/**
 * @desc    Get single section
 * @route   GET /api/sections/:id
 * @access  Private
 */
export const getSection = async (req, res) => {
  try {
    const { id } = req.params;

    const section = await prisma.section.findUnique({
      where: { id: parseInt(id) },
      include: {
        subject: {
          include: {
            program: true,
            prerequisite: true
          }
        },
        professor: {
          include: {
            user: {
              select: {
                id: true,
                email: true
              }
            }
          }
        },
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
    });

    if (!section) {
      return res.status(404).json({
        status: 'error',
        message: 'Section not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: section
    });
  } catch (error) {
    console.error('Get section error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch section'
    });
  }
};

/**
 * @desc    Create section
 * @route   POST /api/sections
 * @access  Private (Registrar, Dean)
 */
export const createSection = async (req, res) => {
  try {
    const {
      name,
      subjectId,
      professorId,
      maxSlots,
      semester,
      schoolYear,
      schedule
    } = req.body;

    // Validation
    if (!name || !subjectId || !professorId || !maxSlots || !semester || !schoolYear) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide all required fields'
      });
    }

    // Verify subject exists
    const subject = await prisma.subject.findUnique({
      where: { id: parseInt(subjectId) }
    });

    if (!subject) {
      return res.status(404).json({
        status: 'error',
        message: 'Subject not found'
      });
    }

    // Verify professor exists
    const professor = await prisma.professor.findUnique({
      where: { id: parseInt(professorId) }
    });

    if (!professor) {
      return res.status(404).json({
        status: 'error',
        message: 'Professor not found'
      });
    }

    // Check for duplicate section
    const existingSection = await prisma.section.findFirst({
      where: {
        name,
        subjectId: parseInt(subjectId),
        semester,
        schoolYear
      }
    });

    if (existingSection) {
      return res.status(400).json({
        status: 'error',
        message: 'Section with this name already exists for this subject and term'
      });
    }

    const section = await prisma.section.create({
      data: {
        name,
        subjectId: parseInt(subjectId),
        professorId: parseInt(professorId),
        maxSlots: parseInt(maxSlots),
        availableSlots: parseInt(maxSlots), // Initially all slots available
        semester,
        schoolYear,
        schedule: schedule || null,
        status: 'open'
      },
      include: {
        subject: true,
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
    });

    res.status(201).json({
      status: 'success',
      message: 'Section created successfully',
      data: section
    });
  } catch (error) {
    console.error('Create section error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create section'
    });
  }
};

/**
 * @desc    Update section
 * @route   PUT /api/sections/:id
 * @access  Private (Registrar, Dean)
 */
export const updateSection = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      professorId,
      maxSlots,
      schedule,
      status
    } = req.body;

    // Check if section exists
    const existingSection = await prisma.section.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: {
            enrollmentSubjects: true
          }
        }
      }
    });

    if (!existingSection) {
      return res.status(404).json({
        status: 'error',
        message: 'Section not found'
      });
    }

    // If changing max slots, ensure it's not less than enrolled students
    if (maxSlots && parseInt(maxSlots) < existingSection._count.enrollmentSubjects) {
      return res.status(400).json({
        status: 'error',
        message: `Cannot set max slots to ${maxSlots}. There are already ${existingSection._count.enrollmentSubjects} enrolled students.`
      });
    }

    // Verify professor if changing
    if (professorId && professorId !== existingSection.professorId) {
      const professor = await prisma.professor.findUnique({
        where: { id: parseInt(professorId) }
      });

      if (!professor) {
        return res.status(404).json({
          status: 'error',
          message: 'Professor not found'
        });
      }
    }

    // Calculate new available slots if max slots changed
    const updateData = {
      ...(name && { name }),
      ...(professorId && { professorId: parseInt(professorId) }),
      ...(schedule !== undefined && { schedule }),
      ...(status && { status })
    };

    if (maxSlots) {
      const enrolledCount = existingSection._count.enrollmentSubjects;
      updateData.maxSlots = parseInt(maxSlots);
      updateData.availableSlots = parseInt(maxSlots) - enrolledCount;
    }

    const section = await prisma.section.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        subject: true,
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
    });

    res.status(200).json({
      status: 'success',
      message: 'Section updated successfully',
      data: section
    });
  } catch (error) {
    console.error('Update section error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update section'
    });
  }
};

/**
 * @desc    Delete section
 * @route   DELETE /api/sections/:id
 * @access  Private (Dean)
 */
export const deleteSection = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if section exists
    const section = await prisma.section.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: {
            enrollmentSubjects: true
          }
        }
      }
    });

    if (!section) {
      return res.status(404).json({
        status: 'error',
        message: 'Section not found'
      });
    }

    // Prevent deletion if section has enrolled students
    if (section._count.enrollmentSubjects > 0) {
      return res.status(400).json({
        status: 'error',
        message: `Cannot delete section. ${section._count.enrollmentSubjects} student(s) are enrolled.`
      });
    }

    await prisma.section.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json({
      status: 'success',
      message: 'Section deleted successfully'
    });
  } catch (error) {
    console.error('Delete section error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete section'
    });
  }
};