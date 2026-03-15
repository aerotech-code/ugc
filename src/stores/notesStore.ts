import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import type { Note, NoteVersion } from '@/types';

interface NotesState {
  notes: Note[];
  currentNote: Note | null;
  versions: NoteVersion[];
  isLoading: boolean;
  searchQuery: string;
  selectedTags: string[];
  
  // Actions
  fetchNotes: () => Promise<void>;
  fetchNote: (id: string) => Promise<Note | null>;
  createNote: (data: Partial<Note>) => Promise<Note | null>;
  updateNote: (id: string, data: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  addCollaborator: (noteId: string, userId: string) => Promise<void>;
  removeCollaborator: (noteId: string, userId: string) => Promise<void>;
  fetchVersions: (noteId: string) => Promise<void>;
  restoreVersion: (noteId: string, versionId: string) => Promise<void>;
  summarizeNote: (noteId: string) => Promise<string>;
  setSearchQuery: (query: string) => void;
  setSelectedTags: (tags: string[]) => void;
  getFilteredNotes: () => Note[];
}

// Mock initial notes
const MOCK_NOTES: Note[] = [
  {
    id: 'note-001',
    title: 'Introduction to Machine Learning',
    content: '<h2>Key Concepts</h2><p>Machine learning is a subset of artificial intelligence...</p><ul><li>Supervised Learning</li><li>Unsupervised Learning</li><li>Reinforcement Learning</li></ul>',
    authorId: 'stu-001',
    author: {
      id: 'stu-001',
      email: 'student@campus.edu',
      name: 'Alex Johnson',
      role: 'student',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    },
    collaborators: [],
    courseId: 'course-001',
    tags: ['AI', 'ML', 'Computer Science'],
    version: 1,
    isPublic: false,
    summary: 'Overview of machine learning types and applications.',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
  },
  {
    id: 'note-002',
    title: 'Calculus III - Vector Functions',
    content: '<h2>Vector-Valued Functions</h2><p>A vector-valued function is a function of the form...</p>',
    authorId: 'stu-001',
    author: {
      id: 'stu-001',
      email: 'student@campus.edu',
      name: 'Alex Johnson',
      role: 'student',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    },
    collaborators: ['tea-001'],
    courseId: 'course-002',
    tags: ['Math', 'Calculus'],
    version: 3,
    isPublic: true,
    createdAt: new Date('2024-02-05'),
    updatedAt: new Date('2024-02-10'),
  },
  {
    id: 'note-003',
    title: 'Database Design Principles',
    content: '<h2>Normalization</h2><p>Database normalization is the process of organizing data...</p>',
    authorId: 'tea-001',
    author: {
      id: 'tea-001',
      email: 'teacher@campus.edu',
      name: 'Dr. Sarah Chen',
      role: 'teacher',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      createdAt: new Date('2023-08-01'),
      updatedAt: new Date('2023-08-01'),
    },
    collaborators: [],
    courseId: 'course-003',
    tags: ['Database', 'SQL', 'Computer Science'],
    version: 2,
    isPublic: true,
    summary: 'Database normalization principles and best practices.',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-25'),
  },
];

const MOCK_VERSIONS: NoteVersion[] = [
  {
    id: 'ver-001',
    noteId: 'note-002',
    content: '<h2>Vector Functions</h2><p>Initial draft...</p>',
    version: 1,
    createdBy: 'stu-001',
    createdAt: new Date('2024-02-05'),
  },
  {
    id: 'ver-002',
    noteId: 'note-002',
    content: '<h2>Vector-Valued Functions</h2><p>Added more details...</p>',
    version: 2,
    createdBy: 'stu-001',
    createdAt: new Date('2024-02-08'),
  },
];

export const useNotesStore = create<NotesState>()(
  persist(
    (set, get) => ({
      notes: MOCK_NOTES,
      currentNote: null,
      versions: [],
      isLoading: false,
      searchQuery: '',
      selectedTags: [],

      fetchNotes: async () => {
        set({ isLoading: true });
        try {
          const res = await apiGet<Note[]>('/notes');
          if (res.success && res.data) {
            set({ notes: res.data, isLoading: false });
          } else {
            set({ isLoading: false });
          }
        } catch {
          set({ isLoading: false });
        }
      },

      fetchNote: async (id: string) => {
        set({ isLoading: true });
        try {
          const res = await apiGet<Note>(`/notes/${id}`);
          if (!res.success && res.error && res.error.toLowerCase().includes('too many')) {
            console.warn('fetchNote rate limited, using local copy');
            const note = get().notes.find(n => n.id === id) || null;
            set({ currentNote: note, isLoading: false });
            return note;
          }

          if (res.success && res.data) {
            set({ currentNote: res.data, isLoading: false });
            return res.data;
          } else {
            const note = get().notes.find(n => n.id === id) || null;
            set({ currentNote: note, isLoading: false });
            return note;
          }
        } catch {
          const note = get().notes.find(n => n.id === id) || null;
          set({ currentNote: note, isLoading: false });
          return note;
        }
      },

      createNote: async (data: Partial<Note>) => {
        set({ isLoading: true });
        try {
          const res = await apiPost<Note>('/notes', data);
          if (res.success && res.data) {
            set(state => ({
              notes: [res.data!, ...state.notes],
              isLoading: false,
            }));
            return res.data;
          } else {
            const newNote: Note = {
              id: `note-${Date.now()}`,
              title: data.title || 'Untitled Note',
              content: data.content || '',
              authorId: data.authorId || 'stu-001',
              author: data.author || MOCK_NOTES[0].author,
              collaborators: data.collaborators || [],
              courseId: data.courseId,
              tags: data.tags || [],
              version: 1,
              isPublic: data.isPublic || false,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            
            set(state => ({
              notes: [newNote, ...state.notes],
              isLoading: false,
            }));
            
            return newNote;
          }
        } catch {
          const newNote: Note = {
            id: `note-${Date.now()}`,
            title: data.title || 'Untitled Note',
            content: data.content || '',
            authorId: data.authorId || 'stu-001',
            author: data.author || MOCK_NOTES[0].author,
            collaborators: data.collaborators || [],
            courseId: data.courseId,
            tags: data.tags || [],
            version: 1,
            isPublic: data.isPublic || false,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          
          set(state => ({
            notes: [newNote, ...state.notes],
            isLoading: false,
          }));
          
          return newNote;
        }
      },

      updateNote: async (id: string, data: Partial<Note>) => {
        set({ isLoading: true });
        try {
          const res = await apiPut<Note>(`/notes/${id}`, data);
          if (!res.success) {
            // if rate limited, quietly ignore and leave local copy intact
            if (res.error && res.error.toLowerCase().includes('too many')) {
              console.warn('updateNote rate limited, skipping server sync');
              set({ isLoading: false });
              return;
            }
          }

          if (res.success && res.data) {
            set(state => ({
              notes: state.notes.map(note =>
                note.id === id ? res.data! : note
              ),
              currentNote: state.currentNote?.id === id ? res.data! : state.currentNote,
              isLoading: false,
            }));
          } else {
            set(state => ({
              notes: state.notes.map(note =>
                note.id === id
                  ? { ...note, ...data, version: note.version + 1, updatedAt: new Date() }
                  : note
              ),
              currentNote: state.currentNote?.id === id
                ? { ...state.currentNote, ...data, version: state.currentNote.version + 1, updatedAt: new Date() }
                : state.currentNote,
              isLoading: false,
            }));
          }
        } catch (err) {
          console.error('updateNote error', err);
          set(state => ({
            notes: state.notes.map(note =>
              note.id === id
                ? { ...note, ...data, version: note.version + 1, updatedAt: new Date() }
                : note
            ),
            currentNote: state.currentNote?.id === id
              ? { ...state.currentNote, ...data, version: state.currentNote.version + 1, updatedAt: new Date() }
              : state.currentNote,
            isLoading: false,
          }));
        }
      },

      deleteNote: async (id: string) => {
        set({ isLoading: true });
        try {
          await apiDelete<void>(`/notes/${id}`);
        } catch {
          // Ignore API errors
        } finally {
          set(state => ({
            notes: state.notes.filter(note => note.id !== id),
            currentNote: state.currentNote?.id === id ? null : state.currentNote,
            isLoading: false,
          }));
        }
      },

      addCollaborator: async (noteId: string, userId: string) => {
        try {
          await apiPost(`/notes/${noteId}/collaborators`, { userId });
        } catch {
          // Ignore errors
        }
        set(state => ({
          notes: state.notes.map(note =>
            note.id === noteId && !note.collaborators.includes(userId)
              ? { ...note, collaborators: [...note.collaborators, userId] }
              : note
          ),
        }));
      },

      removeCollaborator: async (noteId: string, userId: string) => {
        try {
          await apiDelete(`/notes/${noteId}/collaborators/${userId}`);
        } catch {
          // Ignore errors
        }
        set(state => ({
          notes: state.notes.map(note =>
            note.id === noteId
              ? { ...note, collaborators: note.collaborators.filter(id => id !== userId) }
              : note
          ),
        }));
      },

      fetchVersions: async (noteId: string) => {
        try {
          const res = await apiGet<NoteVersion[]>(`/notes/${noteId}/versions`);
          if (res.success && res.data) {
            set({ versions: res.data });
          }
        } catch {
          set({ versions: MOCK_VERSIONS.filter(v => v.noteId === noteId) });
        }
      },

      restoreVersion: async (noteId: string, versionId: string) => {
        set({ isLoading: true });
        try {
          await apiPost(`/notes/${noteId}/restore`, { versionId });
          const version = MOCK_VERSIONS.find(v => v.id === versionId);
          if (version) {
            set(state => ({
              notes: state.notes.map(note =>
                note.id === noteId
                  ? { ...note, content: version.content, version: note.version + 1, updatedAt: new Date() }
                  : note
              ),
              isLoading: false,
            }));
          } else {
            set({ isLoading: false });
          }
        } catch {
          set({ isLoading: false });
        }
      },

      summarizeNote: async (noteId: string) => {
        try {
          const note = get().notes.find(n => n.id === noteId);
          const body = { content: note?.content || '' };
          const res = await apiPost<{ summary: string }>(`/notes/${noteId}/summarize`, body);
          const summary = res.data?.summary || '';
          set(state => ({
            notes: state.notes.map(note =>
              note.id === noteId ? { ...note, summary } : note
            ),
          }));
          return summary;
        } catch {
          const summaries: Record<string, string> = {
            'note-001': 'Overview of machine learning types including supervised, unsupervised, and reinforcement learning.',
            'note-002': 'Vector-valued functions and their applications in multivariable calculus.',
            'note-003': 'Database normalization principles for efficient data organization.',
          };
          
          const summary = summaries[noteId] || 'This note contains important educational content.';
          
          set(state => ({
            notes: state.notes.map(note =>
              note.id === noteId ? { ...note, summary } : note
            ),
          }));
          
          return summary;
        }
      },

      setSearchQuery: (query: string) => {
        set({ searchQuery: query });
      },

      setSelectedTags: (tags: string[]) => {
        set({ selectedTags: tags });
      },

      getFilteredNotes: () => {
        const { notes, searchQuery, selectedTags } = get();
        
        return notes.filter(note => {
          const matchesSearch = !searchQuery ||
            note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            note.content.toLowerCase().includes(searchQuery.toLowerCase());
          
          const matchesTags = selectedTags.length === 0 ||
            selectedTags.some(tag => note.tags.includes(tag));
          
          return matchesSearch && matchesTags;
        });
      },
    }),
    {
      name: 'campus-notes-storage',
      partialize: (state) => ({
        notes: state.notes,
      }),
    }
  )
);
