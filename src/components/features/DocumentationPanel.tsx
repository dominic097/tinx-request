import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { commentsService, type Comment } from '@/lib/storage/comments';
import { examplesService, type RequestExample } from '@/lib/storage/examples';

interface DocumentationPanelProps {
  requestId: string;
  requestName: string;
  description?: string;
  onDescriptionChange: (description: string) => void;
  lastResponse?: any;
}

export function DocumentationPanel({
  requestId,
  requestName,
  description = '',
  onDescriptionChange,
  lastResponse,
}: DocumentationPanelProps) {
  const [activeTab, setActiveTab] = useState<'description' | 'examples' | 'comments'>('description');
  const [descriptionText, setDescriptionText] = useState(description);
  const [comments, setComments] = useState<Comment[]>([]);
  const [examples, setExamples] = useState<RequestExample[]>([]);
  const [newComment, setNewComment] = useState('');
  const [exampleName, setExampleName] = useState('');

  useEffect(() => {
    loadComments();
    loadExamples();
  }, [requestId]);

  const loadComments = async () => {
    const data = await commentsService.getByRequestId(requestId);
    setComments(data);
  };

  const loadExamples = async () => {
    const data = await examplesService.getByRequestId(requestId);
    setExamples(data);
  };

  const handleSaveDescription = () => {
    onDescriptionChange(descriptionText);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    await commentsService.create(requestId, 'current-user', 'You', newComment);
    setNewComment('');
    loadComments();
  };

  const handleDeleteComment = async (id: string) => {
    await commentsService.delete(id);
    loadComments();
  };

  const handleSaveAsExample = async () => {
    if (!exampleName.trim() || !lastResponse) return;
    // You would pass the actual request data here
    await examplesService.create(
      requestId,
      exampleName,
      { method: 'GET', url: '', headers: {}, body: '' },
      lastResponse
    );
    setExampleName('');
    loadExamples();
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="flex flex-col h-full border-t border-border">
      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-4 px-4">
          {['Description', 'Examples', 'Comments'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase() as any)}
              className={`py-3 px-2 border-b-2 transition-colors ${
                activeTab === tab.toLowerCase()
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab}
              {tab === 'Comments' && comments.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                  {comments.length}
                </span>
              )}
              {tab === 'Examples' && examples.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                  {examples.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'description' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-2">Description</h3>
              <p className="text-xs text-muted-foreground mb-2">
                Add documentation for this request using Markdown
              </p>
              <textarea
                value={descriptionText}
                onChange={(e) => setDescriptionText(e.target.value)}
                placeholder="Describe what this request does, authentication requirements, expected responses, etc."
                className="w-full h-64 p-3 bg-secondary text-foreground rounded border border-border text-sm resize-none"
              />
              <Button onClick={handleSaveDescription} className="mt-2">
                Save Description
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'examples' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-2">Request Examples</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Save different request/response examples to document various scenarios
              </p>

              {lastResponse && (
                <div className="mb-4 p-3 bg-secondary rounded border border-border">
                  <p className="text-xs text-muted-foreground mb-2">Save current response as example:</p>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Example name (e.g., 'Success response')"
                      value={exampleName}
                      onChange={(e) => setExampleName(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={handleSaveAsExample}>Save Example</Button>
                  </div>
                </div>
              )}

              {examples.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No examples yet. Send a request and save it as an example.
                </p>
              ) : (
                <div className="space-y-2">
                  {examples.map((example) => (
                    <div key={example.id} className="p-3 bg-secondary rounded border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm">{example.name}</h4>
                        <button
                          onClick={() => examplesService.delete(example.id).then(loadExamples)}
                          className="text-destructive text-sm hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                      <div className="text-xs space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-green-500 font-mono">{example.response.status}</span>
                          <span className="text-muted-foreground">{example.response.time}ms</span>
                        </div>
                        <p className="text-muted-foreground">{formatDate(example.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-2">Comments</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Leave notes and collaborate with your team
              </p>

              <div className="mb-4">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full h-24 p-3 bg-secondary text-foreground rounded border border-border text-sm resize-none mb-2"
                />
                <Button onClick={handleAddComment}>Add Comment</Button>
              </div>

              {comments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No comments yet. Be the first to add one!
                </p>
              ) : (
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <div key={comment.id} className="p-3 bg-secondary rounded border border-border">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-sm">{comment.userName}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-destructive text-sm hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
