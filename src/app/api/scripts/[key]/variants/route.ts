import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { CreateVariantInput } from '@/lib/types'

// POST /api/scripts/[key]/variants - Create a new variant
export async function POST(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const { key } = params
    const body: Omit<CreateVariantInput, 'scriptId'> = await request.json()

    const { variantKey, conditionsJson } = body

    if (!variantKey || !conditionsJson) {
      return NextResponse.json(
        { error: 'variantKey and conditionsJson are required' },
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

    const variant = await prisma.ritualScriptVariant.create({
      data: {
        scriptId: script.id,
        variantKey,
        conditionsJson: JSON.stringify(conditionsJson)
      }
    })

    return NextResponse.json(variant, { status: 201 })

  } catch (error) {
    console.error('Error creating variant:', error)
    return NextResponse.json(
      { error: 'Failed to create variant' },
      { status: 500 }
    )
  }
}
