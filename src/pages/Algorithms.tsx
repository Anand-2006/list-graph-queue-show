import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, GitBranch, Repeat, Layers, Network } from "lucide-react";

const Algorithms = () => {
  const algorithms = [
    {
      id: "floyds-cycle",
      title: "Floyd's Cycle Detection",
      description: "Detect cycles in linked lists using the tortoise and hare algorithm",
      icon: Repeat,
      category: "Linked List",
      difficulty: "Intermediate",
      route: "/algorithms/floyds-cycle",
      complexity: "O(n)"
    },
    {
      id: "circular-queue",
      title: "Circular Queue",
      description: "Efficient queue implementation using circular array with wrap-around",
      icon: Repeat,
      category: "Queue",
      difficulty: "Beginner",
      route: "/algorithms/circular-queue",
      complexity: "O(1)"
    },
    {
      id: "deque",
      title: "Double-Ended Queue (Deque)",
      description: "Queue that allows insertion and deletion from both ends",
      icon: Layers,
      category: "Queue",
      difficulty: "Intermediate",
      route: "/algorithms/deque",
      complexity: "O(1)"
    },
    {
      id: "prims",
      title: "Prim's Algorithm",
      description: "Find minimum spanning tree starting from a single vertex",
      icon: Network,
      category: "Graph",
      difficulty: "Advanced",
      route: "/algorithms/prims",
      complexity: "O(E log V)"
    },
    {
      id: "kruskals",
      title: "Kruskal's Algorithm",
      description: "Find minimum spanning tree by sorting edges by weight",
      icon: GitBranch,
      category: "Graph",
      difficulty: "Advanced",
      route: "/algorithms/kruskals",
      complexity: "O(E log E)"
    }
  ];

  return (
    <Layout 
      title="Advanced Algorithms" 
      subtitle="Explore specialized algorithms with interactive visualizations"
    >
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {algorithms.map((algorithm) => {
            const IconComponent = algorithm.icon;
            return (
              <Card 
                key={algorithm.id} 
                className="group hover:shadow-highlight transition-all duration-300 hover:scale-105 animate-fade-in"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary text-primary-foreground mb-3">
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {algorithm.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {algorithm.title}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {algorithm.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Complexity:</span>
                    <code className="bg-muted px-2 py-1 rounded text-xs font-mono">
                      {algorithm.complexity}
                    </code>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Badge 
                      variant={algorithm.difficulty === "Beginner" ? "secondary" : 
                               algorithm.difficulty === "Intermediate" ? "outline" : "default"}
                      className="text-xs"
                    >
                      {algorithm.difficulty}
                    </Badge>
                    
                    <Link to={algorithm.route}>
                      <Button 
                        size="sm" 
                        className="group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                      >
                        Visualize
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default Algorithms;
