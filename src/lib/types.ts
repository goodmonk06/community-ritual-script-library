import { RitualType, SegmentType } from '@prisma/client'

export { RitualType, SegmentType }

export interface RitualScript {
  id: string
  communityId: string
  key: string
  title: string
  ritualType: RitualType
  descriptionMarkdown: string | null
  createdAt: Date
  updatedAt: Date
}

export interface RitualScriptSegment {
  id: string
  scriptId: string
  orderIndex: number
  segmentType: SegmentType
  templateMarkdown: string
  variablesJson: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export interface RitualScriptVariant {
  id: string
  scriptId: string
  variantKey: string
  conditionsJson: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export interface RitualScriptWithSegments extends RitualScript {
  segments: RitualScriptSegment[]
  variants: RitualScriptVariant[]
}

export interface CreateScriptInput {
  communityId: string
  key: string
  title: string
  ritualType: RitualType
  descriptionMarkdown?: string
}

export interface CreateSegmentInput {
  scriptId: string
  orderIndex: number
  segmentType: SegmentType
  templateMarkdown: string
  variablesJson?: Record<string, any>
}

export interface CreateVariantInput {
  scriptId: string
  variantKey: string
  conditionsJson: Record<string, any>
}

export interface RenderScriptInput {
  contextJson: Record<string, any>
}

export interface RenderedSegment {
  orderIndex: number
  segmentType: string
  renderedMarkdown: string
}

export interface RenderScriptOutput {
  scriptKey: string
  title: string
  ritualType: string
  segments: RenderedSegment[]
  fullText: string
  selectedVariant: string | null
}
