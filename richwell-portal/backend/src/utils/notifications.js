// backend/src/utils/notifications.js

/**
 * Queue an email notification by logging it to the analytics log.
 * This allows the asynchronous notification worker to pick it up later.
 */
export const queueEmailNotification = async (prisma, { userId, recipient, subject, body }) => {
  const payload = {
    channel: 'email',
    recipient,
    subject,
    body,
    queuedAt: new Date().toISOString()
  };

  await prisma.analyticsLog.create({
    data: {
      userId,
      action: 'notification_queue',
      description: JSON.stringify(payload)
    }
  });
};

export default {
  queueEmailNotification
};
