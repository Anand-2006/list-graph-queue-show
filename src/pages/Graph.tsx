import { useState, useCallback, useRef, useEffect } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  Link, 
  Play, 
  RotateCcw,
  Zap,
  Target
} from "lucide-react";
import { toast } from "sonner";

interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
  isVisited?: boolean;
  isHighlighted?: boolean;
  isTarget?: boolean;
  distance?: number;
}

interface GraphEdge {
  id: string;
  from: string;
  to: string;
  isHighlighted?: boolean;
}

const Graph = () => {
  const [nodes, setNodes] = useState<GraphNode[]>([
    { id: "A", label: "A", x: 100, y: 100 },
    { id: "B", label: "B", x: 300, y: 100 },
    { id: "C", label: "C", x: 200, y: 250 },
    { id: "D", label: "D", x: 400, y: 250 }
  ]);
  const [edges, setEdges] = useState<GraphEdge[]>([
    { id: "AB", from: "A", to: "B" },
    { id: "AC", from: "A", to: "C" },
    { id: "BC", from: "B", to: "C" },
    { id: "CD", from: "C", to: "D" }
  ]);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [startNode, setStartNode] = useState<string>("A");
  const [isAnimating, setIsAnimating] = useState(false);
  const [operation, setOperation] = useState<string | null>(null);
  const [newNodeLabel, setNewNodeLabel] = useState("");
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  const resetAnimation = useCallback(() => {
    setNodes(nodes => nodes.map(node => ({ 
      ...node, 
      isVisited: false,
      isHighlighted: false, 
      isTarget: false,
      distance: undefined
    })));
    setEdges(edges => edges.map(edge => ({ 
      ...edge, 
      isHighlighted: false 
    })));
    setIsAnimating(false);
    setOperation(null);
  }, []);

  const addNode = useCallback(() => {
    if (!newNodeLabel.trim() || nodes.find(n => n.id === newNodeLabel.toUpperCase())) {
      toast.error("Please enter a unique node label");
      return;
    }

    const newNode: GraphNode = {
      id: newNodeLabel.toUpperCase(),
      label: newNodeLabel.toUpperCase(),
      x: Math.random() * 400 + 50,
      y: Math.random() * 300 + 50
    };

    setNodes(prev => [...prev, newNode]);
    setNewNodeLabel("");
    toast.success(`Added node ${newNode.id}`);
  }, [newNodeLabel, nodes]);

  const addEdge = useCallback(() => {
    if (selectedNodes.length !== 2) {
      toast.error("Please select exactly 2 nodes to connect");
      return;
    }

    const [from, to] = selectedNodes;
    const edgeId = `${from}${to}`;
    
    if (edges.find(e => 
      (e.from === from && e.to === to) || 
      (e.from === to && e.to === from)
    )) {
      toast.error("Edge already exists between these nodes");
      return;
    }

    const newEdge: GraphEdge = {
      id: edgeId,
      from,
      to
    };

    setEdges(prev => [...prev, newEdge]);
    setSelectedNodes([]);
    toast.success(`Added edge between ${from} and ${to}`);
  }, [selectedNodes, edges]);

  const bfs = useCallback(async (startNodeId: string) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setOperation(`Running BFS from node ${startNodeId}`);
    resetAnimation();

    const queue = [startNodeId];
    const visited = new Set<string>();
    const visitOrder: string[] = [];

    while (queue.length > 0) {
      const current = queue.shift()!;
      
      if (visited.has(current)) continue;
      
      visited.add(current);
      visitOrder.push(current);

      // Highlight current node
      setNodes(prev => prev.map(node => ({
        ...node,
        isHighlighted: node.id === current,
        isVisited: visited.has(node.id) && node.id !== current
      })));

      await new Promise(resolve => setTimeout(resolve, 1000));

      // Find neighbors
      const neighbors = edges
        .filter(edge => edge.from === current || edge.to === current)
        .map(edge => edge.from === current ? edge.to : edge.from)
        .filter(neighbor => !visited.has(neighbor));

      // Highlight edges to neighbors
      setEdges(prev => prev.map(edge => ({
        ...edge,
        isHighlighted: (edge.from === current || edge.to === current) && 
                      (neighbors.includes(edge.from) || neighbors.includes(edge.to))
      })));

      // Add neighbors to queue
      neighbors.forEach(neighbor => {
        if (!queue.includes(neighbor)) {
          queue.push(neighbor);
        }
      });

      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Final state - show all visited nodes
    setNodes(prev => prev.map(node => ({
      ...node,
      isHighlighted: false,
      isVisited: visited.has(node.id)
    })));
    setEdges(prev => prev.map(edge => ({ ...edge, isHighlighted: false })));

    toast.success(`BFS completed! Visit order: ${visitOrder.join(' → ')}`);
    
    setTimeout(() => {
      setIsAnimating(false);
      setOperation(null);
    }, 2000);
  }, [isAnimating, edges, resetAnimation]);

  const dfs = useCallback(async (startNodeId: string) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setOperation(`Running DFS from node ${startNodeId}`);
    resetAnimation();

    const visited = new Set<string>();
    const visitOrder: string[] = [];

    const dfsRecursive = async (nodeId: string): Promise<void> => {
      if (visited.has(nodeId)) return;

      visited.add(nodeId);
      visitOrder.push(nodeId);

      // Highlight current node
      setNodes(prev => prev.map(node => ({
        ...node,
        isHighlighted: node.id === nodeId,
        isVisited: visited.has(node.id) && node.id !== nodeId
      })));

      await new Promise(resolve => setTimeout(resolve, 1000));

      // Find neighbors
      const neighbors = edges
        .filter(edge => edge.from === nodeId || edge.to === nodeId)
        .map(edge => edge.from === nodeId ? edge.to : edge.from)
        .filter(neighbor => !visited.has(neighbor));

      // Visit each unvisited neighbor
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          // Highlight edge
          setEdges(prev => prev.map(edge => ({
            ...edge,
            isHighlighted: (edge.from === nodeId && edge.to === neighbor) ||
                          (edge.from === neighbor && edge.to === nodeId)
          })));

          await new Promise(resolve => setTimeout(resolve, 500));
          await dfsRecursive(neighbor);
        }
      }
    };

    await dfsRecursive(startNodeId);

    // Final state
    setNodes(prev => prev.map(node => ({
      ...node,
      isHighlighted: false,
      isVisited: visited.has(node.id)
    })));
    setEdges(prev => prev.map(edge => ({ ...edge, isHighlighted: false })));

    toast.success(`DFS completed! Visit order: ${visitOrder.join(' → ')}`);
    
    setTimeout(() => {
      setIsAnimating(false);
      setOperation(null);
    }, 2000);
  }, [isAnimating, edges, resetAnimation]);

  const handleNodeClick = (nodeId: string) => {
    if (isAnimating || draggedNode) return;
    
    setSelectedNodes(prev => {
      if (prev.includes(nodeId)) {
        return prev.filter(id => id !== nodeId);
      } else if (prev.length < 2) {
        return [...prev, nodeId];
      } else {
        return [nodeId];
      }
    });
  };

  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    if (isAnimating) return;
    
    e.stopPropagation();
    const svg = svgRef.current;
    if (!svg) return;

    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    const svgRect = svg.getBoundingClientRect();
    const svgPoint = svg.createSVGPoint();
    svgPoint.x = e.clientX;
    svgPoint.y = e.clientY;
    const transformed = svgPoint.matrixTransform(svg.getScreenCTM()?.inverse());

    setDraggedNode(nodeId);
    setDragOffset({
      x: transformed.x - node.x,
      y: transformed.y - node.y
    });
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!draggedNode || isAnimating) return;

    const svg = svgRef.current;
    if (!svg) return;

    const svgPoint = svg.createSVGPoint();
    svgPoint.x = e.clientX;
    svgPoint.y = e.clientY;
    const transformed = svgPoint.matrixTransform(svg.getScreenCTM()?.inverse());

    setNodes(prev => prev.map(node => 
      node.id === draggedNode
        ? { 
            ...node, 
            x: Math.max(30, Math.min(470, transformed.x - dragOffset.x)),
            y: Math.max(30, Math.min(320, transformed.y - dragOffset.y))
          }
        : node
    ));
  }, [draggedNode, dragOffset, isAnimating]);

  const handleMouseUp = useCallback(() => {
    setDraggedNode(null);
  }, []);

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setDraggedNode(null);
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  const renderGraph = () => {
    return (
      <div className="bg-muted/30 rounded-xl p-4">
        <svg
          ref={svgRef}
          width="100%"
          height="400"
          viewBox="0 0 500 350"
          className="border border-border rounded-lg bg-card"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          {/* Render Edges */}
          {edges.map(edge => {
            const fromNode = nodes.find(n => n.id === edge.from);
            const toNode = nodes.find(n => n.id === edge.to);
            
            if (!fromNode || !toNode) return null;

            return (
              <line
                key={edge.id}
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                className={`connection-line ${edge.isHighlighted ? 'connection-active' : ''}`}
                strokeWidth={edge.isHighlighted ? "4" : "2"}
              />
            );
          })}

          {/* Render Nodes */}
          {nodes.map(node => (
            <g key={node.id}>
              <circle
                cx={node.x}
                cy={node.y}
                r="25"
                className={`cursor-move transition-all duration-300 ${
                  node.isHighlighted ? 'fill-current text-current stroke-2' :
                  node.isVisited ? 'fill-success stroke-success' :
                  selectedNodes.includes(node.id) ? 'fill-warning stroke-warning' :
                  draggedNode === node.id ? 'fill-primary stroke-primary' :
                  'fill-graph stroke-graph'
                } ${
                  node.isHighlighted ? 'stroke-current' :
                  node.isVisited ? 'stroke-success' :
                  selectedNodes.includes(node.id) ? 'stroke-warning' :
                  draggedNode === node.id ? 'stroke-primary' :
                  'stroke-graph'
                }`}
                strokeWidth="3"
                onClick={() => handleNodeClick(node.id)}
                onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                style={{
                  filter: node.isHighlighted ? 'drop-shadow(0 0 10px currentColor)' : 'none',
                  transform: node.isHighlighted ? 'scale(1.1)' : 'scale(1)',
                  transformOrigin: `${node.x}px ${node.y}px`,
                  cursor: draggedNode === node.id ? 'grabbing' : 'grab'
                }}
              />
              <text
                x={node.x}
                y={node.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="font-bold text-sm fill-white pointer-events-none"
              >
                {node.label}
              </text>
            </g>
          ))}
        </svg>

        {/* Legend */}
        <div className="flex items-center justify-center space-x-6 mt-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-graph"></div>
            <span className="text-muted-foreground">Unvisited</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-current animate-pulse-soft"></div>
            <span className="text-muted-foreground">Current</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-success"></div>
            <span className="text-muted-foreground">Visited</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-warning"></div>
            <span className="text-muted-foreground">Selected</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout 
      title="Graph Visualizer" 
      subtitle="Interactive graph visualization with BFS and DFS traversal algorithms"
    >
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Visualization Area */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-graph rounded-full"></div>
                    <span>Graph Visualization</span>
                  </CardTitle>
                  {operation && (
                    <Badge variant="outline" className="animate-pulse-soft">
                      {operation}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {renderGraph()}
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  Drag nodes to reposition • Click to select for edge creation
                </p>
              </CardContent>
            </Card>

            {/* Code Display */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Algorithm Implementation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <pre className="text-muted-foreground">
{`// Breadth-First Search (BFS) - O(V + E)
function bfs(graph, start) {
  const visited = new Set();
  const queue = [start];
  const result = [];
  
  while (queue.length > 0) {
    const node = queue.shift();
    if (!visited.has(node)) {
      visited.add(node);
      result.push(node);
      
      // Add unvisited neighbors to queue
      graph[node].forEach(neighbor => {
        if (!visited.has(neighbor)) {
          queue.push(neighbor);
        }
      });
    }
  }
  return result;
}

// Depth-First Search (DFS) - O(V + E)
function dfs(graph, start, visited = new Set()) {
  visited.add(start);
  const result = [start];
  
  graph[start].forEach(neighbor => {
    if (!visited.has(neighbor)) {
      result.push(...dfs(graph, neighbor, visited));
    }
  });
  
  return result;
}`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Control Panel */}
          <div className="space-y-6">
            <Card className="control-panel">
              <CardHeader>
                <CardTitle className="text-lg">Graph Operations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Node */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Add Node</label>
                  <div className="flex space-x-2">
                    <Input
                      type="text"
                      placeholder="Node label"
                      value={newNodeLabel}
                      onChange={(e) => setNewNodeLabel(e.target.value)}
                      disabled={isAnimating}
                      maxLength={1}
                    />
                    <Button
                      onClick={addNode}
                      disabled={isAnimating || !newNodeLabel.trim()}
                      className="bg-graph hover:bg-graph/90 text-graph-foreground"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Add Edge */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Add Edge</label>
                  <div className="text-sm text-muted-foreground mb-2">
                    Selected: {selectedNodes.join(", ") || "None"}
                  </div>
                  <Button
                    onClick={addEdge}
                    disabled={isAnimating || selectedNodes.length !== 2}
                    variant="outline"
                    className="w-full"
                  >
                    <Link className="h-4 w-4 mr-2" />
                    Connect Selected Nodes
                  </Button>
                </div>

                <Separator />

                {/* Traversal Algorithms */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Start Node</label>
                  <Select value={startNode} onValueChange={setStartNode} disabled={isAnimating}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select start node" />
                    </SelectTrigger>
                    <SelectContent>
                      {nodes.map(node => (
                        <SelectItem key={node.id} value={node.id}>
                          Node {node.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <Button
                    onClick={() => bfs(startNode)}
                    disabled={isAnimating || nodes.length === 0}
                    variant="outline"
                    className="justify-start"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    BFS (Breadth-First)
                  </Button>
                  <Button
                    onClick={() => dfs(startNode)}
                    disabled={isAnimating || nodes.length === 0}
                    variant="outline"
                    className="justify-start"
                  >
                    <Target className="h-4 w-4 mr-2" />
                    DFS (Depth-First)
                  </Button>
                </div>

                <Separator />

                {/* Controls */}
                <div className="flex space-x-2">
                  <Button
                    onClick={resetAnimation}
                    disabled={isAnimating}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Information Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Algorithm Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-semibold text-sm text-foreground mb-1">Time Complexity</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>BFS: <code className="bg-muted px-1 rounded">O(V + E)</code></p>
                    <p>DFS: <code className="bg-muted px-1 rounded">O(V + E)</code></p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-foreground mb-1">Space Complexity</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>BFS: <code className="bg-muted px-1 rounded">O(V)</code> (queue)</p>
                    <p>DFS: <code className="bg-muted px-1 rounded">O(V)</code> (recursion stack)</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-foreground mb-1">Graph Stats</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Nodes: {nodes.length}</p>
                    <p>Edges: {edges.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Graph;