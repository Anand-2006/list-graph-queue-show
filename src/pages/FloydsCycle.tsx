import { useState, useCallback } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, RotateCcw, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

interface ListNode {
  id: string;
  value: number;
  next: string | null;
  isSlow?: boolean;
  isFast?: boolean;
  isCycle?: boolean;
}

const FloydsCycle = () => {
  const [hasCycle, setHasCycle] = useState(true);
  const [nodes, setNodes] = useState<ListNode[]>([
    { id: "1", value: 1, next: "2" },
    { id: "2", value: 2, next: "3" },
    { id: "3", value: 3, next: "4" },
    { id: "4", value: 4, next: "5" },
    { id: "5", value: 5, next: "3" }
  ]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [cycleDetected, setCycleDetected] = useState<boolean | null>(null);
  const [currentStep, setCurrentStep] = useState("");

  const resetAnimation = useCallback(() => {
    setNodes(nodes => nodes.map(node => ({ 
      ...node, 
      isSlow: false, 
      isFast: false,
      isCycle: false
    })));
    setIsAnimating(false);
    setCycleDetected(null);
    setCurrentStep("");
  }, []);

  const detectCycle = useCallback(async () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    resetAnimation();
    setCurrentStep("Initializing slow and fast pointers at head");
    
    await new Promise(resolve => setTimeout(resolve, 1000));

    let slowIndex = 0;
    let fastIndex = 0;

    while (fastIndex < nodes.length && nodes[fastIndex].next) {
      setCurrentStep(`Moving slow pointer by 1, fast pointer by 2`);
      
      // Move slow pointer by 1
      slowIndex = (slowIndex + 1) % nodes.length;
      
      // Move fast pointer by 2
      const nextFast = nodes[fastIndex].next;
      if (!nextFast) break;
      
      const nextFastIndex = nodes.findIndex(n => n.id === nextFast);
      if (nextFastIndex === -1) break;
      
      fastIndex = nextFastIndex;
      
      const nextNextFast = nodes[fastIndex].next;
      if (!nextNextFast) break;
      
      const nextNextFastIndex = nodes.findIndex(n => n.id === nextNextFast);
      if (nextNextFastIndex === -1) break;
      
      fastIndex = nextNextFastIndex;

      // Highlight current positions
      setNodes(prev => prev.map((node, index) => ({
        ...node,
        isSlow: index === slowIndex,
        isFast: index === fastIndex,
        isCycle: false
      })));

      await new Promise(resolve => setTimeout(resolve, 1200));

      // Check if they meet
      if (slowIndex === fastIndex) {
        setCurrentStep("Pointers met - Cycle detected!");
        setNodes(prev => prev.map((node, index) => ({
          ...node,
          isSlow: false,
          isFast: false,
          isCycle: index === slowIndex
        })));
        setCycleDetected(true);
        toast.success("Cycle detected in the linked list!");
        setIsAnimating(false);
        return;
      }

      if (fastIndex >= nodes.length - 1 || !nodes[fastIndex].next) {
        break;
      }
    }

    setCurrentStep("Fast pointer reached end - No cycle!");
    setCycleDetected(false);
    toast.info("No cycle detected in the linked list");
    setIsAnimating(false);
  }, [nodes, isAnimating, resetAnimation]);

  const toggleCycle = () => {
    if (isAnimating) return;
    
    if (hasCycle) {
      // Remove cycle
      setNodes([
        { id: "1", value: 1, next: "2" },
        { id: "2", value: 2, next: "3" },
        { id: "3", value: 3, next: "4" },
        { id: "4", value: 4, next: "5" },
        { id: "5", value: 5, next: null }
      ]);
      setHasCycle(false);
      toast.info("Cycle removed - list is now linear");
    } else {
      // Add cycle (5 -> 3)
      setNodes([
        { id: "1", value: 1, next: "2" },
        { id: "2", value: 2, next: "3" },
        { id: "3", value: 3, next: "4" },
        { id: "4", value: 4, next: "5" },
        { id: "5", value: 5, next: "3" }
      ]);
      setHasCycle(true);
      toast.info("Cycle added - node 5 now points to node 3");
    }
    resetAnimation();
  };

  const renderLinkedList = () => {
    return (
      <div className="relative p-8 min-h-[300px] bg-muted/30 rounded-xl">
        <svg width="100%" height="300" className="overflow-visible">
          {/* Draw edges */}
          {nodes.map((node, index) => {
            if (!node.next) return null;
            
            const targetIndex = nodes.findIndex(n => n.id === node.next);
            if (targetIndex === -1) return null;

            const startX = 100 + (index % 5) * 120;
            const startY = 100 + Math.floor(index / 5) * 120;
            const endX = 100 + (targetIndex % 5) * 120;
            const endY = 100 + Math.floor(targetIndex / 5) * 120;

            const isCycleEdge = hasCycle && node.id === "5";

            return (
              <g key={`edge-${node.id}`}>
                <path
                  d={isCycleEdge 
                    ? `M ${startX} ${startY} Q ${startX + 60} ${startY + 80} ${endX} ${endY}`
                    : `M ${startX} ${startY} L ${endX} ${endY}`
                  }
                  stroke={isCycleEdge ? "hsl(var(--warning))" : "hsl(var(--muted-foreground))"}
                  strokeWidth="2"
                  fill="none"
                  markerEnd="url(#arrowhead)"
                  strokeDasharray={isCycleEdge ? "5,5" : "none"}
                />
              </g>
            );
          })}

          {/* Arrow marker definition */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 10 3, 0 6" fill="hsl(var(--muted-foreground))" />
            </marker>
          </defs>

          {/* Draw nodes */}
          {nodes.map((node, index) => {
            const x = 100 + (index % 5) * 120;
            const y = 100 + Math.floor(index / 5) * 120;

            return (
              <g key={node.id}>
                <circle
                  cx={x}
                  cy={y}
                  r="30"
                  className={`transition-all duration-300 ${
                    node.isCycle ? 'fill-warning stroke-warning' :
                    node.isSlow ? 'fill-primary stroke-primary' :
                    node.isFast ? 'fill-success stroke-success' :
                    'fill-linked-list stroke-linked-list'
                  }`}
                  strokeWidth="3"
                  style={{
                    filter: node.isSlow || node.isFast || node.isCycle ? 'drop-shadow(0 0 10px currentColor)' : 'none'
                  }}
                />
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dy=".3em"
                  className="text-lg font-bold fill-current"
                  style={{ color: 'hsl(var(--linked-list-foreground))' }}
                >
                  {node.value}
                </text>
                {node.isSlow && (
                  <text x={x} y={y - 45} textAnchor="middle" className="text-xs fill-primary font-semibold">
                    Slow
                  </text>
                )}
                {node.isFast && (
                  <text x={x} y={y - 45} textAnchor="middle" className="text-xs fill-success font-semibold">
                    Fast
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  return (
    <Layout 
      title="Floyd's Cycle Detection Algorithm" 
      subtitle="Detect cycles in linked lists using the tortoise and hare method"
    >
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Visualization Area */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <span>Cycle Detection Visualization</span>
                  </CardTitle>
                  {cycleDetected !== null && (
                    <Badge variant={cycleDetected ? "default" : "secondary"} className="animate-pulse-soft">
                      {cycleDetected ? (
                        <><CheckCircle2 className="h-3 w-3 mr-1" /> Cycle Found</>
                      ) : (
                        <><XCircle className="h-3 w-3 mr-1" /> No Cycle</>
                      )}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {renderLinkedList()}
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
                    <li>Initialize two pointers: slow and fast, both at the head</li>
                    <li>Move slow pointer by 1 step and fast pointer by 2 steps</li>
                    <li>If they meet, a cycle exists in the linked list</li>
                    <li>If fast pointer reaches null, no cycle exists</li>
                  </ol>
                </div>
                <div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <pre className="text-muted-foreground">
{`function hasCycle(head) {
  let slow = head;
  let fast = head;
  
  while (fast && fast.next) {
    slow = slow.next;        // Move 1
    fast = fast.next.next;   // Move 2
    
    if (slow === fast) {
      return true;  // Cycle detected
    }
  }
  
  return false;  // No cycle
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
                  onClick={detectCycle}
                  disabled={isAnimating}
                  className="w-full"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Detect Cycle
                </Button>

                <Button
                  onClick={toggleCycle}
                  disabled={isAnimating}
                  variant="outline"
                  className="w-full"
                >
                  {hasCycle ? "Remove Cycle" : "Add Cycle"}
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
                    <code className="bg-muted px-2 py-1 rounded">O(n)</code> - visits each node at most twice
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-foreground mb-1">Space Complexity</h4>
                  <p className="text-sm text-muted-foreground">
                    <code className="bg-muted px-2 py-1 rounded">O(1)</code> - only two pointers used
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-foreground mb-1">Use Cases</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Detecting infinite loops</li>
                    <li>Finding cycle start point</li>
                    <li>Memory leak detection</li>
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

export default FloydsCycle;
