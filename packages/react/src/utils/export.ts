import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import type { TxNode, TxEdge, TxGraphStats } from '../types'

export interface ExportOptions {
  filename?: string
  quality?: number
  backgroundColor?: string
  scale?: number
}

export interface ExportData {
  nodes: TxNode[]
  edges: TxEdge[]
  stats?: TxGraphStats | null
  timestamp: string
  exportedBy: string
}

/**
 * Export graph as PNG image
 */
export async function exportAsPNG(
  element: HTMLElement,
  options: ExportOptions = {}
): Promise<void> {
  const {
    filename = 'txgraph-export',
    quality = 1,
    backgroundColor = '#ffffff',
    scale = 2
  } = options

  try {
    const canvas = await html2canvas(element, {
      backgroundColor,
      scale,
      useCORS: true,
      allowTaint: false,
      logging: false,
      imageTimeout: 30000,
      onclone: (clonedDoc) => {
        // Remove controls and UI elements from clone
        const controls = clonedDoc.querySelectorAll('.react-flow__controls, .react-flow__minimap')
        controls.forEach(el => el.remove())
      }
    })

    // Create download link
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.download = `${filename}.png`
        link.href = url
        link.click()
        URL.revokeObjectURL(url)
      }
    }, 'image/png', quality)
  } catch (error) {
    console.error('Failed to export PNG:', error)
    throw new Error('PNG export failed')
  }
}

/**
 * Export graph as SVG
 */
export function exportAsSVG(
  element: HTMLElement,
  options: ExportOptions = {}
): void {
  const { filename = 'txgraph-export' } = options

  try {
    // Get SVG element from ReactFlow
    const svgElement = element.querySelector('svg')
    if (!svgElement) {
      throw new Error('No SVG element found')
    }

    // Clone and clean up SVG
    const clonedSvg = svgElement.cloneNode(true) as SVGElement
    
    // Remove foreign objects (HTML elements in SVG)
    const foreignObjects = clonedSvg.querySelectorAll('foreignObject')
    foreignObjects.forEach(fo => fo.remove())

    // Add XML namespace
    clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    clonedSvg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink')

    const svgData = new XMLSerializer().serializeToString(clonedSvg)
    const blob = new Blob([svgData], { type: 'image/svg+xml' })
    
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = `${filename}.svg`
    link.href = url
    link.click()
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Failed to export SVG:', error)
    throw new Error('SVG export failed')
  }
}

/**
 * Export graph data as JSON
 */
export function exportAsJSON(
  data: ExportData,
  options: ExportOptions = {}
): void {
  const { filename = 'txgraph-data' } = options

  try {
    const jsonString = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = `${filename}.json`
    link.href = url
    link.click()
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Failed to export JSON:', error)
    throw new Error('JSON export failed')
  }
}

/**
 * Export graph data as CSV
 */
export function exportAsCSV(
  data: ExportData,
  options: ExportOptions = {}
): void {
  const { filename = 'txgraph-data' } = options

  try {
    // Prepare nodes CSV
    const nodeHeaders = ['Address', 'Risk Level', 'Risk Score', 'Depth', 'Is Root', 'Total Neighbors', 'Tags', 'Chain']
    const nodeRows = data.nodes.map(node => [
      node.address,
      node.risk_level,
      node.risk_score?.toString() || '',
      node.depth.toString(),
      node.is_root.toString(),
      node.total_neighbors.toString(),
      node.tags.map(t => t.primary_category).join('; '),
      node.chain || ''
    ])

    // Prepare edges CSV
    const edgeHeaders = ['From', 'To', 'Direction', 'Amount', 'Formatted Amount', 'Last Timestamp', 'TX Count', 'Token']
    const edgeRows = data.edges.map(edge => [
      edge.from,
      edge.to,
      edge.direction,
      edge.amount,
      edge.formatted_amount,
      new Date(edge.last_timestamp * 1000).toISOString(),
      edge.tx_count?.toString() || '',
      edge.token || ''
    ])

    // Create CSV content
    const nodesCsv = [nodeHeaders, ...nodeRows].map(row => 
      row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(',')
    ).join('\n')

    const edgesCsv = [edgeHeaders, ...edgeRows].map(row => 
      row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(',')
    ).join('\n')

    const fullCsv = `# TxGraph Export - ${data.timestamp}\n` +
                    `# Exported by: ${data.exportedBy}\n` +
                    `# Stats: ${data.stats?.total_nodes || data.nodes.length} nodes, ${data.stats?.total_edges || data.edges.length} edges\n\n` +
                    `# Nodes\n${nodesCsv}\n\n` +
                    `# Edges\n${edgesCsv}`

    const blob = new Blob([fullCsv], { type: 'text/csv' })
    
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = `${filename}.csv`
    link.href = url
    link.click()
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Failed to export CSV:', error)
    throw new Error('CSV export failed')
  }
}

/**
 * Export comprehensive PDF report
 */
export async function exportAsPDF(
  element: HTMLElement,
  data: ExportData,
  options: ExportOptions = {}
): Promise<void> {
  const { filename = 'txgraph-report' } = options

  try {
    // Capture graph image
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 1.5,
      useCORS: true,
      allowTaint: false,
      onclone: (clonedDoc) => {
        const controls = clonedDoc.querySelectorAll('.react-flow__controls, .react-flow__minimap')
        controls.forEach(el => el.remove())
      }
    })

    const pdf = new jsPDF('landscape', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()

    // Title page
    pdf.setFontSize(24)
    pdf.text('TxGraph Analysis Report', pageWidth / 2, 30, { align: 'center' })
    
    pdf.setFontSize(12)
    pdf.text(`Generated: ${data.timestamp}`, pageWidth / 2, 45, { align: 'center' })
    pdf.text(`Exported by: ${data.exportedBy}`, pageWidth / 2, 55, { align: 'center' })

    // Summary statistics
    pdf.setFontSize(16)
    pdf.text('Summary', 20, 80)
    
    pdf.setFontSize(12)
    const stats = data.stats || {
      total_nodes: data.nodes.length,
      total_edges: data.edges.length,
      max_depth_reached: Math.max(...data.nodes.map(n => n.depth)),
      stopped_nodes: data.nodes.filter(n => n.is_stopped).length
    }
    
    pdf.text(`Total Nodes: ${stats.total_nodes}`, 30, 95)
    pdf.text(`Total Edges: ${stats.total_edges}`, 30, 105)
    pdf.text(`Max Depth: ${stats.max_depth_reached}`, 30, 115)
    pdf.text(`Stopped Nodes: ${stats.stopped_nodes}`, 30, 125)

    // Risk analysis
    const riskCounts = data.nodes.reduce((acc, node) => {
      acc[node.risk_level] = (acc[node.risk_level] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    pdf.text('Risk Distribution:', 30, 145)
    let yPos = 155
    Object.entries(riskCounts).forEach(([risk, count]) => {
      pdf.text(`${risk}: ${count} nodes`, 40, yPos)
      yPos += 10
    })

    // Add new page for graph
    pdf.addPage()
    
    // Add graph image
    const imgData = canvas.toDataURL('image/png')
    const imgWidth = pageWidth - 40
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    
    pdf.text('Transaction Graph', pageWidth / 2, 20, { align: 'center' })
    
    if (imgHeight <= pageHeight - 60) {
      pdf.addImage(imgData, 'PNG', 20, 30, imgWidth, imgHeight)
    } else {
      const scaledHeight = pageHeight - 60
      const scaledWidth = (canvas.width * scaledHeight) / canvas.height
      pdf.addImage(imgData, 'PNG', (pageWidth - scaledWidth) / 2, 30, scaledWidth, scaledHeight)
    }

    pdf.save(`${filename}.pdf`)
  } catch (error) {
    console.error('Failed to export PDF:', error)
    throw new Error('PDF export failed')
  }
}