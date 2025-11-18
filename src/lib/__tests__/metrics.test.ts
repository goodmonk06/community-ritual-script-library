import { metrics, Metrics, MetricNames } from '../metrics'

describe('Metrics', () => {
  let metricsInstance: Metrics

  beforeEach(() => {
    metricsInstance = new Metrics()
  })

  it('should record counter metrics', () => {
    metricsInstance.counter('test_counter', 1)
    metricsInstance.counter('test_counter', 5)

    const stats = metricsInstance.getStats('test_counter')

    expect(stats).not.toBeNull()
    expect(stats!.count).toBe(2)
    expect(stats!.sum).toBe(6)
  })

  it('should record gauge metrics', () => {
    metricsInstance.gauge('test_gauge', 42)
    metricsInstance.gauge('test_gauge', 100)

    const stats = metricsInstance.getStats('test_gauge')

    expect(stats).not.toBeNull()
    expect(stats!.count).toBe(2)
    expect(stats!.max).toBe(100)
    expect(stats!.min).toBe(42)
  })

  it('should record histogram metrics', () => {
    metricsInstance.histogram('test_histogram', 10)
    metricsInstance.histogram('test_histogram', 20)
    metricsInstance.histogram('test_histogram', 30)

    const stats = metricsInstance.getStats('test_histogram')

    expect(stats).not.toBeNull()
    expect(stats!.avg).toBe(20)
    expect(stats!.min).toBe(10)
    expect(stats!.max).toBe(30)
  })

  it('should measure async function duration', async () => {
    const asyncFn = async () => {
      await new Promise(resolve => setTimeout(resolve, 50))
      return 'result'
    }

    const result = await metricsInstance.measureAsync('test_async', asyncFn)

    expect(result).toBe('result')

    const durationStats = metricsInstance.getStats('test_async_duration_ms')
    expect(durationStats).not.toBeNull()
    expect(durationStats!.min).toBeGreaterThanOrEqual(45)

    const successStats = metricsInstance.getStats('test_async_success')
    expect(successStats!.sum).toBe(1)
  })

  it('should measure sync function duration', () => {
    const syncFn = () => {
      let sum = 0
      for (let i = 0; i < 1000; i++) {
        sum += i
      }
      return sum
    }

    const result = metricsInstance.measure('test_sync', syncFn)

    expect(result).toBeGreaterThan(0)

    const durationStats = metricsInstance.getStats('test_sync_duration_ms')
    expect(durationStats).not.toBeNull()

    const successStats = metricsInstance.getStats('test_sync_success')
    expect(successStats!.sum).toBe(1)
  })

  it('should record errors in measured functions', async () => {
    const errorFn = async () => {
      throw new Error('Test error')
    }

    await expect(
      metricsInstance.measureAsync('test_error', errorFn)
    ).rejects.toThrow('Test error')

    const errorStats = metricsInstance.getStats('test_error_error')
    expect(errorStats!.sum).toBe(1)

    const durationStats = metricsInstance.getStats('test_error_duration_ms')
    expect(durationStats).not.toBeNull()
  })

  it('should support metric labels', () => {
    metricsInstance.counter('api_request', 1, { endpoint: '/api/scripts', method: 'GET' })
    metricsInstance.counter('api_request', 1, { endpoint: '/api/scripts', method: 'POST' })

    const metrics = metricsInstance.getMetrics('api_request')

    expect(metrics).toHaveLength(2)
    expect(metrics[0].labels).toEqual({ endpoint: '/api/scripts', method: 'GET' })
    expect(metrics[1].labels).toEqual({ endpoint: '/api/scripts', method: 'POST' })
  })

  it('should calculate correct statistics', () => {
    metricsInstance.histogram('test_stats', 10)
    metricsInstance.histogram('test_stats', 20)
    metricsInstance.histogram('test_stats', 30)
    metricsInstance.histogram('test_stats', 40)
    metricsInstance.histogram('test_stats', 50)

    const stats = metricsInstance.getStats('test_stats')

    expect(stats).not.toBeNull()
    expect(stats!.count).toBe(5)
    expect(stats!.sum).toBe(150)
    expect(stats!.avg).toBe(30)
    expect(stats!.min).toBe(10)
    expect(stats!.max).toBe(50)
  })

  it('should return null stats for non-existent metrics', () => {
    const stats = metricsInstance.getStats('non_existent')

    expect(stats).toBeNull()
  })

  it('should clear metrics', () => {
    metricsInstance.counter('test_metric', 1)

    expect(metricsInstance.getStats('test_metric')).not.toBeNull()

    metricsInstance.clear()

    expect(metricsInstance.getStats('test_metric')).toBeNull()
  })

  it('should clear specific metrics', () => {
    metricsInstance.counter('metric1', 1)
    metricsInstance.counter('metric2', 1)

    metricsInstance.clearMetric('metric1')

    expect(metricsInstance.getStats('metric1')).toBeNull()
    expect(metricsInstance.getStats('metric2')).not.toBeNull()
  })

  it('should have predefined metric names', () => {
    expect(MetricNames.SCRIPT_RENDERED).toBe('script_rendered')
    expect(MetricNames.API_REQUEST).toBe('api_request')
    expect(MetricNames.DB_QUERY_DURATION).toBe('db_query_duration_ms')
  })
})
