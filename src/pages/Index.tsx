import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  List, 
  Network, 
  Layers,
  Code2,
  PlayCircle,
  BookOpen
} from "lucide-react";

const Index = () => {
  const dataStructures = [
    {
      id: "linked-list",
      title: "Linked Lists",
      description: "Visualize insertion, deletion, and traversal operations on singly linked lists",
      icon: List,
      color: "linked-list",
      operations: ["Insert", "Delete", "Search", "Traverse"],
      difficulty: "Beginner",
      route: "/linked-list"
    },
    {
      id: "queue",
      title: "Queues",
      description: "Explore FIFO operations including enqueue, dequeue, and peek functionality",
      icon: Layers,
      color: "queue", 
      operations: ["Enqueue", "Dequeue", "Peek", "IsEmpty"],
      difficulty: "Beginner",
      route: "/queue"
    },
    {
      id: "graph",
      title: "Graphs",
      description: "Interactive graph visualization with BFS and DFS traversal algorithms",
      icon: Network,
      color: "graph",
      operations: ["Add Node", "Add Edge", "BFS", "DFS"],
      difficulty: "Intermediate",
      route: "/graph"
    },
    {
      id: "algorithms",
      title: "Advanced Algorithms",
      description: "Explore advanced algorithms like Floyd's Cycle, Circular Queue, Deque, Prim's and Kruskal's",
      icon: Code2,
      color: "primary",
      operations: ["Floyd's", "Circular Queue", "Deque", "Prim's", "Kruskal's"],
      difficulty: "Advanced",
      route: "/algorithms"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-primary text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-6 py-24">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <Code2 className="h-12 w-12 mr-4" />
              <h1 className="text-5xl font-bold tracking-tight">
                Algorithm Visualizer
              </h1>
            </div>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Interactive visualization of fundamental data structures and algorithms. 
              Perfect for computer science students learning core concepts through step-by-step animations.
            </p>
            <div className="flex items-center justify-center gap-4 mb-12">
              <Badge variant="secondary" className="text-sm px-4 py-2">
                <BookOpen className="h-4 w-4 mr-2" />
                Educational
              </Badge>
              <Badge variant="secondary" className="text-sm px-4 py-2">
                <PlayCircle className="h-4 w-4 mr-2" />
                Interactive
              </Badge>
              <Badge variant="secondary" className="text-sm px-4 py-2">
                <Code2 className="h-4 w-4 mr-2" />
                Step-by-Step
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Data Structures Grid */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Choose a Data Structure
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Select any data structure below to start exploring its operations with interactive visualizations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {dataStructures.map((structure) => {
            const IconComponent = structure.icon;
            return (
              <Card 
                key={structure.id} 
                className="group hover:shadow-highlight transition-all duration-300 hover:scale-105 bg-card border-border animate-slide-in"
              >
                <CardHeader className="text-center pb-4">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-${structure.color} text-${structure.color}-foreground mb-4 mx-auto shadow-node group-hover:shadow-highlight transition-all duration-300`}>
                    <IconComponent className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {structure.title}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {structure.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm text-foreground mb-2">Available Operations:</h4>
                    <div className="flex flex-wrap gap-2">
                      {structure.operations.map((op) => (
                        <Badge key={op} variant="outline" className="text-xs border-border text-muted-foreground">
                          {op}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Badge 
                      variant={structure.difficulty === "Beginner" ? "secondary" : "outline"}
                      className="text-xs"
                    >
                      {structure.difficulty}
                    </Badge>
                    
                    <Link to={structure.route}>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300"
                      >
                        Explore
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-secondary/30 py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary text-primary-foreground mb-4">
                <PlayCircle className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Step-by-Step Execution</h3>
              <p className="text-sm text-muted-foreground">
                Watch algorithms execute one step at a time with detailed explanations
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary text-primary-foreground mb-4">
                <Code2 className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Code Examples</h3>
              <p className="text-sm text-muted-foreground">
                See the actual code implementation alongside the visual representation
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary text-primary-foreground mb-4">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Educational Focus</h3>
              <p className="text-sm text-muted-foreground">
                Built specifically for students learning data structures and algorithms
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;