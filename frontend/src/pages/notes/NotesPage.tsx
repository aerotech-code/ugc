import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Edit3,
  Lock,
  Globe,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageSkeleton } from '@/components/common/Skeletons';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useNotesStore } from '@/stores';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export function NotesPage() {
  const navigate = useNavigate();
  const { notes, deleteNote, isLoading } = useNotesStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  // Filter notes
  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort by date
  const sortedNotes = filteredNotes.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  const handleDelete = async () => {
    if (!selectedNoteId) return;

    try {
      await deleteNote(selectedNoteId);
      toast.success('Note deleted successfully');
      setSelectedNoteId(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error deleting note');
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  if (isLoading) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-edu-purple-900">My Notes</h1>
          <p className="text-edu-purple-600 mt-1">Create and organize your study notes</p>
        </div>
        <Button
          onClick={() => navigate('/notes/new')}
          className="bg-edu-purple-600 hover:bg-edu-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Note
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-edu-purple-400" />
        <Input
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Notes Grid */}
      {sortedNotes.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-edu-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Edit3 className="w-8 h-8 text-edu-purple-500" />
          </div>
          <h3 className="text-lg font-semibold text-edu-purple-900 mb-1">No notes yet</h3>
          <p className="text-edu-purple-600 mb-6">Create your first note to get started</p>
          <Button
            onClick={() => navigate('/notes/new')}
            className="bg-edu-purple-600 hover:bg-edu-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Note
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedNotes.map((note) => (
            <Card
              key={note.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/notes/${note.id}`)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-edu-purple-900 flex-1 line-clamp-2">
                    {note.title || 'Untitled Note'}
                  </h3>
                  <div className="flex gap-2 ml-2">
                    {note.isPublic ? (
                      <Globe title="Public note" className="w-4 h-4 text-edu-green-600" />
                    ) : (
                      <Lock title="Private note" className="w-4 h-4 text-edu-purple-300" />
                    )}
                  </div>
                </div>

                <p className="text-edu-purple-700 text-sm line-clamp-3 mb-3">
                  {note.content || 'No content'}
                </p>

                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {note.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {note.tags.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{note.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs text-edu-purple-600 border-t border-edu-purple-100 pt-3">
                  <Clock className="w-3 h-3" />
                  {formatDate(new Date(note.updatedAt))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete Note?"
        description="This action cannot be undone. The note will be permanently deleted."
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
        onConfirm={handleDelete}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setSelectedNoteId(null);
        }}
      />
    </div>
  );
}
