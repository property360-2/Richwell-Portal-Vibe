'use strict'

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'production' ? ['error'] : ['query', 'warn', 'error']
})

const disconnect = async () => {
  await prisma.$disconnect()
}

module.exports = {
  prisma,
  disconnect
}
