import React, { useState, useEffect, useCallback } from 'react'
import { Wifi, WifiOff, Play, Pause, RefreshCw, AlertCircle, Bell, BellOff } from 'lucide-react'
import { useWebSocket } from '../hooks/useWebSocket'
import type { TxNode, TxEdge, TxGraph } from '../types'

export interface RealTimeUpdate {
  type: 'new_transaction' | 'risk_update' | 'node_update' | 'graph_update'
  timestamp: number
  data: any
  address?: string
  chain?: string
}

export interface RealTimeManagerProps {
  wsUrl?: string
  watchedAddresses?: string[]
  onUpdate?: (update: RealTimeUpdate) => void
  onGraphUpdate?: (graph: Partial<TxGraph>) => void
  onNewTransaction?: (tx: any) => void
  onRiskUpdate?: (address: string, riskLevel: string) => void
  className?: string
}

export default function RealTimeManager({
  wsUrl = 'wss://api.trustin.info/ws',
  watchedAddresses = [],
  onUpdate,
  onGraphUpdate,
  onNewTransaction,
  onRiskUpdate,
  className = ''
}: RealTimeManagerProps) {
  const [isEnabled, setIsEnabled] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [updateCount, setUpdateCount] = useState(0)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [recentUpdates, setRecentUpdates] = useState<RealTimeUpdate[]>([])

  const handleWebSocketMessage = useCallback((data: any) => {
    const update: RealTimeUpdate = {
      type: data.type || 'graph_update',
      timestamp: Date.now(),
      data: data.payload || data,
      address: data.address,
      chain: data.chain
    }

    setRecentUpdates(prev => [update, ...prev.slice(0, 9)]) // Keep last 10 updates
    setUpdateCount(prev => prev + 1)
    setLastUpdate(new Date())

    // Emit update to parent
    onUpdate?.(update)

    // Handle specific update types
    switch (update.type) {
      case 'new_transaction':
        onNewTransaction?.(update.data)
        if (notifications) {
          showNotification('New Transaction', `Transaction detected for ${update.address?.slice(0, 8)}...`)
        }
        break
      
      case 'risk_update':
        if (update.address) {
          onRiskUpdate?.(update.address, update.data.riskLevel)
          if (notifications && update.data.riskLevel === 'high') {
            showNotification('Risk Alert', `High risk detected for ${update.address.slice(0, 8)}...`, 'error')
          }
        }
        break
      
      case 'graph_update':
        onGraphUpdate?.(update.data)
        break
    }
  }, [onUpdate, onGraphUpdate, onNewTransaction, onRiskUpdate, notifications])

  const { state, connect, disconnect, subscribe, unsubscribe } = useWebSocket({
    url: wsUrl,
    onMessage: handleWebSocketMessage,
    onConnect: () => {
      console.log('Real-time connection established')
    },
    onDisconnect: () => {
      console.log('Real-time connection closed')
    },
    onError: (error) => {
      console.error('Real-time connection error:', error)
    }
  })

  // Subscribe/unsubscribe to watched addresses
  useEffect(() => {
    if (state.isConnected && isEnabled) {
      watchedAddresses.forEach(address => {
        subscribe('transactions', { address })
        subscribe('risk_updates', { address })
      })
      
      return () => {
        watchedAddresses.forEach(address => {
          unsubscribe('transactions')
          unsubscribe('risk_updates')
        })
      }
    }
  }, [state.isConnected, isEnabled, watchedAddresses, subscribe, unsubscribe])

  const handleToggle = () => {
    if (isEnabled) {
      setIsEnabled(false)
      disconnect()
    } else {
      setIsEnabled(true)
      if (!state.isConnected) {
        connect()
      }
    }
  }

  const showNotification = (title: string, body: string, type: 'info' | 'error' = 'info') => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: type === 'error' ? '⚠️' : '🔔',
        tag: 'txgraph-update'
      })
    }
  }

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission()
    }
  }

  useEffect(() => {
    if (notifications) {
      requestNotificationPermission()
    }
  }, [notifications])

  const getConnectionStatus = () => {
    if (state.isConnecting) return { text: 'Connecting...', color: 'text-yellow-500' }
    if (state.isConnected && isEnabled) return { text: 'Live', color: 'text-green-500' }
    if (state.error) return { text: 'Error', color: 'text-red-500' }
    return { text: 'Disconnected', color: 'text-gray-500' }
  }

  const status = getConnectionStatus()

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          {state.isConnected && isEnabled ? (
            <Wifi className="w-4 h-4 text-green-500" />
          ) : (
            <WifiOff className="w-4 h-4 text-gray-400" />
          )}
          <span className="font-medium text-gray-900 dark:text-gray-100">
            Real-time Updates
          </span>
          <span className={`text-xs font-medium ${status.color}`}>
            {status.text}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setNotifications(!notifications)}
            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            title={notifications ? 'Disable notifications' : 'Enable notifications'}
          >
            {notifications ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
          </button>
          
          <button
            onClick={handleToggle}
            className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              isEnabled
                ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            {isEnabled ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            {isEnabled ? 'Pause' : 'Start'}
          </button>
        </div>
      </div>

      {/* Status Info */}
      <div className="p-3">
        {state.error && (
          <div className="flex items-center gap-2 mb-3 p-2 text-sm text-red-700 bg-red-50 rounded-md dark:bg-red-900/20 dark:text-red-300">
            <AlertCircle className="w-4 h-4" />
            {state.error}
            {state.reconnectAttempts > 0 && (
              <span className="ml-1">
                (Retry {state.reconnectAttempts}/5)
              </span>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-500 dark:text-gray-400">Updates received</div>
            <div className="font-medium text-gray-900 dark:text-gray-100">{updateCount}</div>
          </div>
          <div>
            <div className="text-gray-500 dark:text-gray-400">Last update</div>
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {lastUpdate ? lastUpdate.toLocaleTimeString() : 'None'}
            </div>
          </div>
        </div>

        {watchedAddresses.length > 0 && (
          <div className="mt-3">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Watching {watchedAddresses.length} addresses
            </div>
            <div className="space-y-1">
              {watchedAddresses.slice(0, 3).map(address => (
                <div key={address} className="flex items-center gap-2 text-xs">
                  <div className={`w-2 h-2 rounded-full ${isEnabled && state.isConnected ? 'bg-green-400' : 'bg-gray-300'}`} />
                  <code className="text-gray-600 dark:text-gray-300">
                    {address.slice(0, 8)}...{address.slice(-6)}
                  </code>
                </div>
              ))}
              {watchedAddresses.length > 3 && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  +{watchedAddresses.length - 3} more
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Updates */}
        {recentUpdates.length > 0 && (
          <div className="mt-3">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Recent updates</div>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {recentUpdates.slice(0, 5).map((update, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-300">
                    {update.type.replace('_', ' ')}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {new Date(update.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}