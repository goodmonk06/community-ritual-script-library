/**
 * Adapter interface definitions for extensibility
 * These allow external systems to plug into the ritual script library
 */

// ============================================================================
// Notification Adapter
// ============================================================================

export interface NotificationPayload {
  title: string
  message: string
  recipientId?: string
  recipientIds?: string[]
  metadata?: Record<string, any>
}

export interface INotificationAdapter {
  /**
   * Send a notification to one or more recipients
   */
  send(payload: NotificationPayload): Promise<void>

  /**
   * Send a batch of notifications
   */
  sendBatch(payloads: NotificationPayload[]): Promise<void>
}

// ============================================================================
// Analytics Adapter
// ============================================================================

export interface AnalyticsEvent {
  eventName: string
  userId?: string
  communityId?: string
  properties?: Record<string, any>
  timestamp?: Date
}

export interface IAnalyticsAdapter {
  /**
   * Track an analytics event
   */
  track(event: AnalyticsEvent): Promise<void>

  /**
   * Track a batch of events
   */
  trackBatch(events: AnalyticsEvent[]): Promise<void>

  /**
   * Identify a user with properties
   */
  identify(userId: string, properties: Record<string, any>): Promise<void>
}

// ============================================================================
// Storage Adapter
// ============================================================================

export interface StorageObject {
  key: string
  data: Buffer | string
  contentType?: string
  metadata?: Record<string, string>
}

export interface IStorageAdapter {
  /**
   * Upload a file to storage
   */
  upload(object: StorageObject): Promise<string> // Returns URL

  /**
   * Download a file from storage
   */
  download(key: string): Promise<Buffer>

  /**
   * Delete a file from storage
   */
  delete(key: string): Promise<void>

  /**
   * Check if a file exists
   */
  exists(key: string): Promise<boolean>

  /**
   * Get a signed URL for temporary access
   */
  getSignedUrl(key: string, expiresIn: number): Promise<string>
}

// ============================================================================
// Audit Adapter
// ============================================================================

export interface AuditEntry {
  action: string
  resourceType: string
  resourceId: string
  userId?: string
  communityId?: string
  before?: any
  after?: any
  metadata?: Record<string, any>
  timestamp?: Date
}

export interface IAuditAdapter {
  /**
   * Log an audit entry
   */
  log(entry: AuditEntry): Promise<void>

  /**
   * Log a batch of audit entries
   */
  logBatch(entries: AuditEntry[]): Promise<void>

  /**
   * Query audit logs
   */
  query(filters: {
    resourceType?: string
    resourceId?: string
    userId?: string
    startDate?: Date
    endDate?: Date
    limit?: number
  }): Promise<AuditEntry[]>
}

// ============================================================================
// Search Adapter
// ============================================================================

export interface SearchQuery {
  query: string
  filters?: Record<string, any>
  limit?: number
  offset?: number
}

export interface SearchResult<T = any> {
  id: string
  data: T
  score: number
  highlights?: Record<string, string[]>
}

export interface SearchResponse<T = any> {
  results: SearchResult<T>[]
  total: number
  took: number // milliseconds
}

export interface ISearchAdapter {
  /**
   * Index a document for search
   */
  index(id: string, document: any, type: string): Promise<void>

  /**
   * Remove a document from search index
   */
  remove(id: string, type: string): Promise<void>

  /**
   * Search for documents
   */
  search<T = any>(query: SearchQuery, type: string): Promise<SearchResponse<T>>

  /**
   * Bulk index documents
   */
  bulkIndex(documents: Array<{ id: string; data: any }>, type: string): Promise<void>
}
