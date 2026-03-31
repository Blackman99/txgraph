import * as react_jsx_runtime from 'react/jsx-runtime';
import React from 'react';

interface TxTag {
    address?: string;
    chain_name?: string;
    primary_category: string;
    secondary_category?: string;
    tertiary_category?: string;
    quaternary_category?: string;
    risk_level?: string;
    priority?: number;
    name?: string;
    primaryCategory?: string;
    secondaryCategory?: string;
}
interface TxNode {
    address: string;
    depth: number;
    is_root: boolean;
    risk_level: 'high' | 'medium' | 'low' | 'unknown';
    risk_score?: number;
    tags: TxTag[];
    total_neighbors: number;
    visible_neighbors: number;
    is_stopped: boolean;
    stop_reason?: string;
    chain?: string;
}
interface TxEdge {
    from: string;
    to: string;
    direction: 'in' | 'out' | 'all';
    amount: string;
    formatted_amount: string;
    last_timestamp: number;
    tx_count?: number;
    token?: string;
}
interface TxGraphStats {
    total_nodes: number;
    total_edges: number;
    max_depth_reached: number;
    stopped_nodes: number;
}
interface TxGraph {
    nodes: TxNode[];
    edges: TxEdge[];
    stats: TxGraphStats;
}
interface GraphExplorerProps {
    nodes: TxNode[];
    edges: TxEdge[];
    stats?: TxGraphStats | null;
    loading?: boolean;
    expandingNode?: string | null;
    selectedAddress?: string | null;
    onNodeSelect?: (node: TxNode | null) => void;
    onNodeExpand?: (address: string) => void;
    onNodeDelete?: (address: string) => void;
    className?: string;
}
interface ExportData$1 {
    nodes: TxNode[];
    edges: TxEdge[];
    stats?: TxGraphStats | null;
    timestamp: string;
    exportedBy: string;
}

declare function GraphExplorer({ nodes: apiNodes, edges: apiEdges, stats, loading, expandingNode, onNodeSelect, onNodeExpand, onNodeDelete, selectedAddress, }: GraphExplorerProps): react_jsx_runtime.JSX.Element;

declare function GraphExplorerSigma({ nodes, edges, stats, loading, selectedAddress, onNodeSelect, onNodeExpand, onNodeDelete, }: GraphExplorerProps): react_jsx_runtime.JSX.Element;

interface ExportToolbarProps {
    nodes: TxNode[];
    edges: TxEdge[];
    stats?: TxGraphStats | null;
    containerRef: React.RefObject<HTMLElement>;
    className?: string;
}
declare function ExportToolbar({ nodes, edges, stats, containerRef, className }: ExportToolbarProps): react_jsx_runtime.JSX.Element;

interface SearchResult {
    type: 'node' | 'edge';
    item: TxNode | TxEdge;
    matchField: string;
    matchValue: string;
}
interface SearchBarProps {
    nodes: TxNode[];
    edges: TxEdge[];
    onResultSelect?: (result: SearchResult) => void;
    onClear?: () => void;
    placeholder?: string;
    className?: string;
}
declare function SearchBar({ nodes, edges, onResultSelect, onClear, placeholder, className }: SearchBarProps): react_jsx_runtime.JSX.Element;

interface FilterConfig {
    riskLevels: string[];
    chains: string[];
    depthRange: [number, number];
    amountRange: [number, number];
    dateRange: [Date | null, Date | null];
    tokens: string[];
    onlyRootNodes: boolean;
    onlyStoppedNodes: boolean;
    hideUntaggedNodes: boolean;
}
interface FilterPanelProps {
    nodes: TxNode[];
    edges: TxEdge[];
    filter: FilterConfig;
    onChange: (filter: FilterConfig) => void;
    className?: string;
}
declare function FilterPanel({ nodes, edges, filter, onChange, className }: FilterPanelProps): react_jsx_runtime.JSX.Element;

interface GraphControlPanelProps {
    nodes: TxNode[];
    edges: TxEdge[];
    stats?: TxGraphStats | null;
    onNodeSelect?: (node: TxNode | null) => void;
    onFilterChange?: (filteredNodes: TxNode[], filteredEdges: TxEdge[]) => void;
    className?: string;
}
declare function GraphControlPanel({ nodes, edges, stats, onNodeSelect, onFilterChange, className }: GraphControlPanelProps): react_jsx_runtime.JSX.Element;

interface RealTimeUpdate {
    type: 'new_transaction' | 'risk_update' | 'node_update' | 'graph_update';
    timestamp: number;
    data: any;
    address?: string;
    chain?: string;
}
interface RealTimeManagerProps {
    wsUrl?: string;
    watchedAddresses?: string[];
    onUpdate?: (update: RealTimeUpdate) => void;
    onGraphUpdate?: (graph: Partial<TxGraph>) => void;
    onNewTransaction?: (tx: any) => void;
    onRiskUpdate?: (address: string, riskLevel: string) => void;
    className?: string;
}
declare function RealTimeManager({ wsUrl, watchedAddresses, onUpdate, onGraphUpdate, onNewTransaction, onRiskUpdate, className }: RealTimeManagerProps): react_jsx_runtime.JSX.Element;

interface ClusterNode extends TxNode {
    clusterId?: string;
    clusterScore?: number;
}
interface Cluster {
    id: string;
    nodes: ClusterNode[];
    centroid: string;
    type: 'exchange' | 'mixer' | 'pool' | 'bridge' | 'unknown';
    riskLevel: 'high' | 'medium' | 'low' | 'unknown';
    totalValue: number;
    confidence: number;
}
interface ClusteringOptions {
    minClusterSize: number;
    maxDistance: number;
    riskThreshold: number;
    valueThreshold: number;
    useTemporalClustering: boolean;
    timeWindowHours: number;
}
/**
 * Detect clusters of related addresses using graph-based clustering
 */
declare function detectClusters(nodes: TxNode[], edges: TxEdge[], options?: Partial<ClusteringOptions>): Cluster[];
/**
 * Detect anomalous patterns in transaction behavior
 */
declare function detectAnomalies(nodes: TxNode[], edges: TxEdge[]): Array<{
    type: 'rapid_succession' | 'round_amounts' | 'unusual_pattern' | 'concentration';
    addresses: string[];
    description: string;
    severity: 'high' | 'medium' | 'low';
    confidence: number;
}>;

interface ClusterAnalysisProps {
    nodes: TxNode[];
    edges: TxEdge[];
    onClusterSelect?: (cluster: Cluster | null) => void;
    onHighlightNodes?: (addresses: string[]) => void;
    className?: string;
}
declare function ClusterAnalysis({ nodes, edges, onClusterSelect, onHighlightNodes, className }: ClusterAnalysisProps): react_jsx_runtime.JSX.Element;

interface WebSocketConfig {
    url: string;
    protocols?: string[];
    reconnectInterval?: number;
    maxReconnectAttempts?: number;
    heartbeatInterval?: number;
    onMessage?: (data: any) => void;
    onError?: (error: Event) => void;
    onConnect?: () => void;
    onDisconnect?: () => void;
}
interface WebSocketState {
    isConnected: boolean;
    isConnecting: boolean;
    error: string | null;
    reconnectAttempts: number;
}
declare function useWebSocket(config: WebSocketConfig): {
    state: WebSocketState;
    connect: () => void;
    disconnect: () => void;
    sendMessage: (message: any) => boolean;
    subscribe: (channel: string, params?: any) => boolean;
    unsubscribe: (channel: string) => boolean;
};

interface ExportOptions {
    filename?: string;
    quality?: number;
    backgroundColor?: string;
    scale?: number;
}
interface ExportData {
    nodes: TxNode[];
    edges: TxEdge[];
    stats?: TxGraphStats | null;
    timestamp: string;
    exportedBy: string;
}
/**
 * Export graph as PNG image
 */
declare function exportAsPNG(element: HTMLElement, options?: ExportOptions): Promise<void>;
/**
 * Export graph as SVG
 */
declare function exportAsSVG(element: HTMLElement, options?: ExportOptions): void;
/**
 * Export graph data as JSON
 */
declare function exportAsJSON(data: ExportData, options?: ExportOptions): void;
/**
 * Export graph data as CSV
 */
declare function exportAsCSV(data: ExportData, options?: ExportOptions): void;
/**
 * Export comprehensive PDF report
 */
declare function exportAsPDF(element: HTMLElement, data: ExportData, options?: ExportOptions): Promise<void>;

export { type Cluster, ClusterAnalysis, type ClusterNode, type ClusteringOptions, type ExportData$1 as ExportData, type ExportOptions, ExportToolbar, type FilterConfig, FilterPanel, GraphControlPanel, GraphExplorer, type GraphExplorerProps, GraphExplorerSigma, RealTimeManager, type RealTimeUpdate, SearchBar, type SearchResult, type TxEdge, type TxGraph, type TxGraphStats, type TxNode, type TxTag, detectAnomalies, detectClusters, exportAsCSV, exportAsJSON, exportAsPDF, exportAsPNG, exportAsSVG, useWebSocket };
