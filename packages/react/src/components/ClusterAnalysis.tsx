import React, { useState, useMemo } from 'react'
import { Brain, AlertTriangle, Users, Eye, EyeOff, Settings, ChevronDown, ChevronUp } from 'lucide-react'
import { detectClusters, detectAnomalies, type Cluster, type ClusteringOptions } from '../utils/clustering'
import type { TxNode, TxEdge } from '../types'

export interface ClusterAnalysisProps {
  nodes: TxNode[]
  edges: TxEdge[]
  onClusterSelect?: (cluster: Cluster | null) => void
  onHighlightNodes?: (addresses: string[]) => void
  className?: string
}

const CLUSTER_COLORS = {
  exchange: '#3b82f6',
  mixer: '#ef4444', 
  pool: '#22c55e',
  bridge: '#8b5cf6',
  unknown: '#6b7280'
}

const RISK_COLORS = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#22c55e',
  unknown: '#6b7280'
}

export default function ClusterAnalysis({
  nodes,
  edges,
  onClusterSelect,
  onHighlightNodes,
  className = ''
}: ClusterAnalysisProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [selectedCluster, setSelectedCluster] = useState<Cluster | null>(null)
  const [highlightedClusters, setHighlightedClusters] = useState<Set<string>>(new Set())
  
  const [clusteringOptions, setClusteringOptions] = useState<ClusteringOptions>({
    minClusterSize: 3,
    maxDistance: 0.7,
    riskThreshold: 0.6,
    valueThreshold: 1000,
    useTemporalClustering: true,
    timeWindowHours: 24
  })

  // Run clustering analysis
  const { clusters, anomalies } = useMemo(() => {
    if (nodes.length === 0) return { clusters: [], anomalies: [] }
    
    const clusters = detectClusters(nodes, edges, clusteringOptions)
    const anomalies = detectAnomalies(nodes, edges)
    
    return { clusters, anomalies }
  }, [nodes, edges, clusteringOptions])

  const handleClusterSelect = (cluster: Cluster) => {
    setSelectedCluster(cluster === selectedCluster ? null : cluster)
    onClusterSelect?.(cluster === selectedCluster ? null : cluster)
  }

  const handleClusterToggle = (clusterId: string) => {
    const newHighlighted = new Set(highlightedClusters)
    if (newHighlighted.has(clusterId)) {
      newHighlighted.delete(clusterId)
    } else {
      newHighlighted.add(clusterId)
    }
    setHighlightedClusters(newHighlighted)
    
    // Highlight nodes for all active clusters
    const addressesToHighlight = clusters
      .filter(c => newHighlighted.has(c.id))
      .flatMap(c => c.nodes.map(n => n.address))
    
    onHighlightNodes?.(addressesToHighlight)
  }

  const handleAnomalyHighlight = (addresses: string[]) => {
    onHighlightNodes?.(addresses)
  }

  const analysisStats = useMemo(() => {
    const totalNodes = nodes.length
    const clusteredNodes = clusters.reduce((sum, c) => sum + c.nodes.length, 0)
    const highRiskClusters = clusters.filter(c => c.riskLevel === 'high').length
    const highSeverityAnomalies = anomalies.filter(a => a.severity === 'high').length
    
    return {
      totalNodes,
      clusteredNodes,
      unclustered: totalNodes - clusteredNodes,
      clusteringRate: totalNodes > 0 ? (clusteredNodes / totalNodes) * 100 : 0,
      highRiskClusters,
      totalAnomalies: anomalies.length,
      highSeverityAnomalies
    }
  }, [nodes.length, clusters, anomalies])

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-purple-500" />
          <span className="font-medium text-gray-900 dark:text-gray-100">
            Cluster Analysis
          </span>
          {clusters.length > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium text-white bg-purple-500 rounded-full">
              {clusters.length}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-3 bg-gray-50 border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700">
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            Clustering Settings
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Min Cluster Size
              </label>
              <input
                type="number"
                min="2"
                max="10"
                value={clusteringOptions.minClusterSize}
                onChange={(e) => setClusteringOptions(prev => ({
                  ...prev,
                  minClusterSize: parseInt(e.target.value) || 3
                }))}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded dark:bg-gray-800 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Similarity Threshold
              </label>
              <input
                type="range"
                min="0.3"
                max="0.9"
                step="0.1"
                value={clusteringOptions.maxDistance}
                onChange={(e) => setClusteringOptions(prev => ({
                  ...prev,
                  maxDistance: parseFloat(e.target.value)
                }))}
                className="w-full"
              />
              <div className="text-xs text-gray-500">{clusteringOptions.maxDistance}</div>
            </div>
            <div className="col-span-2">
              <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={clusteringOptions.useTemporalClustering}
                  onChange={(e) => setClusteringOptions(prev => ({
                    ...prev,
                    useTemporalClustering: e.target.checked
                  }))}
                  className="rounded"
                />
                Use temporal clustering
              </label>
            </div>
          </div>
        </div>
      )}

      {isExpanded && (
        <div className="p-3">
          {/* Analysis Stats */}
          <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
            <div className="text-center">
              <div className="font-medium text-purple-600 dark:text-purple-400">
                {clusters.length}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Clusters</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-orange-600 dark:text-orange-400">
                {analysisStats.highSeverityAnomalies}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">High Risk</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-gray-600 dark:text-gray-400">
                {analysisStats.clusteringRate.toFixed(0)}%
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Clustered</div>
            </div>
          </div>

          {/* Clusters List */}
          {clusters.length > 0 && (
            <div className="mb-4">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Detected Clusters
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {clusters.map(cluster => (
                  <div
                    key={cluster.id}
                    className={`p-2 border rounded-md cursor-pointer transition-colors ${
                      selectedCluster?.id === cluster.id
                        ? 'border-purple-300 bg-purple-50 dark:border-purple-600 dark:bg-purple-900/20'
                        : 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500'
                    }`}
                    onClick={() => handleClusterSelect(cluster)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: CLUSTER_COLORS[cluster.type] }}
                        />
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {cluster.type.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {cluster.nodes.length} nodes
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: RISK_COLORS[cluster.riskLevel] }}
                          title={`${cluster.riskLevel} risk`}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleClusterToggle(cluster.id)
                          }}
                          className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          {highlightedClusters.has(cluster.id) ? (
                            <EyeOff className="w-3 h-3" />
                          ) : (
                            <Eye className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                      Confidence: {(cluster.confidence * 100).toFixed(0)}% • 
                      Value: ${cluster.totalValue.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Anomalies List */}
          {anomalies.length > 0 && (
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Detected Anomalies
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {anomalies.map((anomaly, index) => (
                  <div
                    key={index}
                    className="p-2 border border-gray-200 rounded-md hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500 cursor-pointer"
                    onClick={() => handleAnomalyHighlight(anomaly.addresses)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle 
                          className={`w-4 h-4 ${
                            anomaly.severity === 'high' ? 'text-red-500' :
                            anomaly.severity === 'medium' ? 'text-yellow-500' :
                            'text-gray-500'
                          }`}
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {anomaly.type.replace('_', ' ').toUpperCase()}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                            {anomaly.description}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {anomaly.addresses.length} addr
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {clusters.length === 0 && anomalies.length === 0 && (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <div className="text-sm">No clusters or anomalies detected</div>
              <div className="text-xs">Try adjusting clustering settings</div>
            </div>
          )}

          {/* Selected Cluster Details */}
          {selectedCluster && (
            <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-md dark:bg-purple-900/20 dark:border-purple-800">
              <div className="text-sm font-medium text-purple-900 dark:text-purple-100 mb-2">
                Cluster Details: {selectedCluster.type.toUpperCase()}
              </div>
              <div className="text-xs text-purple-700 dark:text-purple-300 space-y-1">
                <div>Centroid: {selectedCluster.centroid.slice(0, 8)}...{selectedCluster.centroid.slice(-6)}</div>
                <div>Risk Level: {selectedCluster.riskLevel}</div>
                <div>Total Value: ${selectedCluster.totalValue.toLocaleString()}</div>
                <div>Confidence: {(selectedCluster.confidence * 100).toFixed(1)}%</div>
                <div>Nodes: {selectedCluster.nodes.length}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}