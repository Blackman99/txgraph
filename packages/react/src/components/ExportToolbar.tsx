import React, { useState } from 'react'
import { Download, Image, FileText, Database, FileImage, Loader2 } from 'lucide-react'
import { exportAsPNG, exportAsSVG, exportAsJSON, exportAsCSV, exportAsPDF } from '../utils/export'
import type { TxNode, TxEdge, TxGraphStats } from '../types'
import type { ExportData } from '../utils/export'

export interface ExportToolbarProps {
  nodes: TxNode[]
  edges: TxEdge[]
  stats?: TxGraphStats | null
  containerRef: React.RefObject<HTMLElement>
  className?: string
}

export default function ExportToolbar({ 
  nodes, 
  edges, 
  stats, 
  containerRef,
  className = ''
}: ExportToolbarProps) {
  const [isExporting, setIsExporting] = useState<string | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const exportData: ExportData = {
    nodes,
    edges,
    stats,
    timestamp: new Date().toISOString(),
    exportedBy: 'TxGraph v0.1.0'
  }

  const handleExport = async (type: string) => {
    if (!containerRef.current) return
    
    setIsExporting(type)
    setIsDropdownOpen(false)
    
    try {
      const timestamp = new Date().toISOString().split('T')[0]
      const filename = `txgraph-${timestamp}`
      
      switch (type) {
        case 'png':
          await exportAsPNG(containerRef.current, { filename })
          break
        case 'svg':
          exportAsSVG(containerRef.current, { filename })
          break
        case 'json':
          exportAsJSON(exportData, { filename })
          break
        case 'csv':
          exportAsCSV(exportData, { filename })
          break
        case 'pdf':
          await exportAsPDF(containerRef.current, exportData, { filename })
          break
        default:
          throw new Error(`Unknown export type: ${type}`)
      }
    } catch (error) {
      console.error(`Export failed:`, error)
      // In a real app, you'd want to show a toast notification here
      alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsExporting(null)
    }
  }

  const exportOptions = [
    { type: 'png', label: 'PNG Image', icon: FileImage, description: 'High quality raster image' },
    { type: 'svg', label: 'SVG Vector', icon: Image, description: 'Scalable vector graphics' },
    { type: 'json', label: 'JSON Data', icon: Database, description: 'Raw graph data' },
    { type: 'csv', label: 'CSV Spreadsheet', icon: FileText, description: 'Tabular data format' },
    { type: 'pdf', label: 'PDF Report', icon: FileText, description: 'Comprehensive analysis report' }
  ]

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        disabled={isExporting !== null}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-200 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700"
      >
        {isExporting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        {isExporting ? 'Exporting...' : 'Export'}
      </button>

      {isDropdownOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setIsDropdownOpen(false)}
          />
          
          {/* Dropdown menu */}
          <div className="absolute right-0 z-20 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-700">
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide dark:text-gray-400">
                Export Options
              </div>
              
              {exportOptions.map((option) => {
                const Icon = option.icon
                const isCurrentlyExporting = isExporting === option.type
                
                return (
                  <button
                    key={option.type}
                    onClick={() => handleExport(option.type)}
                    disabled={isExporting !== null}
                    className="w-full flex items-start gap-3 px-3 py-2 text-left text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {isCurrentlyExporting ? (
                        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                      ) : (
                        <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {option.label}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {option.description}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
            
            <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 rounded-b-lg dark:bg-gray-900 dark:border-gray-700">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {stats ? `${stats.total_nodes} nodes · ${stats.total_edges} edges` : `${nodes.length} nodes · ${edges.length} edges`}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}