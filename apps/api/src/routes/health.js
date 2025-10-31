'use strict'

const { Router } = require('express')

const router = Router()

router.get('/', async (req, res) => {
  const response = {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    services: {
      database: 'unknown'
    }
  }

  const prisma = req.context?.prisma
  if (prisma) {
    try {
      await prisma.$queryRaw`SELECT 1`
      response.services.database = 'connected'
    } catch (error) {
      response.services.database = 'unreachable'
      req.log?.warn({ err: error }, 'Database ping failed')
    }
  }

  res.json(response)
})

module.exports = router
