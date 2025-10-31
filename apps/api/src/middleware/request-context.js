'use strict'

const requestContext = (prisma) => (req, res, next) => {
  req.context = req.context || {}
  req.context.prisma = prisma
  next()
}

module.exports = {
  requestContext
}
