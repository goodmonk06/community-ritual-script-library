/**
 * Default/stub implementations of adapters
 * These provide no-op or in-memory implementations for development and testing
 */

import { logger } from '../logger'
import type {
  INotificationAdapter,
  NotificationPayload,
  IAnalyticsAdapter,
  AnalyticsEvent,
  IStorageAdapter,
  StorageObject,
  IAuditAdapter,
  AuditEntry,
  ISearchAdapter,
  SearchQuery,
  SearchResponse
} from './types'

// ============================================================================
// Console Notification Adapter (logs to console)
// ============================================================================

export class ConsoleNotificationAdapter implements INotificationAdapter {
  async send(payload: NotificationPayload): Promise<void> {
    logger.info('Notification sent', {
      title: payload.title,
      message: payload.message,
      recipientId: payload.recipientId
    })
  }

  async sendBatch(payloads: NotificationPayload[]): Promise<void> {
    for (const payload of payloads) {
      await this.send(payload)
    }
  }
}

// ============================================================================
// Console Analytics Adapter (logs to console)
// ============================================================================

export class ConsoleAnalyticsAdapter implements IAnalyticsAdapter {
  async track(event: AnalyticsEvent): Promise<void> {
    logger.info('Analytics event tracked', {
      eventName: event.eventName,
      userId: event.userId,
      communityId: event.communityId,
      properties: event.properties
    })
  }

  async trackBatch(events: AnalyticsEvent[]): Promise<void> {
    for (const event of events) {
      await this.track(event)
    }
  }

  async identify(userId: string, properties: Record<string, any>): Promise<void> {
    logger.info('User identified', { userId, properties })
  }
}

// ============================================================================
// In-Memory Storage Adapter (for development/testing)
// ============================================================================

export class InMemoryStorageAdapter implements IStorageAdapter {
  private storage = new Map<string, Buffer | string>()
  private metadata = new Map<string, Record<string, string>>()

  async upload(object: StorageObject): Promise<string> {
    const data = typeof object.data === 'string'
      ? Buffer.from(object.data)
      : object.data

    this.storage.set(object.key, data)
    if (object.metadata) {
      this.metadata.set(object.key, object.metadata)
    }

    return `memory://${object.key}`
  }

  async download(key: string): Promise<Buffer> {
    const data = this.storage.get(key)
    if (!data) {
      throw new Error(`File not found: ${key}`)
    }
    return typeof data === 'string' ? Buffer.from(data) : data
  }

  async delete(key: string): Promise<void> {
    this.storage.delete(key)
    this.metadata.delete(key)
  }

  async exists(key: string): Promise<boolean> {
    return this.storage.has(key)
  }

  async getSignedUrl(key: string, expiresIn: number): Promise<string> {
    if (!this.storage.has(key)) {
      throw new Error(`File not found: ${key}`)
    }
    return `memory://${key}?expires=${Date.now() + expiresIn * 1000}`
  }
}

// ============================================================================
// In-Memory Audit Adapter (for development/testing)
// ============================================================================

export class InMemoryAuditAdapter implements IAuditAdapter {
  private entries: AuditEntry[] = []

  async log(entry: AuditEntry): Promise<void> {
    this.entries.push({
      ...entry,
      timestamp: entry.timestamp || new Date()
    })

    logger.debug('Audit entry logged', {
      action: entry.action,
      resourceType: entry.resourceType,
      resourceId: entry.resourceId
    })
  }

  async logBatch(entries: AuditEntry[]): Promise<void> {
    for (const entry of entries) {
      await this.log(entry)
    }
  }

  async query(filters: {
    resourceType?: string
    resourceId?: string
    userId?: string
    startDate?: Date
    endDate?: Date
    limit?: number
  }): Promise<AuditEntry[]> {
    let results = [...this.entries]

    if (filters.resourceType) {
      results = results.filter(e => e.resourceType === filters.resourceType)
    }

    if (filters.resourceId) {
      results = results.filter(e => e.resourceId === filters.resourceId)
    }

    if (filters.userId) {
      results = results.filter(e => e.userId === filters.userId)
    }

    if (filters.startDate) {
      results = results.filter(e =>
        e.timestamp && e.timestamp >= filters.startDate!
      )
    }

    if (filters.endDate) {
      results = results.filter(e =>
        e.timestamp && e.timestamp <= filters.endDate!
      )
    }

    // Sort by timestamp descending
    results.sort((a, b) => {
      const aTime = a.timestamp?.getTime() || 0
      const bTime = b.timestamp?.getTime() || 0
      return bTime - aTime
    })

    if (filters.limit) {
      results = results.slice(0, filters.limit)
    }

    return results
  }
}

// ============================================================================
// In-Memory Search Adapter (simple text search for development)
// ============================================================================

export class InMemorySearchAdapter implements ISearchAdapter {
  private documents = new Map<string, Map<string, any>>()

  async index(id: string, document: any, type: string): Promise<void> {
    if (!this.documents.has(type)) {
      this.documents.set(type, new Map())
    }
    this.documents.get(type)!.set(id, document)
  }

  async remove(id: string, type: string): Promise<void> {
    this.documents.get(type)?.delete(id)
  }

  async search<T = any>(query: SearchQuery, type: string): Promise<SearchResponse<T>> {
    const start = Date.now()
    const docs = this.documents.get(type) || new Map()
    const results: Array<{ id: string; data: T; score: number }> = []

    const queryLower = query.query.toLowerCase()

    for (const [id, doc] of docs.entries()) {
      // Simple text matching across all string fields
      const docStr = JSON.stringify(doc).toLowerCase()
      if (docStr.includes(queryLower)) {
        // Simple scoring based on number of matches
        const matches = (docStr.match(new RegExp(queryLower, 'g')) || []).length
        results.push({
          id,
          data: doc as T,
          score: matches
        })
      }
    }

    // Sort by score descending
    results.sort((a, b) => b.score - a.score)

    // Apply pagination
    const offset = query.offset || 0
    const limit = query.limit || 10
    const paginatedResults = results.slice(offset, offset + limit)

    return {
      results: paginatedResults,
      total: results.length,
      took: Date.now() - start
    }
  }

  async bulkIndex(documents: Array<{ id: string; data: any }>, type: string): Promise<void> {
    for (const doc of documents) {
      await this.index(doc.id, doc.data, type)
    }
  }
}
