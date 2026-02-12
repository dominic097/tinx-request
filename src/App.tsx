import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';

function App() {
  return (
    <MainLayout>
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Welcome to Tinx</h1>
          <p className="text-muted-foreground">
            A modern API testing and development tool
          </p>
          <div className="flex gap-2 justify-center">
            <Button>Create New Request</Button>
            <Button variant="outline">Import Collection</Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default App;
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
