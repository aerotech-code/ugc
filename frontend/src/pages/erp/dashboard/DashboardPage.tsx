import { useQuery } from '@tanstack/react-query';
import type { DashboardStats } from '@/types/erp';
import { erpApi } from '@/lib/erp-api';
import { BookOpen, FileCheck, Award, LifeBuoy, UserCog } from 'lucide-react';
import { useERPContext } from '@/context/ERPContext';

export function DashboardPage() {
  const { user } = useERPContext();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await erpApi.get<{status: string, data: DashboardStats}>('/academics/dashboard');
      return response.data.data;
    }
  });

  if (isLoading) return <div className="animate-pulse space-y-4 pt-4"><div className="h-32 bg-slate-200 rounded-xl" /></div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Active Semesters</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2">{stats?.semesters_count || 0}</h3>
            </div>
            <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Scheduled Exams</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2">{stats?.final_exams_count || 0}</h3>
            </div>
            <div className="h-12 w-12 rounded-lg bg-amber-50 flex items-center justify-center">
              <FileCheck className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Results Published</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2">{stats?.published_results_count || 0}</h3>
            </div>
            <div className="h-12 w-12 rounded-lg bg-green-50 flex items-center justify-center">
              <Award className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center justify-center p-6 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors group">
            <BookOpen className="h-8 w-8 text-slate-400 group-hover:text-amber-500 mb-3" />
            <span className="text-sm font-medium text-slate-700">Register Semester</span>
          </button>
          <button className="flex flex-col items-center justify-center p-6 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors group">
            <FileCheck className="h-8 w-8 text-slate-400 group-hover:text-amber-500 mb-3" />
            <span className="text-sm font-medium text-slate-700">Create Exam</span>
          </button>
          
          {user?.role === 'admin' && (
            <button className="flex flex-col items-center justify-center p-6 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors group">
              <UserCog className="h-8 w-8 text-slate-400 group-hover:text-amber-500 mb-3" />
              <span className="text-sm font-medium text-slate-700">Leave Request</span>
            </button>
          )}
          
          <button className="flex flex-col items-center justify-center p-6 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors group">
            <LifeBuoy className="h-8 w-8 text-slate-400 group-hover:text-amber-500 mb-3" />
            <span className="text-sm font-medium text-slate-700">Raise Ticket</span>
          </button>
        </div>
      </div>
    </div>
  );
}
