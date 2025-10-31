'use strict'

const request = require('supertest')

const { createApp } = require('../src/app')
const { prisma } = require('../src/lib/prisma')

const flushPromises = () => new Promise((resolve) => setImmediate(resolve))

describe('audit middleware', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('persists audit entry for successful mutating requests', async () => {
    const auditSpy = jest.spyOn(prisma.auditTrail, 'create').mockResolvedValue({
      id: 1,
      actorId: 1,
      action: 'create',
      tableName: 'students',
      recordId: 123,
      newValue: JSON.stringify({ foo: 'bar' })
    })

    const app = createApp()

    await request(app)
      .post('/__test__/audit')
      .send({
        actorId: 1,
        action: 'create',
        tableName: 'students',
        recordId: 123,
        newValue: { foo: 'bar' }
      })
      .expect(201)

    await flushPromises()

    expect(auditSpy).toHaveBeenCalledTimes(1)
    expect(auditSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          actorId: 1,
          action: 'create',
          tableName: 'students',
          recordId: 123,
          newValue: JSON.stringify({ foo: 'bar' })
        })
      })
    )
  })

  it('skips persistence when the response returns an error status', async () => {
    const auditSpy = jest.spyOn(prisma.auditTrail, 'create').mockResolvedValue({
      id: 1
    })

    const app = createApp()

    await request(app).post('/__test__/audit-error').expect(422)

    await flushPromises()

    expect(auditSpy).not.toHaveBeenCalled()
  })

  it('validates payloads before audit logging', async () => {
    const auditSpy = jest.spyOn(prisma.auditTrail, 'create').mockResolvedValue({
      id: 1
    })

    const app = createApp()

    const response = await request(app)
      .post('/__test__/audit')
      .send({ action: 'create' })
      .expect(400)

    expect(response.body.error).toBe('Validation failed')
    expect(auditSpy).not.toHaveBeenCalled()
  })
})
