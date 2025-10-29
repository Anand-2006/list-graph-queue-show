import { useState, useCallback, useRef } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, RotateCcw, Pause } from "lucide-react";
import { toast } from "sonner";

interface Node {
  id: string;
  x: number;
  y: number;
  isInMST?: boolean;
  isVisiting?: boolean;
}

interface Edge {
  from: string;
  to: string;
  weight: number;
  isInMST?: boolean;
  isConsidering?: boolean;
}

const Prims = () => {
  const [nodes] = useState<Node[]>([
    { id: "A", x: 100, y: 100 },
    { id: "B", x: 250, y: 80 },
    { id: "C", x: 400, y: 100 },
    { id: "D", x: 150, y: 250 },
    { id: "E", x: 350, y: 250 }
  ]);

  const [edges, setEdges] = useState<Edge[]>([
    { from: "A", to: "B", weight: 2 },
    { from: "A", to: "D", weight: 4 },
    { from: "B", to: "C", weight: 3 },
    { from: "B", to: "D", weight: 1 },
    { from: "B", to: "E", weight: 5 },
    { from: "C", to: "E", weight: 2 },
    { from: "D", to: "E", weight: 6 }
  ]);

  const [isAnimating, setIsAnimating] = useState(false);
  const [currentStep, setCurrentStep] = useState("");
  const [totalWeight, setTotalWeight] = useState(0);
  const svgRef = useRef<SVGSVGElement>(null);

  const resetAnimation = useCallback(() => {
    setEdges(edges => edges.map(edge => ({ 
      ...edge, 
      isInMST: false,
      isConsidering: false
    })));
    setIsAnimating(false);
    setCurrentStep("");
    setTotalWeight(0);
  }, []);

  const runPrimsAlgorithm = useCallback(async () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    resetAnimation();
    setCurrentStep("Starting from node A");
    
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mstEdges: string[] = [];
    const visited = new Set<string>(["A"]);
    let weight = 0;

    while (visited.size < nodes.length) {
      let minEdge: Edge | null = null;
      let minWeight = Infinity;

      // Find minimum weight edge connecting visited to unvisited nodes
      for (const edge of edges) {
        const fromVisited = visited.has(edge.from);
        const toVisited = visited.has(edge.to);

        if ((fromVisited && !toVisited) || (!fromVisited && toVisited)) {
          if (edge.weight < minWeight) {
            minWeight = edge.weight;
            minEdge = edge;
          }
        }
      }

      if (!minEdge) break;

      // Highlight considering edge
      setCurrentStep(`Considering edge ${minEdge.from}-${minEdge.to} with weight ${minEdge.weight}`);
      setEdges(prev => prev.map(e => ({
        ...e,
        isConsidering: e.from === minEdge!.from && e.to === minEdge!.to
      })));

      await new Promise(resolve => setTimeout(resolve, 1500));

      // Add to MST
      visited.add(minEdge.from);
      visited.add(minEdge.to);
      mstEdges.push(`${minEdge.from}-${minEdge.to}`);
      weight += minEdge.weight;
      
      setCurrentStep(`Added edge ${minEdge.from}-${minEdge.to} to MST`);
      setEdges(prev => prev.map(e => ({
        ...e,
        isInMST: (e.from === minEdge!.from && e.to === minEdge!.to) || e.isInMST,
        isConsidering: false
      })));
      setTotalWeight(weight);

      await new Promise(resolve => setTimeout(resolve, 1200));
    }

    setCurrentStep(`MST Complete! Total weight: ${weight}`);
    toast.success(`Minimum Spanning Tree found with total weight: ${weight}`);
    setIsAnimating(false);
  }, [nodes, edges, isAnimating, resetAnimation]);

  const getNodePosition = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    return node ? { x: node.x, y: node.y } : { x: 0, y: 0 };
  };

  const renderGraph = () => {
    return (
      <div className="bg-muted/30 rounded-xl p-6">
        <svg
          ref={svgRef}
          width="500"
          height="350"
          viewBox="0 0 500 350"
          className="border border-border rounded-lg bg-card"
        >
          {/* Render Edges */}
          {edges.map((edge, index) => {
            const from = getNodePosition(edge.from);
            const to = getNodePosition(edge.to);
            const midX = (from.x + to.x) / 2;
            const midY = (from.y + to.y) / 2;

            return (
              <g key={`${edge.from}-${edge.to}-${index}`}>
                <line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  className={`transition-all duration-500 ${
                    edge.isInMST ? 'stroke-success' :
                    edge.isConsidering ? 'stroke-warning' :
                    'stroke-muted-foreground'
                  }`}
                  strokeWidth={edge.isInMST ? "4" : edge.isConsidering ? "3" : "2"}
                  style={{
                    filter: edge.isInMST ? 'drop-shadow(0 0 8px hsl(var(--success)))' :
                           edge.isConsidering ? 'drop-shadow(0 0 6px hsl(var(--warning)))' : 'none'
                  }}
                />
                {/* Weight label */}
                <circle
                  cx={midX}
                  cy={midY}
                  r="15"
                  className={`transition-all duration-300 ${
                    edge.isInMST ? 'fill-success' :
                    edge.isConsidering ? 'fill-warning' :
                    'fill-muted'
                  }`}
                  stroke="hsl(var(--border))"
                  strokeWidth="2"
                />
                <text
                  x={midX}
                  y={midY}
                  textAnchor="middle"
                  dy=".3em"
                  className={`text-xs font-bold ${
                    edge.isInMST || edge.isConsidering ? 'fill-current' : 'fill-muted-foreground'
                  }`}
                >
                  {edge.weight}
                </text>
              </g>
            );
          })}

          {/* Render Nodes */}
          {nodes.map(node => {
            const connectedEdge = edges.find(e => 
              (e.isInMST || e.isConsidering) && (e.from === node.id || e.to === node.id)
            );

            return (
              <g key={node.id}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="25"
                  className={`transition-all duration-300 ${
                    connectedEdge?.isInMST ? 'fill-success stroke-success' :
                    connectedEdge?.isConsidering ? 'fill-warning stroke-warning' :
                    'fill-graph stroke-graph'
                  }`}
                  strokeWidth="3"
                />
                <text
                  x={node.x}
                  y={node.y}
                  textAnchor="middle"
                  dy=".3em"
                  className="text-lg font-bold fill-current"
                  style={{ color: 'hsl(var(--graph-foreground))' }}
                >
                  {node.id}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  return (
    <Layout 
      title="Prim's Algorithm" 
      subtitle="Find minimum spanning tree starting from a single vertex"
    >
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Visualization Area */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Prim's MST Visualization</CardTitle>
                  {totalWeight > 0 && (
                    <Badge variant="default" className="text-base px-4 py-1">
                      Weight: {totalWeight}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {renderGraph()}
                {currentStep && (
                  <p className="text-sm text-muted-foreground mt-4 text-center font-medium">
                    {currentStep}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Algorithm Explanation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How It Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm text-foreground mb-2">The Algorithm</h4>
                  <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                    <li>Start with any vertex (here we use A)</li>
                    <li>Add the minimum weight edge connecting visited to unvisited nodes</li>
                    <li>Mark the new vertex as visited</li>
                    <li>Repeat until all vertices are included in MST</li>
                  </ol>
                </div>
                <div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <pre className="text-muted-foreground">
{`function prim(graph, start) {
  const mst = [];
  const visited = new Set([start]);
  
  while (visited.size < graph.nodes.length) {
    let minEdge = null;
    let minWeight = Infinity;
    
    // Find minimum edge
    for (let edge of graph.edges) {
      const connected = 
        (visited.has(edge.from) && !visited.has(edge.to)) ||
        (!visited.has(edge.from) && visited.has(edge.to));
      
      if (connected && edge.weight < minWeight) {
        minWeight = edge.weight;
        minEdge = edge;
      }
    }
    
    mst.push(minEdge);
    visited.add(minEdge.from);
    visited.add(minEdge.to);
  }
  
  return mst;
}`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Control Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={runPrimsAlgorithm}
                  disabled={isAnimating}
                  className="w-full"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Run Prim's Algorithm
                </Button>

                <Button
                  onClick={resetAnimation}
                  disabled={isAnimating}
                  variant="outline"
                  className="w-full"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
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
                  <p className="text-sm text-muted-foreground">
                    <code className="bg-muted px-2 py-1 rounded">O(E log V)</code> with binary heap
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-foreground mb-1">Space Complexity</h4>
                  <p className="text-sm text-muted-foreground">
                    <code className="bg-muted px-2 py-1 rounded">O(V)</code> for tracking visited nodes
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-foreground mb-1">Key Features</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Greedy algorithm</li>
                    <li>Grows MST one vertex at a time</li>
                    <li>Works on connected graphs</li>
                    <li>Better for dense graphs</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Prims;
