"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  ClusterAnalysis: () => ClusterAnalysis,
  ExportToolbar: () => ExportToolbar,
  FilterPanel: () => FilterPanel,
  GraphControlPanel: () => GraphControlPanel,
  GraphExplorer: () => GraphExplorer,
  GraphExplorerSigma: () => GraphExplorerSigma,
  RealTimeManager: () => RealTimeManager,
  SearchBar: () => SearchBar,
  detectAnomalies: () => detectAnomalies,
  detectClusters: () => detectClusters,
  exportAsCSV: () => exportAsCSV,
  exportAsJSON: () => exportAsJSON,
  exportAsPDF: () => exportAsPDF,
  exportAsPNG: () => exportAsPNG,
  exportAsSVG: () => exportAsSVG,
  useWebSocket: () => useWebSocket
});
module.exports = __toCommonJS(index_exports);

// src/GraphExplorer.tsx
var import_react2 = require("react");
var import_react3 = require("@xyflow/react");
var import_style = require("@xyflow/react/dist/style.css");
var import_lucide_react2 = require("lucide-react");
var import_dagre = __toESM(require("@dagrejs/dagre"));

// src/components/ExportToolbar.tsx
var import_react = require("react");
var import_lucide_react = require("lucide-react");

// src/utils/export.ts
var import_html2canvas = __toESM(require("html2canvas"));
var import_jspdf = __toESM(require("jspdf"));
async function exportAsPNG(element, options = {}) {
  const {
    filename = "txgraph-export",
    quality = 1,
    backgroundColor = "#ffffff",
    scale = 2
  } = options;
  try {
    const canvas = await (0, import_html2canvas.default)(element, {
      backgroundColor,
      scale,
      useCORS: true,
      allowTaint: false,
      logging: false,
      imageTimeout: 3e4,
      onclone: (clonedDoc) => {
        const controls = clonedDoc.querySelectorAll(".react-flow__controls, .react-flow__minimap");
        controls.forEach((el) => el.remove());
      }
    });
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = `${filename}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      }
    }, "image/png", quality);
  } catch (error) {
    console.error("Failed to export PNG:", error);
    throw new Error("PNG export failed");
  }
}
function exportAsSVG(element, options = {}) {
  const { filename = "txgraph-export" } = options;
  try {
    const svgElement = element.querySelector("svg");
    if (!svgElement) {
      throw new Error("No SVG element found");
    }
    const clonedSvg = svgElement.cloneNode(true);
    const foreignObjects = clonedSvg.querySelectorAll("foreignObject");
    foreignObjects.forEach((fo) => fo.remove());
    clonedSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clonedSvg.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
    const svgData = new XMLSerializer().serializeToString(clonedSvg);
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `${filename}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to export SVG:", error);
    throw new Error("SVG export failed");
  }
}
function exportAsJSON(data, options = {}) {
  const { filename = "txgraph-data" } = options;
  try {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `${filename}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to export JSON:", error);
    throw new Error("JSON export failed");
  }
}
function exportAsCSV(data, options = {}) {
  const { filename = "txgraph-data" } = options;
  try {
    const nodeHeaders = ["Address", "Risk Level", "Risk Score", "Depth", "Is Root", "Total Neighbors", "Tags", "Chain"];
    const nodeRows = data.nodes.map((node) => [
      node.address,
      node.risk_level,
      node.risk_score?.toString() || "",
      node.depth.toString(),
      node.is_root.toString(),
      node.total_neighbors.toString(),
      node.tags.map((t) => t.primary_category).join("; "),
      node.chain || ""
    ]);
    const edgeHeaders = ["From", "To", "Direction", "Amount", "Formatted Amount", "Last Timestamp", "TX Count", "Token"];
    const edgeRows = data.edges.map((edge) => [
      edge.from,
      edge.to,
      edge.direction,
      edge.amount,
      edge.formatted_amount,
      new Date(edge.last_timestamp * 1e3).toISOString(),
      edge.tx_count?.toString() || "",
      edge.token || ""
    ]);
    const nodesCsv = [nodeHeaders, ...nodeRows].map(
      (row) => row.map((cell) => `"${cell.toString().replace(/"/g, '""')}"`).join(",")
    ).join("\n");
    const edgesCsv = [edgeHeaders, ...edgeRows].map(
      (row) => row.map((cell) => `"${cell.toString().replace(/"/g, '""')}"`).join(",")
    ).join("\n");
    const fullCsv = `# TxGraph Export - ${data.timestamp}
# Exported by: ${data.exportedBy}
# Stats: ${data.stats?.total_nodes || data.nodes.length} nodes, ${data.stats?.total_edges || data.edges.length} edges

# Nodes
${nodesCsv}

# Edges
${edgesCsv}`;
    const blob = new Blob([fullCsv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `${filename}.csv`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to export CSV:", error);
    throw new Error("CSV export failed");
  }
}
async function exportAsPDF(element, data, options = {}) {
  const { filename = "txgraph-report" } = options;
  try {
    const canvas = await (0, import_html2canvas.default)(element, {
      backgroundColor: "#ffffff",
      scale: 1.5,
      useCORS: true,
      allowTaint: false,
      onclone: (clonedDoc) => {
        const controls = clonedDoc.querySelectorAll(".react-flow__controls, .react-flow__minimap");
        controls.forEach((el) => el.remove());
      }
    });
    const pdf = new import_jspdf.default("landscape", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    pdf.setFontSize(24);
    pdf.text("TxGraph Analysis Report", pageWidth / 2, 30, { align: "center" });
    pdf.setFontSize(12);
    pdf.text(`Generated: ${data.timestamp}`, pageWidth / 2, 45, { align: "center" });
    pdf.text(`Exported by: ${data.exportedBy}`, pageWidth / 2, 55, { align: "center" });
    pdf.setFontSize(16);
    pdf.text("Summary", 20, 80);
    pdf.setFontSize(12);
    const stats = data.stats || {
      total_nodes: data.nodes.length,
      total_edges: data.edges.length,
      max_depth_reached: Math.max(...data.nodes.map((n) => n.depth)),
      stopped_nodes: data.nodes.filter((n) => n.is_stopped).length
    };
    pdf.text(`Total Nodes: ${stats.total_nodes}`, 30, 95);
    pdf.text(`Total Edges: ${stats.total_edges}`, 30, 105);
    pdf.text(`Max Depth: ${stats.max_depth_reached}`, 30, 115);
    pdf.text(`Stopped Nodes: ${stats.stopped_nodes}`, 30, 125);
    const riskCounts = data.nodes.reduce((acc, node) => {
      acc[node.risk_level] = (acc[node.risk_level] || 0) + 1;
      return acc;
    }, {});
    pdf.text("Risk Distribution:", 30, 145);
    let yPos = 155;
    Object.entries(riskCounts).forEach(([risk, count]) => {
      pdf.text(`${risk}: ${count} nodes`, 40, yPos);
      yPos += 10;
    });
    pdf.addPage();
    const imgData = canvas.toDataURL("image/png");
    const imgWidth = pageWidth - 40;
    const imgHeight = canvas.height * imgWidth / canvas.width;
    pdf.text("Transaction Graph", pageWidth / 2, 20, { align: "center" });
    if (imgHeight <= pageHeight - 60) {
      pdf.addImage(imgData, "PNG", 20, 30, imgWidth, imgHeight);
    } else {
      const scaledHeight = pageHeight - 60;
      const scaledWidth = canvas.width * scaledHeight / canvas.height;
      pdf.addImage(imgData, "PNG", (pageWidth - scaledWidth) / 2, 30, scaledWidth, scaledHeight);
    }
    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error("Failed to export PDF:", error);
    throw new Error("PDF export failed");
  }
}

// src/components/ExportToolbar.tsx
var import_jsx_runtime = require("react/jsx-runtime");
function ExportToolbar({
  nodes,
  edges,
  stats,
  containerRef,
  className = ""
}) {
  const [isExporting, setIsExporting] = (0, import_react.useState)(null);
  const [isDropdownOpen, setIsDropdownOpen] = (0, import_react.useState)(false);
  const exportData = {
    nodes,
    edges,
    stats,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    exportedBy: "TxGraph v0.1.0"
  };
  const handleExport = async (type) => {
    if (!containerRef.current) return;
    setIsExporting(type);
    setIsDropdownOpen(false);
    try {
      const timestamp = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      const filename = `txgraph-${timestamp}`;
      switch (type) {
        case "png":
          await exportAsPNG(containerRef.current, { filename });
          break;
        case "svg":
          exportAsSVG(containerRef.current, { filename });
          break;
        case "json":
          exportAsJSON(exportData, { filename });
          break;
        case "csv":
          exportAsCSV(exportData, { filename });
          break;
        case "pdf":
          await exportAsPDF(containerRef.current, exportData, { filename });
          break;
        default:
          throw new Error(`Unknown export type: ${type}`);
      }
    } catch (error) {
      console.error(`Export failed:`, error);
      alert(`Export failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsExporting(null);
    }
  };
  const exportOptions = [
    { type: "png", label: "PNG Image", icon: import_lucide_react.FileImage, description: "High quality raster image" },
    { type: "svg", label: "SVG Vector", icon: import_lucide_react.Image, description: "Scalable vector graphics" },
    { type: "json", label: "JSON Data", icon: import_lucide_react.Database, description: "Raw graph data" },
    { type: "csv", label: "CSV Spreadsheet", icon: import_lucide_react.FileText, description: "Tabular data format" },
    { type: "pdf", label: "PDF Report", icon: import_lucide_react.FileText, description: "Comprehensive analysis report" }
  ];
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `relative ${className}`, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "button",
      {
        onClick: () => setIsDropdownOpen(!isDropdownOpen),
        disabled: isExporting !== null,
        className: "flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-200 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700",
        children: [
          isExporting ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Loader2, { className: "w-4 h-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Download, { className: "w-4 h-4" }),
          isExporting ? "Exporting..." : "Export"
        ]
      }
    ),
    isDropdownOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "div",
        {
          className: "fixed inset-0 z-10",
          onClick: () => setIsDropdownOpen(false)
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "absolute right-0 z-20 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-700", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "p-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide dark:text-gray-400", children: "Export Options" }),
          exportOptions.map((option) => {
            const Icon = option.icon;
            const isCurrentlyExporting = isExporting === option.type;
            return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
              "button",
              {
                onClick: () => handleExport(option.type),
                disabled: isExporting !== null,
                className: "w-full flex items-start gap-3 px-3 py-2 text-left text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed",
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex-shrink-0 mt-0.5", children: isCurrentlyExporting ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Loader2, { className: "w-4 h-4 animate-spin text-blue-500" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "w-4 h-4 text-gray-500 dark:text-gray-400" }) }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex-1 min-w-0", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "font-medium text-gray-900 dark:text-gray-100", children: option.label }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: option.description })
                  ] })
                ]
              },
              option.type
            );
          })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "px-3 py-2 bg-gray-50 border-t border-gray-200 rounded-b-lg dark:bg-gray-900 dark:border-gray-700", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: stats ? `${stats.total_nodes} nodes \xB7 ${stats.total_edges} edges` : `${nodes.length} nodes \xB7 ${edges.length} edges` }) })
      ] })
    ] })
  ] });
}

// src/GraphExplorer.tsx
var import_jsx_runtime2 = require("react/jsx-runtime");
function useDarkMode() {
  const [isDark, setIsDark] = (0, import_react2.useState)(
    typeof document !== "undefined" && document.documentElement.classList.contains("dark")
  );
  (0, import_react2.useEffect)(() => {
    if (typeof document === "undefined") return;
    const obs = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return isDark;
}
function riskBorderColor(risk) {
  switch (risk) {
    case "high":
      return "#ef4444";
    case "medium":
      return "#f59e0b";
    case "low":
      return "#22c55e";
    default:
      return "#6b7280";
  }
}
function riskBgColor(risk) {
  switch (risk) {
    case "high":
      return "rgba(239,68,68,0.08)";
    case "medium":
      return "rgba(245,158,11,0.08)";
    case "low":
      return "rgba(34,197,94,0.08)";
    default:
      return "rgba(107,114,128,0.06)";
  }
}
var ExplorerCallbacksCtx = (0, import_react2.createContext)({ expandingNode: null, isDark: true });
function ExplorerNode({ data, id }) {
  const { onNodeSelect, onNodeExpand, onNodeDelete, expandingNode, isDark } = (0, import_react2.useContext)(ExplorerCallbacksCtx);
  const d = data;
  const node = d.nodeInfo;
  const isLoading = expandingNode === node.address;
  const isSelected = d.isSelected === true;
  const isDimmed = d.isDimmed === true;
  const shortAddr = node.address ? `${node.address.slice(0, 6)}\u2026${node.address.slice(-4)}` : id.slice(0, 6) + "\u2026" + id.slice(-4);
  const primaryTag = node.tags?.[0];
  const borderColor = node.is_root ? "#3b82f6" : riskBorderColor(node.risk_level);
  const bg = node.is_root ? "rgba(59,130,246,0.08)" : riskBgColor(node.risk_level);
  const borderStyle = node.is_stopped && !node.is_root ? "dashed" : "solid";
  const borderWidth = node.is_root ? 2 : 1.5;
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
    "div",
    {
      style: {
        position: "relative",
        border: `${borderWidth}px ${borderStyle} ${borderColor}`,
        borderRadius: 8,
        width: 180,
        minHeight: 70,
        padding: "8px 12px",
        background: bg,
        boxShadow: isSelected ? `0 0 0 3px rgba(59,130,246,0.6), 0 0 12px rgba(59,130,246,0.3)` : node.is_root ? `0 0 0 3px rgba(59,130,246,0.25)` : isDark ? "0 1px 4px rgba(0,0,0,0.12)" : "0 1px 4px rgba(0,0,0,0.08)",
        cursor: "pointer",
        userSelect: "none",
        overflow: "hidden",
        opacity: isDimmed ? 0.25 : 1,
        transition: "opacity 0.2s, box-shadow 0.2s"
      },
      onClick: () => onNodeSelect?.(node),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_react3.Handle, { type: "target", id: "target-left", position: import_react3.Position.Left, style: { background: "#6b7280", width: 8, height: 8, top: "40%" } }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_react3.Handle, { type: "source", id: "source-left", position: import_react3.Position.Left, style: { background: "#06b6d4", width: 8, height: 8, top: "60%" } }),
        isLoading && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          "div",
          {
            style: {
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 7,
              zIndex: 10
            },
            children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_lucide_react2.Loader2, { size: 20, style: { color: "#60a5fa", animation: "spin 1s linear infinite" } })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: 4, marginBottom: 4, flexWrap: "wrap" }, children: [
          node.is_root && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            "span",
            {
              style: {
                fontSize: 9,
                padding: "1px 5px",
                borderRadius: 4,
                background: "#3b82f6",
                color: "#fff",
                fontWeight: 700,
                letterSpacing: "0.06em"
              },
              children: "ROOT"
            }
          ),
          node.is_stopped && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_lucide_react2.AlertTriangle, { size: 11, style: { color: "#f59e0b", flexShrink: 0 } }),
          primaryTag && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            "span",
            {
              style: {
                fontSize: 9,
                padding: "1px 5px",
                borderRadius: 4,
                background: "rgba(99,102,241,0.15)",
                color: "#818cf8",
                fontWeight: 600,
                maxWidth: 100,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              },
              children: primaryTag.primary_category || primaryTag.primaryCategory || primaryTag.name
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          "div",
          {
            style: {
              fontFamily: "monospace",
              fontSize: 11,
              color: isDark ? "#ffffff" : "#1e293b",
              fontWeight: 400,
              letterSpacing: "0.02em"
            },
            children: shortAddr
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: { display: "flex", alignItems: "center", gap: 4, marginTop: 4 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            "span",
            {
              style: {
                fontSize: 9,
                padding: "1px 5px",
                borderRadius: 4,
                background: riskBorderColor(node.risk_level) + "22",
                color: riskBorderColor(node.risk_level),
                fontWeight: 600,
                textTransform: "capitalize"
              },
              children: node.risk_level
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { style: { fontSize: 9, color: isDark ? "#64748b" : "#94a3b8" }, children: [
            "d",
            node.depth
          ] })
        ] }),
        !node.is_root && !node.is_stopped && onNodeExpand && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          "button",
          {
            style: {
              position: "absolute",
              top: 4,
              right: 4,
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: "#3b82f6",
              border: "none",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              padding: 0,
              zIndex: 5
            },
            onClick: (e) => {
              e.stopPropagation();
              onNodeExpand(node.address);
            },
            title: "Expand from this node",
            children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_lucide_react2.Plus, { size: 11 })
          }
        ),
        !node.is_root && onNodeDelete && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          "button",
          {
            style: {
              position: "absolute",
              top: 4,
              right: !node.is_stopped && onNodeExpand ? 26 : 4,
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: "#6b7280",
              border: "none",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              padding: 0,
              zIndex: 5,
              opacity: 0.7
            },
            onClick: (e) => {
              e.stopPropagation();
              onNodeDelete(node.address);
            },
            title: "Remove this node",
            onMouseEnter: (e) => {
              ;
              e.currentTarget.style.opacity = "1";
              e.currentTarget.style.background = "#ef4444";
            },
            onMouseLeave: (e) => {
              ;
              e.currentTarget.style.opacity = "0.7";
              e.currentTarget.style.background = "#6b7280";
            },
            children: "\u2715"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_react3.Handle, { type: "source", id: "source-right", position: import_react3.Position.Right, style: { background: "#8b5cf6", width: 8, height: 8, top: "40%" } }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_react3.Handle, { type: "target", id: "target-right", position: import_react3.Position.Right, style: { background: "#6b7280", width: 8, height: 8, top: "60%" } })
      ]
    }
  );
}
var nodeTypes = { explorerNode: ExplorerNode };
var SIBLING_SPREAD = 15;
function AmountEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style = {},
  markerEnd,
  label,
  source,
  target,
  data
}) {
  const { isDark } = (0, import_react2.useContext)(ExplorerCallbacksCtx);
  const nodes = (0, import_react3.useNodes)();
  const edges = (0, import_react3.useEdges)();
  const sameSourceEdges = edges.filter((e) => e.source === source);
  let spread = 0;
  if (sameSourceEdges.length > 1) {
    const sorted = [...sameSourceEdges].sort((a, b) => {
      const aTo = nodes.find((n) => n.id === a.target);
      const bTo = nodes.find((n) => n.id === b.target);
      return (aTo?.position.y ?? 0) - (bTo?.position.y ?? 0);
    });
    const idx = sorted.findIndex((e) => e.id === id);
    spread = (idx - (sorted.length - 1) / 2) * SIBLING_SPREAD;
  }
  const dx = targetX - sourceX;
  const dirX = dx >= 0 ? 1 : -1;
  const cpOffset = Math.max(Math.abs(dx) * 0.4, 80);
  const cp1x = sourceX + dirX * cpOffset;
  const cp1y = sourceY + spread;
  const cp2x = targetX - dirX * cpOffset;
  const cp2y = targetY;
  const path = `M ${sourceX},${sourceY} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${targetX},${targetY}`;
  const t = 0.5;
  const mt = 1 - t;
  const labelX = mt * mt * mt * sourceX + 3 * mt * mt * t * cp1x + 3 * mt * t * t * cp2x + t * t * t * targetX;
  const labelY = mt * mt * mt * sourceY + 3 * mt * mt * t * cp1y + 3 * mt * t * t * cp2y + t * t * t * targetY;
  const tx = -0.75 * sourceX - 0.75 * cp1x + 0.75 * cp2x + 0.75 * targetX;
  const ty = -0.75 * sourceY - 0.75 * cp1y + 0.75 * cp2y + 0.75 * targetY;
  let angle = Math.atan2(ty, tx) * (180 / Math.PI);
  if (angle > 90) angle -= 180;
  if (angle < -90) angle += 180;
  const edgeData = data;
  const isEdgeDimmed = edgeData?.isDimmed === true;
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_react3.BaseEdge, { id, path, style, markerEnd }),
    label && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_react3.EdgeLabelRenderer, { children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
      "div",
      {
        style: {
          position: "absolute",
          transformOrigin: "center",
          textAlign: "center",
          transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px) rotate(${angle}deg)`,
          pointerEvents: "none",
          opacity: isEdgeDimmed ? 0.15 : 1,
          transition: "opacity 0.2s"
        },
        className: "nodrag nopan",
        children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
          "div",
          {
            style: {
              fontSize: 9,
              fontWeight: 500,
              color: isDark ? "#94a3b8" : "#64748b",
              background: isDark ? "rgba(30,41,59,0.9)" : "rgba(255,255,255,0.9)",
              padding: "1px 5px",
              borderRadius: 3,
              whiteSpace: "nowrap",
              border: `1px solid ${isDark ? "rgba(51,65,85,0.5)" : "rgba(203,213,225,0.8)"}`
            },
            children: [
              typeof edgeData?.token === "string" && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(TokenIcon, { token: edgeData.token }),
              label
            ]
          }
        )
      }
    ) })
  ] });
}
function TokenIcon({ token }) {
  const t = token.toLowerCase();
  if (t === "usdt") {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("svg", { width: "12", height: "12", viewBox: "0 0 32 32", style: { display: "inline-block", verticalAlign: "middle", marginRight: 2 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: "16", cy: "16", r: "16", fill: "#26A17B" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M17.9 17.9v-.003c-.1.007-.6.04-1.8.04-1 0-1.5-.03-1.7-.04v.004c-3.4-.15-5.9-.74-5.9-1.45 0-.71 2.5-1.3 5.9-1.45v2.31c.2.015.7.05 1.7.05 1.2 0 1.6-.04 1.8-.05V15c3.4.15 5.9.74 5.9 1.45 0 .71-2.5 1.3-5.9 1.45zm0-3.13V12.8h5v-2.6H9.2v2.6h5v1.97c-3.8.17-6.7.93-6.7 1.83s2.9 1.66 6.7 1.83v6.57h3.5v-6.57c3.8-.17 6.7-.93 6.7-1.83s-2.9-1.66-6.7-1.83z", fill: "#fff" })
    ] });
  }
  if (t === "usdc") {
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("svg", { width: "12", height: "12", viewBox: "0 0 32 32", style: { display: "inline-block", verticalAlign: "middle", marginRight: 2 }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: "16", cy: "16", r: "16", fill: "#2775CA" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M20.4 18c0-2.1-1.3-2.8-3.8-3.1-1.8-.3-2.2-.7-2.2-1.4s.6-1.2 1.8-1.2c1 0 1.6.4 1.8 1.2.1.1.2.2.3.2h1c.2 0 .3-.2.3-.3-.2-1.2-1-2.1-2.3-2.4v-1.4c0-.2-.1-.3-.3-.3h-.8c-.2 0-.3.1-.3.3V11c-1.7.3-2.8 1.3-2.8 2.7 0 2 1.2 2.7 3.7 3 1.6.3 2.2.6 2.2 1.5s-.8 1.4-1.9 1.4c-1.5 0-2-.6-2.2-1.4 0-.2-.1-.2-.3-.2h-1c-.2 0-.3.1-.3.3.3 1.4 1.1 2.2 2.8 2.5v1.4c0 .2.1.3.3.3h.8c.2 0 .3-.1.3-.3v-1.4c1.8-.2 2.9-1.3 2.9-2.8z", fill: "#fff" })
    ] });
  }
  return null;
}
var edgeTypes = { amountEdge: AmountEdge };
function layoutGraph(apiNodes, apiEdges) {
  const g = new import_dagre.default.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "LR", nodesep: 50, ranksep: 280 });
  apiNodes.forEach((n) => g.setNode(n.address, { width: 180, height: 70 }));
  apiEdges.forEach((e) => {
    try {
      g.setEdge(e.from, e.to);
    } catch {
    }
  });
  import_dagre.default.layout(g);
  const flowNodes = apiNodes.map((n) => {
    const pos = g.node(n.address);
    return {
      id: n.address,
      type: "explorerNode",
      position: { x: pos ? pos.x - 90 : 0, y: pos ? pos.y - 35 : 0 },
      data: { nodeInfo: n }
    };
  });
  const stoppedSet = new Set(apiNodes.filter((n) => n.is_stopped).map((n) => n.address));
  const posMap = /* @__PURE__ */ new Map();
  apiNodes.forEach((n) => {
    const pos = g.node(n.address);
    if (pos) posMap.set(n.address, { x: pos.x, y: pos.y });
  });
  const flowEdges = apiEdges.map((e, i) => {
    const isOutflow = e.direction === "out";
    const edgeColor = isOutflow ? "#8b5cf6" : "#06b6d4";
    const isStopped = stoppedSet.has(e.to) || stoppedSet.has(e.from);
    const srcPos = posMap.get(e.from);
    const tgtPos = posMap.get(e.to);
    const srcIsLeft = srcPos && tgtPos ? srcPos.x <= tgtPos.x : isOutflow;
    const sourceHandle = srcIsLeft ? "source-right" : "source-left";
    const targetHandle = srcIsLeft ? "target-left" : "target-right";
    const token = e.token || (e.formatted_amount.includes("USDT") ? "usdt" : e.formatted_amount.includes("USDC") ? "usdc" : "");
    return {
      id: `edge-${i}-${e.from}-${e.to}`,
      source: e.from,
      target: e.to,
      sourceHandle,
      targetHandle,
      type: "amountEdge",
      animated: false,
      data: { token },
      label: e.last_timestamp ? `${e.formatted_amount} \xB7 ${new Date(e.last_timestamp > 1e12 ? e.last_timestamp : e.last_timestamp * 1e3).toISOString().slice(0, 19).replace("T", " ")}` : e.formatted_amount,
      style: {
        stroke: edgeColor,
        strokeWidth: 1.5,
        strokeDasharray: isStopped ? "4 3" : void 0
      },
      markerEnd: {
        type: "arrowclosed",
        color: edgeColor,
        width: 16,
        height: 16
      }
    };
  });
  return { flowNodes, flowEdges };
}
function GraphExplorer({
  nodes: apiNodes,
  edges: apiEdges,
  stats,
  loading = false,
  expandingNode = null,
  onNodeSelect,
  onNodeExpand,
  onNodeDelete,
  selectedAddress = null
}) {
  const isDark = useDarkMode();
  const { flowNodes, flowEdges } = (0, import_react2.useMemo)(
    () => layoutGraph(apiNodes, apiEdges),
    [apiNodes, apiEdges]
  );
  const pathInfo = (0, import_react2.useMemo)(() => {
    if (!selectedAddress) return { pathNodes: /* @__PURE__ */ new Set(), pathEdges: /* @__PURE__ */ new Set() };
    const rootAddr = apiNodes.find((n) => n.is_root)?.address;
    if (!rootAddr || selectedAddress === rootAddr) return { pathNodes: /* @__PURE__ */ new Set([selectedAddress]), pathEdges: /* @__PURE__ */ new Set() };
    const fwd = /* @__PURE__ */ new Map();
    for (let i = 0; i < apiEdges.length; i++) {
      const e = apiEdges[i];
      if (!fwd.has(e.from)) fwd.set(e.from, []);
      fwd.get(e.from).push({ to: e.to, edgeId: `edge-${i}-${e.from}-${e.to}` });
    }
    const pathNodes = /* @__PURE__ */ new Set();
    const pathEdges = /* @__PURE__ */ new Set();
    const visiting = /* @__PURE__ */ new Set();
    function dfs(cur) {
      if (cur === selectedAddress) {
        pathNodes.add(cur);
        return true;
      }
      if (visiting.has(cur)) return false;
      visiting.add(cur);
      let foundAny = false;
      for (const { to, edgeId } of fwd.get(cur) ?? []) {
        if (dfs(to)) {
          pathNodes.add(cur);
          pathNodes.add(to);
          pathEdges.add(edgeId);
          foundAny = true;
        }
      }
      visiting.delete(cur);
      return foundAny;
    }
    dfs(rootAddr);
    return { pathNodes, pathEdges };
  }, [selectedAddress, apiNodes, apiEdges]);
  const hasSelection = selectedAddress != null && pathInfo.pathNodes.size > 0;
  const [nodes, setNodes, onNodesChange] = (0, import_react3.useNodesState)(flowNodes);
  const [edges, setEdges, onEdgesChange] = (0, import_react3.useEdgesState)(flowEdges);
  const rfInstance = (0, import_react2.useRef)(null);
  const containerRef = (0, import_react2.useRef)(null);
  (0, import_react2.useEffect)(() => {
    const highlighted = flowNodes.map((n) => ({
      ...n,
      data: {
        ...n.data,
        isSelected: n.id === selectedAddress,
        isOnPath: hasSelection && pathInfo.pathNodes.has(n.id),
        isDimmed: hasSelection && !pathInfo.pathNodes.has(n.id)
      }
    }));
    setNodes(highlighted);
  }, [flowNodes, setNodes, selectedAddress, hasSelection, pathInfo]);
  (0, import_react2.useEffect)(() => {
    const highlighted = flowEdges.map((e) => {
      const isOnPath = pathInfo.pathEdges.has(e.id);
      const isDimmed = hasSelection && !isOnPath;
      return {
        ...e,
        data: { ...e.data, isDimmed },
        style: {
          ...e.style,
          opacity: isDimmed ? 0.15 : 1,
          strokeWidth: hasSelection && isOnPath ? 2.5 : e.style?.strokeWidth ?? 1.5
        }
      };
    });
    setEdges(highlighted);
  }, [flowEdges, setEdges, hasSelection, pathInfo]);
  (0, import_react2.useEffect)(() => {
    requestAnimationFrame(() => {
      rfInstance.current?.fitView({ padding: 0.3, duration: 300 });
    });
  }, [flowEdges]);
  const ctxValue = (0, import_react2.useMemo)(
    () => ({ onNodeSelect, onNodeExpand, onNodeDelete, expandingNode, isDark }),
    [onNodeSelect, onNodeExpand, onNodeDelete, expandingNode, isDark]
  );
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { ref: containerRef, style: { width: "100%", height: "100%", position: "relative" }, children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(ExplorerCallbacksCtx.Provider, { value: ctxValue, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
      import_react3.ReactFlow,
      {
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
        nodeTypes,
        edgeTypes,
        fitView: true,
        fitViewOptions: { padding: 0.3 },
        onInit: (instance) => {
          rfInstance.current = instance;
        },
        onPaneClick: () => onNodeSelect?.(null),
        minZoom: 0.05,
        maxZoom: 3,
        proOptions: { hideAttribution: true },
        colorMode: isDark ? "dark" : "light",
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_react3.Background, { color: isDark ? "#374151" : "#d1d5db", gap: 20 }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_react3.Controls, {}),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            import_react3.MiniMap,
            {
              maskColor: isDark ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.65)"
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_react3.Panel, { position: "top-right", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { style: { display: "flex", flexDirection: "column", gap: 8 }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
              ExportToolbar,
              {
                nodes: apiNodes,
                edges: apiEdges,
                stats,
                containerRef
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
              "div",
              {
                style: {
                  fontSize: 11,
                  color: isDark ? "#94a3b8" : "#64748b",
                  background: isDark ? "#1e293b" : "#ffffff",
                  border: `1px solid ${isDark ? "rgba(51,65,85,0.5)" : "rgba(203,213,225,0.8)"}`,
                  borderRadius: 6,
                  padding: "4px 10px"
                },
                children: stats ? `${stats.total_nodes} nodes \xB7 ${stats.total_edges} edges` : `${apiNodes.length} nodes \xB7 ${apiEdges.length} edges`
              }
            )
          ] }) })
        ]
      }
    ) }),
    loading && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
      "div",
      {
        style: {
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.45)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          zIndex: 20
        },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_lucide_react2.Loader2, { size: 36, style: { color: "#60a5fa", animation: "spin 1s linear infinite" } }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { style: { color: "#94a3b8", fontSize: 13 }, children: "Exploring graph\u2026" })
        ]
      }
    )
  ] });
}

// src/GraphExplorerSigma.tsx
var import_react4 = require("react");
var import_graphology = __toESM(require("graphology"));
var import_sigma = require("sigma");
var import_edge_curve = require("@sigma/edge-curve");
var import_lucide_react3 = require("lucide-react");
var import_jsx_runtime3 = require("react/jsx-runtime");
function useDarkMode2() {
  const [isDark, setIsDark] = (0, import_react4.useState)(
    typeof document !== "undefined" && document.documentElement.classList.contains("dark")
  );
  (0, import_react4.useEffect)(() => {
    if (typeof document === "undefined") return;
    const obs = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return isDark;
}
function riskColor(risk) {
  switch (risk) {
    case "high":
      return "#ef4444";
    case "medium":
      return "#f59e0b";
    case "low":
      return "#22c55e";
    default:
      return "#6b7280";
  }
}
var ROOT_NODE_SIZE = 0.4;
var REGULAR_NODE_SIZE = 0.3;
var NODE_SPACING = 1;
var LEVEL_SPACING = 3.5;
var BASE_FONT_SIZE = 11;
function controlBtnStyle(isDark) {
  return {
    width: 28,
    height: 28,
    borderRadius: 4,
    border: `1px solid ${isDark ? "rgba(51,65,85,0.5)" : "rgba(203,213,225,0.8)"}`,
    background: isDark ? "#1e293b" : "#ffffff",
    color: isDark ? "#94a3b8" : "#64748b",
    cursor: "pointer",
    fontSize: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  };
}
function GraphExplorerSigma({
  nodes,
  edges,
  stats,
  loading = false,
  selectedAddress,
  onNodeSelect,
  onNodeExpand,
  onNodeDelete
}) {
  const containerRef = (0, import_react4.useRef)(null);
  const sigmaRef = (0, import_react4.useRef)(null);
  const graphRef = (0, import_react4.useRef)(null);
  const isDark = useDarkMode2();
  const colors = (0, import_react4.useMemo)(
    () => ({
      bg: isDark ? "#0f172a" : "#f8fafc",
      label: isDark ? "#e2e8f0" : "#1e293b",
      labelBg: isDark ? "#1e293b" : "#ffffff",
      edge: isDark ? "#6b7280" : "#9ca3af",
      nodeBorder: isDark ? "#374151" : "#d1d5db",
      dimNode: isDark ? "#374151" : "#e2e8f0",
      dimEdge: isDark ? "#1f2937" : "#f1f5f9",
      isDark
    }),
    [isDark]
  );
  const colorsRef = (0, import_react4.useRef)(colors);
  (0, import_react4.useEffect)(() => {
    colorsRef.current = colors;
  }, [colors]);
  const isDarkRef = (0, import_react4.useRef)(isDark);
  (0, import_react4.useEffect)(() => {
    isDarkRef.current = isDark;
  }, [isDark]);
  const customDrawNodeLabel = (0, import_react4.useCallback)(
    (context, data, _settings) => {
      if (!data.label) return;
      const currentIsDark = colorsRef.current.isDark;
      const nodeColor = data.color || "";
      const isDimmedNode = nodeColor === colorsRef.current.dimNode || nodeColor === (currentIsDark ? "#4b5563" : "#9ca3af");
      const textColor = isDimmedNode ? currentIsDark ? "#6b7280" : "#9ca3af" : currentIsDark ? "#f1f5f9" : "#0f172a";
      const tagColor = isDimmedNode ? currentIsDark ? "#4b5563" : "#c4c9d0" : currentIsDark ? "#94a3b8" : "#64748b";
      const nodeRadius = data.size;
      const cameraRatio = sigmaRef.current?.getCamera().ratio ?? 1;
      const fontSize = Math.max(6, Math.min(BASE_FONT_SIZE / cameraRatio, nodeRadius * 0.35));
      context.font = `600 ${fontSize}px monospace`;
      context.fillStyle = textColor;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(data.label, data.x, data.y - (nodeRadius > 14 ? 4 : 1));
      const nodeInfo = data.nodeData;
      if (nodeInfo && !isDimmedNode && nodeRadius >= 14) {
        const tag = nodeInfo.tags?.[0]?.secondary_category || nodeInfo.tags?.[0]?.secondaryCategory || nodeInfo.tags?.[0]?.primary_category || nodeInfo.tags?.[0]?.primaryCategory || nodeInfo.tags?.[0]?.name || "";
        const riskStr = nodeInfo.risk_level !== "unknown" ? nodeInfo.risk_level : "";
        const subLabel = tag || riskStr;
        if (subLabel) {
          const subFontSize = Math.max(5, BASE_FONT_SIZE * 0.65 / cameraRatio);
          context.font = `${subFontSize}px sans-serif`;
          context.fillStyle = tagColor;
          context.fillText(subLabel.slice(0, 14), data.x, data.y + nodeRadius * 0.55);
        }
      }
    },
    []
  );
  const customDrawEdgeLabel = (0, import_react4.useCallback)(
    (context, data, sourceData, targetData, _settings) => {
      if (!data.label) return;
      const cameraRatio = sigmaRef.current?.getCamera().ratio ?? 1;
      const fontSize = Math.max(5, BASE_FONT_SIZE * 0.85 / cameraRatio);
      const x = (sourceData.x + targetData.x) / 2;
      const y = (sourceData.y + targetData.y) / 2;
      context.save();
      context.font = `${fontSize}px sans-serif`;
      context.textAlign = "center";
      context.textBaseline = "middle";
      const metrics = context.measureText(data.label);
      const padding = Math.max(2, fontSize * 0.3);
      const w = metrics.width + padding * 2;
      const h = fontSize + padding * 2;
      context.fillStyle = "rgba(0,0,0,0.55)";
      context.beginPath();
      context.roundRect(x - w / 2, y - h / 2, w, h, h / 2);
      context.fill();
      context.fillStyle = "#ffffffcc";
      context.fillText(data.label, x, y);
      context.restore();
    },
    []
  );
  const graph = (0, import_react4.useMemo)(() => {
    const g = new import_graphology.default({ multi: false, type: "directed" });
    const byDepth = /* @__PURE__ */ new Map();
    nodes.forEach((n) => {
      if (!byDepth.has(n.depth)) byDepth.set(n.depth, []);
      byDepth.get(n.depth).push(n);
    });
    const posMap = /* @__PURE__ */ new Map();
    byDepth.forEach((nodesAtDepth, depth) => {
      const count = nodesAtDepth.length;
      nodesAtDepth.forEach((n, idx) => {
        const x = depth * LEVEL_SPACING;
        const y = (idx - (count - 1) / 2) * NODE_SPACING;
        posMap.set(n.address, { x, y });
      });
    });
    nodes.forEach((n) => {
      const pos = posMap.get(n.address) ?? { x: 0, y: 0 };
      const label = n.address ? n.address.slice(0, 6) + "\u2026" + n.address.slice(-4) : n.address;
      g.addNode(n.address, {
        label,
        size: n.is_root ? ROOT_NODE_SIZE : REGULAR_NODE_SIZE,
        color: n.is_root ? "#3b82f6" : riskColor(n.risk_level),
        x: pos.x,
        y: pos.y,
        nodeData: n
      });
    });
    edges.forEach((e) => {
      try {
        const edgeLabel = e.last_timestamp ? `${e.formatted_amount} \xB7 ${new Date(e.last_timestamp > 1e12 ? e.last_timestamp : e.last_timestamp * 1e3).toISOString().slice(0, 19).replace("T", " ")}` : e.formatted_amount;
        g.addEdge(e.from, e.to, {
          type: "curved",
          label: edgeLabel,
          size: 0.015,
          color: e.direction === "out" ? "#8b5cf6" : "#06b6d4",
          edgeData: e
        });
      } catch {
      }
    });
    return g;
  }, [nodes, edges]);
  const pathInfo = (0, import_react4.useMemo)(() => {
    if (!selectedAddress) return { pathNodes: /* @__PURE__ */ new Set(), pathEdges: /* @__PURE__ */ new Set() };
    const rootAddr = nodes.find((n) => n.is_root)?.address;
    if (!rootAddr || selectedAddress === rootAddr) {
      return { pathNodes: /* @__PURE__ */ new Set([selectedAddress]), pathEdges: /* @__PURE__ */ new Set() };
    }
    const fwd = /* @__PURE__ */ new Map();
    for (let i = 0; i < edges.length; i++) {
      const e = edges[i];
      if (!fwd.has(e.from)) fwd.set(e.from, []);
      fwd.get(e.from).push({ to: e.to, edgeId: `${e.from}->${e.to}` });
    }
    const pathNodes = /* @__PURE__ */ new Set();
    const pathEdges = /* @__PURE__ */ new Set();
    const visiting = /* @__PURE__ */ new Set();
    function dfs(cur) {
      if (cur === selectedAddress) {
        pathNodes.add(cur);
        return true;
      }
      if (visiting.has(cur)) return false;
      visiting.add(cur);
      let foundAny = false;
      for (const { to, edgeId } of fwd.get(cur) ?? []) {
        if (dfs(to)) {
          pathNodes.add(cur);
          pathNodes.add(to);
          pathEdges.add(edgeId);
          foundAny = true;
        }
      }
      visiting.delete(cur);
      return foundAny;
    }
    dfs(rootAddr);
    return { pathNodes, pathEdges };
  }, [selectedAddress, nodes, edges]);
  (0, import_react4.useEffect)(() => {
    if (!containerRef.current || graph.order === 0) return;
    if (sigmaRef.current) {
      sigmaRef.current.kill();
      sigmaRef.current = null;
    }
    graphRef.current = graph;
    const drawNodeLabel = customDrawNodeLabel;
    const renderer = new import_sigma.Sigma(graph, containerRef.current, {
      itemSizesReference: "positions",
      renderLabels: true,
      renderEdgeLabels: true,
      labelSize: 11,
      labelColor: { color: colorsRef.current.label },
      edgeLabelSize: 10,
      edgeLabelColor: { color: colorsRef.current.label },
      defaultEdgeType: "curved",
      defaultEdgeColor: colorsRef.current.edge,
      edgeProgramClasses: { curved: import_edge_curve.EdgeCurvedArrowProgram },
      defaultDrawNodeLabel: drawNodeLabel,
      defaultDrawEdgeLabel: customDrawEdgeLabel,
      defaultDrawNodeHover: ((context, data, settings) => {
        context.beginPath();
        context.arc(data.x, data.y, data.size + 3, 0, Math.PI * 2);
        context.fillStyle = "rgba(59, 130, 246, 0.15)";
        context.fill();
        context.strokeStyle = "rgba(59, 130, 246, 0.6)";
        context.lineWidth = 2;
        context.stroke();
        context.beginPath();
        context.arc(data.x, data.y, data.size, 0, Math.PI * 2);
        context.fillStyle = data.color;
        context.fill();
        drawNodeLabel(context, data, settings);
      }),
      labelRenderedSizeThreshold: 0,
      labelDensity: 1
    });
    renderer.on("clickNode", ({ node }) => {
      const nodeData = graph.getNodeAttribute(node, "nodeData");
      onNodeSelect?.(nodeData);
    });
    renderer.on("clickStage", () => {
      onNodeSelect?.(null);
    });
    renderer.on("doubleClickNode", ({ node }) => {
      onNodeExpand?.(node);
    });
    renderer.on("rightClickNode", ({ node }) => {
      onNodeDelete?.(node);
    });
    sigmaRef.current = renderer;
    requestAnimationFrame(() => {
      const coords = [];
      graph.forEachNode((_, a) => coords.push({ x: a.x, y: a.y }));
      if (coords.length === 0) return;
      const xs = coords.map((c) => c.x);
      const ys = coords.map((c) => c.y);
      const gW = Math.max(...xs) - Math.min(...xs) + REGULAR_NODE_SIZE * 4;
      const gH = Math.max(...ys) - Math.min(...ys) + REGULAR_NODE_SIZE * 4;
      const normFactor = Math.max(gW, gH);
      const viewportH = containerRef.current?.clientHeight ?? 600;
      const TARGET_PX = 38;
      const ratio = REGULAR_NODE_SIZE * viewportH * 0.5 / (TARGET_PX * normFactor);
      renderer.getCamera().animate(
        { x: 0.5, y: 0.5, ratio: Math.min(1.5, Math.max(0.02, ratio)) },
        { duration: 300 }
      );
    });
    return () => {
      renderer.kill();
      sigmaRef.current = null;
    };
  }, [graph, customDrawNodeLabel, customDrawEdgeLabel]);
  (0, import_react4.useEffect)(() => {
    const renderer = sigmaRef.current;
    const g = graphRef.current;
    if (!renderer || !g) return;
    const { pathNodes, pathEdges } = pathInfo;
    const hasSelection = selectedAddress != null && pathNodes.size > 0;
    renderer.setSetting("nodeReducer", (node, data) => {
      const nodeData = g.getNodeAttribute(node, "nodeData");
      if (nodeData?.is_stopped) {
        const baseColor = isDarkRef.current ? "#4b5563" : "#9ca3af";
        const stoppedData = { ...data, color: baseColor };
        if (hasSelection && pathNodes.has(node)) return { ...stoppedData, highlighted: true };
        if (hasSelection && !pathNodes.has(node)) {
          return { ...stoppedData, color: colorsRef.current.dimNode, size: Math.max(0.1, data.size * 0.7) };
        }
        return stoppedData;
      }
      if (!hasSelection) return data;
      if (pathNodes.has(node)) return { ...data, highlighted: true };
      return { ...data, color: colorsRef.current.dimNode, size: Math.max(0.1, data.size * 0.7) };
    });
    renderer.setSetting("edgeReducer", (edge, data) => {
      try {
        const target = g.target(edge);
        const targetData = g.getNodeAttribute(target, "nodeData");
        if (targetData?.is_stopped) {
          const stoppedColor = isDarkRef.current ? "#4b5563" : "#9ca3af";
          if (hasSelection) {
            const source2 = g.source(edge);
            if (pathEdges.has(`${source2}->${target}`)) return { ...data, size: 0.03 };
            return { ...data, color: colorsRef.current.dimEdge, size: 5e-3 };
          }
          return { ...data, color: stoppedColor, size: 0.01 };
        }
        if (!hasSelection) return data;
        const source = g.source(edge);
        if (pathEdges.has(`${source}->${target}`)) return { ...data, size: 0.03 };
      } catch {
      }
      if (!hasSelection) return data;
      return { ...data, color: colorsRef.current.dimEdge, size: 5e-3 };
    });
    renderer.refresh();
  }, [selectedAddress, pathInfo]);
  (0, import_react4.useEffect)(() => {
    const renderer = sigmaRef.current;
    if (!renderer) return;
    renderer.setSetting("labelColor", { color: colors.label });
    renderer.setSetting("edgeLabelColor", { color: colors.label });
    renderer.setSetting("defaultEdgeColor", colors.edge);
    renderer.refresh();
  }, [colors]);
  const zoomIn = (0, import_react4.useCallback)(() => {
    const cam = sigmaRef.current?.getCamera();
    if (cam) cam.animate({ ratio: (cam.ratio || 1) * 0.7 }, { duration: 200 });
  }, []);
  const zoomOut = (0, import_react4.useCallback)(() => {
    const cam = sigmaRef.current?.getCamera();
    if (cam) cam.animate({ ratio: (cam.ratio || 1) * 1.4 }, { duration: 200 });
  }, []);
  const handleFitView = (0, import_react4.useCallback)(() => {
    const renderer = sigmaRef.current;
    const g = graphRef.current;
    if (!renderer || !g) return;
    const coords = [];
    g.forEachNode((_, a) => coords.push({ x: a.x, y: a.y }));
    if (coords.length === 0) return;
    const xs = coords.map((c) => c.x);
    const ys = coords.map((c) => c.y);
    const gW = Math.max(...xs) - Math.min(...xs) + REGULAR_NODE_SIZE * 4;
    const gH = Math.max(...ys) - Math.min(...ys) + REGULAR_NODE_SIZE * 4;
    const normFactor = Math.max(gW, gH);
    const viewportH = containerRef.current?.clientHeight ?? 600;
    const TARGET_PX = 38;
    const ratio = REGULAR_NODE_SIZE * viewportH * 0.5 / (TARGET_PX * normFactor);
    renderer.getCamera().animate(
      { x: 0.5, y: 0.5, ratio: Math.min(1.5, Math.max(0.02, ratio)) },
      { duration: 300 }
    );
  }, []);
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { style: { position: "relative", width: "100%", height: "100%" }, children: [
    loading && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
      "div",
      {
        style: {
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.45)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          zIndex: 20
        },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react3.Loader2, { size: 36, style: { color: "#60a5fa", animation: "spin 1s linear infinite" } }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { style: { color: "#94a3b8", fontSize: 13 }, children: "Exploring graph\u2026" })
        ]
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { ref: containerRef, style: { width: "100%", height: "100%", background: colors.bg } }),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
      "div",
      {
        style: {
          position: "absolute",
          bottom: 40,
          left: 10,
          display: "flex",
          flexDirection: "column",
          gap: 4,
          zIndex: 10
        },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { title: "Zoom In", onClick: zoomIn, style: controlBtnStyle(isDark), children: "+" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { title: "Zoom Out", onClick: zoomOut, style: controlBtnStyle(isDark), children: "\u2212" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { title: "Fit View", onClick: handleFitView, style: controlBtnStyle(isDark), children: "\u22A1" })
        ]
      }
    ),
    (stats || nodes.length > 0) && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
      "div",
      {
        style: {
          position: "absolute",
          top: 10,
          right: 10,
          fontSize: 11,
          color: isDark ? "#94a3b8" : "#64748b",
          background: isDark ? "#1e293b" : "#ffffff",
          border: `1px solid ${isDark ? "rgba(51,65,85,0.5)" : "rgba(203,213,225,0.8)"}`,
          borderRadius: 6,
          padding: "4px 10px",
          zIndex: 10
        },
        children: stats ? `${stats.total_nodes} nodes \xB7 ${stats.total_edges} edges` : `${nodes.length} nodes \xB7 ${edges.length} edges`
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
      "div",
      {
        style: {
          position: "absolute",
          bottom: 10,
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: 10,
          color: isDark ? "#64748b" : "#94a3b8",
          background: isDark ? "#1e293b" : "#ffffff",
          border: `1px solid ${isDark ? "rgba(51,65,85,0.5)" : "rgba(203,213,225,0.8)"}`,
          borderRadius: 6,
          padding: "3px 10px",
          zIndex: 10,
          opacity: 0.7
        },
        children: "Click: select \xB7 Double-click: expand \xB7 Right-click: delete \xB7 Scroll: zoom"
      }
    )
  ] });
}

// src/components/SearchBar.tsx
var import_react5 = require("react");
var import_lucide_react4 = require("lucide-react");
var import_jsx_runtime4 = require("react/jsx-runtime");
function isValidAddress(address) {
  if (/^0x[0-9a-fA-F]{40}$/.test(address)) return true;
  if (/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(address)) return true;
  return false;
}
function isValidTxHash(hash) {
  return /^0x[0-9a-fA-F]{64}$/.test(hash) || /^[0-9a-fA-F]{64}$/.test(hash);
}
function SearchBar({
  nodes,
  edges,
  onResultSelect,
  onClear,
  placeholder = "Search addresses, transaction hashes, or risk levels...",
  className = ""
}) {
  const [query, setQuery] = (0, import_react5.useState)("");
  const [isOpen, setIsOpen] = (0, import_react5.useState)(false);
  const searchResults = (0, import_react5.useMemo)(() => {
    if (!query || query.length < 2) return [];
    const results = [];
    const lowerQuery = query.toLowerCase();
    nodes.forEach((node) => {
      if (node.address.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: "node",
          item: node,
          matchField: "address",
          matchValue: node.address
        });
      }
      if (node.risk_level.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: "node",
          item: node,
          matchField: "risk_level",
          matchValue: node.risk_level
        });
      }
      node.tags.forEach((tag) => {
        if (tag.primary_category.toLowerCase().includes(lowerQuery) || tag.name?.toLowerCase().includes(lowerQuery)) {
          results.push({
            type: "node",
            item: node,
            matchField: "tag",
            matchValue: tag.name || tag.primary_category
          });
        }
      });
      if (node.chain?.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: "node",
          item: node,
          matchField: "chain",
          matchValue: node.chain
        });
      }
    });
    edges.forEach((edge) => {
      if (edge.from.toLowerCase().includes(lowerQuery) || edge.to.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: "edge",
          item: edge,
          matchField: "addresses",
          matchValue: `${edge.from} \u2192 ${edge.to}`
        });
      }
      if (edge.token?.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: "edge",
          item: edge,
          matchField: "token",
          matchValue: edge.token
        });
      }
      if (edge.formatted_amount.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: "edge",
          item: edge,
          matchField: "amount",
          matchValue: edge.formatted_amount
        });
      }
    });
    const uniqueResults = results.filter(
      (result, index, self) => index === self.findIndex(
        (r) => r.type === result.type && JSON.stringify(r.item) === JSON.stringify(result.item) && r.matchField === result.matchField
      )
    );
    return uniqueResults.slice(0, 10);
  }, [query, nodes, edges]);
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(value.length >= 2);
  };
  const handleResultClick = (result) => {
    setIsOpen(false);
    onResultSelect?.(result);
  };
  const handleClear = () => {
    setQuery("");
    setIsOpen(false);
    onClear?.();
  };
  const getResultIcon = (result) => {
    if (result.type === "node") {
      const node = result.item;
      if (result.matchField === "risk_level") {
        return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_lucide_react4.AlertTriangle, { className: "w-4 h-4 text-amber-500" });
      }
      return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_lucide_react4.Wallet, { className: "w-4 h-4 text-blue-500" });
    } else {
      return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_lucide_react4.Hash, { className: "w-4 h-4 text-green-500" });
    }
  };
  const formatResultText = (result) => {
    const node = result.item;
    const edge = result.item;
    switch (result.matchField) {
      case "address":
        return {
          primary: `${node.address.slice(0, 8)}...${node.address.slice(-6)}`,
          secondary: `${node.risk_level} risk \u2022 Depth ${node.depth}`
        };
      case "risk_level":
        return {
          primary: `${node.risk_level.toUpperCase()} Risk`,
          secondary: `${node.address.slice(0, 8)}...${node.address.slice(-6)}`
        };
      case "tag":
        return {
          primary: result.matchValue,
          secondary: `${node.address.slice(0, 8)}...${node.address.slice(-6)}`
        };
      case "chain":
        return {
          primary: `${result.matchValue} Chain`,
          secondary: `${node.address.slice(0, 8)}...${node.address.slice(-6)}`
        };
      case "addresses":
        return {
          primary: `Transaction Edge`,
          secondary: `${edge.from.slice(0, 6)}...${edge.from.slice(-4)} \u2192 ${edge.to.slice(0, 6)}...${edge.to.slice(-4)}`
        };
      case "token":
        return {
          primary: `${result.matchValue} Transfer`,
          secondary: edge.formatted_amount
        };
      case "amount":
        return {
          primary: result.matchValue,
          secondary: `${edge.from.slice(0, 6)}...${edge.from.slice(-4)} \u2192 ${edge.to.slice(0, 6)}...${edge.to.slice(-4)}`
        };
      default:
        return {
          primary: result.matchValue,
          secondary: ""
        };
    }
  };
  const showSearchHints = query.length > 0 && query.length < 2;
  const queryType = (0, import_react5.useMemo)(() => {
    if (isValidAddress(query)) return "address";
    if (isValidTxHash(query)) return "transaction";
    return "general";
  }, [query]);
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: `relative ${className}`, children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "relative", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_lucide_react4.Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        "input",
        {
          type: "text",
          value: query,
          onChange: handleInputChange,
          onFocus: () => setIsOpen(query.length >= 2),
          onBlur: () => setTimeout(() => setIsOpen(false), 150),
          placeholder,
          className: "w-full pl-10 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400"
        }
      ),
      query && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        "button",
        {
          onClick: handleClear,
          className: "absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300",
          children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_lucide_react4.X, { className: "w-4 h-4" })
        }
      )
    ] }),
    (isOpen || showSearchHints) && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "absolute z-30 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-700", children: [
      showSearchHints && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "p-3", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 dark:text-gray-400", children: "Search Tips" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "space-y-1 text-xs text-gray-600 dark:text-gray-400", children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { children: "\u2022 Enter at least 2 characters to search" }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { children: "\u2022 Search addresses: 0x1234... or TN3W4H..." }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { children: "\u2022 Search risk levels: high, medium, low" }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { children: "\u2022 Search entity tags: exchange, defi, etc." }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { children: "\u2022 Search amounts: 100 USDT, 1.5 ETH" })
        ] })
      ] }),
      isOpen && searchResults.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "p-4 text-center text-sm text-gray-500 dark:text-gray-400", children: [
        'No results found for "',
        query,
        '"'
      ] }),
      isOpen && searchResults.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_jsx_runtime4.Fragment, { children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "p-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide dark:text-gray-400", children: [
          searchResults.length,
          " result",
          searchResults.length > 1 ? "s" : "",
          queryType !== "general" && ` \u2022 ${queryType} detected`
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "mt-1 space-y-1", children: searchResults.map((result, index) => {
          const { primary, secondary } = formatResultText(result);
          return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
            "button",
            {
              onClick: () => handleResultClick(result),
              className: "w-full flex items-center gap-3 px-2 py-2 text-left text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700",
              children: [
                getResultIcon(result),
                /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "font-medium text-gray-900 dark:text-gray-100", children: primary }),
                  secondary && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "text-xs text-gray-500 dark:text-gray-400 truncate", children: secondary })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "text-xs text-gray-400 dark:text-gray-500", children: result.type })
              ]
            },
            index
          );
        }) })
      ] }) })
    ] })
  ] });
}

// src/components/FilterPanel.tsx
var import_react6 = require("react");
var import_lucide_react5 = require("lucide-react");
var import_jsx_runtime5 = require("react/jsx-runtime");
var RISK_LEVELS = ["high", "medium", "low", "unknown"];
var RISK_COLORS = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#22c55e",
  unknown: "#6b7280"
};
function FilterPanel({
  nodes,
  edges,
  filter,
  onChange,
  className = ""
}) {
  const [isExpanded, setIsExpanded] = (0, import_react6.useState)(false);
  const availableOptions = (0, import_react6.useMemo)(() => {
    const chains = [...new Set(nodes.map((n) => n.chain).filter(Boolean))];
    const tokens = [...new Set(edges.map((e) => e.token).filter(Boolean))];
    const depths = nodes.map((n) => n.depth);
    const amounts = edges.map((e) => parseFloat(e.amount) || 0).filter((a) => a > 0);
    const timestamps = edges.map((e) => e.last_timestamp);
    return {
      chains: chains.sort(),
      tokens: tokens.sort(),
      depthRange: depths.length > 0 ? [Math.min(...depths), Math.max(...depths)] : [0, 5],
      amountRange: amounts.length > 0 ? [Math.min(...amounts), Math.max(...amounts)] : [0, 1e6],
      dateRange: timestamps.length > 0 ? [Math.min(...timestamps), Math.max(...timestamps)] : [0, Date.now() / 1e3]
    };
  }, [nodes, edges]);
  const activeFilterCount = (0, import_react6.useMemo)(() => {
    let count = 0;
    if (filter.riskLevels.length < RISK_LEVELS.length) count++;
    if (filter.chains.length > 0 && filter.chains.length < availableOptions.chains.length) count++;
    if (filter.depthRange[0] > availableOptions.depthRange[0] || filter.depthRange[1] < availableOptions.depthRange[1]) count++;
    if (filter.amountRange[0] > availableOptions.amountRange[0] || filter.amountRange[1] < availableOptions.amountRange[1]) count++;
    if (filter.dateRange[0] || filter.dateRange[1]) count++;
    if (filter.tokens.length > 0) count++;
    if (filter.onlyRootNodes) count++;
    if (filter.onlyStoppedNodes) count++;
    if (filter.hideUntaggedNodes) count++;
    return count;
  }, [filter, availableOptions]);
  const updateFilter = (updates) => {
    onChange({ ...filter, ...updates });
  };
  const clearAllFilters = () => {
    onChange({
      riskLevels: RISK_LEVELS,
      chains: [],
      depthRange: availableOptions.depthRange,
      amountRange: availableOptions.amountRange,
      dateRange: [null, null],
      tokens: [],
      onlyRootNodes: false,
      onlyStoppedNodes: false,
      hideUntaggedNodes: false
    });
  };
  const formatAmount = (amount) => {
    if (amount >= 1e9) return `${(amount / 1e9).toFixed(1)}B`;
    if (amount >= 1e6) return `${(amount / 1e6).toFixed(1)}M`;
    if (amount >= 1e3) return `${(amount / 1e3).toFixed(1)}K`;
    return amount.toFixed(2);
  };
  const formatDate = (timestamp) => {
    return new Date(timestamp * 1e3).toISOString().split("T")[0];
  };
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: `bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 ${className}`, children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700", children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_lucide_react5.Filter, { className: "w-4 h-4 text-gray-500" }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "font-medium text-gray-900 dark:text-gray-100", children: "Filters" }),
        activeFilterCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "px-2 py-0.5 text-xs font-medium text-white bg-blue-500 rounded-full", children: activeFilterCount })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "flex items-center gap-1", children: [
        activeFilterCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
          "button",
          {
            onClick: clearAllFilters,
            className: "px-2 py-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
            children: "Clear all"
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
          "button",
          {
            onClick: () => setIsExpanded(!isExpanded),
            className: "p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
            children: isExpanded ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_lucide_react5.ChevronUp, { className: "w-4 h-4" }) : /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_lucide_react5.ChevronDown, { className: "w-4 h-4" })
          }
        )
      ] })
    ] }),
    isExpanded && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "p-4 space-y-4", children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("label", { className: "block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2", children: "Risk Levels" }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "flex flex-wrap gap-2", children: RISK_LEVELS.map((risk) => /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
          "button",
          {
            onClick: () => {
              const newRiskLevels = filter.riskLevels.includes(risk) ? filter.riskLevels.filter((r) => r !== risk) : [...filter.riskLevels, risk];
              updateFilter({ riskLevels: newRiskLevels });
            },
            className: `flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full border transition-colors ${filter.riskLevels.includes(risk) ? "bg-opacity-20 border-current" : "bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"}`,
            style: {
              color: filter.riskLevels.includes(risk) ? RISK_COLORS[risk] : void 0,
              backgroundColor: filter.riskLevels.includes(risk) ? `${RISK_COLORS[risk]}20` : void 0,
              borderColor: filter.riskLevels.includes(risk) ? RISK_COLORS[risk] : void 0
            },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_lucide_react5.AlertTriangle, { className: "w-3 h-3" }),
              risk.toUpperCase()
            ]
          },
          risk
        )) })
      ] }),
      availableOptions.chains.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("label", { className: "block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2", children: "Chains" }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "flex flex-wrap gap-2", children: availableOptions.chains.map((chain) => /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
          "button",
          {
            onClick: () => {
              const newChains = filter.chains.includes(chain) ? filter.chains.filter((c) => c !== chain) : [...filter.chains, chain];
              updateFilter({ chains: newChains });
            },
            className: `flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full border transition-colors ${filter.chains.length === 0 || filter.chains.includes(chain) ? "bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-300" : "bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"}`,
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_lucide_react5.Layers, { className: "w-3 h-3" }),
              chain
            ]
          },
          chain
        )) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("label", { className: "block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2", children: [
          "Depth Range: ",
          filter.depthRange[0],
          " - ",
          filter.depthRange[1]
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
            "input",
            {
              type: "range",
              min: availableOptions.depthRange[0],
              max: availableOptions.depthRange[1],
              value: filter.depthRange[0],
              onChange: (e) => {
                const value = parseInt(e.target.value);
                updateFilter({ depthRange: [value, Math.max(value, filter.depthRange[1])] });
              },
              className: "flex-1"
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
            "input",
            {
              type: "range",
              min: availableOptions.depthRange[0],
              max: availableOptions.depthRange[1],
              value: filter.depthRange[1],
              onChange: (e) => {
                const value = parseInt(e.target.value);
                updateFilter({ depthRange: [Math.min(filter.depthRange[0], value), value] });
              },
              className: "flex-1"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("label", { className: "block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2", children: [
          "Amount Range: ",
          formatAmount(filter.amountRange[0]),
          " - ",
          formatAmount(filter.amountRange[1])
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_lucide_react5.DollarSign, { className: "w-4 h-4 text-gray-500" }),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
            "input",
            {
              type: "range",
              min: availableOptions.amountRange[0],
              max: availableOptions.amountRange[1],
              value: filter.amountRange[0],
              onChange: (e) => {
                const value = parseFloat(e.target.value);
                updateFilter({ amountRange: [value, Math.max(value, filter.amountRange[1])] });
              },
              className: "flex-1",
              step: availableOptions.amountRange[1] / 100
            }
          )
        ] })
      ] }),
      availableOptions.tokens.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("label", { className: "block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2", children: "Tokens" }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "flex flex-wrap gap-2", children: [
          availableOptions.tokens.slice(0, 10).map((token) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
            "button",
            {
              onClick: () => {
                const newTokens = filter.tokens.includes(token) ? filter.tokens.filter((t) => t !== token) : [...filter.tokens, token];
                updateFilter({ tokens: newTokens });
              },
              className: `px-3 py-1 text-xs font-medium rounded-full border transition-colors ${filter.tokens.length === 0 || filter.tokens.includes(token) ? "bg-green-100 border-green-300 text-green-700 dark:bg-green-900 dark:border-green-700 dark:text-green-300" : "bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"}`,
              children: token
            },
            token
          )),
          availableOptions.tokens.length > 10 && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("span", { className: "px-3 py-1 text-xs text-gray-500", children: [
            "+",
            availableOptions.tokens.length - 10,
            " more"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "space-y-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("label", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
            "input",
            {
              type: "checkbox",
              checked: filter.onlyRootNodes,
              onChange: (e) => updateFilter({ onlyRootNodes: e.target.checked }),
              className: "rounded border-gray-300"
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "text-sm text-gray-900 dark:text-gray-100", children: "Show only root nodes" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("label", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
            "input",
            {
              type: "checkbox",
              checked: filter.onlyStoppedNodes,
              onChange: (e) => updateFilter({ onlyStoppedNodes: e.target.checked }),
              className: "rounded border-gray-300"
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "text-sm text-gray-900 dark:text-gray-100", children: "Show only stopped nodes" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("label", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
            "input",
            {
              type: "checkbox",
              checked: filter.hideUntaggedNodes,
              onChange: (e) => updateFilter({ hideUntaggedNodes: e.target.checked }),
              className: "rounded border-gray-300"
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "text-sm text-gray-900 dark:text-gray-100", children: "Hide untagged nodes" })
        ] })
      ] })
    ] })
  ] });
}

// src/components/GraphControlPanel.tsx
var import_react7 = __toESM(require("react"));
var import_jsx_runtime6 = require("react/jsx-runtime");
var DEFAULT_FILTER = {
  riskLevels: ["high", "medium", "low", "unknown"],
  chains: [],
  depthRange: [0, 10],
  amountRange: [0, Number.MAX_SAFE_INTEGER],
  dateRange: [null, null],
  tokens: [],
  onlyRootNodes: false,
  onlyStoppedNodes: false,
  hideUntaggedNodes: false
};
function GraphControlPanel({
  nodes,
  edges,
  stats,
  onNodeSelect,
  onFilterChange,
  className = ""
}) {
  const [filter, setFilter] = (0, import_react7.useState)(DEFAULT_FILTER);
  const [selectedNode, setSelectedNode] = (0, import_react7.useState)(null);
  const filteredData = (0, import_react7.useMemo)(() => {
    let filteredNodes = nodes.filter((node) => {
      if (!filter.riskLevels.includes(node.risk_level)) return false;
      if (filter.chains.length > 0 && node.chain && !filter.chains.includes(node.chain)) return false;
      if (node.depth < filter.depthRange[0] || node.depth > filter.depthRange[1]) return false;
      if (filter.onlyRootNodes && !node.is_root) return false;
      if (filter.onlyStoppedNodes && !node.is_stopped) return false;
      if (filter.hideUntaggedNodes && node.tags.length === 0) return false;
      return true;
    });
    const nodeAddresses = new Set(filteredNodes.map((n) => n.address));
    let filteredEdges = edges.filter((edge) => {
      if (!nodeAddresses.has(edge.from) || !nodeAddresses.has(edge.to)) return false;
      const amount = parseFloat(edge.amount) || 0;
      if (amount < filter.amountRange[0] || amount > filter.amountRange[1]) return false;
      if (filter.dateRange[0] && edge.last_timestamp < filter.dateRange[0].getTime() / 1e3) return false;
      if (filter.dateRange[1] && edge.last_timestamp > filter.dateRange[1].getTime() / 1e3) return false;
      if (filter.tokens.length > 0 && edge.token && !filter.tokens.includes(edge.token)) return false;
      return true;
    });
    return { filteredNodes, filteredEdges };
  }, [nodes, edges, filter]);
  import_react7.default.useEffect(() => {
    onFilterChange?.(filteredData.filteredNodes, filteredData.filteredEdges);
  }, [filteredData, onFilterChange]);
  const handleSearchResultSelect = (result) => {
    if (result.type === "node") {
      const node = result.item;
      setSelectedNode(node);
      onNodeSelect?.(node);
    } else if (result.type === "edge") {
      const edge = result.item;
      const targetNode = nodes.find((n) => n.address === edge.to);
      if (targetNode) {
        setSelectedNode(targetNode);
        onNodeSelect?.(targetNode);
      }
    }
  };
  const handleSearchClear = () => {
    setSelectedNode(null);
    onNodeSelect?.(null);
  };
  const filterStats = (0, import_react7.useMemo)(() => {
    const originalNodes = nodes.length;
    const originalEdges = edges.length;
    const filteredNodes = filteredData.filteredNodes.length;
    const filteredEdges = filteredData.filteredEdges.length;
    return {
      nodes: {
        original: originalNodes,
        filtered: filteredNodes,
        hidden: originalNodes - filteredNodes
      },
      edges: {
        original: originalEdges,
        filtered: filteredEdges,
        hidden: originalEdges - filteredEdges
      }
    };
  }, [nodes.length, edges.length, filteredData]);
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: `space-y-4 ${className}`, children: [
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
      SearchBar,
      {
        nodes: filteredData.filteredNodes,
        edges: filteredData.filteredEdges,
        onResultSelect: handleSearchResultSelect,
        onClear: handleSearchClear
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
      FilterPanel,
      {
        nodes,
        edges,
        filter,
        onChange: setFilter
      }
    ),
    (filterStats.nodes.hidden > 0 || filterStats.edges.hidden > 0) && /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "p-3 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-900/20 dark:border-blue-800", children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "text-sm font-medium text-blue-900 dark:text-blue-100 mb-1", children: "Filter Applied" }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "text-xs text-blue-700 dark:text-blue-300 space-y-0.5", children: [
        filterStats.nodes.hidden > 0 && /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { children: [
          "Showing ",
          filterStats.nodes.filtered,
          " of ",
          filterStats.nodes.original,
          " nodes (",
          filterStats.nodes.hidden,
          " hidden)"
        ] }),
        filterStats.edges.hidden > 0 && /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { children: [
          "Showing ",
          filterStats.edges.filtered,
          " of ",
          filterStats.edges.original,
          " edges (",
          filterStats.edges.hidden,
          " hidden)"
        ] })
      ] })
    ] }),
    selectedNode && /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "p-3 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800", children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "text-sm font-medium text-green-900 dark:text-green-100 mb-1", children: "Selected Node" }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "text-xs text-green-700 dark:text-green-300 space-y-0.5", children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "font-mono", children: [
          selectedNode.address.slice(0, 8),
          "...",
          selectedNode.address.slice(-6)
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { children: [
          "Risk: ",
          selectedNode.risk_level.toUpperCase(),
          " \u2022 Depth: ",
          selectedNode.depth
        ] }),
        selectedNode.tags.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { children: [
          "Tags: ",
          selectedNode.tags.map((t) => t.primary_category).join(", ")
        ] })
      ] })
    ] })
  ] });
}

// src/components/RealTimeManager.tsx
var import_react9 = require("react");
var import_lucide_react6 = require("lucide-react");

// src/hooks/useWebSocket.ts
var import_react8 = require("react");
function useWebSocket(config) {
  const [state, setState] = (0, import_react8.useState)({
    isConnected: false,
    isConnecting: false,
    error: null,
    reconnectAttempts: 0
  });
  const wsRef = (0, import_react8.useRef)(null);
  const reconnectTimeoutRef = (0, import_react8.useRef)(null);
  const heartbeatIntervalRef = (0, import_react8.useRef)(null);
  const reconnectAttemptsRef = (0, import_react8.useRef)(0);
  const {
    url,
    protocols,
    reconnectInterval = 5e3,
    maxReconnectAttempts = 5,
    heartbeatInterval = 3e4,
    onMessage,
    onError,
    onConnect,
    onDisconnect
  } = config;
  const cleanup = (0, import_react8.useCallback)(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);
  const startHeartbeat = (0, import_react8.useCallback)(() => {
    if (heartbeatInterval > 0) {
      heartbeatIntervalRef.current = setInterval(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: "ping" }));
        }
      }, heartbeatInterval);
    }
  }, [heartbeatInterval]);
  const connect = (0, import_react8.useCallback)(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }
    setState((prev) => ({ ...prev, isConnecting: true, error: null }));
    try {
      const ws = new WebSocket(url, protocols);
      wsRef.current = ws;
      ws.onopen = () => {
        setState((prev) => ({
          ...prev,
          isConnected: true,
          isConnecting: false,
          error: null,
          reconnectAttempts: 0
        }));
        reconnectAttemptsRef.current = 0;
        startHeartbeat();
        onConnect?.();
      };
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "ping") {
            ws.send(JSON.stringify({ type: "pong" }));
            return;
          }
          if (data.type === "pong") {
            return;
          }
          onMessage?.(data);
        } catch (error) {
          console.warn("Failed to parse WebSocket message:", error);
          onMessage?.(event.data);
        }
      };
      ws.onclose = (event) => {
        setState((prev) => ({
          ...prev,
          isConnected: false,
          isConnecting: false
        }));
        cleanup();
        onDisconnect?.();
        if (!event.wasClean && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1;
          setState((prev) => ({
            ...prev,
            reconnectAttempts: reconnectAttemptsRef.current
          }));
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };
      ws.onerror = (error) => {
        setState((prev) => ({
          ...prev,
          isConnecting: false,
          error: "WebSocket connection failed"
        }));
        onError?.(error);
      };
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error: error instanceof Error ? error.message : "Connection failed"
      }));
    }
  }, [url, protocols, onMessage, onError, onConnect, onDisconnect, startHeartbeat, cleanup, maxReconnectAttempts, reconnectInterval]);
  const disconnect = (0, import_react8.useCallback)(() => {
    cleanup();
    if (wsRef.current) {
      wsRef.current.close(1e3, "Manual disconnect");
      wsRef.current = null;
    }
    setState((prev) => ({
      ...prev,
      isConnected: false,
      isConnecting: false,
      reconnectAttempts: 0
    }));
    reconnectAttemptsRef.current = maxReconnectAttempts;
  }, [cleanup, maxReconnectAttempts]);
  const sendMessage = (0, import_react8.useCallback)((message) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const data = typeof message === "string" ? message : JSON.stringify(message);
      wsRef.current.send(data);
      return true;
    }
    return false;
  }, []);
  const subscribe = (0, import_react8.useCallback)((channel, params) => {
    return sendMessage({
      type: "subscribe",
      channel,
      params
    });
  }, [sendMessage]);
  const unsubscribe = (0, import_react8.useCallback)((channel) => {
    return sendMessage({
      type: "unsubscribe",
      channel
    });
  }, [sendMessage]);
  (0, import_react8.useEffect)(() => {
    connect();
    return () => {
      cleanup();
      if (wsRef.current) {
        wsRef.current.close(1e3, "Component unmount");
      }
    };
  }, []);
  return {
    state,
    connect,
    disconnect,
    sendMessage,
    subscribe,
    unsubscribe
  };
}

// src/components/RealTimeManager.tsx
var import_jsx_runtime7 = require("react/jsx-runtime");
function RealTimeManager({
  wsUrl = "wss://api.trustin.info/ws",
  watchedAddresses = [],
  onUpdate,
  onGraphUpdate,
  onNewTransaction,
  onRiskUpdate,
  className = ""
}) {
  const [isEnabled, setIsEnabled] = (0, import_react9.useState)(false);
  const [notifications, setNotifications] = (0, import_react9.useState)(true);
  const [updateCount, setUpdateCount] = (0, import_react9.useState)(0);
  const [lastUpdate, setLastUpdate] = (0, import_react9.useState)(null);
  const [recentUpdates, setRecentUpdates] = (0, import_react9.useState)([]);
  const handleWebSocketMessage = (0, import_react9.useCallback)((data) => {
    const update = {
      type: data.type || "graph_update",
      timestamp: Date.now(),
      data: data.payload || data,
      address: data.address,
      chain: data.chain
    };
    setRecentUpdates((prev) => [update, ...prev.slice(0, 9)]);
    setUpdateCount((prev) => prev + 1);
    setLastUpdate(/* @__PURE__ */ new Date());
    onUpdate?.(update);
    switch (update.type) {
      case "new_transaction":
        onNewTransaction?.(update.data);
        if (notifications) {
          showNotification("New Transaction", `Transaction detected for ${update.address?.slice(0, 8)}...`);
        }
        break;
      case "risk_update":
        if (update.address) {
          onRiskUpdate?.(update.address, update.data.riskLevel);
          if (notifications && update.data.riskLevel === "high") {
            showNotification("Risk Alert", `High risk detected for ${update.address.slice(0, 8)}...`, "error");
          }
        }
        break;
      case "graph_update":
        onGraphUpdate?.(update.data);
        break;
    }
  }, [onUpdate, onGraphUpdate, onNewTransaction, onRiskUpdate, notifications]);
  const { state, connect, disconnect, subscribe, unsubscribe } = useWebSocket({
    url: wsUrl,
    onMessage: handleWebSocketMessage,
    onConnect: () => {
      console.log("Real-time connection established");
    },
    onDisconnect: () => {
      console.log("Real-time connection closed");
    },
    onError: (error) => {
      console.error("Real-time connection error:", error);
    }
  });
  (0, import_react9.useEffect)(() => {
    if (state.isConnected && isEnabled) {
      watchedAddresses.forEach((address) => {
        subscribe("transactions", { address });
        subscribe("risk_updates", { address });
      });
      return () => {
        watchedAddresses.forEach((address) => {
          unsubscribe("transactions");
          unsubscribe("risk_updates");
        });
      };
    }
  }, [state.isConnected, isEnabled, watchedAddresses, subscribe, unsubscribe]);
  const handleToggle = () => {
    if (isEnabled) {
      setIsEnabled(false);
      disconnect();
    } else {
      setIsEnabled(true);
      if (!state.isConnected) {
        connect();
      }
    }
  };
  const showNotification = (title, body, type = "info") => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: type === "error" ? "\u26A0\uFE0F" : "\u{1F514}",
        tag: "txgraph-update"
      });
    }
  };
  const requestNotificationPermission = async () => {
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }
  };
  (0, import_react9.useEffect)(() => {
    if (notifications) {
      requestNotificationPermission();
    }
  }, [notifications]);
  const getConnectionStatus = () => {
    if (state.isConnecting) return { text: "Connecting...", color: "text-yellow-500" };
    if (state.isConnected && isEnabled) return { text: "Live", color: "text-green-500" };
    if (state.error) return { text: "Error", color: "text-red-500" };
    return { text: "Disconnected", color: "text-gray-500" };
  };
  const status = getConnectionStatus();
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: `bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 ${className}`, children: [
    /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700", children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "flex items-center gap-2", children: [
        state.isConnected && isEnabled ? /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_lucide_react6.Wifi, { className: "w-4 h-4 text-green-500" }) : /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_lucide_react6.WifiOff, { className: "w-4 h-4 text-gray-400" }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "font-medium text-gray-900 dark:text-gray-100", children: "Real-time Updates" }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: `text-xs font-medium ${status.color}`, children: status.text })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
          "button",
          {
            onClick: () => setNotifications(!notifications),
            className: "p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
            title: notifications ? "Disable notifications" : "Enable notifications",
            children: notifications ? /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_lucide_react6.Bell, { className: "w-4 h-4" }) : /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_lucide_react6.BellOff, { className: "w-4 h-4" })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(
          "button",
          {
            onClick: handleToggle,
            className: `flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-md transition-colors ${isEnabled ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300" : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"}`,
            children: [
              isEnabled ? /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_lucide_react6.Pause, { className: "w-3 h-3" }) : /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_lucide_react6.Play, { className: "w-3 h-3" }),
              isEnabled ? "Pause" : "Start"
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "p-3", children: [
      state.error && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "flex items-center gap-2 mb-3 p-2 text-sm text-red-700 bg-red-50 rounded-md dark:bg-red-900/20 dark:text-red-300", children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_lucide_react6.AlertCircle, { className: "w-4 h-4" }),
        state.error,
        state.reconnectAttempts > 0 && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("span", { className: "ml-1", children: [
          "(Retry ",
          state.reconnectAttempts,
          "/5)"
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "text-gray-500 dark:text-gray-400", children: "Updates received" }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "font-medium text-gray-900 dark:text-gray-100", children: updateCount })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "text-gray-500 dark:text-gray-400", children: "Last update" }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "font-medium text-gray-900 dark:text-gray-100", children: lastUpdate ? lastUpdate.toLocaleTimeString() : "None" })
        ] })
      ] }),
      watchedAddresses.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "mt-3", children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "text-xs text-gray-500 dark:text-gray-400 mb-1", children: [
          "Watching ",
          watchedAddresses.length,
          " addresses"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "space-y-1", children: [
          watchedAddresses.slice(0, 3).map((address) => /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "flex items-center gap-2 text-xs", children: [
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: `w-2 h-2 rounded-full ${isEnabled && state.isConnected ? "bg-green-400" : "bg-gray-300"}` }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("code", { className: "text-gray-600 dark:text-gray-300", children: [
              address.slice(0, 8),
              "...",
              address.slice(-6)
            ] })
          ] }, address)),
          watchedAddresses.length > 3 && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: [
            "+",
            watchedAddresses.length - 3,
            " more"
          ] })
        ] })
      ] }),
      recentUpdates.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "mt-3", children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "text-xs text-gray-500 dark:text-gray-400 mb-1", children: "Recent updates" }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "space-y-1 max-h-24 overflow-y-auto", children: recentUpdates.slice(0, 5).map((update, index) => /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "flex items-center justify-between text-xs", children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "text-gray-600 dark:text-gray-300", children: update.type.replace("_", " ") }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "text-gray-500 dark:text-gray-400", children: new Date(update.timestamp).toLocaleTimeString() })
        ] }, index)) })
      ] })
    ] })
  ] });
}

// src/components/ClusterAnalysis.tsx
var import_react10 = require("react");
var import_lucide_react7 = require("lucide-react");

// src/utils/clustering.ts
var DEFAULT_OPTIONS = {
  minClusterSize: 3,
  maxDistance: 0.7,
  riskThreshold: 0.6,
  valueThreshold: 1e3,
  useTemporalClustering: true,
  timeWindowHours: 24
};
function calculateNodeSimilarity(node1, node2, edges, options) {
  let similarity = 0;
  let factors = 0;
  if (node1.risk_level === node2.risk_level) {
    similarity += 0.3;
  }
  factors += 0.3;
  const tags1 = new Set(node1.tags.map((t) => t.primary_category));
  const tags2 = new Set(node2.tags.map((t) => t.primary_category));
  const commonTags = [...tags1].filter((t) => tags2.has(t));
  if (tags1.size > 0 && tags2.size > 0) {
    similarity += commonTags.length / Math.max(tags1.size, tags2.size) * 0.25;
  }
  factors += 0.25;
  const edges1 = edges.filter((e) => e.from === node1.address || e.to === node1.address);
  const edges2 = edges.filter((e) => e.from === node2.address || e.to === node2.address);
  const counterparties1 = new Set(edges1.map((e) => e.from === node1.address ? e.to : e.from));
  const counterparties2 = new Set(edges2.map((e) => e.from === node2.address ? e.to : e.from));
  const commonCounterparties = [...counterparties1].filter((c) => counterparties2.has(c));
  if (counterparties1.size > 0 && counterparties2.size > 0) {
    similarity += commonCounterparties.length / Math.max(counterparties1.size, counterparties2.size) * 0.2;
  }
  factors += 0.2;
  const totalValue1 = edges1.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  const totalValue2 = edges2.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  if (totalValue1 > 0 && totalValue2 > 0) {
    const valueRatio = Math.min(totalValue1, totalValue2) / Math.max(totalValue1, totalValue2);
    similarity += valueRatio * 0.15;
  }
  factors += 0.15;
  if (options.useTemporalClustering) {
    const timestamps1 = edges1.map((e) => e.last_timestamp).sort();
    const timestamps2 = edges2.map((e) => e.last_timestamp).sort();
    if (timestamps1.length > 0 && timestamps2.length > 0) {
      const timeDiff = Math.abs(timestamps1[0] - timestamps2[0]);
      const timeWindow = options.timeWindowHours * 3600;
      const temporalSimilarity = Math.max(0, 1 - timeDiff / timeWindow);
      similarity += temporalSimilarity * 0.1;
    }
    factors += 0.1;
  }
  return factors > 0 ? similarity / factors : 0;
}
function detectClusters(nodes, edges, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const clusters = [];
  const clusteredNodes = /* @__PURE__ */ new Set();
  const similarities = /* @__PURE__ */ new Map();
  for (let i = 0; i < nodes.length; i++) {
    const node1 = nodes[i];
    similarities.set(node1.address, /* @__PURE__ */ new Map());
    for (let j = i + 1; j < nodes.length; j++) {
      const node2 = nodes[j];
      const sim = calculateNodeSimilarity(node1, node2, edges, opts);
      similarities.get(node1.address).set(node2.address, sim);
      if (!similarities.has(node2.address)) {
        similarities.set(node2.address, /* @__PURE__ */ new Map());
      }
      similarities.get(node2.address).set(node1.address, sim);
    }
  }
  for (const seedNode of nodes) {
    if (clusteredNodes.has(seedNode.address)) continue;
    const clusterNodes = [];
    const candidates = [seedNode];
    const visited = /* @__PURE__ */ new Set();
    while (candidates.length > 0) {
      const currentNode = candidates.pop();
      if (visited.has(currentNode.address)) continue;
      visited.add(currentNode.address);
      let shouldInclude = clusterNodes.length === 0;
      if (!shouldInclude) {
        const avgSimilarity = clusterNodes.reduce((sum, clusterNode) => {
          return sum + (similarities.get(currentNode.address)?.get(clusterNode.address) || 0);
        }, 0) / clusterNodes.length;
        shouldInclude = avgSimilarity >= opts.maxDistance;
      }
      if (shouldInclude) {
        clusterNodes.push({
          ...currentNode,
          clusterId: `cluster_${clusters.length}`,
          clusterScore: clusterNodes.length > 0 ? clusterNodes.reduce((sum, n) => sum + (similarities.get(currentNode.address)?.get(n.address) || 0), 0) / clusterNodes.length : 1
        });
        for (const neighbor of nodes) {
          if (!visited.has(neighbor.address) && !clusteredNodes.has(neighbor.address)) {
            const sim = similarities.get(currentNode.address)?.get(neighbor.address) || 0;
            if (sim >= opts.maxDistance) {
              candidates.push(neighbor);
            }
          }
        }
      }
    }
    if (clusterNodes.length >= opts.minClusterSize) {
      clusterNodes.forEach((node) => clusteredNodes.add(node.address));
      const { type, centroid } = determineClusterType(clusterNodes, edges);
      const riskCounts = clusterNodes.reduce((counts, node) => {
        counts[node.risk_level] = (counts[node.risk_level] || 0) + 1;
        return counts;
      }, {});
      const dominantRisk = Object.entries(riskCounts).reduce((a, b) => riskCounts[a[0]] > riskCounts[b[0]] ? a : b)[0];
      const clusterAddresses = new Set(clusterNodes.map((n) => n.address));
      const clusterEdges = edges.filter(
        (e) => clusterAddresses.has(e.from) || clusterAddresses.has(e.to)
      );
      const totalValue = clusterEdges.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
      const avgClusterScore = clusterNodes.reduce((sum, n) => sum + (n.clusterScore || 0), 0) / clusterNodes.length;
      const sizeConfidence = Math.min(1, clusterNodes.length / 10);
      const riskConfidence = dominantRisk === "high" ? 0.9 : dominantRisk === "medium" ? 0.7 : 0.5;
      const confidence = (avgClusterScore + sizeConfidence + riskConfidence) / 3;
      clusters.push({
        id: `cluster_${clusters.length}`,
        nodes: clusterNodes,
        centroid,
        type,
        riskLevel: dominantRisk,
        totalValue,
        confidence
      });
    }
  }
  return clusters.sort((a, b) => b.confidence - a.confidence);
}
function determineClusterType(nodes, edges) {
  const allTags = nodes.flatMap((n) => n.tags.map((t) => t.primary_category.toLowerCase()));
  const tagCounts = allTags.reduce((counts, tag) => {
    counts[tag] = (counts[tag] || 0) + 1;
    return counts;
  }, {});
  const dominantTag = Object.entries(tagCounts).reduce((a, b) => a[1] > b[1] ? a : b, ["", 0])[0];
  let type = "unknown";
  if (dominantTag.includes("exchange") || dominantTag.includes("trading")) {
    type = "exchange";
  } else if (dominantTag.includes("mixer") || dominantTag.includes("tumbler")) {
    type = "mixer";
  } else if (dominantTag.includes("pool") || dominantTag.includes("liquidity")) {
    type = "pool";
  } else if (dominantTag.includes("bridge")) {
    type = "bridge";
  }
  const nodeConnections = nodes.map((node) => {
    const connections = edges.filter((e) => e.from === node.address || e.to === node.address).length;
    return { address: node.address, connections };
  });
  const centroid = nodeConnections.reduce((a, b) => a.connections > b.connections ? a : b).address;
  return { type, centroid };
}
function detectAnomalies(nodes, edges) {
  const anomalies = [];
  const addressTimestamps = /* @__PURE__ */ new Map();
  edges.forEach((edge) => {
    if (!addressTimestamps.has(edge.from)) addressTimestamps.set(edge.from, []);
    if (!addressTimestamps.has(edge.to)) addressTimestamps.set(edge.to, []);
    addressTimestamps.get(edge.from).push(edge.last_timestamp);
    addressTimestamps.get(edge.to).push(edge.last_timestamp);
  });
  addressTimestamps.forEach((timestamps, address) => {
    if (timestamps.length < 5) return;
    timestamps.sort((a, b) => a - b);
    const intervals = [];
    for (let i = 1; i < timestamps.length; i++) {
      intervals.push(timestamps[i] - timestamps[i - 1]);
    }
    const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    const rapidCount = intervals.filter((interval) => interval < 300).length;
    if (rapidCount > intervals.length * 0.5 && avgInterval < 600) {
      anomalies.push({
        type: "rapid_succession",
        addresses: [address],
        description: `Rapid succession of ${rapidCount} transactions within short time periods`,
        severity: "high",
        confidence: Math.min(0.9, rapidCount / intervals.length)
      });
    }
  });
  const roundAmountAddresses = /* @__PURE__ */ new Set();
  edges.forEach((edge) => {
    const amount = parseFloat(edge.amount) || 0;
    if (amount > 0) {
      const isRound = amount === Math.round(amount) || amount === Math.round(amount / 1e3) * 1e3 || amount === Math.round(amount / 1e6) * 1e6;
      if (isRound && amount >= 1e3) {
        roundAmountAddresses.add(edge.from);
        roundAmountAddresses.add(edge.to);
      }
    }
  });
  if (roundAmountAddresses.size > 2) {
    const addressRoundCounts = /* @__PURE__ */ new Map();
    for (const edge of edges) {
      const amount = parseFloat(edge.amount) || 0;
      const isRound = amount === Math.round(amount) || amount === Math.round(amount / 1e3) * 1e3;
      for (const addr of [edge.from, edge.to]) {
        if (!addressRoundCounts.has(addr)) {
          addressRoundCounts.set(addr, { total: 0, round: 0 });
        }
        const counts = addressRoundCounts.get(addr);
        counts.total += 1;
        if (isRound) counts.round += 1;
      }
    }
    const suspiciousAddresses = Array.from(addressRoundCounts.entries()).filter(([, counts]) => counts.total >= 3 && counts.round / counts.total > 0.7).map(([addr]) => addr);
    if (suspiciousAddresses.length > 0) {
      anomalies.push({
        type: "round_amounts",
        addresses: suspiciousAddresses,
        description: `Frequent round amount transactions suggesting potential structuring`,
        severity: "medium",
        confidence: suspiciousAddresses.length / Math.max(3, roundAmountAddresses.size)
      });
    }
  }
  const concentrationMap = /* @__PURE__ */ new Map();
  edges.forEach((edge) => {
    if (!concentrationMap.has(edge.to)) {
      concentrationMap.set(edge.to, { inbound: [], outbound: [] });
    }
    if (!concentrationMap.has(edge.from)) {
      concentrationMap.set(edge.from, { inbound: [], outbound: [] });
    }
    concentrationMap.get(edge.to).inbound.push(edge);
    concentrationMap.get(edge.from).outbound.push(edge);
  });
  concentrationMap.forEach(({ inbound, outbound }, address) => {
    if (inbound.length >= 10) {
      const amounts = inbound.map((e) => parseFloat(e.amount) || 0);
      const avgAmount = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;
      const maxAmount = Math.max(...amounts);
      if (avgAmount > 0 && maxAmount / avgAmount < 10) {
        anomalies.push({
          type: "concentration",
          addresses: [address],
          description: `Collection pattern: ${inbound.length} similar-sized inbound transactions`,
          severity: "medium",
          confidence: Math.min(0.8, inbound.length / 20)
        });
      }
    }
    if (outbound.length >= 10) {
      const amounts = outbound.map((e) => parseFloat(e.amount) || 0);
      const avgAmount = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;
      const maxAmount = Math.max(...amounts);
      if (avgAmount > 0 && maxAmount / avgAmount < 10) {
        anomalies.push({
          type: "concentration",
          addresses: [address],
          description: `Distribution pattern: ${outbound.length} similar-sized outbound transactions`,
          severity: "medium",
          confidence: Math.min(0.8, outbound.length / 20)
        });
      }
    }
  });
  return anomalies.sort((a, b) => {
    const severityOrder = { high: 3, medium: 2, low: 1 };
    const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
    return severityDiff !== 0 ? severityDiff : b.confidence - a.confidence;
  });
}

// src/components/ClusterAnalysis.tsx
var import_jsx_runtime8 = require("react/jsx-runtime");
var CLUSTER_COLORS = {
  exchange: "#3b82f6",
  mixer: "#ef4444",
  pool: "#22c55e",
  bridge: "#8b5cf6",
  unknown: "#6b7280"
};
var RISK_COLORS2 = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#22c55e",
  unknown: "#6b7280"
};
function ClusterAnalysis({
  nodes,
  edges,
  onClusterSelect,
  onHighlightNodes,
  className = ""
}) {
  const [isExpanded, setIsExpanded] = (0, import_react10.useState)(false);
  const [showSettings, setShowSettings] = (0, import_react10.useState)(false);
  const [selectedCluster, setSelectedCluster] = (0, import_react10.useState)(null);
  const [highlightedClusters, setHighlightedClusters] = (0, import_react10.useState)(/* @__PURE__ */ new Set());
  const [clusteringOptions, setClusteringOptions] = (0, import_react10.useState)({
    minClusterSize: 3,
    maxDistance: 0.7,
    riskThreshold: 0.6,
    valueThreshold: 1e3,
    useTemporalClustering: true,
    timeWindowHours: 24
  });
  const { clusters, anomalies } = (0, import_react10.useMemo)(() => {
    if (nodes.length === 0) return { clusters: [], anomalies: [] };
    const clusters2 = detectClusters(nodes, edges, clusteringOptions);
    const anomalies2 = detectAnomalies(nodes, edges);
    return { clusters: clusters2, anomalies: anomalies2 };
  }, [nodes, edges, clusteringOptions]);
  const handleClusterSelect = (cluster) => {
    setSelectedCluster(cluster === selectedCluster ? null : cluster);
    onClusterSelect?.(cluster === selectedCluster ? null : cluster);
  };
  const handleClusterToggle = (clusterId) => {
    const newHighlighted = new Set(highlightedClusters);
    if (newHighlighted.has(clusterId)) {
      newHighlighted.delete(clusterId);
    } else {
      newHighlighted.add(clusterId);
    }
    setHighlightedClusters(newHighlighted);
    const addressesToHighlight = clusters.filter((c) => newHighlighted.has(c.id)).flatMap((c) => c.nodes.map((n) => n.address));
    onHighlightNodes?.(addressesToHighlight);
  };
  const handleAnomalyHighlight = (addresses) => {
    onHighlightNodes?.(addresses);
  };
  const analysisStats = (0, import_react10.useMemo)(() => {
    const totalNodes = nodes.length;
    const clusteredNodes = clusters.reduce((sum, c) => sum + c.nodes.length, 0);
    const highRiskClusters = clusters.filter((c) => c.riskLevel === "high").length;
    const highSeverityAnomalies = anomalies.filter((a) => a.severity === "high").length;
    return {
      totalNodes,
      clusteredNodes,
      unclustered: totalNodes - clusteredNodes,
      clusteringRate: totalNodes > 0 ? clusteredNodes / totalNodes * 100 : 0,
      highRiskClusters,
      totalAnomalies: anomalies.length,
      highSeverityAnomalies
    };
  }, [nodes.length, clusters, anomalies]);
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: `bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 ${className}`, children: [
    /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700", children: [
      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_lucide_react7.Brain, { className: "w-4 h-4 text-purple-500" }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "font-medium text-gray-900 dark:text-gray-100", children: "Cluster Analysis" }),
        clusters.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "px-2 py-0.5 text-xs font-medium text-white bg-purple-500 rounded-full", children: clusters.length })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
          "button",
          {
            onClick: () => setShowSettings(!showSettings),
            className: "p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
            title: "Settings",
            children: /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_lucide_react7.Settings, { className: "w-4 h-4" })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
          "button",
          {
            onClick: () => setIsExpanded(!isExpanded),
            className: "p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
            children: isExpanded ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_lucide_react7.ChevronUp, { className: "w-4 h-4" }) : /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_lucide_react7.ChevronDown, { className: "w-4 h-4" })
          }
        )
      ] })
    ] }),
    showSettings && /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "p-3 bg-gray-50 border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700", children: [
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "text-sm font-medium text-gray-900 dark:text-gray-100 mb-2", children: "Clustering Settings" }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "grid grid-cols-2 gap-3 text-sm", children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("label", { className: "block text-xs text-gray-500 dark:text-gray-400 mb-1", children: "Min Cluster Size" }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
            "input",
            {
              type: "number",
              min: "2",
              max: "10",
              value: clusteringOptions.minClusterSize,
              onChange: (e) => setClusteringOptions((prev) => ({
                ...prev,
                minClusterSize: parseInt(e.target.value) || 3
              })),
              className: "w-full px-2 py-1 text-xs border border-gray-300 rounded dark:bg-gray-800 dark:border-gray-600"
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("label", { className: "block text-xs text-gray-500 dark:text-gray-400 mb-1", children: "Similarity Threshold" }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
            "input",
            {
              type: "range",
              min: "0.3",
              max: "0.9",
              step: "0.1",
              value: clusteringOptions.maxDistance,
              onChange: (e) => setClusteringOptions((prev) => ({
                ...prev,
                maxDistance: parseFloat(e.target.value)
              })),
              className: "w-full"
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "text-xs text-gray-500", children: clusteringOptions.maxDistance })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "col-span-2", children: /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("label", { className: "flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300", children: [
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
            "input",
            {
              type: "checkbox",
              checked: clusteringOptions.useTemporalClustering,
              onChange: (e) => setClusteringOptions((prev) => ({
                ...prev,
                useTemporalClustering: e.target.checked
              })),
              className: "rounded"
            }
          ),
          "Use temporal clustering"
        ] }) })
      ] })
    ] }),
    isExpanded && /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "p-3", children: [
      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "grid grid-cols-3 gap-4 mb-4 text-sm", children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "text-center", children: [
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "font-medium text-purple-600 dark:text-purple-400", children: clusters.length }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: "Clusters" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "text-center", children: [
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "font-medium text-orange-600 dark:text-orange-400", children: analysisStats.highSeverityAnomalies }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: "High Risk" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "text-center", children: [
          /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "font-medium text-gray-600 dark:text-gray-400", children: [
            analysisStats.clusteringRate.toFixed(0),
            "%"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: "Clustered" })
        ] })
      ] }),
      clusters.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "mb-4", children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "text-sm font-medium text-gray-900 dark:text-gray-100 mb-2", children: "Detected Clusters" }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "space-y-2 max-h-48 overflow-y-auto", children: clusters.map((cluster) => /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)(
          "div",
          {
            className: `p-2 border rounded-md cursor-pointer transition-colors ${selectedCluster?.id === cluster.id ? "border-purple-300 bg-purple-50 dark:border-purple-600 dark:bg-purple-900/20" : "border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500"}`,
            onClick: () => handleClusterSelect(cluster),
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                    "div",
                    {
                      className: "w-3 h-3 rounded-full",
                      style: { backgroundColor: CLUSTER_COLORS[cluster.type] }
                    }
                  ),
                  /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: cluster.type.toUpperCase() }),
                  /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("span", { className: "text-xs text-gray-500 dark:text-gray-400", children: [
                    cluster.nodes.length,
                    " nodes"
                  ] })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                    "div",
                    {
                      className: "w-2 h-2 rounded-full",
                      style: { backgroundColor: RISK_COLORS2[cluster.riskLevel] },
                      title: `${cluster.riskLevel} risk`
                    }
                  ),
                  /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                    "button",
                    {
                      onClick: (e) => {
                        e.stopPropagation();
                        handleClusterToggle(cluster.id);
                      },
                      className: "p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
                      children: highlightedClusters.has(cluster.id) ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_lucide_react7.EyeOff, { className: "w-3 h-3" }) : /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_lucide_react7.Eye, { className: "w-3 h-3" })
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "mt-1 text-xs text-gray-600 dark:text-gray-400", children: [
                "Confidence: ",
                (cluster.confidence * 100).toFixed(0),
                "% \u2022 Value: $",
                cluster.totalValue.toLocaleString()
              ] })
            ]
          },
          cluster.id
        )) })
      ] }),
      anomalies.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "text-sm font-medium text-gray-900 dark:text-gray-100 mb-2", children: "Detected Anomalies" }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "space-y-2 max-h-48 overflow-y-auto", children: anomalies.map((anomaly, index) => /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
          "div",
          {
            className: "p-2 border border-gray-200 rounded-md hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500 cursor-pointer",
            onClick: () => handleAnomalyHighlight(anomaly.addresses),
            children: /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "flex items-start justify-between", children: [
              /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
                  import_lucide_react7.AlertTriangle,
                  {
                    className: `w-4 h-4 ${anomaly.severity === "high" ? "text-red-500" : anomaly.severity === "medium" ? "text-yellow-500" : "text-gray-500"}`
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "flex-1", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: anomaly.type.replace("_", " ").toUpperCase() }),
                  /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "text-xs text-gray-600 dark:text-gray-400 mt-0.5", children: anomaly.description })
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: [
                anomaly.addresses.length,
                " addr"
              ] })
            ] })
          },
          index
        )) })
      ] }),
      clusters.length === 0 && anomalies.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "text-center py-6 text-gray-500 dark:text-gray-400", children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(import_lucide_react7.Brain, { className: "w-8 h-8 mx-auto mb-2 opacity-50" }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "text-sm", children: "No clusters or anomalies detected" }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "text-xs", children: "Try adjusting clustering settings" })
      ] }),
      selectedCluster && /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "mt-4 p-3 bg-purple-50 border border-purple-200 rounded-md dark:bg-purple-900/20 dark:border-purple-800", children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "text-sm font-medium text-purple-900 dark:text-purple-100 mb-2", children: [
          "Cluster Details: ",
          selectedCluster.type.toUpperCase()
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "text-xs text-purple-700 dark:text-purple-300 space-y-1", children: [
          /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { children: [
            "Centroid: ",
            selectedCluster.centroid.slice(0, 8),
            "...",
            selectedCluster.centroid.slice(-6)
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { children: [
            "Risk Level: ",
            selectedCluster.riskLevel
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { children: [
            "Total Value: $",
            selectedCluster.totalValue.toLocaleString()
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { children: [
            "Confidence: ",
            (selectedCluster.confidence * 100).toFixed(1),
            "%"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { children: [
            "Nodes: ",
            selectedCluster.nodes.length
          ] })
        ] })
      ] })
    ] })
  ] });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ClusterAnalysis,
  ExportToolbar,
  FilterPanel,
  GraphControlPanel,
  GraphExplorer,
  GraphExplorerSigma,
  RealTimeManager,
  SearchBar,
  detectAnomalies,
  detectClusters,
  exportAsCSV,
  exportAsJSON,
  exportAsPDF,
  exportAsPNG,
  exportAsSVG,
  useWebSocket
});
//# sourceMappingURL=index.js.map