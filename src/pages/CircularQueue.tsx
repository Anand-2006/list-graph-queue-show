import { useState, useCallback } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Minus, RotateCcw, Eye } from "lucide-react";
import { toast } from "sonner";

interface QueueElement {
  value: number;
  index: number;
}

const CircularQueue = () => {
  const maxSize = 6;
  const [queue, setQueue] = useState<(number | null)[]>(Array(maxSize).fill(null));
  const [front, setFront] = useState(-1);
  const [rear, setRear] = useState(-1);
  const [inputValue, setInputValue] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);

  const isEmpty = front === -1;
  const isFull = (rear + 1) % maxSize === front;
  const size = isEmpty ? 0 : (rear >= front ? rear - front + 1 : maxSize - front + rear + 1);

  const enqueue = useCallback(async (value: number) => {
    if (isAnimating) return;
    
    if (isFull) {
      toast.error("Queue is full!");
      return;
    }

    setIsAnimating(true);
    setOperation(`Enqueuing ${value}`);

    if (isEmpty) {
      setFront(0);
      setRear(0);
      setHighlightIndex(0);
    } else {
      const newRear = (rear + 1) % maxSize;
      setRear(newRear);
      setHighlightIndex(newRear);
    }

    await new Promise(resolve => setTimeout(resolve, 600));

    setQueue(prev => {
      const newQueue = [...prev];
      const index = isEmpty ? 0 : (rear + 1) % maxSize;
      newQueue[index] = value;
      return newQueue;
    });

    toast.success(`Enqueued ${value}`);
    
    setTimeout(() => {
      setIsAnimating(false);
      setOperation(null);
      setHighlightIndex(null);
    }, 1000);
  }, [isEmpty, isFull, rear, isAnimating]);

  const dequeue = useCallback(async () => {
    if (isAnimating) return;
    
    if (isEmpty) {
      toast.error("Queue is empty!");
      return;
    }

    setIsAnimating(true);
    const dequeuedValue = queue[front];
    setOperation(`Dequeuing ${dequeuedValue}`);
    setHighlightIndex(front);

    await new Promise(resolve => setTimeout(resolve, 800));

    setQueue(prev => {
      const newQueue = [...prev];
      newQueue[front] = null;
      return newQueue;
    });

    if (front === rear) {
      setFront(-1);
      setRear(-1);
    } else {
      setFront((front + 1) % maxSize);
    }

    toast.success(`Dequeued ${dequeuedValue}`);
    
    setTimeout(() => {
      setIsAnimating(false);
      setOperation(null);
      setHighlightIndex(null);
    }, 800);
  }, [isEmpty, front, rear, queue, isAnimating]);

  const peek = useCallback(() => {
    if (isEmpty) {
      toast.error("Queue is empty!");
      return;
    }
    
    setHighlightIndex(front);
    toast.info(`Front element: ${queue[front]}`);
    
    setTimeout(() => {
      setHighlightIndex(null);
    }, 1500);
  }, [isEmpty, front, queue]);

  const reset = () => {
    setQueue(Array(maxSize).fill(null));
    setFront(-1);
    setRear(-1);
    setHighlightIndex(null);
    setOperation(null);
    setIsAnimating(false);
    toast.info("Queue reset");
  };

  const handleEnqueue = () => {
    const value = parseInt(inputValue);
    if (isNaN(value)) {
      toast.error("Please enter a valid number");
      return;
    }
    enqueue(value);
    setInputValue("");
  };

  const renderCircularQueue = () => {
    const centerX = 200;
    const centerY = 200;
    const radius = 120;

    return (
      <div className="bg-muted/30 rounded-xl p-8 min-h-[450px] flex items-center justify-center">
        <svg width="400" height="400" className="overflow-visible">
          {/* Draw circular queue */}
          {queue.map((value, index) => {
            const angle = (index / maxSize) * 2 * Math.PI - Math.PI / 2;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);

            const isFrontIndex = index === front;
            const isRearIndex = index === rear;
            const isHighlighted = index === highlightIndex;

            return (
              <g key={index}>
                {/* Connection lines */}
                {index < maxSize - 1 && (
                  <line
                    x1={x}
                    y1={y}
                    x2={centerX + radius * Math.cos(((index + 1) / maxSize) * 2 * Math.PI - Math.PI / 2)}
                    y2={centerY + radius * Math.sin(((index + 1) / maxSize) * 2 * Math.PI - Math.PI / 2)}
                    stroke="hsl(var(--border))"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />
                )}
                
                {/* Circle */}
                <circle
                  cx={x}
                  cy={y}
                  r="35"
                  className={`transition-all duration-300 ${
                    isHighlighted ? 'fill-warning stroke-warning' :
                    isFrontIndex && value !== null ? 'fill-primary stroke-primary' :
                    isRearIndex && value !== null ? 'fill-success stroke-success' :
                    value !== null ? 'fill-queue stroke-queue' :
                    'fill-muted stroke-border'
                  }`}
                  strokeWidth="3"
                  style={{
                    filter: isHighlighted || (isFrontIndex && value !== null) || (isRearIndex && value !== null) 
                      ? 'drop-shadow(0 0 10px currentColor)' 
                      : 'none'
                  }}
                />
                
                {/* Value */}
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dy=".3em"
                  className="text-lg font-bold"
                  fill={value !== null ? "hsl(var(--queue-foreground))" : "hsl(var(--muted-foreground))"}
                >
                  {value !== null ? value : '-'}
                </text>

                {/* Index label */}
                <text
                  x={x}
                  y={y + 50}
                  textAnchor="middle"
                  className="text-xs"
                  fill="hsl(var(--muted-foreground))"
                >
                  [{index}]
                </text>

                {/* Front/Rear labels */}
                {isFrontIndex && value !== null && (
                  <text
                    x={x}
                    y={y - 50}
                    textAnchor="middle"
                    className="text-xs font-semibold fill-primary"
                  >
                    FRONT
                  </text>
                )}
                {isRearIndex && value !== null && (
                  <text
                    x={x}
                    y={y - (isFrontIndex ? 65 : 50)}
                    textAnchor="middle"
                    className="text-xs font-semibold fill-success"
                  >
                    REAR
                  </text>
                )}
              </g>
            );
          })}

          {/* Circular connection line */}
          <line
            x1={centerX + radius * Math.cos(((maxSize - 1) / maxSize) * 2 * Math.PI - Math.PI / 2)}
            y1={centerY + radius * Math.sin(((maxSize - 1) / maxSize) * 2 * Math.PI - Math.PI / 2)}
            x2={centerX + radius * Math.cos(-Math.PI / 2)}
            y2={centerY + radius * Math.sin(-Math.PI / 2)}
            stroke="hsl(var(--border))"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
        </svg>
      </div>
    );
  };

  return (
    <Layout 
      title="Circular Queue Visualization" 
      subtitle="Explore circular queue operations with wrap-around functionality"
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
                    <span>Circular Queue</span>
                  </CardTitle>
                  {operation && (
                    <Badge variant="outline" className="animate-pulse-soft">
                      {operation}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {renderCircularQueue()}
                <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Size</p>
                    <p className="text-2xl font-bold text-foreground">{size}/{maxSize}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Front Index</p>
                    <p className="text-2xl font-bold text-primary">{front === -1 ? '-' : front}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Rear Index</p>
                    <p className="text-2xl font-bold text-success">{rear === -1 ? '-' : rear}</p>
                  </div>
                </div>
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
{`class CircularQueue {
  constructor(size) {
    this.queue = new Array(size);
    this.size = size;
    this.front = -1;
    this.rear = -1;
  }

  enqueue(value) {
    if ((this.rear + 1) % this.size === this.front) {
      return "Queue is full";
    }
    if (this.front === -1) this.front = 0;
    this.rear = (this.rear + 1) % this.size;
    this.queue[this.rear] = value;
  }

  dequeue() {
    if (this.front === -1) {
      return "Queue is empty";
    }
    const value = this.queue[this.front];
    if (this.front === this.rear) {
      this.front = this.rear = -1;
    } else {
      this.front = (this.front + 1) % this.size;
    }
    return value;
  }
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
                <CardTitle className="text-lg">Operations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Enqueue */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Enqueue</label>
                  <div className="flex space-x-2">
                    <Input
                      type="number"
                      placeholder="Value"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      disabled={isAnimating || isFull}
                    />
                    <Button
                      onClick={handleEnqueue}
                      disabled={isAnimating || !inputValue || isFull}
                      className="bg-queue hover:bg-queue/90 text-queue-foreground"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Operations */}
                <div className="space-y-2">
                  <Button
                    onClick={dequeue}
                    disabled={isAnimating || isEmpty}
                    variant="outline"
                    className="w-full"
                  >
                    <Minus className="h-4 w-4 mr-2" />
                    Dequeue
                  </Button>

                  <Button
                    onClick={peek}
                    disabled={isEmpty}
                    variant="outline"
                    className="w-full"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Peek Front
                  </Button>

                  <Button
                    onClick={reset}
                    disabled={isAnimating}
                    variant="outline"
                    className="w-full"
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
                  <h4 className="font-semibold text-sm text-foreground mb-1">Key Feature</h4>
                  <p className="text-sm text-muted-foreground">
                    Uses modulo operator for wrap-around, efficiently utilizing array space
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-foreground mb-1">Time Complexity</h4>
                  <p className="text-sm text-muted-foreground">
                    All operations: <code className="bg-muted px-1 rounded">O(1)</code>
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-foreground mb-1">Space Complexity</h4>
                  <p className="text-sm text-muted-foreground">
                    <code className="bg-muted px-1 rounded">O(n)</code> where n is queue size
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

export default CircularQueue;
