import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'

/**
 * Custom API error class for consistent error handling
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Error response shape
 */
export interface ErrorResponse {
  error: string
  code?: string
  details?: any
  statusCode: number
}

/**
 * Centralized error handler for API routes
 * Converts various error types into consistent API responses
 */
export function handleApiError(error: unknown): NextResponse<ErrorResponse> {
  console.error('API Error:', error)

  // Custom API errors
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        details: error.details,
        statusCode: error.statusCode
      },
      { status: error.statusCode }
    )
  }

  // Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.errors.map(e => ({
          path: e.path.join('.'),
          message: e.message
        })),
        statusCode: 400
      },
      { status: 400 }
    )
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        {
          error: 'A record with this value already exists',
          code: 'DUPLICATE_ERROR',
          details: { fields: error.meta?.target },
          statusCode: 409
        },
        { status: 409 }
      )
    }

    // Record not found
    if (error.code === 'P2025') {
      return NextResponse.json(
        {
          error: 'Record not found',
          code: 'NOT_FOUND',
          statusCode: 404
        },
        { status: 404 }
      )
    }

    // Foreign key constraint violation
    if (error.code === 'P2003') {
      return NextResponse.json(
        {
          error: 'Invalid reference to related record',
          code: 'FOREIGN_KEY_ERROR',
          statusCode: 400
        },
        { status: 400 }
      )
    }

    // Generic Prisma error
    return NextResponse.json(
      {
        error: 'Database operation failed',
        code: 'DATABASE_ERROR',
        details: { prismaCode: error.code },
        statusCode: 500
      },
      { status: 500 }
    )
  }

  // Prisma validation errors
  if (error instanceof Prisma.PrismaClientValidationError) {
    return NextResponse.json(
      {
        error: 'Invalid data provided',
        code: 'VALIDATION_ERROR',
        statusCode: 400
      },
      { status: 400 }
    )
  }

  // Generic errors
  if (error instanceof Error) {
    return NextResponse.json(
      {
        error: error.message || 'Internal server error',
        code: 'INTERNAL_ERROR',
        statusCode: 500
      },
      { status: 500 }
    )
  }

  // Unknown errors
  return NextResponse.json(
    {
      error: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
      statusCode: 500
    },
    { status: 500 }
  )
}

/**
 * Helper to create common API errors
 */
export const ApiErrors = {
  notFound: (resource: string) =>
    new ApiError(404, `${resource} not found`, 'NOT_FOUND'),

  badRequest: (message: string, details?: any) =>
    new ApiError(400, message, 'BAD_REQUEST', details),

  unauthorized: (message: string = 'Unauthorized') =>
    new ApiError(401, message, 'UNAUTHORIZED'),

  forbidden: (message: string = 'Forbidden') =>
    new ApiError(403, message, 'FORBIDDEN'),

  conflict: (message: string, details?: any) =>
    new ApiError(409, message, 'CONFLICT', details),

  internal: (message: string = 'Internal server error') =>
    new ApiError(500, message, 'INTERNAL_ERROR')
}
