import { useState, useEffect, useCallback, useRef } from 'react'
import cachedApiClient from '../utils/apiClientCached'
import { debounce } from '../utils/performanceOptimizer'

// Generic optimized API hook
export function useOptimizedApi(apiCall, dependencies = [], options = {}) {
  const {
    immediate = true,
    debounceMs = 0,
    retryAttempts = 3,
    retryDelay = 1000,
    onSuccess,
    onError
  } = options

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const abortControllerRef = useRef(null)
  const retryCountRef = useRef(0)

  const executeApiCall = useCallback(async (...args) => {
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()
    setLoading(true)
    setError(null)

    try {
      const result = await apiCall(...args)
      setData(result)
      retryCountRef.current = 0
      
      if (onSuccess) {
        onSuccess(result)
      }
      
      return result
    } catch (err) {
      if (err.name === 'AbortError') {
        return // Request was cancelled
      }

      // Retry logic
      if (retryCountRef.current < retryAttempts) {
        retryCountRef.current++
        setTimeout(() => {
          executeApiCall(...args)
        }, retryDelay * retryCountRef.current)
        return
      }

      setError(err)
      
      if (onError) {
        onError(err)
      }
      
      throw err
    } finally {
      setLoading(false)
    }
  }, [apiCall, retryAttempts, retryDelay, onSuccess, onError])

  // Debounced version for search/input scenarios
  const debouncedExecute = useCallback(
    debounceMs > 0 ? debounce(executeApiCall, debounceMs) : executeApiCall,
    [executeApiCall, debounceMs]
  )

  useEffect(() => {
    if (immediate && dependencies.every(dep => dep !== undefined)) {
      executeApiCall()
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, dependencies)

  const refetch = useCallback(() => {
    return executeApiCall()
  }, [executeApiCall])

  return {
    data,
    loading,
    error,
    refetch,
    execute: debouncedExecute
  }
}

// Optimized customers hook
export function useCustomers(params = {}) {
  return useOptimizedApi(
    () => cachedApiClient.getCustomers(params),
    [JSON.stringify(params)],
    {
      immediate: true,
      debounceMs: 300 // Debounce for search scenarios
    }
  )
}

// Optimized customer details hook
export function useCustomer(customerId) {
  return useOptimizedApi(
    () => cachedApiClient.getCustomer(customerId),
    [customerId],
    {
      immediate: !!customerId
    }
  )
}

// Optimized jobs hook
export function useJobs(params = {}) {
  return useOptimizedApi(
    () => cachedApiClient.getJobs(params),
    [JSON.stringify(params)],
    {
      immediate: true
    }
  )
}

// Optimized analytics hook
export function useAnalytics() {
  const [summaryData, setSummaryData] = useState(null)
  const [revenueData, setRevenueData] = useState(null)
  const [customersData, setCustomersData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadAnalytics = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Load analytics data in parallel
      const [summary, revenue, customers] = await Promise.all([
        cachedApiClient.getAnalyticsSummary(),
        cachedApiClient.getRevenueByMonth(),
        cachedApiClient.getTopCustomers()
      ])

      setSummaryData(summary)
      setRevenueData(revenue)
      setCustomersData(customers)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAnalytics()
  }, [loadAnalytics])

  return {
    summaryData,
    revenueData,
    customersData,
    loading,
    error,
    refetch: loadAnalytics
  }
}

// Optimized search hook with debouncing
export function useSearch(searchFunction, initialQuery = '', debounceMs = 500) {
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const debouncedSearch = useCallback(
    debounce(async (searchQuery) => {
      if (!searchQuery.trim()) {
        setResults([])
        return
      }

      setLoading(true)
      setError(null)

      try {
        const searchResults = await searchFunction(searchQuery)
        setResults(searchResults)
      } catch (err) {
        setError(err)
        setResults([])
      } finally {
        setLoading(false)
      }
    }, debounceMs),
    [searchFunction, debounceMs]
  )

  useEffect(() => {
    debouncedSearch(query)
  }, [query, debouncedSearch])

  return {
    query,
    setQuery,
    results,
    loading,
    error
  }
}

// Optimized infinite scroll hook
export function useInfiniteScroll(fetchFunction, pageSize = 20) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [error, setError] = useState(null)

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return

    setLoading(true)
    setError(null)

    try {
      const newData = await fetchFunction({
        page,
        limit: pageSize
      })

      if (newData.length < pageSize) {
        setHasMore(false)
      }

      setData(prevData => [...prevData, ...newData])
      setPage(prevPage => prevPage + 1)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [fetchFunction, page, pageSize, loading, hasMore])

  const reset = useCallback(() => {
    setData([])
    setPage(1)
    setHasMore(true)
    setError(null)
  }, [])

  useEffect(() => {
    if (page === 1) {
      loadMore()
    }
  }, [])

  return {
    data,
    loading,
    hasMore,
    error,
    loadMore,
    reset
  }
}

// Optimized form submission hook
export function useOptimizedSubmit(submitFunction, options = {}) {
  const {
    onSuccess,
    onError,
    resetOnSuccess = false
  } = options

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const submit = useCallback(async (formData) => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const result = await submitFunction(formData)
      setSuccess(true)
      
      if (onSuccess) {
        onSuccess(result)
      }

      if (resetOnSuccess) {
        setTimeout(() => setSuccess(false), 3000)
      }

      return result
    } catch (err) {
      setError(err)
      
      if (onError) {
        onError(err)
      }
      
      throw err
    } finally {
      setLoading(false)
    }
  }, [submitFunction, onSuccess, onError, resetOnSuccess])

  const reset = useCallback(() => {
    setError(null)
    setSuccess(false)
  }, [])

  return {
    submit,
    loading,
    error,
    success,
    reset
  }
}

// Optimized real-time data hook
export function useRealTimeData(fetchFunction, interval = 30000) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const intervalRef = useRef(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await fetchFunction()
      setData(result)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [fetchFunction])

  useEffect(() => {
    // Initial fetch
    fetchData()

    // Set up interval for real-time updates
    intervalRef.current = setInterval(fetchData, interval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [fetchData, interval])

  const pause = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const resume = useCallback(() => {
    if (!intervalRef.current) {
      intervalRef.current = setInterval(fetchData, interval)
    }
  }, [fetchData, interval])

  return {
    data,
    loading,
    error,
    lastUpdated,
    refetch: fetchData,
    pause,
    resume
  }
}

export default {
  useOptimizedApi,
  useCustomers,
  useCustomer,
  useJobs,
  useAnalytics,
  useSearch,
  useInfiniteScroll,
  useOptimizedSubmit,
  useRealTimeData
}

