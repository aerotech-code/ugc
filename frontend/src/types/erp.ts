export interface Semester {
  id: string;
  institution_id: string;
  academic_year: string;
  name: string;
  status: 'active' | 'completed';
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface InternalExam {
  id: string;
  institution_id: string;
  academic_year: string;
  semester_id: string;
  course_id: string;
  name: string;
  max_marks: number;
  passing_marks: number;
  created_at: string;
}

export interface FinalExam extends InternalExam {
  exam_date: string | null;
}

export interface BackExam {
  id: string;
  semester_id: string;
  student_id: string;
  course_id: string;
  status: 'registered' | 'scheduled' | 'completed';
  created_at: string;
}

export interface ExamResult {
  id: string;
  semester_id: string;
  student_id: string;
  total_marks: number;
  grade: string;
  status: 'processing' | 'published';
  published_at: string | null;
}

export interface Transcription {
  id: string;
  student_id: string;
  status: 'requested' | 'approved' | 'rejected';
  requested_on: string;
  approved_on: string | null;
  approved_by: string | null;
}

export interface Syllabus {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  topics?: string[];
  created_at: string;
}

export interface Feedback {
  id: string;
  course_id: string;
  submitted_by: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface LeaveRecord {
  id: string;
  staff_id: string;
  leave_type: 'sick' | 'casual' | 'earned';
  start_date: string;
  end_date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface HelpDeskTicket {
  id: string;
  raised_by: string;
  category: string;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
}

export interface DashboardStats {
  semesters_count: number;
  final_exams_count: number;
  published_results_count: number;
}
