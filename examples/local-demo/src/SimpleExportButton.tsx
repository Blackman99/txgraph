import React, { useState } from 'react'

interface SimpleExportButtonProps {
  nodes: any[]
  edges: any[]
  stats?: any
  containerRef: React.RefObject<HTMLElement>
}

export function SimpleExportButton({ nodes, edges, stats, containerRef }: SimpleExportButtonProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [exporting, setExporting] = useState(false)

  const exportJSON = () => {
    const data = { nodes, edges, stats, timestamp: new Date().toISOString() }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'txgraph.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportCSV = () => {
    const header = 'from,to,direction,amount,formatted_amount\n'
    const rows = edges.map(e => `${e.from},${e.to},${e.direction},${e.amount || ''},"${e.formatted_amount || ''}"`).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'txgraph.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportPNG = async () => {
    if (!containerRef.current) return
    setExporting(true)
    try {
      const { toPng } = await import('html-to-image')
      const dataUrl = await toPng(containerRef.current, { backgroundColor: '#f8fafc', quality: 1.0 })
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = 'txgraph.png'
      a.click()
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setExporting(false)
    }
  }

  return (
    <>
      {/* Button */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={exporting}
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          padding: '8px 12px',
          fontSize: '14px',
          fontWeight: '500',
          color: '#374151',
          cursor: exporting ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
          outline: 'none'
        }}
      >
        <span>📥</span>
        <span>{exporting ? 'Exporting...' : 'Export'}</span>
      </button>

      {/* Menu */}
      {showMenu && (
        <>
          {/* Backdrop */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9998
            }}
            onClick={() => setShowMenu(false)}
          />
          
          {/* Menu */}
          <div
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '4px',
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              minWidth: '200px',
              zIndex: 9999,
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif'
            }}
          >
            <div style={{ padding: '8px' }}>
              <div style={{ 
                padding: '8px 12px', 
                fontSize: '12px', 
                color: '#6b7280',
                fontWeight: '600',
                textTransform: 'uppercase'
              }}>
                Export Options
              </div>
              
              <button
                onClick={() => { exportPNG(); setShowMenu(false) }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  textAlign: 'left',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  fontSize: '14px',
                  color: '#374151'
                }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                🖼️ PNG Image
              </button>
              
              <button
                onClick={() => { exportJSON(); setShowMenu(false) }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  textAlign: 'left',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  fontSize: '14px',
                  color: '#374151'
                }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                📄 JSON Data
              </button>
              
              <button
                onClick={() => { exportCSV(); setShowMenu(false) }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  textAlign: 'left',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  fontSize: '14px',
                  color: '#374151'
                }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                📊 CSV Spreadsheet
              </button>
            </div>
            
            <div style={{
              padding: '8px 12px',
              backgroundColor: '#f9fafb',
              borderTop: '1px solid #e5e7eb',
              fontSize: '12px',
              color: '#6b7280',
              borderBottomLeftRadius: '8px',
              borderBottomRightRadius: '8px'
            }}>
              {nodes.length} nodes · {edges.length} edges
            </div>
          </div>
        </>
      )}
    </>
  )
}