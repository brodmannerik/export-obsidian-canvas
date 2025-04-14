import { useState, useRef, useEffect, useCallback } from "react";
import "./App.css";

interface CanvasNode {
  id: string;
  type: string;
  text?: string;
  file?: string;
  subpath?: string;
  width: number;
  height: number;
  x: number;
  y: number;
  color?: string;
  fontSize?: number;
  url?: string;
}

interface CanvasEdge {
  id: string;
  fromNode: string;
  fromSide: string;
  toNode: string;
  toSide: string;
}

interface CanvasData {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}

// Capability to load and parse .canvas files
const loadCanvasFile = async (file: File): Promise<CanvasData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        resolve(data);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
};

function App() {
  const [canvasData, setCanvasData] = useState<CanvasData | null>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nodeCount, setNodeCount] = useState(0);
  const [edgeCount, setEdgeCount] = useState(0);
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file uploads
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const data = await loadCanvasFile(file);
      setCanvasData(data);
      setNodeCount(data.nodes.length);
      setEdgeCount(data.edges.length);
      setTimeout(() => centerCanvas(data), 100); // Give it time to render
    } catch (err) {
      console.error("Error loading canvas file:", err);
      setError("Failed to load canvas file. Is it a valid .canvas file?");
    } finally {
      setLoading(false);
    }
  };

  // Use hardcoded sample data on initial load
  useEffect(() => {
    const providedCanvasData = {
      nodes: [
        {
          id: "e2f1e32e546c715f",
          type: "text",
          text: "[[Peoples Temple 1978]]",
          x: -393,
          y: -247,
          width: 213,
          height: 60,
        },
        {
          id: "e8b80945de9474eb",
          type: "file",
          file: "5. Attachements/Pasted image 20250407160200.png",
          x: -745,
          y: 40,
          width: 352,
          height: 400,
        },
        {
          id: "68f41869c63b45d5",
          type: "file",
          file: "5. Attachements/Pasted image 20250407163350.png",
          x: -340,
          y: 40,
          width: 260,
          height: 400,
        },
        {
          id: "a9dbda03f40635fb",
          type: "file",
          file: "5. Attachements/Pasted image 20250407163420.png",
          x: -40,
          y: 40,
          width: 300,
          height: 400,
        },
        {
          id: "4301990d8a2014a2",
          type: "link",
          url: "https://californiahistoricalsociety.org/blog/how-to-access-peoples-temple-collections-and-information-online/",
          x: -440,
          y: 540,
          width: 400,
          height: 100,
        },
        {
          id: "c4a0c2792a3b2c87",
          type: "text",
          text: "[[Order of the Solar Temple 1994-1997]]",
          x: 33,
          y: -247,
          width: 280,
          height: 60,
        },
        {
          id: "fed1338147a9fa5f",
          type: "file",
          file: "5. Attachements/Pasted image 20250407165001.png",
          x: -20,
          y: -50,
          width: 200,
          height: 50,
        },
        {
          id: "a062f77fab0a5ea0",
          type: "file",
          file: "5. Attachements/Pasted image 20250407165030.png",
          x: 200,
          y: -50,
          width: 200,
          height: 50,
        },
        {
          id: "a869b83790df790f",
          type: "text",
          text: "[[Heaven's Gate (1997)]]",
          x: 600,
          y: -246,
          width: 250,
          height: 60,
        },
        {
          id: "f342c6fe91f54aa4",
          type: "file",
          file: "5. Attachements/Pasted image 20250407164111.png",
          x: 360,
          y: 40,
          width: 400,
          height: 400,
        },
      ],
      edges: [
        {
          id: "ea19b98cdeb1ad80",
          fromNode: "e8b80945de9474eb",
          fromSide: "top",
          toNode: "e2f1e32e546c715f",
          toSide: "bottom",
        },
        {
          id: "58edbc4896c0557a",
          fromNode: "fed1338147a9fa5f",
          fromSide: "top",
          toNode: "c4a0c2792a3b2c87",
          toSide: "bottom",
        },
        {
          id: "05e0155379b9f45e",
          fromNode: "a062f77fab0a5ea0",
          fromSide: "top",
          toNode: "c4a0c2792a3b2c87",
          toSide: "bottom",
        },
        {
          id: "4b820b63c9049981",
          fromNode: "f342c6fe91f54aa4",
          fromSide: "top",
          toNode: "a869b83790df790f",
          toSide: "bottom",
        },
      ],
    };

    setCanvasData(providedCanvasData);
    setNodeCount(providedCanvasData.nodes.length);
    setEdgeCount(providedCanvasData.edges.length);

    // Give the DOM time to render
    setTimeout(() => centerCanvas(providedCanvasData), 100);
  }, []);

  const centerCanvas = (data: CanvasData) => {
    if (!data.nodes.length || !canvasRef.current) return;

    // Find the bounding box of all nodes
    const minX = Math.min(...data.nodes.map((n) => n.x));
    const maxX = Math.max(...data.nodes.map((n) => n.x + n.width));
    const minY = Math.min(...data.nodes.map((n) => n.y));
    const maxY = Math.max(...data.nodes.map((n) => n.y + n.height));

    const canvasWidth = canvasRef.current.clientWidth;
    const canvasHeight = canvasRef.current.clientHeight;

    // Calculate center position
    const centerX = canvasWidth / 2 - (minX + maxX) / 2;
    const centerY = canvasHeight / 2 - (minY + maxY) / 2;

    // Apply the centering position
    setPosition({ x: centerX, y: centerY });

    // Reset scale to ensure everything is visible
    setScale(0.8);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left mouse button
    setDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragging) return;

      setPosition((prev) => ({
        x: prev.x + (e.clientX - dragStart.x),
        y: prev.y + (e.clientY - dragStart.y),
      }));
      setDragStart({ x: e.clientX, y: e.clientY });
    },
    [dragging, dragStart]
  );

  const handleMouseUp = useCallback(() => {
    setDragging(false);
  }, []);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();

    // Get the dimensions of the viewport
    const viewportWidth = canvasRef.current?.clientWidth || 0;
    const viewportHeight = canvasRef.current?.clientHeight || 0;

    // Calculate the position of the viewport center in the scaled coordinate system
    const viewportCenterX = (viewportWidth / 2 - position.x) / scale;
    const viewportCenterY = (viewportHeight / 2 - position.y) / scale;

    // Calculate scale change
    const delta = -e.deltaY * 0.001;
    const newScale = Math.min(Math.max(scale + delta, 0.1), 5);
    const scaleFactor = newScale / scale;

    // Adjust position to keep the center point stable
    const newPosition = {
      x: position.x - viewportCenterX * (scaleFactor - 1) * scale,
      y: position.y - viewportCenterY * (scaleFactor - 1) * scale,
    };

    setPosition(newPosition);
    setScale(newScale);
  };

  useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, handleMouseMove, handleMouseUp]);

  const getNodeColor = (node: CanvasNode) => {
    if (node.color) return node.color;

    // Default colors based on node type (inspired by Obsidian)
    switch (node.type) {
      case "text":
        return darkMode ? "#2D3748" : "#EDF2F7";
      case "file":
        return darkMode ? "#293845" : "#E6F0F6";
      case "link":
        return darkMode ? "#2C3A47" : "#EBF4FF";
      default:
        return darkMode ? "#2D3748" : "#F7FAFC";
    }
  };

  const renderNode = (node: CanvasNode) => {
    const style = {
      position: "absolute" as const,
      left: `${node.x}px`,
      top: `${node.y}px`,
      width: `${node.width}px`,
      height: `${node.height}px`,
      backgroundColor: getNodeColor(node),
      border: `1px solid ${
        darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"
      }`,
      borderRadius: "3px",
      padding: "8px 12px",
      boxShadow: darkMode
        ? "0 2px 5px rgba(0, 0, 0, 0.4)"
        : "0 2px 5px rgba(0, 0, 0, 0.1)",
      overflow: "auto",
      color: darkMode ? "#E2E8F0" : "#1A202C",
      fontSize: node.fontSize ? `${node.fontSize}px` : "14px",
    };

    return (
      <div
        key={node.id}
        style={style}
        className={`canvas-node canvas-node-${node.type}`}
        title={`Node ID: ${node.id}`}
      >
        {node.type === "text" && (
          <div
            className="node-content text-content"
            dangerouslySetInnerHTML={{
              __html: formatObsidianLinks(node.text || ""),
            }}
          />
        )}
        {node.type === "file" && (
          <div className="node-content file-content">
            <div className="file-header">
              <svg
                className="file-icon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M14 3V7C14 7.26522 14.1054 7.51957 14.2929 7.70711C14.4804 7.89464 14.7348 8 15 8H19"
                  stroke={darkMode ? "#E2E8F0" : "#4A5568"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M17 21H7C6.46957 21 5.96086 20.7893 5.58579 20.4142C5.21071 20.0391 5 19.5304 5 19V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H14L19 8V19C19 19.5304 18.7893 20.0391 18.4142 20.4142C18.0391 20.7893 17.5304 21 17 21Z"
                  stroke={darkMode ? "#E2E8F0" : "#4A5568"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <strong>{node.file}</strong>
            </div>
            {node.subpath && (
              <div className="file-subpath">Subpath: {node.subpath}</div>
            )}
            <div className="file-placeholder">
              {/* @ts-ignore */}
              {node.file.endsWith(".png") && (
                <div className="image-placeholder">
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z"
                      stroke={darkMode ? "#E2E8F0" : "#4A5568"}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8.5 10C9.32843 10 10 9.32843 10 8.5C10 7.67157 9.32843 7 8.5 7C7.67157 7 7 7.67157 7 8.5C7 9.32843 7.67157 10 8.5 10Z"
                      stroke={darkMode ? "#E2E8F0" : "#4A5568"}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M21 15L16 10L5 21"
                      stroke={darkMode ? "#E2E8F0" : "#4A5568"}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {/* @ts-ignore */}
                  <span>Image: {node.file.split("/").pop()}</span>
                </div>
              )}
            </div>
          </div>
        )}
        {node.type === "link" && (
          <div className="node-content link-content">
            <div className="link-header">
              <svg
                className="link-icon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 13C10.4295 13.5741 10.9774 14.0492 11.6066 14.3929C12.2357 14.7367 12.9315 14.9411 13.6467 14.9923C14.362 15.0435 15.0796 14.9404 15.7513 14.6908C16.4231 14.4412 17.0318 14.0513 17.54 13.55L20.54 10.55C21.4508 9.59699 21.9548 8.33397 21.9434 7.02299C21.932 5.71201 21.4061 4.45794 20.4791 3.5309C19.5521 2.60386 18.298 2.07802 16.987 2.06663C15.676 2.05523 14.413 2.55921 13.46 3.47L11.75 5.18"
                  stroke={darkMode ? "#E2E8F0" : "#4A5568"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M14 11C13.5705 10.4259 13.0226 9.95083 12.3934 9.60707C11.7642 9.26331 11.0685 9.05889 10.3533 9.00768C9.63799 8.95646 8.92039 9.05961 8.24866 9.30921C7.57694 9.5588 6.96824 9.94872 6.46 10.45L3.46 13.45C2.54918 14.403 2.04519 15.666 2.05659 16.977C2.06798 18.288 2.59382 19.5421 3.52086 20.4691C4.44791 21.3961 5.70197 21.922 7.01295 21.9334C8.32393 21.9448 9.58695 21.4408 10.54 20.53L12.24 18.83"
                  stroke={darkMode ? "#E2E8F0" : "#4A5568"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="link-title">External Link</span>
            </div>
            <a
              href={node.url}
              target="_blank"
              rel="noopener noreferrer"
              className="link-url"
            >
              {node.url}
            </a>
          </div>
        )}
      </div>
    );
  };

  // Format Obsidian wiki links to look like links
  const formatObsidianLinks = (text: string) => {
    return text.replace(/\[\[(.*?)\]\]/g, '<span class="wiki-link">$1</span>');
  };

  const renderEdge = (edge: CanvasEdge) => {
    if (!canvasData) return null;

    const fromNode = canvasData.nodes.find((n) => n.id === edge.fromNode);
    const toNode = canvasData.nodes.find((n) => n.id === edge.toNode);

    if (!fromNode || !toNode) {
      return null; // Skip edges that reference missing nodes
    }

    // Calculate start and end points based on the side
    const getPoint = (node: CanvasNode, side: string) => {
      switch (side) {
        case "top":
          return { x: node.x + node.width / 2, y: node.y };
        case "right":
          return { x: node.x + node.width, y: node.y + node.height / 2 };
        case "bottom":
          return { x: node.x + node.width / 2, y: node.y + node.height };
        case "left":
          return { x: node.x, y: node.y + node.height / 2 };
        default:
          return { x: node.x + node.width / 2, y: node.y + node.height / 2 };
      }
    };

    const start = getPoint(fromNode, edge.fromSide);
    const end = getPoint(toNode, edge.toSide);

    // Calculate the direction for the arrow
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const normX = dx / distance;
    const normY = dy / distance;

    // Arrow size
    const arrowSize = 8;

    // Move the end point back slightly to make space for the arrow
    const endPointOffset = 5;
    const adjustedEndX = end.x - normX * endPointOffset;
    const adjustedEndY = end.y - normY * endPointOffset;

    // Calculate arrow points
    const arrowX1 = adjustedEndX - arrowSize * (normX + normY / 2);
    const arrowY1 = adjustedEndY - arrowSize * (normY - normX / 2);
    const arrowX2 = adjustedEndX - arrowSize * (normX - normY / 2);
    const arrowY2 = adjustedEndY - arrowSize * (normY + normX / 2);

    return (
      <svg
        key={edge.id}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          overflow: "visible",
        }}
      >
        <defs>
          <marker
            id={`arrowhead-${edge.id}`}
            markerWidth="10"
            markerHeight="7"
            refX="0"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill={
                darkMode ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)"
              }
            />
          </marker>
        </defs>
        <line
          x1={start.x}
          y1={start.y}
          x2={adjustedEndX}
          y2={adjustedEndY}
          stroke={darkMode ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)"}
          strokeWidth="2"
          markerEnd={`url(#arrowhead-${edge.id})`}
        />
        <polygon
          points={`${adjustedEndX},${adjustedEndY} ${arrowX1},${arrowY1} ${arrowX2},${arrowY2}`}
          fill={darkMode ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)"}
        />
      </svg>
    );
  };

  return (
    <div className={`app-container ${darkMode ? "dark-mode" : "light-mode"}`}>
      <div className="toolbar">
        <div className="zoom-controls">
          <button
            onClick={() => setScale((s: number) => Math.max(s - 0.1, 0.1))}
            className="zoom-button"
          >
            -
          </button>
          <span className="zoom-level">{Math.round(scale * 100)}%</span>
          <button
            onClick={() => setScale((s: number) => Math.min(s + 0.1, 5))}
            className="zoom-button"
          >
            +
          </button>
        </div>
        <div className="canvas-stats">
          {nodeCount} nodes, {edgeCount} edges
        </div>
        <div className="toolbar-actions">
          <input
            type="file"
            accept=".canvas"
            ref={fileInputRef}
            onChange={handleFileUpload}
            style={{ display: "none" }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="action-button"
          >
            Open Canvas File
          </button>
          <button
            onClick={() => canvasData && centerCanvas(canvasData)}
            className="action-button"
          >
            Center Canvas
          </button>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="theme-toggle"
          >
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
      </div>

      {loading && <div className="loading-overlay">Loading canvas...</div>}

      {error && <div className="error-message">{error}</div>}

      <div
        ref={canvasRef}
        className="canvas-viewer"
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
        style={{
          cursor: dragging ? "grabbing" : "grab",
        }}
      >
        <div className="canvas-grid"></div>
        <div
          className="canvas-content"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: "0 0",
          }}
        >
          {canvasData?.edges.map(renderEdge)}
          {canvasData?.nodes.map(renderNode)}
        </div>
      </div>
    </div>
  );
}

export default App;
