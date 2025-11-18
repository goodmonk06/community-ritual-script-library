/**
 * Metrics collection for performance monitoring and analytics
 */

export interface MetricLabels {
  [key: string]: string | number | boolean
}

export interface MetricEntry {
  name: string
  value: number
  labels?: MetricLabels
  timestamp: number
}

export type MetricType = 'counter' | 'gauge' | 'histogram'

class Metrics {
  private metrics: Map<string, MetricEntry[]> = new Map()

  /**
   * Record a counter metric (incrementing value)
   */
  counter(name: string, value: number = 1, labels?: MetricLabels) {
    this.record(name, value, labels)
  }

  /**
   * Record a gauge metric (current value)
   */
  gauge(name: string, value: number, labels?: MetricLabels) {
    this.record(name, value, labels)
  }

  /**
   * Record a histogram metric (duration/size measurement)
   */
  histogram(name: string, value: number, labels?: MetricLabels) {
    this.record(name, value, labels)
  }

  /**
   * Measure and record the duration of a function execution
   */
  async measureAsync<T>(
    name: string,
    fn: () => Promise<T>,
    labels?: MetricLabels
  ): Promise<T> {
    const start = Date.now()
    try {
      const result = await fn()
      const duration = Date.now() - start
      this.histogram(`${name}_duration_ms`, duration, labels)
      this.counter(`${name}_success`, 1, labels)
      return result
    } catch (error) {
      const duration = Date.now() - start
      this.histogram(`${name}_duration_ms`, duration, labels)
      this.counter(`${name}_error`, 1, labels)
      throw error
    }
  }

  /**
   * Measure and record the duration of a synchronous function execution
   */
  measure<T>(
    name: string,
    fn: () => T,
    labels?: MetricLabels
  ): T {
    const start = Date.now()
    try {
      const result = fn()
      const duration = Date.now() - start
      this.histogram(`${name}_duration_ms`, duration, labels)
      this.counter(`${name}_success`, 1, labels)
      return result
    } catch (error) {
      const duration = Date.now() - start
      this.histogram(`${name}_duration_ms`, duration, labels)
      this.counter(`${name}_error`, 1, labels)
      throw error
    }
  }

  /**
   * Record a metric
   */
  private record(name: string, value: number, labels?: MetricLabels) {
    const entry: MetricEntry = {
      name,
      value,
      labels,
      timestamp: Date.now()
    }

    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }

    this.metrics.get(name)!.push(entry)

    // In production, send to metrics service (Datadog, Prometheus, etc.)
    if (process.env.NODE_ENV === 'production') {
      // Example: datadog.increment(name, value, labels)
      console.log(JSON.stringify({
        type: 'metric',
        ...entry
      }))
    }
  }

  /**
   * Get all recorded metrics for a given name
   */
  getMetrics(name: string): MetricEntry[] {
    return this.metrics.get(name) || []
  }

  /**
   * Get aggregated stats for a metric
   */
  getStats(name: string): {
    count: number
    sum: number
    avg: number
    min: number
    max: number
  } | null {
    const entries = this.getMetrics(name)
    if (entries.length === 0) return null

    const values = entries.map(e => e.value)
    return {
      count: values.length,
      sum: values.reduce((a, b) => a + b, 0),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values)
    }
  }

  /**
   * Clear all metrics
   */
  clear() {
    this.metrics.clear()
  }

  /**
   * Clear metrics for a specific name
   */
  clearMetric(name: string) {
    this.metrics.delete(name)
  }
}

// Singleton instance
export const metrics = new Metrics()

/**
 * Common metric names
 */
export const MetricNames = {
  // API metrics
  API_REQUEST: 'api_request',
  API_RESPONSE_TIME: 'api_response_time_ms',
  API_ERROR: 'api_error',

  // Script metrics
  SCRIPT_CREATED: 'script_created',
  SCRIPT_UPDATED: 'script_updated',
  SCRIPT_DELETED: 'script_deleted',
  SCRIPT_RENDERED: 'script_rendered',
  SCRIPT_RENDER_DURATION: 'script_render_duration_ms',

  // Variant metrics
  VARIANT_SELECTED: 'variant_selected',
  VARIANT_FALLBACK: 'variant_fallback',

  // Database metrics
  DB_QUERY: 'db_query',
  DB_QUERY_DURATION: 'db_query_duration_ms',
  DB_ERROR: 'db_error',

  // Collection metrics
  COLLECTION_CREATED: 'collection_created',
  COLLECTION_VIEWED: 'collection_viewed',

  // Tag metrics
  TAG_CREATED: 'tag_created',
  TAG_APPLIED: 'tag_applied',

  // Usage metrics
  USAGE_LOG_CREATED: 'usage_log_created',
  SNAPSHOT_CREATED: 'snapshot_created'
} as const
