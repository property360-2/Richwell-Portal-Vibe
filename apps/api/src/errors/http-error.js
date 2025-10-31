'use strict'

class HttpError extends Error {
  constructor (statusCode, message, details) {
    super(message)
    this.statusCode = statusCode
    this.details = details
  }
}

module.exports = {
  HttpError
}
