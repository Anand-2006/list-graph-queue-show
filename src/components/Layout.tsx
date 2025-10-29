import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  List, 
  Layers, 
  Network,
  Code2,
  ArrowLeft 
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

const Layout = ({ children, title, subtitle }: LayoutProps) => {
  const location = useLocation();
  
  const navigationItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/linked-list", label: "Linked Lists", icon: List },
    { path: "/queue", label: "Queues", icon: Layers },
    { path: "/graph", label: "Graphs", icon: Network },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <Code2 className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold text-foreground">Algorithm Visualizer</h1>
                <p className="text-xs text-muted-foreground">Data Structures Course Project</p>
              </div>
            </Link>

            <nav className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link key={item.path} to={item.path}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      <IconComponent className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Button>
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Navigation */}
            <div className="md:hidden">
              {location.pathname !== "/" && (
                <Link to="/">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Page Header */}
      {title && (
        <section className="bg-gradient-subtle border-b border-border">
          <div className="container mx-auto px-6 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">{title}</h1>
                {subtitle && (
                  <p className="text-lg text-muted-foreground">{subtitle}</p>
                )}
              </div>
              
              {location.pathname !== "/" && (
                <Badge variant="outline" className="hidden sm:flex">
                  Interactive Visualization
                </Badge>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-auto">
        <div className="container mx-auto px-6 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>Data Structures Course Project - Algorithm Visualizer</p>
            <p className="mt-1">Built with React, TypeScript, and Tailwind CSS</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;