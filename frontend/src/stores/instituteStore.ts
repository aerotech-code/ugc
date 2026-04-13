// Institute Management Store
// File: src/stores/instituteStore.ts

import { create } from 'zustand';
import { apiCall } from '@/lib/api';

export interface InstituteStoreState {
  // Students
  students: Record<string, unknown>[];
  studentLoading: boolean;
  getStudents: (limit?: number, offset?: number) => Promise<Record<string, unknown>[]>;
  createStudent: (data: Record<string, unknown>) => Promise<Record<string, unknown>>;
  getStudentAttendance: (studentId: string, termId: string) => Promise<Record<string, unknown>[]>;
  recordAttendance: (data: Record<string, unknown>) => Promise<Record<string, unknown>>;
  recordAssessmentMarks: (data: Record<string, unknown>) => Promise<Record<string, unknown>>;
  getStudentGrades: (studentId: string, termId: string) => Promise<Record<string, unknown>[]>;
  getStudentOutstandingFees: (studentId: string) => Promise<Record<string, unknown>[]>;

  // Academic
  academicYears: Record<string, unknown>[];
  departments: Record<string, unknown>[];
  getAcademicYears: () => Promise<Record<string, unknown>[]>;
  getDepartments: () => Promise<Record<string, unknown>[]>;
  createAcademicYear: (data: Record<string, unknown>) => Promise<Record<string, unknown>>;
  createDepartment: (data: Record<string, unknown>) => Promise<Record<string, unknown>>;

  // Finance
  feeStructures: Record<string, unknown>[];
  assignStudentFees: (studentId: string, academicYearId: string) => Promise<void>;
  recordFeePayment: (data: Record<string, unknown>) => Promise<Record<string, unknown>>;
  createFeeStructure: (data: Record<string, unknown>) => Promise<Record<string, unknown>>;

  // Library
  libraryBooks: Record<string, unknown>[];
  issueBook: (bookId: string, memberId: string) => Promise<Record<string, unknown>>;
  returnBook: (borrowingId: string) => Promise<Record<string, unknown>>;
  addBook: (data: Record<string, unknown>) => Promise<Record<string, unknown>>;

  // Staff
  staffMembers: Record<string, unknown>[];
  getStaffByDepartment: (deptId: string) => Promise<Record<string, unknown>[]>;
  getTeachers: () => Promise<Record<string, unknown>[]>;
  createStaff: (data: Record<string, unknown>) => Promise<Record<string, unknown>>;
}

const API_BASE_URL = 'http://localhost:4000/api/institute';

export const useInstituteStore = create<InstituteStoreState>((set) => ({
  // Initial state
  students: [],
  studentLoading: false,
  academicYears: [],
  departments: [],
  feeStructures: [],
  libraryBooks: [],
  staffMembers: [],

  // Student Management
  getStudents: async (limit = 50, offset = 0) => {
    try {
      const response = await apiCall<Record<string, unknown>[]>(
        'GET',
        `${API_BASE_URL}/students?limit=${limit}&offset=${offset}`
      );
      set({ students: response.data || [], studentLoading: false });
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch students:', error);
      set({ studentLoading: false });
      return [];
    }
  },

  createStudent: async (data) => {
    try {
      const response = await apiCall<Record<string, unknown> | undefined>('POST', `${API_BASE_URL}/students`, data);
      const student = response.data ?? {};
      set((state) => ({
        students: [...state.students, student],
      }));
      return student;
    } catch (error) {
      console.error('Failed to create student:', error);
      throw error;
    }
  },

  getStudentAttendance: async (studentId: string, termId: string) => {
    try {
      const response = await apiCall<Record<string, unknown>[]>(
        'GET',
        `${API_BASE_URL}/students/${studentId}/attendance/${termId}`
      );
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
      return [];
    }
  },

  recordAttendance: async (data) => {
    try {
      const response = await apiCall<Record<string, unknown> | undefined>(
        'POST',
        `${API_BASE_URL}/students/${data.student_id}/attendance`,
        data
      );
      return response.data ?? {};
    } catch (error) {
      console.error('Failed to record attendance:', error);
      throw error;
    }
  },

  recordAssessmentMarks: async (data) => {
    try {
      const response = await apiCall<Record<string, unknown> | undefined>(
        'POST',
        `${API_BASE_URL}/students/${data.student_id}/marks`,
        data
      );
      return response.data ?? {};
    } catch (error) {
      console.error('Failed to record marks:', error);
      throw error;
    }
  },

  getStudentGrades: async (studentId: string, termId: string) => {
    try {
      const response = await apiCall<Record<string, unknown>[]>(
        'GET',
        `${API_BASE_URL}/students/${studentId}/grades/${termId}`
      );
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch grades:', error);
      return [];
    }
  },

  getStudentOutstandingFees: async (studentId: string) => {
    try {
      const response = await apiCall<Record<string, unknown>[]>(
        'GET',
        `${API_BASE_URL}/students/${studentId}/outstanding-fees`
      );
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch outstanding fees:', error);
      return [];
    }
  },

  // Academic Management
  getAcademicYears: async () => {
    try {
      const response = await apiCall<Record<string, unknown>[]>('GET', `${API_BASE_URL}/academic-years`);
      set({ academicYears: response.data || [] });
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch academic years:', error);
      return [];
    }
  },

  getDepartments: async () => {
    try {
      const response = await apiCall<Record<string, unknown>[]>('GET', `${API_BASE_URL}/departments`);
      set({ departments: response.data || [] });
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch departments:', error);
      return [];
    }
  },

  createAcademicYear: async (data) => {
    try {
      const response = await apiCall<Record<string, unknown> | undefined>(
        'POST',
        `${API_BASE_URL}/academic-years`,
        data
      );
      const year = response.data ?? {};
      set((state) => ({
        academicYears: [...state.academicYears, year],
      }));
      return year;
    } catch (error) {
      console.error('Failed to create academic year:', error);
      throw error;
    }
  },

  createDepartment: async (data) => {
    try {
      const response = await apiCall<Record<string, unknown> | undefined>(
        'POST',
        `${API_BASE_URL}/departments`,
        data
      );
      const dept = response.data ?? {};
      set((state) => ({
        departments: [...state.departments, dept],
      }));
      return dept;
    } catch (error) {
      console.error('Failed to create department:', error);
      throw error;
    }
  },

  // Finance Management
  createFeeStructure: async (data) => {
    try {
      const response = await apiCall<Record<string, unknown> | undefined>(
        'POST',
        `${API_BASE_URL}/fee-structures`,
        data
      );
      const feeStructure = response.data ?? {};
      set((state) => ({
        feeStructures: [...state.feeStructures, feeStructure],
      }));
      return feeStructure;
    } catch (error) {
      console.error('Failed to create fee structure:', error);
      throw error;
    }
  },

  assignStudentFees: async (studentId: string, academicYearId: string) => {
    try {
      await apiCall<Record<string, unknown>>(
        'POST',
        `${API_BASE_URL}/students/${studentId}/assign-fees`,
        { academic_year_id: academicYearId }
      );
    } catch (error) {
      console.error('Failed to assign fees:', error);
      throw error;
    }
  },

  recordFeePayment: async (data) => {
    try {
      const response = await apiCall<Record<string, unknown> | undefined>(
        'POST',
        `${API_BASE_URL}/fee-payments`,
        data
      );
      return response.data ?? {};
    } catch (error) {
      console.error('Failed to record fee payment:', error);
      throw error;
    }
  },

  // Library Management
  addBook: async (data) => {
    try {
      const response = await apiCall<Record<string, unknown> | undefined>(
        'POST',
        `${API_BASE_URL}/library/books`,
        data
      );
      const book = response.data ?? {};
      set((state) => ({
        libraryBooks: [...state.libraryBooks, book],
      }));
      return book;
    } catch (error) {
      console.error('Failed to add book:', error);
      throw error;
    }
  },

  issueBook: async (bookId: string, memberId: string) => {
    try {
      const response = await apiCall<Record<string, unknown> | undefined>(
        'POST',
        `${API_BASE_URL}/library/issue`,
        { book_id: bookId, member_id: memberId }
      );
      return response.data ?? {};
    } catch (error) {
      console.error('Failed to issue book:', error);
      throw error;
    }
  },

  returnBook: async (borrowingId: string) => {
    try {
      const response = await apiCall<Record<string, unknown> | undefined>(
        'POST',
        `${API_BASE_URL}/library/return/${borrowingId}`
      );
      return response.data ?? {};
    } catch (error) {
      console.error('Failed to return book:', error);
      throw error;
    }
  },

  // Staff Management
  createStaff: async (data) => {
    try {
      const response = await apiCall<Record<string, unknown>>('POST', `${API_BASE_URL}/staff`, data);
      const staff = response.data as Record<string, unknown>;
      set((state) => ({
        staffMembers: [...state.staffMembers, staff],
      }));
      return staff;
    } catch (error) {
      console.error('Failed to create staff:', error);
      throw error;
    }
  },

  getStaffByDepartment: async (deptId: string) => {
    try {
      const response = await apiCall<Record<string, unknown>[]>(
        'GET',
        `${API_BASE_URL}/staff/department/${deptId}`
      );
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch staff:', error);
      return [];
    }
  },

  getTeachers: async () => {
    try {
      const response = await apiCall<Record<string, unknown>[]>('GET', `${API_BASE_URL}/teachers`);
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
      return [];
    }
  },
}));
