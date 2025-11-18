import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createScriptSchema } from '@/lib/validation'
import { handleApiError, ApiErrors } from '@/lib/api-error'
import { ApiResponse } from '@/lib/api-response'

// GET /api/scripts - List all scripts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const communityId = searchParams.get('communityId')
    const ritualType = searchParams.get('ritualType')

    const where: any = {}
    if (communityId) where.communityId = communityId
    if (ritualType) where.ritualType = ritualType

    const scripts = await prisma.ritualScript.findMany({
      where,
      include: {
        segments: {
          orderBy: { orderIndex: 'asc' }
        },
        variants: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return ApiResponse.success(scripts)
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/scripts - Create a new script
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = createScriptSchema.parse(body)

    // Check if key already exists
    const existing = await prisma.ritualScript.findUnique({
      where: { key: validatedData.key }
    })

    if (existing) {
      throw ApiErrors.conflict(`Script with key '${validatedData.key}' already exists`)
    }

    const script = await prisma.ritualScript.create({
      data: {
        communityId: validatedData.communityId,
        key: validatedData.key,
        title: validatedData.title,
        ritualType: validatedData.ritualType,
        descriptionMarkdown: validatedData.descriptionMarkdown || null
      },
      include: {
        segments: true,
        variants: true
      }
    })

    return ApiResponse.created(script)
  } catch (error) {
    return handleApiError(error)
  }
}
