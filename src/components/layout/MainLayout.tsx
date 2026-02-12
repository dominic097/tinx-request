import type { ReactNode } from 'react';

interface MainLayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
  statusBar?: ReactNode;
}

export function MainLayout({ children, sidebar, statusBar }: MainLayoutProps) {
  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Activity Bar - Left Side */}
      <div className="w-12 bg-secondary border-r border-border flex flex-col items-center py-2">
        <div className="flex-1">
          {/* Icons will go here */}
        </div>
      </div>

      {/* Sidebar Panel */}
      {sidebar && (
        <div className="w-64 bg-card border-r border-border flex flex-col">
          {sidebar}
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Editor Area */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>

        {/* Status Bar */}
        <div className="h-6 bg-primary text-primary-foreground px-4 flex items-center justify-between text-xs">
          {statusBar || (
            <>
              <div className="flex items-center gap-4">
                <span>Ready</span>
              </div>
              <div className="flex items-center gap-4">
                <span>No Environment</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
