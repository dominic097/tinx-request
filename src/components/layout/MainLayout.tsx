import { ReactNode } from 'react';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Activity Bar - Left Side */}
      <div className="w-12 bg-secondary border-r border-border flex flex-col items-center py-2">
        <div className="flex-1">
          {/* Icons will go here */}
        </div>
      </div>

      {/* Sidebar Panel */}
      <div className="w-64 bg-card border-r border-border flex flex-col">
        <div className="h-12 border-b border-border flex items-center px-4">
          <h2 className="font-semibold text-sm">Collections</h2>
        </div>
        <div className="flex-1 overflow-auto">
          {/* Sidebar content will go here */}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Editor Area */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>

        {/* Status Bar */}
        <div className="h-6 bg-primary text-primary-foreground px-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <span>Ready</span>
          </div>
          <div className="flex items-center gap-4">
            <span>No Environment</span>
          </div>
        </div>
      </div>
    </div>
  );
}
