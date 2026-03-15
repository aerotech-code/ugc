import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import type { Course, Enrollment, CourseMaterial } from '@/types';

interface CoursesState {
  courses: Course[];
  myCourses: Enrollment[];
  currentCourse: Course | null;
  isLoading: boolean;
  
  // Actions
  fetchCourses: () => Promise<void>;
  fetchMyCourses: (studentId: string) => Promise<void>;
  fetchCourse: (id: string) => Promise<Course | null>;
  createCourse: (data: Partial<Course>) => Promise<Course>;
  updateCourse: (id: string, data: Partial<Course>) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  enrollStudent: (courseId: string, studentId: string) => Promise<void>;
  dropCourse: (enrollmentId: string) => Promise<void>;
  addMaterial: (courseId: string, material: Partial<CourseMaterial>) => Promise<void>;
  removeMaterial: (courseId: string, materialId: string) => Promise<void>;
}

// Mock courses
const MOCK_COURSES: Course[] = [
  {
    id: 'course-001',
    code: 'CS-301',
    title: 'Introduction to Machine Learning',
    description: 'Fundamental concepts of machine learning including supervised and unsupervised learning algorithms.',
    instructorId: 'tea-001',
    instructor: {
      id: 'tea-001',
      email: 'teacher@campus.edu',
      name: 'Dr. Sarah Chen',
      role: 'teacher',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      createdAt: new Date('2023-08-01'),
      updatedAt: new Date('2023-08-01'),
    },
    department: 'Computer Science',
    credits: 3,
    semester: 'Spring 2024',
    maxStudents: 50,
    enrolledStudents: 42,
    syllabus: 'Introduction to ML, Linear Regression, Classification, Neural Networks, Deep Learning',
    materials: [
      {
        id: 'mat-001',
        courseId: 'course-001',
        title: 'Course Syllabus',
        type: 'pdf',
        url: '/materials/syllabus-ml.pdf',
        size: 250000,
        uploadedBy: 'tea-001',
        uploadedAt: new Date('2024-01-10'),
      },
    ],
    schedule: [
      { day: 'Monday', startTime: '09:00', endTime: '10:30', room: 'CS-101', type: 'lecture' },
      { day: 'Wednesday', startTime: '09:00', endTime: '10:30', room: 'CS-101', type: 'lecture' },
      { day: 'Friday', startTime: '14:00', endTime: '16:00', room: 'Lab-3', type: 'lab' },
    ],
    status: 'published',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05'),
  },
  {
    id: 'course-002',
    code: 'MATH-201',
    title: 'Calculus III',
    description: 'Multivariable calculus including vector functions, partial derivatives, and multiple integrals.',
    instructorId: 'tea-001',
    instructor: {
      id: 'tea-001',
      email: 'teacher@campus.edu',
      name: 'Dr. Sarah Chen',
      role: 'teacher',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      createdAt: new Date('2023-08-01'),
      updatedAt: new Date('2023-08-01'),
    },
    department: 'Mathematics',
    credits: 4,
    semester: 'Spring 2024',
    maxStudents: 60,
    enrolledStudents: 55,
    syllabus: 'Vector Functions, Partial Derivatives, Multiple Integrals, Vector Calculus',
    materials: [],
    schedule: [
      { day: 'Tuesday', startTime: '11:00', endTime: '12:30', room: 'MATH-205', type: 'lecture' },
      { day: 'Thursday', startTime: '11:00', endTime: '12:30', room: 'MATH-205', type: 'lecture' },
    ],
    status: 'published',
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03'),
  },
  {
    id: 'course-003',
    code: 'CS-205',
    title: 'Database Systems',
    description: 'Design and implementation of relational database systems with SQL and NoSQL concepts.',
    instructorId: 'tea-001',
    instructor: {
      id: 'tea-001',
      email: 'teacher@campus.edu',
      name: 'Dr. Sarah Chen',
      role: 'teacher',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      createdAt: new Date('2023-08-01'),
      updatedAt: new Date('2023-08-01'),
    },
    department: 'Computer Science',
    credits: 3,
    semester: 'Spring 2024',
    maxStudents: 45,
    enrolledStudents: 38,
    syllabus: 'Relational Model, SQL, Normalization, Transactions, NoSQL Databases',
    materials: [],
    schedule: [
      { day: 'Monday', startTime: '14:00', endTime: '15:30', room: 'CS-203', type: 'lecture' },
      { day: 'Wednesday', startTime: '14:00', endTime: '15:30', room: 'CS-203', type: 'lecture' },
    ],
    status: 'published',
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-08'),
  },
  {
    id: 'course-004',
    code: 'PHYS-101',
    title: 'Physics I: Mechanics',
    description: 'Introduction to classical mechanics including kinematics, dynamics, and energy.',
    instructorId: 'tea-001',
    instructor: {
      id: 'tea-001',
      email: 'teacher@campus.edu',
      name: 'Dr. Sarah Chen',
      role: 'teacher',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      createdAt: new Date('2023-08-01'),
      updatedAt: new Date('2023-08-01'),
    },
    department: 'Physics',
    credits: 4,
    semester: 'Spring 2024',
    maxStudents: 80,
    enrolledStudents: 72,
    syllabus: 'Kinematics, Newton\'s Laws, Work and Energy, Momentum, Rotational Motion',
    materials: [],
    schedule: [
      { day: 'Tuesday', startTime: '09:00', endTime: '10:30', room: 'PHYS-101', type: 'lecture' },
      { day: 'Thursday', startTime: '09:00', endTime: '10:30', room: 'PHYS-101', type: 'lecture' },
      { day: 'Friday', startTime: '10:00', endTime: '12:00', room: 'Lab-1', type: 'lab' },
    ],
    status: 'published',
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
];

const MOCK_ENROLLMENTS: Enrollment[] = [
  {
    id: 'enr-001',
    studentId: 'stu-001',
    courseId: 'course-001',
    course: MOCK_COURSES[0],
    enrolledAt: new Date('2024-01-15'),
    status: 'active',
    progress: 65,
  },
  {
    id: 'enr-002',
    studentId: 'stu-001',
    courseId: 'course-002',
    course: MOCK_COURSES[1],
    enrolledAt: new Date('2024-01-12'),
    status: 'active',
    progress: 45,
  },
  {
    id: 'enr-003',
    studentId: 'stu-001',
    courseId: 'course-003',
    course: MOCK_COURSES[2],
    enrolledAt: new Date('2024-01-18'),
    status: 'active',
    progress: 30,
  },
];

export const useCoursesStore = create<CoursesState>()(
  persist(
    (set, get) => ({
      courses: MOCK_COURSES,
      myCourses: MOCK_ENROLLMENTS,
      currentCourse: null,
      isLoading: false,

      fetchCourses: async () => {
        set({ isLoading: true });
        try {
          const res = await apiGet<Course[]>('/courses');
          if (res.success && res.data) {
            set({ courses: res.data, isLoading: false });
          } else {
            set({ isLoading: false });
          }
        } catch {
          set({ isLoading: false });
        }
      },

      fetchMyCourses: async (studentId: string) => {
        set({ isLoading: true });
        try {
          const res = await apiGet<Enrollment[]>(`/enrollments?studentId=${studentId}`);
          if (res.success && res.data) {
            set({ myCourses: res.data, isLoading: false });
          } else {
            set({ isLoading: false });
          }
        } catch {
          set({ isLoading: false });
        }
      },

      fetchCourse: async (id: string) => {
        set({ isLoading: true });
        try {
          const res = await apiGet<Course>(`/courses/${id}`);
          if (res.success && res.data) {
            set({ currentCourse: res.data, isLoading: false });
            return res.data;
          } else {
            const course = get().courses.find(c => c.id === id) || null;
            set({ currentCourse: course, isLoading: false });
            return course;
          }
        } catch {
          const course = get().courses.find(c => c.id === id) || null;
          set({ currentCourse: course, isLoading: false });
          return course;
        }
      },

      createCourse: async (data: Partial<Course>) => {
        set({ isLoading: true });
        try {
          const res = await apiPost<Course>('/courses', data);
          if (res.success && res.data) {
            set(state => ({
              courses: [...state.courses, res.data!],
              isLoading: false,
            }));
            return res.data;
          } else {
            const newCourse: Course = {
              id: `course-${Date.now()}`,
              code: data.code || 'NEW-001',
              title: data.title || 'New Course',
              description: data.description || '',
              instructorId: data.instructorId || 'tea-001',
              instructor: data.instructor || MOCK_COURSES[0].instructor,
              department: data.department || 'General',
              credits: data.credits || 3,
              semester: data.semester || 'Spring 2024',
              maxStudents: data.maxStudents || 50,
              enrolledStudents: 0,
              syllabus: data.syllabus || '',
              materials: [],
              schedule: data.schedule || [],
              status: 'draft',
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            
            set(state => ({
              courses: [...state.courses, newCourse],
              isLoading: false,
            }));
            
            return newCourse;
          }
        } catch {
          const newCourse: Course = {
            id: `course-${Date.now()}`,
            code: data.code || 'NEW-001',
            title: data.title || 'New Course',
            description: data.description || '',
            instructorId: data.instructorId || 'tea-001',
            instructor: data.instructor || MOCK_COURSES[0].instructor,
            department: data.department || 'General',
            credits: data.credits || 3,
            semester: data.semester || 'Spring 2024',
            maxStudents: data.maxStudents || 50,
            enrolledStudents: 0,
            syllabus: data.syllabus || '',
            materials: [],
            schedule: data.schedule || [],
            status: 'draft',
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          
          set(state => ({
            courses: [...state.courses, newCourse],
            isLoading: false,
          }));
          
          return newCourse;
        }
      },

      updateCourse: async (id: string, data: Partial<Course>) => {
        set({ isLoading: true });
        try {
          await apiPut(`/courses/${id}`, data);
        } catch {
          // Ignore errors
        }
        set(state => ({
          courses: state.courses.map(course =>
            course.id === id ? { ...course, ...data, updatedAt: new Date() } : course
          ),
          currentCourse: state.currentCourse?.id === id
            ? { ...state.currentCourse, ...data, updatedAt: new Date() }
            : state.currentCourse,
          isLoading: false,
        }));
      },

      deleteCourse: async (id: string) => {
        set({ isLoading: true });
        try {
          await apiDelete(`/courses/${id}`);
        } catch {
          // Ignore errors
        }
        set(state => ({
          courses: state.courses.filter(course => course.id !== id),
          currentCourse: state.currentCourse?.id === id ? null : state.currentCourse,
          isLoading: false,
        }));
      },

      enrollStudent: async (courseId: string, studentId: string) => {
        set({ isLoading: true });
        try {
          const res = await apiPost<Enrollment>('/enrollments', { courseId, studentId });
          if (res.success && res.data) {
            set(state => ({
              myCourses: [...state.myCourses, res.data!],
              isLoading: false,
            }));
          } else {
            set({ isLoading: false });
          }
        } catch {
          set({ isLoading: false });
        }
      },

      dropCourse: async (enrollmentId: string) => {
        set({ isLoading: true });
        try {
          await apiDelete(`/enrollments/${enrollmentId}`);
        } catch {
          // Ignore errors
        }
        const enrollment = get().myCourses.find(e => e.id === enrollmentId);
        if (enrollment) {
          set(state => ({
            myCourses: state.myCourses.filter(e => e.id !== enrollmentId),
            courses: state.courses.map(c =>
              c.id === enrollment.courseId ? { ...c, enrolledStudents: c.enrolledStudents - 1 } : c
            ),
            isLoading: false,
          }));
        } else {
          set({ isLoading: false });
        }
      },

      addMaterial: async (courseId: string, material: Partial<CourseMaterial>) => {
        try {
          await apiPost(`/courses/${courseId}/materials`, material);
        } catch {
          // Ignore errors
        }
        const newMaterial: CourseMaterial = {
          id: `mat-${Date.now()}`,
          courseId,
          title: material.title || 'New Material',
          type: material.type || 'document',
          url: material.url || '',
          size: material.size,
          uploadedBy: material.uploadedBy || 'tea-001',
          uploadedAt: new Date(),
        };
        
        set(state => ({
          courses: state.courses.map(course =>
            course.id === courseId
              ? { ...course, materials: [...course.materials, newMaterial] }
              : course
          ),
        }));
      },

      removeMaterial: async (courseId: string, materialId: string) => {
        try {
          await apiDelete(`/courses/${courseId}/materials/${materialId}`);
        } catch {
          // Ignore errors
        }
        set(state => ({
          courses: state.courses.map(course =>
            course.id === courseId
              ? { ...course, materials: course.materials.filter(m => m.id !== materialId) }
              : course
          ),
        }));
      },
    }),
    {
      name: 'campus-courses-storage',
      partialize: (state) => ({
        courses: state.courses,
        myCourses: state.myCourses,
      }),
    }
  )
);
