import {
  renderTemplate,
  matchesConditions,
  selectVariant,
  renderScript,
  combineSegments
} from '../template-renderer'

describe('Template Renderer', () => {
  describe('renderTemplate', () => {
    it('should replace simple variables', () => {
      const template = 'Hello {{name}}, welcome to {{community}}!'
      const context = { name: 'Sarah', community: 'Mindful Circle' }
      const result = renderTemplate(template, context)

      expect(result).toBe('Hello Sarah, welcome to Mindful Circle!')
    })

    it('should handle missing variables by keeping placeholder', () => {
      const template = 'Hello {{name}}, your score is {{score}}'
      const context = { name: 'John' }
      const result = renderTemplate(template, context)

      expect(result).toBe('Hello John, your score is {{score}}')
    })

    it('should handle null and undefined values', () => {
      const template = 'Value: {{value}}, Other: {{other}}'
      const context = { value: null, other: undefined }
      const result = renderTemplate(template, context)

      expect(result).toBe('Value: {{value}}, Other: {{other}}')
    })

    it('should convert numbers to strings', () => {
      const template = 'Count: {{count}}, Score: {{score}}'
      const context = { count: 42, score: 98.5 }
      const result = renderTemplate(template, context)

      expect(result).toBe('Count: 42, Score: 98.5')
    })

    it('should convert booleans to strings', () => {
      const template = 'Active: {{active}}, Disabled: {{disabled}}'
      const context = { active: true, disabled: false }
      const result = renderTemplate(template, context)

      expect(result).toBe('Active: true, Disabled: false')
    })

    it('should handle multiline templates', () => {
      const template = `Welcome {{name}}!

Today is a {{moonPhase}} moon.
Your community is {{community}}.`

      const context = {
        name: 'Alex',
        moonPhase: 'full',
        community: 'Sacred Circle'
      }

      const result = renderTemplate(template, context)

      expect(result).toContain('Welcome Alex!')
      expect(result).toContain('full moon')
      expect(result).toContain('Sacred Circle')
    })
  })

  describe('matchesConditions', () => {
    it('should match when all conditions are met', () => {
      const conditions = { groupSize: 'large', location: 'online' }
      const context = { groupSize: 'large', location: 'online', moonPhase: 'new' }

      expect(matchesConditions(conditions, context)).toBe(true)
    })

    it('should not match when any condition fails', () => {
      const conditions = { groupSize: 'large', location: 'online' }
      const context = { groupSize: 'small', location: 'online' }

      expect(matchesConditions(conditions, context)).toBe(false)
    })

    it('should match empty conditions (default variant)', () => {
      const conditions = {}
      const context = { groupSize: 'large' }

      expect(matchesConditions(conditions, context)).toBe(true)
    })

    it('should handle null/undefined conditions', () => {
      expect(matchesConditions(null as any, { foo: 'bar' })).toBe(true)
      expect(matchesConditions(undefined as any, { foo: 'bar' })).toBe(true)
    })
  })

  describe('selectVariant', () => {
    it('should select the most specific matching variant', () => {
      const variants = [
        {
          variantKey: 'default',
          conditions: {}
        },
        {
          variantKey: 'online',
          conditions: { location: 'online' }
        },
        {
          variantKey: 'online-large',
          conditions: { location: 'online', groupSize: 'large' }
        }
      ]

      const context = { location: 'online', groupSize: 'large' }

      const result = selectVariant(variants, context)

      expect(result).toBe('online-large')
    })

    it('should fall back to less specific variant when exact match not found', () => {
      const variants = [
        {
          variantKey: 'default',
          conditions: {}
        },
        {
          variantKey: 'online',
          conditions: { location: 'online' }
        }
      ]

      const context = { location: 'online', groupSize: 'large' }

      const result = selectVariant(variants, context)

      expect(result).toBe('online')
    })

    it('should return null when no variants match', () => {
      const variants = [
        {
          variantKey: 'offline',
          conditions: { location: 'offline' }
        }
      ]

      const context = { location: 'online' }

      const result = selectVariant(variants, context)

      expect(result).toBeNull()
    })

    it('should return null when variants array is empty', () => {
      const result = selectVariant([], { foo: 'bar' })

      expect(result).toBeNull()
    })

    it('should prioritize by number of conditions', () => {
      const variants = [
        {
          variantKey: 'three-conditions',
          conditions: { a: '1', b: '2', c: '3' }
        },
        {
          variantKey: 'two-conditions',
          conditions: { a: '1', b: '2' }
        },
        {
          variantKey: 'one-condition',
          conditions: { a: '1' }
        }
      ]

      const context = { a: '1', b: '2', c: '3', d: '4' }

      const result = selectVariant(variants, context)

      expect(result).toBe('three-conditions')
    })
  })

  describe('renderScript', () => {
    it('should render all segments in order', () => {
      const segments = [
        {
          orderIndex: 0,
          segmentType: 'opening',
          templateMarkdown: 'Welcome to {{community}}'
        },
        {
          orderIndex: 1,
          segmentType: 'core',
          templateMarkdown: 'Today we celebrate the {{moonPhase}} moon'
        },
        {
          orderIndex: 2,
          segmentType: 'closing',
          templateMarkdown: 'Thank you, {{facilitator}}'
        }
      ]

      const context = {
        community: 'Sacred Circle',
        moonPhase: 'full',
        facilitator: 'Maria'
      }

      const result = renderScript(segments, context)

      expect(result).toHaveLength(3)
      expect(result[0].renderedMarkdown).toBe('Welcome to Sacred Circle')
      expect(result[1].renderedMarkdown).toBe('Today we celebrate the full moon')
      expect(result[2].renderedMarkdown).toBe('Thank you, Maria')
    })

    it('should sort segments by orderIndex', () => {
      const segments = [
        {
          orderIndex: 2,
          segmentType: 'closing',
          templateMarkdown: 'End'
        },
        {
          orderIndex: 0,
          segmentType: 'opening',
          templateMarkdown: 'Start'
        },
        {
          orderIndex: 1,
          segmentType: 'core',
          templateMarkdown: 'Middle'
        }
      ]

      const result = renderScript(segments, {})

      expect(result[0].renderedMarkdown).toBe('Start')
      expect(result[1].renderedMarkdown).toBe('Middle')
      expect(result[2].renderedMarkdown).toBe('End')
    })

    it('should preserve segmentType and orderIndex', () => {
      const segments = [
        {
          orderIndex: 0,
          segmentType: 'blessing',
          templateMarkdown: 'Blessed be'
        }
      ]

      const result = renderScript(segments, {})

      expect(result[0].orderIndex).toBe(0)
      expect(result[0].segmentType).toBe('blessing')
    })
  })

  describe('combineSegments', () => {
    it('should join segments with horizontal rule separator', () => {
      const segments = [
        {
          segmentType: 'opening',
          renderedMarkdown: 'First part'
        },
        {
          segmentType: 'core',
          renderedMarkdown: 'Second part'
        },
        {
          segmentType: 'closing',
          renderedMarkdown: 'Third part'
        }
      ]

      const result = combineSegments(segments)

      expect(result).toBe('First part\n\n---\n\nSecond part\n\n---\n\nThird part')
    })

    it('should handle single segment', () => {
      const segments = [
        {
          segmentType: 'opening',
          renderedMarkdown: 'Only part'
        }
      ]

      const result = combineSegments(segments)

      expect(result).toBe('Only part')
    })

    it('should handle empty segments array', () => {
      const result = combineSegments([])

      expect(result).toBe('')
    })
  })

  describe('Integration tests', () => {
    it('should render a complete ritual script', () => {
      const segments = [
        {
          orderIndex: 0,
          segmentType: 'opening',
          templateMarkdown: `# Opening Circle

Welcome, {{facilitator}}, to our {{moonPhase}} moon gathering.
We gather as {{community}} with {{groupSize}} hearts.`
        },
        {
          orderIndex: 1,
          segmentType: 'core',
          templateMarkdown: `# Core Practice

In this {{location}} space, we honor the {{moonPhase}} moon.
Let us {{action}} together.`
        },
        {
          orderIndex: 2,
          segmentType: 'closing',
          templateMarkdown: `# Closing

Thank you for gathering, {{community}}.
Blessed be.`
        }
      ]

      const context = {
        facilitator: 'Elena',
        moonPhase: 'new',
        community: 'Lunar Circle',
        groupSize: 'small',
        location: 'online',
        action: 'set intentions'
      }

      const rendered = renderScript(segments, context)
      const fullText = combineSegments(rendered)

      expect(fullText).toContain('Welcome, Elena')
      expect(fullText).toContain('new moon gathering')
      expect(fullText).toContain('Lunar Circle')
      expect(fullText).toContain('small hearts')
      expect(fullText).toContain('online space')
      expect(fullText).toContain('set intentions')
      expect(fullText).toContain('---') // Separator
    })

    it('should select and render with the correct variant', () => {
      const variants = [
        {
          variantKey: 'default',
          conditions: {}
        },
        {
          variantKey: 'new-moon-online',
          conditions: { moonPhase: 'new', location: 'online' }
        },
        {
          variantKey: 'full-moon-offline',
          conditions: { moonPhase: 'full', location: 'offline' }
        }
      ]

      const context = { moonPhase: 'new', location: 'online' }

      const selectedVariant = selectVariant(variants, context)

      expect(selectedVariant).toBe('new-moon-online')
    })
  })
})
