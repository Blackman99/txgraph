import { useState, useEffect, useCallback, useRef } from 'react'

export interface WebSocketConfig {
  url: string
  protocols?: string[]
  reconnectInterval?: number
  maxReconnectAttempts?: number
  heartbeatInterval?: number
  onMessage?: (data: any) => void
  onError?: (error: Event) => void
  onConnect?: () => void
  onDisconnect?: () => void
}

export interface WebSocketState {
  isConnected: boolean
  isConnecting: boolean
  error: string | null
  reconnectAttempts: number
}

export function useWebSocket(config: WebSocketConfig) {
  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    reconnectAttempts: 0
  })

  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const heartbeatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const reconnectAttemptsRef = useRef(0)

  const {
    url,
    protocols,
    reconnectInterval = 5000,
    maxReconnectAttempts = 5,
    heartbeatInterval = 30000,
    onMessage,
    onError,
    onConnect,
    onDisconnect
  } = config

  const cleanup = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current)
      heartbeatIntervalRef.current = null
    }
  }, [])

  const startHeartbeat = useCallback(() => {
    if (heartbeatInterval > 0) {
      heartbeatIntervalRef.current = setInterval(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'ping' }))
        }
      }, heartbeatInterval)
    }
  }, [heartbeatInterval])

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    setState(prev => ({ ...prev, isConnecting: true, error: null }))

    try {
      const ws = new WebSocket(url, protocols)
      wsRef.current = ws

      ws.onopen = () => {
        setState(prev => ({
          ...prev,
          isConnected: true,
          isConnecting: false,
          error: null,
          reconnectAttempts: 0
        }))
        reconnectAttemptsRef.current = 0
        startHeartbeat()
        onConnect?.()
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          // Handle ping/pong for heartbeat
          if (data.type === 'ping') {
            ws.send(JSON.stringify({ type: 'pong' }))
            return
          }
          if (data.type === 'pong') {
            return
          }

          onMessage?.(data)
        } catch (error) {
          console.warn('Failed to parse WebSocket message:', error)
          onMessage?.(event.data)
        }
      }

      ws.onclose = (event) => {
        setState(prev => ({
          ...prev,
          isConnected: false,
          isConnecting: false
        }))
        cleanup()
        onDisconnect?.()

        // Attempt reconnection if not a clean close
        if (!event.wasClean && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1
          setState(prev => ({
            ...prev,
            reconnectAttempts: reconnectAttemptsRef.current
          }))

          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, reconnectInterval)
        }
      }

      ws.onerror = (error) => {
        setState(prev => ({
          ...prev,
          isConnecting: false,
          error: 'WebSocket connection failed'
        }))
        onError?.(error)
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: error instanceof Error ? error.message : 'Connection failed'
      }))
    }
  }, [url, protocols, onMessage, onError, onConnect, onDisconnect, startHeartbeat, cleanup, maxReconnectAttempts, reconnectInterval])

  const disconnect = useCallback(() => {
    cleanup()
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect')
      wsRef.current = null
    }
    setState(prev => ({
      ...prev,
      isConnected: false,
      isConnecting: false,
      reconnectAttempts: 0
    }))
    reconnectAttemptsRef.current = maxReconnectAttempts // Prevent reconnection
  }, [cleanup, maxReconnectAttempts])

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const data = typeof message === 'string' ? message : JSON.stringify(message)
      wsRef.current.send(data)
      return true
    }
    return false
  }, [])

  const subscribe = useCallback((channel: string, params?: any) => {
    return sendMessage({
      type: 'subscribe',
      channel,
      params
    })
  }, [sendMessage])

  const unsubscribe = useCallback((channel: string) => {
    return sendMessage({
      type: 'unsubscribe',
      channel
    })
  }, [sendMessage])

  // Auto-connect on mount
  useEffect(() => {
    connect()
    return () => {
      cleanup()
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmount')
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    state,
    connect,
    disconnect,
    sendMessage,
    subscribe,
    unsubscribe
  }
}