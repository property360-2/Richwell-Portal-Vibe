'use strict'

const { logger } = require('../lib/logger')

const AUDIT_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

const auditTrail = (prisma) => (req, res, next) => {
  res.locals.auditEntries = []

  req.audit = {
    record (entry) {
      res.locals.auditEntries.push(entry)
    }
  }

  res.on('finish', () => {
    if (!AUDIT_METHODS.has(req.method)) return
    if (res.statusCode >= 400) return
    if (!Array.isArray(res.locals.auditEntries) || res.locals.auditEntries.length === 0) return

    const entries = res.locals.auditEntries.map((entry) => ({
      actorId: entry.actorId,
      action: entry.action,
      tableName: entry.tableName || null,
      recordId: entry.recordId ?? null,
      oldValue: entry.oldValue ? JSON.stringify(entry.oldValue) : null,
      newValue: entry.newValue ? JSON.stringify(entry.newValue) : null
    }))

    Promise.allSettled(
      entries
        .filter((entry) => typeof entry.actorId === 'number' && entry.actorId > 0 && entry.action)
        .map((entry) =>
          prisma.auditTrail
            .create({
              data: {
                actorId: entry.actorId,
                action: entry.action,
                tableName: entry.tableName,
                recordId: entry.recordId,
                oldValue: entry.oldValue,
                newValue: entry.newValue
              }
            })
            .catch((error) => {
              logger.error(
                {
                  error,
                  entry
                },
                'Failed to persist audit trail entry'
              )
            })
        )
    ).catch((error) => {
      logger.error({ error }, 'Audit trail persistence threw')
    })
  })

  next()
}

module.exports = {
  auditTrail
}
