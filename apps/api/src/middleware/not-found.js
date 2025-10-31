'use strict'

const notFound = (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.originalUrl
  })
}

module.exports = {
  notFound
}
