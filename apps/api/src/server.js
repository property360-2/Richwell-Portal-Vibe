'use strict'

const dotenv = require('dotenv')
const http = require('http')

const { createApp } = require('./app')
const { logger } = require('./lib/logger')
const { disconnect: disconnectPrisma } = require('./lib/prisma')

dotenv.config()

const port = Number(process.env.PORT || 4000)
const app = createApp()
const server = http.createServer(app)

server.listen(port, () => {
  logger.info({ port }, 'API server listening')
})

const shutdown = async (reason, error) => {
  if (error) {
    logger.error({ err: error }, 'Fatal server error')
  }

  logger.info({ reason }, 'Gracefully shutting down')

  await disconnectPrisma().catch((disconnectError) => {
    logger.error({ err: disconnectError }, 'Failed to disconnect Prisma')
  })

  server.close(() => process.exit(error ? 1 : 0))
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
process.on('unhandledRejection', (error) => shutdown('unhandledRejection', error))
process.on('uncaughtException', (error) => shutdown('uncaughtException', error))

module.exports = server
