// Unified Campus Grid - Type Definitions

// User Roles
export type UserRole = 'student' | 'teacher' | 'admin' | 'parent';

// Base User Interface
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Student Profile
export interface StudentProfile {
  id: string;
  userId: string;
  studentId: string;
  department: string;
  year: number;
  semester: number;
  gpa: number;
  credits: number;
  enrollmentDate: Date;
  expectedGraduation: Date;
  skills: Skill[];
  achievements: Achievement[];
}

// Teacher Profile
export interface TeacherProfile {
  id: string;
  userId: string;
  teacherId: string;
  department: string;
  designation: string;
  specialization: string[];
  joiningDate: Date;
  courses: string[];
}

// Skill & Achievement
export interface Skill {
  id: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category: string;
  verified: boolean;
  acquiredDate: Date;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  date: Date;
  type: 'academic' | 'extracurricular' | 'certification';
}

// Aeronaut Notes
export interface Note {
  id: string;
  title: string;
  content: string;
  authorId: string;
  author: User;
  collaborators: string[];
  courseId?: string;
  tags: string[];
  version: number;
  isPublic: boolean;
  summary?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NoteVersion {
  id: string;
  noteId: string;
  content: string;
  version: number;
  createdBy: string;
  createdAt: Date;
}

// Course & LMS
export interface Course {
  id: string;
  code: string;
  title: string;
  description: string;
  instructorId: string;
  instructor: User;
  department: string;
  credits: number;
  semester: string;
  maxStudents: number;
  enrolledStudents: number;
  syllabus: string;
  materials: CourseMaterial[];
  schedule: CourseSchedule[];
  status: 'draft' | 'published' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseMaterial {
  id: string;
  courseId: string;
  title: string;
  type: 'pdf' | 'video' | 'link' | 'document';
  url: string;
  size?: number;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface CourseSchedule {
  day: string;
  startTime: string;
  endTime: string;
  room: string;
  type: 'lecture' | 'lab' | 'tutorial';
}

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  course: Course;
  enrolledAt: Date;
  status: 'active' | 'dropped' | 'completed';
  progress: number;
}

// Assignments
export interface Assignment {
  id: string;
  courseId: string;
  course: Course;
  title: string;
  description: string;
  type: 'essay' | 'quiz' | 'project' | 'code' | 'file';
  maxPoints: number;
  dueDate: Date;
  attachments: Attachment[];
  rubric?: Rubric;
  createdAt: Date;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
}

export interface Rubric {
  criteria: RubricCriteria[];
}

export interface RubricCriteria {
  name: string;
  description: string;
  points: number;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  student: User;
  content: string;
  attachments: Attachment[];
  submittedAt: Date;
  grade?: Grade;
  plagiarismScore?: number;
  aiFeedback?: string;
}

export interface Grade {
  id: string;
  submissionId: string;
  points: number;
  maxPoints: number;
  percentage: number;
  letterGrade: string;
  feedback: string;
  gradedBy: 'teacher' | 'ai' | 'auto';
  gradedAt: Date;
  rubricScores?: RubricScore[];
}

export interface RubricScore {
  criteriaId: string;
  points: number;
  comment?: string;
}

// Quiz System
export interface Quiz {
  id: string;
  courseId: string;
  title: string;
  description: string;
  timeLimit: number;
  maxAttempts: number;
  shuffleQuestions: boolean;
  showCorrectAnswers: boolean;
  questions: Question[];
  createdAt: Date;
}

export interface Question {
  id: string;
  quizId: string;
  type: 'mcq' | 'true_false' | 'short_answer' | 'coding';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
  order: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  answers: Record<string, string | string[]>;
  score: number;
  maxScore: number;
  startedAt: Date;
  submittedAt: Date;
  timeSpent: number;
  status: 'in_progress' | 'completed' | 'timed_out';
}

// Digital Textbook
export interface Textbook {
  id: string;
  title: string;
  author: string;
  subject: string;
  description: string;
  fileUrl: string;
  fileSize: number;
  pageCount: number;
  courseId?: string;
  uploadedBy: string;
  uploadedAt: Date;
  aiEnabled: boolean;
}

export interface TextbookChat {
  id: string;
  textbookId: string;
  userId: string;
  messages: ChatMessage[];
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: TextbookSource[];
}

export interface TextbookSource {
  page: number;
  text: string;
  confidence: number;
}

// Virtual Sandbox
export interface SandboxProject {
  id: string;
  name: string;
  description: string;
  language: string;
  files: CodeFile[];
  ownerId: string;
  assignmentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CodeFile {
  id: string;
  name: string;
  content: string;
  language: string;
  isMain: boolean;
}

export interface CodeExecution {
  id: string;
  projectId: string;
  code: string;
  language: string;
  input?: string;
  output?: string;
  error?: string;
  executionTime: number;
  memoryUsed: number;
  status: 'running' | 'success' | 'error' | 'timeout';
  executedAt: Date;
}

// Attendance
export interface Attendance {
  id: string;
  courseId: string;
  studentId: string;
  date: Date;
  status: 'present' | 'absent' | 'late' | 'excused';
  markedBy: string;
  markedAt: Date;
  notes?: string;
}

// ERP - Fee Management
export interface FeeStructure {
  id: string;
  name: string;
  description: string;
  amount: number;
  currency: string;
  frequency: 'one_time' | 'semester' | 'yearly' | 'monthly';
  applicableTo: UserRole[];
  dueDate: Date;
  lateFee?: number;
}

export interface FeePayment {
  id: string;
  studentId: string;
  feeStructureId: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue' | 'waived';
  paidAt?: Date;
  transactionId?: string;
  paymentMethod?: string;
  receiptUrl?: string;
}

// Inventory
export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  description: string;
  quantity: number;
  unit: string;
  location: string;
  condition: 'new' | 'good' | 'fair' | 'poor';
  assignedTo?: string;
  purchaseDate?: Date;
  warrantyExpiry?: Date;
}

// Resource Booking
export interface Resource {
  id: string;
  name: string;
  type: 'room' | 'equipment' | 'vehicle' | 'lab';
  capacity?: number;
  location: string;
  amenities: string[];
  availability: ResourceAvailability[];
}

export interface ResourceAvailability {
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface Booking {
  id: string;
  resourceId: string;
  resource: Resource;
  bookedBy: string;
  purpose: string;
  startTime: Date;
  endTime: Date;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  attendees?: number;
  notes?: string;
  createdAt: Date;
}

// Report Card & Skill Graph
export interface ReportCard {
  id: string;
  studentId: string;
  semester: string;
  year: number;
  courses: CourseGrade[];
  gpa: number;
  cgpa: number;
  totalCredits: number;
  remarks?: string;
  generatedAt: Date;
}

export interface CourseGrade {
  courseId: string;
  courseName: string;
  credits: number;
  internalMarks: number;
  externalMarks: number;
  totalMarks: number;
  grade: string;
  gradePoints: number;
}

export interface SkillGraph {
  studentId: string;
  skills: SkillNode[];
  connections: SkillConnection[];
  updatedAt: Date;
}

export interface SkillNode {
  id: string;
  name: string;
  category: string;
  level: number;
  maxLevel: number;
  x: number;
  y: number;
}

export interface SkillConnection {
  from: string;
  to: string;
  strength: number;
}

// AI Features
export interface AIFeature {
  id: string;
  name: string;
  description: string;
  module: string;
  status: 'active' | 'maintenance' | 'disabled';
  usageCount: number;
}

export interface AIRequest {
  id: string;
  featureId: string;
  userId: string;
  input: string;
  output?: string;
  processingTime?: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  createdAt: Date;
  completedAt?: Date;
}

// Notifications
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'assignment' | 'grade' | 'course' | 'system' | 'payment';
  read: boolean;
  actionUrl?: string;
  createdAt: Date;
}

// Dashboard Stats
export interface DashboardStats {
  totalCourses: number;
  activeAssignments: number;
  pendingSubmissions: number;
  averageGrade: number;
  attendanceRate: number;
  notesCreated: number;
  recentActivity: Activity[];
}

export interface Activity {
  id: string;
  userId: string;
  action: string;
  targetType: string;
  targetId: string;
  targetName: string;
  timestamp: Date;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

// WebSocket Events
export interface WSMessage {
  type: 'note_update' | 'collaborator_join' | 'collaborator_leave' | 'cursor_move' | 'chat_message' | 'notification';
  payload: unknown;
  timestamp: Date;
  senderId: string;
}
