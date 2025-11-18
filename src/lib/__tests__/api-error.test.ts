import { ApiError, ApiErrors, handleApiError } from '../api-error'
import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'

describe('ApiError', () => {
  it('should create an ApiError with status code and message', () => {
    const error = new ApiError(404, 'Not found', 'NOT_FOUND')

    expect(error.statusCode).toBe(404)
    expect(error.message).toBe('Not found')
    expect(error.code).toBe('NOT_FOUND')
  })

  it('should create common API errors', () => {
    const notFound = ApiErrors.notFound('Script')
    expect(notFound.statusCode).toBe(404)
    expect(notFound.message).toBe('Script not found')

    const badRequest = ApiErrors.badRequest('Invalid input')
    expect(badRequest.statusCode).toBe(400)

    const conflict = ApiErrors.conflict('Duplicate key')
    expect(conflict.statusCode).toBe(409)
  })
})

describe('handleApiError', () => {
  it('should handle ApiError', () => {
    const error = new ApiError(404, 'Not found', 'NOT_FOUND')
    const response = handleApiError(error)

    expect(response.status).toBe(404)
  })

  it('should handle ZodError', () => {
    const zodError = new ZodError([
      {
        code: 'invalid_type',
        expected: 'string',
        received: 'number',
        path: ['name'],
        message: 'Expected string, received number'
      }
    ])

    const response = handleApiError(zodError)

    expect(response.status).toBe(400)
  })

  it('should handle Prisma unique constraint error', () => {
    const prismaError = new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed',
      {
        code: 'P2002',
        clientVersion: '5.0.0',
        meta: { target: ['key'] }
      }
    )

    const response = handleApiError(prismaError)

    expect(response.status).toBe(409)
  })

  it('should handle Prisma not found error', () => {
    const prismaError = new Prisma.PrismaClientKnownRequestError(
      'Record not found',
      {
        code: 'P2025',
        clientVersion: '5.0.0'
      }
    )

    const response = handleApiError(prismaError)

    expect(response.status).toBe(404)
  })

  it('should handle generic Error', () => {
    const error = new Error('Something went wrong')
    const response = handleApiError(error)

    expect(response.status).toBe(500)
  })

  it('should handle unknown errors', () => {
    const response = handleApiError('Some string error')

    expect(response.status).toBe(500)
  })
})
