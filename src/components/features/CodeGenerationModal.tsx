import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { codeGenerators, languages, type CodeGenOptions } from '@/lib/codeGen';

interface CodeGenerationModalProps {
  options: CodeGenOptions;
  onClose: () => void;
}

export function CodeGenerationModal({ options, onClose }: CodeGenerationModalProps) {
  const [selectedLanguage, setSelectedLanguage] = useState('javascriptFetch');
  const [copied, setCopied] = useState(false);

  const generatedCode = (codeGenerators as any)[selectedLanguage](options);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg w-[800px] h-[600px] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-semibold">Generate Code</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>

        {/* Language Selector */}
        <div className="p-4 border-b border-border">
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="w-full p-2 bg-secondary border border-border rounded text-foreground"
          >
            {languages.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* Code Display */}
        <div className="flex-1 overflow-auto p-4 bg-secondary/50">
          <pre className="text-sm font-mono">
            <code>{generatedCode}</code>
          </pre>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex justify-end gap-2">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
          <Button onClick={handleCopy}>
            {copied ? 'Copied!' : 'Copy Code'}
          </Button>
        </div>
      </div>
    </div>
  );
}
