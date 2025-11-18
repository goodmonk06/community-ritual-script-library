/**
 * Adapter Registry
 * Central place to register and retrieve adapters for dependency injection
 */

import type {
  INotificationAdapter,
  IAnalyticsAdapter,
  IStorageAdapter,
  IAuditAdapter,
  ISearchAdapter
} from './types'

import {
  ConsoleNotificationAdapter,
  ConsoleAnalyticsAdapter,
  InMemoryStorageAdapter,
  InMemoryAuditAdapter,
  InMemorySearchAdapter
} from './implementations'

export class AdapterRegistry {
  private notificationAdapter: INotificationAdapter
  private analyticsAdapter: IAnalyticsAdapter
  private storageAdapter: IStorageAdapter
  private auditAdapter: IAuditAdapter
  private searchAdapter: ISearchAdapter

  constructor() {
    // Initialize with default implementations
    this.notificationAdapter = new ConsoleNotificationAdapter()
    this.analyticsAdapter = new ConsoleAnalyticsAdapter()
    this.storageAdapter = new InMemoryStorageAdapter()
    this.auditAdapter = new InMemoryAuditAdapter()
    this.searchAdapter = new InMemorySearchAdapter()
  }

  // Getters
  getNotificationAdapter(): INotificationAdapter {
    return this.notificationAdapter
  }

  getAnalyticsAdapter(): IAnalyticsAdapter {
    return this.analyticsAdapter
  }

  getStorageAdapter(): IStorageAdapter {
    return this.storageAdapter
  }

  getAuditAdapter(): IAuditAdapter {
    return this.auditAdapter
  }

  getSearchAdapter(): ISearchAdapter {
    return this.searchAdapter
  }

  // Setters (for custom implementations)
  setNotificationAdapter(adapter: INotificationAdapter) {
    this.notificationAdapter = adapter
  }

  setAnalyticsAdapter(adapter: IAnalyticsAdapter) {
    this.analyticsAdapter = adapter
  }

  setStorageAdapter(adapter: IStorageAdapter) {
    this.storageAdapter = adapter
  }

  setAuditAdapter(adapter: IAuditAdapter) {
    this.auditAdapter = adapter
  }

  setSearchAdapter(adapter: ISearchAdapter) {
    this.searchAdapter = adapter
  }
}

// Singleton instance
export const adapters = new AdapterRegistry()
