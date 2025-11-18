import { z } from 'zod'
import { RitualType, SegmentType } from '@prisma/client'

/**
 * Validation schemas for API requests using Zod
 */

// Script schemas
export const createScriptSchema = z.object({
  communityId: z.string().min(1, 'Community ID is required'),
  key: z.string()
    .min(1, 'Key is required')
    .regex(/^[a-z0-9-]+$/, 'Key must contain only lowercase letters, numbers, and hyphens'),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  ritualType: z.nativeEnum(RitualType, { errorMap: () => ({ message: 'Invalid ritual type' }) }),
  descriptionMarkdown: z.string().max(2000, 'Description must be less than 2000 characters').optional()
})

export const updateScriptSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  ritualType: z.nativeEnum(RitualType).optional(),
  descriptionMarkdown: z.string().max(2000).optional()
})

// Segment schemas
export const createSegmentSchema = z.object({
  orderIndex: z.number().int().min(0, 'Order index must be a non-negative integer'),
  segmentType: z.nativeEnum(SegmentType, { errorMap: () => ({ message: 'Invalid segment type' }) }),
  templateMarkdown: z.string().min(1, 'Template markdown is required'),
  variablesJson: z.record(z.any()).optional()
})

export const updateSegmentSchema = z.object({
  orderIndex: z.number().int().min(0).optional(),
  segmentType: z.nativeEnum(SegmentType).optional(),
  templateMarkdown: z.string().min(1).optional(),
  variablesJson: z.record(z.any()).optional()
})

// Variant schemas
export const createVariantSchema = z.object({
  variantKey: z.string()
    .min(1, 'Variant key is required')
    .regex(/^[a-z0-9-]+$/, 'Variant key must contain only lowercase letters, numbers, and hyphens'),
  conditionsJson: z.record(z.union([z.string(), z.number(), z.boolean()]))
})

// Render schemas
export const renderScriptSchema = z.object({
  contextJson: z.record(z.union([z.string(), z.number(), z.boolean(), z.null()]))
})

// Type exports for use in API handlers
export type CreateScriptInput = z.infer<typeof createScriptSchema>
export type UpdateScriptInput = z.infer<typeof updateScriptSchema>
export type CreateSegmentInput = z.infer<typeof createSegmentSchema>
export type UpdateSegmentInput = z.infer<typeof updateSegmentSchema>
export type CreateVariantInput = z.infer<typeof createVariantSchema>
export type RenderScriptInput = z.infer<typeof renderScriptSchema>
