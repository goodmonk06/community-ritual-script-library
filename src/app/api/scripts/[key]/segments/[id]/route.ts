import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateSegmentSchema } from '@/lib/validation'
import { handleApiError } from '@/lib/api-error'
import { ApiResponse } from '@/lib/api-response'

// PUT /api/scripts/[key]/segments/[id] - Update a segment
export async function PUT(
  request: NextRequest,
  { params }: { params: { key: string; id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()

    // Validate input
    const validatedData = updateSegmentSchema.parse(body)

    const dataToUpdate: any = {}
    if (validatedData.orderIndex !== undefined) dataToUpdate.orderIndex = validatedData.orderIndex
    if (validatedData.segmentType) dataToUpdate.segmentType = validatedData.segmentType
    if (validatedData.templateMarkdown) dataToUpdate.templateMarkdown = validatedData.templateMarkdown
    if (validatedData.variablesJson !== undefined) dataToUpdate.variablesJson = JSON.stringify(validatedData.variablesJson)

    const segment = await prisma.ritualScriptSegment.update({
      where: { id },
      data: dataToUpdate
    })

    return ApiResponse.success(segment)
  } catch (error) {
    return handleApiError(error)
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

    return ApiResponse.success({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
