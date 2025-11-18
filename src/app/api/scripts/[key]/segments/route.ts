import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createSegmentSchema } from '@/lib/validation'
import { handleApiError, ApiErrors } from '@/lib/api-error'
import { ApiResponse } from '@/lib/api-response'

// POST /api/scripts/[key]/segments - Create a new segment
export async function POST(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const { key } = params
    const body = await request.json()

    // Validate input
    const validatedData = createSegmentSchema.parse(body)

    // Get the script
    const script = await prisma.ritualScript.findUnique({
      where: { key }
    })

    if (!script) {
      throw ApiErrors.notFound('Script')
    }

    const segment = await prisma.ritualScriptSegment.create({
      data: {
        scriptId: script.id,
        orderIndex: validatedData.orderIndex,
        segmentType: validatedData.segmentType,
        templateMarkdown: validatedData.templateMarkdown,
        variablesJson: JSON.stringify(validatedData.variablesJson || {})
      }
    })

    return ApiResponse.created(segment)
  } catch (error) {
    return handleApiError(error)
  }
}
