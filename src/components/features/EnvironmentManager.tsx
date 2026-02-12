import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEnvironmentsStore } from '@/stores/environments';

interface EnvironmentManagerProps {
  onClose: () => void;
}

export function EnvironmentManager({ onClose }: EnvironmentManagerProps) {
  const {
    environments,
    fetchEnvironments,
    createEnvironment,
    updateEnvironment,
    deleteEnvironment,
    setActiveEnvironment,
  } = useEnvironmentsStore();

  const [selectedEnvId, setSelectedEnvId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newEnvName, setNewEnvName] = useState('');
  const [variables, setVariables] = useState<Array<{ key: string; value: string; enabled: boolean }>>([]);

  useEffect(() => {
    fetchEnvironments();
  }, [fetchEnvironments]);

  useEffect(() => {
    const env = environments.find(e => e.id === selectedEnvId);
    if (env) {
      setVariables(env.variables.map(v => ({ key: v.key, value: v.value, enabled: v.enabled })));
    } else if (selectedEnvId === null) {
      setVariables([{ key: '', value: '', enabled: true }]);
    }
  }, [selectedEnvId, environments]);

  const handleCreateEnvironment = async () => {
    if (!newEnvName.trim()) return;
    
    try {
      const env = await createEnvironment(newEnvName.trim());
      setSelectedEnvId(env.id);
      setNewEnvName('');
      setIsCreating(false);
    } catch (error) {
      console.error('Failed to create environment:', error);
    }
  };

  const handleSaveVariables = async () => {
    if (!selectedEnvId) return;

    const validVariables = variables
      .filter(v => v.key.trim())
      .map((v, index) => ({
        id: `var-${index}`,
        key: v.key,
        value: v.value,
        type: 'default' as const,
        enabled: v.enabled,
      }));

    await updateEnvironment(selectedEnvId, { variables: validVariables });
    alert('Variables saved successfully!');
  };

  const handleDeleteEnvironment = async (id: string) => {
    if (confirm('Delete this environment?')) {
      await deleteEnvironment(id);
      setSelectedEnvId(null);
    }
  };

  const handleSetActive = async (id: string) => {
    await setActiveEnvironment(id);
  };

  const addVariable = () => {
    setVariables([...variables, { key: '', value: '', enabled: true }]);
  };

  const updateVariable = (index: number, field: 'key' | 'value' | 'enabled', value: string | boolean) => {
    const newVars = [...variables];
    newVars[index] = { ...newVars[index], [field]: value };
    setVariables(newVars);
  };

  const removeVariable = (index: number) => {
    setVariables(variables.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg w-[800px] h-[600px] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-semibold">Manage Environments</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Environment List */}
          <div className="w-64 border-r border-border flex flex-col">
            <div className="p-2 border-b border-border">
              {isCreating ? (
                <div className="flex gap-1">
                  <Input
                    type="text"
                    placeholder="Environment name"
                    value={newEnvName}
                    onChange={(e) => setNewEnvName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateEnvironment();
                      if (e.key === 'Escape') setIsCreating(false);
                    }}
                    className="h-8 text-sm"
                    autoFocus
                  />
                  <Button onClick={handleCreateEnvironment} size="sm" className="h-8 px-2">
                    ✓
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setIsCreating(true)} size="sm" className="w-full">
                  + New Environment
                </Button>
              )}
            </div>

            <div className="flex-1 overflow-auto">
              {environments.map((env) => (
                <div
                  key={env.id}
                  className={`p-2 cursor-pointer hover:bg-secondary border-b border-border ${
                    selectedEnvId === env.id ? 'bg-secondary' : ''
                  }`}
                  onClick={() => setSelectedEnvId(env.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {env.isActive && (
                        <span className="text-green-500 text-xs">●</span>
                      )}
                      <span className="text-sm truncate">{env.name}</span>
                    </div>
                    <div className="flex gap-1">
                      {!env.isActive && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSetActive(env.id);
                          }}
                          className="text-xs text-muted-foreground hover:text-primary"
                          title="Set as active"
                        >
                          ○
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteEnvironment(env.id);
                        }}
                        className="text-xs text-destructive hover:text-destructive/80"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel - Variables */}
          <div className="flex-1 flex flex-col">
            {selectedEnvId ? (
              <>
                <div className="p-4 border-b border-border">
                  <h3 className="font-semibold text-sm">
                    {environments.find(e => e.id === selectedEnvId)?.name}
                  </h3>
                </div>

                <div className="flex-1 overflow-auto p-4">
                  <div className="space-y-2">
                    <div className="grid grid-cols-12 gap-2 text-sm text-muted-foreground mb-2">
                      <div className="col-span-5">Variable</div>
                      <div className="col-span-5">Value</div>
                      <div className="col-span-2"></div>
                    </div>

                    {variables.map((variable, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2">
                        <div className="col-span-5">
                          <Input
                            type="text"
                            placeholder="Variable name"
                            value={variable.key}
                            onChange={(e) => updateVariable(index, 'key', e.target.value)}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="col-span-5">
                          <Input
                            type="text"
                            placeholder="Variable value"
                            value={variable.value}
                            onChange={(e) => updateVariable(index, 'value', e.target.value)}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="col-span-2 flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={variable.enabled}
                            onChange={(e) => updateVariable(index, 'enabled', e.target.checked)}
                            className="w-4 h-4"
                          />
                          <button
                            onClick={() => removeVariable(index)}
                            className="text-destructive hover:text-destructive/80"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}

                    <Button onClick={addVariable} variant="outline" size="sm">
                      + Add Variable
                    </Button>
                  </div>
                </div>

                <div className="p-4 border-t border-border flex justify-end gap-2">
                  <Button onClick={onClose} variant="outline">
                    Cancel
                  </Button>
                  <Button onClick={handleSaveVariables}>
                    Save Variables
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <p>Select an environment to manage variables</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}