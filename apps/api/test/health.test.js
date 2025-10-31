'use strict'

const request = require('supertest')
const { createApp } = require('../src/app')
const { prisma } = require('../src/lib/prisma')

describe('GET /health', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('reports database connection when ping succeeds', async () => {
    jest.spyOn(prisma, '$queryRaw').mockResolvedValueOnce([{ ok: 1 }])
    const app = createApp()

    const response = await request(app).get('/health').expect(200)

    expect(response.body).toEqual(
      expect.objectContaining({
        status: 'ok',
        services: expect.objectContaining({
          database: 'connected'
        })
      })
    )
    expect(response.body).toHaveProperty('timestamp')
    expect(typeof response.body.uptime).toBe('number')
  })

  it('flags database as unreachable when ping fails', async () => {
    jest.spyOn(prisma, '$queryRaw').mockRejectedValueOnce(new Error('connection failed'))
    const app = createApp()

    const response = await request(app).get('/health').expect(200)

    expect(response.body.services.database).toBe('unreachable')
  })
})
