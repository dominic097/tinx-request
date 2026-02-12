import { useTabsStore } from '@/stores/tabs';
import { HttpMethod } from '@/types';

export function RequestTabs() {
  const { tabs, activeTabId, setActiveTab, closeTab, closeOtherTabs } = useTabsStore();

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET': return 'text-green-500';
      case 'POST': return 'text-yellow-500';
      case 'PUT': return 'text-blue-500';
      case 'PATCH': return 'text-purple-500';
      case 'DELETE': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const handleCloseTab = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    const tab = tabs.find(t => t.id === tabId);
    if (tab?.isDirty) {
      if (confirm('You have unsaved changes. Close anyway?')) {
        closeTab(tabId);
      }
    } else {
      closeTab(tabId);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, tabId: string) => {
    e.preventDefault();
    // You could show a context menu here
    if (confirm('Close other tabs?')) {
      closeOtherTabs(tabId);
    }
  };

  if (tabs.length === 0) return null;

  return (
    <div className="flex items-center bg-secondary/30 border-b border-border overflow-x-auto">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          onContextMenu={(e) => handleContextMenu(e, tab.id)}
          className={`
            flex items-center gap-2 px-4 py-2 border-r border-border cursor-pointer
            transition-colors hover:bg-secondary
            ${activeTabId === tab.id ? 'bg-card' : 'bg-transparent'}
          `}
        >
          <span className={`text-xs font-mono font-semibold ${getMethodColor(tab.request.method)}`}>
            {tab.request.method}
          </span>
          <span className="text-sm max-w-[150px] truncate">
            {tab.request.name}
            {tab.isDirty && <span className="text-yellow-500 ml-1">*</span>}
          </span>
          <button
            onClick={(e) => handleCloseTab(e, tab.id)}
            className="text-muted-foreground hover:text-foreground ml-2"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
