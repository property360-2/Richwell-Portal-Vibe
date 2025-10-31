'use strict'

require('express-async-errors')

const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const pinoHttp = require('pino-http')

const { logger } = require('./lib/logger')
const { prisma } = require('./lib/prisma')
const { requestContext } = require('./middleware/request-context')
const { auditTrail } = require('./middleware/audit-trail')
const { notFound } = require('./middleware/not-found')
const { errorHandler } = require('./middleware/error-handler')
const healthRouter = require('./routes/health')

const createApp = () => {
  const app = express()

  app.disable('x-powered-by')

  app.use(
    cors({
      origin: '*'
    })
  )
  app.use(helmet())
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use(
    pinoHttp({
      logger,
      autoLogging: process.env.NODE_ENV !== 'test'
    })
  )
  app.use(requestContext(prisma))
  app.use(auditTrail(prisma))

  app.get('/', (req, res) => {
    res.json({
      message: 'Richwell Portal API',
      docs: '/docs',
      version: 'v1'
    })
  })

  if (process.env.NODE_ENV === 'test') {
    const { z } = require('zod')
    const { validate } = require('./middleware/validate')

    app.post(
      '/__test__/audit',
      validate(
        z.object({
          actorId: z.number().int().positive(),
          action: z.string().min(1),
          tableName: z.string().min(1),
          recordId: z.number().int().positive(),
          newValue: z.record(z.any()).optional()
        })
      ),
      (req, res) => {
        req.audit.record({
          actorId: req.body.actorId,
          action: req.body.action,
          tableName: req.body.tableName,
          recordId: req.body.recordId,
          newValue: req.body.newValue ?? null
        })
        res.status(201).json({ recorded: true })
      }
    )

    app.post('/__test__/audit-error', (req, res) => {
      req.audit.record({
        actorId: 1,
        action: 'test',
        tableName: 'test_table',
        recordId: 999,
        newValue: { sample: true }
      })
      res.status(422).json({ error: 'invalid' })
    })
  }

  app.use('/health', healthRouter)

  app.use(notFound)
  app.use(errorHandler)

  return app
}

module.exports = {
  createApp
}
