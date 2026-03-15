import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import type { Assignment, Submission, Grade, Quiz, QuizAttempt } from '@/types';

interface AssignmentsState {
  assignments: Assignment[];
  submissions: Submission[];
  quizzes: Quiz[];
  quizAttempts: QuizAttempt[];
  currentAssignment: Assignment | null;
  currentQuiz: Quiz | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchAssignments: (courseId?: string) => Promise<void>;
  fetchAssignment: (id: string) => Promise<Assignment | null>;
  createAssignment: (data: Partial<Assignment>) => Promise<Assignment | null>;
  updateAssignment: (id: string, data: Partial<Assignment>) => Promise<boolean>;
  deleteAssignment: (id: string) => Promise<boolean>;
  submitAssignment: (assignmentId: string, content: string, files?: File[]) => Promise<boolean>;
  gradeSubmission: (submissionId: string, grade: Partial<Grade>) => Promise<boolean>;
  fetchQuizzes: (courseId?: string) => Promise<void>;
  fetchQuiz: (id: string) => Promise<Quiz | null>;
  createQuiz: (data: Partial<Quiz>) => Promise<Quiz | null>;
  startQuizAttempt: (quizId: string, studentId: string) => Promise<QuizAttempt | null>;
  submitQuizAttempt: (attemptId: string, answers: Record<string, string | string[]>) => Promise<boolean>;
  checkPlagiarism: (submissionId: string) => Promise<number | null>;
  clearError: () => void;
}

export const useAssignmentsStore = create<AssignmentsState>()(
  persist(
    (set) => ({
      assignments: [],
      submissions: [],
      quizzes: [],
      quizAttempts: [],
      currentAssignment: null,
      currentQuiz: null,
      isLoading: false,
      error: null,

      clearError: () => set({ error: null }),

      fetchAssignments: async (courseId?: string) => {
        set({ isLoading: true, error: null });
        try {
          const endpoint = courseId 
            ? `/assignments?courseId=${courseId}` 
            : '/assignments';
          const res = await apiGet<Assignment[]>(endpoint);
          
          if (res.success && res.data) {
            set({ 
              assignments: res.data,
              isLoading: false 
            });
          } else {
            set({ 
              error: res.error || 'Failed to fetch assignments',
              isLoading: false 
            });
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch assignments',
            isLoading: false 
          });
        }
      },

      fetchAssignment: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const res = await apiGet<Assignment>(`/assignments/${id}`);
          
          if (res.success && res.data) {
            set({ currentAssignment: res.data, isLoading: false });
            return res.data;
          } else {
            set({ 
              error: res.error || 'Failed to fetch assignment',
              isLoading: false 
            });
            return null;
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch assignment',
            isLoading: false 
          });
          return null;
        }
      },

      createAssignment: async (data: Partial<Assignment>) => {
        set({ isLoading: true, error: null });
        try {
          const res = await apiPost<Assignment>('/assignments', data);
          
          if (res.success && res.data) {
            set((state) => ({
              assignments: [...state.assignments, res.data!],
              isLoading: false,
            }));
            return res.data;
          } else {
            set({ 
              error: res.error || 'Failed to create assignment',
              isLoading: false 
            });
            return null;
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to create assignment',
            isLoading: false 
          });
          return null;
        }
      },

      updateAssignment: async (id: string, data: Partial<Assignment>) => {
        set({ isLoading: true, error: null });
        try {
          const res = await apiPut<Assignment>(`/assignments/${id}`, data);
          
          if (res.success) {
            set((state) => ({
              assignments: state.assignments.map(a => 
                a.id === id ? { ...a, ...data } : a
              ),
              currentAssignment: state.currentAssignment?.id === id 
                ? { ...state.currentAssignment, ...data }
                : state.currentAssignment,
              isLoading: false,
            }));
            return true;
          } else {
            set({ 
              error: res.error || 'Failed to update assignment',
              isLoading: false 
            });
            return false;
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update assignment',
            isLoading: false 
          });
          return false;
        }
      },

      deleteAssignment: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const res = await apiDelete<void>(`/assignments/${id}`);
          
          if (res.success) {
            set((state) => ({
              assignments: state.assignments.filter(a => a.id !== id),
              isLoading: false,
            }));
            return true;
          } else {
            set({ 
              error: res.error || 'Failed to delete assignment',
              isLoading: false 
            });
            return false;
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete assignment',
            isLoading: false 
          });
          return false;
        }
      },

      submitAssignment: async (assignmentId: string, content: string, files?: File[]) => {
        set({ isLoading: true, error: null });
        try {
          const formData = new FormData();
          formData.append('assignmentId', assignmentId);
          formData.append('content', content);
          
          if (files) {
            files.forEach((file) => {
              formData.append('files', file);
            });
          }

          // Use fetch directly for multipart/form-data
          const token = localStorage.getItem('auth-storage');
          let authHeader = '';
          if (token) {
            try {
              const parsed = JSON.parse(token);
              authHeader = parsed?.state?.token || '';
            } catch {
              // Ignore parse errors
            }
          }

          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'}/submissions`, {
            method: 'POST',
            headers: {
              ...(authHeader && { 'Authorization': `Bearer ${authHeader}` }),
            },
            body: formData,
          });

          const result = await response.json();

          if (response.ok) {
            const submission: Submission = result.data || result;
            set((state) => ({
              submissions: [...state.submissions, submission],
              isLoading: false,
            }));
            return true;
          } else {
            set({ 
              error: result.error || result.message || 'Failed to submit assignment',
              isLoading: false 
            });
            return false;
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to submit assignment',
            isLoading: false 
          });
          return false;
        }
      },

      gradeSubmission: async (submissionId: string, grade: Partial<Grade>) => {
        set({ isLoading: true, error: null });
        try {
          const res = await apiPut<Submission>(`/submissions/${submissionId}/grade`, grade);
          
          if (res.success && res.data) {
            set((state) => ({
              submissions: state.submissions.map(s => 
                s.id === submissionId ? { ...s, ...res.data! } : s
              ),
              isLoading: false,
            }));
            return true;
          } else {
            set({ 
              error: res.error || 'Failed to grade submission',
              isLoading: false 
            });
            return false;
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to grade submission',
            isLoading: false 
          });
          return false;
        }
      },

      fetchQuizzes: async (courseId?: string) => {
        set({ isLoading: true, error: null });
        try {
          const endpoint = courseId 
            ? `/quizzes?courseId=${courseId}` 
            : '/quizzes';
          const res = await apiGet<Quiz[]>(endpoint);
          
          if (res.success && res.data) {
            set({ quizzes: res.data, isLoading: false });
          } else {
            set({ 
              error: res.error || 'Failed to fetch quizzes',
              isLoading: false 
            });
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch quizzes',
            isLoading: false 
          });
        }
      },

      fetchQuiz: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const res = await apiGet<Quiz>(`/quizzes/${id}`);
          
          if (res.success && res.data) {
            set({ currentQuiz: res.data, isLoading: false });
            return res.data;
          } else {
            set({ 
              error: res.error || 'Failed to fetch quiz',
              isLoading: false 
            });
            return null;
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch quiz',
            isLoading: false 
          });
          return null;
        }
      },

      createQuiz: async (data: Partial<Quiz>) => {
        set({ isLoading: true, error: null });
        try {
          const res = await apiPost<Quiz>('/quizzes', data);
          
          if (res.success && res.data) {
            set((state) => ({
              quizzes: [...state.quizzes, res.data!],
              isLoading: false,
            }));
            return res.data;
          } else {
            set({ 
              error: res.error || 'Failed to create quiz',
              isLoading: false 
            });
            return null;
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to create quiz',
            isLoading: false 
          });
          return null;
        }
      },

      startQuizAttempt: async (quizId: string, studentId: string) => {
        set({ isLoading: true, error: null });
        try {
          const res = await apiPost<QuizAttempt>('/quiz-attempts', {
            quizId,
            studentId,
          });
          
          if (res.success && res.data) {
            set((state) => ({
              quizAttempts: [...state.quizAttempts, res.data!],
              isLoading: false,
            }));
            return res.data;
          } else {
            set({ 
              error: res.error || 'Failed to start quiz attempt',
              isLoading: false 
            });
            return null;
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to start quiz attempt',
            isLoading: false 
          });
          return null;
        }
      },

      submitQuizAttempt: async (attemptId: string, answers: Record<string, string | string[]>) => {
        set({ isLoading: true, error: null });
        try {
          const res = await apiPut<QuizAttempt>(`/quiz-attempts/${attemptId}/submit`, {
            answers,
          });
          
          if (res.success) {
            set((state) => ({
              quizAttempts: state.quizAttempts.map(a => 
                a.id === attemptId ? { ...a, answers, submittedAt: new Date() } : a
              ),
              isLoading: false,
            }));
            return true;
          } else {
            set({ 
              error: res.error || 'Failed to submit quiz',
              isLoading: false 
            });
            return false;
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to submit quiz',
            isLoading: false 
          });
          return false;
        }
      },

      checkPlagiarism: async (submissionId: string) => {
        set({ isLoading: true, error: null });
        try {
          const res = await apiPost<{ score: number }>(`/submissions/${submissionId}/plagiarism`, {});
          
          if (res.success && res.data) {
            set({ isLoading: false });
            return res.data.score;
          } else {
            set({ 
              error: res.error || 'Failed to check plagiarism',
              isLoading: false 
            });
            return null;
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to check plagiarism',
            isLoading: false 
          });
          return null;
        }
      },
    }),
    {
      name: 'assignments-store',
    }
  )
);
