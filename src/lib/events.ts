/**
 * Domain Events System
 * Type-safe event emitter for domain-level events
 */

import { logger } from './logger'

// ============================================================================
// Event Type Definitions
// ============================================================================

export interface ScriptCreatedEvent {
  type: 'script.created'
  scriptId: string
  scriptKey: string
  communityId: string
  createdBy?: string
  timestamp: Date
}

export interface ScriptUpdatedEvent {
  type: 'script.updated'
  scriptId: string
  scriptKey: string
  communityId: string
  updatedBy?: string
  changes: Record<string, any>
  timestamp: Date
}

export interface ScriptDeletedEvent {
  type: 'script.deleted'
  scriptId: string
  scriptKey: string
  communityId: string
  deletedBy?: string
  timestamp: Date
}

export interface ScriptRenderedEvent {
  type: 'script.rendered'
  scriptId: string
  scriptKey: string
  communityId: string
  contextJson: Record<string, any>
  selectedVariant: string | null
  renderDuration: number
  timestamp: Date
}

export interface SegmentCreatedEvent {
  type: 'segment.created'
  segmentId: string
  scriptId: string
  segmentType: string
  timestamp: Date
}

export interface VariantSelectedEvent {
  type: 'variant.selected'
  scriptId: string
  variantKey: string
  contextJson: Record<string, any>
  timestamp: Date
}

export interface CollectionCreatedEvent {
  type: 'collection.created'
  collectionId: string
  collectionKey: string
  communityId: string
  timestamp: Date
}

export interface ScriptAddedToCollectionEvent {
  type: 'collection.script_added'
  collectionId: string
  scriptId: string
  timestamp: Date
}

export interface TagCreatedEvent {
  type: 'tag.created'
  tagId: string
  tagSlug: string
  timestamp: Date
}

export interface TagAppliedEvent {
  type: 'tag.applied'
  tagId: string
  scriptId: string
  timestamp: Date
}

export interface SnapshotCreatedEvent {
  type: 'snapshot.created'
  snapshotId: string
  scriptId: string
  version: number
  createdBy?: string
  timestamp: Date
}

// Union type of all events
export type DomainEvent =
  | ScriptCreatedEvent
  | ScriptUpdatedEvent
  | ScriptDeletedEvent
  | ScriptRenderedEvent
  | SegmentCreatedEvent
  | VariantSelectedEvent
  | CollectionCreatedEvent
  | ScriptAddedToCollectionEvent
  | TagCreatedEvent
  | TagAppliedEvent
  | SnapshotCreatedEvent

// Event handler type
export type EventHandler<T extends DomainEvent = DomainEvent> = (event: T) => void | Promise<void>

// ============================================================================
// Event Emitter
// ============================================================================

class DomainEventEmitter {
  private handlers = new Map<string, Set<EventHandler<any>>>()

  /**
   * Register an event handler for a specific event type
   */
  on<T extends DomainEvent>(eventType: T['type'], handler: EventHandler<T>) {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set())
    }
    this.handlers.get(eventType)!.add(handler)

    logger.debug('Event handler registered', { eventType })

    // Return unsubscribe function
    return () => {
      this.handlers.get(eventType)?.delete(handler)
    }
  }

  /**
   * Register a one-time event handler
   */
  once<T extends DomainEvent>(eventType: T['type'], handler: EventHandler<T>) {
    const wrappedHandler: EventHandler<T> = async (event) => {
      await handler(event)
      this.off(eventType, wrappedHandler)
    }
    return this.on(eventType, wrappedHandler)
  }

  /**
   * Unregister an event handler
   */
  off<T extends DomainEvent>(eventType: T['type'], handler: EventHandler<T>) {
    this.handlers.get(eventType)?.delete(handler)
  }

  /**
   * Emit an event to all registered handlers
   */
  async emit<T extends DomainEvent>(event: T) {
    const handlers = this.handlers.get(event.type)

    if (!handlers || handlers.size === 0) {
      logger.debug('Event emitted with no handlers', { eventType: event.type })
      return
    }

    logger.debug('Event emitted', {
      eventType: event.type,
      handlerCount: handlers.size
    })

    // Execute all handlers (in parallel)
    const promises = Array.from(handlers).map(async (handler) => {
      try {
        await handler(event)
      } catch (error) {
        logger.error('Error in event handler', {
          eventType: event.type,
          error: error instanceof Error ? error.message : String(error)
        })
      }
    })

    await Promise.all(promises)
  }

  /**
   * Remove all handlers for a specific event type
   */
  removeAllHandlers(eventType: DomainEvent['type']) {
    this.handlers.delete(eventType)
  }

  /**
   * Clear all event handlers
   */
  clearAll() {
    this.handlers.clear()
  }

  /**
   * Get the number of handlers for an event type
   */
  handlerCount(eventType: DomainEvent['type']): number {
    return this.handlers.get(eventType)?.size || 0
  }
}

// Singleton instance
export const events = new DomainEventEmitter()

// ============================================================================
// Event Helper Functions
// ============================================================================

/**
 * Create a script created event
 */
export function createScriptCreatedEvent(
  scriptId: string,
  scriptKey: string,
  communityId: string,
  createdBy?: string
): ScriptCreatedEvent {
  return {
    type: 'script.created',
    scriptId,
    scriptKey,
    communityId,
    createdBy,
    timestamp: new Date()
  }
}

/**
 * Create a script rendered event
 */
export function createScriptRenderedEvent(
  scriptId: string,
  scriptKey: string,
  communityId: string,
  contextJson: Record<string, any>,
  selectedVariant: string | null,
  renderDuration: number
): ScriptRenderedEvent {
  return {
    type: 'script.rendered',
    scriptId,
    scriptKey,
    communityId,
    contextJson,
    selectedVariant,
    renderDuration,
    timestamp: new Date()
  }
}

/**
 * Create a script updated event
 */
export function createScriptUpdatedEvent(
  scriptId: string,
  scriptKey: string,
  communityId: string,
  changes: Record<string, any>,
  updatedBy?: string
): ScriptUpdatedEvent {
  return {
    type: 'script.updated',
    scriptId,
    scriptKey,
    communityId,
    changes,
    updatedBy,
    timestamp: new Date()
  }
}
