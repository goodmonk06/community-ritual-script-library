import { events, createScriptCreatedEvent, createScriptRenderedEvent } from '../events'

describe('Domain Events', () => {
  beforeEach(() => {
    events.clearAll()
  })

  it('should register and emit events', async () => {
    const handler = jest.fn()

    events.on('script.created', handler)

    const event = createScriptCreatedEvent('script-1', 'test-script', 'community-1')

    await events.emit(event)

    expect(handler).toHaveBeenCalledWith(event)
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('should handle multiple handlers for the same event', async () => {
    const handler1 = jest.fn()
    const handler2 = jest.fn()

    events.on('script.created', handler1)
    events.on('script.created', handler2)

    const event = createScriptCreatedEvent('script-1', 'test-script', 'community-1')

    await events.emit(event)

    expect(handler1).toHaveBeenCalledTimes(1)
    expect(handler2).toHaveBeenCalledTimes(1)
  })

  it('should support once listeners', async () => {
    const handler = jest.fn()

    events.once('script.created', handler)

    const event1 = createScriptCreatedEvent('script-1', 'test-script', 'community-1')
    const event2 = createScriptCreatedEvent('script-2', 'test-script-2', 'community-1')

    await events.emit(event1)
    await events.emit(event2)

    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('should unregister handlers', async () => {
    const handler = jest.fn()

    events.on('script.created', handler)
    events.off('script.created', handler)

    const event = createScriptCreatedEvent('script-1', 'test-script', 'community-1')

    await events.emit(event)

    expect(handler).not.toHaveBeenCalled()
  })

  it('should create script rendered event with correct data', () => {
    const event = createScriptRenderedEvent(
      'script-1',
      'test-script',
      'community-1',
      { facilitator: 'Alice' },
      'variant-1',
      150
    )

    expect(event.type).toBe('script.rendered')
    expect(event.scriptId).toBe('script-1')
    expect(event.contextJson).toEqual({ facilitator: 'Alice' })
    expect(event.selectedVariant).toBe('variant-1')
    expect(event.renderDuration).toBe(150)
    expect(event.timestamp).toBeInstanceOf(Date)
  })

  it('should return handler count', () => {
    const handler1 = jest.fn()
    const handler2 = jest.fn()

    events.on('script.created', handler1)
    events.on('script.created', handler2)

    expect(events.handlerCount('script.created')).toBe(2)
    expect(events.handlerCount('script.updated')).toBe(0)
  })

  it('should handle errors in event handlers gracefully', async () => {
    const errorHandler = jest.fn(() => {
      throw new Error('Handler error')
    })
    const successHandler = jest.fn()

    events.on('script.created', errorHandler)
    events.on('script.created', successHandler)

    const event = createScriptCreatedEvent('script-1', 'test-script', 'community-1')

    // Should not throw
    await expect(events.emit(event)).resolves.toBeUndefined()

    expect(errorHandler).toHaveBeenCalled()
    expect(successHandler).toHaveBeenCalled()
  })
})
