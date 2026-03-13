import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Save,
  ArrowLeft,
  Share2,
  Users,
  Clock,
  MoreVertical,
  Sparkles,
  History,
  Globe,
  Lock,
  Tag,
  Check,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useNotesStore, useAuthStore } from '@/stores';
import { formatDateTime, debounce } from '@/lib/utils';
import { toast } from 'sonner';
import type { Note } from '@/types';

// Simple rich text editor component
function RichTextEditor({
  content,
  onChange,
}: {
  content: string;
  onChange: (html: string) => void;
}) {
  return (
    <div
      className="min-h-[400px] p-4 prose prose-sm max-w-none focus:outline-none"
      contentEditable
      suppressContentEditableWarning
      onInput={(e) => onChange(e.currentTarget.innerHTML)}
      dangerouslySetInnerHTML={{ __html: content }}
      style={{ outline: 'none' }}
    />
  );
}

export function NoteEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    notes,
    currentNote,
    versions,

    fetchNote,
    createNote,
    updateNote,
    fetchVersions,
    restoreVersion,
    summarizeNote,
  } = useNotesStore();

  const isNew = id === 'new';

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isVersionDialogOpen, setIsVersionDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

  // Load note data when the route changes. we deliberately omit `notes` from the
  // dependency list so that updating the local copy doesn't trigger another fetch
  // (that was causing a storm of GET requests during auto‑save).
  useEffect(() => {
    if (isNew) {
      setTitle('');
      setContent('');
      setTags([]);
      setIsPublic(false);
    } else if (id) {
      const note = notes.find(n => n.id === id);
      if (note) {
        setTitle(note.title);
        setContent(note.content);
        setTags(note.tags);
        setIsPublic(note.isPublic);
      }
      // always request latest from backend once per load
      fetchNote(id);
    }
  }, [id, isNew, fetchNote]);

  // Auto-save functionality
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const autoSave = useCallback(
    (data: Partial<Note>) => {
      if (isNew) return;
      
      const save = async () => {
        try {
          if (id) {
            await updateNote(id, data);
            setLastSaved(new Date());
          }
        } catch {
          // Silent fail for auto-save
        }
      };
      
      // bump debounce to 5 seconds so we don't hit the rate limiter during active
      // editing; the store already keeps a local copy so the app feels instant.
      const debouncedSave = debounce(() => save(), 5000);
      debouncedSave();
    },
    [id, isNew, updateNote]
  );

  // Trigger auto-save when content changes
  useEffect(() => {
    if (!isNew && id) {
      autoSave({ title, content, tags, isPublic });
    }
  }, [title, content, tags, isPublic, autoSave, isNew, id]);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    setIsSaving(true);

    try {
      if (isNew) {
        const newNote = await createNote({
          title,
          content,
          tags,
          isPublic,
          authorId: user?.id || '',
          author: user || undefined,
        });
        toast.success('Note created successfully');
        if (newNote) {
          navigate(`/notes/${newNote.id}`);
        }
      } else if (id) {
        await updateNote(id, { title, content, tags, isPublic });
        setLastSaved(new Date());
        toast.success('Note saved successfully');
      }
    } catch {
      toast.error('Failed to save note');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      if (!tags.includes(newTag.trim())) {
        setTags([...tags, newTag.trim()]);
      }
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSummarize = async () => {
    if (!id || isNew) return;
    
    try {
      toast.promise(summarizeNote(id), {
        loading: 'AERO AI is analyzing your note...',
        success: 'Summary generated!',
        error: 'Failed to generate summary',
      });
    } catch {
      toast.error('Failed to summarize note');
    }
  };

  const handleViewVersions = async () => {
    if (!id || isNew) return;
    
    await fetchVersions(id);
    setIsVersionDialogOpen(true);
  };

  const handleRestoreVersion = async (versionId: string) => {
    if (!id) return;
    
    try {
      await restoreVersion(id, versionId);
      toast.success('Version restored');
      setIsVersionDialogOpen(false);
      // Reload the note
      const note = notes.find(n => n.id === id);
      if (note) {
        setContent(note.content);
      }
    } catch {
      toast.error('Failed to restore version');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/notes')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note Title"
              className="text-xl font-semibold border-0 bg-transparent px-0 focus-visible:ring-0 placeholder:text-gray-400"
            />
            {lastSaved && (
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Last saved {formatDateTime(lastSaved)}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* AI Actions */}
          {!isNew && (
            <Button variant="outline" size="sm" onClick={handleSummarize}>
              <Sparkles className="w-4 h-4 mr-2" />
              Summarize
            </Button>
          )}

          {/* Share Button */}
          {!isNew && (
            <Button variant="outline" size="sm" onClick={() => setIsShareDialogOpen(true)}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          )}

          {/* More Actions */}
          {!isNew && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleViewVersions}>
                  <History className="w-4 h-4 mr-2" />
                  Version History
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/notes')}>
                  <X className="w-4 h-4 mr-2" />
                  Close
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Save Button */}
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isNew ? 'Create' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Settings Bar */}
      <div className="flex flex-wrap items-center gap-4 py-3 border-y border-gray-100">
        {/* Privacy Toggle */}
        <div className="flex items-center gap-2">
          <Switch
            id="public"
            checked={isPublic}
            onCheckedChange={setIsPublic}
            title={isPublic ? 'Note is public' : 'Note is private'}
          />
          <Label htmlFor="public" className="flex items-center gap-1 text-sm cursor-pointer">
            {isPublic ? (
              <>
                <Globe title="Public" className="w-4 h-4" />
                Public
              </>
            ) : (
              <>
                <Lock title="Private" className="w-4 h-4" />
                Private
              </>
            )}
          </Label>
        </div>

        {/* Tags */}
        <div className="flex items-center gap-2 flex-1">
          <Tag className="w-4 h-4 text-gray-400" />
          <div className="flex flex-wrap items-center gap-1">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                {tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-red-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Add tag..."
              className="w-24 h-7 text-xs border-0 bg-transparent focus-visible:ring-0"
            />
          </div>
        </div>

        {/* Collaborators */}
        {!isNew && currentNote && (
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500">
              {currentNote.collaborators.length} collaborators
            </span>
          </div>
        )}
      </div>

      {/* Editor */}
      <Card>
        <CardContent className="p-0">
          <RichTextEditor content={content} onChange={setContent} />
        </CardContent>
      </Card>

      {/* Summary (generated by AI) */}
      {currentNote?.summary && (
        <Card className="mt-4 border-edu-blue-200">
          <CardContent>
            <h3 className="font-semibold text-lg mb-2">Summary</h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {currentNote.summary}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Version History Dialog */}
      <Dialog open={isVersionDialogOpen} onOpenChange={setIsVersionDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Version History</DialogTitle>
            <DialogDescription>
              View and restore previous versions of this note.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {versions.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No previous versions</p>
            ) : (
              versions.map((version) => (
                <div
                  key={version.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-sm">Version {version.version}</p>
                    <p className="text-xs text-gray-500">
                      {formatDateTime(version.createdAt)}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRestoreVersion(version.id)}
                  >
                    Restore
                  </Button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Note</DialogTitle>
            <DialogDescription>
              Share this note with others to collaborate.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Share Link</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={`${window.location.origin}/notes/${id}`}
                  readOnly
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/notes/${id}`);
                    toast.success('Link copied!');
                  }}
                >
                  <Check className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div>
              <Label>Collaborators</Label>
              <p className="text-sm text-gray-500 mt-1">
                Feature coming soon - invite others to edit this note.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
