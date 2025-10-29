import { useState, useCallback, useRef } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface Node {
  id: string;
  x: number;
  y: number;
}

interface Edge {
  from: string;
  to: string;
  weight: number;
  isInMST?: boolean;
  isConsidering?: boolean;
  isRejected?: boolean;
}

const Kruskals = () => {
  const [nodes] = useState<Node[]>([
    { id: "A", x: 100, y: 100 },
    { id: "B", x: 250, y: 80 },
    { id: "C", x: 400, y: 100 },
    { id: "D", x: 150, y: 250 },
    { id: "E", x: 350, y: 250 }
  ]);

  const [edges, setEdges] = useState<Edge[]>([
    { from: "A", to: "B", weight: 2 },
    { from: "B", to: "D", weight: 1 },
    { from: "C", to: "E", weight: 2 },
    { from: "B", to: "C", weight: 3 },
    { from: "A", to: "D", weight: 4 },
    { from: "B", to: "E", weight: 5 },
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
      isConsidering: false,
      isRejected: false
    })));
    setIsAnimating(false);
    setCurrentStep("");
    setTotalWeight(0);
  }, []);

  // Union-Find (Disjoint Set Union) implementation
  class UnionFind {
    private parent: Map<string, string>;
    private rank: Map<string, number>;

    constructor(nodes: Node[]) {
      this.parent = new Map();
      this.rank = new Map();
      nodes.forEach(node => {
        this.parent.set(node.id, node.id);
        this.rank.set(node.id, 0);
      });
    }

    find(x: string): string {
      if (this.parent.get(x) !== x) {
        this.parent.set(x, this.find(this.parent.get(x)!));
      }
      return this.parent.get(x)!;
    }

    union(x: string, y: string): boolean {
      const rootX = this.find(x);
      const rootY = this.find(y);

      if (rootX === rootY) return false;

      const rankX = this.rank.get(rootX)!;
      const rankY = this.rank.get(rootY)!;

      if (rankX < rankY) {
        this.parent.set(rootX, rootY);
      } else if (rankX > rankY) {
        this.parent.set(rootY, rootX);
      } else {
        this.parent.set(rootY, rootX);
        this.rank.set(rootX, rankX + 1);
      }

      return true;
    }
  }

  const runKruskalsAlgorithm = useCallback(async () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    resetAnimation();
    setCurrentStep("Sorting edges by weight");
    
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Sort edges by weight
    const sortedEdges = [...edges].sort((a, b) => a.weight - b.weight);
    const uf = new UnionFind(nodes);
    let weight = 0;
    let edgesAdded = 0;

    for (const edge of sortedEdges) {
      // Highlight considering edge
      setCurrentStep(`Considering edge ${edge.from}-${edge.to} with weight ${edge.weight}`);
      setEdges(prev => prev.map(e => ({
        ...e,
        isConsidering: e.from === edge.from && e.to === edge.to && e.weight === edge.weight
      })));

      await new Promise(resolve => setTimeout(resolve, 1500));

      // Check if adding this edge creates a cycle
      if (uf.union(edge.from, edge.to)) {
        // Edge added to MST
        edgesAdded++;
        weight += edge.weight;
        setCurrentStep(`Added edge ${edge.from}-${edge.to} to MST (no cycle)`);
        setEdges(prev => prev.map(e => ({
          ...e,
          isInMST: (e.from === edge.from && e.to === edge.to && e.weight === edge.weight) || e.isInMST,
          isConsidering: false
        })));
        setTotalWeight(weight);

        await new Promise(resolve => setTimeout(resolve, 1200));

        // Check if MST is complete
        if (edgesAdded === nodes.length - 1) {
          break;
        }
      } else {
        // Edge rejected (would create cycle)
        setCurrentStep(`Rejected edge ${edge.from}-${edge.to} (creates cycle)`);
        setEdges(prev => prev.map(e => ({
          ...e,
          isRejected: (e.from === edge.from && e.to === edge.to && e.weight === edge.weight) || e.isRejected,
          isConsidering: false
        })));

        await new Promise(resolve => setTimeout(resolve, 1000));
      }
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
              <g key={`${edge.from}-${edge.to}-${edge.weight}-${index}`}>
                <line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  className={`transition-all duration-500 ${
                    edge.isInMST ? 'stroke-success' :
                    edge.isConsidering ? 'stroke-warning' :
                    edge.isRejected ? 'stroke-destructive' :
                    'stroke-muted-foreground'
                  }`}
                  strokeWidth={edge.isInMST ? "4" : edge.isConsidering ? "3" : "2"}
                  strokeOpacity={edge.isRejected ? "0.3" : "1"}
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
                    edge.isRejected ? 'fill-destructive' :
                    'fill-muted'
                  }`}
                  stroke="hsl(var(--border))"
                  strokeWidth="2"
                  fillOpacity={edge.isRejected ? "0.3" : "1"}
                />
                <text
                  x={midX}
                  y={midY}
                  textAnchor="middle"
                  dy=".3em"
                  className={`text-xs font-bold ${
                    edge.isInMST || edge.isConsidering ? 'fill-current' : 'fill-muted-foreground'
                  }`}
                  opacity={edge.isRejected ? "0.5" : "1"}
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
      title="Kruskal's Algorithm" 
      subtitle="Find minimum spanning tree by sorting edges and using Union-Find"
    >
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Visualization Area */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Kruskal's MST Visualization</CardTitle>
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
                    <li>Sort all edges by weight in ascending order</li>
                    <li>Pick the smallest edge that doesn't form a cycle</li>
                    <li>Use Union-Find to detect cycles efficiently</li>
                    <li>Repeat until we have V-1 edges (V = number of vertices)</li>
                  </ol>
                </div>
                <div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <pre className="text-muted-foreground">
{`function kruskal(graph) {
  // Sort edges by weight
  const edges = graph.edges.sort((a, b) => 
    a.weight - b.weight
  );
  
  const mst = [];
  const uf = new UnionFind(graph.nodes);
  
  for (let edge of edges) {
    // Check if adding edge creates cycle
    if (uf.union(edge.from, edge.to)) {
      mst.push(edge);
      
      // Stop when MST is complete
      if (mst.length === graph.nodes.length - 1) {
        break;
      }
    }
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
                  onClick={runKruskalsAlgorithm}
                  disabled={isAnimating}
                  className="w-full"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Run Kruskal's Algorithm
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
                    <code className="bg-muted px-2 py-1 rounded">O(E log E)</code> dominated by sorting
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-foreground mb-1">Space Complexity</h4>
                  <p className="text-sm text-muted-foreground">
                    <code className="bg-muted px-2 py-1 rounded">O(V)</code> for Union-Find structure
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-foreground mb-1">Key Features</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Greedy algorithm</li>
                    <li>Processes edges globally</li>
                    <li>Better for sparse graphs</li>
                    <li>Uses Union-Find for cycle detection</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-foreground mb-1">Legend</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-success rounded"></div>
                      <span className="text-muted-foreground">In MST</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-warning rounded"></div>
                      <span className="text-muted-foreground">Considering</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-destructive rounded opacity-30"></div>
                      <span className="text-muted-foreground">Rejected (cycle)</span>
                    </div>
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

export default Kruskals;
