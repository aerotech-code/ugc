import { useQuery } from '@tanstack/react-query';
import { erpApi } from '@/lib/erp-api';
import type { Semester } from '@/types/erp';

export function SemestersPage() {
  const { data: semesters, isLoading } = useQuery({
    queryKey: ['semesters'],
    queryFn: async () => {
      const { data } = await erpApi.get<{status: string, data: Semester[]}>('/academics/semester');
      return data.data;
    }
  });

  if (isLoading) return <div className="p-4">Loading semesters...</div>;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-4 text-slate-800">Semesters List</h2>
      
      {semesters && semesters.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Academic Year</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {semesters.map((s) => (
                <tr key={s.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{s.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{s.academic_year}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${s.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-slate-500">No semesters found. Create one to get started.</p>
      )}
    </div>
  );
}
