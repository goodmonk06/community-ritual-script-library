import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { CreateScriptInput } from '@/lib/types'

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

    return NextResponse.json(scripts)

  } catch (error) {
    console.error('Error fetching scripts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch scripts' },
      { status: 500 }
    )
  }
}

// POST /api/scripts - Create a new script
export async function POST(request: NextRequest) {
  try {
    const body: CreateScriptInput = await request.json()

    const { communityId, key, title, ritualType, descriptionMarkdown } = body

    if (!communityId || !key || !title || !ritualType) {
      return NextResponse.json(
        { error: 'communityId, key, title, and ritualType are required' },
        { status: 400 }
      )
    }

    // Check if key already exists
    const existing = await prisma.ritualScript.findUnique({
      where: { key }
    })

    if (existing) {
      return NextResponse.json(
        { error: `Script with key '${key}' already exists` },
        { status: 409 }
      )
    }

    const script = await prisma.ritualScript.create({
      data: {
        communityId,
        key,
        title,
        ritualType,
        descriptionMarkdown: descriptionMarkdown || null
      },
      include: {
        segments: true,
        variants: true
      }
    })

    return NextResponse.json(script, { status: 201 })

  } catch (error) {
    console.error('Error creating script:', error)
    return NextResponse.json(
      { error: 'Failed to create script' },
      { status: 500 }
    )
  }
}
