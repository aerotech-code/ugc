import { useLocation } from 'react-router-dom';
import { useERPContext } from '@/context/ERPContext';
import { Bell, ChevronDown } from 'lucide-react';

export function Header() {
  const { user, academicYear, setAcademicYear } = useERPContext();
  const location = useLocation();

  // Simple breadcrumb generator
  const getBreadcrumb = () => {
    const defaultPath = 'Dashboard';
    const path = location.pathname.split('/').pop();
    if (!path || path === 'erp') return defaultPath;
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center">
        <h2 className="text-xl font-serif font-semibold text-slate-800">
          {getBreadcrumb()}
        </h2>
      </div>

      <div className="flex items-center space-x-6">
        {/* Academic Year Selector Placeholder */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Academics</span>
          <select 
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="bg-slate-100 border-none text-slate-700 text-sm font-medium py-1.5 pl-3 pr-8 rounded-md focus:ring-2 focus:ring-amber-500 appearance-none cursor-pointer"
            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.25rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
          >
            <option value="2023-2024">2023-2024</option>
            <option value="2024-2025">2024-2025</option>
            <option value="2025-2026">2025-2026</option>
          </select>
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-100">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-amber-500 ring-2 ring-white"></span>
        </button>

        {/* Profile Dropdown Indicator */}
        <div className="flex items-center space-x-2 cursor-pointer p-1.5 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-200">
          <div className="h-8 w-8 rounded-full bg-slate-900 flex items-center justify-center text-amber-500 font-bold text-sm">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </div>
      </div>
    </header>
  );
}
