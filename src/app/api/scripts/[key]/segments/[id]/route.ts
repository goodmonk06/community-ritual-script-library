import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PUT /api/scripts/[key]/segments/[id] - Update a segment
export async function PUT(
  request: NextRequest,
  { params }: { params: { key: string; id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()

    const { orderIndex, segmentType, templateMarkdown, variablesJson } = body

    const segment = await prisma.ritualScriptSegment.update({
      where: { id },
      data: {
        ...(orderIndex !== undefined && { orderIndex }),
        ...(segmentType && { segmentType }),
        ...(templateMarkdown && { templateMarkdown }),
        ...(variablesJson !== undefined && { variablesJson: JSON.stringify(variablesJson) })
      }
    })

    return NextResponse.json(segment)

  } catch (error) {
    console.error('Error updating segment:', error)
    return NextResponse.json(
      { error: 'Failed to update segment' },
      { status: 500 }
    )
  }
}

// DELETE /api/scripts/[key]/segments/[id] - Delete a segment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { key: string; id: string } }
) {
  try {
    const { id } = params

    await prisma.ritualScriptSegment.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting segment:', error)
    return NextResponse.json(
      { error: 'Failed to delete segment' },
      { status: 500 }
    )
  }
}
