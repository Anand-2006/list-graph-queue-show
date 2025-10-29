import { useState, useCallback } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Minus, RotateCcw, ArrowLeft, ArrowRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { toast } from "sonner";

interface DequeElement {
  value: number;
  id: string;
}

const Deque = () => {
  const [deque, setDeque] = useState<DequeElement[]>([
    { id: "1", value: 10 },
    { id: "2", value: 20 },
    { id: "3", value: 30 }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [highlightSide, setHighlightSide] = useState<'front' | 'rear' | null>(null);
  const [operation, setOperation] = useState<string | null>(null);

  const addFront = useCallback(async (value: number) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setOperation(`Adding ${value} to front`);
    setHighlightSide('front');

    await new Promise(resolve => setTimeout(resolve, 600));

    const newElement: DequeElement = {
      id: Date.now().toString(),
      value
    };

    setDeque(prev => [newElement, ...prev]);
    toast.success(`Added ${value} to front`);
    
    setTimeout(() => {
      setIsAnimating(false);
      setOperation(null);
      setHighlightSide(null);
    }, 800);
  }, [isAnimating]);

  const addRear = useCallback(async (value: number) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setOperation(`Adding ${value} to rear`);
    setHighlightSide('rear');

    await new Promise(resolve => setTimeout(resolve, 600));

    const newElement: DequeElement = {
      id: Date.now().toString(),
      value
    };

    setDeque(prev => [...prev, newElement]);
    toast.success(`Added ${value} to rear`);
    
    setTimeout(() => {
      setIsAnimating(false);
      setOperation(null);
      setHighlightSide(null);
    }, 800);
  }, [isAnimating]);

  const removeFront = useCallback(async () => {
    if (isAnimating || deque.length === 0) return;
    
    setIsAnimating(true);
    const removedValue = deque[0].value;
    setOperation(`Removing ${removedValue} from front`);
    setHighlightSide('front');

    await new Promise(resolve => setTimeout(resolve, 800));

    setDeque(prev => prev.slice(1));
    toast.success(`Removed ${removedValue} from front`);
    
    setTimeout(() => {
      setIsAnimating(false);
      setOperation(null);
      setHighlightSide(null);
    }, 500);
  }, [deque, isAnimating]);

  const removeRear = useCallback(async () => {
    if (isAnimating || deque.length === 0) return;
    
    setIsAnimating(true);
    const removedValue = deque[deque.length - 1].value;
    setOperation(`Removing ${removedValue} from rear`);
    setHighlightSide('rear');

    await new Promise(resolve => setTimeout(resolve, 800));

    setDeque(prev => prev.slice(0, -1));
    toast.success(`Removed ${removedValue} from rear`);
    
    setTimeout(() => {
      setIsAnimating(false);
      setOperation(null);
      setHighlightSide(null);
    }, 500);
  }, [deque, isAnimating]);

  const reset = () => {
    setDeque([
      { id: "1", value: 10 },
      { id: "2", value: 20 },
      { id: "3", value: 30 }
    ]);
    setHighlightSide(null);
    setOperation(null);
    setIsAnimating(false);
    toast.info("Deque reset");
  };

  const handleAddFront = () => {
    const value = parseInt(inputValue);
    if (isNaN(value)) {
      toast.error("Please enter a valid number");
      return;
    }
    addFront(value);
    setInputValue("");
  };

  const handleAddRear = () => {
    const value = parseInt(inputValue);
    if (isNaN(value)) {
      toast.error("Please enter a valid number");
      return;
    }
    addRear(value);
    setInputValue("");
  };

  const renderDeque = () => {
    return (
      <div className="bg-muted/30 rounded-xl p-8 min-h-[250px]">
        <div className="flex items-center justify-center space-x-4">
          {/* Front indicator */}
          <div className="flex flex-col items-center">
            <ChevronsLeft className={`h-8 w-8 mb-2 ${highlightSide === 'front' ? 'text-primary animate-pulse-soft' : 'text-muted-foreground'}`} />
            <Badge variant="outline" className={highlightSide === 'front' ? 'bg-primary text-primary-foreground' : ''}>
              Front
            </Badge>
          </div>

          {/* Deque elements */}
          <div className="flex items-center space-x-3 min-w-[400px] justify-center">
            {deque.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <p className="text-lg">Empty Deque</p>
                <p className="text-sm">Add elements from either end</p>
              </div>
            ) : (
              deque.map((element, index) => (
                <div
                  key={element.id}
                  className={`
                    node-base w-16 h-16 text-lg animate-scale-in
                    ${(index === 0 && highlightSide === 'front') || 
                      (index === deque.length - 1 && highlightSide === 'rear')
                      ? 'node-current' 
                      : 'node-queue'}
                  `}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {element.value}
                </div>
              ))
            )}
          </div>

          {/* Rear indicator */}
          <div className="flex flex-col items-center">
            <ChevronsRight className={`h-8 w-8 mb-2 ${highlightSide === 'rear' ? 'text-success animate-pulse-soft' : 'text-muted-foreground'}`} />
            <Badge variant="outline" className={highlightSide === 'rear' ? 'bg-success text-success-foreground' : ''}>
              Rear
            </Badge>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Size: <span className="font-semibold text-foreground">{deque.length}</span> elements
          </p>
        </div>
      </div>
    );
  };

  return (
    <Layout 
      title="Double-Ended Queue (Deque)" 
      subtitle="Queue that allows insertion and deletion from both ends"
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
                    <span>Deque Visualization</span>
                  </CardTitle>
                  {operation && (
                    <Badge variant="outline" className="animate-pulse-soft">
                      {operation}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {renderDeque()}
              </CardContent>
            </Card>

            {/* Explanation & Code */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How It Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm text-foreground mb-2">Key Features</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Insert and delete from both front and rear</li>
                    <li>More flexible than standard queue or stack</li>
                    <li>Can be used as both queue and stack</li>
                    <li>All operations in O(1) time</li>
                  </ul>
                </div>
                <div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <pre className="text-muted-foreground">
{`class Deque {
  constructor() {
    this.items = [];
  }

  // Add to front - O(1)
  addFront(element) {
    this.items.unshift(element);
  }

  // Add to rear - O(1)
  addRear(element) {
    this.items.push(element);
  }

  // Remove from front - O(1)
  removeFront() {
    return this.items.shift();
  }

  // Remove from rear - O(1)
  removeRear() {
    return this.items.pop();
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
                {/* Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Add Element</label>
                  <Input
                    type="number"
                    placeholder="Enter value"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    disabled={isAnimating}
                  />
                </div>

                {/* Add operations */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={handleAddFront}
                    disabled={isAnimating || !inputValue}
                    variant="outline"
                    className="text-sm"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Add Front
                  </Button>
                  <Button
                    onClick={handleAddRear}
                    disabled={isAnimating || !inputValue}
                    className="bg-queue hover:bg-queue/90 text-queue-foreground text-sm"
                  >
                    Add Rear
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>

                <Separator />

                {/* Remove operations */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Remove Element</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={removeFront}
                      disabled={isAnimating || deque.length === 0}
                      variant="outline"
                      size="sm"
                    >
                      <Minus className="h-4 w-4 mr-1" />
                      Front
                    </Button>
                    <Button
                      onClick={removeRear}
                      disabled={isAnimating || deque.length === 0}
                      variant="outline"
                      size="sm"
                    >
                      Rear
                      <Minus className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>

                <Separator />

                <Button
                  onClick={reset}
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
                    All operations: <code className="bg-muted px-1 rounded">O(1)</code>
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-foreground mb-1">Space Complexity</h4>
                  <p className="text-sm text-muted-foreground">
                    <code className="bg-muted px-1 rounded">O(n)</code> for n elements
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-foreground mb-1">Use Cases</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Browser history (forward/back)</li>
                    <li>Undo/redo operations</li>
                    <li>Sliding window algorithms</li>
                    <li>Job scheduling</li>
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

export default Deque;
