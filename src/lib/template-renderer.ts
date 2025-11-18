/**
 * Template Rendering Engine
 *
 * Supports simple variable substitution using {{variableName}} syntax.
 * Keeps it deterministic and simple without AI.
 */

export interface RenderContext {
  [key: string]: string | number | boolean | null | undefined
}

export interface VariantConditions {
  groupSize?: 'small' | 'medium' | 'large'
  location?: 'online' | 'offline'
  moonPhase?: 'new' | 'waxing' | 'full' | 'waning'
  [key: string]: string | number | boolean | undefined
}

/**
 * Renders a template by substituting variables with context values
 * Variables use the syntax: {{variableName}}
 *
 * @param template - The template string with {{variable}} placeholders
 * @param context - Object containing variable values
 * @returns Rendered string with variables replaced
 */
export function renderTemplate(template: string, context: RenderContext): string {
  let rendered = template

  // Replace all {{variableName}} with context values
  rendered = rendered.replace(/\{\{(\w+)\}\}/g, (match, variableName) => {
    const value = context[variableName]

    if (value === null || value === undefined) {
      return match // Keep placeholder if no value provided
    }

    return String(value)
  })

  return rendered
}

/**
 * Checks if a variant's conditions match the provided context
 *
 * @param conditions - The variant's conditions from conditionsJson
 * @param context - The current rendering context
 * @returns true if all conditions match
 */
export function matchesConditions(
  conditions: VariantConditions,
  context: RenderContext
): boolean {
  // If no conditions, it's a default variant
  if (!conditions || Object.keys(conditions).length === 0) {
    return true
  }

  // Check each condition
  for (const [key, value] of Object.entries(conditions)) {
    if (context[key] !== value) {
      return false
    }
  }

  return true
}

/**
 * Selects the best matching variant for the given context
 * Prioritizes variants with more specific conditions
 *
 * @param variants - Array of variants with their conditions
 * @param context - The current rendering context
 * @returns The best matching variant key, or null if no match
 */
export function selectVariant(
  variants: Array<{ variantKey: string; conditions: VariantConditions }>,
  context: RenderContext
): string | null {
  if (variants.length === 0) {
    return null
  }

  // Filter matching variants
  const matchingVariants = variants.filter(v =>
    matchesConditions(v.conditions, context)
  )

  if (matchingVariants.length === 0) {
    return null
  }

  // Sort by specificity (more conditions = more specific)
  matchingVariants.sort((a, b) => {
    const aCount = Object.keys(a.conditions).length
    const bCount = Object.keys(b.conditions).length
    return bCount - aCount // Descending order
  })

  return matchingVariants[0].variantKey
}

/**
 * Renders a complete script with all segments
 *
 * @param segments - Array of script segments with templates
 * @param context - The rendering context
 * @returns Array of rendered segments in order
 */
export function renderScript(
  segments: Array<{
    orderIndex: number
    segmentType: string
    templateMarkdown: string
  }>,
  context: RenderContext
): Array<{
  orderIndex: number
  segmentType: string
  renderedMarkdown: string
}> {
  // Sort segments by orderIndex
  const sortedSegments = [...segments].sort((a, b) => a.orderIndex - b.orderIndex)

  // Render each segment
  return sortedSegments.map(segment => ({
    orderIndex: segment.orderIndex,
    segmentType: segment.segmentType,
    renderedMarkdown: renderTemplate(segment.templateMarkdown, context)
  }))
}

/**
 * Combines rendered segments into a single markdown string
 *
 * @param segments - Array of rendered segments
 * @returns Single markdown string with all segments
 */
export function combineSegments(
  segments: Array<{
    segmentType: string
    renderedMarkdown: string
  }>
): string {
  return segments
    .map(segment => segment.renderedMarkdown)
    .join('\n\n---\n\n') // Separate segments with horizontal rule
}
