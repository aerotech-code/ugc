import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from '@/stores';
import { Toaster } from '@/components/ui/sonner';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

// Layouts
import { MainLayout } from '@/components/layout/MainLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';

// Floating Chat
import { FloatingChatButton } from '@/components/chat/FloatingChatButton';
import { FloatingChatWindow } from '@/components/chat/FloatingChatWindow';

// Pages
import { LoginPage } from '@/pages/auth/LoginPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { NotesPage } from '@/pages/notes/NotesPage';
import { NoteEditorPage } from '@/pages/notes/NoteEditorPage';
import { CoursesPage } from '@/pages/courses/CoursesPage';
import { CourseDetailPage } from '@/pages/courses/CourseDetailPage';
import { AssignmentsPage } from '@/pages/assignments/AssignmentsPage';
import { AssignmentDetailPage } from '@/pages/assignments/AssignmentDetailPage';
import { QuizzesPage } from '@/pages/quizzes/QuizzesPage';
import { QuizTakingPage } from '@/pages/quizzes/QuizTakingPage';
import { TextbooksPage } from '@/pages/textbooks/TextbooksPage';
import { SandboxPage } from '@/pages/sandbox/SandboxPage';
import InstitutePage from '@/pages/institute/InstitutePage';
import { ERPLayout } from '@/components/erp/layout/ERPLayout';
import { ERPLoginPage } from '@/pages/erp/auth/LoginPage';
import { DashboardPage as ERPDashboardPage } from '@/pages/erp/dashboard/DashboardPage';
import { SemestersPage } from '@/pages/erp/semesters/SemestersPage';
import { ExamsPage } from '@/pages/erp/exams/ExamsPage';
import { ResultsPage } from '@/pages/erp/results/ResultsPage';
import { SyllabusPage } from '@/pages/erp/syllabus/SyllabusPage';
import { FeedbackPage } from '@/pages/erp/feedback/FeedbackPage';
import { LeaveRecordsPage } from '@/pages/erp/administrative/LeaveRecordsPage';
import { HelpDeskPage } from '@/pages/erp/administrative/HelpDeskPage';
import { ProfilePage } from '@/pages/profile/ProfilePage';
import { SettingsPage } from '@/pages/settings/SettingsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

// Public Route Component (redirects to dashboard if already logged in)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<AuthLayout />}>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
        </Route>

        {/* Protected Routes */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          
          {/* Notes Routes */}
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/notes/:id" element={<NoteEditorPage />} />
          <Route path="/notes/new" element={<NoteEditorPage />} />
          
          {/* Courses Routes */}
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:id" element={<CourseDetailPage />} />
          
          {/* Assignments Routes */}
          <Route path="/assignments" element={<AssignmentsPage />} />
          <Route path="/assignments/:id" element={<AssignmentDetailPage />} />
          
          {/* Quizzes Routes */}
          <Route path="/quizzes" element={<QuizzesPage />} />
          <Route path="/quizzes/:id" element={<QuizTakingPage />} />
          
          {/* Textbooks Routes */}
          <Route path="/textbooks" element={<TextbooksPage />} />
          
          {/* Sandbox Routes */}
          <Route path="/sandbox" element={<SandboxPage />} />
          
          {/* ERP Routes */}
          <Route path="/erp/login" element={<ERPLoginPage />} />
          <Route path="/erp" element={<ERPLayout />}>
            <Route index element={<Navigate to="/erp/dashboard" replace />} />
            <Route path="dashboard" element={<ERPDashboardPage />} />
            <Route path="semesters" element={<SemestersPage />} />
            <Route path="exams" element={<ExamsPage />} />
            <Route path="results" element={<ResultsPage />} />
            <Route path="syllabus" element={<SyllabusPage />} />
            <Route path="feedback" element={<FeedbackPage />} />
            <Route path="leave" element={<LeaveRecordsPage />} />
            <Route path="helpdesk" element={<HelpDeskPage />} />
          </Route>
          {/* Institute Management Routes */}
          <Route path="/institute" element={<InstitutePage />} />
          
          {/* Profile & Settings */}
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Redirects */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
        </Routes>
      
      <Toaster position="top-right" richColors />

      {/* Floating Chat */}
      <FloatingChatButton
        onClick={() => setIsChatOpen(true)}
        isOpen={isChatOpen}
      />
      <FloatingChatWindow
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
