'use strict'

const { HttpError } = require('../errors/http-error')

const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    try {
      const result = schema.parse(req[property])
      req[property] = result
      next()
    } catch (error) {
      next(
        new HttpError(400, 'Validation failed', {
          issues: error.issues ?? error.message
        })
      )
    }
  }
}

module.exports = {
  validate
}
