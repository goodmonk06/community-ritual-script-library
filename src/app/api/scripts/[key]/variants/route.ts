import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createVariantSchema } from '@/lib/validation'
import { handleApiError, ApiErrors } from '@/lib/api-error'
import { ApiResponse } from '@/lib/api-response'

// POST /api/scripts/[key]/variants - Create a new variant
export async function POST(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const { key } = params
    const body = await request.json()

    // Validate input
    const validatedData = createVariantSchema.parse(body)

    // Get the script
    const script = await prisma.ritualScript.findUnique({
      where: { key }
    })

    if (!script) {
      throw ApiErrors.notFound('Script')
    }

    const variant = await prisma.ritualScriptVariant.create({
      data: {
        scriptId: script.id,
        variantKey: validatedData.variantKey,
        conditionsJson: JSON.stringify(validatedData.conditionsJson)
      }
    })

    return ApiResponse.created(variant)
  } catch (error) {
    return handleApiError(error)
  }
}
