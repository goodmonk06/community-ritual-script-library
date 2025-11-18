import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { renderScript, combineSegments, selectVariant } from '@/lib/template-renderer'
import type { RenderScriptOutput } from '@/lib/types'

export async function POST(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const { key } = params
    const body = await request.json()
    const { contextJson } = body

    if (!contextJson || typeof contextJson !== 'object') {
      return NextResponse.json(
        { error: 'contextJson is required and must be an object' },
        { status: 400 }
      )
    }

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
      return NextResponse.json(
        { error: `Script with key '${key}' not found` },
        { status: 404 }
      )
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

    return NextResponse.json(output)

  } catch (error) {
    console.error('Error rendering script:', error)
    return NextResponse.json(
      { error: 'Failed to render script' },
      { status: 500 }
    )
  }
}
