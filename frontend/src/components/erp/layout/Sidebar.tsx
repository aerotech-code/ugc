import { Link, useLocation } from 'react-router-dom';
import { useERPContext } from '@/context/ERPContext';
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  Award, 
  FileCheck, 
  MessageSquare,
  CalendarOff,
  LifeBuoy,
  LogOut,
  GraduationCap
} from 'lucide-react';

export function Sidebar() {
  const { user, logout } = useERPContext();
  const location = useLocation();

  const navGroups = [
    {
      title: 'Overview',
      items: [
        { label: 'Dashboard', path: '/erp/dashboard', icon: LayoutDashboard, roles: ['admin', 'student'] },
      ]
    },
    {
      title: 'Academics',
      items: [
        { label: 'Semesters', path: '/erp/semesters', icon: BookOpen, roles: ['admin', 'student'] },
        { label: 'Exams', path: '/erp/exams', icon: FileText, roles: ['admin', 'student'] },
        { label: 'Results', path: '/erp/results', icon: Award, roles: ['admin', 'student'] },
        { label: 'Syllabus', path: '/erp/syllabus', icon: FileCheck, roles: ['admin', 'student'] },
        { label: 'Feedback', path: '/erp/feedback', icon: MessageSquare, roles: ['admin', 'student'] },
      ]
    },
    {
      title: 'Administrative',
      items: [
        { label: 'Leave Records', path: '/erp/leave', icon: CalendarOff, roles: ['admin'] },
        { label: 'Help Desk', path: '/erp/helpdesk', icon: LifeBuoy, roles: ['admin'] },
      ]
    }
  ];

  const userRole = user?.role || 'student';

  return (
    <div className="w-64 bg-slate-900 h-screen flex flex-col text-slate-300 border-r border-slate-800 flex-shrink-0">
      {/* Logo Area */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950">
        <GraduationCap className="h-8 w-8 text-amber-500 mr-3" />
        <span className="font-serif text-xl text-white font-semibold tracking-wide">Nexus Edu</span>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        {navGroups.map((group, idx) => {
          const visibleItems = group.items.filter(item => item.roles.includes(userRole));
          if (visibleItems.length === 0) return null;

          return (
            <div key={idx} className="mb-6">
              <div className="px-6 mb-2 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                {group.title}
              </div>
              <ul className="space-y-1">
                {visibleItems.map((item) => {
                  const isActive = location.pathname.startsWith(item.path);
                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        className={`
                          flex items-center px-6 py-2.5 text-sm font-medium transition-colors
                          ${isActive 
                            ? 'text-white bg-slate-800 border-l-4 border-amber-500 pl-5' 
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border-l-4 border-transparent'
                          }
                        `}
                      >
                        <item.icon className={`h-5 w-5 mr-3 ${isActive ? 'text-amber-500' : 'text-slate-500'}`} />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      {/* User Section */}
      <div className="p-4 border-t border-slate-800 bg-slate-950">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-amber-500 font-bold border border-slate-700">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="ml-3 flex-1 overflow-hidden">
            <p className="text-sm font-medium text-white truncate">{user?.name || 'Guest User'}</p>
            <p className="text-xs text-slate-500 capitalize">{user?.role || 'Role'}</p>
          </div>
          <button 
            onClick={logout}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
