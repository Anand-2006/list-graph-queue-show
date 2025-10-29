import { useState, useCallback } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  Minus, 
  Search,
  ArrowRight,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";

interface ListNode {
  id: string;
  value: number;
  next: string | null;
  isHighlighted?: boolean;
  isTarget?: boolean;
}

const LinkedList = () => {
  const [nodes, setNodes] = useState<ListNode[]>([
    { id: "1", value: 10, next: "2" },
    { id: "2", value: 20, next: "3" },
    { id: "3", value: 30, next: null }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [operation, setOperation] = useState<string | null>(null);

  const resetAnimation = useCallback(() => {
    setNodes(nodes => nodes.map(node => ({ 
      ...node, 
      isHighlighted: false, 
      isTarget: false 
    })));
    setIsAnimating(false);
    setCurrentStep(0);
    setOperation(null);
  }, []);

  const insertNode = useCallback(async (value: number, position: number = 0) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setOperation(`Inserting ${value} at position ${position}`);
    
    const newNode: ListNode = {
      id: Date.now().toString(),
      value,
      next: null,
      isHighlighted: true
    };

    if (position === 0) {
      // Insert at head
      newNode.next = nodes.length > 0 ? nodes[0].id : null;
      setNodes(prev => [newNode, ...prev]);
      toast.success(`Inserted ${value} at the beginning`);
    } else {
      // Insert at specific position
      const newNodes = [...nodes];
      if (position >= newNodes.length) {
        // Insert at tail
        if (newNodes.length > 0) {
          newNodes[newNodes.length - 1].next = newNode.id;
        }
        newNodes.push(newNode);
        toast.success(`Inserted ${value} at the end`);
      } else {
        // Insert in middle
        const prevNode = newNodes[position - 1];
        newNode.next = prevNode.next;
        prevNode.next = newNode.id;
        newNodes.splice(position, 0, newNode);
        toast.success(`Inserted ${value} at position ${position}`);
      }
      setNodes(newNodes);
    }

    setTimeout(() => {
      setIsAnimating(false);
      setOperation(null);
      resetAnimation();
    }, 2000);
  }, [nodes, isAnimating, resetAnimation]);

  const deleteNode = useCallback(async (value: number) => {
    if (isAnimating || nodes.length === 0) return;
    
    setIsAnimating(true);
    setOperation(`Deleting node with value ${value}`);

    const nodeIndex = nodes.findIndex(node => node.value === value);
    if (nodeIndex === -1) {
      toast.error(`Node with value ${value} not found`);
      setIsAnimating(false);
      setOperation(null);
      return;
    }

    // Highlight target node
    setNodes(prev => prev.map((node, index) => ({
      ...node,
      isTarget: index === nodeIndex
    })));

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Remove the node
    const newNodes = [...nodes];
    const nodeToDelete = newNodes[nodeIndex];
    
    if (nodeIndex > 0) {
      newNodes[nodeIndex - 1].next = nodeToDelete.next;
    }
    
    newNodes.splice(nodeIndex, 1);
    setNodes(newNodes);
    
    toast.success(`Deleted node with value ${value}`);
    
    setTimeout(() => {
      setIsAnimating(false);
      setOperation(null);
      resetAnimation();
    }, 1000);
  }, [nodes, isAnimating, resetAnimation]);

  const searchNode = useCallback(async (value: number) => {
    if (isAnimating || nodes.length === 0) return;
    
    setIsAnimating(true);
    setOperation(`Searching for value ${value}`);
    
    for (let i = 0; i < nodes.length; i++) {
      setCurrentStep(i);
      setNodes(prev => prev.map((node, index) => ({
        ...node,
        isHighlighted: index === i,
        isTarget: false
      })));
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (nodes[i].value === value) {
        setNodes(prev => prev.map((node, index) => ({
          ...node,
          isHighlighted: false,
          isTarget: index === i
        })));
        toast.success(`Found ${value} at position ${i}`);
        setTimeout(() => {
          setIsAnimating(false);
          setOperation(null);
          resetAnimation();
        }, 2000);
        return;
      }
    }
    
    toast.error(`Value ${value} not found in the list`);
    setTimeout(() => {
      setIsAnimating(false);
      setOperation(null);
      resetAnimation();
    }, 1000);
  }, [nodes, isAnimating, resetAnimation]);

  const handleInsert = () => {
    const value = parseInt(inputValue);
    if (isNaN(value)) {
      toast.error("Please enter a valid number");
      return;
    }
    insertNode(value, 0);
    setInputValue("");
  };

  const handleSearch = () => {
    const value = parseInt(searchValue);
    if (isNaN(value)) {
      toast.error("Please enter a valid number");
      return;
    }
    searchNode(value);
  };

  const renderLinkedList = () => {
    return (
      <div className="flex items-center justify-center space-x-4 p-8 min-h-[200px] bg-muted/30 rounded-xl overflow-x-auto">
        {nodes.length === 0 ? (
          <div className="text-center text-muted-foreground">
            <p className="text-lg">Empty List</p>
            <p className="text-sm">Add some nodes to get started</p>
          </div>
        ) : (
          nodes.map((node, index) => (
            <div key={node.id} className="flex items-center">
              <div
                className={`
                  node-base w-16 h-16 text-lg relative animate-bounce-in
                  ${node.isHighlighted ? 'node-current' : 
                    node.isTarget ? 'node-success' : 'node-linked-list'}
                `}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {node.value}
                {node.isHighlighted && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                    <Badge variant="outline" className="text-xs">
                      Current
                    </Badge>
                  </div>
                )}
                {node.isTarget && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                    <Badge variant="outline" className="text-xs bg-success text-success-foreground">
                      Found
                    </Badge>
                  </div>
                )}
              </div>
              {node.next && (
                <div className="flex items-center">
                  <ArrowRight className="h-6 w-6 text-muted-foreground mx-2 animate-pulse-soft" />
                </div>
              )}
              {!node.next && index < nodes.length - 1 && (
                <div className="flex items-center">
                  <ChevronRight className="h-6 w-6 text-muted-foreground mx-2" />
                </div>
              )}
            </div>
          ))
        )}
        {nodes.length > 0 && (
          <div className="flex items-center">
            <div className="w-12 h-12 border-2 border-dashed border-muted-foreground rounded-lg flex items-center justify-center text-muted-foreground">
              NULL
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Layout 
      title="Linked List Visualizer" 
      subtitle="Explore insertion, deletion, and search operations on singly linked lists"
    >
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Visualization Area */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-linked-list rounded-full"></div>
                    <span>Linked List Visualization</span>
                  </CardTitle>
                  {operation && (
                    <Badge variant="outline" className="animate-pulse-soft">
                      {operation}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {renderLinkedList()}
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
{`class ListNode {
  constructor(val, next = null) {
    this.val = val;
    this.next = next;
  }
}

// Insert at beginning: O(1)
function insertAtHead(head, val) {
  return new ListNode(val, head);
}

// Search: O(n)
function search(head, target) {
  let current = head;
  let position = 0;
  
  while (current) {
    if (current.val === target) {
      return position;
    }
    current = current.next;
    position++;
  }
  return -1;
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
                <CardTitle className="text-lg">Operations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Insert */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Insert Node</label>
                  <div className="flex space-x-2">
                    <Input
                      type="number"
                      placeholder="Enter value"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      disabled={isAnimating}
                    />
                    <Button
                      onClick={handleInsert}
                      disabled={isAnimating || !inputValue}
                      className="bg-linked-list hover:bg-linked-list/90 text-linked-list-foreground"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Search */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Search Node</label>
                  <div className="flex space-x-2">
                    <Input
                      type="number"
                      placeholder="Search value"
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      disabled={isAnimating}
                    />
                    <Button
                      onClick={handleSearch}
                      disabled={isAnimating || !searchValue || nodes.length === 0}
                      variant="outline"
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Delete */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Delete Node</label>
                  <div className="grid grid-cols-2 gap-2">
                    {nodes.slice(0, 4).map((node) => (
                      <Button
                        key={node.id}
                        variant="outline"
                        size="sm"
                        onClick={() => deleteNode(node.value)}
                        disabled={isAnimating}
                        className="text-xs"
                      >
                        <Minus className="h-3 w-3 mr-1" />
                        {node.value}
                      </Button>
                    ))}
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
                    <p>Insert at head: <code className="bg-muted px-1 rounded">O(1)</code></p>
                    <p>Search: <code className="bg-muted px-1 rounded">O(n)</code></p>
                    <p>Delete: <code className="bg-muted px-1 rounded">O(n)</code></p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-foreground mb-1">Space Complexity</h4>
                  <p className="text-sm text-muted-foreground">
                    <code className="bg-muted px-1 rounded">O(1)</code> auxiliary space
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

export default LinkedList;