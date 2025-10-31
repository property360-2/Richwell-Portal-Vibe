'use strict'

const { ZodError } = require('zod')
const { HttpError } = require('../errors/http-error')
const { logger } = require('../lib/logger')

const errorHandler = (err, req, res, next) => {
  if (err instanceof HttpError) {
    res.status(err.statusCode).json({
      error: err.message,
      details: err.details ?? null
    })
    return
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation failed',
      details: err.flatten()
    })
    return
  }

  logger.error(
    {
      err,
      path: req.originalUrl,
      method: req.method
    },
    'Unhandled error'
  )

  res.status(500).json({
    error: 'Internal Server Error'
  })
}

module.exports = {
  errorHandler
}
