import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { renderScript, combineSegments, selectVariant } from '@/lib/template-renderer'
import { renderScriptSchema } from '@/lib/validation'
import { handleApiError, ApiErrors } from '@/lib/api-error'
import { ApiResponse } from '@/lib/api-response'
import type { RenderScriptOutput } from '@/lib/types'

export async function POST(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const { key } = params
    const body = await request.json()

    // Validate input
    const { contextJson } = renderScriptSchema.parse(body)

    // Fetch the script with segments and variants
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

    // Select the best matching variant
    const variantData = script.variants.map(v => ({
      variantKey: v.variantKey,
      conditions: typeof v.conditionsJson === 'string'
        ? JSON.parse(v.conditionsJson)
        : v.conditionsJson as Record<string, any>
    }))

    const selectedVariantKey = selectVariant(variantData, contextJson)

    // Render each segment
    const segmentsData = script.segments.map(s => ({
      orderIndex: s.orderIndex,
      segmentType: s.segmentType,
      templateMarkdown: s.templateMarkdown
    }))

    const renderedSegments = renderScript(segmentsData, contextJson)

    // Combine into full text
    const fullText = combineSegments(renderedSegments)

    const output: RenderScriptOutput = {
      scriptKey: script.key,
      title: script.title,
      ritualType: script.ritualType,
      segments: renderedSegments,
      fullText,
      selectedVariant: selectedVariantKey
    }

    return ApiResponse.success(output)
  } catch (error) {
    return handleApiError(error)
  }
}
