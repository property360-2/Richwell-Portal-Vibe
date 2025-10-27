// backend/src/utils/analytics.js

/**
 * Record an analytics log entry for enrollment status changes.
 *
 * @param {import('@prisma/client').PrismaClient | import('@prisma/client').Prisma.TransactionClient} client
 *   Prisma client or transaction client instance.
 * @param {Object} details
 * @param {number} details.userId - ID of the user that triggered the event.
 * @param {number} details.enrollmentId - ID of the enrollment whose status changed.
 * @param {string} details.status - The new enrollment status.
 * @param {number} [details.termId] - Academic term related to the enrollment.
 * @param {number} [details.studentId] - Student related to the enrollment.
 * @param {string} [details.source] - Origin of the event (self_service, staff, system, etc.).
 * @param {Object} [details.metadata] - Additional metadata to persist with the log.
 * @returns {Promise<void>}
 */
export const recordEnrollmentStatusLog = async (client, details = {}) => {
  const {
    userId,
    enrollmentId,
    status,
    termId = null,
    studentId = null,
    source = 'system',
    metadata = {}
  } = details;

  if (!client || typeof client.analyticsLog?.create !== 'function') {
    throw new Error('A valid Prisma client instance is required to record analytics logs.');
  }

  if (!userId || !enrollmentId || !status) {
    throw new Error('Missing required enrollment status log details.');
  }

  const payload = {
    entity: 'enrollment',
    enrollmentId,
    status,
    termId,
    studentId,
    source,
    metadata,
    occurredAt: new Date().toISOString()
  };

  await client.analyticsLog.create({
    data: {
      userId,
      action: 'enrollment_status',
      description: JSON.stringify(payload)
    }
  });
};

export default {
  recordEnrollmentStatusLog
};
