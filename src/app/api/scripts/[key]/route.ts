import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateScriptSchema } from '@/lib/validation'
import { handleApiError, ApiErrors } from '@/lib/api-error'
import { ApiResponse } from '@/lib/api-response'

// GET /api/scripts/[key] - Get a specific script
export async function GET(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const { key } = params

    const script = await prisma.ritualScript.findUnique({
      where: { key },
      include: {
        segments: {
          orderBy: { orderIndex: 'asc' }
        },
        variants: true
      }
    })

    if (!script) {
      throw ApiErrors.notFound('Script')
    }

    return ApiResponse.success(script)
  } catch (error) {
    return handleApiError(error)
  }
}

// PUT /api/scripts/[key] - Update a script
export async function PUT(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const { key } = params
    const body = await request.json()

    // Validate input
    const validatedData = updateScriptSchema.parse(body)

    const script = await prisma.ritualScript.update({
      where: { key },
      data: validatedData,
      include: {
        segments: {
          orderBy: { orderIndex: 'asc' }
        },
        variants: true
      }
    })

    return ApiResponse.success(script)
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE /api/scripts/[key] - Delete a script
export async function DELETE(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const { key } = params

    await prisma.ritualScript.delete({
      where: { key }
    })

    return ApiResponse.success({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
