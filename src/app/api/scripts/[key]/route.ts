import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
      return NextResponse.json(
        { error: `Script with key '${key}' not found` },
        { status: 404 }
      )
    }

    return NextResponse.json(script)

  } catch (error) {
    console.error('Error fetching script:', error)
    return NextResponse.json(
      { error: 'Failed to fetch script' },
      { status: 500 }
    )
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

    const { title, ritualType, descriptionMarkdown } = body

    const script = await prisma.ritualScript.update({
      where: { key },
      data: {
        ...(title && { title }),
        ...(ritualType && { ritualType }),
        ...(descriptionMarkdown !== undefined && { descriptionMarkdown })
      },
      include: {
        segments: {
          orderBy: { orderIndex: 'asc' }
        },
        variants: true
      }
    })

    return NextResponse.json(script)

  } catch (error) {
    console.error('Error updating script:', error)
    return NextResponse.json(
      { error: 'Failed to update script' },
      { status: 500 }
    )
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

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting script:', error)
    return NextResponse.json(
      { error: 'Failed to delete script' },
      { status: 500 }
    )
  }
}
