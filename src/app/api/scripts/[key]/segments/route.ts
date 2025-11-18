import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { CreateSegmentInput } from '@/lib/types'

// POST /api/scripts/[key]/segments - Create a new segment
export async function POST(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const { key } = params
    const body: Omit<CreateSegmentInput, 'scriptId'> = await request.json()

    const { orderIndex, segmentType, templateMarkdown, variablesJson } = body

    if (orderIndex === undefined || !segmentType || !templateMarkdown) {
      return NextResponse.json(
        { error: 'orderIndex, segmentType, and templateMarkdown are required' },
        { status: 400 }
      )
    }

    // Get the script
    const script = await prisma.ritualScript.findUnique({
      where: { key }
    })

    if (!script) {
      return NextResponse.json(
        { error: `Script with key '${key}' not found` },
        { status: 404 }
      )
    }

    const segment = await prisma.ritualScriptSegment.create({
      data: {
        scriptId: script.id,
        orderIndex,
        segmentType,
        templateMarkdown,
        variablesJson: JSON.stringify(variablesJson || {})
      }
    })

    return NextResponse.json(segment, { status: 201 })

  } catch (error) {
    console.error('Error creating segment:', error)
    return NextResponse.json(
      { error: 'Failed to create segment' },
      { status: 500 }
    )
  }
}
