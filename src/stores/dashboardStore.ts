import { create } from 'zustand';
import type { DashboardStats, Activity, Notification } from '@/types';

interface DashboardState {
  stats: DashboardStats | null;
  activities: Activity[];
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  
  // Actions
  fetchStats: (userId: string) => Promise<void>;
  fetchActivities: (userId: string) => Promise<void>;
  fetchNotifications: (userId: string) => Promise<void>;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  dismissNotification: (id: string) => void;
}

const MOCK_STATS: DashboardStats = {
  totalCourses: 3,
  activeAssignments: 5,
  pendingSubmissions: 2,
  averageGrade: 87.5,
  attendanceRate: 94,
  notesCreated: 12,
  recentActivity: [
    {
      id: 'act-001',
      userId: 'stu-001',
      action: 'submitted',
      targetType: 'assignment',
      targetId: 'asg-001',
      targetName: 'Linear Regression Implementation',
      timestamp: new Date('2024-02-15T14:30:00'),
    },
    {
      id: 'act-002',
      userId: 'stu-001',
      action: 'created',
      targetType: 'note',
      targetId: 'note-001',
      targetName: 'Introduction to Machine Learning',
      timestamp: new Date('2024-02-14T10:15:00'),
    },
    {
      id: 'act-003',
      userId: 'stu-001',
      action: 'enrolled',
      targetType: 'course',
      targetId: 'course-003',
      targetName: 'Database Systems',
      timestamp: new Date('2024-02-12T09:00:00'),
    },
    {
      id: 'act-004',
      userId: 'tea-001',
      action: 'graded',
      targetType: 'submission',
      targetId: 'sub-001',
      targetName: 'Alex Johnson\'s Assignment',
      timestamp: new Date('2024-02-17T16:45:00'),
    },
  ],
};

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-001',
    userId: 'stu-001',
    title: 'Assignment Graded',
    message: 'Your submission for "Linear Regression Implementation" has been graded. You scored 92/100!',
    type: 'success',
    category: 'grade',
    read: false,
    actionUrl: '/assignments/asg-001',
    createdAt: new Date('2024-02-17T16:45:00'),
  },
  {
    id: 'notif-002',
    userId: 'stu-001',
    title: 'New Assignment',
    message: 'A new assignment "AI Ethics Research Paper" has been posted in CS-301.',
    type: 'info',
    category: 'assignment',
    read: false,
    actionUrl: '/assignments/asg-002',
    createdAt: new Date('2024-02-16T08:00:00'),
  },
  {
    id: 'notif-003',
    userId: 'stu-001',
    title: 'Quiz Reminder',
    message: 'ML Fundamentals Quiz is due tomorrow. Don\'t forget to complete it!',
    type: 'warning',
    category: 'assignment',
    read: true,
    actionUrl: '/quizzes/quiz-001',
    createdAt: new Date('2024-02-15T10:00:00'),
  },
  {
    id: 'notif-004',
    userId: 'stu-001',
    title: 'Course Update',
    message: 'New materials have been added to Calculus III.',
    type: 'info',
    category: 'course',
    read: true,
    actionUrl: '/courses/course-002',
    createdAt: new Date('2024-02-14T14:30:00'),
  },
  {
    id: 'notif-005',
    userId: 'stu-001',
    title: 'System Maintenance',
    message: 'The platform will be under maintenance on Sunday 2-4 AM.',
    type: 'warning',
    category: 'system',
    read: true,
    createdAt: new Date('2024-02-13T09:00:00'),
  },
];

export const useDashboardStore = create<DashboardState>()((set) => ({
  stats: MOCK_STATS,
  activities: MOCK_STATS.recentActivity,
  notifications: MOCK_NOTIFICATIONS,
  unreadCount: MOCK_NOTIFICATIONS.filter(n => !n.read).length,
  isLoading: false,

  fetchStats: async (_userId: string) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    set({ stats: MOCK_STATS, isLoading: false });
  },

  fetchActivities: async (_userId: string) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 400));
    set({ activities: MOCK_STATS.recentActivity, isLoading: false });
  },

  fetchNotifications: async (_userId: string) => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 300));
    const notifications = MOCK_NOTIFICATIONS;
    set({
      notifications,
      unreadCount: notifications.filter(n => !n.read).length,
      isLoading: false,
    });
  },

  markNotificationAsRead: (id: string) => {
    set(state => {
      const notifications = state.notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      );
      return {
        notifications,
        unreadCount: notifications.filter(n => !n.read).length,
      };
    });
  },

  markAllNotificationsAsRead: () => {
    set(state => ({
      notifications: state.notifications.map(n => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },

  dismissNotification: (id: string) => {
    set(state => {
      const notifications = state.notifications.filter(n => n.id !== id);
      return {
        notifications,
        unreadCount: notifications.filter(n => !n.read).length,
      };
    });
  },
}));
