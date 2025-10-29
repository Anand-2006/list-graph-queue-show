import { useState, useCallback } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowRight, 
  ArrowLeft, 
  Plus, 
  Minus, 
  Eye,
  RotateCcw 
} from "lucide-react";
import { toast } from "sonner";

interface QueueNode {
  id: string;
  value: number;
  isHighlighted?: boolean;
  isTarget?: boolean;
}

const Queue = () => {
  const [queue, setQueue] = useState<QueueNode[]>([
    { id: "1", value: 10 },
    { id: "2", value: 20 },
    { id: "3", value: 30 }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [operation, setOperation] = useState<string | null>(null);
  const [frontIndex, setFrontIndex] = useState(0);
  const [rearIndex, setRearIndex] = useState(2);

  const resetAnimation = useCallback(() => {
    setQueue(queue => queue.map(node => ({ 
      ...node, 
      isHighlighted: false, 
      isTarget: false 
    })));
    setIsAnimating(false);
    setOperation(null);
  }, []);

  const enqueue = useCallback(async (value: number) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setOperation(`Enqueuing ${value} to rear of queue`);
    
    const newNode: QueueNode = {
      id: Date.now().toString(),
      value,
      isHighlighted: true
    };

    // Add to rear
    setQueue(prev => [...prev, newNode]);
    setRearIndex(prev => prev + 1);
    
    toast.success(`Enqueued ${value} to the queue`);

    setTimeout(() => {
      setIsAnimating(false);
      setOperation(null);
      resetAnimation();
    }, 2000);
  }, [isAnimating, resetAnimation]);

  const dequeue = useCallback(async () => {
    if (isAnimating || queue.length === 0) return;
    
    setIsAnimating(true);
    const frontValue = queue[0].value;
    setOperation(`Dequeuing ${frontValue} from front of queue`);

    // Highlight front element
    setQueue(prev => prev.map((node, index) => ({
      ...node,
      isTarget: index === 0
    })));

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Remove from front
    setQueue(prev => prev.slice(1));
    setFrontIndex(prev => Math.max(0, prev));
    setRearIndex(prev => Math.max(0, prev - 1));
    
    toast.success(`Dequeued ${frontValue} from the queue`);
    
    setTimeout(() => {
      setIsAnimating(false);
      setOperation(null);
      resetAnimation();
    }, 1000);
  }, [queue, isAnimating, resetAnimation]);

  const peek = useCallback(async () => {
    if (isAnimating || queue.length === 0) return;
    
    setIsAnimating(true);
    const frontValue = queue[0].value;
    setOperation(`Peeking at front element: ${frontValue}`);

    // Highlight front element
    setQueue(prev => prev.map((node, index) => ({
      ...node,
      isHighlighted: index === 0
    })));
    
    toast.success(`Front element is: ${frontValue}`);
    
    setTimeout(() => {
      setIsAnimating(false);
      setOperation(null);
      resetAnimation();
    }, 2000);
  }, [queue, isAnimating, resetAnimation]);

  const handleEnqueue = () => {
    const value = parseInt(inputValue);
    if (isNaN(value)) {
      toast.error("Please enter a valid number");
      return;
    }
    enqueue(value);
    setInputValue("");
  };

  const renderQueue = () => {
    return (
      <div className="space-y-6">
        {/* Queue Direction Indicators */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Dequeue (Front)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>Enqueue (Rear)</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>

        {/* Queue Visualization */}
        <div className="bg-muted/30 rounded-xl p-8 min-h-[200px]">
          {queue.length === 0 ? (
            <div className="text-center text-muted-foreground">
              <p className="text-lg">Empty Queue</p>
              <p className="text-sm">Add elements using enqueue operation</p>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-4 overflow-x-auto">
              {queue.map((node, index) => (
                <div key={node.id} className="flex flex-col items-center">
                  {/* Position Labels */}
                  <div className="flex space-x-2 mb-2">
                    {index === 0 && (
                      <Badge variant="outline" className="text-xs">
                        Front
                      </Badge>
                    )}
                    {index === queue.length - 1 && (
                      <Badge variant="outline" className="text-xs">
                        Rear
                      </Badge>
                    )}
                  </div>

                  {/* Queue Node */}
                  <div
                    className={`
                      node-base w-16 h-16 text-lg relative animate-bounce-in
                      ${node.isHighlighted ? 'node-current' : 
                        node.isTarget ? 'node-success' : 'node-queue'}
                    `}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {node.value}
                    
                    {node.isHighlighted && (
                      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                        <Badge variant="outline" className="text-xs">
                          Peeking
                        </Badge>
                      </div>
                    )}
                    {node.isTarget && (
                      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                        <Badge variant="outline" className="text-xs bg-warning text-warning-foreground">
                          Dequeuing
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Index */}
                  <div className="text-xs text-muted-foreground mt-2">
                    [{index}]
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Queue Properties */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl font-bold text-queue">{queue.length}</div>
            <div className="text-sm text-muted-foreground">Size</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl font-bold text-queue">
              {queue.length > 0 ? queue[0].value : '-'}
            </div>
            <div className="text-sm text-muted-foreground">Front Element</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl font-bold text-queue">
              {queue.length > 0 ? queue[queue.length - 1].value : '-'}
            </div>
            <div className="text-sm text-muted-foreground">Rear Element</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout 
      title="Queue Visualizer" 
      subtitle="Explore FIFO (First In, First Out) operations: enqueue, dequeue, and peek"
    >
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Visualization Area */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-queue rounded-full"></div>
                    <span>Queue Visualization (FIFO)</span>
                  </CardTitle>
                  {operation && (
                    <Badge variant="outline" className="animate-pulse-soft">
                      {operation}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {renderQueue()}
              </CardContent>
            </Card>

            {/* Code Display */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Implementation Code</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <pre className="text-muted-foreground">
{`class Queue {
  constructor() {
    this.items = [];
    this.front = 0;
    this.rear = 0;
  }

  // Enqueue: Add to rear - O(1)
  enqueue(element) {
    this.items[this.rear] = element;
    this.rear++;
  }

  // Dequeue: Remove from front - O(1)
  dequeue() {
    if (this.isEmpty()) return null;
    
    const item = this.items[this.front];
    delete this.items[this.front];
    this.front++;
    return item;
  }

  // Peek: View front element - O(1)
  peek() {
    return this.isEmpty() ? null : this.items[this.front];
  }

  // Check if queue is empty - O(1)
  isEmpty() {
    return this.front === this.rear;
  }
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
                <CardTitle className="text-lg">Queue Operations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Enqueue */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Enqueue (Add to Rear)</label>
                  <div className="flex space-x-2">
                    <Input
                      type="number"
                      placeholder="Enter value"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      disabled={isAnimating}
                    />
                    <Button
                      onClick={handleEnqueue}
                      disabled={isAnimating || !inputValue}
                      className="bg-queue hover:bg-queue/90 text-queue-foreground"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Queue Operations */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Queue Operations</label>
                  <div className="grid grid-cols-1 gap-2">
                    <Button
                      onClick={dequeue}
                      disabled={isAnimating || queue.length === 0}
                      variant="outline"
                      className="justify-start"
                    >
                      <Minus className="h-4 w-4 mr-2" />
                      Dequeue (Remove Front)
                    </Button>
                    <Button
                      onClick={peek}
                      disabled={isAnimating || queue.length === 0}
                      variant="outline"
                      className="justify-start"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Peek (View Front)
                    </Button>
                  </div>
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
                    <p>Enqueue: <code className="bg-muted px-1 rounded">O(1)</code></p>
                    <p>Dequeue: <code className="bg-muted px-1 rounded">O(1)</code></p>
                    <p>Peek: <code className="bg-muted px-1 rounded">O(1)</code></p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-foreground mb-1">Space Complexity</h4>
                  <p className="text-sm text-muted-foreground">
                    <code className="bg-muted px-1 rounded">O(n)</code> where n is the number of elements
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-foreground mb-1">FIFO Principle</h4>
                  <p className="text-sm text-muted-foreground">
                    First element added is the first one to be removed
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Queue;